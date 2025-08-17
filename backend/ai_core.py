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
    convo = "
".join(user_parts)
    # Generic instruct style
    prompt = f"<s>[INST] {system}

{convo} [/INST]"
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
        {"role": "user", "content": rubric + "

Profil:
" + str(profile)},
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
