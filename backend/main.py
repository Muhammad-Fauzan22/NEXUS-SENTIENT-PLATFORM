from __future__ import annotations
from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from fastapi.responses import StreamingResponse

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

# CORS (sesuaikan origin pada deployment)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

# Admin endpoints to manage ETL and dataset stats
@app.post("/admin/etl/refresh")
def admin_etl_refresh(categories: Optional[List[str]] = None):
    try:
        from scripts.etl import run_refresh
        run_refresh(categories=categories)
        return {"status": "ok", "message": "ETL refresh complete", "categories": categories}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/stats")
def admin_stats(db: Session = Depends(get_session)):
    docs = db.query(Document).count()
    chs = db.query(Chunk).count()
    return {"documents": docs, "chunks": chs}

# Admin: manual indexing of arbitrary text
@app.post("/admin/index")
def admin_index(payload: dict = Body(...), db: Session = Depends(get_session)):
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

@app.post("/api/search", response_model=List[SearchResult])
def api_search(req: SearchRequest, db: Session = Depends(get_session)) -> List[SearchResult]:
    # fetch all chunks joined with documents
    rows = db.query(Chunk, Document).join(Document, Chunk.document_id == Document.id).all()
    if not rows:
        return []
    # unpack tuples
    chunks = [row[0] for row in rows]
    docs = [row[1] for row in rows]
    embs = [c.embedding for c in chunks]

    import numpy as np
    from numpy.linalg import norm

    # embed query
    q = embedding_service.embed_texts([req.query])[0]
    m = np.array(embs, dtype=float)
    # cosine similarity (protect from div by zero)
    denom = (norm(m, axis=1) * norm(q) + 1e-9)
    sims = (m @ q) / denom
    top_idx = sims.argsort()[::-1][: req.k]

    results: List[SearchResult] = []
    for i in top_idx:
        idx = int(i)
        chunk = chunks[idx]
        doc = docs[idx]
        results.append(
            SearchResult(
                document_title=doc.title,
                chunk_index=chunk.chunk_index,
                score=float(sims[idx]),
                text=chunk.text,
            )
        )
    return results
