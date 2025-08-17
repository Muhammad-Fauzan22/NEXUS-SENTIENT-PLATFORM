from __future__ import annotations
from fastapi import FastAPI, Depends, HTTPException, Body, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from fastapi.responses import StreamingResponse
import os

from .db import create_all, get_session, Document, Chunk
from .schemas import ChatRequest, ChatResponse, IDPRequest, IDPResponse, Opportunity, SearchRequest, SearchResult
from . import ai_core
from . import embedding_service
from .notion_service import NotionService
from datetime import datetime

app = FastAPI(title="NEXUS Backend")

# helper: local chunking (for admin manual indexing)
def _local_chunk_text(text: str, max_chars: int = 1000, overlap: int = 200) -> List[str]:
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

# Retrieval + reranker helpers (FAISS optional, reranker optional)
_index_cache = {
    "rows_len": 0,
    "matrix": None,
}

def _get_rows_and_matrix(db: Session):
    import numpy as np
    rows = db.query(Chunk, Document).join(Document, Chunk.document_id == Document.id).all()
    if not rows:
        return [], None
    embs = [row[0].embedding for row in rows]
    m = np.array(embs, dtype=float)
    return rows, m

_reranker = None

def _load_reranker():
    global _reranker
    if _reranker is not None:
        return _reranker
    enabled = os.getenv("RERANKER_ENABLED", "0").lower() in ("1", "true", "yes")
    if not enabled:
        return None
    try:
        from sentence_transformers import CrossEncoder
        model_name = os.getenv("RERANKER_MODEL", "cross-encoder/ms-marco-MiniLM-L-6-v2")
        _reranker = CrossEncoder(model_name, device="cpu")
        return _reranker
    except Exception:
        _reranker = None
        return None

def _retrieve_similar(db: Session, query: str, top_k: int = 5, preselect: int = 50):
    import numpy as np
    from numpy.linalg import norm
    rows, m = _get_rows_and_matrix(db)
    if not rows:
        return []
    q = embedding_service.embed_texts([query])[0]
    # Try FAISS inner product over normalized vectors; fallback to numpy cosine
    try:
        import faiss  # type: ignore
        m_norm = m / (norm(m, axis=1, keepdims=True) + 1e-9)
        q_norm = q / (norm(q) + 1e-9)
        index = faiss.IndexFlatIP(m.shape[1])
        index.add(m_norm.astype("float32"))
        nprobe = min(preselect, len(rows))
        scores, idxs = index.search(q_norm.reshape(1, -1).astype("float32"), nprobe)
        cand = [(int(idxs[0][i]), float(scores[0][i])) for i in range(idxs.shape[1])]
    except Exception:
        denom = (norm(m, axis=1) * norm(q) + 1e-9)
        sims = (m @ q) / denom
        order = sims.argsort()[::-1]
        nprobe = min(preselect, len(order))
        cand = [(int(order[i]), float(sims[int(order[i])])) for i in range(nprobe)]

    # Optional rerank with cross-encoder
    reranker = _load_reranker()
    if reranker:
        pairs = [(query, rows[i][0].text) for i, _ in cand]
        try:
            scores = reranker.predict(pairs)
            ranked = sorted(zip(cand, scores), key=lambda x: float(x[1]), reverse=True)
            cand = [(i, float(score)) for ((i, _), score) in ranked]
        except Exception:
            pass

    cand = cand[:top_k]
    results = []
    for idx, score in cand:
        chunk, doc = rows[idx]
        results.append((chunk, doc, float(score)))
    return results

# CORS origins configurable via env CORS_ORIGINS (comma-separated or "*")
origins_env = os.getenv("CORS_ORIGINS", "*")
allow_origins = ["*"] if origins_env.strip() == "*" else [o.strip() for o in origins_env.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_all()

@app.get("/health")
def health(db: Session = Depends(get_session)):
    # basic DB check and counts
    docs = db.query(Document).count()
    chs = db.query(Chunk).count()
    return {"status": "ok", "documents": docs, "chunks": chs}

@app.post("/api/chat", response_model=ChatResponse)
def api_chat(req: ChatRequest) -> ChatResponse:
    content = ai_core.chat([m.model_dump() for m in req.messages])
    return ChatResponse(content=content)

# Streaming chat via SSE
@app.post("/api/chat/stream")
def api_chat_stream(req: ChatRequest):
    def token_gen():
        # Build prompt similar to ai_core._format_prompt
        system = ai_core.SYSTEM_PROMPT
        parts = []
        for m in req.messages:
            role = m.role.lower()
            if role == "system":
                system = m.content
            else:
                parts.append(f"{role.upper()}: {m.content}")
        convo = "\n".join(parts)
        prompt = f"<s>[INST] {system}\n\n{convo} [/INST]"
        llm = ai_core.get_llm()
        for chunk in llm(
            prompt,
            max_tokens=512,
            temperature=0.2,
            stream=True,
            stop=["</s>", "[INST]", "</INST>", "USER:", "ASSISTANT:"],
        ):
            token = chunk["choices"][0].get("text", "")
            if token:
                yield f"data: {json.dumps({'token': token})}\n\n"
        yield "data: [DONE]\n\n"
    return StreamingResponse(token_gen(), media_type="text/event-stream")

@app.post("/api/idp", response_model=IDPResponse)
def api_idp(req: IDPRequest) -> IDPResponse:
    idp_text = ai_core.generate_idp(req.profile)
    return IDPResponse(idp=idp_text)

# Admin auth guard

def admin_guard(x_admin_token: Optional[str] = Header(default=None)):
    expected = os.getenv("ADMIN_TOKEN")
    # If ADMIN_TOKEN is set, enforce it; if not set, allow by default
    if expected and x_admin_token != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

# Admin endpoints to manage ETL and dataset stats
@app.post("/admin/etl/refresh")
def admin_etl_refresh(categories: Optional[List[str]] = None, _: bool = Depends(admin_guard)):
    try:
        from scripts.etl import run_refresh
        run_refresh(categories=categories)
        return {"status": "ok", "message": "ETL refresh complete", "categories": categories}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/stats")
def admin_stats(db: Session = Depends(get_session), _: bool = Depends(admin_guard)):
    docs = db.query(Document).count()
    chs = db.query(Chunk).count()
    return {"documents": docs, "chunks": chs}

# Admin: manual indexing of arbitrary text
@app.post("/admin/index")
def admin_index(payload: dict = Body(...), db: Session = Depends(get_session), _: bool = Depends(admin_guard)):
    title = (payload or {}).get("title")
    content = (payload or {}).get("content")
    source = (payload or {}).get("source", "Manual")
    if not title or not content:
        raise HTTPException(status_code=400, detail="title and content are required")
    pieces = _local_chunk_text(content)
    if not pieces:
        return {"status": "ok", "message": "No content to index"}
    embs = embedding_service.embed_texts(pieces).astype(float)
    # create doc
    doc = Document(title=title, content=content, source=source)
    db.add(doc)
    db.flush()
    for idx, (txt, emb) in enumerate(zip(pieces, embs)):
        ch = Chunk(document_id=doc.id, chunk_index=idx, text=txt, embedding=emb.tolist())
        db.add(ch)
    db.commit()
    return {"status": "ok", "document_id": doc.id, "chunks": len(pieces)}

@app.get("/api/opportunities", response_model=List[Opportunity])
def api_opportunities() -> List[Opportunity]:
    svc = NotionService()
    items = svc.find_open_projects()
    return [Opportunity(**x) for x in items]

@app.get("/api/docs/{name}")
def api_get_doc(name: str) -> dict:
    svc = NotionService()
    content = svc.get_document(name)
    if content is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"name": name, "content": content}

