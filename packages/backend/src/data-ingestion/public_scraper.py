# src/scripts/data-ingestion/public_scraper.py
# Skrip Python untuk scraping data publik dari sumber online untuk enriching knowledge base NEXUS.

import os
import sys
import json
import asyncio
import aiohttp
import time
from pathlib import Path
from urllib.parse import urljoin, urlparse
import logging
from bs4 import BeautifulSoup
import trafilatura
from tenacity import retry, stop_after_attempt, wait_fixed

# --- 1. Konfigurasi ---
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent # Menunjuk ke root: Nexus-Sentient-Platform/
sys.path.insert(0, str(PROJECT_ROOT))

# Konfigurasi logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Folder output (disesuaikan agar konsisten dengan struktur proyek)
DATA_DIR = PROJECT_ROOT / "data"
SCRAPED_DATA_DIR = DATA_DIR / "scraped"
SCRAPED_DATA_DIR.mkdir(parents=True, exist_ok=True)

# Folder cache untuk HTML mentah (disesuaikan agar konsisten)
CACHE_DIR = DATA_DIR / "cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)


# --- 2. Daftar URL untuk di-scrape ---
URLS_TO_SCRAPE = [
    # --- A. ITS & FTIRS (25 URL) ---
    "https://www.its.ac.id/news/",
    "https://www.its.ac.id/berita/category/prestasi/",
    "https://www.its.ac.id/berita/category/riset-dan-inovasi/",
    "https://www.its.ac.id/berita/category/kegiatan/",
    "https://www.its.ac.id/ftirs/",
    "https://www.its.ac.id/ftirs/id/berita-ftirs/",
    "https://www.its.ac.id/admission/sarjana/",
    "https://www.its.ac.id/kemahasiswaan/prestasi-mahasiswa/",
    "https://www.its.ac.id/kemahasiswaan/category/pengumuman-kemahasiswaan/",
    "https://www.its.ac.id/research/",
    "https://www.its.ac.id/international/",
    "https://careers.its.ac.id/",
    "https://www.its.ac.id/ftirs/id/departemen/",
    "https://www.its.ac.id/berita/tag/mawapres/",
    "https://www.its.ac.id/berita/tag/pkm/",
    "https://www.its.ac.id/berita/tag/robotika/",
    "https://library.its.ac.id/",
    "https://share.its.ac.id/",
    "https://www.its.ac.id/berita/tag/otomotif/",
    "https://www.its.ac.id/berita/tag/manufaktur/",
    "https://www.its.ac.id/berita/tag/energi/",
    "https://www.its.ac.id/ftirs/id/penelitian-dan-pengabdian/",
    "https://www.its.ac.id/direktorat-riset-dan-pengabdian-kepada-masyarakat/",
    "https://www.its.ac.id/kuliah-kerja-nyata/",
    "https://www.its.ac.id/inovasi/",

    # --- B. Departemen Teknik Mesin ITS & Laboratorium (20 URL) ---
    "https://www.its.ac.id/me/",
    "https://www.its.ac.id/me/academic/undergraduate-program/",
    "https://www.its.ac.id/me/research-me/",
    "https://www.its.ac.id/me/category/news-me/",
    "https://www.its.ac.id/me/laboratories/",
    "https://www.its.ac.id/me/hmm-mesin-its/",
    "https://www.its.ac.id/me/kerja-praktek/",
    "https://www.its.ac.id/me/tugas-akhir/",
    "https://www.its.ac.id/me/laboratories/rekayasa-termal-dan-energi/",
    "https://www.its.ac.id/me/laboratories/desain-sistem-mekanikal/",
    "https://www.its.ac.id/me/laboratories/teknologi-manufaktur/",
    "https://www.its.ac.id/me/laboratories/mekatronika-dan-otomasi-industri/",
    "https://www.its.ac.id/me/laboratories/material-dan-metalurgi/",
    "https://www.its.ac.id/me/laboratories/mekanika-fluida/",
    "https://www.its.ac.id/me/publication/",
    "https://www.its.ac.id/me/fasilitas/",
    "https://www.its.ac.id/me/category/prestasi-mahasiswa-me/",
    "https://www.its.ac.id/me/category/lowongan-kerja/",
    "https://www.its.ac.id/me/category/seminar-dan-workshop/",
    "https://www.its.ac.id/me/student-chapter/",

    # --- C. Portal Pekerjaan & Magang (Filter: Teknik Mesin) (10 URL - Contoh) ---
    "https://glints.com/id/opportunities/jobs/explore?keyword=mechanical+engineer&country=ID",
    "https://www.kalibrr.com/id-ID/job-board/te/teknik-mesin/1",
    "https://id.indeed.com/jobs?q=Mechanical+Engineer&l=Indonesia",
    "https://www.glassdoor.com/Job/indonesia-mechanical-engineer-jobs-SRCH_IL.0,9_IN113_KO10,29.htm",
    "https://karir.com/search?q=teknik%20mesin",
    "https://www.linkedin.com/jobs/search/?keywords=Mechanical%20Engineering&location=Indonesia",
    "https://www.jobstreet.co.id/id/mechanical-engineer-jobs",
    "https://www.linkedin.com/jobs/search/?keywords=Mechanical%20Engineering%20Internship&location=Indonesia",
    "https://www.jobstreet.co.id/id/internship-mechanical-engineer-jobs",
    "https://www.glints.com/id/opportunities/internships/explore?keyword=mechanical+engineer&country=ID",

    # --- D. Berita Industri, Profesional & Organisasi (15 URL) ---
    "https://www.asme.org/topics-resources",
    "https://www.imeche.org/news",
    "https://www.pii.or.id/berita/",
    "https://www.sae.org/news/",
    "https://www.engineering.com/",
    "https://www.machinedesign.com/",
    "https://www.theengineer.co.uk/",
    "https://www.dunia-energi.com/",
    "https://industri.kontan.co.id/",
    "https://otomotif.kompas.com/",
    "https://www.manufacturing.net/",
    "https://www.automation.com/en-us/news",
    "https://www.robotics.org/news",
    "https://www.compositesworld.com/",
    "https://www.materialstoday.com/",

    # --- E. Kursus Online & Skill Development (10 URL) ---
    "https://www.coursera.org/browse/physical-science-and-engineering/mechanical-engineering",
    "https://www.edx.org/learn/mechanical-engineering",
    "https://www.udemy.com/topic/mechanical-engineering/",
    "https://ocw.mit.edu/collections/mechanical-engineering/",
    "https://www.khanacademy.org/science/physics",
    "https://www.solidworks.com/news",
    "https://blogs.autodesk.com/inventor/",
    "https://www.ansys.com/blog",
    "https://www.mathworks.com/company/newsroom.html",
    "https://www.coursera.org/courses?query=autocad"
]

