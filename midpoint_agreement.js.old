// ============================================
// MIDPOINT AGREEMENT - NEW 2-STEP PROCESS
// ============================================

// Global state for midpoint process
let midpointPhase = 0; // 0: not started, 1: procedure, 2: final, 3: settled
let midpointData = {
    proposed: false,
    amount: null,
    procedureAgreement: { iAgreed: false, oppAgreed: false, bothAgreed: false },
    finalAgreement: { iAgreed: false, oppAgreed: false, bothAgreed: false },
    rejected: false
};

// Check midpoint status (enhanced for 2-step process)
async function checkMidpointStatus() {
    const caseId = localStorage.getItem('current_case_id');
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    const userId = userInfo.id;

    try {
        const res = await fetch(`/api/case/proposal/midpoint-status?caseId=${caseId}&userId=${userId}`);
        const data = await res.json();

        if (data.success && data.midpointProposed) {
            midpointData = {
                proposed: data.midpointProposed,
                amount: data.midpointAmount,
                procedureAgreement: data.procedureAgreement,
                finalAgreement: data.finalAgreement,
                rejected: data.rejected,
                phase: data.phase
            };
            midpointPhase = data.phase;

            // Show appropriate UI based on phase
            if (data.phase === 3) {
                // Phase 3: Settled
                showMidpointSettled();
                return true;
            } else if (data.phase === 2) {
                // Phase 2: Final Agreement
                showMidpointFinalAgreement();
                return true;
            } else if (data.phase === 1) {
                // Phase 1: Procedure Agreement
                showMidpointProcedureAgreement();
                return true;
            }
        }
    } catch (e) {
        console.error('Midpoint status check error:', e);
    }

    return false;
}

// ============================================
// PHASE 1: PROCEDURE AGREEMENT (절차 시작 동의)
// ============================================

