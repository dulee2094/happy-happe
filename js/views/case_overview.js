// js/views/case_overview.js
// Handles Overview and Quick Action Buttons
console.log("✅ js/views/case_overview.js loaded");

window.getOverviewHTML = function () {
    const caseNumber = localStorage.getItem('current_case_number') || '-';
    const caseTitle = localStorage.getItem('current_case_title') || '';
    const myRole = localStorage.getItem('current_case_role') || 'offender';
    const status = localStorage.getItem('current_case_status') || 'pending';
    const counterparty = localStorage.getItem('current_counterparty') || '상대방';
    const date = localStorage.getItem('current_case_date') || new Date().toLocaleDateString();

    const isConnected = ['connected', 'negotiating', 'completed'].includes(status);
    const isNegotiating = ['negotiating', 'completed'].includes(status);
    const isAgreed = ['completed'].includes(status);
    const isEscrow = false;

    let titleRow = '';
    if (caseTitle) {
        titleRow = `
            <div class="info-row" style="padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <span style="color: var(--text-muted);">방 제목</span>
                <span class="info-val">${caseTitle}</span>
            </div>`;
    }

    return `
        <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
            <div class="glass-card">
                <h3 style="margin-bottom: 20px;"><i class="fas fa-info-circle"></i> 사건 정보</h3>
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    ${titleRow}
                    <div class="info-row" style="padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <span style="color: var(--text-muted);">사건번호</span>
                        <span class="info-val">${caseNumber}</span>
                    </div>
                    <div class="info-row" style="padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <span style="color: var(--text-muted);">내 역할</span>
                        <span class="info-val">${window.getRoleText(myRole)}</span>
                    </div>
                    <div class="info-row" style="padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <span style="color: var(--text-muted);">상대방</span>
                        <span class="info-val">${counterparty}</span>
                    </div>
                    <div class="info-row" style="padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <span style="color: var(--text-muted);">등록일</span>
                        <span class="info-val">${date}</span>
                    </div>
                    <div class="info-row">
                        <span style="color: var(--text-muted);">연결 상태</span>
                        <span class="info-val" style="color: var(--secondary);">${window.getStatusText(status)}</span>
                    </div>
                </div>
            </div>

            <div class="glass-card">
                <h3 style="margin-bottom: 20px;"><i class="fas fa-tasks"></i> 진행 현황</h3>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <i class="fas fa-check-circle" style="color: var(--secondary); font-size: 1.2rem;"></i>
                        <span>본인 인증 완료</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <i class="${window.getIconClass(isConnected)}" style="color: ${window.getColor(isConnected)}; font-size: 1.2rem; opacity: ${window.getOpacity(isConnected)}"></i>
                        <span style="opacity: ${window.getOpacity(isConnected)}">상대방 연결</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <i class="${window.getIconClass(isNegotiating)}" style="color: ${window.getColor(isNegotiating)}; font-size: 1.2rem; opacity: ${window.getOpacity(isNegotiating)}"></i>
                        <span style="opacity: ${window.getOpacity(isNegotiating)}">합의금 협상</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <i class="${window.getIconClass(isAgreed)}" style="color: ${window.getColor(isAgreed)}; font-size: 1.2rem; opacity: ${window.getOpacity(isAgreed)}"></i>
                        <span style="opacity: ${window.getOpacity(isAgreed)}">최종 합의서 작성</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <i class="${window.getIconClass(isEscrow)}" style="color: ${window.getColor(isEscrow)}; font-size: 1.2rem; opacity: ${window.getOpacity(isEscrow)}"></i>
                        <span style="opacity: ${window.getOpacity(isEscrow)}">에스크로 입금</span>
                    </div>
                </div>
            </div>

            ${window.getQuickActionsHTML(myRole)}

            <div class="glass-card" style="grid-column: 1 / -1;">
                <h3 style="margin-bottom: 20px;"><i class="fas fa-history"></i> 최근 활동 (Beta)</h3>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <input type="text" disabled value="최근 활동 내역이 없습니다." style="background:none; border:none; color: var(--text-muted);">
                </div>
            </div>
        </div>
    `;
};

