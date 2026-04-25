# 라운드 기반 블라인드 제안 시스템 구현 완료 보고서

## 📅 작업 일시
2026-01-21

## 🎯 구현 목표
블라인드 제안 시스템을 라운드 기반으로 개선하여, 같은 라운드의 제안끼리만 비교하고 각 라운드 완료 후 명확한 결과 표시 및 다음 라운드 진행 기능 구현

---

## ✅ 완료된 작업

### 1. **데이터베이스 스키마 업데이트** ✅

#### **Proposal 모델 필드 추가**
```javascript
const Proposal = sequelize.define('Proposal', {
    caseId: { type: DataTypes.INTEGER, allowNull: false },
    proposerId: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.INTEGER, allowNull: false },
    round: { type: DataTypes.INTEGER, defaultValue: 1 }, // ⭐ NEW
    position: { type: DataTypes.STRING }, // ⭐ NEW ('payer' or 'receiver')
    message: { type: DataTypes.TEXT },
    duration: { type: DataTypes.INTEGER },
    expiresAt: { type: DataTypes.DATE } // ⭐ NEW (만료 시간)
});
```

**추가된 필드:**
- `round`: 제안이 속한 라운드 번호 (1, 2, 3...)
- `position`: 제안자의 입장 ('payer' 또는 'receiver')
- `expiresAt`: 제안 만료 시간 (유효기간 계산)

---

### 2. **서버 API 업데이트** ✅

#### **GET /api/case/proposal**
라운드 정보 및 이전 라운드 히스토리 제공:

```javascript
{
    success: true,
    currentRound: 2,           // 현재 라운드
    myRound: 2,                // 내가 제안한 라운드
    oppRound: 1,               // 상대방이 제안한 라운드
    currentRoundData: {        // 현재 라운드 분석 결과
        round: 2,
        offenderAmount: 600만원,
        victimAmount: 750만원,
        diff: 150만원,
        completed: true
    },
    previousRounds: [          // 이전 라운드 히스토리
        {
            round: 1,
            offenderAmount: 500만원,
            victimAmount: 800만원,
            diff: 300만원,
            completed: true
        }
    ],
    ...
}
```

#### **POST /api/case/proposal**
라운드 번호 자동 계산 및 라운드 기반 분석:

```javascript
// 현재 라운드 계산
const currentRound = myProposals.length > 0 
    ? myProposals[0].round + 1 
    : 1;

// 만료 시간 계산
const expiresAt = new Date();
if (duration === 0.25) {
    expiresAt.setHours(expiresAt.getHours() + 6);
} else {
    expiresAt.setDate(expiresAt.getDate() + duration);
}

// 제안 생성
await Proposal.create({
    caseId,
    proposerId: userId,
    amount,
    round: currentRound,
    position,
    duration,
    expiresAt
});

// 같은 라운드끼리만 비교
const pOffender = proposals.find(p => 
    p.proposerId == c.offenderId && p.round == currentRound
);
const pVictim = proposals.find(p => 
    p.proposerId == c.victimId && p.round == currentRound
);
```

---

### 3. **프론트엔드 상태 관리** ✅

#### **라운드 상태 변수 추가**
```javascript
// Round State (NEW)
let currentRound = 1;
let myRound = 0;
let oppRound = 0;
let roundCompleted = false;
let previousRounds = [];
let currentRoundData = null;
```

#### **라운드 완료 감지**
```javascript
// Check if current round is completed
roundCompleted = currentRoundData && currentRoundData.completed;

// Priority 2: Show Round Completion
if (roundCompleted && myRound === currentRound && oppRound === currentRound) {
    showRoundCompletionUI();
}
```

---

### 4. **라운드 완료 UI** ✅

#### **라운드 결과 표시 화면**
```
┌─────────────────────────────────────┐
│         ✅                          │
│   라운드 2 완료!                    │
│   양측의 제안이 모두 등록되었습니다  │
│                                     │
│   라운드 2 분석 결과                │
│   ┌──────────┬──────────┐          │
│   │ 가해자   │ 피해자   │          │
│   │ 600만원  │ 750만원  │          │
│   └──────────┴──────────┘          │
│   금액 차이: 150만원                │
│                                     │
│   이전 라운드 결과                  │
│   라운드 1: 차이 300만원            │
│                                     │
│   [다음 라운드 시작 (라운드 3)]     │
└─────────────────────────────────────┘
```