# List documents from Notion (optionally include content)
@app.get("/api/docs")
def api_list_docs(include_content: bool = False, category: Optional[str] = None):
    svc = NotionService()
    items = svc.list_documents(category=category, include_content=include_content)
    return items

@app.post("/api/rag")
def api_rag(payload: dict = Body(...), db: Session = Depends(get_session)):
    query = (payload or {}).get("query")
    k = int((payload or {}).get("k", 5))
    temperature = float((payload or {}).get("temperature", 0.2))
    if not query:
        raise HTTPException(status_code=400, detail="query is required")

    results = _retrieve_similar(db, query, top_k=k, preselect=max(10, k * 5))
    if not results:
        return {"answer": "", "sources": []}

    contexts = []
    sources = []
    for chunk, doc, score in results:
        contexts.append(f"[{doc.title}#{chunk.chunk_index}]\n{chunk.text}")
        sources.append({
            "document_title": doc.title,
            "chunk_index": chunk.chunk_index,
            "score": float(score),
            "text": chunk.text,
        })

    system = ("Anda adalah NEXUS. Jawablah pertanyaan berbasis konteks berikut. "
              "Jika jawaban tidak ada dalam konteks, katakan tidak tahu. "
              "Cantumkan sumber sebagai [Judul#Chunk]. Jawab ringkas dan akurat.")
    user = f"Konteks:\n\n" + "\n\n".join(contexts) + f"\n\nPertanyaan: {query}"
    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]
    answer = ai_core.chat(messages, max_tokens=700, temperature=temperature)
    return {"answer": answer, "sources": sources}

# SSE streaming for RAG responses
@app.post("/api/rag/stream")
def api_rag_stream(payload: dict = Body(...), db: Session = Depends(get_session)):
    query = (payload or {}).get("query")
    k = int((payload or {}).get("k", 5))
    temperature = float((payload or {}).get("temperature", 0.2))
    if not query:
        raise HTTPException(status_code=400, detail="query is required")

    results = _retrieve_similar(db, query, top_k=k, preselect=max(10, k * 5))
    contexts = []
    for chunk, doc, score in results:
        contexts.append(f"[{doc.title}#{chunk.chunk_index}]\n{chunk.text}")

    system = ("Anda adalah NEXUS. Jawablah pertanyaan berbasis konteks berikut. "
              "Jika jawaban tidak ada dalam konteks, katakan tidak tahu. "
              "Cantumkan sumber sebagai [Judul#Chunk]. Jawab ringkas dan akurat.")
    user = f"Konteks:\n\n" + "\n\n".join(contexts) + f"\n\nPertanyaan: {query}"

    def token_gen():
        llm = ai_core.get_llm()
        prompt = f"<s>[INST] {system}\n\n{user} [/INST]"
        for chunk in llm(
            prompt,
            max_tokens=700,
            temperature=temperature,
            stream=True,
            stop=["</s>", "[INST]", "</INST>", "USER:", "ASSISTANT:"],
        ):
            token = chunk["choices"][0].get("text", "")
            if token:
                yield f"data: {json.dumps({'token': token})}\n\n"
        yield "data: [DONE]\n\n"
    return StreamingResponse(token_gen(), media_type="text/event-stream")

@app.post("/api/search", response_model=List[SearchResult])
def api_search(req: SearchRequest, db: Session = Depends(get_session)) -> List[SearchResult]:
    res = _retrieve_similar(db, req.query, top_k=req.k, preselect=max(10, req.k * 5))
    results: List[SearchResult] = []
    for chunk, doc, score in res:
        results.append(
            SearchResult(
                document_title=doc.title,
                chunk_index=chunk.chunk_index,
                score=float(score),
                text=chunk.text,
            )
        )
    return results
