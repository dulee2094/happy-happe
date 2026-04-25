# 현재 프로젝트를 클론된 저장소로 복사하는 스크립트

Write-Host "=== 파일 복사 스크립트 ===" -ForegroundColor Green
Write-Host ""

# 클론된 저장소 경로 입력 받기
Write-Host "GitHub Desktop에서 저장소를 클론한 경로를 입력하세요." -ForegroundColor Cyan
Write-Host "예: C:\Users\SAMSUNG\Desktop\settlement33" -ForegroundColor Gray
Write-Host ""
$clonedPath = Read-Host "클론된 저장소 경로"

# 경로 확인
if (-not (Test-Path $clonedPath)) {
    Write-Host "오류: 경로를 찾을 수 없습니다: $clonedPath" -ForegroundColor Red
    Read-Host "Enter를 눌러 종료"
    exit
}

# .git 폴더 확인
if (-not (Test-Path "$clonedPath\.git")) {
    Write-Host "오류: Git 저장소가 아닙니다. .git 폴더가 없습니다." -ForegroundColor Red
    Read-Host "Enter를 눌러 종료"
    exit
}

Write-Host ""
Write-Host "클론된 저장소 확인 완료: $clonedPath" -ForegroundColor Green
Write-Host ""

# 현재 프로젝트 경로
$sourcePath = Get-Location

Write-Host "소스 경로: $sourcePath" -ForegroundColor White
Write-Host "대상 경로: $clonedPath" -ForegroundColor White
Write-Host ""

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
    "create_deployment_zip.ps1",
    "copy_to_clone.ps1",
    "GITHUB_DESKTOP_GUIDE.md"
)

Write-Host "제외 항목:" -ForegroundColor Yellow
$excludeItems | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
Write-Host ""

$confirm = Read-Host "계속하시겠습니까? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "취소되었습니다." -ForegroundColor Yellow
    Read-Host "Enter를 눌러 종료"
    exit
}

Write-Host ""
Write-Host "파일 복사 중..." -ForegroundColor Yellow
Write-Host ""

# 클론된 저장소의 기존 파일 삭제 (.git 제외)
Write-Host "기존 파일 삭제 중..." -ForegroundColor Yellow
Get-ChildItem -Path $clonedPath -Recurse -Force | Where-Object {
    $_.FullName -notlike "*\.git\*" -and $_.Name -ne ".git"
} | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "기존 파일 삭제 완료" -ForegroundColor Green
Write-Host ""

# 파일 복사
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
        Write-Host "복사: $relativePath" -ForegroundColor Gray
        $copiedCount++
    }
}

Write-Host ""
Write-Host "=== 완료! ===" -ForegroundColor Green
Write-Host "총 $copiedCount 개 파일 복사 완료" -ForegroundColor Cyan
Write-Host ""
Write-Host "다음 단계:" -ForegroundColor Yellow
Write-Host "1. GitHub Desktop으로 돌아가기" -ForegroundColor White
Write-Host "2. 변경사항 확인 (왼쪽 패널)" -ForegroundColor White
Write-Host "3. models/ 폴더가 포함되어 있는지 확인!" -ForegroundColor White
Write-Host "4. Summary에 커밋 메시지 입력:" -ForegroundColor White
Write-Host "   'Fix: Render 배포 문제 해결 - 모듈 경로 수정'" -ForegroundColor Cyan
Write-Host "5. 'Commit to main' 클릭" -ForegroundColor White
Write-Host "6. 'Push origin' 클릭" -ForegroundColor White
Write-Host ""
Write-Host "중요: models 폴더의 모든 파일이 포함되었는지 확인하세요!" -ForegroundColor Red
Write-Host ""

Read-Host "Press Enter to exit"
