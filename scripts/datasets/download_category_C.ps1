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
    & $kaggleCmd datasets download -d $d.k -p $d.p --unzip
}

# UCI ML Repository datasets
Invoke-WebRequest -Uri 'https://archive.ics.uci.edu/static/public/320/student+performance.zip' -OutFile './datasets/academic/student_performance.zip'
Expand-Archive -Path './datasets/academic/student_performance.zip' -DestinationPath './datasets/academic/student-performance' -Force
Remove-Item './datasets/academic/student_performance.zip'

# Hugging Face datasets (via temp python file)
$pyCode = @'
from datasets import load_dataset

# Academic Advising Dataset
load_dataset("TIGER-Lab/Academic-Advising-Dataset").save_to_disk("./datasets/academic/hf-academic-advising")

# Research Paper Summarization
load_dataset("billsum").save_to_disk("./datasets/academic/hf-summarization")

# Resume NER
load_dataset("finetune/resume-entities-for-ner").save_to_disk("./datasets/academic/hf-resume-ner")
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
    if (!(Test-Path $g.path)) {
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