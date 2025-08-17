from __future__ import annotations
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from .db import create_all, get_session, Document, Chunk
from .schemas import ChatRequest, ChatResponse, IDPRequest, IDPResponse, Opportunity, SearchRequest, SearchResult
from . import ai_core
from . import embedding_service
from .notion_service import NotionService

app = FastAPI(title="NEXUS Backend")

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
def health():
    return {"status": "ok"}

@app.post("/api/chat", response_model=ChatResponse)
def api_chat(req: ChatRequest) -> ChatResponse:
    content = ai_core.chat([m.model_dump() for m in req.messages])
    return ChatResponse(content=content)

@app.post("/api/idp", response_model=IDPResponse)
def api_idp(req: IDPRequest) -> IDPResponse:
    idp_text = ai_core.generate_idp(req.profile)
    return IDPResponse(idp=idp_text)

@app.get("/api/opportunities", response_model=List[Opportunity])
def api_opportunities() -> List[Opportunity]:
    svc = NotionService()
    items = svc.find_open_projects()
    return [Opportunity(**x) for x in items]

@app.get("/api/docs/{name}")
def api_get_doc(name: str) -> dict:
    svc = NotionService()
    content = svc.get_document(name)
    return {"name": name, "content": content}

@app.post("/api/search", response_model=List[SearchResult])
def api_search(req: SearchRequest, db: Session = Depends(get_session)) -> List[SearchResult]:
    # fetch all chunks
    rows = db.query(Chunk, Document).join(Document, Chunk.document_id == Document.id).all()
    if not rows:
        return []
    texts = [r.Chunk.text for r in rows]
    embs = [r.Chunk.embedding for r in rows]
    import numpy as np
    from numpy.linalg import norm

    # embed query
    q = embedding_service.embed_texts([req.query])[0]
    m = np.array(embs, dtype=float)
    # cosine similarity
    sims = m @ q / (norm(m, axis=1) * norm(q) + 1e-9)
    top_idx = sims.argsort()[::-1][: req.k]

    results: List[SearchResult] = []
    for i in top_idx:
        chunk, doc = rows[int(i)]
        results.append(
            SearchResult(
                document_title=doc.title,
                chunk_index=chunk.chunk_index,
                score=float(sims[int(i)]),
                text=chunk.text,
            )
        )
    return results
