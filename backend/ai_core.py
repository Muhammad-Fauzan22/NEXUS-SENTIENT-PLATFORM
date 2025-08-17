from __future__ import annotations
from typing import List, Dict, Any
from .config import settings

# Lazy import llama-cpp-python to allow environments without it
_Llama: Any | None = None
_llm: Any | None = None

SYSTEM_PROMPT = (
    "Anda adalah NEXUS, Pelatih Pribadi HMM. Bantu asesmen kompetensi, susun IDP yang terstruktur, "
    "dan hubungkan potensi individu ke peluang nyata di HMM. Jawab ringkas, jelas, dan actionable."
)


def _ensure_llama_class():
    global _Llama
    if _Llama is not None:
        return _Llama
    try:
        from llama_cpp import Llama as _LC
        _Llama = _LC
    except Exception:
        _Llama = None
    return _Llama


def get_llm():
    """Lazy-load LLM lokal (GGUF via llama-cpp); return None jika tidak tersedia."""
    global _llm
    if _llm is not None:
        return _llm
    LlamaClass = _ensure_llama_class()
    if LlamaClass is None:
        return None
    try:
        _llm = LlamaClass(
            model_path=settings.MODEL_GGUF_PATH,
            n_ctx=settings.LLM_CONTEXT,
            n_threads=settings.LLM_THREADS,
            verbose=False,
        )
    except Exception:
        _llm = None
    return _llm


def _format_prompt(messages: List[Dict[str, str]]) -> str:
    """Gabungkan pesan menjadi prompt instruksi generik."""
    system = SYSTEM_PROMPT
    user_parts: List[str] = []
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
    if llm is None:
        # Fallback deterministic stub if LLM not available
        return "[LLM offline] Mohon aktifkan model lokal. Sementara ini, gunakan /api/search atau /api/rag untuk akses pengetahuan."
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
    if llm is None:
        return (
            "[LLM offline] Rencana IDP tidak dapat digenerate karena model lokal non-aktif. "
            "Pastikan llama-cpp terpasang dan model GGUF tersedia."
        )
    out = llm(
        prompt,
        max_tokens=max_tokens,
        temperature=0.2,
        stop=["</s>", "[INST]", "</INST>", "USER:", "ASSISTANT:"],
    )
    text = out["choices"][0]["text"].strip()
    return text