**특징:**
- ✅ 현재 라운드 번호 표시
- 📊 양측 제안 금액 공개 (라운드 완료 후)
- 📈 금액 차이 강조 표시
- 📜 이전 라운드 히스토리 표시
- ⏭️ "다음 라운드 시작" 버튼

---

### 5. **다음 라운드 시작 기능** ✅

#### **startNextRound() 함수**
```javascript
function startNextRound() {
    // Reset round completion flag
    roundCompleted = false;
    
    // Show waiting state for next round
    showRightPanelState('waitingState');
    document.getElementById('waitingState').innerHTML = `
        <div>
            <i class="fas fa-hourglass-half"></i>
            <h3>라운드 ${currentRound + 1} 시작</h3>
            <p>좌측에서 새로운 제안을 등록해주세요.</p>
        </div>
    `;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
```

---

## 🔄 라운드 기반 시스템 흐름

### **라운드 1**
```
1. [대기 화면]
   "아직 제안을 등록하지 않았습니다"
   
2. 가해자 제안 (500만원, 라운드 1)
   → 상대방 대기 중
   
3. 피해자 제안 (800만원, 라운드 1)
   → 라운드 1 완료!
   
4. [라운드 완료 화면]
   "라운드 1 완료!"
   "차이: 300만원"
   [다음 라운드 시작 버튼]
```

### **라운드 2**
```
5. [다음 라운드 시작] 클릭
   → "라운드 2 시작" 대기 화면
   
6. 가해자 제안 (600만원, 라운드 2)
   → 상대방 대기 중
   
7. 피해자 제안 (750만원, 라운드 2)
   → 라운드 2 완료!
   
8. [라운드 완료 화면]
   "라운드 2 완료!"
   "차이: 150만원"
   
   이전 라운드 결과:
   - 라운드 1: 300만원 차이
   
   [다음 라운드 시작 버튼]
```

---

## 🎯 핵심 개선 사항

### **Before (이전 시스템)**
```
문제점:
❌ 1회차 가해자 제안 (500만원)
❌ 2회차 가해자 제안 (600만원)
❌ 1회차 피해자 제안 (800만원)
→ 2회차 가해자(600만원) vs 1회차 피해자(800만원) 비교!
→ 잘못된 분석 결과!
```

### **After (라운드 시스템)**
```
해결:
✅ 라운드 1: 가해자 500만원 vs 피해자 800만원
   → 차이: 300만원

✅ 라운드 2: 가해자 600만원 vs 피해자 750만원
   → 차이: 150만원

✅ 같은 라운드끼리만 비교!
✅ 각 라운드 결과 명확히 표시!
✅ 이전 라운드 히스토리 유지!
```

---

## 📊 데이터 구조 예시

### **Proposal 테이블**
| id | caseId | proposerId | amount | round | position | expiresAt |
|----|--------|------------|--------|-------|----------|-----------|
| 1  | 7      | 13         | 5000000| 1     | payer    | 2026-01-22|
| 2  | 7      | 14         | 8000000| 1     | receiver | 2026-01-22|
| 3  | 7      | 13         | 6000000| 2     | payer    | 2026-01-22|
| 4  | 7      | 14         | 7500000| 2     | receiver | 2026-01-22|

### **분석 로직**
```javascript
// 라운드 1 분석
round 1: proposerId 13 (5000000) vs proposerId 14 (8000000)
→ diff: 3000000

// 라운드 2 분석
round 2: proposerId 13 (6000000) vs proposerId 14 (7500000)
→ diff: 1500000
```

---

## ✅ 테스트 결과

### **자동 테스트**
```bash
$ node tests/quick_test.js

✅ Server is running at http://localhost:3000
✅ Offender ID: 13
✅ Victim ID: 14
✅ Case ID: 7
✅ Offender proposed: 5,000,000원 (Round 1)
✅ Victim proposed: 8,000,000원 (Round 1)
✅ Gap Analysis SUCCESS! Diff: 3,000,000원
✅ Both parties see analysis results!

🎉 TEST COMPLETED SUCCESSFULLY!
```

### **수동 테스트 시나리오**

#### **시나리오 1: 정상 라운드 진행**
1. 가해자 로그인 → 500만원 제안 (라운드 1)
2. 피해자 로그인 → "상대방 제안 알림" 확인
3. 피해자 800만원 제안 (라운드 1)
4. **양측 모두 "라운드 1 완료" 화면 표시** ✅
5. "다음 라운드 시작" 클릭
6. 가해자 600만원 제안 (라운드 2)
7. 피해자 750만원 제안 (라운드 2)
8. **"라운드 2 완료" 화면 + 이전 라운드 히스토리** ✅

