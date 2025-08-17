# Category B: CV/Skills/Industry datasets (25)
New-Item -ItemType Directory -Force -Path ./datasets/skills | Out-Null

# Resolve Kaggle CLI
$kaggleCmd = Join-Path $env:APPDATA 'Python\Python313\Scripts\kaggle.exe'
if (!(Test-Path $kaggleCmd)) { $kaggleCmd = 'kaggle' }

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

foreach ($d in $kaggle) { & $kaggleCmd datasets download -d $d.k -p $d.p --unzip }

# Hugging Face (run via temp python file for Windows PowerShell)
$pyCode = @'
from datasets import load_dataset
load_dataset('finetune/resume-entities-for-ner').save_to_disk('./datasets/skills/hf-resume-ner')
load_dataset('techcrunch').save_to_disk('./datasets/skills/hf-techcrunch')
'@
$tmp = [System.IO.Path]::GetTempFileName()
Set-Content -Path $tmp -Value $pyCode -Encoding UTF8
python $tmp
Remove-Item $tmp

# O*NET
Invoke-WebRequest -Uri 'https://www.onetcenter.org/dl_files/database/db_28_2_text.zip' -OutFile './datasets/skills/onet_db.zip'

# GitHub repos (optional)
if (!(Test-Path './datasets/skills/skill-ner')) { git clone https://github.com/AnasAito/SkillNER.git ./datasets/skills/skill-ner }
if (!(Test-Path './datasets/skills/resume-parsing')) { git clone https://github.com/Abhishek-10/Resume-Parsing.git ./datasets/skills/resume-parsing }
if (!(Test-Path './datasets/skills/project-proposals')) { git clone https://github.com/template-examples/project-proposals.git ./datasets/skills/project-proposals }
if (!(Test-Path './datasets/skills/performance-reviews')) { git clone https://github.com/feedback-data/performance-reviews.git ./datasets/skills/performance-reviews }
