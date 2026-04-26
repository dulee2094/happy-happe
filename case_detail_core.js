
// case_detail_core.js
// Main entry point for the Case Detail Page
// Depends on: case_detail_view.js, case_detail_chat.js, case_detail_docs.js, case_detail_agreement.js

document.addEventListener('DOMContentLoaded', () => {
    // Environment Check Removed (Production Only)

    // --- SAFETY CHECK: Utils Fallback ---
    if (typeof window.getRoleText !== 'function') {
        console.warn('Utils module missing. Defining fallbacks.');
        window.getRoleText = (r) => r === 'offender' ? '제안자' : '상대방';
        window.getStatusText = (s) => s || '상태 미정';
        window.getIconClass = () => 'fas fa-question';
        window.getColor = () => '#ccc';
        window.getOpacity = () => '0.5';
    }

    // 1. Load Data (Protected)
    try {
        loadCaseData();
    } catch (e) {
        console.error("Critical Error in loadCaseData:", e);
        // Continue execution despite error
    }

    // 2. Initialize Menu Listeners (Protected)
    try {
        initializeMenu();
    } catch (e) {
        console.error("Error initializing menu:", e);
    }

    // 3. Session Integrity Check
    try {
        const initialUserId = localStorage.getItem('user_id');
        if (initialUserId) {
            setInterval(() => {
                const currentUserId = localStorage.getItem('user_id');
                if (currentUserId !== initialUserId) {
                    window.location.reload();
                }
            }, 2000);

            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') {
                    const currentUserId = localStorage.getItem('user_id');
                    if (currentUserId !== initialUserId) window.location.reload();
                }
            });
        }
    } catch (err) {
        console.warn('Session integrity check failed:', err);
    }

    // 4. Load Initial Content
    try {
        const savedTab = localStorage.getItem('active_tab_on_load');
        if (savedTab && window.activateMenu) {
            window.activateMenu(savedTab);
            localStorage.removeItem('active_tab_on_load');
        } else {
            // Default load
            if (typeof window.loadContent === 'function') {
                window.loadContent('overview');
            } else {
                console.error("loadContent function missing");
                const area = document.getElementById('contentArea');
                if (area) area.innerHTML = '<div style="color:red; padding:20px; text-align:center;">시스템 초기화 오류: loadContent 함수를 찾을 수 없습니다. 페이지를 새로고침 해주세요.</div>';
            }
        }
    } catch (err) {
        console.error("Initial load failed:", err);
        const contentArea = document.getElementById('contentArea');
        if (contentArea) contentArea.innerHTML = `<div class="glass-card" style="padding:20px; text-align:center; color:#ff6b6b;">초기화 중 오류 발생: ${err.message}</div>`;
    }

    // 5. Check Toast Messages
    if (localStorage.getItem('show_draft_applied_msg') === 'true') {
        setTimeout(() => {
            alert("📝 AI가 작성한 초안이 적용되었습니다.\n내용을 확인하고 [디자인 미리보기 및 전송]을 진행해주세요.");
        }, 500);
        localStorage.removeItem('show_draft_applied_msg');
    }

    // 6. Start Polling for Apology Status
    try {
        startApologyPolling();
    } catch (e) { console.warn("Polling init failed", e); }
});

function startApologyPolling() {
    const caseId = localStorage.getItem('current_case_id');
    if (!caseId) return;

    // Check every 3 seconds
    setInterval(() => {
        fetch(`/api/case/apology?caseId=${caseId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const currentStatus = localStorage.getItem('current_apology_status');

                    // If status changed from 'none' to 'sent' (or anything else)
                    if (data.status !== 'none' && data.status !== currentStatus) {
                        localStorage.setItem('current_apology_status', data.status);
                        localStorage.setItem('current_apology_content', data.content);
                        if (data.date) {
                            const d = new Date(data.date);
                            localStorage.setItem('current_apology_date', d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                        }

                        // Check active tab
                        const activeItem = document.querySelector('.nav-item.active');
                        const activeMenu = activeItem ? activeItem.dataset.menu : '';

                        if (activeMenu === 'apology') {
                            // Reload content to show the new apology
                            window.loadContent('apology');
                        }
                    }
                }
            })
            .catch(err => console.error('Polling error:', err));
    }, 3000);
}

function loadCaseData() {
    const caseNumber = localStorage.getItem('current_case_number');
    const caseTitle = localStorage.getItem('current_case_title');
    const myRole = localStorage.getItem('current_case_role');
    const status = localStorage.getItem('current_case_status');
    const counterparty = localStorage.getItem('current_counterparty');

    // Safe retrieval of elements
    const elHeaderCase = document.getElementById('headerCaseNumber');
    const elHeaderRole = document.getElementById('headerMyRole');
    const elHeaderCounter = document.getElementById('headerCounterparty');
    const elHeaderStatus = document.getElementById('headerStatus');
    const elSidebarCase = document.getElementById('sidebarCaseNumber');
    const elSidebarCounter = document.getElementById('sidebarCounterparty');

    const displayTitle = caseTitle || caseNumber || '사건 정보 없음';

    if (elHeaderCase) {
        elHeaderCase.textContent = displayTitle;
        if (caseTitle && caseNumber) elHeaderCase.setAttribute('title', `사건번호: ${caseNumber}`);
    }

    // Use fallback-safe utils
    if (elHeaderRole) elHeaderRole.textContent = window.getRoleText ? window.getRoleText(myRole) : (myRole || '-');
    if (elHeaderCounter) elHeaderCounter.textContent = counterparty || '-';
    if (elHeaderStatus) elHeaderStatus.textContent = window.getStatusText ? window.getStatusText(status) : (status || '-');

    if (elSidebarCase) elSidebarCase.textContent = displayTitle;
    if (elSidebarCounter) elSidebarCounter.textContent = counterparty || '-';

    // Sync Apology Status (Async, safe)
    const caseId = localStorage.getItem('current_case_id');
    if (caseId) {
        fetch(`/api/case/apology?caseId=${caseId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.status !== 'none') {
                    localStorage.setItem('current_apology_status', data.status);
                    localStorage.setItem('current_apology_content', data.content);
                    if (data.date) {
                        const d = new Date(data.date);
                        localStorage.setItem('current_apology_date', d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                    }
                }
            })
            .catch(err => console.error('Sync error:', err));
    }
}

function initializeMenu() {
    const menuItems = document.querySelectorAll('.nav-item[data-menu]');

    // Expose activateMenu globally
    window.activateMenu = function (menuName) {
        const targetItem = document.querySelector(`.nav-item[data-menu="${menuName}"]`);
        if (targetItem) {
            menuItems.forEach(mi => mi.classList.remove('active'));
            targetItem.classList.add('active');
        }
        window.loadContent(menuName);
        window.scrollTo(0, 0);
    };

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const menuName = item.dataset.menu;
            window.activateMenu(menuName);
        });
    });
}

