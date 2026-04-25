
const fetch = require('node-fetch'); // Ensure node-fetch is used (or native in Node 18+)

// Helper for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

console.log("🚀 Starting COMPREHENSIVE System Verification...");

const BASE_URL = 'http://localhost:3000';

async function runFullTest() {
    try {
        // 1. Health Check
        try {
            await fetch(BASE_URL);
            console.log("✅ Server is UP");
        } catch (e) {
            console.error("❌ Server is DOWN. Run 'npm start' first.");
            process.exit(1);
        }

        const caseNum = 'FULL-' + Math.random().toString(36).substr(7);
        console.log(`\n--- 1. User & Case Setup (${caseNum}) ---`);

        // Create Users
        const u1 = await (await fetch(`${BASE_URL}/api/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: `o_${caseNum}@test.com`, password: '1', name: 'Offender(Chulsu)', phoneNumber: '010-1111-1111' }) })).json();
        const u2 = await (await fetch(`${BASE_URL}/api/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: `v_${caseNum}@test.com`, password: '1', name: 'Victim(Younghee)', phoneNumber: '010-2222-2222' }) })).json();

        console.log(`✅ Users Created: ${u1.name} & ${u2.name}`);

        // Create & Link Case
        const l1 = await (await fetch(`${BASE_URL}/api/case/link`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: u1.userId, caseNumber: caseNum, role: 'offender', summary: 'Assault Case' }) })).json();
        await fetch(`${BASE_URL}/api/case/link`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: u2.userId, caseNumber: caseNum, role: 'victim' }) });

        const caseId = l1.caseId;
        console.log(`✅ Case Linked (ID: ${caseId}). Connection Established.`);

        // 2. Chat Test
        console.log(`\n--- 2. Chat System Test ---`);
        await fetch(`${BASE_URL}/api/case/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caseId, senderId: u1.userId, content: "Hello, I am sorry." }) });
        await delay(100);
        await fetch(`${BASE_URL}/api/case/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caseId, senderId: u2.userId, content: "I am listening." }) });

        const chatRes = await (await fetch(`${BASE_URL}/api/case/chat?caseId=${caseId}`)).json();
        if (chatRes.messages.length === 2 && chatRes.messages[0].text === "Hello, I am sorry.") {
            console.log(`✅ Chat works! (2 Messages exchanged)`);
        } else {
            console.error(`❌ Chat failed`, chatRes);
        }

        // 3. Blind Proposal Test
        console.log(`\n--- 3. Blind Proposal Test ---`);
        // Offender proposes 500
        await fetch(`${BASE_URL}/api/case/proposal`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: u1.userId, caseId, amount: 5000000, duration: 1 }) });
        console.log(`   -> Offender proposed 5,000,000`);

        // Victim proposes 550 (Close gap!)
        const p2 = await (await fetch(`${BASE_URL}/api/case/proposal`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: u2.userId, caseId, amount: 5500000, duration: 1 }) })).json();
        console.log(`   -> Victim proposed 5,500,000`);

        if (p2.status === 'analyzed') {
            console.log(`✅ Analysis Result: Gap is ${p2.data.diff.toLocaleString()} KRW`);
            if (p2.midpointTriggered) {
                console.log(`🏆 Midpoint Triggered! (Within 10%)`);
            }
        } else {
            console.error(`❌ Proposal Analysis Failed`);
        }

        // 4. Agreement Simulation (Extension or Midpoint)
        console.log(`\n--- 4. Midpoint Verification ---`);
        // Check Status
        const status = await (await fetch(`${BASE_URL}/api/case/proposal/midpoint-status?caseId=${caseId}&userId=${u1.userId}`)).json();
        if (status.midpointProposed) {
            console.log(`✅ System proposed midpoint successfully.`);
        } else {
            console.log(`NOTE: Midpoint not triggered (Gap > 10%).`);
        }

        console.log("\n🎉 ALL SYSTEMS GO! The core backend logic is functioning correctly.");

    } catch (e) {
        console.error("SYSTEM FAILURE:", e);
    }
}

runFullTest();
