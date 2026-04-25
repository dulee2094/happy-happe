# 🧪 로컬 멀티 유저 테스트 - 빠른 시작

## 🚀 가장 빠른 방법 (3단계)

### 1단계: 테스트 계정 생성
```powershell
node setup_test_users.js
```

### 2단계: 서버 시작 및 브라우저 열기
```powershell
powershell -ExecutionPolicy Bypass -File .\start_local_test.ps1
```

### 3단계: 테스트 시작!
- **Chrome 창**: `offender@test.com` / `test1234` 로 로그인
- **Edge 창**: `victim@test.com` / `test1234` 로 로그인

---

## 📋 상세 가이드

전체 가이드는 `LOCAL_MULTI_USER_TEST_GUIDE.md` 참조

---

## 🎯 테스트 시나리오

### 시나리오 1: 사건 생성 및 연결
1. Chrome(가해자): 새 사건 생성 → 초대 코드 복사
2. Edge(피해자): 초대 코드로 사건 참여

### 시나리오 2: 블라인드 제안
1. 양쪽에서 제안 금액 입력
2. 분석 결과 확인
3. 신호등 표시 확인

### 시나리오 3: 실시간 채팅
1. 한쪽에서 메시지 전송
2. 다른 쪽에서 실시간 수신 확인

---

## 💡 팁

### 화면 분할
- Chrome 창 선택 → **Win + ←**
- Edge 창 선택 → **Win + →**

### 개발자 도구
- **F12** 또는 **Ctrl+Shift+I**
- Console에서 에러 확인
- Network에서 API 요청 확인

---

## 🛠️ 수동 실행 (스크립트 없이)

### 서버 시작
```powershell
npm start
```

### 브라우저 열기
1. Chrome: `http://localhost:3000`
2. Edge: `http://localhost:3000`

---

## 📞 문제 해결

### 서버가 시작되지 않음
```powershell
npm install
npm start
```

### 포트 3000이 사용 중
```powershell
# 포트 사용 프로세스 확인
netstat -ano | findstr :3000

# 프로세스 종료 (PID 확인 후)
taskkill /PID <PID> /F
```

### 데이터베이스 초기화
```powershell
# database.sqlite 파일 삭제 후
node setup_test_users.js
```

---

## 🎬 다음 단계

테스트 중 발견한 버그나 개선사항을 기록하세요!

Happy Testing! 🚀
