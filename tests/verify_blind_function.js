// Simplified test dependency
const express = require('express');
const bodyParser = require('body-parser');

// MOCK SERVER SETUP (To isolate from running instance and DB)
// We will basically verify the LOGIC of server.js by replicating the exact functions 
// or by requiring the app if possible. 
// However, since server.js isn't easily exportable without side effects, I will copy the RELEVANT logic 
// into a test harness here to verify the ALGORITHM.

// Wait, verifying the copied algorithm doesn't test the actual deployed code.
// Better: I will use `fetch` to hit the LOCALHOST:3000 if it's running.
// If the user says "Check if it works", they imply checking the running state or the code.
// I'll try to hit the running server first. If it fails, I'll report that server might be down.

const fetch = require('node-fetch'); // Ensure node-fetch is available or use built-in if node 18+

async function runLiveTest() {
    console.log("🔍 Starting Live Verification of Blind Proposal Feature...");
    const BASE_URL = 'http://localhost:3000';

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
        const u1 = await (await fetch(`${BASE_URL}/api/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: `o_${caseNum}@test.com`, password: '1', name: 'Offender', phoneNumber: '010-0000-0001' })
        })).json();

        // Create Victim
        const u2 = await (await fetch(`${BASE_URL}/api/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: `v_${caseNum}@test.com`, password: '1', name: 'Victim', phoneNumber: '010-0000-0002' })
        })).json();

        if (!u1.success || !u2.success) throw new Error("Failed to create users");
        console.log(`   Users created: Offender(${u1.userId}), Victim(${u2.userId})`);

        // Link Case (Offender)
        const link1 = await (await fetch(`${BASE_URL}/api/case/link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: u1.userId, caseNumber: caseNum, role: 'offender', summary: 'Verification' })
        })).json();

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
        const prop1 = await (await fetch(`${BASE_URL}/api/case/proposal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: u1.userId, caseId, amount: 5000000, duration: 1 })
        })).json();

        if (!prop1.success) throw new Error("Offender proposal failed: " + prop1.error);

        // Check Response 1
        if (prop1.status === 'analyzed') {
            console.warn("   ⚠️ Unexpected: Status is 'analyzed' but only 1 party proposed.");
        } else {
            console.log("   ✅ Offender sees 'waiting' status (Correct)");
        }

        // Victim Checks Status (Should see opponent proposed)
        console.log("   ➤ Victim checks status (GET)");
        const statusCheck = await (await fetch(`${BASE_URL}/api/case/proposal?caseId=${caseId}&userId=${u2.userId}`)).json();

        if (statusCheck.hasOpponentProposed) {
            console.log("   ✅ Victim sees 'hasOpponentProposed: true' (Correct)");
        } else {
            console.error("   ❌ Victim does NOT see opponent proposal. (Bug?)", statusCheck);
        }

        // Victim Proposes (triggers Analysis)
        console.log("   ➤ Victim submits proposal (8,000,000)");
        const prop2 = await (await fetch(`${BASE_URL}/api/case/proposal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: u2.userId, caseId, amount: 8000000, duration: 3 })
        })).json();

        // 4. Verify Analysis Result
        console.log("\n3️⃣ Verifying Analysis Result");
        console.log("   Response:", JSON.stringify(prop2, null, 2));

        if (prop2.status === 'analyzed') {
            const diff = prop2.data.diff;
            if (diff === 3000000) {
                console.log("   ✅ Gap Analysis Successful! Diff: 3,000,000");
                console.log("   ✅ Feature works normally.");
            } else {
                console.error(`   ❌ Gap Analysis Gap Mismatch. Expected 3000000, got ${diff}`);
            }
        } else {
            console.error("   ❌ Gap Analysis FAILED. Status is " + prop2.status);
            console.log("   This confirms the bug if expected.");
        }

    } catch (e) {
        console.error("CRITICAL ERROR:", e);
    }
}

runLiveTest();
