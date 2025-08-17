from __future__ import annotations
import argparse
from typing import List
from sqlalchemy.orm import Session
from backend.db import get_session, Document, Chunk, create_all
from backend.notion_service import NotionService
from backend import embedding_service
import numpy as np


def chunk_text(text: str, max_chars: int = 1000, overlap: int = 200) -> List[str]:
    if not text:
        return []
    chunks = []
    start = 0
    n = len(text)
    while start < n:
        end = min(n, start + max_chars)
        chunk = text[start:end]
        chunks.append(chunk)
        if end == n:
            break
        start = max(0, end - overlap)
    # normalize whitespace
    return [" ".join(c.split()) for c in chunks if c.strip()]


def upsert_document(db: Session, title: str, content: str, notion_page_id: str | None = None, source: str | None = None) -> Document:
    # naive: match by title or notion_page_id
    doc = None
    if notion_page_id:
        doc = db.query(Document).filter(Document.notion_page_id == notion_page_id).one_or_none()
    if doc is None:
        doc = db.query(Document).filter(Document.title == title).one_or_none()
    if doc is None:
        doc = Document(title=title, content=content, notion_page_id=notion_page_id, source=source)
        db.add(doc)
        db.flush()
    else:
        doc.content = content
        doc.source = source
    return doc


def run_refresh(categories: List[str] | None = None):
    create_all()
    svc = NotionService()
    with next(get_session()) as db:  # type: ignore
        # list docs (by category if provided), else all
        docs = []
        if categories:
            for c in categories:
                docs.extend(svc.list_documents(category=c))
        else:
            docs = svc.list_documents()
        for d in docs:
            title = d.get("title", "Untitled")
            content = d.get("content", "")
            page_id = d.get("id")
            # chunk
            pieces = chunk_text(content)
            if not pieces:
                continue
            # embed
            embs = embedding_service.embed_texts(pieces).astype(float)
            # upsert doc
            doc = upsert_document(db, title=title, content=content, notion_page_id=page_id, source="Notion")
            # clear old chunks
            db.query(Chunk).filter(Chunk.document_id == doc.id).delete()
            # insert new
            for idx, (txt, emb) in enumerate(zip(pieces, embs)):
                ch = Chunk(document_id=doc.id, chunk_index=idx, text=txt, embedding=emb.tolist())
                db.add(ch)
            db.commit()
            print(f"Indexed: {title} -> {len(pieces)} chunks")


def main():
    parser = argparse.ArgumentParser(description="ETL Notion -> Embeddings -> Postgres")
    parser.add_argument("--refresh", action="store_true", help="Full refresh of all docs")
    parser.add_argument("--category", action="append", help="Filter category (can repeat)")
    args = parser.parse_args()
    if args.refresh:
        run_refresh(categories=args.category)
    else:
        print("No action. Use --refresh")

if __name__ == "__main__":
    main()
