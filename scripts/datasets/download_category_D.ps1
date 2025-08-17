# Category D: Language, Conversation & General Knowledge datasets (25)
# Bahasa, Percakapan & Pengetahuan Umum - 25 Dataset Sempurna
New-Item -ItemType Directory -Force -Path ./datasets/language | Out-Null

# Hugging Face datasets (streaming and local) via temp python file
$pyCode = @'
import os
from datasets import load_dataset

def save_if_missing(path, *args, **kwargs):
    if os.path.exists(path):
        print(f"SKIP: {path} exists")
        return
    print(f"DOWNLOADING: {args[0]} -> {path}")
    ds = load_dataset(*args, **kwargs)
    ds.save_to_disk(path)

# The Pile (streaming only, no save)
try:
    load_dataset("eleutherai/the_pile", "all", split="train", streaming=True)
except Exception as e:
    print(f"WARN: the_pile streaming failed: {e}")

# SQuAD (Stanford Q&A)
save_if_missing("./datasets/language/squad", "squad")

# Wikipedia English (FULL)
save_if_missing("./datasets/language/wikipedia-full", "wikipedia", "20220301.en", split="train")

# Anthropic HH-RLHF
save_if_missing("./datasets/language/anthropic-hh-rlhf", "Anthropic/hh-rlhf")

# Dolly 15k (Instruction Following)
save_if_missing("./datasets/language/dolly-15k", "databricks/databricks-dolly-15k")

# OpenWebText
save_if_missing("./datasets/language/openwebtext", "openwebtext")

# Multi-News (Summarization)
save_if_missing("./datasets/language/multi-news", "multi_news")

# ELI5 (Explain Like I'm 5)
save_if_missing("./datasets/language/eli5", "eli5")

# BookCorpus
save_if_missing("./datasets/language/bookcorpus", "bookcorpus")

# CodeSearchNet
save_if_missing("./datasets/language/codesearchnet", "code_search_net", "all")

# CNN/Daily Mail (Summarization)
save_if_missing("./datasets/language/cnn-dailymail", "cnn_dailymail", "3.0.0")

# LAMBADA (Language Modeling)
save_if_missing("./datasets/language/lambada", "lambada")

# GLUE Benchmark (MRPC)
save_if_missing("./datasets/language/glue-mrpc", "glue", "mrpc")

# WikiText
save_if_missing("./datasets/language/wikitext", "wikitext", "wikitext-103-v1")

# DailyDialog
save_if_missing("./datasets/language/daily-dialog", "daily_dialog")

# Commonsense QA
save_if_missing("./datasets/language/commonsense-qa", "commonsense_qa")

# Natural Questions (FULL)
save_if_missing("./datasets/language/natural-questions-full", "natural_questions", split="train")

# Story Cloze Test
save_if_missing("./datasets/language/story-cloze", "story_cloze", "2016")

# Code Alpaca (Instruction Following)
save_if_missing("./datasets/language/code-alpaca", "sahil2801/CodeAlpaca-20k")
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
    $hasFiles = (Test-Path $d.p) -and ((Get-ChildItem -Path $d.p -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count -gt 0)
    if ($hasFiles) {
        Write-Host "SKIP Kaggle dataset (exists): $($d.k) -> $($d.p)"
    } else {
        Write-Host "DOWNLOADING Kaggle dataset: $($d.k) -> $($d.p)"
        & $kaggleCmd datasets download -d $d.k -p $d.p --unzip
    }
}

# Direct downloads
# Cornell Movie Dialogs Corpus (idempotent)
$zip = './datasets/language/movie-dialogs.zip'
$dst = './datasets/language/movie-dialogs'
$dstHasFiles = (Test-Path $dst) -and ((Get-ChildItem -Path $dst -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count -gt 0)
if ($dstHasFiles) {
    Write-Host "SKIP Movie Dialogs (exists): $dst"
} else {
    if (!(Test-Path $zip)) {
        Write-Host "DOWNLOADING Movie Dialogs zip -> $zip"
        Invoke-WebRequest -Uri 'https://www.cs.cornell.edu/~cristian/data/cornell_movie_dialogs_corpus.zip' -OutFile $zip
    } else {
        Write-Host "FOUND existing zip: $zip"
    }
    try {
        Expand-Archive -Path $zip -DestinationPath $dst -Force
    } catch { Write-Host "WARN: failed to extract Movie Dialogs - $_" }
    if (Test-Path $zip) { Remove-Item $zip }
}

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
