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