function showMidpointProcedureAgreement() {
    const notifArea = document.getElementById('midpointResultArea');
    if (!notifArea) return;

    const { iAgreed, oppAgreed } = midpointData.procedureAgreement;

    // Case A: Opponent agreed first
    if (oppAgreed && !iAgreed) {
        notifArea.style.display = 'block';
        notifArea.innerHTML = `
            <div class="midpoint-card phase-1">
                <!-- Header -->
                <div class="midpoint-header">
                    <div class="midpoint-icon pulse">✨</div>
                    <h2 class="midpoint-title">합의 임박!</h2>
                    <p class="midpoint-subtitle">양측의 제안 금액이 10% 이내로 매우 가까워졌습니다</p>
                </div>

                <!-- Progress Indicator -->
                <div class="progress-grid">
                    <div class="progress-card agreed">
                        <div class="progress-label">상대방</div>
                        <div class="progress-icon">✅</div>
                        <div class="progress-status">동의함</div>
                    </div>
                    <div class="progress-card waiting pulse-border">
                        <div class="progress-label">나</div>
                        <div class="progress-icon bounce">⏳</div>
                        <div class="progress-status">대기중</div>
                    </div>
                </div>

                <!-- Progress Bar -->
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: 50%;"></div>
                </div>

                <!-- Main Message -->
                <div class="message-box highlight">
                    <div class="message-icon">🤝</div>
                    <h3>상대방이 먼저 중간값 합의 절차에 동의했습니다!</h3>
                    <p class="highlight-text">✅ 귀하의 동의만 기다리고 있습니다</p>
                </div>

                <!-- Info Box -->
                <div class="info-box">
                    <div class="info-title">💡 중간값 합의란?</div>
                    <div class="info-content">
                        • 양측 제안의 <strong>정확한 중간 금액</strong>으로 합의<br>
                        • 금액은 <strong>양측 동의 후</strong> 공개됩니다<br>
                        • 공정하고 빠른 합의 성사<br>
                        • 더 이상의 협상 불필요
                    </div>
                </div>

                <!-- Benefits Box -->
                <div class="benefits-box">
                    <div class="benefits-title">💎 지금 동의하시면:</div>
                    <div class="benefits-list">
                        <div class="benefit-item">
                            <span class="benefit-icon">🎯</span>
                            <span>공정한 중간 금액 확인 가능</span>
                        </div>
                        <div class="benefit-item">
                            <span class="benefit-icon">⚡</span>
                            <span>즉시 다음 단계로 진행</span>
                        </div>
                        <div class="benefit-item">
                            <span class="benefit-icon">🎉</span>
                            <span>빠른 합의 성사</span>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="action-buttons">
                    <button class="btn-reject" onclick="handleProcedureDecision(false)">
                        <i class="fas fa-times-circle"></i>
                        거절합니다
                        <span class="btn-subtitle">협상 계속</span>
                    </button>
                    <button class="btn-agree" onclick="handleProcedureDecision(true)">
                        <i class="fas fa-check-circle"></i>
                        동의합니다
                        <span class="btn-subtitle">다음 단계로</span>
                    </button>
                </div>

                <!-- Warning -->
                <div class="warning-box">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>거절 시 협상이 계속되며, 이 기회를 놓칠 수 있습니다</span>
                </div>
            </div>
        `;
    }
    // Case B: I agreed first
    else if (iAgreed && !oppAgreed) {
        notifArea.style.display = 'block';
        notifArea.innerHTML = `
            <div class="midpoint-card phase-1">
                <!-- Header -->
                <div class="midpoint-header">
                    <div class="midpoint-icon">⏰</div>
                    <h2 class="midpoint-title">상대방의 응답 대기 중</h2>
                    <p class="midpoint-subtitle">중간값 합의 절차에 동의하셨습니다</p>
                </div>

                <!-- Progress Indicator -->
                <div class="progress-grid">
                    <div class="progress-card agreed">
                        <div class="progress-label">나</div>
                        <div class="progress-icon">✅</div>
                        <div class="progress-status">동의함</div>
                    </div>
                    <div class="progress-card waiting">
                        <div class="progress-icon bounce">⏳</div>
                        <div class="progress-label">상대방</div>
                        <div class="progress-status">대기중</div>
                    </div>
                </div>

                <!-- Progress Bar -->
                <div class="progress-bar-container">
                    <div class="progress-bar pulse" style="width: 50%;"></div>
                </div>

                <!-- Status Message -->
                <div class="message-box">
                    <p>✅ 귀하는 중간값 합의 절차에 동의하셨습니다</p>
                    <p>상대방이 동의하면 <strong>중간 금액이 공개</strong>되고<br>최종 합의 여부를 결정하실 수 있습니다</p>
                </div>

                <!-- Next Steps -->
                <div class="info-box">
                    <div class="info-title">💡 다음 단계</div>
                    <div class="info-content">
                        • 상대방 동의 시 즉시 알림<br>
                        • 중간 금액 자동 공개<br>
                        • 최종 합의 여부 결정
                    </div>
                </div>

                <p class="hint-text">
                    <i class="fas fa-info-circle"></i>
                    페이지를 새로고침하면 최신 상태를 확인할 수 있습니다
                </p>
            </div>
        `;
    }
}

// Handle procedure decision
async function handleProcedureDecision(agreed) {
    const caseId = localStorage.getItem('current_case_id');
    const userId = localStorage.getItem('user_id');

    const confirmMsg = agreed
        ? "중간값 합의 절차에 동의하시겠습니까?\n\n양측이 모두 동의하면 중간 금액이 공개됩니다."
        : "거절하시겠습니까?\n\n거절 시 협상이 계속되며, 다음 라운드로 진행됩니다.";

    if (!confirm(confirmMsg)) return;

    try {
        const res = await fetch('/api/case/proposal/midpoint-procedure-agree', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, caseId, agreed })
        });
        const result = await res.json();

        if (result.success) {
            if (result.rejected) {
                alert("중간값 합의를 거절하셨습니다.\n협상을 계속 진행합니다.");
                location.reload();
            } else if (result.bothAgreedProcedure) {
                // Both agreed! Move to phase 2
                alert(`양측이 모두 동의했습니다!\n\n중간 금액이 공개됩니다.`);
                location.reload();
            } else {
                alert("동의가 완료되었습니다.\n상대방의 응답을 기다려주세요.");
                location.reload();
            }
        } else {
            alert('오류: ' + result.error);
        }
    } catch (e) {
        console.error(e);
        alert('통신 오류가 발생했습니다.');
    }
}

// ============================================
// PHASE 2: FINAL AGREEMENT (최종 합의 동의)
// ============================================

