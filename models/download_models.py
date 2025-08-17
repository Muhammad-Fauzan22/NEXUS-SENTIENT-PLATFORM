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
