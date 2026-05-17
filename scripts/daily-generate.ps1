# Daily article generation + auto-deploy
# Scheduled via Windows Task Scheduler

$ErrorActionPreference = "Continue"
$logFile = "C:\base44site\scripts\generate.log"

function Log($msg) {
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$ts $msg" | Tee-Object -FilePath $logFile -Append
}

Log "=== Daily generation started ==="

# Count articles before
$before = (Get-ChildItem C:\base44site\content\articles -Filter "*.json" | Where-Object {
    $j = Get-Content $_.FullName | ConvertFrom-Json
    -not $j.error
} | Measure-Object).Count

Log "Articles before: $before"

# Run generation
Set-Location C:\base44site
# Key stored in C:\base44site\.env.local — never commit that file
$envFile = "C:\base44site\.env.local"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^GROQ_API_KEY=(.+)") { $env:GROQ_API_KEY = $matches[1] }
        if ($_ -match "^CEREBRAS_API_KEY=(.+)") { $env:CEREBRAS_API_KEY = $matches[1] }
    }
}
if (-not $env:GROQ_API_KEY -and -not $env:CEREBRAS_API_KEY) { Log "ERROR: No API keys set"; exit 1 }

# Delete any existing error files so they get retried
Get-ChildItem C:\base44site\content\articles -Filter "*.json" | ForEach-Object {
    $j = Get-Content $_.FullName | ConvertFrom-Json
    if ($j.error) { Remove-Item $_.FullName }
}

npm run generate 2>&1 | Tee-Object -FilePath $logFile -Append

# Count articles after
$after = (Get-ChildItem C:\base44site\content\articles -Filter "*.json" | Where-Object {
    $j = Get-Content $_.FullName | ConvertFrom-Json
    -not $j.error
} | Measure-Object).Count

$added = $after - $before
Log "Articles after: $after (added $added today)"

# Git commit and push if new articles were added
if ($added -gt 0) {
    git add content/articles
    git commit -m "Daily auto-generate: +$added articles ($after total)"
    git push
    Log "Pushed to GitHub - Vercel redeploying"
} else {
    Log "No new articles - skipping push"
}

Log "=== Done ==="