function showMidpointFinalAgreement() {
    const notifArea = document.getElementById('midpointResultArea');
    if (!notifArea) return;

    const { iAgreed, oppAgreed } = midpointData.finalAgreement;
    const amount = midpointData.amount;
    const amountDisplay = amount ? (amount / 10000).toLocaleString() + '만원' : '계산 중...';

    // Case A: Opponent agreed to final first
    if (oppAgreed && !iAgreed) {
        notifArea.style.display = 'block';
        notifArea.innerHTML = `
            <div class="midpoint-card phase-2">
                <!-- Header -->
                <div class="midpoint-header">
                    <div class="midpoint-icon pulse">🎯</div>
                    <h2 class="midpoint-title">중간 금액 공개!</h2>
                    <p class="midpoint-subtitle">양측이 절차에 동의하여 금액이 공개되었습니다</p>
                </div>

                <!-- Progress Indicator -->
                <div class="progress-grid">
                    <div class="progress-card agreed">
                        <div class="progress-label">상대방</div>
                        <div class="progress-icon">✅</div>
                        <div class="progress-status">최종 동의함</div>
                    </div>
                    <div class="progress-card waiting pulse-border">
                        <div class="progress-label">나</div>
                        <div class="progress-icon bounce">⏳</div>
                        <div class="progress-status">결정 대기</div>
                    </div>
                </div>

                <!-- Progress Bar -->
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: 75%;"></div>
                </div>

                <!-- Amount Display -->
                <div class="amount-display">
                    <div class="amount-label">제안된 최종 합의금</div>
                    <div class="amount-value">${amountDisplay}</div>
                    <div class="amount-subtitle">(양측 제안의 공정한 중간값)</div>
                </div>

                <!-- Comparison -->
                <div class="comparison-box">
                    <div class="comparison-item">
                        <div class="comparison-label">나의 제안</div>
                        <div class="comparison-value" id="myProposalAmount">-</div>
                    </div>
                    <div class="comparison-arrow">→</div>
                    <div class="comparison-item highlight">
                        <div class="comparison-label">중간값</div>
                        <div class="comparison-value">${amountDisplay}</div>
                    </div>
                </div>

                <!-- Main Message -->
                <div class="message-box highlight">
                    <div class="message-icon">🤝</div>
                    <h3>상대방이 이미 최종 합의에 동의했습니다!</h3>
                    <p class="highlight-text">✅ 귀하의 최종 결정만 기다리고 있습니다</p>
                </div>

                <!-- Benefits Box -->
                <div class="benefits-box">
                    <div class="benefits-title">💎 지금 동의하시면:</div>
                    <div class="benefits-list">
                        <div class="benefit-item">
                            <span class="benefit-icon">🎉</span>
                            <span><strong>즉시 합의 성사!</strong></span>
                        </div>
                        <div class="benefit-item">
                            <span class="benefit-icon">⚖️</span>
                            <span>공정한 중간 금액으로 확정</span>
                        </div>
                        <div class="benefit-item">
                            <span class="benefit-icon">✅</span>
                            <span>더 이상의 협상 불필요</span>
                        </div>
                        <div class="benefit-item">
                            <span class="benefit-icon">🚀</span>
                            <span>빠른 사건 종결</span>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="action-buttons">
                    <button class="btn-reject" onclick="handleFinalDecision(false)">
                        <i class="fas fa-times-circle"></i>
                        거절합니다
                        <span class="btn-subtitle">협상 계속</span>
                    </button>
                    <button class="btn-agree pulse" onclick="handleFinalDecision(true)">
                        <i class="fas fa-handshake"></i>
                        최종 합의합니다
                        <span class="btn-subtitle">즉시 타결</span>
                    </button>
                </div>

                <!-- Warning -->
                <div class="warning-box critical">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span><strong>주의:</strong> 한 번 동의하면 취소할 수 없습니다</span>
                </div>
            </div>
        `;
    }
    // Case B: I agreed to final first
    else if (iAgreed && !oppAgreed) {
        notifArea.style.display = 'block';
        notifArea.innerHTML = `
            <div class="midpoint-card phase-2">
                <!-- Header -->
                <div class="midpoint-header">
                    <div class="midpoint-icon">⏰</div>
                    <h2 class="midpoint-title">상대방의 최종 결정 대기 중</h2>
                    <p class="midpoint-subtitle">최종 합의에 동의하셨습니다</p>
                </div>

                <!-- Progress Indicator -->
                <div class="progress-grid">
                    <div class="progress-card agreed">
                        <div class="progress-label">나</div>
                        <div class="progress-icon">✅</div>
                        <div class="progress-status">최종 동의함</div>
                    </div>
                    <div class="progress-card waiting">
                        <div class="progress-label">상대방</div>
                        <div class="progress-icon bounce">⏳</div>
                        <div class="progress-status">결정 대기</div>
                    </div>
                </div>

                <!-- Progress Bar -->
                <div class="progress-bar-container">
                    <div class="progress-bar pulse" style="width: 75%;"></div>
                </div>

                <!-- Amount Display -->
                <div class="amount-display">
                    <div class="amount-label">최종 합의금</div>
                    <div class="amount-value">${amountDisplay}</div>
                </div>

                <!-- Status Message -->
                <div class="message-box success">
                    <p>✅ 귀하는 최종 합의에 동의하셨습니다</p>
                    <p>상대방이 동의하면 <strong>즉시 합의가 성사</strong>됩니다</p>
                </div>

                <!-- Next Steps -->
                <div class="info-box">
                    <div class="info-title">💡 다음 단계</div>
                    <div class="info-content">
                        • 상대방 동의 시 즉시 알림<br>
                        • 사건 상태 "합의 완료"로 변경<br>
                        • 합의서 작성 단계로 이동
                    </div>
                </div>

                <p class="hint-text">
                    <i class="fas fa-info-circle"></i>
                    페이지를 새로고침하면 최신 상태를 확인할 수 있습니다
                </p>
            </div>
        `;
    }
    // Case C: Neither agreed yet (show amount and ask for decision)
    else if (!iAgreed && !oppAgreed) {
        notifArea.style.display = 'block';
        notifArea.innerHTML = `
            <div class="midpoint-card phase-2">
                <!-- Header -->
                <div class="midpoint-header">
                    <div class="midpoint-icon pulse">🎯</div>
                    <h2 class="midpoint-title">중간 금액이 공개되었습니다!</h2>
                    <p class="midpoint-subtitle">양측이 절차에 동의하여 금액이 공개되었습니다</p>
                </div>

                <!-- Amount Display -->
                <div class="amount-display featured">
                    <div class="amount-label">제안된 최종 합의금</div>
                    <div class="amount-value">${amountDisplay}</div>
                    <div class="amount-subtitle">(양측 제안의 공정한 중간값)</div>
                </div>

                <!-- Comparison -->
                <div class="comparison-box">
                    <div class="comparison-item">
                        <div class="comparison-label">나의 제안</div>
                        <div class="comparison-value" id="myProposalAmount">-</div>
                    </div>
                    <div class="comparison-arrow">→</div>
                    <div class="comparison-item highlight">
                        <div class="comparison-label">중간값</div>
                        <div class="comparison-value">${amountDisplay}</div>
                    </div>
                </div>

                <!-- Info Box -->
                <div class="info-box">
                    <div class="info-title">💡 중간값이란?</div>
                    <div class="info-content">
                        양측 제안 금액의 <strong>정확한 중간값</strong>입니다.<br>
                        가장 공정하고 객관적인 합의 금액입니다.
                    </div>
                </div>

                <!-- Question -->
                <div class="message-box highlight">
                    <h3>❓ 이 금액으로 최종 합의하시겠습니까?</h3>
                </div>

                <!-- Action Buttons -->
                <div class="action-buttons">
                    <button class="btn-reject" onclick="handleFinalDecision(false)">
                        <i class="fas fa-times-circle"></i>
                        거절합니다
                        <span class="btn-subtitle">협상 계속</span>
                    </button>
                    <button class="btn-agree pulse" onclick="handleFinalDecision(true)">
                        <i class="fas fa-handshake"></i>
                        최종 합의합니다
                        <span class="btn-subtitle">즉시 타결</span>
                    </button>
                </div>

                <!-- Warning -->
                <div class="warning-box critical">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span><strong>주의:</strong> 한 번 동의하면 취소할 수 없습니다</span>
                </div>
            </div>
        `;
    }

    // Update my proposal amount if available
    if (window.myLastProposalAmount) {
        const myAmountEls = document.querySelectorAll('#myProposalAmount');
        myAmountEls.forEach(el => {
            el.textContent = (window.myLastProposalAmount / 10000).toLocaleString() + '만원';
        });
    }
}

