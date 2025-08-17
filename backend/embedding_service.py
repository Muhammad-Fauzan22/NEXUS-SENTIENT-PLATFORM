from __future__ import annotations
from typing import List, Any
import numpy as np

_ModelType = Any
_model_cache: _ModelType | None = None
_model_ok: bool = False


def _try_load_model() -> _ModelType | None:
    global _model_cache, _model_ok
    if _model_cache is not None:
        return _model_cache
    try:
        from sentence_transformers import SentenceTransformer  # type: ignore
        _model_cache = SentenceTransformer(
            "sentence-transformers/all-MiniLM-L6-v2",
            cache_folder="models/embeddings",
            device="cpu",
        )
        _model_ok = True
    except Exception:
        _model_cache = None
        _model_ok = False
    return _model_cache


def _hashing_embed(texts: List[str], dim: int = 384) -> np.ndarray:
    # Deterministic simple hashing embedding for environments without Torch
    rng = np.random.default_rng(42)
    # Fixed random projection matrix (seeded) for hashing sim
    proj = rng.standard_normal((dim, 256), dtype=np.float32)
    embs = []
    for t in texts:
        # Build 256-dim histogram of bytes
        h = np.zeros(256, dtype=np.float32)
        for b in t.encode("utf-8", errors="ignore"):
            h[b] += 1.0
        v = proj @ (h / (np.linalg.norm(h) + 1e-9))
        # normalize
        v = v / (np.linalg.norm(v) + 1e-9)
        embs.append(v)
    return np.vstack(embs)


def embed_texts(texts: List[str]) -> np.ndarray:
    model = _try_load_model()
    if _model_ok and model is not None:
        try:
            return model.encode(texts, show_progress_bar=False, convert_to_numpy=True, normalize_embeddings=True)
        except Exception:
            pass
    # fallback hashing embeddings
    return _hashing_embed(texts)
