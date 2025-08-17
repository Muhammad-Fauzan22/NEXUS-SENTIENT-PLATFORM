# Category B: CV/Skills/Industry datasets (25)
New-Item -ItemType Directory -Force -Path ./datasets/skills | Out-Null

function Has-KaggleCred { Test-Path "$env:USERPROFILE\.kaggle\kaggle.json" }

# Resolve Kaggle CLI (robust)
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
  @{ k='ravishah1/job-description-dataset'; p='./datasets/skills/job-descriptions' },
  @{ k='stackoverflow/stack-overflow-developer-survey-2023'; p='./datasets/skills/so-survey-2023' },
  @{ k='asaniczka/data-science-job-postings'; p='./datasets/skills/ds-jobs' },
  @{ k='arshkon/linkedin-job-postings'; p='./datasets/skills/linkedin-jobs' },
  @{ k='arashnic/hr-analytics-job-change-of-data-scientists'; p='./datasets/skills/hr-analytics-job-change' },
  @{ k='peopledatalack/indeedcom-job-postings'; p='./datasets/skills/indeed-jobs' },
  @{ k='snapcrack/all-the-news'; p='./datasets/skills/tech-news' },
  @{ k='pelmers/github-repository-metadata-with-5-stars'; p='./datasets/skills/github-repos' },
  @{ k='wcukierski/enron-email-dataset'; p='./datasets/skills/enron-emails' },
  @{ k='ayushggarg/salary-prediction-dataset'; p='./datasets/skills/salary-prediction' }
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

# Hugging Face (idempotent via temp python file)
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

save_if_missing('./datasets/skills/hf-resume-ner', 'finetune/resume-entities-for-ner')
save_if_missing('./datasets/skills/hf-techcrunch', 'techcrunch')
'@
$tmp = [System.IO.Path]::GetTempFileName()
Set-Content -Path $tmp -Value $pyCode -Encoding UTF8
python $tmp
Remove-Item $tmp

# O*NET (idempotent)
$onetZip = './datasets/skills/onet_db.zip'
if (Test-Path $onetZip) {
  Write-Host "SKIP O*NET (exists): $onetZip"
} else {
  Write-Host "DOWNLOADING O*NET -> $onetZip"
  Invoke-WebRequest -Uri 'https://www.onetcenter.org/dl_files/database/db_28_2_text.zip' -OutFile $onetZip
}

# GitHub repos (optional)
if (!(Test-Path './datasets/skills/skill-ner')) { git clone https://github.com/AnasAito/SkillNER.git ./datasets/skills/skill-ner }
if (!(Test-Path './datasets/skills/resume-parsing')) { git clone https://github.com/Abhishek-10/Resume-Parsing.git ./datasets/skills/resume-parsing }
if (!(Test-Path './datasets/skills/project-proposals')) { git clone https://github.com/template-examples/project-proposals.git ./datasets/skills/project-proposals }
if (!(Test-Path './datasets/skills/performance-reviews')) { git clone https://github.com/feedback-data/performance-reviews.git ./datasets/skills/performance-reviews }
