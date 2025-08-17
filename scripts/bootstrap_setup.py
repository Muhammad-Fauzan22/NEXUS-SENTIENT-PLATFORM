#!/usr/bin/env python3
from pathlib import Path
import os

ROOT = Path(__file__).resolve().parents[1]

FILES = {
    # Replit/system files
    "replit.nix": """
{ pkgs }: {
  deps = [
    pkgs.python311Full
    pkgs.python311Packages.pip
    pkgs.nodejs_20
    pkgs.cmake
    pkgs.gcc
    pkgs.gnumake
    pkgs.openblas
    pkgs.git
    pkgs.pkg-config
  ];
}
""".strip() + "\n",
    "requirements.txt": """
fastapi==0.111.0
uvicorn[standard]==0.30.0
pydantic==2.7.1
httpx==0.27.0
python-dotenv==1.0.1
sqlalchemy==2.0.30
psycopg2-binary==2.9.9
notion-client==2.2.1
sentence-transformers==2.7.0
numpy==1.26.4
huggingface-hub==0.23.2
llama-cpp-python==0.2.76
""".strip() + "\n",
    ".env.example": """
# Copy to .env (for local runs) or set these in Replit Secrets
NOTION_TOKEN=
NOTION_DB_PROJECTS_ID=
NOTION_DB_DOCS_ID=
DATABASE_URL=
SLACK_BOT_TOKEN=
TEAMS_BOT_ID=
TEAMS_BOT_PASSWORD=
GOOGLE_SERVICE_ACCOUNT_JSON=
MODEL_GGUF_PATH=models/llm/mistral-7b-instruct-v0.2.Q4_K_M.gguf
LLM_THREADS=2
LLM_CONTEXT=3072
""".strip() + "\n",

    # Backend package files
    "backend/__init__.py": """""",
    "backend/config.py": """
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    NOTION_TOKEN: str | None = os.getenv("NOTION_TOKEN")
    NOTION_DB_PROJECTS_ID: str | None = os.getenv("NOTION_DB_PROJECTS_ID")
    NOTION_DB_DOCS_ID: str | None = os.getenv("NOTION_DB_DOCS_ID")
    DATABASE_URL: str | None = os.getenv("DATABASE_URL")

    MODEL_GGUF_PATH: str = os.getenv(
        "MODEL_GGUF_PATH",
        "models/llm/mistral-7b-instruct-v0.2.Q4_K_M.gguf",
    )
    LLM_THREADS: int = int(os.getenv("LLM_THREADS", "2"))
    LLM_CONTEXT: int = int(os.getenv("LLM_CONTEXT", "3072"))

settings = Settings()
""".strip() + "\n",
    "backend/db.py": """
from __future__ import annotations
import os
from typing import Generator
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from sqlalchemy.exc import OperationalError
from sqlalchemy.dialects.postgresql import JSONB
from .config import settings

DATABASE_URL = settings.DATABASE_URL or os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set in environment.")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    notion_page_id = Column(String, unique=True, nullable=True)
    title = Column(String, nullable=False)
    source = Column(String, nullable=True)
    content = Column(Text, nullable=True)

    chunks = relationship("Chunk", back_populates="document", cascade="all, delete-orphan")

class Chunk(Base):
    __tablename__ = "chunks"
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"))
    chunk_index = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)
    # Embedding as JSONB (Postgres). If not Postgres, fallback will still store JSON-serializable via SQLAlchemy
    embedding = Column(JSONB, nullable=False)

    document = relationship("Document", back_populates="chunks")


def create_all() -> None:
    try:
        Base.metadata.create_all(bind=engine)
    except OperationalError as e:
        raise RuntimeError(f"Database connection failed: {e}")


def get_session() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
""".strip() + "\n",
    "backend/schemas.py": """
from pydantic import BaseModel, Field
from typing import List, Optional, Any

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class ChatResponse(BaseModel):
    content: str

class IDPRequest(BaseModel):
    profile: dict

class IDPResponse(BaseModel):
    idp: str

class Opportunity(BaseModel):
    id: str = Field(..., description="Notion page ID")
    name: str
    status: str
    division: Optional[list[str]] = None
    description: Optional[str] = None
    apply_url: Optional[str] = None

class SearchRequest(BaseModel):
    query: str
    k: int = 5

class SearchResult(BaseModel):
    document_title: str
    chunk_index: int
    score: float
    text: str
""".strip() + "\n",
    "backend/embedding_service.py": """
from __future__ import annotations
from typing import List
import numpy as np
from sentence_transformers import SentenceTransformer

_model_cache: SentenceTransformer | None = None

def get_embedding_model() -> SentenceTransformer:
    global _model_cache
    if _model_cache is None:
        # Load from local cache folder (created by download_models.py)
        _model_cache = SentenceTransformer(
            "sentence-transformers/all-MiniLM-L6-v2",
            cache_folder="models/embeddings",
            device="cpu",
        )
    return _model_cache


def embed_texts(texts: List[str]) -> np.ndarray:
    model = get_embedding_model()
    embeddings = model.encode(texts, show_progress_bar=False, convert_to_numpy=True, normalize_embeddings=True)
    return embeddings
""".strip() + "\n",
    "backend/ai_core.py": """
from __future__ import annotations
from typing import List, Dict
from llama_cpp import Llama
from .config import settings

_llm: Llama | None = None

SYSTEM_PROMPT = (
    "Anda adalah NEXUS, Pelatih Pribadi HMM. Bantu asesmen kompetensi, susun IDP yang terstruktur, "
    "dan hubungkan potensi individu ke peluang nyata di HMM. Jawab ringkas, jelas, dan actionable."
)


def get_llm() -> Llama:
    global _llm
    if _llm is None:
        _llm = Llama(
            model_path=settings.MODEL_GGUF_PATH,
            n_ctx=settings.LLM_CONTEXT,
            n_threads=settings.LLM_THREADS,
            verbose=False,
        )
    return _llm


def _format_prompt(messages: List[Dict[str, str]]) -> str:
    system = SYSTEM_PROMPT
    user_parts = []
    for m in messages:
        role = m.get("role", "user").lower()
        content = m.get("content", "")
        if role == "system":
            system = content
        else:
            user_parts.append(f"{role.upper()}: {content}")
    convo = "\n".join(user_parts)
    # Generic instruct style
    prompt = f"<s>[INST] {system}\n\n{convo} [/INST]"
    return prompt


def chat(messages: List[Dict[str, str]], max_tokens: int = 512, temperature: float = 0.2) -> str:
    llm = get_llm()
    prompt = _format_prompt(messages)
    out = llm(
        prompt,
        max_tokens=max_tokens,
        temperature=temperature,
        stop=["</s>", "[INST]", "</INST>", "USER:", "ASSISTANT:"],
    )
    text = out["choices"][0]["text"].strip()
    return text


def generate_idp(profile: dict, max_tokens: int = 700) -> str:
    llm = get_llm()
    rubric = (
        "Susun Individual Development Plan (IDP) komprehensif berdasarkan profil berikut. "
        "Formatkan dengan bagian: 1) Ringkasan Profil, 2) Tujuan 12 Minggu, 3) Analisis Gap, "
        "4) Rencana Aksi Mingguan (milestone), 5) Sumber Belajar (internal HMM/eksternal), 6) Indikator Keberhasilan."
    )
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": rubric + "\n\nProfil:\n" + str(profile)},
    ]
    prompt = _format_prompt(messages)
    out = llm(
        prompt,
        max_tokens=max_tokens,
        temperature=0.2,
        stop=["</s>", "[INST]", "</INST>", "USER:", "ASSISTANT:"],
    )
    text = out["choices"][0]["text"].strip()
    return text
""".strip() + "\n",
    "backend/notion_service.py": """
from __future__ import annotations
from typing import List, Optional, Dict, Any
from notion_client import Client
from .config import settings

class NotionService:
    def __init__(self) -> None:
        if not settings.NOTION_TOKEN:
            raise RuntimeError("NOTION_TOKEN not set.")
        self.client = Client(auth=settings.NOTION_TOKEN)
        self.db_projects = settings.NOTION_DB_PROJECTS_ID
        self.db_docs = settings.NOTION_DB_DOCS_ID
        if not self.db_projects or not self.db_docs:
            # Not all features require both, but for simplicity we expect both
            pass

    def find_open_projects(self) -> List[Dict[str, Any]]:
        if not self.db_projects:
            return []
        query = {
            "database_id": self.db_projects,
            "filter": {
                "property": "Status",
                "select": {"equals": "Open"}
            }
        }
        res = self.client.databases.query(**query)
        items = []
        for page in res.get("results", []):
            props = page.get("properties", {})
            name = props.get("Name", {}).get("title", [])
            title = "".join([t.get("plain_text", "") for t in name]) if name else ""
            status = props.get("Status", {}).get("select", {}).get("name", "")
            division = [x.get("name") for x in props.get("Divisi", {}).get("multi_select", [])]
            desc = props.get("Deskripsi", {}).get("rich_text", [])
            description = "".join([t.get("plain_text", "") for t in desc]) if desc else None
            apply_url = props.get("Link Pendaftaran", {}).get("url")
            items.append({
                "id": page.get("id"),
                "name": title,
                "status": status,
                "division": division,
                "description": description,
                "apply_url": apply_url,
            })
        return items

    def _get_block_text_recursive(self, block_id: str) -> str:
        texts: List[str] = []
        cursor = None
        while True:
            res = self.client.blocks.children.list(block_id=block_id, start_cursor=cursor)
            for blk in res.get("results", []):
                t = blk.get("type")
                rich = blk.get(t, {}).get("rich_text", [])
                if rich:
                    texts.append("".join([r.get("plain_text", "") for r in rich]))
                # recurse if has children
                if blk.get("has_children"):
                    texts.append(self._get_block_text_recursive(blk.get("id")))
            if not res.get("has_more"):
                break
            cursor = res.get("next_cursor")
        return "\n".join([x for x in texts if x])

    def get_document(self, doc_name: str) -> Optional[str]:
        if not self.db_docs:
            return None
        query = {
            "database_id": self.db_docs,
            "filter": {
                "property": "Name",
                "title": {"equals": doc_name}
            }
        }
        res = self.client.databases.query(**query)
        results = res.get("results", [])
        if not results:
            return None
        page = results[0]
        page_id = page.get("id")
        content = self._get_block_text_recursive(page_id)
        return content

    def list_documents(self, category: Optional[str] = None, page_size: int = 50) -> List[Dict[str, Any]]:
        if not self.db_docs:
            return []
        payload: Dict[str, Any] = {
            "database_id": self.db_docs,
            "page_size": page_size,
        }
        if category:
            payload["filter"] = {
                "property": "Kategori",
                "select": {"equals": category}
            }
        res = self.client.databases.query(**payload)
        docs = []
        for page in res.get("results", []):
            props = page.get("properties", {})
            name = props.get("Name", {}).get("title", [])
            title = "".join([t.get("plain_text", "") for t in name]) if name else "Untitled"
            page_id = page.get("id")
            content = self._get_block_text_recursive(page_id)
            docs.append({
                "id": page_id,
                "title": title,
                "content": content,
            })
        return docs
""".strip() + "\n",
    "backend/main.py": """
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
""".strip() + "\n",

    # ETL script
    "scripts/etl.py": """
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
""".strip() + "\n",

    # Models downloader
    "models/download_models.py": """
from __future__ import annotations
import os
from pathlib import Path
from huggingface_hub import hf_hub_download
from sentence_transformers import SentenceTransformer

ROOT = Path(__file__).resolve().parents[1]
LLM_DIR = ROOT / "models" / "llm"
EMB_DIR = ROOT / "models" / "embeddings"
LLM_DIR.mkdir(parents=True, exist_ok=True)
EMB_DIR.mkdir(parents=True, exist_ok=True)

# Default: Mistral 7B Instruct Q4_K_M
REPO_ID = os.getenv("LLM_GGUF_REPO", "TheBloke/Mistral-7B-Instruct-v0.2-GGUF")
FILENAME = os.getenv("LLM_GGUF_FILE", "mistral-7b-instruct-v0.2.Q4_K_M.gguf")

print("Downloading LLM GGUF ...")
path = hf_hub_download(repo_id=REPO_ID, filename=FILENAME, local_dir=str(LLM_DIR))
print("LLM saved at:", path)

print("Downloading embeddings model cache ...")
_ = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2", cache_folder=str(EMB_DIR))
print("Embeddings cached at:", EMB_DIR)
""".strip() + "\n",

    # Windows helpers
    "start_backend.bat": """
@echo off
set PYTHONIOENCODING=utf-8
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
""".strip() + "\n",
}


def write_files():
    for rel_path, content in FILES.items():
        target = ROOT / rel_path
        target.parent.mkdir(parents=True, exist_ok=True)
        with open(target, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Wrote {target.relative_to(ROOT)}")

if __name__ == "__main__":
    write_files()
