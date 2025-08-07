# NEXUS: The Sentient Development Platform (KNOWS-Pro)

Platform Generasi Individual Development Plan (IDP) Berbasis AI untuk Pola Pengembangan Sumber Daya Mahasiswa (PPSDM) HMM ITS.

## Deskripsi

NEXUS adalah sistem cerdas yang dirancang untuk menganalisis potensi mahasiswa dan menghasilkan rencana pengembangan pribadi (IDP) yang sangat personal dan sistematis selama 8 semester. Platform ini dibangun berdasarkan blueprint arsitektur sistem canggih yang dirancang untuk skalabilitas, adaptabilitas, dan integrasi AI yang mendalam.

## Arsitektur & Prinsip Desain (Terinspirasi dari Blueprint NEXUS)

Arsitektur NEXUS dirancang untuk menjadi sistem yang "bernapas" dan terus berkembang. Meskipun implementasi awal menggunakan sumber daya yang tersedia (Python, API AI gratis, Supabase, GDrive), fondasinya dibangun untuk menyesuaikan diri dengan prinsip-prinsip berikut:

*   **Data Obsession:** Setiap aspek sistem didasarkan pada data yang dikumpulkan dan dianalisis secara menyeluruh.
*   **Continuous Evolution:** Sistem dirancang untuk mudah diperbarui dan disesuaikan dengan perubahan konteks (kebijakan kampus, program baru).
*   **AI-Augmented Processing:** Menggunakan kekuatan berbagai API AI untuk tugas analisis dan generasi yang kompleks.
*   **Modular & Extensible:** Komponen-komponen sistem (Data Pipeline, AI Agents, Storage) dibangun secara modular untuk memudahkan pengembangan dan pemeliharaan.
*   **Blueprint Alignment:** Implementasi awal ini sudah mulai menyesuaikan diri dengan komponen blueprint seperti:
    *   **Data Lake:** Direktori `data/lakehouse/` digunakan untuk menyimpan data mentah dan hasil pemrosesan terstruktur.
    *   **Processing Engine:** Script seperti `src/data_pipeline/dataset_loader.py` berperan sebagai bagian awal dari mesin pemrosesan data.
    *   **AI Core:** Integrasi dengan berbagai API AI (Gemini, DeepSeek, dll.) akan menjadi inti dari komponen analisis dan generasi.

Struktur awal sistem ini mencerminkan adaptasi prinsip-prinsip tersebut dalam lingkungan dengan sumber daya terbatas namun dengan ambisi tinggi untuk mencapai output yang setara dengan sistem kelas dunia.

## Fitur Utama (Rencana)

*   Analisis ARM (Analisis Raw Material) otomatis.
*   Profil multidimensi berbasis AI (RIASEC, Big Five, Gaya Belajar, dll).
*   Sintesis dataset eksternal untuk enriching.
*   Sistem multi-agent AI untuk pemrosesan.
*   Generasi IDP berbasis RAG (Retrieval-Augmented Generation).
*   UI Web dan Telegram Bot.
*   Penyimpanan di Google Drive dan MongoDB/Supabase.

## Teknologi

*   Python (FastAPI, PyMongo, Requests)
*   AI: Gemini Pro, DeepSeek, Cohere, Perplexity, Hugging Face
*   Database: MongoDB Atlas (Free Tier), Google Drive, Supabase
*   Hosting: Vercel/Netlify (Frontend), Azure Functions/Heroku (Backend)
*   UI: SvelteKit (opsional), Telegram Bot API

## Cara Menjalankan

(Akan diisi saat proyek berkembang)

## Kontributor

*   [MUHAMMAD FAUZAN]

## Lisensi

MIT License