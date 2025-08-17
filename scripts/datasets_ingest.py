#!/usr/bin/env python3
from __future__ import annotations
import argparse
import csv
import os
from pathlib import Path
from typing import List, Optional, Tuple

from backend.db import get_session, Document, Chunk, create_all
from backend import embedding_service


TEXT_EXTS = {".txt", ".md"}
CSV_EXTS = {".csv"}
DEFAULT_ALLOWED = TEXT_EXTS | CSV_EXTS


def chunk_text(text: str, max_chars: int = 1000, overlap: int = 200) -> List[str]:
    if not text:
        return []
    chunks: List[str] = []
    start = 0
    n = len(text)
    while start < n:
        end = min(n, start + max_chars)
        chunk = text[start:end]
        chunk_norm = " ".join(chunk.split())
        if chunk_norm:
            chunks.append(chunk_norm)
        if end == n:
            break
        start = max(0, end - overlap)
    return chunks


def upsert_document(db, title: str, content: str, source: str, notion_page_id: Optional[str] = None) -> Document:
    doc = None
    if notion_page_id:
        doc = db.query(Document).filter(Document.notion_page_id == notion_page_id).one_or_none()
    if doc is None:
        doc = db.query(Document).filter(Document.title == title, Document.source == source).one_or_none()
    if doc is None:
        doc = Document(title=title, content=content, source=source, notion_page_id=notion_page_id)
        db.add(doc)
        db.flush()
    else:
        doc.content = content
    return doc


def detect_text_columns(header: List[str]) -> List[str]:
    # Heuristic column names for text content
    candidates = {
        "text", "content", "description", "abstract", "transcript",
        "job_description", "clean_text", "body", "details", "overview",
    }
    picks = [h for h in header if h.lower().strip() in candidates]
    if picks:
        return picks
    # fallback: choose the longest textual-looking columns by name
    header_sorted = sorted(header, key=lambda x: len(x), reverse=True)
    return header_sorted[:2]


def read_csv_records(path: Path, limit_rows: int = 2000) -> List[Tuple[str, str]]:
    # Return list of (title, content) derived from CSV
    rows: List[Tuple[str, str]] = []
    with path.open("r", encoding="utf-8", errors="ignore") as f:
        sniffer = csv.Sniffer()
        sample = f.read(4096)
        f.seek(0)
        try:
            dialect = sniffer.sniff(sample)
        except Exception:
            dialect = csv.excel
        reader = csv.DictReader(f, dialect=dialect)
        header = reader.fieldnames or []
        if not header:
            return rows
        text_cols = detect_text_columns(header)
        title_cols = [c for c in header if c.lower() in ("title", "name", "subject")]
        count = 0
        for rec in reader:
            if count >= limit_rows:
                break
            # Build content from text columns, fallback to join of all columns
            parts = []
            for c in text_cols:
                v = (rec.get(c) or "").strip()
                if v:
                    parts.append(v)
            if not parts:
                # fallback: join all string values
                parts = [str(rec.get(c, "")).strip() for c in header]
            content = "\n".join([p for p in parts if p])
            if not content:
                continue
            title = None
            for c in title_cols:
                tt = (rec.get(c) or "").strip()
                if tt:
                    title = tt
                    break
            if not title:
                title = f"{path.stem} #{count}"
            rows.append((title, content))
            count += 1
    return rows


def collect_files(root: Path, allowed_exts: set[str], max_files: Optional[int] = None, max_mb: float = 2.0) -> List[Path]:
    files: List[Path] = []
    for p in root.rglob("*"):
        if not p.is_file():
            continue
        if p.suffix.lower() not in allowed_exts:
            continue
        try:
            sz = p.stat().st_size
        except Exception:
            continue
        if sz > max_mb * 1024 * 1024:
            continue
        files.append(p)
        if max_files and len(files) >= max_files:
            break
    return files


def ingest_file(db, path: Path, dataset_root: Path, max_chars: int, overlap: int):
    rel = path.relative_to(dataset_root)
    source = f"Dataset|{rel.parts[0] if rel.parts else path.parent.name}"
    if path.suffix.lower() in TEXT_EXTS:
        content = path.read_text(encoding="utf-8", errors="ignore")
        title = path.stem
        pieces = chunk_text(content, max_chars=max_chars, overlap=overlap)
        if not pieces:
            return 0
        embs = embedding_service.embed_texts(pieces)
        doc = upsert_document(db, title=title, content=content, source=source)
        db.query(Chunk).filter(Chunk.document_id == doc.id).delete()
        for idx, (txt, emb) in enumerate(zip(pieces, embs)):
            db.add(Chunk(document_id=doc.id, chunk_index=idx, text=txt, embedding=emb.astype(float).tolist()))
        db.commit()
        return len(pieces)
    elif path.suffix.lower() in CSV_EXTS:
        records = read_csv_records(path, limit_rows=2000)
        total_chunks = 0
        for i, (title, content) in enumerate(records):
            pieces = chunk_text(content, max_chars=max_chars, overlap=overlap)
            if not pieces:
                continue
            embs = embedding_service.embed_texts(pieces)
            doc = upsert_document(db, title=f"{path.stem}:{title}", content=content, source=source)
            db.query(Chunk).filter(Chunk.document_id == doc.id).delete()
            for idx, (txt, emb) in enumerate(zip(pieces, embs)):
                db.add(Chunk(document_id=doc.id, chunk_index=idx, text=txt, embedding=emb.astype(float).tolist()))
            db.commit()
            total_chunks += len(pieces)
            # Safety: avoid flooding DB from huge CSVs
            if i >= 500:
                break
        return total_chunks
    return 0


def main():
    parser = argparse.ArgumentParser(description="Ingest datasets (txt/md/csv) into RAG index (DB)")
    parser.add_argument("--root", default="datasets", help="Root folder of datasets")
    parser.add_argument("--exts", default=",".join(sorted(DEFAULT_ALLOWED)), help="Comma-separated allowed extensions (e.g. .txt,.md,.csv)")
    parser.add_argument("--limit", type=int, default=500, help="Max number of files to scan")
    parser.add_argument("--max-mb", type=float, default=2.0, help="Max file size in MB")
    parser.add_argument("--max-chars", type=int, default=1000, help="Chunk size in chars")
    parser.add_argument("--overlap", type=int, default=200, help="Chunk overlap in chars")
    args = parser.parse_args()

    dataset_root = Path(args.root).resolve()
    if not dataset_root.exists():
        print(f"[WARN] Datasets root not found: {dataset_root}")
        return

    allowed_exts = {e.strip().lower() for e in args.exts.split(",") if e.strip()}
    if not allowed_exts:
        allowed_exts = DEFAULT_ALLOWED

    create_all()
    gen = get_session()
    db = next(gen)  # type: ignore
    try:
        files = collect_files(dataset_root, allowed_exts, max_files=args.limit, max_mb=args.max_mb)
        print(f"[INFO] Found {len(files)} candidate files for ingestion")
        total_chunks = 0
        for p in files:
            try:
                c = ingest_file(db, p, dataset_root, max_chars=args.max_chars, overlap=args.overlap)
                print(f"  + {p.relative_to(dataset_root)} -> {c} chunks")
                total_chunks += c
            except Exception as e:
                print(f"  ! Error ingesting {p}: {e}")
        print(f"[DONE] Total chunks ingested: {total_chunks}")
    finally:
        try:
            next(gen)
        except StopIteration:
            pass

if __name__ == "__main__":
    main()
