1/**
 * ProposalHandler.js
 * Handles UI transitions based on state
 * Replaces complex logic in blind_proposal.js
 */
window.ProposalHandler = {
    // Current State for caching
    currentState: null,

    /**
     * Main entry point
     */
    process(data) {
        if (!data || !data.success) {
            console.warn('[ProposalHandler] Invalid data or API error:', data);
            return;
        }

        // Augment data with computed properties (Fix for missing maxLimit)
        data.maxLimit = data.isExtended ? 8 : 5;

        // Update Sidebar
        if (data.caseTitle && data.opponentName) {
            ProposalUI.updateSidebar(data.caseTitle, data.opponentName);
        }

        // Use ProposalState logic
        const state = ProposalState.determineState(data);
        console.log(`[ProposalHandler] Processing State: ${state}`);

        // Update UI based on State
        switch (state) {
            case ProposalState.CONST.STEP_1_INPUT:
                this.renderInputDashboard(data);
                break;
            case ProposalState.CONST.STEP_2_WAITING:
                this.renderWaitingDashboard(data, false);
                break;
            case ProposalState.CONST.STEP_3_READY_TO_VIEW:
                this.renderReadyDashboard(data);
                break;
            case ProposalState.CONST.STEP_4_RESULT_VIEW:
                this.renderResultDashboard(data);
                break;
            case ProposalState.CONST.STEP_5A_MIDPOINT:
                this.renderMidpointDashboard(data);
                break;
            case ProposalState.CONST.STEP_5B_NEXT_ROUND_WAITING:
                this.renderWaitingDashboard(data, true); // True for Next Round Waiting
                break;
            case ProposalState.CONST.STEP_EXPIRED:
                this.renderExpiredDashboard(data);
                break;
            default:
                console.warn('[ProposalHandler] Unknown State:', state);
        }

        this.currentState = state;
    },

    // --- Phase Handlers ---

    renderExpiredDashboard(data) {
        ProposalUI.updateCountUI(data.myProposalCount, data.maxLimit, data.currentRound);
        ProposalUI.toggleProposalInput(false);
        const el = ProposalUI.showRightPanelState('waitingState'); // Reuse waitingState container

        el.innerHTML = `
            <div style="width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; animation: fade-in 0.5s;">
                 <div style="text-align: center; margin-bottom: 30px;">
                    <div style="background: rgba(239, 68, 68, 0.1); color: #ef4444; display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 0.85rem; margin-bottom: 15px; border: 1px solid rgba(239, 68, 68, 0.3);">
                        🛑 ${data.currentRound}라운드 종료
                    </div>
                    <div style="font-size: 4rem; margin-bottom: 15px;">⏰</div>
                    <h3 style="color: #ef4444; font-size: 1.8rem; margin-bottom: 15px;">유효기간 만료</h3>
                    <p style="color: #cbd5e1; font-size: 1rem; line-height: 1.6;">
                        제안 유효기간이 지났으나 합의가 이루어지지 않았습니다.<br>
                        이번 라운드는 <strong>자동으로 종료</strong>됩니다.
                    </p>
                </div>

                <div id="nextRoundActionArea"></div>
            </div>
        `;

        const actionArea = el.querySelector('#nextRoundActionArea');

        // Render Action Button
        if (data.myNextRoundIntent && !data.nextRoundStarted) {
            actionArea.innerHTML = `
                <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid #3b82f6; padding: 25px; border-radius: 16px;">
                    <div style="font-size: 2rem; margin-bottom: 10px; animation: bounce 2s infinite;">⏳</div>
                    <h3 style="color: #60a5fa; margin-bottom: 5px;">다음 라운드 대기 중</h3>
                    <p style="color: #94a3b8; font-size: 0.9rem;">
                        다음 라운드 진행에 동의하셨습니다.<br>상대방이 동의하면 즉시 다음 단계로 넘어갑니다.
                    </p>
                </div>
            `;
        } else {
            actionArea.innerHTML = `
                <div style="background: rgba(255,255,255,0.03); padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05);">
                    <h3 style="color: #fff; margin-bottom: 10px;">협상을 계속하시겠습니까?</h3>
                    <p style="color: #94a3b8; margin-bottom: 25px; font-size: 0.95rem;">
                        다음 라운드에서 새로운 제안을 등록할 수 있습니다.
                    </p>
                    <button onclick="confirmNextRoundIntent()"
                        style="width: 100%; padding: 18px; font-size: 1.1rem; font-weight: bold; color: white; background: linear-gradient(135deg, #ef4444, #b91c1c); border: none; border-radius: 12px; cursor: pointer; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4); transition: all 0.2s;">
                        <i class="fas fa-redo" style="margin-right: 8px;"></i> ${parseInt(data.currentRound) + 1}라운드 진행하기
                    </button>
                </div>
            `;
        }
    },

    renderInputDashboard(data) {
        ProposalUI.updateCountUI(data.myProposalCount, data.maxLimit, data.currentRound);
        ProposalUI.toggleProposalInput(true);
        const el = ProposalUI.showRightPanelState('waitingState');
        const currentRound = data.currentRound || 1;

        // Round 1 Input
        if (currentRound === 1) {
            let oppStatusText = '❓ 입력 대기';
            let oppStatusColor = '#64748b';
            let oppStatusBg = 'rgba(255,255,255,0.05)';
            let oppStatusBorder = '1px solid rgba(255,255,255,0.1)';

            if (data.hasOpponentProposed) {
                oppStatusText = '✅ 등록 완료 (대기 중)';
                oppStatusColor = '#4ade80';
                oppStatusBg = 'rgba(59, 130, 246, 0.1)';
                oppStatusBorder = '1px solid #3b82f6';
            }

            let guideTitle = "진행 안내";
            let guideIcon = "fa-info-circle";
            let guideColor = "#60a5fa";
            // let topBadge = "📍 1라운드 진행 중"; // Removed in favor of Headline
            let headlineColor = "#60a5fa";
            let headlineText = "제안 입력 단계";

            let myCardBorder = "1px solid rgba(251, 191, 36, 0.5)";
            let myCardBg = "rgba(251, 191, 36, 0.05)";
            let myStatusText = "입력 대기";
            let myStatusColor = "#fbbf24";
            let myIcon = "✏️";

            if (data.hasOpponentProposed) {
                // topBadge = "🚀 상대방 제안 등록 완료!";
                headlineText = "상대방 제안 등록 완료!";
                headlineColor = "#4ade80";

                guideTitle = "이제 고객님의 차례입니다";
                guideIcon = "fa-bell";
                guideColor = "#ef4444";
                myCardBorder = "2px solid #ef4444";
                myCardBg = "rgba(239, 68, 68, 0.1)";
                myStatusText = "입력 필요";
                myStatusColor = "#ef4444";
                myIcon = "🚨";
            }

            el.innerHTML = `
                <div style="width:100%; height:100%; display:flex; flex-direction:column; justify-content:center;">
                    <!-- Headline Style Round Display -->
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="font-size: 3.5rem; font-weight: 800; color: ${headlineColor}; line-height: 1.2; text-shadow: 0 0 20px rgba(59, 130, 246, 0.3);">
                            1 <span style="font-size: 1.5rem; vertical-align: middle; margin-left: -5px;">ROUND</span>
                        </div>
                        <div style="font-size: 1.1rem; color: #94a3b8; font-weight: 500;">
                            ${headlineText}
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px;">
                        <div class="glass-card" style="padding: 20px; border: ${myCardBorder}; background: ${myCardBg}; ${data.hasOpponentProposed ? 'animation: pulse-border 2s infinite;' : ''}">
                            <div style="font-size: 3rem; margin-bottom: 10px;">${myIcon}</div>
                            <div style="font-size: 0.9rem; color: #cbd5e1; margin-bottom: 5px;">나의 상태</div>
                            <div style="font-size: 1.1rem; font-weight: bold; color: ${myStatusColor};">${myStatusText}</div>
                        </div>
                        <div class="glass-card" style="padding: 20px; border: ${oppStatusBorder}; background: ${oppStatusBg};">
                            <div style="font-size: 3rem; margin-bottom: 10px;">${data.hasOpponentProposed ? '🔒' : '👤'}</div>
                            <div style="font-size: 0.9rem; color: #cbd5e1; margin-bottom: 5px;">상대방 상태</div>
                            <div style="font-size: 1.1rem; font-weight: bold; color: ${oppStatusColor};">${oppStatusText}</div>
                            ${data.hasOpponentProposed ? '<div id="oppExpirationTimerDisplay" style="margin-top:10px;"></div>' : ''}
                        </div>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 20px; text-align: left;">
                        <h4 style="color: #fff; margin-bottom: 15px; font-size: 1rem;"><i class="fas ${guideIcon}" style="color: ${guideColor}; margin-right: 8px;"></i>${guideTitle}</h4>
                        <ul style="list-style: none; padding: 0; margin: 0; color: #94a3b8; font-size: 0.9rem; line-height: 1.8;">
                             ${data.hasOpponentProposed ?
                    `<li>• <strong>상대방이 제안을 마쳤습니다.</strong></li><li>• 금액을 입력하면 <strong>즉시 격차 분석 결과</strong>를 확인할 수 있습니다.</li><li>• 입력하신 금액은 타결 전까지 <strong>절대 비공개</strong>됩니다.</li>` :
                    `<li>• 희망 금액을 등록하면 상대방에게 <strong>알림이 전송</strong>됩니다.</li><li>• 양측 모두 등록 시 <strong>AI 격차 분석</strong>이 즉시 시작됩니다.</li><li>• 제안하신 금액은 타결 전까지 <strong>상대방에게 비공개</strong>됩니다.</li>`
                }
                        </ul>
                    </div>
                </div>`;
        } else {
            // Round 2+ Input
            let oppStatusText = '❓ 입력 대기';
            let oppStatusColor = '#64748b';
            let oppStatusBg = 'rgba(255,255,255,0.05)';
            let oppStatusBorder = '1px solid rgba(255,255,255,0.1)';

            if (data.hasOpponentProposed) {
                oppStatusText = '✅ 등록 완료';
                oppStatusColor = '#4ade80';
                oppStatusBg = 'rgba(59, 130, 246, 0.1)';
                oppStatusBorder = '1px solid #3b82f6';
            }

            el.innerHTML = `
                <div style="width:100%; height:100%; display:flex; flex-direction:column; justify-content:center;">
                    <!-- Headline Style Round Display -->
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="font-size: 3.5rem; font-weight: 800; color: #60a5fa; line-height: 1.2; text-shadow: 0 0 20px rgba(59, 130, 246, 0.3);">
                            ${currentRound} <span style="font-size: 1.5rem; vertical-align: middle; margin-left: -5px;">ROUND</span>
                        </div>
                        <div style="font-size: 1.1rem; color: #94a3b8; font-weight: 500;">
                            제안 진행 중
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px;">
                        <div class="glass-card" style="padding: 20px; border: 2px solid #f59e0b; background: rgba(251, 191, 36, 0.05); animation: pulse-border 2s infinite;">
                            <div style="font-size: 3rem; margin-bottom: 10px;">✏️</div>
                            <div style="font-size: 0.9rem; color: #cbd5e1; margin-bottom: 5px;">나의 수정 제안</div>
                            <div style="font-size: 1.1rem; font-weight: bold; color: #fbbf24;">입력 필요</div>
                        </div>
                        <div class="glass-card" style="padding: 20px; border: ${oppStatusBorder}; background: ${oppStatusBg};">
                            <div style="font-size: 3rem; margin-bottom: 10px;">${data.hasOpponentProposed ? '🔒' : '👤'}</div>
                             <div style="font-size: 0.9rem; color: #cbd5e1; margin-bottom: 5px;">상대방 상태</div>
                            <div style="font-size: 1.1rem; font-weight: bold; color: ${oppStatusColor};">${oppStatusText}</div>
                            ${data.hasOpponentProposed ? '<div id="oppExpirationTimerDisplay" style="margin-top:10px;"></div>' : ''}
                        </div>
                    </div>
                     <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 20px; text-align: left;">
                        <h4 style="color: #fff; margin-bottom: 15px; font-size: 1rem;"><i class="fas fa-sync-alt" style="color: #60a5fa; margin-right: 8px;"></i>협상 진행 중</h4>
                        <div style="color: #cbd5e1; line-height: 1.6; font-size: 0.95rem;">
                            이전 라운드에서 합의점에 도달하지 못했습니다.<br>
                            격차를 줄이기 위해 <strong>새로운 금액</strong>을 제안해주세요.
                        </div>
                    </div>
                </div>`;
        }

        // --- NEW: Start Opponent Expiration Timer if exists ---
        if (data.hasOpponentProposed && data.opponentLastProposal && data.opponentLastProposal.expiresAt) {
            ProposalUI.startExpirationTimer(data.opponentLastProposal.expiresAt, 'oppExpirationTimerDisplay');
        }
    },

    renderWaitingDashboard(data, isNextRoundWait = false) {
        ProposalUI.updateCountUI(data.myProposalCount, data.maxLimit, data.currentRound);
        ProposalUI.toggleProposalInput(false);
        const el = ProposalUI.showRightPanelState('waitingState');
        const currentRound = data.currentRound || 1;
        const proposalExpiration = data.myLastProposal ? data.myLastProposal.expiresAt : null;

        if (currentRound === 1 && !isNextRoundWait) {
            el.innerHTML = `
                <div style="width:100%; height:100%; display:flex; flex-direction:column; justify-content:center;">
                    <!-- Headline Style Round Display -->
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="font-size: 3.5rem; font-weight: 800; color: #4ade80; line-height: 1.2; text-shadow: 0 0 20px rgba(74, 222, 128, 0.3);">
                            1 <span style="font-size: 1.5rem; vertical-align: middle; margin-left: -5px;">ROUND</span>
                        </div>
                        <div style="font-size: 1.1rem; color: #94a3b8; font-weight: 500;">
                            상대방 입력 대기 중
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px;">
                        <div class="glass-card" style="padding: 20px; border: 1px solid rgba(74, 222, 128, 0.5); background: rgba(74, 222, 128, 0.05);">
                            <div style="font-size: 3rem; margin-bottom: 10px;">✅</div>
                            <div style="font-size: 0.9rem; color: #cbd5e1; margin-bottom: 5px;">나의 상태</div>
                            <div style="font-size: 1.1rem; font-weight: bold; color: #4ade80;">등록 완료</div>
                        </div>
                        <div class="glass-card" style="padding: 20px; border: 1px solid rgba(251, 191, 36, 0.5); background: rgba(251, 191, 36, 0.05); animation: pulse-border 2s infinite;">
                            <div style="font-size: 3rem; margin-bottom: 10px;">⏳</div>
                            <div style="font-size: 0.9rem; color: #cbd5e1; margin-bottom: 5px;">상대방 상태</div>
                            <div style="font-size: 1.1rem; font-weight: bold; color: #fbbf24;">입력 대기</div>
                        </div>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 20px; text-align: left;">
                        <h4 style="color: #fff; margin-bottom: 15px; font-size: 1rem;"><i class="fas fa-check-circle" style="color: #4ade80; margin-right: 8px;"></i>잘하셨습니다!</h4>
                        <ul style="list-style: none; padding: 0; margin: 0; color: #94a3b8; font-size: 0.9rem; line-height: 1.8;">
                            <li>• 제안이 안전하게 접수되었습니다.</li>
                            <li>• 상대방에게 <strong>제안 등록 알림</strong>을 보냈습니다.</li>
                            <li>• 상대방이 등록하면 <strong>즉시 분석 결과</strong>가 공개됩니다.</li>
                        </ul>
                    </div>
                    <div id="expirationTimerDisplay"></div>
                </div>`;
        } else if (isNextRoundWait) {
            // Step 5B: Next Round Waiting (Intent Registered)
            el.innerHTML = `
                <div style="width:100%; height:100%; display:flex; flex-direction:column; justify-content:center;">
                    <!-- Headline Style Round Display -->
                     <div style="text-align: center; margin-bottom: 30px;">
                        <div style="font-size: 3.5rem; font-weight: 800; color: #a78bfa; line-height: 1.2; text-shadow: 0 0 20px rgba(167, 139, 250, 0.3);">
                            ${currentRound} <span style="font-size: 1.5rem; vertical-align: middle; margin-left: -5px;">ROUND</span>
                        </div>
                        <div style="font-size: 1.1rem; color: #94a3b8; font-weight: 500;">
                            다음 라운드 대기 중
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px;">
                        <div class="glass-card" style="padding: 20px; border: 1px solid rgba(167, 139, 250, 0.5); background: rgba(167, 139, 250, 0.05);">
                            <div style="font-size: 3rem; margin-bottom: 10px;">🆗</div>
                            <div style="font-size: 0.9rem; color: #cbd5e1; margin-bottom: 5px;">나의 상태</div>
                            <div style="font-size: 1.1rem; font-weight: bold; color: #ddd6fe;">준비 완료</div>
                        </div>
                        <div class="glass-card" style="padding: 20px; border: 1px solid rgba(251, 191, 36, 0.5); background: rgba(251, 191, 36, 0.05); animation: pulse-border 2s infinite;">
                            <div style="font-size: 3rem; margin-bottom: 10px;">🕐</div>
                            <div style="font-size: 0.9rem; color: #cbd5e1; margin-bottom: 5px;">상대방 상태</div>
                            <div style="font-size: 1.1rem; font-weight: bold; color: #fbbf24;">응답 대기</div>
                         </div>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 20px; text-align: left;">
                        <h4 style="color: #fff; margin-bottom: 15px; font-size: 1rem;"><i class="fas fa-user-clock" style="color: #a78bfa; margin-right: 8px;"></i>상대방을 기다리고 있습니다</h4>
                         <p style="color: #cbd5e1; line-height: 1.6; font-size: 0.95rem;">
                            상대방도 진행에 동의하면<br>
                            즉시 ${currentRound + 1}라운드가 시작됩니다.
                        </p>
                    </div>
                    <div id="expirationTimerDisplay"></div>
                </div>`;
        } else {
            // Round 2+ Waiting (Proposal Submitted)
            el.innerHTML = `
                <div style="width:100%; height:100%; display:flex; flex-direction:column; justify-content:center;">
                    <!-- Headline Style Round Display -->
                     <div style="text-align: center; margin-bottom: 30px;">
                        <div style="font-size: 3.5rem; font-weight: 800; color: #a78bfa; line-height: 1.2; text-shadow: 0 0 20px rgba(167, 139, 250, 0.3);">
                            ${currentRound} <span style="font-size: 1.5rem; vertical-align: middle; margin-left: -5px;">ROUND</span>
                        </div>
                        <div style="font-size: 1.1rem; color: #94a3b8; font-weight: 500;">
                            상대방 응답 대기 중
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px;">
                        <div class="glass-card" style="padding: 20px; border: 1px solid rgba(167, 139, 250, 0.5); background: rgba(167, 139, 250, 0.05);">
                            <div style="font-size: 3rem; margin-bottom: 10px;">🆗</div>
                            <div style="font-size: 0.9rem; color: #cbd5e1; margin-bottom: 5px;">나의 수정 제안</div>
                            <div style="font-size: 1.1rem; font-weight: bold; color: #ddd6fe;">등록 완료</div>
                        </div>
                        <div class="glass-card" style="padding: 20px; border: 1px solid rgba(251, 191, 36, 0.5); background: rgba(251, 191, 36, 0.05); animation: pulse-border 2s infinite;">
                            <div style="font-size: 3rem; margin-bottom: 10px;">💭</div>
                            <div style="font-size: 0.9rem; color: #cbd5e1; margin-bottom: 5px;">상대방 상태</div>
                            <div style="font-size: 1.1rem; font-weight: bold; color: #fbbf24;">고민 중...</div>
                         </div>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 20px; text-align: left;">
                        <h4 style="color: #fff; margin-bottom: 15px; font-size: 1rem;"><i class="fas fa-hourglass-half" style="color: #a78bfa; margin-right: 8px;"></i>잠시만 기다려주세요</h4>
                        <p style="color: #cbd5e1; line-height: 1.6; font-size: 0.95rem;">
                            상대방도 신중하게 고민하고 있습니다.<br>
                            이번 라운드에서 격차가 얼마나 줄어들지 기대해 보세요.
                        </p>
                    </div>
                    <div id="expirationTimerDisplay"></div>
                </div>`;
        }

        if (proposalExpiration) {
            ProposalUI.startExpirationTimer(proposalExpiration, 'expirationTimerDisplay');
        }
    },

    renderReadyDashboard(data) {
        ProposalUI.updateCountUI(data.myProposalCount, data.maxLimit, data.currentRound);
        ProposalUI.toggleProposalInput(false);

        // Update Dynamic Text for Analysis Ready State
        const stateEl = document.getElementById('analysisReadyState');
        if (stateEl) {
            const h3 = stateEl.querySelector('h3');
            if (h3) h3.textContent = `${data.currentRound}라운드 분석 완료!`;

            const footerP = stateEl.querySelector('p:last-of-type');
            if (footerP && footerP.textContent.includes('라운드가 종료됩니다')) {
                footerP.textContent = `* 결과를 확인하면 ${data.currentRound}라운드가 종료됩니다.`;
            }
        }

        ProposalUI.showRightPanelState('analysisReadyState');
    },

    renderResultDashboard(data) {
        ProposalUI.updateCountUI(data.myProposalCount, data.maxLimit, data.currentRound);
        ProposalUI.toggleProposalInput(false);
        const d = data.currentRoundData;

        // Safety check if d is null
        if (!d) {
            console.error("Result Dashboard requested but no round data available");
            return;
        }

        const calcDiff = Math.abs(d.offenderAmount - d.victimAmount);
        const gapPercent = (calcDiff / Math.max(d.offenderAmount, d.victimAmount)) * 100;
        // isFinalLoop logic: round >= 5 and NOT extended
        // Use data.isExtended if available
        const isFinalLoop = (data.currentRound >= 5 && !data.isExtended);

        // Determine my amount for display
        // We need to know if I am offender or victim. 
        // Using 'myLastProposal' which contains 'amount' if available, otherwise 0
        // Or comparing user ID if available in 'data'. 
        // Simplest: Check data.myLastProposal.amount
        let myAmount = 0;
        if (data.myLastProposal && data.myLastProposal.amount) {
            myAmount = data.myLastProposal.amount;
        } else {
            // Fallback: If ProposalState sets it correctly, we might infer.
            // But data.myLastProposal should be robust.
            // If not, use window global fallback (legacy)
            myAmount = window.myLastProposalAmount || 0;
        }

        ProposalUI.renderGaugeChart(gapPercent, myAmount, isFinalLoop, data.currentRound);

        ProposalUI.renderNextRoundAction(
            myAmount,
            isFinalLoop ? data.iAgreed : data.myNextRoundIntent,
            isFinalLoop ? data.oppAgreed : data.oppNextRoundIntent,
            isFinalLoop,
            data.currentRound
        );
    },

    renderMidpointDashboard(data) {
        ProposalUI.updateCountUI(data.myProposalCount, data.maxLimit, data.currentRound);
        ProposalUI.toggleProposalInput(false);
        const ms = data.midpointStatus;
        if (!ms) return;

        const el = ProposalUI.showRightPanelState('midpointAgreementState');

        // --- PHASE 1: PROCEDURE AGREEMENT ---
        if (ms.phase === 1) {
            // Check specific agreement status
            if (ms.myAgreement && !ms.oppAgreement) {
                // I agreed, Waiting for Opponent
                el.innerHTML = `
                    <div style="font-size: 4rem; margin-bottom: 20px; animation: pulse 2s infinite;">⏳</div>
                    <h3 style="color: #fbbf24; margin-bottom: 15px;">상대방의 동의를 기다립니다</h3>
                    <p style="color: #cbd5e1; line-height: 1.6; margin-bottom: 25px;">
                        귀하는 [중간값 합의] 절차에 <strong>동의</strong>하셨습니다.<br>
                        상대방도 동의하면 즉시 합의금이 공개됩니다.
                    </p>
                    <button class="btn btn-secondary" disabled style="opacity:0.7; cursor:wait; background:#334155; color:#94a3b8; border:none; padding:10px 20px; border-radius:8px;">
                        상대방 응답 대기 중...
                    </button>
                    <p style="margin-top: 20px; font-size: 0.8rem; color: #64748b;">
                         * 상대방이 동의하지 않으면 자동으로 다음 라운드 제안 단계로 넘어갑니다.
                    </p>
                `;
            } else if (!ms.myAgreement && ms.oppAgreement) {
                // Opponent agreed, Urging Me
                el.innerHTML = `
                    <div style="font-size: 4rem; margin-bottom: 20px; animation: bounce 1s infinite;">🔔</div>
                    <h3 style="color: #EF4444; margin-bottom: 15px;">상대방이 [중간값 합의]를 원합니다!</h3>
                    <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid #EF4444; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
                         <p style="color: #fca5a5; font-weight: bold; margin-bottom: 10px;">
                            <i class="fas fa-exclamation-circle"></i> 상대방 동의 완료
                        </p>
                        <p style="color: #cbd5e1; line-height: 1.6; margin: 0;">
                            상대방은 이미 동의했습니다.<br>
                            귀하가 동의하면 <strong>즉시 금액이 확정</strong>됩니다.
                        </p>
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                         <button id="btnRejectMidpoint" onclick="rejectMidpoint()" class="btn btn-glass" style="flex: 1; border: 1px solid rgba(255,100,100,0.3); color: #fca5a5;">
                            거절 (협상 계속)
                        </button>
                        <button id="btnAgreeMidpoint" onclick="acceptMidpoint()" class="btn btn-primary" style="flex: 1.5; background: linear-gradient(135deg, #EF4444, #B91C1C); box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);">
                            네, 동의합니다
                        </button>
                    </div>
                `;
            } else {
                // Default: Both not agreed yet (Show Original HTML logic)
                el.innerHTML = `
                    <div style="font-size: 4rem; margin-bottom: 20px; animation: bounce-icon 2s infinite;">⚖️</div>
                    <h3 style="color: #fff; margin-bottom: 15px;">합의 가능 구간(10%) 진입!</h3>
                    <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid #f59e0b; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
                        <p style="color: #fca5a5; font-weight: bold; margin-bottom: 10px;">
                            <i class="fas fa-lock"></i> 금액 비공개
                        </p>
                        <p style="color: #cbd5e1; line-height: 1.6; margin: 0;">
                            양측의 제안 차이가 <strong>10% 이내</strong>로 좁혀졌습니다.<br>
                            두 금액의 <strong>[정확한 중간값]</strong>으로<br>
                            합의금을 확정하시겠습니까?
                        </p>
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button id="btnRejectMidpoint" onclick="rejectMidpoint()" class="btn btn-glass" style="flex: 1; border: 1px solid rgba(255,100,100,0.3); color: #fca5a5;">
                            아니오<br><span style="font-size: 0.8rem;">협상 계속</span>
                        </button>
                        <button id="btnAgreeMidpoint" onclick="acceptMidpoint()" class="btn btn-primary" style="flex: 1.5; background: linear-gradient(135deg, #f59e0b, #d97706); box-shadow: 0 0 15px rgba(245, 158, 11, 0.4);">
                            네, 동의합니다<br><span style="font-size: 0.8rem;">즉시 타결</span>
                        </button>
                    </div>
                     <p style="margin-top: 20px; font-size: 0.8rem; color: #64748b;">
                        * 양측 모두 동의 시 합의가 성립되며 금액이 공개됩니다.
                    </p>
                `;
            }
        }

        // --- PHASE 2: FINAL CONFIRMATION (AMOUNT REVEALED) ---
        else if (ms.phase === 2) {
            const amount = ms.midpointAmount ? ms.midpointAmount.toLocaleString() : '?';

            // Check if I already agreed to Final
            // Since getStatus doesn't return myFinalAgreement explicitly in `ms` (we only added myAgreement which is procedure),
            // We might need to rely on `midpointStatus` from controller having more data or just showing the prompt.
            // Controller's getStatus update: "phase: midPhase".
            // We didn't add final agreement flags to `getStatus` in Step 1.
            // However, `getMidpointStatus` has them.
            // For now, let's assume if phase is 2, we show the prompt. 
            // If user clicks agree again, server handles idempotency or returns 'waiting'.

            el.innerHTML = `
                <div style="font-size: 4rem; margin-bottom: 20px; animation: tada 1s;">🎉</div>
                <h3 style="color: #fff; margin-bottom: 10px;">중간값 제안 금액 공개</h3>
                <p style="color: #94a3b8; margin-bottom: 25px;">양측의 동의로 중간값이 산출되었습니다.</p>
                
                <div style="background: linear-gradient(135deg, #1e293b, #0f172a); border: 2px solid #3b82f6; padding: 30px; border-radius: 16px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(59, 130, 246, 0.2);">
                    <div style="font-size: 0.9rem; color: #60a5fa; margin-bottom: 10px; font-weight: bold;">최종 합의 제안금</div>
                    <div style="font-size: 2.5rem; font-weight: 800; color: #fff; text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);">
                        ${amount} <span style="font-size: 1.2rem; color: #94a3b8;">원</span>
                    </div>
                </div>

                <p style="color: #cbd5e1; line-height: 1.6; margin-bottom: 30px;">
                    이 금액으로 최종 합의하시겠습니까?<br>
                    <strong>'동의' 버튼을 누르면 사건이 즉시 종결됩니다.</strong>
                </p>

                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button onclick="rejectMidpointFinal()" class="btn btn-glass" style="flex: 1; border: 1px solid rgba(255,100,100,0.3); color: #fca5a5;">
                        거절<br><span style="font-size: 0.8rem;">다음 라운드 진행</span>
                    </button>
                    <button onclick="acceptMidpointFinal()" class="btn btn-primary" style="flex: 1.5; background: linear-gradient(135deg, #3b82f6, #2563eb); box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);">
                        최종 동의 (확정)
                    </button>
                </div>
            `;
        }

        // --- PHASE 3: SETTLED ---
        else if (ms.phase === 3) {
            const amount = ms.midpointAmount ? ms.midpointAmount.toLocaleString() : '?';
            el.innerHTML = `
                <div style="font-size: 5rem; margin-bottom: 20px; animation: bounce 1s;">🎊</div>
                <h3 style="color: #fff; margin-bottom: 10px; font-size: 1.8rem;">합의가 성사되었습니다!</h3>
                <p style="color: #94a3b8; margin-bottom: 30px;">소중한 합의에 도달하신 것을 축하드립니다.</p>
                
                <div style="background: rgba(74, 222, 128, 0.1); border: 2px solid #4ade80; padding: 40px; border-radius: 20px; margin-bottom: 30px;">
                     <div style="font-size: 1rem; color: #4ade80; margin-bottom: 10px; font-weight: bold;">최종 합의금</div>
                    <div style="font-size: 3rem; font-weight: 900; color: #fff; text-shadow: 0 0 30px rgba(74, 222, 128, 0.5);">
                        ${amount} <span style="font-size: 1.5rem; color: #94a3b8;">원</span>
                    </div>
                </div>
                
                 <button onclick="location.href='dashboard.html'" class="btn btn-primary" style="margin-top: 30px; padding: 15px 40px; border-radius: 50px; background: #fff; color: #000; font-weight: bold;">
                    대시보드로 돌아가기
                </button>
            `;
        }
    }
};
