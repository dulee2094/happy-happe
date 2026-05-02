/**
 * ProposalUI
 * Handling UI rendering and interactions for blind proposal (Refactored)
 */
window.ProposalUI = {
    // --- Right Panel State Management ---
    hideAllRightPanelStates() {
        const ids = [
            'midpointResultArea',
            'opponentProposedNotification',
            'extensionNotification',
            'resultState',
            'waitingState',
            'midpointAgreementState',
            'analysisReadyState'
        ];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
    },

    updateSidebar(title, name) {
        const titleEl = document.getElementById('sidebarCaseNumber');
        const nameEl = document.getElementById('sidebarCounterparty');
        if (titleEl) titleEl.textContent = title;
        if (nameEl) nameEl.textContent = name;
    },

    showRightPanelState(stateId) {
        const el = document.getElementById(stateId);
        if (el && el.style.display === 'block' && el.innerHTML.trim().length > 100) return el;

        this.hideAllRightPanelStates();
        if (el) {
            el.style.display = 'block';
        }
        return el;
    },

    // --- Counter UI ---
    updateCountUI(current, max, currentRound = 1) {
        const currentEl = document.getElementById('currentCount');
        const maxEl = document.getElementById('maxCount');
        if (currentEl) currentEl.innerText = current;
        if (maxEl) maxEl.innerText = max;

        const leftCountEl = document.getElementById('leftCount');
        if (leftCountEl) {
            const left = Math.max(0, max - current);
            leftCountEl.textContent = left;
        }

        const roundDisplayEl = document.getElementById('currentRoundDisplay');
        if (roundDisplayEl) {
            roundDisplayEl.textContent = currentRound;
        }

        const progressEl = document.getElementById('proposalProgress');
        if (progressEl) {
            const percentage = (current / max) * 100;
            progressEl.style.width = `${percentage}%`;

            if (current >= max - 1) {
                progressEl.style.background = '#ef4444'; // Red
            } else if (current >= max - 2) {
                progressEl.style.background = '#f59e0b'; // Orange
            } else {
                progressEl.style.background = '#3b82f6'; // Blue
            }
        }

        if (current >= max) {
            const inputs = document.querySelectorAll('.proposal-input-section input, .proposal-input-section button');
            inputs.forEach(el => el.disabled = true);
        }
    },

    // --- Onboarding Guide ---
    closeGuide() {
        const modal = document.getElementById('guideModal');
        if (modal) {
            modal.style.animation = 'fade-out 0.3s forwards';
            setTimeout(() => {
                modal.style.display = 'none';
                modal.style.animation = '';
            }, 300);
        }

        const checkbox = document.getElementById('dontShowAgain');
        if (checkbox && checkbox.checked) {
            localStorage.setItem('blind_guide_seen_v2', 'true');
        }
    },

    showGuide() {
        const modal = document.getElementById('guideModal');
        if (modal) {
            modal.style.display = 'flex';
            modal.style.animation = 'fade-in 0.3s forwards';
        }
    },

    // --- History Rendering ---
    renderHistoryTable(data) {
        const tbody = document.getElementById('historyTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        if (!data.myProposals || data.myProposals.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 20px; color: #64748b;">이력이 없습니다.</td></tr>`;
            return;
        }

        const sortedProposals = [...data.myProposals].sort((a, b) => b.round - a.round);
        
        sortedProposals.forEach(p => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
            
            let statusText = '<span style="color: #f59e0b;">진행 중</span>';
            if (p.round < data.currentRound) {
                statusText = '<span style="color: #94a3b8;">종료</span>';
            } else if (p.round === data.currentRound && data.currentRoundData && data.currentRoundData.completed) {
                statusText = '<span style="color: #4ade80;">결과 공개</span>';
            }
            if (data.midpointStatus && data.midpointStatus.phase === 3 && p.round === data.currentRound) {
                 statusText = '<span style="color: #4ade80;">합의 타결</span>';
            }

            let msgHtml = '<span style="color: #64748b;">(없음)</span>';
            if (p.message) {
                const encodedMsg = encodeURIComponent(p.message);
                const safeMsg = p.message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                if (p.message.length > 12) {
                    const shortMsg = safeMsg.substring(0, 12) + '...';
                    msgHtml = `
                        <span style="cursor: pointer; color: #94a3b8; transition: color 0.2s; border-bottom: 1px dashed rgba(255,255,255,0.2); padding-bottom: 2px;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'" onclick="ProposalUI.showMessageModal('${encodedMsg}')">
                            ${shortMsg} <i class="fas fa-envelope" style="color: #3b82f6; margin-left: 4px;"></i>
                        </span>
                    `;
                } else {
                    msgHtml = `
                        <span style="cursor: pointer; color: #cbd5e1; transition: color 0.2s; border-bottom: 1px dashed rgba(255,255,255,0.2); padding-bottom: 2px;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#cbd5e1'" onclick="ProposalUI.showMessageModal('${encodedMsg}')">
                            ${safeMsg} <i class="fas fa-envelope" style="color: #3b82f6; margin-left: 4px;"></i>
                        </span>
                    `;
                }
            }
            
            tr.innerHTML = `
                <td style="padding: 12px 10px;">${p.round}</td>
                <td style="padding: 12px 10px; font-weight: bold; color: #fff;">${p.amount.toLocaleString()}원</td>
                <td style="padding: 12px 10px; color: #cbd5e1; font-size: 0.85rem;">${msgHtml}</td>
                <td style="padding: 12px 10px;">${statusText}</td>
            `;
            tbody.appendChild(tr);
        });
    },

    // --- Message Modal ---
    showMessageModal(encodedMsg) {
        let modal = document.getElementById('messageModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'messageModal';
            modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); backdrop-filter:blur(5px); z-index:3000; display:flex; justify-content:center; align-items:center; opacity:0; visibility:hidden; transition:all 0.3s ease; padding:20px;';
            modal.innerHTML = `
                <div style="background:#1e293b; border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:30px; max-width:400px; width:100%; box-shadow:0 25px 50px rgba(0,0,0,0.5); transform:translateY(20px); transition:transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:15px;">
                        <h3 style="color:#fff; margin:0; font-size:1.2rem;"><i class="fas fa-envelope-open-text" style="color:#3b82f6; margin-right:8px;"></i>제안 근거 (메시지)</h3>
                        <button onclick="ProposalUI.closeMessageModal()" style="background:none; border:none; color:#64748b; font-size:1.5rem; cursor:pointer; transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#64748b'">&times;</button>
                    </div>
                    <div id="messageModalContent" style="color:#cbd5e1; font-size:1rem; line-height:1.6; white-space:pre-wrap; word-break:break-all; max-height: 50vh; overflow-y: auto; text-align: left; padding-right: 5px;"></div>
                    <div style="text-align:center; margin-top:25px;">
                        <button onclick="ProposalUI.closeMessageModal()" style="background:linear-gradient(135deg, #3b82f6, #2563eb); color:white; border:none; padding:12px 30px; border-radius:8px; font-weight:bold; cursor:pointer; box-shadow:0 4px 10px rgba(59,130,246,0.3);">닫기</button>
                    </div>
                </div>
            `;
            // close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) ProposalUI.closeMessageModal();
            });
            document.body.appendChild(modal);
        }
        
        const decodedMsg = decodeURIComponent(encodedMsg);
        document.getElementById('messageModalContent').textContent = decodedMsg;
        
        // Show
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.querySelector('div').style.transform = 'translateY(0)';
    },

    closeMessageModal() {
        const modal = document.getElementById('messageModal');
        if (modal) {
            modal.style.opacity = '0';
            modal.style.visibility = 'hidden';
            modal.querySelector('div').style.transform = 'translateY(20px)';
        }
    },

    // --- Gauge & Result Chart ---
    renderGaugeChart(gapPercent, myAmount, isFinalRound = false, currentRound = 1, oppMessage = null) {
        this.showRightPanelState('resultState');

        const rangeBox = document.querySelector('#rangeHintBox div:last-child');
        if (rangeBox) {
            rangeBox.innerHTML = `<div style="font-size:1.5rem; margin-bottom:5px;">${gapPercent}%</div> <span style="font-size:0.8rem; color:#facc15;">조율 근접 수치<br>(금액 비공개)</span>`;
        }

        const myDisplay = document.getElementById('myCurrentDisplay');
        if (myDisplay) {
            myDisplay.textContent = parseInt(myAmount).toLocaleString() + '원';
        }

        const gapTitle = document.getElementById('gapTitle');
        const gapDesc = document.getElementById('gapDesc');
        const gapGauge = document.getElementById('gapGauge');
        const statusBadge = document.getElementById('statusBadge');
        const roundEndBadge = document.getElementById('roundEndBadge');
        if (roundEndBadge) {
            roundEndBadge.textContent = `제 ${currentRound}라운드 종료`;
        }

        const adviceHeader = Array.from(document.querySelectorAll('h4')).find(el => el.textContent.includes('AI 조언'));
        const adviceDiv = adviceHeader ? adviceHeader.nextElementSibling : null;

        let color, title, desc, width, badgeText, advice, imgSrc, imgBorderColor;

        if (gapPercent <= 10) {
            color = '#4ade80';
            title = "축하합니다! 의견이 거의 일치합니다.";
            desc = "제안하신 금액과 상대방의 희망 금액 차이가 <strong>10% 이내</strong>입니다.<br>합의가 눈앞에 있습니다!";
            width = '98%'; badgeText = "유사 일치";
            advice = "격차가 매우 좁혀졌습니다. <strong>[중간점 조율]</strong>을 통해 즉시 타결하는 것을 강력히 추천합니다.";
            imgSrc = 'images/room_success.png';
            imgBorderColor = 'rgba(74, 222, 128, 0.4)';
        } else if (gapPercent <= 30) {
            color = '#3b82f6';
            title = "긍정적인 조율 단계입니다.";
            desc = "의견 차이가 크지 않습니다.<br>조금만 더 조율하면 합의점을 찾을 수 있습니다.";
            width = '75%'; badgeText = "조율 가능";
            advice = "상대방과 긍정적인 범위 내에서 조율이 진행 중입니다. 다음 라운드에서 조금 더 유연한 제안을 해보세요.";
            imgSrc = 'images/room_gap_detected.png';
            imgBorderColor = 'rgba(59, 130, 246, 0.4)';
        } else if (gapPercent <= 60) {
            color = '#facc15';
            title = "시각의 차이가 존재합니다.";
            desc = "희망 금액의 차이가 다소 큽니다.<br>서로의 입장을 다시 한번 고려해보세요.";
            width = '50%'; badgeText = "차이 발생";
            advice = "격차를 줄이기 위해 전략적인 양보가 필요할 수 있습니다. 감정적인 대응보다 합리적인 접근이 필요합니다.";
            imgSrc = 'images/room_gap_detected.png';
            imgBorderColor = 'rgba(250, 204, 21, 0.4)';
        } else {
            color = '#ef4444';
            title = "입장 차이가 매우 큽니다.";
            desc = "상대방과 금액에 대한 기대치가 많이 다릅니다.<br>현실적인 대안을 고민해야 합니다.";
            width = '25%'; badgeText = "큰 격차";
            advice = "현재 격차가 매우 큽니다. 무리한 설득보다는 상대방의 상황을 이해하려는 노력이 선행되어야 합니다.";
            imgSrc = 'images/room_gap_detected.png';
            imgBorderColor = 'rgba(239, 68, 68, 0.4)';
        }

        if (gapTitle) gapTitle.innerHTML = title;
        if (gapDesc) gapDesc.innerHTML = desc;
        if (gapGauge) {
            gapGauge.style.width = width;
            gapGauge.style.background = color;
            gapGauge.style.boxShadow = `0 0 20px ${color}`;
        }
        if (statusBadge) {
            statusBadge.textContent = badgeText;
            statusBadge.style.color = color;
            statusBadge.style.border = `1px solid ${color}`;
        }

        if (adviceDiv) {
            adviceDiv.innerHTML = advice;
            adviceDiv.style.borderLeftColor = color; 
            adviceDiv.style.background = color + '15'; 
        }

        // Apply image source
        const resultImg = document.getElementById('resultCharacterImg');
        if (resultImg) {
            resultImg.src = imgSrc;
            resultImg.style.borderColor = imgBorderColor;
        }

        // Render Opponent Message
        let oppMessageContainer = document.getElementById('oppMessageContainer');
        if (!oppMessageContainer) {
            const parent = document.getElementById('resultState');
            if (parent) {
                oppMessageContainer = document.createElement('div');
                oppMessageContainer.id = 'oppMessageContainer';
                oppMessageContainer.style.marginTop = '25px';
                oppMessageContainer.style.marginBottom = '25px';
                const nextAction = document.getElementById('nextRoundActionArea');
                if (nextAction) {
                    parent.insertBefore(oppMessageContainer, nextAction);
                } else {
                    parent.appendChild(oppMessageContainer);
                }
            }
        }
        if (oppMessageContainer) {
            if (oppMessage && oppMessage.trim() !== '') {
                oppMessageContainer.innerHTML = `
                    <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); padding: 20px; border-radius: 12px; text-align: left; position: relative;">
                        <h4 style="color: #60a5fa; margin-bottom: 10px; font-size: 0.95rem;">
                            <i class="fas fa-comment-dots" style="margin-right: 5px;"></i> 상대방의 제안 메시지
                        </h4>
                        <div style="color: #e2e8f0; font-size: 0.95rem; line-height: 1.6; white-space: pre-wrap; font-style: italic;">"${oppMessage}"</div>
                    </div>
                `;
                oppMessageContainer.style.display = 'block';
            } else {
                oppMessageContainer.style.display = 'none';
            }
        }

        if (gapPercent <= 10) {
            const gapDescEl = document.getElementById('gapDesc');
            if (gapDescEl) {
                gapDescEl.innerHTML += `<br><span style="color:#4ade80; font-weight:bold;">※ 격차가 10% 이내이므로 [중간점 조율] 절차를 진행합니다.</span>`;
            }
            const container = document.getElementById('nextRoundActionArea');
            if (container) container.innerHTML = '';
        } else {
            this.renderNextRoundAction(myAmount, false, false, isFinalRound, currentRound);
        }
    },

    renderNextRoundAction(myAmount, myStatus = false, oppStatus = false, isFinalRound = false, currentRound = 1) {
        let container = document.getElementById('nextRoundActionArea');
        if (!container) {
            const parent = document.getElementById('resultState');
            if (!parent) return;

            container = document.createElement('div');
            container.id = 'nextRoundActionArea';
            container.style.marginTop = '40px';
            container.style.paddingTop = '20px';
            container.style.borderTop = '1px solid rgba(255,255,255,0.1)';
            container.style.textAlign = 'center';
            parent.appendChild(container);
        }

        let html = '';

        if (isFinalRound) {
            if (myStatus && !oppStatus) {
                html = `
                    <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid #f59e0b; padding: 25px; border-radius: 16px;">
                        <div style="font-size: 2rem; margin-bottom: 10px; animation: spin-slow 3s infinite linear;">⏳</div>
                        <h3 style="color: #fbbf24; margin-bottom: 5px;">연장 요청을 보냈습니다</h3>
                        <p style="color: #cbd5e1; font-size: 0.9rem;">
                            상대방의 동의를 기다리고 있습니다.<br>상대방도 동의하면 3라운드가 추가됩니다.
                        </p>
                        <button disabled style="margin-top: 15px; padding: 10px 25px; background: #334155; color: #94a3b8; border: none; border-radius: 8px; cursor: not-allowed;">
                            상대방 응답 대기중...
                        </button>
                    </div>
                `;
            } else if (!myStatus && oppStatus) {
                html = `
                    <div style="background: linear-gradient(135deg, rgba(234, 88, 12, 0.2), rgba(194, 65, 12, 0.2)); border: 2px solid #ea580c; padding: 30px; border-radius: 16px; animation: pulse-border 2s infinite;">
                        <div style="margin-bottom: 15px;">
                            <span style="background: #ea580c; color: white; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold;">🚨 마지막 기회</span>
                        </div>
                        <h3 style="color: #fdba74; margin-bottom: 10px; font-size: 1.4rem;">상대방이 협상 연장을 원합니다!</h3>
                        <p style="color: #fed7aa; margin-bottom: 20px;">
                            이번 라운드가 마지막입니다.<br>협상을 계속하려면 연장에 동의해주세요.
                        </p>
                        <div style="display: flex; gap: 10px; justify-content: center;">
                            <button onclick="requestExtension()"
                                style="flex: 2; padding: 18px; font-size: 1.1rem; font-weight: bold; color: white; background: linear-gradient(135deg, #ea580c, #c2410c); border: none; border-radius: 12px; cursor: pointer; box-shadow: 0 4px 15px rgba(234, 88, 12, 0.4);">
                                협상 연장 동의 (+3회)
                            </button>
                        </div>
                    </div>
                `;
            } else {
                html = `
                    <div style="background: rgba(255,255,255,0.03); padding: 30px; border-radius: 16px; border: 1px solid rgba(255,165,0,0.3);">
                        <h3 style="color: #fbbf24; margin-bottom: 10px;">모든 기회가 소진되었습니다</h3>
                        <p style="color: #cbd5e1; margin-bottom: 25px; font-size: 0.95rem;">
                            양측이 동의하면 <strong>3번의 추가 기회</strong>를 얻을 수 있습니다.<br>
                            협상을 계속하시겠습니까?
                        </p>
                        <div style="display: flex; gap: 10px; justify-content: center;">
                             <button onclick="alert('협상이 종료되었습니다.');"
                                style="flex: 1; padding: 15px; font-size: 1rem; color: #94a3b8; background: rgba(255,255,255,0.1); border: none; border-radius: 12px; cursor: pointer;">
                                종료하기
                            </button>
                            <button onclick="requestExtension()"
                                style="flex: 2; padding: 15px; font-size: 1.1rem; font-weight: bold; color: #1e293b; background: linear-gradient(135deg, #fbbf24, #f59e0b); border: none; border-radius: 12px; cursor: pointer; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);">
                                추가 3라운드 연장 요청
                            </button>
                        </div>
                    </div>
                `;
            }

        } else {
            const strategyTip = "💡 <strong>AI Tip:</strong> 상대방과의 격차를 줄이기 위해 다음 라운드에서는 약 5~10% 정도 조정한 금액을 제안해보세요.";

            if (myStatus && !oppStatus) {
                html = `
                    <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid #3b82f6; padding: 25px; border-radius: 16px;">
                        <div style="font-size: 2rem; margin-bottom: 10px; animation: bounce 2s infinite;">⏳</div>
                        <h3 style="color: #60a5fa; margin-bottom: 5px;">다음 라운드 대기중</h3>
                        <p style="color: #94a3b8; font-size: 0.9rem;">
                            회원님은 ${currentRound + 1}라운드 진행에 동의하셨습니다.<br>상대방이 동의하면 즉시 다음 단계로 넘어갑니다.
                        </p>
                        <button disabled style="margin-top: 15px; padding: 10px 25px; background: #334155; color: #94a3b8; border: none; border-radius: 8px; cursor: not-allowed;">
                            상대방 대기중...
                        </button>
                    </div>
                `;
            } else if (!myStatus && oppStatus) {
                html = `
                    <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(185, 28, 28, 0.2)); border: 2px solid #ef4444; padding: 30px; border-radius: 16px; animation: pulse-border 2s infinite;">
                        <div style="margin-bottom: 15px;">
                            <span style="background: #ef4444; color: white; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold;">⏰ 상대방 대기중</span>
                        </div>
                        <h3 style="color: #fca5a5; margin-bottom: 10px; font-size: 1.4rem;">상대방이 ${currentRound + 1}라운드 시작을 기다립니다!</h3>
                        <p style="color: #e2e8f0; margin-bottom: 20px;">
                            아직 기회가 남아있습니다. 포기하지 마세요.<br>아래 버튼을 눌러 협상을 이어나가세요.
                        </p>
                        <button onclick="confirmNextRoundIntent()"
                            style="width: 100%; padding: 18px; font-size: 1.2rem; font-weight: bold; color: white; background: linear-gradient(135deg, #ef4444, #b91c1c); border: none; border-radius: 12px; cursor: pointer; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4); transition: transform 0.2s;">
                            제 ${currentRound + 1}라운드 바로 입장하기
                        </button>
                    </div>
                `;
            } else {
                const nextRoundNum = currentRound < 5 ? currentRound + 1 : '다음';
                html = `
                    <div style="background: rgba(255,255,255,0.03); padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05);">
                        <h3 style="color: #fff; margin-bottom: 10px;">아직 조율 기회가 남았습니다</h3>
                        <p style="color: #94a3b8; margin-bottom: 25px; font-size: 0.95rem;">
                            격차가 크더라도 실망하지 마세요.<br>
                            다음 라운드에서 금액을 조정해볼 수 있습니다.
                        </p>
                        <div style="background: rgba(59, 130, 246, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: left;">
                             ${strategyTip}
                        </div>
                        <button onclick="confirmNextRoundIntent()"
                            style="width: 100%; padding: 18px; font-size: 1.1rem; font-weight: bold; color: white; background: linear-gradient(135deg, #3b82f6, #2563eb); border: none; border-radius: 12px; cursor: pointer; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4); transition: all 0.2s;">
                            <i class="fas fa-redo" style="margin-right: 8px;"></i> ${nextRoundNum}라운드 제안하러 가기
                        </button>
                    </div>
                `;
            }
        }

        container.innerHTML = html;
    },

    toggleProposalInput(enable) {
        const card = document.getElementById('myProposalCard');
        if (!card) return;

        const inputs = card.querySelectorAll('input, button');
        const overlayId = 'proposal-disabled-overlay';
        let overlay = document.getElementById(overlayId);

        if (!enable) {
            inputs.forEach(el => el.disabled = true);
            card.style.opacity = '0.7';
            card.style.pointerEvents = 'none';

            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = overlayId;
                overlay.style.cssText = `
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.5); z-index: 10; border-radius: 12px;
                    display: flex; align-items: center; justify-content: center;
                    backdrop-filter: blur(2px);
                `;
                overlay.innerHTML = `
                    <div style="background: #1e293b; padding: 15px 25px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.1); color: white; font-weight: bold; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                        <i class="fas fa-lock" style="color: #94a3b8; margin-right: 8px;"></i> 제안 제출 완료
                    </div>
                `;
                if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
                card.appendChild(overlay);
            }
        } else {
            inputs.forEach(el => {
                el.disabled = false;
                if (el.tagName === 'BUTTON' && el.textContent.includes('처리 중')) {
                    el.textContent = "제안 등록하기";
                }
            });
            card.style.opacity = '1';
            card.style.pointerEvents = 'auto';
            if (overlay) overlay.remove();
        }
    },

    startExpirationTimer(expireString, elementId) {
        const timerEl = document.getElementById(elementId || 'expirationTimerDisplay');
        if (!timerEl || !expireString) return;

        if (this._timerInterval) clearInterval(this._timerInterval);

        const update = () => {
            const now = new Date().getTime();
            const expireTime = new Date(expireString).getTime();
            const diff = expireTime - now;

            if (diff < 0) {
                clearInterval(this._timerInterval);
                timerEl.innerHTML = `
                <div style="background: rgba(239, 68, 68, 0.1); padding: 15px; border-radius: 10px; border: 1px solid #ef4444; margin-top: 20px;">
                        <div style="color: #ef4444; font-weight: bold; margin-bottom: 5px;">⚠️ 제안 유효 시간이 만료되었습니다.</div>
                        <button class="btn btn-sm" onclick="location.reload()" style="margin-top: 10px; background: #ef4444; color: white; border: none; padding: 5px 15px; border-radius: 5px;">
                            상태 업데이트
                        </button>
                    </div>
                `;
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            let timeColor = '#4ade80';
            let containerStyle = 'background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);';

            if (diff < 1000 * 60 * 10) {
                timeColor = '#ef4444';
                containerStyle = 'background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.5); animation: pulse-border 2s infinite;';
            } else if (diff < 1000 * 60 * 60) {
                timeColor = '#f59e0b';
            }

            let timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            if (days > 0) {
                timeString = `<span style="font-size:0.6em; vertical-align:middle; margin-right:5px;">${days}일</span>${timeString}`;
            }

            timerEl.innerHTML = `
                <div style="${containerStyle} padding: 15px; border-radius: 12px; margin-top: 20px;">
                    <div style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 8px;">제안 유효 시간</div>
                    <div style="font-size: 1.8rem; font-weight: bold; color: ${timeColor}; font-family: monospace;">
                        ${timeString}
                    </div>
                </div>
                `;
        };

        update();
        this._timerInterval = setInterval(update, 1000);
    }
};
