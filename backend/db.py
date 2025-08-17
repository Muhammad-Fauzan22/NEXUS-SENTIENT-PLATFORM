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
