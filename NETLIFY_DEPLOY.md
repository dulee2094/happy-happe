# Netlify 배포 가이드

## 📦 배포 준비 완료!

이 프로젝트는 이제 **Netlify에 배포 가능**하도록 설정되었습니다.

## 🚀 배포 방법

### 방법 1: Netlify 웹 UI로 배포 (권장)

1. **Netlify 사이트 접속**
   - https://app.netlify.com 로그인

2. **새 사이트 추가**
   - "Add new site" → "Deploy manually" 클릭

3. **파일 업로드**
   - 프로젝트 폴더 전체를 드래그 앤 드롭
   - 또는 폴더를 ZIP으로 압축 후 업로드

4. **배포 완료!**
   - 자동으로 URL이 생성됩니다 (예: `https://your-site-name.netlify.app`)

### 방법 2: Netlify CLI로 배포

```bash
# Netlify CLI 설치
npm install -g netlify-cli

# 로그인
netlify login

# 배포
netlify deploy --prod
```

## ⚙️ 현재 설정

### ✅ 데모 모드 활성화
- **로컬 환경** (`localhost`): 백엔드 서버(`server.js`) 사용
- **배포 환경** (Netlify): 데모 모드로 작동 (백엔드 없이 localStorage 사용)

### 📁 배포되는 파일
- ✅ HTML 파일들 (`index.html`, `login.html`, `dashboard.html` 등)
- ✅ CSS 파일들 (`style.css`, `agreement.css`)
- ✅ JavaScript 파일들 (`app.js`, `dashboard.js` 등)

### 🚫 배포에서 제외되는 파일
- ❌ `server.js` (백엔드 서버)
- ❌ `node_modules/`
- ❌ `package.json`, `package-lock.json`
- ❌ `database.sqlite`
- ❌ 개발 문서들

## 🔧 백엔드 서버 배포 (선택사항)

현재는 **프론트엔드만 배포**되어 데모 모드로 작동합니다.
실제 데이터베이스와 연동하려면 백엔드를 별도로 배포해야 합니다.

### 백엔드 배포 옵션:

1. **Render** (무료, 권장)
   - https://render.com
   - Node.js 앱 배포 지원
   - 무료 플랜 제공

2. **Railway**
   - https://railway.app
   - 간단한 설정
   - 무료 크레딧 제공

3. **Heroku**
   - https://heroku.com
   - 유료 전환됨

### 백엔드 배포 후 설정:

배포된 백엔드 URL을 프론트엔드에 연결하려면:

1. `login.html` 파일 수정:
```javascript
const API_BASE = IS_LOCAL 
    ? 'http://localhost:3000/api' 
    : 'https://your-backend-url.onrender.com/api'; // 여기에 백엔드 URL 입력
```

2. `dashboard.js` 파일도 동일하게 수정

## 📝 주의사항

### 현재 데모 모드의 제한사항:
- ⚠️ 회원가입/로그인 데이터가 **브라우저 localStorage**에만 저장됨
- ⚠️ 다른 브라우저나 기기에서는 데이터 공유 안 됨
- ⚠️ 브라우저 캐시 삭제 시 데이터 손실
- ⚠️ 실제 SMS 발송 불가
- ⚠️ 실제 결제 기능 불가

### 프로덕션 배포 시 필요한 작업:
1. ✅ 백엔드 서버 배포 (Render, Railway 등)
2. ✅ 데이터베이스 설정 (PostgreSQL, MySQL 등)
3. ✅ 환경 변수 설정 (API 키, DB 연결 정보 등)
4. ✅ HTTPS 인증서 (Netlify는 자동 제공)
5. ✅ CORS 설정 (백엔드에서 Netlify 도메인 허용)

## 🎯 테스트 방법

배포 후 다음 기능들을 테스트하세요:

1. **회원가입** → 데모 데이터 생성
2. **로그인** → localStorage 확인
3. **대시보드** → 목 데이터 표시 확인
4. **합의 요청 보내기** → UI 작동 확인

## 🆘 문제 해결

### 배포 실패 시:
1. `netlify.toml` 파일이 프로젝트 루트에 있는지 확인
2. `.netlifyignore` 파일 확인
3. Netlify 빌드 로그 확인

### 페이지가 안 보일 때:
1. 브라우저 콘솔(F12) 확인
2. "데모 모드" 메시지 확인
3. localStorage 데이터 확인

## 📞 지원

문제가 있으면 Netlify 빌드 로그를 확인하고,
전체 에러 메시지를 공유해주세요.
