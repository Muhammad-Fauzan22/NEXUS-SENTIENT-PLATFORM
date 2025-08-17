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
