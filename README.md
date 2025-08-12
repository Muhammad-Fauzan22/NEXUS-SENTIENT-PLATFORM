# NEXUS: The Sentient Development Platform

**NEXUS** adalah sistem pengembangan sumber daya mahasiswa berbasis bukti yang mengintegrasikan metodologi psikometri, pedagogi modern, dan AI untuk menciptakan roadmap kompetensi personal yang valid, reliabel, dan terukur.

[![NEXUS CI - Test & Validation](https://github.com/Muhammad-Fauzan22/NEXUS-SENTIENT-PLATFORM/actions/workflows/ci.yml/badge.svg)](https://github.com/Muhammad-Fauzan22/NEXUS-SENTIENT-PLATFORM/actions/workflows/ci.yml)

---


## Core Features

-   **Analisis Psikometri Multi-Dimensi:** Menggunakan model RIASEC dan PWB yang divalidasi secara ilmiah.
-   **Individual Development Plan (IDP) Berbasis AI:** Menghasilkan rencana aksi 8 semester yang personal dan dapat ditindaklanjuti.
-   **Arsitektur Modular:** Provider AI yang dapat ditukar (Claude, Gemini, Perplexity) dan service layer yang terabstraksi.
-   **Jaminan Kualitas Otomatis:** Alur kerja CI/CD dengan pengujian unit dan end-to-end untuk memastikan keandalan.

## Tech Stack Architecture

```mermaid
graph TD
    A[Frontend: SvelteKit] --> B[Backend API: SvelteKit Endpoints]
    B --> C[Orchestrator: aiService]
    B --> D[Database Service: dbService]
    C --> E[AI Providers: Claude, Gemini, etc.]
    D --> F[Database: Supabase]

    subgraph A [Frontend]
        A1[Svelte 5]
        A2[Tailwind CSS]
        A3[TypeScript]
    end

    subgraph B [Backend API]
        B1[Node.js Runtime]
        B2[Vitest for Unit Tests]
        B3[Playwright for E2E Tests]
    end