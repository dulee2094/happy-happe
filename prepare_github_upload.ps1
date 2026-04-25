# GitHub 업로드용 클린 폴더 생성 스크립트

Write-Host "=== GitHub 업로드용 폴더 준비 ===" -ForegroundColor Green

$targetDir = "GITHUB_UPLOAD"

# 기존 폴더 초기화
if (Test-Path $targetDir) {
    Remove-Item $targetDir -Recurse -Force
}
New-Item -ItemType Directory -Path $targetDir | Out-Null

# 제외할 항목 목록
$excludeItems = @(
    "node_modules",
    "database.sqlite",
    ".env",
    "deploy",
    ".git",
    "GITHUB_UPLOAD",
    "*.log",
    "*.zip"
)

# 파일 복사
Get-ChildItem -Path "." -Recurse | Where-Object {
    $item = $_
    $shouldExclude = $false
    
    # 제외 경로 확인
    foreach ($exclude in $excludeItems) {
        if ($item.FullName -like "*\$exclude\*" -or $item.Name -like $exclude) {
            $shouldExclude = $true
            break
        }
    }
    
    # GitHub Desktop 가이드 등 불필요한 파일 제외
    if ($item.Name -like "*GUIDE.md") { $shouldExclude = $true }
    
    -not $shouldExclude
} | ForEach-Object {
    $relativePath = $_.FullName.Substring((Get-Location).Path.Length + 1)
    $destPath = Join-Path $targetDir $relativePath
    
    if ($_.PSIsContainer) {
        if (-not (Test-Path $destPath)) {
            New-Item -ItemType Directory -Path $destPath -Force | Out-Null
        }
    }
    else {
        $destDir = Split-Path $destPath -Parent
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        Copy-Item $_.FullName -Destination $destPath -Force
    }
}

Write-Host ""
Write-Host "✅ 준비 완료!" -ForegroundColor Green
Write-Host "폴더 위치: $targetDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "이제 이 폴더 안의 모든 파일을 GitHub에 업로드하세요." -ForegroundColor Yellow
Write-Host ""

# 탐색기로 폴더 열기
Invoke-Item $targetDir
