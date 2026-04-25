
// Verification Script using native fetch (Node 18+)
console.log("🔍 Starting Verification of Blind Proposal Feature...");
const BASE_URL = 'http://localhost:3000';

async function runLiveTest() {
    try {
        // 1. Health Check
        try {
            await fetch(BASE_URL);
            console.log("✅ Server is reachable at " + BASE_URL);
        } catch (e) {
            console.error("❌ Server is NOT reachable. Please ensure 'npm start' is running.");
            process.exit(1);
        }

        // 2. Setup Test Data
        const caseNum = 'CHECK-' + Math.random().toString(36).substr(7);
        console.log(`\n1️⃣ Creating Test Case: ${caseNum}`);

        // Create Offender
        const r1 = await fetch(`${BASE_URL}/api/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: `o_${caseNum}@test.com`, password: '1', name: 'Offender', phoneNumber: '010-0000-0001' })
        });
        const u1 = await r1.json();

        // Create Victim
        const r2 = await fetch(`${BASE_URL}/api/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: `v_${caseNum}@test.com`, password: '1', name: 'Victim', phoneNumber: '010-0000-0002' })
        });
        const u2 = await r2.json();

        if (!u1.success || !u2.success) throw new Error("Failed to create users");
        console.log(`   Users created: Offender(${u1.userId}), Victim(${u2.userId})`);

        // Link Case (Offender)
        const l1 = await fetch(`${BASE_URL}/api/case/link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: u1.userId, caseNumber: caseNum, role: 'offender', summary: 'Verification' })
        });
        const link1 = await l1.json();

        // Link Case (Victim)
        await fetch(`${BASE_URL}/api/case/link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: u2.userId, caseNumber: caseNum, role: 'victim' })
        });

        const caseId = link1.caseId;
        console.log(`   Case Linked. ID: ${caseId}`);

        // 3. Test Blind Proposal Logic
        console.log("\n2️⃣ Testing Proposal Submission & Blind Logic");

        // Offender Proposes
        console.log("   ➤ Offender submits proposal (5,000,000)");
        const p1 = await fetch(`${BASE_URL}/api/case/proposal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: u1.userId, caseId, amount: 5000000, duration: 1 })
        });
        const prop1 = await p1.json();

        if (!prop1.success) throw new Error("Offender proposal failed: " + prop1.error);

        // Check Response 1
        if (prop1.status === 'analyzed') {
            console.warn("   ⚠️ Unexpected: Status is 'analyzed' but only 1 party proposed.");
        } else {
            console.log("   ✅ Offender sees 'waiting' status (Correct)");
        }

        // Victim Checks Status (Should see opponent proposed)
        console.log("   ➤ Victim checks status (GET)");
        const sc = await fetch(`${BASE_URL}/api/case/proposal?caseId=${caseId}&userId=${u2.userId}`);
        const statusCheck = await sc.json();

        if (statusCheck.hasOpponentProposed) {
            console.log("   ✅ Victim sees 'hasOpponentProposed: true' (Correct)");
        } else {
            console.error("   ❌ Victim does NOT see opponent proposal. (Bug?)", statusCheck);
        }

        // Victim Proposes (triggers Analysis)
        console.log("   ➤ Victim submits proposal (8,000,000)");
        const p2 = await fetch(`${BASE_URL}/api/case/proposal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: u2.userId, caseId, amount: 8000000, duration: 3 })
        });
        const prop2 = await p2.json();

        // 4. Verify Analysis Result
        console.log("\n3️⃣ Verifying Analysis Result");
        console.log("   Response:", JSON.stringify(prop2, null, 2));

        if (prop2.status === 'analyzed') {
            const diff = prop2.data.diff;
            if (diff === 3000000) {
                console.log("   ✅ Gap Analysis Successful! Diff: 3,000,000 on POST");
                console.log("   ✅ Feature works normally (POST response).");
            } else {
                console.error(`   ❌ Gap Analysis Gap Mismatch. Expected 3000000, got ${diff}`);
            }
        } else {
            console.error("   ❌ Gap Analysis FAILED. Status is " + prop2.status);
        }

        // 5. Verify Polling Result (Offender checks again)
        console.log("\n4️⃣ Verifying Update for Offender (Polling Simulation)");
        const sc2 = await fetch(`${BASE_URL}/api/case/proposal?caseId=${caseId}&userId=${u1.userId}`);
        const statusCheck2 = await sc2.json();
        if (statusCheck2.status === 'analyzed') {
            const diff = statusCheck2.data.diff;
            if (diff === 3000000) {
                console.log("   ✅ Offender also sees Analysis Result! Diff: 3,000,000");
                console.log("   ✅ System Synchronization Verified.");
            } else {
                console.error(`   ❌ Gap Analysis Mismatch for Offender. Expected 3000000, got ${diff}`);
            }
        } else {
            console.error("   ❌ Offender does NOT see analysis result yet. Status: " + statusCheck2.status);
        }

    } catch (e) {
        console.error("CRITICAL ERROR:", e);
    }
}

runLiveTest();
