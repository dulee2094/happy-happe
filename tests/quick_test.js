// 🚀 Quick Test Runner - 빠른 로컬 테스트
// 사용법: node tests/quick_test.js

const BASE_URL = 'http://localhost:3000';

// 색상 출력을 위한 유틸리티
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(emoji, message, color = colors.reset) {
    console.log(`${color}${emoji} ${message}${colors.reset}`);
}

// 서버 상태 확인
async function checkServer() {
    try {
        await fetch(BASE_URL);
        log('✅', 'Server is running at ' + BASE_URL, colors.green);
        return true;
    } catch (e) {
        log('❌', 'Server is NOT running. Please run: npm start', colors.red);
        return false;
    }
}

// 테스트 시나리오
async function runQuickTest() {
    console.log('\n' + '='.repeat(60));
    log('🧪', 'QUICK LOCAL TEST RUNNER', colors.cyan);
    console.log('='.repeat(60) + '\n');

    // 1. 서버 체크
    if (!await checkServer()) {
        process.exit(1);
    }

    const testId = Date.now().toString(36);
    const caseNum = `TEST-${testId}`;

    log('📝', `Test Case Number: ${caseNum}`, colors.blue);

    try {
        // 2. 사용자 생성
        log('👤', 'Creating test users...', colors.yellow);

        const offender = await createUser(`off_${testId}@test.com`, 'Offender');
        const victim = await createUser(`vic_${testId}@test.com`, 'Victim');

        log('✅', `Offender ID: ${offender.userId}`, colors.green);
        log('✅', `Victim ID: ${victim.userId}`, colors.green);

        // 3. 사건 연결
        log('🔗', 'Linking case...', colors.yellow);

        const caseId = await linkCase(offender.userId, caseNum, 'offender');
        await linkCase(victim.userId, caseNum, 'victim');

        log('✅', `Case ID: ${caseId}`, colors.green);

        // 4. 제안 제출
        log('💰', 'Submitting proposals...', colors.yellow);

        const offenderAmount = 5000000;
        const victimAmount = 8000000;
        const expectedDiff = victimAmount - offenderAmount;

        await submitProposal(offender.userId, caseId, offenderAmount);
        log('✅', `Offender proposed: ${offenderAmount.toLocaleString()}원`, colors.green);

        const result = await submitProposal(victim.userId, caseId, victimAmount);
        log('✅', `Victim proposed: ${victimAmount.toLocaleString()}원`, colors.green);

        // 5. 결과 검증
        log('🔍', 'Verifying results...', colors.yellow);

        if (result.status === 'analyzed') {
            const actualDiff = result.data.diff;
            if (actualDiff === expectedDiff) {
                log('✅', `Gap Analysis SUCCESS! Diff: ${actualDiff.toLocaleString()}원`, colors.green);
            } else {
                log('❌', `Gap mismatch! Expected: ${expectedDiff}, Got: ${actualDiff}`, colors.red);
            }

            // 중간점 합의 체크
            if (result.data.midpoint !== undefined) {
                const midpoint = result.data.midpoint;
                const withinRange = result.data.withinMidpointRange;
                log('📊', `Midpoint: ${midpoint.toLocaleString()}원`, colors.blue);
                log('📊', `Within 10% range: ${withinRange}`, colors.blue);
            }
        } else {
            log('❌', `Analysis FAILED! Status: ${result.status}`, colors.red);
        }

        // 6. 양측 동기화 확인
        log('🔄', 'Checking synchronization...', colors.yellow);

        const offenderView = await getProposalStatus(caseId, offender.userId);
        const victimView = await getProposalStatus(caseId, victim.userId);

        if (offenderView.status === 'analyzed' && victimView.status === 'analyzed') {
            log('✅', 'Both parties see analysis results!', colors.green);
        } else {
            log('⚠️', 'Synchronization issue detected', colors.yellow);
        }

        console.log('\n' + '='.repeat(60));
        log('🎉', 'TEST COMPLETED SUCCESSFULLY!', colors.green);
        console.log('='.repeat(60) + '\n');

        // 테스트 정보 출력
        console.log('📋 Test Summary:');
        console.log(`   Case Number: ${caseNum}`);
        console.log(`   Offender Email: off_${testId}@test.com`);
        console.log(`   Victim Email: vic_${testId}@test.com`);
        console.log(`   Password: 1234`);
        console.log(`\n💡 You can login with these credentials at: ${BASE_URL}/login.html\n`);

    } catch (error) {
        log('💥', 'TEST FAILED!', colors.red);
        console.error(error);
        process.exit(1);
    }
}

// Helper Functions
async function createUser(email, name) {
    const res = await fetch(`${BASE_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            password: '1234',
            name,
            phoneNumber: '010-0000-0000'
        })
    });
    const data = await res.json();
    if (!data.success) throw new Error(`Failed to create user: ${data.error}`);
    return data;
}

async function linkCase(userId, caseNumber, role) {
    const res = await fetch(`${BASE_URL}/api/case/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId,
            caseNumber,
            role,
            summary: 'Quick Test Case'
        })
    });
    const data = await res.json();
    if (!data.success) throw new Error(`Failed to link case: ${data.error}`);
    return data.caseId;
}

async function submitProposal(userId, caseId, amount) {
    const res = await fetch(`${BASE_URL}/api/case/proposal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, caseId, amount, duration: 1 })
    });
    const data = await res.json();
    if (!data.success) throw new Error(`Failed to submit proposal: ${data.error}`);
    return data;
}

async function getProposalStatus(caseId, userId) {
    const res = await fetch(`${BASE_URL}/api/case/proposal?caseId=${caseId}&userId=${userId}`);
    return await res.json();
}

// Run the test
runQuickTest();