window.getQuickActionsHTML = function (role) {
    const status = localStorage.getItem('current_case_status');
    const isConnected = ['connected', 'negotiating', 'completed'].includes(status);
    const isNegotiating = ['negotiating', 'completed'].includes(status);
    const isCompleted = status === 'completed';

    const getBtnState = (isCompleted, isCurrent) => {
        if (isCompleted) return { class: 'status-completed', icon: 'fa-check-circle', disabled: '' };
        if (isCurrent) return { class: 'status-current pulse', icon: 'fa-exclamation-circle', disabled: '' };
        return { class: '', icon: 'fa-lock', disabled: 'disabled style="opacity:0.5; cursor:not-allowed;"' };
    };

    const btnRequest = getBtnState(isConnected, !isConnected);
    const btnApology = getBtnState(isNegotiating, isConnected && !isNegotiating);
    const btnProposal = getBtnState(isCompleted, isNegotiating && !isCompleted);
    const btnAgreement = getBtnState(false, isCompleted);
    const btnAccount = getBtnState(false, isCompleted);

    if (role === 'offender') {
        return `
            <div class="glass-card" style="grid-column: 1 / -1;">
                <h3 style="margin-bottom: 20px;"><i class="fas fa-bolt"></i> 빠른 실행 (피의자용)</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <button class="btn btn-glass ${btnRequest.class}" onclick="location.href='invite.html'" ${btnRequest.disabled}>
                        <i class="fas ${btnRequest.icon}" style="margin-right: 8px;"></i>합의요청
                    </button>
                    <button class="btn btn-glass ${btnApology.class}" onclick="activateMenu('apology')" ${btnApology.disabled}>
                        <i class="fas ${btnApology.icon}" style="margin-right: 8px;"></i>사과문 작성
                    </button>
                    <button class="btn btn-glass ${btnProposal.class}" onclick="activateMenu('proposal')" ${btnProposal.disabled}>
                        <i class="fas ${btnProposal.icon}" style="margin-right: 8px;"></i>합의금 제안
                    </button>
                    <button class="btn btn-glass ${btnAgreement.class}" onclick="activateMenu('agreement')" ${btnAgreement.disabled}>
                        <i class="fas ${btnAgreement.icon}" style="margin-right: 8px;"></i>합의서 작성
                    </button>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="glass-card" style="grid-column: 1 / -1;">
                <h3 style="margin-bottom: 20px;"><i class="fas fa-bolt"></i> 빠른 실행 (피해자용)</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <button class="btn btn-glass ${btnRequest.class}" onclick="location.href='invite.html'" ${btnRequest.disabled}>
                        <i class="fas ${btnRequest.icon}" style="margin-right: 8px;"></i>합의요청
                    </button>
                    <button class="btn btn-glass ${btnApology.class}" onclick="activateMenu('apology')" ${btnApology.disabled}>
                        <i class="fas ${btnApology.icon}" style="margin-right: 8px;"></i>사과문 확인
                    </button>
                    <button class="btn btn-glass ${btnProposal.class}" onclick="activateMenu('proposal')" ${btnProposal.disabled}>
                        <i class="fas ${btnProposal.icon}" style="margin-right: 8px;"></i>합의금 제안
                    </button>
                    <button class="btn btn-glass ${btnAccount.class}" onclick="activateMenu('account')" ${btnAccount.disabled}>
                        <i class="fas ${btnAccount.icon}" style="margin-right: 8px;"></i>계좌 정보 등록
                    </button>
                    <button class="btn btn-glass ${btnAgreement.class}" onclick="activateMenu('agreement')" ${btnAgreement.disabled}>
                        <i class="fas ${btnAgreement.icon}" style="margin-right: 8px;"></i>합의서 작성
                    </button>
                </div>
            </div>
        `;
    }
};
