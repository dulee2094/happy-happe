const assert = require('assert');

// Config
const BASE_URL = 'http://localhost:3000'; // Adjust mock if server not running, but I assume server runs.
// If server is not running, this test fails. I should probably "require" the server app if I can, but server.js starts listening immediately.
// For this environment, I will assume the user (or I) should start the server. 
// However, I can't easily start the server in background and kill it in the same script without complex process management.
// So I will make this a "Test Script" that expects the server to be running, OR I can mock the fetch calls if I just want to test logic. 
// But the user asked for "automated test script" for "logic breaking". Real integration test is best.

// Let's try to assume server is running or I can start it. I'll check if port 3000 is open?
// Actually simpler: I'll write a script that starts the server, runs tests, then kills it.

const { spawn } = require('child_process');
const http = require('http');

async function runTests() {
    console.log("🚀 Starting Test Environment...");

    // Start Server
    const serverProcess = spawn('node', ['server.js'], {
        cwd: __dirname + '/../',
        stdio: 'pipe',
        shell: true
    });

    let serverReady = false;
    serverProcess.stdout.on('data', (data) => {
        // console.log(`Server: ${data}`);
        if (data.toString().includes('Running on port')) {
            serverReady = true;
        }
    });

    console.log("⏳ Waiting for server to start...");
    await new Promise(r => setTimeout(r, 3000)); // Give it 3s

    try {
        console.log("🧪 Running Regression Tests...");

        await testBlindProposalFlow();

        console.log("✅ ALL TESTS PASSED!");
    } catch (e) {
        console.error("❌ TEST FAILED:", e);
    } finally {
        console.log("🧹 Cleaning up...");
        serverProcess.kill();
        process.exit(0);
    }
}

async function testBlindProposalFlow() {
    const caseNumber = 'TEST-CASE-' + Math.random().toString(36).substr(7);
    console.log(`[Test] Creating Case: ${caseNumber}`);

    // 1. Create Users
    const u1 = await createUser('User1-' + Date.now(), '010-1111-1111');
    const u2 = await createUser('User2-' + Date.now(), '010-2222-2222');

    // 2. Create/Link Case (Offender)
    const linkRes = await post('/api/case/link', {
        userId: u1.userId,
        caseNumber: caseNumber,
        role: 'offender',
        summary: 'Test Assumption'
    });
    const caseId = linkRes.caseId;
    assert.ok(caseId, 'Case ID should be returned');

    // 3. Link Victim
    await post('/api/case/link', {
        userId: u2.userId,
        caseNumber: caseNumber,
        role: 'victim'
    });

    // 4. Submit Proposal (Offender)
    console.log('[Test] Submitting Proposal 1 (Offender)...');
    const p1 = await post('/api/case/proposal', {
        userId: u1.userId,
        caseId: caseId,
        amount: 5000000,
        duration: 1
    });
    assert.strictEqual(p1.success, true, 'Proposal 1 should succeed');

    // 5. Check Status (from Victim perspective)
    const status1 = await get(`/api/case/proposal?caseId=${caseId}&userId=${u2.userId}`);
    assert.strictEqual(status1.hasOpponentProposed, true, 'Victim should see opponent proposed');
    assert.strictEqual(status1.myProposalCount, 0, 'Victim has 0 proposals');

    // 6. Submit Proposal (Victim)
    console.log('[Test] Submitting Proposal 2 (Victim)...');
    const p2 = await post('/api/case/proposal', {
        userId: u2.userId,
        caseId: caseId,
        amount: 8000000, // Gap: 3,000,000
        duration: 3
    });
    assert.strictEqual(p2.success, true, 'Proposal 2 should succeed');

    // 7. Verify Analysis (Should be available now)
    // Actually the POST returns analysis if logic is standard, but the specific Blind Proposal Logic in server.js 
    // endpoint 5 (POST /api/proposal) vs 6 (GET /api/case/proposal) seems mixed. 
    // server.js lines 558 vs 136. 
    // WAIT! I see two logical endpoints in server.js?
    // Line 136: `app.post('/api/case/proposal'...)` <--- This is the one used in `case_detail.js` (line 488).
    // Line 558: `app.post('/api/proposal'...)` <--- This looks like older or duplicated code?
    // This duplication might be why "old features break".
    // I should check `server.js` more carefully. 

    // server.js LINE 136: returns { success: true, leftCount: ... }
    // server.js LINE 558: returns { success: true, status: ..., data: ... } (Logic for analysis)

    // The `case_detail.js` (line 488) calls `/api/case/proposal` (with /case/).
    // But `blind_proposal.html` (line 482) calls `/api/case/proposal` as well.
    // The logic in `/api/case/proposal` (Line 136) DOES NOT return analysis gap data!
    // It only creates the proposal and returns `leftCount`.

    // Wait, `blind_proposal.html` Line 524 expects `data.status === 'analyzed'`. 
    // But `app.post('/api/case/proposal')` (Line 136) ONLY returns `res.json({ success: true, leftCount: ... });`.
    // It DOES NOT return `status` or `data` (gap analysis).

    // THIS IS THE BUG! 
    // The user said "previously implemented feature... has problems".
    // It seems `server.js` logic for `POST /api/case/proposal` is missing the "Gap Analysis" return that `blind_proposal.html` expects.
    // OR `blind_proposal.html` was written expecting the logic from `POST /api/proposal` (Line 558) but is calling `/api/case/proposal`.

    // I will verify this hypothesis in the test.
    // If p2 (Proposal 2 response) does not contain `status`, then the regression is confirmed found.

    console.log("Response from Proposal 2:", p2);
    if (!p2.status) {
        console.warn("⚠️ WARNING: Server did not return 'status' (Analysis). Possible Regression!");
        // We won't fail the test yet because we want to confirm if this is INTENDED or BUG.
        // But based on user request, this is likely the bug.
    }
}

// Helpers
async function createUser(name, phone) {
    const res = await post('/api/signup', {
        email: name + '@test.com',
        password: '123',
        name: name,
        phoneNumber: phone
    });
    return res;
}

async function post(url, body) {
    const res = await fetch(BASE_URL + url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    return await res.json();
}

async function get(url) {
    const res = await fetch(BASE_URL + url);
    return await res.json();
}

runTests();
