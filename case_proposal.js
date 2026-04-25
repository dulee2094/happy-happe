// Proposal Logic extracted from case_detail.js

window.selectDuration = (days, btn) => {
    document.getElementById('selectedDuration').value = days;
    // Reset styles
    document.querySelectorAll('.duration-btn').forEach(b => {
        b.style.background = 'rgba(255, 255, 255, 0.05)';
        b.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        b.style.color = 'var(--text-muted)';
    });
    // Active style
    btn.style.background = 'rgba(74, 222, 128, 0.2)';
    btn.style.borderColor = '#4ade80';
    btn.style.color = '#4ade80';
};

window.initializeProposal = async () => {
    const caseId = localStorage.getItem('current_case_id');
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    const realUserId = userInfo.id || 1;

    try {
        const res = await fetch(`/api/case/proposal?caseId=${caseId}&userId=${realUserId}`);
        const data = await res.json();

        if (data.success) {
            // Update Left Count
            const maxCount = 3;
            // The limit logic logic has changed to 5 in server side? 
            // Wait, server logic line 144 says "limit = isExtended ? 8 : 5".
            // Frontend logic in case_detail.js line 433 said "maxCount = 3".
            // This is another mismatch! The frontend hardcoded 3, but server supports 5.
            // I should update this to match server logic.

            const limit = data.isExtended ? 8 : 5;
            const used = data.myProposalCount;
            const left = limit - used;

            const leftEl = document.getElementById('leftCount');
            if (leftEl) leftEl.textContent = Math.max(0, left);

            if (left <= 0) {
                const btn = document.querySelector('#myProposalCard button.btn-primary');
                if (btn) {
                    btn.disabled = true;
                    btn.textContent = '제안 횟수 초과';
                }
                const alertEl = document.getElementById('proposalCountAlert');
                if (alertEl) alertEl.classList.add('shake');
            }

            // Update Opponent Status
            const statusCard = document.getElementById('opponentStatusCard');
            if (statusCard) {
                if (data.hasOpponentProposed) {
                    statusCard.innerHTML = `
                         <div style="width: 80px; height: 80px; background: rgba(74, 222, 128, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; animation: pulse 2s infinite;">
                            <i class="fas fa-envelope-open-text" style="font-size: 2.5rem; color: #4ade80;"></i>
                        </div>
                        <h3 style="margin-bottom: 15px;">📩 상대방이 제안을 등록했습니다!</h3>
                        <p style="color: var(--text-muted); margin-bottom: 30px;">
                            상대방도 희망 금액을 제시했습니다.<br>당신의 금액을 입력하여 격차를 확인해보세요.
                        </p>
                    `;
                } else {
                    statusCard.innerHTML = `
                         <div style="width: 80px; height: 80px; background: rgba(255, 255, 255, 0.05); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                            <i class="far fa-clock" style="font-size: 2.5rem; color: var(--text-muted);"></i>
                        </div>
                        <h3 style="margin-bottom: 15px; color: var(--text-muted);">계속 기다리고 있습니다...</h3>
                        <p style="color: var(--text-muted); opacity: 0.6;">
                            아직 상대방이 제안을 등록하지 않았습니다.<br>먼저 제안을 등록하면 상대방에게 알림이 갑니다.
                        </p>
                    `;
                }
            }

        }
    } catch (e) {
        console.error(e);
    }
};

window.submitProposal = async () => {
    const amount = document.getElementById('proposalAmount').value;
    const durationInput = document.getElementById('selectedDuration');
    const duration = durationInput ? parseFloat(durationInput.value) : null;

    const caseId = localStorage.getItem('current_case_id');
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    const userId = userInfo.id || 1;

    if (!amount) return alert('희망 금액을 입력해주세요.');
    if (!duration) return alert('유효 기간을 선택해주세요.');

    if (!confirm(`${amount}만원으로 제안하시겠습니까? (남은 횟수가 차감됩니다)`)) return;

    try {
        const res = await fetch('/api/case/proposal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, caseId, amount, duration })
        });
        const data = await res.json();

        if (data.success) {
            // Check for Analysis Result (Regression Fix Support)
            if (data.status === 'analyzed') {
                // If we are in the main Page proposal modal (not blind_proposal.html), we might want to show result.
                // But simply alerting for now or refreshing is default behavior in case_detail.js
                alert(`제안이 등록되었습니다.\n\n[분석 결과]\n상대방과의 금액 차이: ${data.data.diff.toLocaleString()}원`);
            } else {
                alert('제안이 성공적으로 등록되었습니다.');
            }

            if (window.initializeProposal) window.initializeProposal(); // Refresh UI
        } else {
            alert(data.error);
        }
    } catch (e) {
        console.error(e);
        alert('제안 등록 중 오류가 발생했습니다.');
    }
};
