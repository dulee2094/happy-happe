param (
    [int]$Minutes = 4320,
    [switch]$Clean
)

$sourceDir = Get-Location
$patchDir = Join-Path $sourceDir "GITHUB_PATCH"

# Clean patch dir if requested
if ($Clean -and (Test-Path $patchDir)) { 
    Remove-Item -Path $patchDir -Recurse -Force 
    Write-Host "Cleaned existing patch directory." -ForegroundColor Yellow
}

if (-not (Test-Path $patchDir)) {
    New-Item -Path $patchDir -ItemType Directory | Out-Null
}

# Exclude list
$exclude = @("node_modules", ".git", "GITHUB_PATCH", "GITHUB_UPLOAD", "dist", ".vscode", "package-lock.json", ".DS_Store", "create_patch_recent.ps1")

$cutoff = (Get-Date).AddMinutes(-$Minutes)

Write-Host "=== Creating Patch for files modified in the last $Minutes minutes ===" -ForegroundColor Cyan

$files = Get-ChildItem -Path $sourceDir -Recurse -File | Where-Object {
    $_.LastWriteTime -gt $cutoff
}

$count = 0

foreach ($file in $files) {
    $relativePath = $file.FullName.Substring($sourceDir.Path.Length + 1)
    
    # Check exclusions
    $shouldExclude = $false
    foreach ($ex in $exclude) {
        if ($relativePath -match "^$ex" -or $relativePath -match "\\$ex\\") {
            $shouldExclude = $true
            break
        }
    }
    
    if (-not $shouldExclude) {
        $destPath = Join-Path $patchDir $relativePath
        $destDir = Split-Path $destPath -Parent
        
        if (-not (Test-Path $destDir)) { New-Item -Path $destDir -ItemType Directory -Force | Out-Null }
        
        Copy-Item -Path $file.FullName -Destination $destPath -Force
        Write-Host "  [+] $relativePath" -ForegroundColor Green
        $count++
    }
}

if ($count -eq 0) {
    Write-Host "No modified files found in the last $Minutes minutes." -ForegroundColor Yellow
}
else {
    Write-Host ""
    Write-Host "Successfully copied $count files to GITHUB_PATCH" -ForegroundColor Cyan
    Write-Host "Done! You can now upload the contents of 'GITHUB_PATCH' folder." -ForegroundColor White
}
