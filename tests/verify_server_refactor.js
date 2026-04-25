const http = require('http');

function checkEndpoint(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({ statusCode: res.statusCode, data: data });
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function runTests() {
    console.log("Starting Server Refactor Verification...");

    try {
        // Test 1: Static File Serving (Root)
        try {
            const rootRes = await checkEndpoint('/');
            if (rootRes.statusCode === 200) {
                console.log("✅ [Pass] Static File Serving (/)");
            } else {
                console.log(`❌ [Fail] Static File Serving (/): Status ${rootRes.statusCode}`);
            }
        } catch (e) {
            console.log("❌ [Fail] Server not reachable. Is it running?");
            process.exit(1);
        }

        // Test 2: Auth Route (Mock Login - Invalid)
        const loginRes = await checkEndpoint('/api/login', 'POST', { email: 'test@test.com', password: 'wrong' });
        if (loginRes.statusCode === 401) {
            console.log("✅ [Pass] Auth Route (/api/login)");
        } else {
            console.log(`❌ [Fail] Auth Route (/api/login): Status ${loginRes.statusCode} - ${loginRes.data}`);
        }

        // Test 3: Case Route (Get Status - No User)
        // Expected: { found: false, cases: [] }
        const statusRes = await checkEndpoint('/api/case/status?userId=');
        try {
            const json = JSON.parse(statusRes.data);
            if (statusRes.statusCode === 200 && json.found === false) {
                console.log("✅ [Pass] Case Route (/api/case/status)");
            } else {
                console.log(`❌ [Fail] Case Route (/api/case/status): Unexpected response ${statusRes.data}`);
            }
        } catch (e) {
            console.log(`❌ [Fail] Case Route: Invalid JSON ${statusRes.data}`);
        }

        console.log("Verification Complete.");
        process.exit(0);

    } catch (e) {
        console.error("Test Error:", e);
        process.exit(1);
    }
}

// Wait a moment for server to start if running immediately after
setTimeout(runTests, 2000);
