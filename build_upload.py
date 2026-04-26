import os
import shutil

src = r"c:\Users\SAMSUNG\OneDrive\바탕 화면\해피 합의"
dest = r"c:\Users\SAMSUNG\OneDrive\바탕 화면\해피 합의\GITHUB_UPLOAD"

print("=== Rebuilding GITHUB_UPLOAD ===")

if os.path.exists(dest):
    shutil.rmtree(dest)
os.makedirs(dest)

def copy_file(rel):
    s = os.path.join(src, rel)
    d = os.path.join(dest, rel)
    os.makedirs(os.path.dirname(d), exist_ok=True)
    if os.path.exists(s):
        shutil.copy2(s, d)
        print(f"  [OK] {rel}")
    else:
        print(f"  [SKIP] {rel}")

def copy_dir(rel):
    s = os.path.join(src, rel)
    d = os.path.join(dest, rel)
    if os.path.exists(s):
        shutil.copytree(s, d, dirs_exist_ok=True)
        print(f"  [DIR] {rel}")
    else:
        print(f"  [SKIP-DIR] {rel}")

print("\n[Root Config]")
copy_file("package.json")
copy_file("server.js")
copy_file("render.yaml")
copy_file(".npmrc")

print("\n[HTML Pages]")
copy_file("index.html")
copy_file("login.html")
copy_file("signup.html")
copy_file("dashboard.html")
copy_file("room.html")
copy_file("admin.html")
copy_file("invite.html")
copy_file("agreement.html")
copy_file("privacy.html")

print("\n[Root JS]")
copy_file("dashboard.js")
copy_file("dashboard_notification_logic.js")
copy_file("case_proposal.js")
copy_file("agreement.js")
copy_file("app.js")

print("\n[CSS]")
copy_file("style.css")
copy_file("agreement.css")
copy_dir("css")

print("\n[Backend]")
copy_dir("config")
copy_dir("models")
copy_dir("routes")
copy_dir("controllers")

print("\n[js/ folder]")
js_files = [
    r"js\blind_proposal.js",
    r"js\dashboard_view.js",
    r"js\case_detail_api.js",
    r"js\case_detail_view.js",
    r"js\case_detail_agreement_view.js",
    r"js\modules\proposal_api.js",
    r"js\modules\proposal_debug.js",
    r"js\modules\proposal_handler.js",
    r"js\modules\proposal_state.js",
    r"js\modules\proposal_ui.js",
    r"js\modules\signature_pad.js",
    r"js\views\case_overview.js",
    r"js\views\case_analysis.js",
    r"js\views\case_lawyer.js",
    r"js\views\case_tabs.js"
]
for f in js_files:
    copy_file(f)

print("\n[Images]")
copy_dir("images")

gi = """node_modules/
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
"""
with open(os.path.join(dest, ".gitignore"), "w", encoding="utf-8") as f:
    f.write(gi)
print("  [OK] .gitignore")

count = sum(len(files) for _, _, files in os.walk(dest))
print(f"\n=== Done: {count} files in GITHUB_UPLOAD ===")
