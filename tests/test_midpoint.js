// Test script for 10% midpoint agreement feature
const BASE_URL = 'http://localhost:3000';

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
};

function log(icon, message, color = colors.reset) {
    console.log(`${color}${icon} ${message}${colors.reset}`);
}

async function testMidpointAgreement() {
    console.log('\n' + '='.repeat(60));
    log('🧪', 'MIDPOINT AGREEMENT TEST', colors.cyan);
    console.log('='.repeat(60) + '\n');

    try {
        // 1. Health check
        const health = await fetch(`${BASE_URL}/`);
        if (!health.ok) throw new Error('Server not running');
        log('✅', `Server is running at ${BASE_URL}`, colors.green);

        // 2. Create test case
        const caseNumber = `TEST-MID-${Math.random().toString(36).substr(2, 9)}`;
        log('📝', `Test Case Number: ${caseNumber}`, colors.blue);

        // 3. Create users
        log('👤', 'Creating test users...', colors.yellow);

        const offEmail = `off_${caseNumber.toLowerCase()}@test.com`;
        const vicEmail = `vic_${caseNumber.toLowerCase()}@test.com`;

        const u1 = await (await fetch(`${BASE_URL}/api/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: offEmail, password: '1234', name: 'Offender Test' })
        })).json();

        const u2 = await (await fetch(`${BASE_URL}/api/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: vicEmail, password: '1234', name: 'Victim Test' })
        })).json();

        log('✅', `Offender ID: ${u1.userId}`, colors.green);
        log('✅', `Victim ID: ${u2.userId}`, colors.green);

        // 4. Link case
        log('🔗', 'Linking case...', colors.yellow);

        const c1 = await (await fetch(`${BASE_URL}/api/case/link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: u1.userId, caseNumber, role: 'offender' })
        })).json();

        await fetch(`${BASE_URL}/api/case/link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: u2.userId, caseNumber, role: 'victim' })
        });

        const caseId = c1.caseId;
        log('✅', `Case ID: ${caseId}`, colors.green);

        // 5. Submit proposals (10% within)
        log('💰', 'Submitting proposals (10% within)...', colors.yellow);

        const offenderAmount = 5000000; // 500만원
        const victimAmount = 5400000;   // 540만원 (8% 차이)

        await fetch(`${BASE_URL}/api/case/proposal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: u1.userId,
                caseId,
                amount: offenderAmount,
                duration: 1,
                position: 'payer'
            })
        });
        log('✅', `Offender proposed: ${offenderAmount.toLocaleString()}원`, colors.green);

        const p2 = await (await fetch(`${BASE_URL}/api/case/proposal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: u2.userId,
                caseId,
                amount: victimAmount,
                duration: 1,
                position: 'receiver'
            })
        })).json();
        log('✅', `Victim proposed: ${victimAmount.toLocaleString()}원`, colors.green);

        // 6. Verify midpoint triggered
        log('🔍', 'Verifying midpoint trigger...', colors.yellow);

        if (p2.midpointTriggered) {
            log('✅', 'Midpoint triggered! (Within 10%)', colors.green);
            const diff = p2.data.diff;
            const diffPercent = (diff / Math.max(offenderAmount, victimAmount) * 100).toFixed(2);
            log('📊', `Difference: ${diff.toLocaleString()}원 (${diffPercent}%)`, colors.blue);
        } else {
            log('❌', 'Midpoint NOT triggered (should have been!)', colors.red);
            return;
        }

        // 7. Check midpoint status
        log('🔍', 'Checking midpoint status...', colors.yellow);

        const status = await (await fetch(`${BASE_URL}/api/case/proposal/midpoint-status?caseId=${caseId}&userId=${u1.userId}`)).json();

        if (status.midpointProposed) {
            log('✅', 'Midpoint proposed successfully', colors.green);
            log('📊', `iAgreed: ${status.iAgreed}, oppAgreed: ${status.oppAgreed}`, colors.blue);
        }

        // 8. Test agreement flow
        log('🤝', 'Testing agreement flow...', colors.yellow);

        // Offender agrees first
        const agree1 = await (await fetch(`${BASE_URL}/api/case/proposal/midpoint-agree`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ caseId, userId: u1.userId })
        })).json();

        if (agree1.success) {
            log('✅', 'Offender agreed to midpoint', colors.green);
            log('📊', `Both agreed: ${agree1.bothAgreed}`, colors.blue);
        }

        // Check status after first agreement
        const status2 = await (await fetch(`${BASE_URL}/api/case/proposal/midpoint-status?caseId=${caseId}&userId=${u2.userId}`)).json();
        log('📊', `Victim sees - iAgreed: ${status2.iAgreed}, oppAgreed: ${status2.oppAgreed}`, colors.blue);

        // Victim agrees
        const agree2 = await (await fetch(`${BASE_URL}/api/case/proposal/midpoint-agree`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ caseId, userId: u2.userId })
        })).json();

        if (agree2.success && agree2.bothAgreed) {
            log('✅', 'Both parties agreed!', colors.green);
            log('🎉', `Final midpoint amount: ${agree2.midpointAmount.toLocaleString()}원`, colors.green);

            const expectedMidpoint = Math.floor((offenderAmount + victimAmount) / 2);
            if (agree2.midpointAmount === expectedMidpoint) {
                log('✅', 'Midpoint calculation correct!', colors.green);
            } else {
                log('❌', `Midpoint mismatch! Expected: ${expectedMidpoint}, Got: ${agree2.midpointAmount}`, colors.red);
            }
        }

        console.log('\n' + '='.repeat(60));
        log('🎉', 'MIDPOINT AGREEMENT TEST COMPLETED!', colors.green);
        console.log('='.repeat(60) + '\n');

        console.log('📋 Test Summary:');
        console.log(`   Case Number: ${caseNumber}`);
        console.log(`   Offender Email: ${offEmail}`);
        console.log(`   Victim Email: ${vicEmail}`);
        console.log(`   Password: 1234`);
        console.log(`   Offender Amount: ${offenderAmount.toLocaleString()}원`);
        console.log(`   Victim Amount: ${victimAmount.toLocaleString()}원`);
        console.log(`   Final Midpoint: ${agree2.midpointAmount.toLocaleString()}원`);
        console.log(`\n💡 You can login with these credentials at: ${BASE_URL}/login.html\n`);

    } catch (error) {
        log('❌', `Test failed: ${error.message}`, colors.red);
        console.error(error);
    }
}

testMidpointAgreement();
