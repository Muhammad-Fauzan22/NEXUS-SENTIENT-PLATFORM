# NEXUS Platform Dataset Downloader

## Overview

This tool automatically downloads all datasets specified in the README_DATASETS.md file for the NEXUS Sentient Platform.

## Quick Start

### Method 1: Double-click (Windows)

1. Double-click `download_datasets.bat`
2. Follow the on-screen instructions

### Method 2: Command Line

```bash
python download_all_datasets.py
```

## Prerequisites

### 1. Python Environment

- Python 3.7 or higher
- pip package manager

### 2. Kaggle API Setup (Required for Kaggle datasets)

1. Visit [Kaggle Account Settings](https://www.kaggle.com/settings/account)
2. Click "Create New API Token" to download `kaggle.json`
3. Place `kaggle.json` in: `C:\Users\<YourUser>\.kaggle\kaggle.json`

### 3. Install Dependencies

```bash
pip install requests kaggle datasets
```

## Downloaded Datasets

### A. Psychometrics (4 datasets)

- **Big Five Personality Test** - Personality assessment data
- **Student Mental Health** - Mental health survey data
- **MBTI Type** - Myers-Briggs personality type data
- **DASS Responses** - Depression, Anxiety, Stress Scale responses

### B. CV/Jobs/Skills (5 datasets)

- **HF Resume NER** - Resume entities for Named Entity Recognition
- **Job Descriptions** - Job posting descriptions dataset
- **SkillNER** - Skills extraction dataset
- **O\*NET Database** - Occupational information network
- **HF Resume NER** - Resume entities dataset

### C. Education/Academic/Content (7 datasets)

- **Student Performance** - Academic performance dataset
- **Coursera Courses** - Online course dataset
- **ArXiv** - Academic paper dataset
- **TED Talks** - TED presentation dataset
- **HF Academic Advising** - Academic advising conversations

## Output Structure

```
datasets/
├── big-five/
├── student-mental-health/
├── mbti-type/
├── dass-responses/
├── hf-resume-ner/
├── job-descriptions/
├── skill-ner/
├── onet/
├── student-performance/
├── coursera-courses/
├── arxiv/
├── ted-talks/
├── hf-academic-advising/
└── hf-resume-ner/
```

## Troubleshooting

### Common Issues

1. **Kaggle API Error**
   - Ensure `kaggle.json` is in correct location
   - Check internet connection
   - Verify Kaggle account has API access

2. **Permission Errors**
   - Run as administrator if needed
   - Check folder permissions

3. **Network Issues**
   - Use VPN if Kaggle is blocked
   - Check firewall settings

### Manual Download Commands

If automatic download fails, use these manual commands:

```bash
# Psychometrics
kaggle datasets download -d tunguz/big-five-personality-test -p ./datasets/big-five --unzip
kaggle datasets download -d hafiznouman786/student-mental-health -p ./datasets/student-mental-health --unzip
kaggle datasets download -d datasnaek/mbti-type -p ./datasets/mbti-type --unzip
kaggle datasets download -d lucasgreenwell/depression-anxiety-stress-scales-responses -p ./datasets/dass-responses --unzip

# Jobs/Skills
python scripts/datasets/download_hf_resume.py
kaggle datasets download -d ravishah1/job-description-dataset -p ./datasets/job-descriptions --unzip
git clone https://github.com/AnasAito/SkillNER.git ./datasets/skill-ner

# Education
python scripts/datasets/download_hf_advising.py
```

## Next Steps

After downloading all datasets:

1. Run ingestion: `npm run ingest:datasets`
2. Check dataset integrity
3. Configure vector database ingestion

## Support

For issues or questions, please refer to the main README_DATASETS.md file or create an issue in the repository.