# --- 3. Fungsi Utilitas ---
def log_info(message):
    logger.info(message)

def log_warn(message):
    logger.warning(message)

def log_error(message):
    logger.error(message)

def get_cache_path(url):
    import hashlib
    url_hash = hashlib.md5(url.encode()).hexdigest()
    return CACHE_DIR / f"{url_hash}.html"

def is_cached(url):
    cache_path = get_cache_path(url)
    return cache_path.exists() and cache_path.stat().st_size > 0

def save_to_cache(url, content):
    cache_path = get_cache_path(url)
    try:
        with open(cache_path, 'w', encoding='utf-8') as f:
            f.write(content)
        log_info(f"[Cache] Konten untuk {url} disimpan.")
    except Exception as e:
        log_error(f"[Cache] Gagal menyimpan cache untuk {url}: {e}")

def load_from_cache(url):
    cache_path = get_cache_path(url)
    try:
        with open(cache_path, 'r', encoding='utf-8') as f:
            content = f.read()
        log_info(f"[Cache] Konten untuk {url} dimuat dari cache.")
        return content
    except Exception as e:
        log_error(f"[Cache] Gagal memuat cache untuk {url}: {e}")
        return None

# --- 4. Fungsi Scraping dengan Retry dan Trafilatura ---
@retry(stop=stop_after_attempt(3), wait=wait_fixed(2))
async def scrape_url(session, url):
    log_info(f"[Scraper] Memulai proses untuk URL: {url}")
    
    if is_cached(url):
        html_content = load_from_cache(url)
        if html_content:
            extracted_text = trafilatura.extract(html_content, include_comments=False, include_tables=False)
            if extracted_text:
                log_info(f"[Scraper] Konten utama berhasil diekstrak dari cache untuk: {url}")
                soup = BeautifulSoup(html_content, 'html.parser')
                title_tag = soup.find('title')
                page_title = title_tag.text.strip() if title_tag else url
                return {"url": url, "title": page_title, "content": extracted_text, "scraped_at": time.time()}
            else:
                log_warn(f"[Scraper] Gagal ekstrak dari cache untuk: {url}. Mencoba scraping ulang.")

    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        timeout = aiohttp.ClientTimeout(total=30)
        async with session.get(url, headers=headers, timeout=timeout, ssl=False) as response: # Tambahkan ssl=False untuk mengatasi beberapa error SSL
            response.raise_for_status()
            html_content = await response.text()

        save_to_cache(url, html_content)
        
        extracted_text = trafilatura.extract(html_content, include_comments=False, include_tables=False)
        if not extracted_text:
            log_warn(f"[Scraper] Trafilatura gagal, menggunakan fallback BeautifulSoup untuk: {url}")
            soup = BeautifulSoup(html_content, 'html.parser')
            body = soup.find('body')
            extracted_text = body.get_text(separator='\n', strip=True) if body else ''

        soup = BeautifulSoup(html_content, 'html.parser')
        title_tag = soup.find('title')
        page_title = title_tag.text.strip() if title_tag else url

        log_info(f"[Scraper] Scraping dan ekstraksi berhasil untuk: {url}")
        return {"url": url, "title": page_title, "content": extracted_text, "scraped_at": time.time()}

    except Exception as e:
        log_error(f"[Scraper] Gagal scraping {url}: {e}")
        raise

# --- 5. Fungsi Inti ---
async def main():
    log_info("=== Memulai Scraping Data Publik ===")
    start_time = time.time()
    scraped_items = []
    semaphore = asyncio.Semaphore(10)

    async def bound_scrape_url(session, url):
        async with semaphore:
            try:
                return await scrape_url(session, url)
            except Exception as e:
                log_error(f"Tugas scraping untuk {url} gagal setelah semua retry: {e}")
                return None

    async with aiohttp.ClientSession() as session:
        tasks = [bound_scrape_url(session, url) for url in URLS_TO_SCRAPE]
        results = await asyncio.gather(*tasks)

    scraped_items = [res for res in results if res and res.get("content")]

    if scraped_items:
        output_filename = f"scraped_public_data_{int(time.time())}.json"
        output_path = SCRAPED_DATA_DIR / output_filename
        log_info(f"Menyimpan {len(scraped_items)} item yang di-scrape ke: {output_path}")
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(scraped_items, f, indent=2, ensure_ascii=False)
    else:
        log_warn("Tidak ada data yang berhasil di-scrape.")

    duration = time.time() - start_time
    log_info(f"=== Proses Selesai dalam {duration:.2f} detik. ===")
    log_info("CATATAN: File JSON hasil scraping ini perlu dimasukkan ke pipeline ETL utama NEXUS Anda.")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())