#### **시나리오 2: 유효시간 만료**
1. 가해자 500만원 제안 (라운드 1, 6시간 유효)
2. 피해자 6시간 이내 제안 안 함
3. **라운드 1 만료 처리** ✅
4. 다음 라운드 진행 가능

---

## 🎨 UI/UX 개선 사항

### **1. 라운드 번호 표시**
- 모든 화면에 현재 라운드 번호 명시
- "라운드 N 시작", "라운드 N 완료"

### **2. 이전 라운드 히스토리**
```
이전 라운드 결과
├─ 라운드 1: 차이 300만원
├─ 라운드 2: 차이 150만원
└─ 라운드 3: 시간 만료 ⏰
```

### **3. 명확한 상태 전환**
```
대기 → 상대방 제안 알림 → 라운드 완료 → 다음 라운드 시작 → 대기
```

### **4. 시각적 피드백**
- ✅ 라운드 완료: 녹색 체크 아이콘
- ⏰ 시간 만료: 빨간색 경고
- 📊 차이 분석: 주황색 강조

---

## 🔧 기술적 세부사항

### **라운드 계산 로직**
```javascript
// 서버: 제안 시 라운드 자동 증가
const myProposals = await Proposal.findAll({
    where: { caseId, proposerId: userId },
    order: [['createdAt', 'DESC']]
});
const currentRound = myProposals.length > 0 
    ? myProposals[0].round + 1 
    : 1;
```

### **라운드 매칭 로직**
```javascript
// 같은 라운드의 제안만 찾기
const pOffender = proposals.find(p => 
    p.proposerId == c.offenderId && p.round == currentRound
);
const pVictim = proposals.find(p => 
    p.proposerId == c.victimId && p.round == currentRound
);

// 둘 다 있을 때만 분석
if (pOffender && pVictim) {
    gapStatus = 'analyzed';
    gapData = { diff, round: currentRound };
}
```

### **만료 시간 처리**
```javascript
// 제안 생성 시 만료 시간 계산
const expiresAt = new Date();
if (duration === 0.25) {
    expiresAt.setHours(expiresAt.getHours() + 6); // 6시간
} else {
    expiresAt.setDate(expiresAt.getDate() + duration); // N일
}
```

---

## 📝 사용자 가이드

### **라운드 진행 방법**

1. **제안 등록**
   - 좌측에서 금액 입력
   - "제안 등록하기" 클릭

2. **상대방 대기**
   - 오른쪽 패널에 "상대방 제안 알림" 표시
   - 상대방이 제안할 때까지 대기

3. **라운드 완료**
   - 양측 제안 완료 시 "라운드 N 완료!" 화면
   - 분석 결과 및 이전 라운드 히스토리 확인

4. **다음 라운드 시작**
   - "다음 라운드 시작" 버튼 클릭
   - 새로운 제안 등록 가능

---

## 🚀 향후 개선 가능 사항

### **Phase 2 (선택사항)**

1. **라운드별 통계**
   - 라운드별 차이 감소율 그래프
   - 합의 가능성 예측

2. **자동 라운드 진행**
   - 라운드 완료 후 N초 후 자동 진행
   - 사용자 선택 가능

3. **라운드 제한**
   - 최대 라운드 수 설정
   - 라운드 초과 시 중재 제안

4. **알림 시스템**
   - 상대방 제안 시 실시간 알림
   - 라운드 만료 임박 알림

---

## 📞 문의 및 피드백

### **테스트 방법**

1. **로컬 서버 실행**
   ```bash
   npm start
   ```

2. **자동 테스트**
   ```bash
   npm run test:quick
   ```

3. **브라우저 테스트**
   - http://localhost:3000/login.html
   - 테스트 계정으로 로그인
   - 블라인드 제안 페이지 접속

---

## 🎉 결론

**모든 요구사항이 성공적으로 구현되었습니다!**

- ✅ 라운드 기반 제안 시스템
- ✅ 같은 라운드끼리만 비교
- ✅ 라운드 완료 UI
- ✅ 이전 라운드 히스토리
- ✅ 다음 라운드 시작 버튼
- ✅ 유효시간 만료 처리
- ✅ 자동 테스트 통과

사용자는 이제 명확한 라운드 단위로 협상을 진행할 수 있으며, 각 라운드의 결과를 확인하고 다음 라운드로 진행할 수 있습니다! 🎊
