const fs = require('fs');
const path = require('path');

const src = __dirname;
const dest = path.join(__dirname, "GITHUB_UPLOAD");

console.log("=== Rebuilding GITHUB_UPLOAD ===");

try {
    if (fs.existsSync(dest)) {
        console.log("Removing existing directory...");
        fs.rmSync(dest, { recursive: true, force: true });
    }
} catch (e) {
    console.error("Failed to remove directory:", e.message);
}

try {
    fs.mkdirSync(dest, { recursive: true });
} catch (e) {
    console.error("Failed to create directory:", e.message);
}

function copyFile(rel) {
    try {
        const s = path.join(src, rel);
        const d = path.join(dest, rel);
        fs.mkdirSync(path.dirname(d), { recursive: true });
        if (fs.existsSync(s)) {
            fs.copyFileSync(s, d);
            console.log(`  [OK] ${rel}`);
        } else {
            console.log(`  [SKIP] ${rel}`);
        }
    } catch (e) {
        console.error(`  [ERROR] Failed to copy ${rel}:`, e.message);
    }
}

function copyDir(rel) {
    try {
        const s = path.join(src, rel);
        const d = path.join(dest, rel);
        if (fs.existsSync(s)) {
            fs.cpSync(s, d, { recursive: true });
            console.log(`  [DIR] ${rel}`);
        } else {
            console.log(`  [SKIP-DIR] ${rel}`);
        }
    } catch (e) {
        console.error(`  [ERROR] Failed to copy directory ${rel}:`, e.message);
    }
}

console.log("\n[Root Config]");
copyFile("package.json");
copyFile("server.js");
copyFile("render.yaml");
copyFile(".npmrc");

console.log("\n[HTML Pages]");
copyFile("index.html");
copyFile("login.html");
copyFile("signup.html");
copyFile("dashboard.html");
copyFile("room.html");
copyFile("admin.html");
copyFile("invite.html");
copyFile("agreement.html");
copyFile("privacy.html");

console.log("\n[Root JS]");
copyFile("dashboard.js");
copyFile("dashboard_notification_logic.js");
copyFile("case_proposal.js");
copyFile("agreement.js");
copyFile("app.js");

console.log("\n[CSS]");
copyFile("style.css");
copyFile("agreement.css");
copyDir("css");

console.log("\n[Backend]");
copyDir("config");
copyDir("models");
copyDir("routes");
copyDir("controllers");

console.log("\n[js/ folder]");
const jsFiles = [
    "js\\blind_proposal.js",
    "js\\dashboard_view.js",
    "js\\case_detail_api.js",
    "js\\case_detail_view.js",
    "js\\case_detail_agreement_view.js",
    "js\\modules\\proposal_api.js",
    "js\\modules\\proposal_debug.js",
    "js\\modules\\proposal_handler.js",
    "js\\modules\\proposal_state.js",
    "js\\modules\\proposal_ui.js",
    "js\\modules\\signature_pad.js",
    "js\\views\\case_overview.js",
    "js\\views\\case_analysis.js",
    "js\\views\\case_lawyer.js",
    "js\\views\\case_tabs.js"
];
for (const f of jsFiles) {
    copyFile(f);
}

console.log("\n[Images]");
copyDir("images");

const gi = `node_modules/
.env
.env.*
database.sqlite
*.sqlite
*.sqlite3
*.log
npm-debug.log*
.DS_Store
Thumbs.db
tests/
test-results/
playwright-report/
playwright.config.js
*.bak
*.old
`;
try {
    fs.writeFileSync(path.join(dest, ".gitignore"), gi, "utf8");
    console.log("  [OK] .gitignore");
} catch (e) {
    console.error("  [ERROR] Failed to write .gitignore:", e.message);
}

function countFiles(dirPath) {
    let count = 0;
    try {
        const items = fs.readdirSync(dirPath);
        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            if (fs.statSync(fullPath).isDirectory()) {
                count += countFiles(fullPath);
            } else {
                count++;
            }
        }
    } catch (e) {
        // ignore
    }
    return count;
}

const count = countFiles(dest);
console.log(`\n=== Done: ${count} files in GITHUB_UPLOAD ===`);
