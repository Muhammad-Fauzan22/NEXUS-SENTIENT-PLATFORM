# Category A: Psychometric datasets (25)
New-Item -ItemType Directory -Force -Path ./datasets/psychometric | Out-Null

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

$datasets = @(
  @{ k='tunguz/big-five-personality-test'; p='./datasets/psychometric/big-five' },
  @{ k='hafiznouman786/student-mental-health'; p='./datasets/psychometric/student-mental-health' },
  @{ k='datasnaek/mbti-type'; p='./datasets/psychometric/mbti-type' },
  @{ k='lucasgreenwell/depression-anxiety-stress-scales-responses'; p='./datasets/psychometric/dass-responses' },
  @{ k='itsmesunil/student-learning-factors'; p='./datasets/psychometric/learning-factors' },
  @{ k='soondu/holland-codes-riasec-career-test'; p='./datasets/psychometric/riasec-test' },
  @{ k='kaushiksuresh147/emotional-intelligence-dataset'; p='./datasets/psychometric/eq-dataset' },
  @{ k='samyakb/whats-on-the-minds-of-students'; p='./datasets/psychometric/student-minds' },
  @{ k='aymanlafaz/grit-mindset-and-academic-success'; p='./datasets/psychometric/grit-mindset' },
  @{ k='marvdas/student-stress-factors-a-comprehensive-dataset'; p='./datasets/psychometric/stress-factors' },
  @{ k='ruchi798/loneliness-dataset'; p='./datasets/psychometric/loneliness' },
  @{ k='rabieelkharoua/procrastination-and-online-learning'; p='./datasets/psychometric/procrastination' },
  @{ k='daniilsaltanov/survey-on-student-engagement'; p='./datasets/psychometric/student-engagement' },
  @{ k='rkiattisak/student-understanding-in-class'; p='./datasets/psychometric/time-management' },
  @{ k='hiraahmed/social-connectedness-and-wellbeing-among-students'; p='./datasets/psychometric/social-connectedness' },
  @{ k='ahmedfatma/interpersonal-competence-questionnaire'; p='./datasets/psychometric/interpersonal-competence' },
  @{ k='muhammadtalharasool/leadership-style-questionnaire'; p='./datasets/psychometric/leadership-style' },
  @{ k='whenamI/student-motivation-and-engagement'; p='./datasets/psychometric/motivation-engagement' },
  @{ k='kulturehire/understanding-student-stress-and-support'; p='./datasets/psychometric/social-support' },
  @{ k='romilsuthar/academic-motivation-scale'; p='./datasets/psychometric/academic-motivation' },
  @{ k='ipip-ori/hexaco'; p='./datasets/psychometric/hexaco' }
)

foreach ($d in $datasets) {
  $hasFiles = (Test-Path $d.p) -and ((Get-ChildItem -Path $d.p -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count -gt 0)
  if ($hasFiles) {
    Write-Host "SKIP Kaggle dataset (exists): $($d.k) -> $($d.p)"
  } else {
    Write-Host "DOWNLOADING Kaggle dataset: $($d.k) -> $($d.p)"
    & $kaggleCmd datasets download -d $d.k -p $d.p --unzip
  }
}

# Direct downloads (OpenPsychometrics) - optional, continue on failure
$urls = @(
  @{u='https://openpsychometrics.org/_rawdata/RSES.zip'; o='./datasets/psychometric/self-esteem.zip'},
  @{u='https://openpsychometrics.org/_rawdata/VIA.zip'; o='./datasets/psychometric/character-strengths.zip'},
  @{u='https://openpsychometrics.org/_rawdata/CRT.zip'; o='./datasets/psychometric/cognitive-reflection.zip'}
)
foreach ($it in $urls) {
  if (Test-Path $it.o) {
    Write-Host "SKIP direct download (exists): $($it.o)"
    continue
  }
  try {
    Write-Host "DOWNLOADING direct: $($it.u) -> $($it.o)"
    Invoke-WebRequest -Uri $it.u -OutFile $it.o -ErrorAction Stop
  } catch { Write-Host "WARN: failed to fetch $($it.u) - $_" }
}

# GitHub (Team Roles Belbin - simulated) - optional
if (!(Test-Path './datasets/psychometric/team-roles')) {
  try { git clone https://github.com/typology/belbin-test-data-simulated.git ./datasets/psychometric/team-roles } catch { Write-Host "WARN: failed to clone belbin repo - $_" }
}

Write-Host "✅ Category A: Psychometric datasets downloaded (best-effort)"