// Handle final decision
async function handleFinalDecision(agreed) {
    const caseId = localStorage.getItem('current_case_id');
    const userId = localStorage.getItem('user_id');

    const confirmMsg = agreed
        ? `정말 최종 합의하시겠습니까?\n\n합의금: ${(midpointData.amount / 10000).toLocaleString()}만원\n\n⚠️ 동의 후에는 취소가 불가능합니다.`
        : "거절하시겠습니까?\n\n거절 시 협상이 계속되며, 다음 라운드로 진행됩니다.";

    if (!confirm(confirmMsg)) return;

    try {
        const res = await fetch('/api/case/proposal/midpoint-final-agree', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, caseId, agreed })
        });
        const result = await res.json();

        if (result.success) {
            if (result.rejected) {
                alert("최종 합의를 거절하셨습니다.\n협상을 계속 진행합니다.");
                location.reload();
            } else if (result.settled) {
                // Settlement complete!
                localStorage.setItem('final_agreed_amount', result.finalAmount);
                localStorage.setItem('current_case_status', 'settled');
                alert(`🎉 축하합니다! 합의가 성립되었습니다!\n\n최종 합의금: ${(result.finalAmount / 10000).toLocaleString()}만원\n\n[확인]을 누르면 사건 상세 페이지로 이동합니다.`);
                location.href = 'case_detail.html';
            } else {
                alert("최종 합의에 동의하셨습니다.\n상대방의 결정을 기다려주세요.");
                location.reload();
            }
        } else {
            alert('오류: ' + result.error);
        }
    } catch (e) {
        console.error(e);
        alert('통신 오류가 발생했습니다.');
    }
}

