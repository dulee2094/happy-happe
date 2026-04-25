# 배포에 필요한 파일만 압축하는 스크립트

Write-Host "=== 배포 파일 압축 스크립트 ===" -ForegroundColor Green
Write-Host ""

$zipPath = "settlement33-deploy.zip"

# 기존 ZIP 파일 삭제
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
    Write-Host "기존 ZIP 파일 삭제 완료" -ForegroundColor Yellow
}

# 제외할 항목
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
    "settlement33-deploy.zip",
    "setup_git_and_push.ps1",
    "create_deployment_zip.ps1"
)

Write-Host "압축 중..." -ForegroundColor Yellow
Write-Host ""

# 임시 폴더 생성
$tempFolder = "temp_deploy"
if (Test-Path $tempFolder) {
    Remove-Item $tempFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $tempFolder | Out-Null

# 파일 복사 (제외 항목 제외)
Get-ChildItem -Path "." -Recurse | Where-Object {
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
    $relativePath = $_.FullName.Substring((Get-Location).Path.Length + 1)
    $destPath = Join-Path $tempFolder $relativePath
    
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
        Write-Host "복사: $relativePath" -ForegroundColor Gray
    }
}

# ZIP 파일 생성
Write-Host ""
Write-Host "ZIP 파일 생성 중..." -ForegroundColor Yellow
Compress-Archive -Path "$tempFolder\*" -DestinationPath $zipPath -Force

# 임시 폴더 삭제
Remove-Item $tempFolder -Recurse -Force

Write-Host ""
Write-Host "=== 완료! ===" -ForegroundColor Green
Write-Host "ZIP 파일 생성: $zipPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "다음 단계:" -ForegroundColor Yellow
Write-Host "1. GitHub 저장소로 이동: https://github.com/dulee2094/settlement33" -ForegroundColor White
Write-Host "2. 'Add file' > 'Upload files' 클릭" -ForegroundColor White
Write-Host "3. $zipPath 파일을 드래그 앤 드롭" -ForegroundColor White
Write-Host "4. 'Commit changes' 클릭" -ForegroundColor White
Write-Host ""
Write-Host "또는 ZIP 파일을 압축 해제한 후 개별 파일 업로드" -ForegroundColor Yellow
Write-Host ""

Read-Host "계속하려면 Enter를 누르세요"
