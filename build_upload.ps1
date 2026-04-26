$src  = $PSScriptRoot
$dest = Join-Path $PSScriptRoot "GITHUB_UPLOAD"

Write-Host "=== Rebuilding GITHUB_UPLOAD ===" -ForegroundColor Cyan

if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
mkdir $dest -Force | Out-Null

function CopyFile($rel) {
    $s = Join-Path $src $rel
    $d = Join-Path $dest $rel
    $dir = Split-Path $d -Parent
    if (-not (Test-Path -LiteralPath $dir)) { mkdir $dir -Force | Out-Null }
    if (Test-Path -LiteralPath $s) { Copy-Item -LiteralPath $s -Destination $d -Force; Write-Host "  [OK] $rel" }
    else { Write-Host "  [SKIP] $rel" -ForegroundColor DarkGray }
}

function CopyDir($rel) {
    $s = Join-Path $src $rel
    $d = Join-Path $dest $rel
    if (Test-Path -LiteralPath $s) {
        if (-not (Test-Path -LiteralPath (Split-Path $d -Parent))) { mkdir (Split-Path $d -Parent) -Force | Out-Null }
        Copy-Item -Recurse -Force -LiteralPath $s -Destination $d
        Write-Host "  [DIR] $rel"
    } else { Write-Host "  [SKIP-DIR] $rel" -ForegroundColor DarkGray }
}

# Root config
Write-Host "`n[Root Config]" -ForegroundColor Cyan
CopyFile "package.json"
CopyFile "server.js"
CopyFile "render.yaml"
CopyFile ".npmrc"

# HTML
Write-Host "`n[HTML Pages]" -ForegroundColor Cyan
CopyFile "index.html"
CopyFile "login.html"
CopyFile "signup.html"
CopyFile "dashboard.html"
CopyFile "room.html"
CopyFile "admin.html"
CopyFile "invite.html"
CopyFile "agreement.html"
CopyFile "privacy.html"

# Root JS
Write-Host "`n[Root JS]" -ForegroundColor Cyan
CopyFile "dashboard.js"
CopyFile "dashboard_notification_logic.js"
CopyFile "case_proposal.js"
CopyFile "agreement.js"
CopyFile "app.js"

# CSS
Write-Host "`n[CSS]" -ForegroundColor Cyan
CopyFile "style.css"
CopyFile "agreement.css"
CopyDir  "css"

# Backend
Write-Host "`n[Backend]" -ForegroundColor Cyan
CopyDir "config"
CopyDir "models"
CopyDir "routes"
CopyDir "controllers"

# Frontend JS
Write-Host "`n[js/ folder]" -ForegroundColor Cyan
$jsFiles = @(
    "js\blind_proposal.js",
    "js\dashboard_view.js",
    "js\case_detail_api.js",
    "js\case_detail_view.js",
    "js\case_detail_agreement_view.js",
    "js\modules\proposal_api.js",
    "js\modules\proposal_debug.js",
    "js\modules\proposal_handler.js",
    "js\modules\proposal_state.js",
    "js\modules\proposal_ui.js",
    "js\modules\signature_pad.js",
    "js\views\case_overview.js",
    "js\\views\case_analysis.js",
    "js\\views\case_lawyer.js",
    "js\\views\case_tabs.js"
)
foreach ($f in $jsFiles) { CopyFile $f }

# Images
Write-Host "`n[Images]" -ForegroundColor Cyan
CopyDir "images"

# .gitignore
$gi = @"
node_modules/
.env
.env.*
database.sqlite
*.sqlite
*.sqlite3
*.log
npm-debug.log*
.DS_Store
Thumbs.db
tests/
test-results/
playwright-report/
playwright.config.js
*.bak
*.old
"@
Out-File -FilePath (Join-Path $dest ".gitignore") -InputObject $gi -Encoding utf8
Write-Host "  [OK] .gitignore"

$count = (Get-ChildItem -Recurse -File $dest).Count
Write-Host "`n=== Done: $count files in GITHUB_UPLOAD ===" -ForegroundColor Green
