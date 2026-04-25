# Netlify 배포 - 빠른 해결 가이드

## ⚠️ "Page not found" 오류 해결

### 문제 원인
Netlify가 `package.json`을 감지하고 Node.js 빌드를 시도했지만 실패했습니다.

### ✅ 해결 방법 (2가지 옵션)

---

## 방법 1: 배포용 폴더 생성 (가장 확실함) ⭐

### 1단계: 새 폴더 만들기
프로젝트 폴더 안에 `deploy` 폴더를 만듭니다.

### 2단계: 필요한 파일만 복사
다음 파일들만 `deploy` 폴더에 복사:

**✅ 복사할 파일:**
- `index.html`
- `login.html`
- `dashboard.html`
- `invite.html`
- `blind_proposal.html`
- `agreement.html`
- `apology_guide.html`
- `style.css`
- `agreement.css`
- `app.js`
- `dashboard.js`
- `agreement.js`
- `netlify.toml` (수정된 버전)

**❌ 복사하지 말 것:**
- `server.js`
- `package.json`
- `package-lock.json`
- `node_modules/`
- `database.sqlite`
- `.npmrc`

### 3단계: Netlify에 배포
1. Netlify 사이트 접속
2. "Add new site" → "Deploy manually"
3. **`deploy` 폴더만** 드래그 앤 드롭
4. 완료!

---

## 방법 2: 현재 폴더 그대로 재배포

### 1단계: 파일 확인
다음 파일들이 수정되었는지 확인:
- ✅ `netlify.toml` (빌드 명령어가 빈 문자열 `""`)
- ✅ `.netlifyignore` (package.json 포함)

### 2단계: Netlify 사이트 삭제 후 재생성
1. 기존 Netlify 사이트 삭제
2. 새로 "Add new site" 클릭
3. 전체 폴더 다시 업로드

---

## 🎯 배포 후 확인사항

배포가 성공하면:
1. ✅ `https://your-site.netlify.app` 접속
2. ✅ 메인 페이지가 보임
3. ✅ 브라우저 콘솔(F12)에 "🎭 데모 모드" 메시지 확인
4. ✅ 회원가입/로그인 테스트

---

## 💡 PowerShell로 배포 폴더 자동 생성 (선택사항)

프로젝트 폴더에서 다음 명령어 실행:

```powershell
# deploy 폴더 생성
New-Item -ItemType Directory -Force -Path deploy

# HTML 파일 복사
Copy-Item *.html deploy/

# CSS 파일 복사
Copy-Item *.css deploy/

# JS 파일 복사 (server.js 제외)
Get-ChildItem *.js | Where-Object {$_.Name -ne "server.js"} | Copy-Item -Destination deploy/

# netlify.toml 복사
Copy-Item netlify.toml deploy/

Write-Host "✅ deploy 폴더 생성 완료!"
Write-Host "이제 deploy 폴더를 Netlify에 업로드하세요."
```

---

## 🆘 여전히 안 될 때

1. **Netlify 빌드 로그 확인**
   - Netlify 사이트 → Deploys → 실패한 배포 클릭
   - 전체 로그 복사해서 공유

2. **브라우저 콘솔 확인**
   - F12 → Console 탭
   - 에러 메시지 확인

3. **간단한 테스트**
   - `index.html` 파일 하나만 업로드해서 테스트
   - 성공하면 나머지 파일 추가

---

## 📌 중요 체크리스트

배포 전 확인:
- [ ] `netlify.toml`의 `command = ""` (빈 문자열)
- [ ] `package.json`이 업로드되지 않음
- [ ] `server.js`가 업로드되지 않음
- [ ] HTML 파일들이 모두 포함됨
- [ ] CSS, JS 파일들이 모두 포함됨

배포 성공 후:
- [ ] 메인 페이지 접속 가능
- [ ] 로그인 페이지 접속 가능
- [ ] 콘솔에 "데모 모드" 메시지
- [ ] 회원가입 기능 작동
