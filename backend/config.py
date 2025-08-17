import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Notion token: support fallback to NOTION_API_KEY
    NOTION_TOKEN: str | None = os.getenv("NOTION_TOKEN") or os.getenv("NOTION_API_KEY")
    NOTION_DB_PROJECTS_ID: str | None = os.getenv("NOTION_DB_PROJECTS_ID")
    NOTION_DB_DOCS_ID: str | None = os.getenv("NOTION_DB_DOCS_ID")

    # Database URL (Postgres recommended). If missing, upstream db module may fallback to SQLite for local dev.
    DATABASE_URL: str | None = os.getenv("DATABASE_URL")

    # LLM local model settings
    MODEL_GGUF_PATH: str = os.getenv(
        "MODEL_GGUF_PATH",
        "models/llm/mistral-7b-instruct-v0.2.Q4_K_M.gguf",
    )
    LLM_THREADS: int = int(os.getenv("LLM_THREADS", "2"))
    LLM_CONTEXT: int = int(os.getenv("LLM_CONTEXT", "3072"))

    # Admin/API settings
    ADMIN_TOKEN: str | None = os.getenv("ADMIN_TOKEN")
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")

    # Reranker settings
    RERANKER_ENABLED: str = os.getenv("RERANKER_ENABLED", "0")
    RERANKER_MODEL: str = os.getenv("RERANKER_MODEL", "cross-encoder/ms-marco-MiniLM-L-6-v2")

settings = Settings()
