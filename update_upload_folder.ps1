$sourceDir = "c:\Users\SAMSUNG\OneDrive\바탕 화면\합의 홈페이지"
$destDir = "c:\Users\SAMSUNG\OneDrive\바탕 화면\합의 홈페이지\GITHUB_UPLOAD"

# Excluded directories/files
$exclude = @("node_modules", ".git", "GITHUB_UPLOAD", ".env", ".DS_Store", "package-lock.json")

# Ensure destination exists
if (-not (Test-Path $destDir)) {
    New-Item -Path $destDir -ItemType Directory | Out-Null
}

Get-ChildItem -Path $sourceDir -Recurse | ForEach-Object {
    $relativePath = $_.FullName.Substring($sourceDir.Length + 1)
    
    # Check if path contains excluded items
    $shouldExclude = $false
    foreach ($ex in $exclude) {
        if ($relativePath.StartsWith($ex) -or $relativePath -match "\\$ex\\") {
            $shouldExclude = $true
            break
        }
    }
    
    if (-not $shouldExclude) {
        $destPath = Join-Path $destDir $relativePath
        if ($_.PSIsContainer) {
            if (-not (Test-Path $destPath)) {
                New-Item -Path $destPath -ItemType Directory | Out-Null
            }
        }
        else {
            Copy-Item -Path $_.FullName -Destination $destPath -Force
        }
    }
}

Write-Host "Updated GITHUB_UPLOAD folder successfully."
