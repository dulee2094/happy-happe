# Copy project files to cloned repository
# UTF-8 encoding to avoid Korean character issues

Write-Host "=== File Copy Script ===" -ForegroundColor Green
Write-Host ""

# Get cloned repository path
Write-Host "Enter the path where you cloned the repository in GitHub Desktop" -ForegroundColor Cyan
Write-Host "Example: C:\Users\SAMSUNG\Desktop\settlement33" -ForegroundColor Gray
Write-Host ""
$clonedPath = Read-Host "Cloned repository path"

# Validate path
if (-not (Test-Path $clonedPath)) {
    Write-Host "ERROR: Path not found: $clonedPath" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

# Check .git folder
if (-not (Test-Path "$clonedPath\.git")) {
    Write-Host "ERROR: Not a Git repository. .git folder not found." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

Write-Host ""
Write-Host "Repository confirmed: $clonedPath" -ForegroundColor Green
Write-Host ""

# Current project path
$sourcePath = Get-Location

Write-Host "Source: $sourcePath" -ForegroundColor White
Write-Host "Target: $clonedPath" -ForegroundColor White
Write-Host ""

# Items to exclude
$excludeItems = @(
    "node_modules",
    "database.sqlite",
    ".env",
    "deploy",
    ".DS_Store",
    "*.log",
    ".vscode",
    ".idea",
    ".git",
    "*.zip",
    "*.ps1",
    "GITHUB_DESKTOP_GUIDE.md"
)

Write-Host "Excluded items:" -ForegroundColor Yellow
$excludeItems | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
Write-Host ""

$confirm = Read-Host "Continue? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "Cancelled." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit
}

Write-Host ""
Write-Host "Copying files..." -ForegroundColor Yellow
Write-Host ""

# Delete existing files in cloned repo (except .git)
Write-Host "Deleting existing files..." -ForegroundColor Yellow
Get-ChildItem -Path $clonedPath -Recurse -Force | Where-Object {
    $_.FullName -notlike "*\.git\*" -and $_.Name -ne ".git"
} | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Existing files deleted" -ForegroundColor Green
Write-Host ""

# Copy files
$copiedCount = 0
Get-ChildItem -Path $sourcePath -Recurse -Force | Where-Object {
    $item = $_
    $shouldExclude = $false
    
    foreach ($exclude in $excludeItems) {
        if ($item.FullName -like "*\$exclude\*" -or $item.Name -like $exclude) {
            $shouldExclude = $true
            break
        }
    }
    
    -not $shouldExclude
} | ForEach-Object {
    $relativePath = $_.FullName.Substring($sourcePath.Path.Length + 1)
    $destPath = Join-Path $clonedPath $relativePath
    
    if ($_.PSIsContainer) {
        if (-not (Test-Path $destPath)) {
            New-Item -ItemType Directory -Path $destPath -Force | Out-Null
        }
    } else {
        $destDir = Split-Path $destPath -Parent
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        Copy-Item $_.FullName -Destination $destPath -Force
        Write-Host "Copied: $relativePath" -ForegroundColor Gray
        $copiedCount++
    }
}

Write-Host ""
Write-Host "=== COMPLETE! ===" -ForegroundColor Green
Write-Host "Total $copiedCount files copied" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Go back to GitHub Desktop" -ForegroundColor White
Write-Host "2. Check changes (left panel)" -ForegroundColor White
Write-Host "3. Verify models/ folder is included!" -ForegroundColor White
Write-Host "4. Enter commit message in Summary:" -ForegroundColor White
Write-Host "   'Fix: Render deployment - module path fix'" -ForegroundColor Cyan
Write-Host "5. Click 'Commit to main'" -ForegroundColor White
Write-Host "6. Click 'Push origin'" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANT: Verify all files in models/ folder are included!" -ForegroundColor Red
Write-Host ""

Read-Host "Press Enter to exit"