// Global router function
window.loadContent = function (menuName) {
    const contentArea = document.getElementById('contentArea');
    if (!contentArea) return;

    // Helper function to check if function exists and execute safely with retry
    const safeCall = (funcName, fallbackHTML) => {
        if (typeof window[funcName] === 'function') {
            try {
                return window[funcName]();
            } catch (e) {
                console.error(`Error executing ${funcName}:`, e);
                return `
                    <div class="glass-card" style="max-width: 600px; margin: 20px auto; padding: 30px; text-align: center; border: 1px solid #ff6b6b;">
                        <div style="font-size: 2rem; margin-bottom: 15px; color: #ff6b6b;">⚠️</div>
                        <h3 style="margin-bottom: 15px; color: #ff6b6b;">화면 렌더링 오류</h3>
                        <p style="color: var(--text-muted); margin-bottom: 15px;">
                            화면을 구성하는 도중 문제가 발생했습니다.<br>
                            (함수: ${funcName})
                        </p>
                        <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; text-align: left; font-family: monospace; font-size: 0.8rem; color: #ffcccc; overflow-x: auto;">
                            ${e.message}
                        </div>
                    </div>
                `;
            }
        } else {
            // Retry logic for slow loading scripts
            setTimeout(() => {
                if (typeof window[funcName] === 'function') {
                    // If it became available, re-render the content area
                    const reContent = window[funcName]();
                    const area = document.getElementById('contentArea');
                    if (area) area.innerHTML = reContent;
                }
            }, 500);

            console.error(`${funcName} is not defined`);
            return fallbackHTML || `
                <div class="glass-card" style="max-width: 600px; margin: 0 auto; text-align: center; padding: 60px 20px;">
                    <div style="font-size: 3rem; margin-bottom: 20px;">⏳</div>
                    <h3 style="margin-bottom: 15px;">화면을 불러오는 중...</h3>
                    <p style="color: var(--text-muted); margin-bottom: 30px;">
                        잠시만 기다려주세요.<br>
                        (리소스 로딩 중: ${funcName})
                    </p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-redo"></i> 새로고침
                    </button>
                </div>
            `;
        }
    };

    switch (menuName) {
        case 'overview':
            contentArea.innerHTML = safeCall('getOverviewHTML');
            break;
        case 'proposal':
            contentArea.innerHTML = safeCall('getProposalHTML');
            // initializeProposal is possibly from case_proposal.js if it exists, checking import order.
            if (window.initializeProposal) window.initializeProposal();
            break;
        case 'analysis':
            contentArea.innerHTML = safeCall('getAnalysisHTML');
            setTimeout(() => { if (window.initializeChart) window.initializeChart(); }, 100);
            break;
        case 'chat':
            contentArea.innerHTML = safeCall('getChatHTML');
            if (window.initializeChat) window.initializeChat();
            break;
        case 'apology':
            contentArea.innerHTML = safeCall('getApologyHTML');
            if (window.loadApologyImage) window.loadApologyImage();
            break;
        case 'agreement':
            contentArea.innerHTML = safeCall('getAgreementHTML');
            break;
        case 'documents':
            contentArea.innerHTML = safeCall('getDocumentsHTML');
            if (window.loadDocuments) window.loadDocuments();
            break;
        case 'mediation':
            contentArea.innerHTML = safeCall('getMediationHTML');
            break;
        case 'account':
            contentArea.innerHTML = safeCall('getAccountInfoHTML');
            setTimeout(() => {
                if (window.initializeSignaturePad) window.initializeSignaturePad();
                if (window.loadPaymentRequestStatus) window.loadPaymentRequestStatus();
            }, 100);
            break;
        default:
            contentArea.innerHTML = safeCall('getOverviewHTML');
    }
};

window.goToStep2 = function () {
    const step1 = document.getElementById('step1_verification');
    const step2 = document.getElementById('step2_action');
    if (step1 && step2) {
        step1.style.display = 'none';
        step2.style.display = 'block';
        window.scrollTo(0, 0);
    }
};
