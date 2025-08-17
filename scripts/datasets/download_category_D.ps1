# Category D: Language, Conversation & General Knowledge datasets (25)
# Bahasa, Percakapan & Pengetahuan Umum - 25 Dataset Sempurna
New-Item -ItemType Directory -Force -Path ./datasets/language | Out-Null

# Hugging Face datasets (streaming and local) via temp python file
$pyCode = @'
from datasets import load_dataset

# The Pile (streaming for large dataset)
load_dataset("eleutherai/the_pile", "all", split="train", streaming=True)

# SQuAD (Stanford Q&A)
load_dataset("squad").save_to_disk("./datasets/language/squad")

# Wikipedia English (FULL)
load_dataset("wikipedia", "20220301.en", split="train").save_to_disk("./datasets/language/wikipedia-full")

# Anthropic HH-RLHF
load_dataset("Anthropic/hh-rlhf").save_to_disk("./datasets/language/anthropic-hh-rlhf")

# Common Crawl C4 (streaming or shard to disk via helper)
# For FULL-on-disk, run: python scripts/datasets/download_hf_sharded.py --dataset c4 --subset en --split train --records-per-shard 10000 --output ./datasets/language/c4-full

# Dolly 15k (Instruction Following)
load_dataset("databricks/databricks-dolly-15k").save_to_disk("./datasets/language/dolly-15k")

# OpenWebText
load_dataset("openwebtext").save_to_disk("./datasets/language/openwebtext")

# Multi-News (Summarization)
load_dataset("multi_news").save_to_disk("./datasets/language/multi-news")

# ELI5 (Explain Like I'm 5)
load_dataset("eli5").save_to_disk("./datasets/language/eli5")

# BookCorpus
load_dataset("bookcorpus").save_to_disk("./datasets/language/bookcorpus")

# CodeSearchNet
load_dataset("code_search_net", "all").save_to_disk("./datasets/language/codesearchnet")

# CNN/Daily Mail (Summarization)
load_dataset("cnn_dailymail", "3.0.0").save_to_disk("./datasets/language/cnn-dailymail")

# LAMBADA (Language Modeling)
load_dataset("lambada").save_to_disk("./datasets/language/lambada")

# GLUE Benchmark (MRPC)
load_dataset("glue", "mrpc").save_to_disk("./datasets/language/glue-mrpc")

# WikiText
load_dataset("wikitext", "wikitext-103-v1").save_to_disk("./datasets/language/wikitext")

# DailyDialog
load_dataset("daily_dialog").save_to_disk("./datasets/language/daily-dialog")

# Commonsense QA
load_dataset("commonsense_qa").save_to_disk("./datasets/language/commonsense-qa")

# Natural Questions (FULL)
load_dataset("natural_questions", split="train").save_to_disk("./datasets/language/natural-questions-full")

# Story Cloze Test
load_dataset("story_cloze", "2016").save_to_disk("./datasets/language/story-cloze")

# Code Alpaca (Instruction Following)
load_dataset("sahil2801/CodeAlpaca-20k").save_to_disk("./datasets/language/code-alpaca")
'@
$tmp = [System.IO.Path]::GetTempFileName()
Set-Content -Path $tmp -Value $pyCode -Encoding UTF8
python $tmp
Remove-Item $tmp

# Kaggle datasets (resolve CLI robustly)
function Resolve-KaggleCLI {
    try {
        $cmd = Get-Command kaggle -ErrorAction SilentlyContinue
        if ($cmd) { return $cmd.Source }
    } catch {}
    $candidates = @()
    if ($env:APPDATA) {
        $pyRoot = Join-Path $env:APPDATA 'Python'
        $candidates += Get-ChildItem -Path $pyRoot -Directory -ErrorAction SilentlyContinue | ForEach-Object { Join-Path $_.FullName 'Scripts\kaggle.exe' }
    }
    if ($env:LOCALAPPDATA) {
        $pyLocal = Join-Path $env:LOCALAPPDATA 'Programs\Python'
        $candidates += Get-ChildItem -Path $pyLocal -Directory -ErrorAction SilentlyContinue | ForEach-Object { Join-Path $_.FullName 'Scripts\kaggle.exe' }
    }
    foreach ($cand in $candidates) { if (Test-Path $cand) { return $cand } }
    return $null
}
$kaggleCmd = Resolve-KaggleCLI
if (-not $kaggleCmd) { $kaggleCmd = 'kaggle' }
Write-Host "Using Kaggle CLI: $kaggleCmd"
$kaggle = @(
    @{ k='deepcontractor/2-million-reddit-comments'; p='./datasets/language/reddit-comments' },
    @{ k='quora-question-pairs'; p='./datasets/language/quora-question-pairs' }
)
foreach ($d in $kaggle) {
    & $kaggleCmd datasets download -d $d.k -p $d.p --unzip
}

# Direct downloads
# Cornell Movie Dialogs Corpus
Invoke-WebRequest -Uri 'https://www.cs.cornell.edu/~cristian/data/cornell_movie_dialogs_corpus.zip' -OutFile './datasets/language/movie-dialogs.zip'
Expand-Archive -Path './datasets/language/movie-dialogs.zip' -DestinationPath './datasets/language/movie-dialogs' -Force
Remove-Item './datasets/language/movie-dialogs.zip'

# Manual directories for future content
New-Item -ItemType Directory -Force -Path ./datasets/language/awesome-lists | Out-Null
New-Item -ItemType Directory -Force -Path ./datasets/language/gutenberg-books | Out-Null

# GitHub repositories for awesome lists (optional)
$github = @(
    @{ repo='https://github.com/sindresorhus/awesome.git'; path='./datasets/language/awesome-lists/awesome' },
    @{ repo='https://github.com/vinta/awesome-python.git'; path='./datasets/language/awesome-lists/awesome-python' }
)
foreach ($g in $github) {
    if (!(Test-Path $g.path)) {
        git clone $g.repo $g.path
    }
}

Write-Host "✅ Category D: Language, Conversation & General Knowledge datasets downloaded successfully!"
