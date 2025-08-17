from __future__ import annotations
import os
from typing import Generator
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey, JSON
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from sqlalchemy.exc import OperationalError
try:
    from sqlalchemy.dialects.postgresql import JSONB as PG_JSONB
except Exception:
    PG_JSONB = None
from .config import settings

DATABASE_URL = settings.DATABASE_URL or os.getenv("DATABASE_URL")
if not DATABASE_URL:
    # Fallback to local SQLite for development
    os.makedirs("data", exist_ok=True)
    DATABASE_URL = "sqlite:///data/nexus.db"

# Configure engine with SQLite-specific args when needed
engine_kwargs = {}
if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Decide embedding JSON type based on backend
IS_POSTGRES = DATABASE_URL.startswith("postgresql")
EmbeddingJSONType = PG_JSONB if (IS_POSTGRES and PG_JSONB is not None) else JSON

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
    # Embedding as JSON/JSONB depending on backend
    embedding = Column(EmbeddingJSONType, nullable=False)

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
