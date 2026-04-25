# 사건 상세 페이지 오류 해결 - 최종 가이드

## 🔍 진짜 문제의 원인

**ES6 모듈 문법 사용 문제**

`js/case_detail/utils.js` 파일이 `export` 키워드를 사용하는 ES6 모듈 문법으로 작성되어 있었습니다.

```javascript
// 문제가 있던 코드
export function getRoleText(role) { ... }
```

일반 `<script>` 태그로 로드하면 다음 에러가 발생합니다:
```
Uncaught SyntaxError: Unexpected token 'export'
```

ES6 모듈은 `<script type="module">`로 로드해야 하지만, 기존 코드는 일반 스크립트로 작성되어 있어 호환되지 않았습니다.

---

## ✅ 최종 해결 방법

### 1. `js/case_detail/utils.js` 수정 ✅
**변경 내용**: `export` 키워드 제거, 일반 JavaScript로 변환

```javascript
// 수정 후
function getRoleText(role) {
    return role === 'offender' ? '피의자 (가해자)' : '피해자';
}

// 전역으로 노출
window.getRoleText = getRoleText;
```

### 2. `case_detail.html` 수정 ✅
**변경 내용**: utils.js를 스크립트 로드 순서의 맨 앞에 추가

```html
<script src="js/case_detail/utils.js"></script>
<script src="js/case_detail_api.js"></script>
...
```

### 3. `case_detail_view.js` 수정 ✅
**변경 내용**: getColor, getOpacity 함수 호출에 window. 접두사 추가

---

## 🧪 테스트 방법

### 1. 서버 재시작 (중요!)
로컬 서버를 실행 중이라면 **반드시 재시작**하세요:

```powershell
# 기존 서버 중지 (Ctrl+C)
# 다시 시작
npm start
```

### 2. 브라우저 캐시 완전 삭제
**방법 A: 하드 리프레시 (추천)**
- Chrome/Edge: `Ctrl + Shift + R` 또는 `Ctrl + F5`

**방법 B: 개발자 도구 사용**
1. F12로 개발자 도구 열기
2. 새로고침 버튼 **우클릭**
3. "캐시 비우기 및 강력 새로고침" 선택

**방법 C: 수동 캐시 삭제**
1. Chrome 설정 → 개인정보 및 보안
2. 인터넷 사용 기록 삭제
3. "캐시된 이미지 및 파일" 선택
4. 삭제

### 3. 브라우저 콘솔 확인
F12 → Console 탭에서 에러 확인

**정상 작동 시**: 에러 메시지 없음
**문제 발생 시**: 에러 메시지 복사하여 공유

---

## 🎯 확인 사항

### 페이지가 정상적으로 표시되면:
- ✅ 사건 정보 카드
- ✅ 진행 현황 카드  
- ✅ 빠른 실행 버튼들
- ✅ 최근 활동 섹션

### 여전히 빈 화면이면:
1. **F12 → Console 탭 확인**
2. **에러 메시지 스크린샷**
3. **Network 탭에서 utils.js 로드 확인**
   - Status: 200 (정상)
   - Status: 404 (파일 없음)

---

## 🔧 추가 디버깅

### 브라우저 콘솔에서 직접 테스트
F12 → Console 탭에서 다음 명령어 입력:

```javascript
// 함수가 정의되어 있는지 확인
console.log(typeof window.getRoleText);  // "function"이어야 함
console.log(typeof window.getStatusText);  // "function"이어야 함

// 함수 실행 테스트
console.log(window.getRoleText('offender'));  // "피의자 (가해자)"
console.log(window.getStatusText('connected'));  // "연결 완료"
```

**결과가 "undefined"이면**: utils.js가 로드되지 않은 것
**결과가 "function"이면**: 함수는 정상, 다른 문제 존재

---

## 📝 수정된 파일 목록

1. ✅ `js/case_detail/utils.js` - export 키워드 제거
2. ✅ `case_detail.html` - utils.js 스크립트 추가
3. ✅ `case_detail_view.js` - window. 접두사 추가

---

## 🚨 여전히 문제가 있다면

다음 정보를 공유해주세요:

1. **브라우저 콘솔 에러 메시지** (F12 → Console)
2. **Network 탭 스크린샷** (F12 → Network → utils.js 확인)
3. **서버가 실행 중인지 여부**
4. **어떤 브라우저를 사용하는지** (Chrome, Edge, Firefox 등)

---

**지금 해야 할 일**:
1. ✅ 서버 재시작 (npm start)
2. ✅ 브라우저 하드 리프레시 (Ctrl + Shift + R)
3. ✅ F12로 콘솔 에러 확인

문제가 계속되면 콘솔 에러를 알려주세요! 🙏