// ============================================
// PHASE 3: SETTLED (합의 완료)
// ============================================

function showMidpointSettled() {
    const notifArea = document.getElementById('midpointResultArea');
    if (!notifArea) return;

    const amount = midpointData.amount;
    const amountDisplay = amount ? (amount / 10000).toLocaleString() + '만원' : '-';

    notifArea.style.display = 'block';
    notifArea.innerHTML = `
        <div class="midpoint-card phase-3">
            <!-- Success Icon -->
            <div class="success-icon pulse">
                <i class="fas fa-check-circle"></i>
            </div>

            <!-- Header -->
            <div class="midpoint-header">
                <h2 class="midpoint-title success">🎉 합의 성사!</h2>
                <p class="midpoint-subtitle">양측이 모두 동의하여 최종 합의가 성립되었습니다</p>
            </div>

            <!-- Amount Display -->
            <div class="amount-display success">
                <div class="amount-label">최종 합의금</div>
                <div class="amount-value">${amountDisplay}</div>
                <div class="amount-subtitle">중간값 합의로 확정</div>
            </div>

            <!-- Progress Indicator -->
            <div class="progress-grid">
                <div class="progress-card agreed">
                    <div class="progress-label">나</div>
                    <div class="progress-icon">✅</div>
                    <div class="progress-status">동의함</div>
                </div>
                <div class="progress-card agreed">
                    <div class="progress-label">상대방</div>
                    <div class="progress-icon">✅</div>
                    <div class="progress-status">동의함</div>
                </div>
            </div>

            <!-- Progress Bar -->
            <div class="progress-bar-container">
                <div class="progress-bar success" style="width: 100%;"></div>
            </div>

            <!-- Next Steps -->
            <div class="info-box success">
                <div class="info-title">📋 다음 단계</div>
                <div class="info-content">
                    • 합의서 작성<br>
                    • 이행 일정 협의<br>
                    • 사건 종결
                </div>
            </div>

            <!-- Action Button -->
            <button class="btn-primary" onclick="location.href='case_detail.html'" style="width: 100%; padding: 18px; font-size: 1.1rem;">
                <i class="fas fa-arrow-right"></i>
                사건 상세로 이동
            </button>
        </div>
    `;
}
