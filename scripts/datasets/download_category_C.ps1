# Category C: Education, Academic & Career datasets (25)
# Pendidikan, Akademik & Karier - 25 Dataset Sempurna
New-Item -ItemType Directory -Force -Path ./datasets/academic | Out-Null

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

# Kaggle datasets
$kaggle = @(
    @{ k='siddharthm1698/coursera-course-dataset'; p='./datasets/academic/coursera-courses' },
    @{ k='Cornell-University/arxiv'; p='./datasets/academic/arxiv' },
    @{ k='miguelcorraljr/ted-ultimate-dataset'; p='./datasets/academic/ted-talks' },
    @{ k='jilkothari/udemy-courses'; p='./datasets/academic/udemy-courses' },
    @{ k='suryansh23/student-grades-prediction'; p='./datasets/academic/grades-prediction' },
    @{ k='jplagare/khan-academy-videos-and-topic-trees'; p='./datasets/academic/khan-academy' },
    @{ k='akshayithape/university-admission-prediction'; p='./datasets/academic/admission-prediction' },
    @{ k='thedevastator/higher-education-predictors-of-student-retention'; p='./datasets/academic/student-dropout' },
    @{ k='mohansacharya/graduate-admissions'; p='./datasets/academic/grad-admissions' },
    @{ k='primaryobjects/voice-of-the-student-evaluation-of-courses'; p='./datasets/academic/course-feedback' },
    @{ k='mishra5001/online-learning-platforms-review'; p='./datasets/academic/platform-reviews' },
    @{ k='rabieelkharoua/students-performance-dataset'; p='./datasets/academic/study-hours' }
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

# UCI ML Repository datasets
$uciZip = './datasets/academic/student_performance.zip'
$uciDst = './datasets/academic/student-performance'
$uciHasFiles = (Test-Path $uciDst) -and ((Get-ChildItem -Path $uciDst -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count -gt 0)
if ($uciHasFiles) {
    Write-Host "SKIP UCI student performance (exists): $uciDst"
} else {
    if (!(Test-Path $uciZip)) {
        Write-Host "DOWNLOADING UCI student performance zip -> $uciZip"
        Invoke-WebRequest -Uri 'https://archive.ics.uci.edu/static/public/320/student+performance.zip' -OutFile $uciZip
    } else {
        Write-Host "FOUND existing zip: $uciZip"
    }
    try { Expand-Archive -Path $uciZip -DestinationPath $uciDst -Force } catch { Write-Host "WARN: failed to extract UCI - $_" }
    if (Test-Path $uciZip) { Remove-Item $uciZip }
}

# Hugging Face datasets (via temp python file)
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

# Academic Advising Dataset
save_if_missing("./datasets/academic/hf-academic-advising", "TIGER-Lab/Academic-Advising-Dataset")

# Research Paper Summarization
save_if_missing("./datasets/academic/hf-summarization", "billsum")

# Resume NER
save_if_missing("./datasets/academic/hf-resume-ner", "finetune/resume-entities-for-ner")
'@
$tmp = [System.IO.Path]::GetTempFileName()
Set-Content -Path $tmp -Value $pyCode -Encoding UTF8
python $tmp
Remove-Item $tmp

# GitHub repositories (optional)
$github = @(
    @{ repo='https://github.com/template-examples/project-proposals.git'; path='./datasets/academic/project-proposals' },
    @{ repo='https://github.com/dialog-data/mentoring-conversations.git'; path='./datasets/academic/mentoring-logs' },
    @{ repo='https://github.com/career-paths/alumni-trajectories.git'; path='./datasets/academic/alumni-trajectories' },
    @{ repo='https://github.com/syllabi/syllabi-parser-data.git'; path='./datasets/academic/syllabus-data' }
)

foreach ($g in $github) {
    if (Test-Path $g.path) {
        Write-Host "SKIP Git repo (exists): $($g.path)"
    } else {
        git clone $g.repo $g.path
    }
}

# Manual placeholders
New-Item -ItemType Directory -Force -Path ./datasets/academic/mit-ocw | Out-Null
New-Item -ItemType Directory -Force -Path ./datasets/academic/openstax-textbooks | Out-Null
New-Item -ItemType Directory -Force -Path ./datasets/academic/professional-certifications | Out-Null
New-Item -ItemType Directory -Force -Path ./datasets/academic/conferences | Out-Null
New-Item -ItemType Directory -Force -Path ./datasets/academic/scholarships | Out-Null

Write-Host "✅ Category C: Education, Academic & Career datasets downloaded (best-effort)"