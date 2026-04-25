# Fully automated GitHub deployment script
# This script will clone the repo and copy files automatically

Write-Host "=== Automated GitHub Deployment ===" -ForegroundColor Green
Write-Host ""

# Configuration
$repoUrl = "https://github.com/dulee2094/settlement33.git"
$repoName = "settlement33"
$defaultClonePath = "C:\Users\SAMSUNG\Documents\GitHub\$repoName"

# Check if GitHub Desktop is installed
$githubDesktopPath = "$env:LOCALAPPDATA\GitHubDesktop\GitHubDesktop.exe"
if (Test-Path $githubDesktopPath) {
    Write-Host "GitHub Desktop found: $githubDesktopPath" -ForegroundColor Green
} else {
    Write-Host "GitHub Desktop not found at default location" -ForegroundColor Yellow
}

# Check if git command is available (GitHub Desktop includes git)
$gitPaths = @(
    "$env:LOCALAPPDATA\GitHubDesktop\app-*\resources\app\git\cmd\git.exe",
    "C:\Program Files\Git\cmd\git.exe",
    "C:\Program Files (x86)\Git\cmd\git.exe"
)

$gitExe = $null
foreach ($path in $gitPaths) {
    $found = Get-ChildItem -Path (Split-Path $path -Parent) -Filter "git.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) {
        $gitExe = $found.FullName
        break
    }
}

if (-not $gitExe) {
    # Try to find git in PATH
    $gitExe = (Get-Command git -ErrorAction SilentlyContinue).Source
}

if (-not $gitExe) {
    Write-Host "ERROR: Git not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please do one of the following:" -ForegroundColor Yellow
    Write-Host "1. Open GitHub Desktop and clone the repository manually:" -ForegroundColor White
    Write-Host "   - File > Clone Repository" -ForegroundColor Gray
    Write-Host "   - URL: $repoUrl" -ForegroundColor Gray
    Write-Host "   - Then run this script again" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Or install Git from: https://git-scm.com/download/win" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit
}

Write-Host "Git found: $gitExe" -ForegroundColor Green
Write-Host ""

# Determine clone path
$clonePath = $defaultClonePath
if (Test-Path $clonePath) {
    Write-Host "Repository already exists at: $clonePath" -ForegroundColor Yellow
    $useExisting = Read-Host "Use existing repository? (y/n)"
    if ($useExisting -ne 'y') {
        $clonePath = Read-Host "Enter new clone path"
    }
} else {
    Write-Host "Repository will be cloned to: $clonePath" -ForegroundColor Cyan
    $confirm = Read-Host "Continue? (y/n)"
    if ($confirm -ne 'y') {
        $clonePath = Read-Host "Enter clone path"
    }
}

Write-Host ""

# Clone repository if it doesn't exist
if (-not (Test-Path "$clonePath\.git")) {
    Write-Host "Cloning repository..." -ForegroundColor Yellow
    
    # Create parent directory if needed
    $parentDir = Split-Path $clonePath -Parent
    if (-not (Test-Path $parentDir)) {
        New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
    }
    
    # Clone
    & $gitExe clone $repoUrl $clonePath
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to clone repository" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit
    }
    
    Write-Host "Repository cloned successfully!" -ForegroundColor Green
} else {
    Write-Host "Repository already exists, pulling latest changes..." -ForegroundColor Yellow
    Push-Location $clonePath
    & $gitExe pull
    Pop-Location
    Write-Host "Repository updated!" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Copying Files ===" -ForegroundColor Cyan
Write-Host ""

# Current project path
$sourcePath = Get-Location

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

Write-Host "Source: $sourcePath" -ForegroundColor White
Write-Host "Target: $clonePath" -ForegroundColor White
Write-Host ""

# Delete existing files in cloned repo (except .git)
Write-Host "Cleaning target directory..." -ForegroundColor Yellow
Get-ChildItem -Path $clonePath -Recurse -Force | Where-Object {
    $_.FullName -notlike "*\.git\*" -and $_.Name -ne ".git"
} | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Target directory cleaned" -ForegroundColor Green
Write-Host ""

# Copy files
Write-Host "Copying files..." -ForegroundColor Yellow
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
    $destPath = Join-Path $clonePath $relativePath
    
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
        $copiedCount++
        if ($copiedCount % 10 -eq 0) {
            Write-Host "  Copied $copiedCount files..." -ForegroundColor Gray
        }
    }
}

Write-Host ""
Write-Host "Total $copiedCount files copied" -ForegroundColor Green
Write-Host ""

# Verify models folder
if (Test-Path "$clonePath\models\index.js") {
    Write-Host "VERIFIED: models/index.js exists" -ForegroundColor Green
} else {
    Write-Host "WARNING: models/index.js NOT FOUND!" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Git Commit and Push ===" -ForegroundColor Cyan
Write-Host ""

Push-Location $clonePath

# Configure git user if not set
$userName = & $gitExe config user.name
if (-not $userName) {
    Write-Host "Setting git user name..." -ForegroundColor Yellow
    & $gitExe config user.name "dulee2094"
}

$userEmail = & $gitExe config user.email
if (-not $userEmail) {
    Write-Host "Setting git user email..." -ForegroundColor Yellow
    & $gitExe config user.email "dulee2094@users.noreply.github.com"
}

# Add all files
Write-Host "Adding files to git..." -ForegroundColor Yellow
& $gitExe add .

# Check if there are changes
$status = & $gitExe status --porcelain
if (-not $status) {
    Write-Host "No changes to commit" -ForegroundColor Yellow
    Pop-Location
    Write-Host ""
    Write-Host "Repository is already up to date!" -ForegroundColor Green
    Read-Host "Press Enter to exit"
    exit
}

# Commit
Write-Host "Committing changes..." -ForegroundColor Yellow
& $gitExe commit -m "Fix: Render deployment - module path fix and configuration improvements"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Commit failed" -ForegroundColor Red
    Pop-Location
    Read-Host "Press Enter to exit"
    exit
}

Write-Host "Commit successful!" -ForegroundColor Green
Write-Host ""

# Push
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "You may need to authenticate with GitHub..." -ForegroundColor Cyan
Write-Host ""

& $gitExe push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Push failed. Trying 'master' branch..." -ForegroundColor Yellow
    & $gitExe push origin master
}

Pop-Location

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== SUCCESS! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Files have been pushed to GitHub!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Go to Render dashboard: https://dashboard.render.com/" -ForegroundColor White
    Write-Host "2. Your service should auto-deploy, or click 'Manual Deploy'" -ForegroundColor White
    Write-Host "3. Check deployment logs" -ForegroundColor White
    Write-Host ""
    Write-Host "The 'Cannot find module' error should now be fixed!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "=== PUSH FAILED ===" -ForegroundColor Red
    Write-Host ""
    Write-Host "The files are committed locally but not pushed to GitHub." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To push manually:" -ForegroundColor Cyan
    Write-Host "1. Open GitHub Desktop" -ForegroundColor White
    Write-Host "2. Select the repository: $repoName" -ForegroundColor White
    Write-Host "3. Click 'Push origin'" -ForegroundColor White
    Write-Host ""
    Write-Host "Or authenticate git and run:" -ForegroundColor Cyan
    Write-Host "  cd $clonePath" -ForegroundColor White
    Write-Host "  git push origin main" -ForegroundColor White
}

Write-Host ""
Read-Host "Press Enter to exit"
