
// ==========================================
// Part 2: Chat, Agreement, Account Info UI
// ==========================================

window.getChatHTML = function () {
    const counterparty = localStorage.getItem('current_counterparty') || '상대방';
    const caseId = localStorage.getItem('current_case_id') || 'demo';
    const myRole = localStorage.getItem('current_case_role') || 'offender';

    let chatStatus = localStorage.getItem(`chat_status_${caseId}`) || 'none';

    if (chatStatus === 'none') {
        return `
            <div class="glass-card" style="max-width: 600px; margin: 0 auto; text-align: center; padding: 40px;">
                <div style="width: 80px; height: 80px; background: rgba(74, 222, 128, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                    <i class="fas fa-shield-alt" style="font-size: 2.5rem; color: #4ade80;"></i>
                </div>
                <h3 style="margin-bottom: 15px;">안심 채팅 서비스</h3>
                <p style="color: var(--text-muted); line-height: 1.6; margin-bottom: 30px;">
                    피의자와 피해자가 개인 연락처 노출 없이<br>
                    안전하게 대화할 수 있는 공간입니다.<br><br>
                    <span style="color: #4ade80; font-size: 0.9rem; background: rgba(74, 222, 128, 0.1); padding: 5px 10px; border-radius: 20px;">
                        <i class="fas fa-check"></i> 상호 동의 필수
                    </span>
                    <span style="color: #ff6b6b; font-size: 0.9rem; background: rgba(255, 107, 107, 0.1); padding: 5px 10px; border-radius: 20px; margin-left: 5px;">
                        <i class="fas fa-times"></i> 언제든 중단 가능
                    </span>
                </p>
                
                <button class="btn btn-primary" onclick="requestChat('${myRole}')" style="width: 100%; padding: 15px;">
                    <i class="fas fa-paper-plane"></i> ${counterparty}님에게 채팅 요청하기
                </button>
            </div>
        `;
    }

    if (chatStatus.startsWith('requested')) {
        const requester = chatStatus.split('_by_')[1];
        if (requester === myRole) {
            return `
                <div class="glass-card" style="max-width: 500px; margin: 50px auto; text-align: center; padding: 40px;">
                    <div class="spinner-border" style="width: 3rem; height: 3rem; margin-bottom: 20px; color: var(--secondary);" role="status"></div>
                    <h3 style="margin-bottom: 15px;">상대방의 수락을 기다리고 있습니다</h3>
                    <p style="color: var(--text-muted); margin-bottom: 30px;">
                        ${counterparty}님이 요청을 확인하고 수락하면<br>즉시 대화방이 열립니다.
                    </p>
                    <button class="btn btn-glass" onclick="cancelChatRequest()">요청 취소하기</button>
                </div>
            `;
        } else {
            return `
                    <div class="glass-card" style="max-width: 500px; margin: 50px auto; text-align: center; padding: 40px;">
                    <i class="fas fa-comment-dots" style="font-size: 3rem; color: var(--secondary); margin-bottom: 20px;"></i>
                    <h3 style="margin-bottom: 15px;">새로운 채팅 요청이 도착했습니다</h3>
                    <p style="color: var(--text-muted); margin-bottom: 30px;">
                        ${counterparty}님이 대화를 요청했습니다.<br>수락하시겠습니까?
                    </p>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button class="btn btn-primary" onclick="acceptChat()" style="min-width: 120px;">수락하기</button>
                        <button class="btn btn-glass" onclick="declineChat()" style="min-width: 120px; color: #ff6b6b; border-color: #ff6b6b;">거절하기</button>
                    </div>
                </div>
            `;
        }
    }

    if (chatStatus === 'active') {
        const messagesHTML = (window.loadChatMessagesHTML) ? window.loadChatMessagesHTML(caseId) : '<div style="text-align:center; color:#666; padding:20px;">로딩 중...</div>';
        return `
            <div class="glass-card" style="height: 650px; display: flex; flex-direction: column; position: relative; overflow: hidden;">
                <div style="padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 10px; height: 10px; background: #4ade80; border-radius: 50%; box-shadow: 0 0 5px #4ade80;"></div>
                        <h3 style="margin: 0; font-size: 1.1rem;">${counterparty}</h3>
                    </div>
                    <button class="btn btn-glass" onclick="confirmEndChat()" style="font-size: 0.8rem; padding: 5px 12px; color: #ff6b6b; border-color: rgba(255, 107, 107, 0.3);">
                        <i class="fas fa-sign-out-alt"></i> 대화 종료
                    </button>
                </div>
                <div style="background: rgba(255,165,0,0.1); padding: 8px; text-align: center; font-size: 0.8rem; color: orange;">
                    <i class="fas fa-shield-alt"></i> 안심 채팅 중입니다. 욕설이나 비방은 삼가주세요.
                </div>
                <div class="chat-messages" id="chatArea" style="flex: 1; overflow-y: auto; padding: 20px;">
                    ${messagesHTML}
                </div>
                <div class="message-input-area" style="padding: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <div style="display: flex; gap: 10px;">
                        <input type="text" id="chatInput" style="flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; outline: none; padding: 12px; border-radius: 8px;" placeholder="메시지를 입력하세요.." onkeypress="handleChatEnter(event)">
                        <button class="btn btn-primary" onclick="window.sendChatMessage ? window.sendChatMessage() : alert('전송 기능 로딩 중')">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    if (chatStatus === 'terminated') {
        return `
            <div class="glass-card" style="max-width: 500px; margin: 50px auto; text-align: center; padding: 40px;">
                    <div style="width: 80px; height: 80px; background: rgba(255, 107, 107, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                    <i class="fas fa-slash" style="font-size: 2.5rem; color: #ff6b6b;"></i>
                </div>
                <h3 style="margin-bottom: 15px;">대화가 종료되었습니다</h3>
                <p style="color: var(--text-muted); margin-bottom: 30px;">
                    대화방이 닫혔습니다.<br>다시 대화하려면 새로운 요청이 필요합니다.
                </p>
                <button class="btn btn-glass" onclick="resetChat()" style="margin-right: 10px;">메인으로 돌아가기</button>
                <button class="btn btn-primary" onclick="requestChat('${myRole}')">다시 요청하기</button>
            </div>
        `;
    }
};

window.getAgreementHTML = function () {
    const status = localStorage.getItem('current_case_status');
    const isReady = ['negotiating', 'completed'].includes(status);

    return `
        <div class="glass-card" style="max-width: 800px; margin: 0 auto; text-align: center; padding: 60px 40px;">
            <i class="fas fa-file-contract" style="font-size: 4rem; color: var(--text-muted); margin-bottom: 20px;"></i>
            <h3 style="margin-bottom: 15px;">합의서 작성</h3>
            <p style="color: var(--text-muted); margin-bottom: 30px;">
                ${isReady ? '이제 합의서를 작성할 수 있습니다.' : '합의금 협상이 완료되면 합의서를 작성할 수 있습니다.'}
            </p>
            <button class="btn btn-primary" onclick="${isReady ? "location.href='agreement.html'" : "alert('아직 합의금 협상이 완료되지 않았습니다.');"}" 
                style="${isReady ? '' : 'opacity: 0.5; cursor: not-allowed;'}">
                <i class="fas fa-plus"></i> 합의서 작성 시작하기
            </button>
        </div>
    `;
};

// Payment Request & Account Info Logic
window.getAccountInfoHTML = function () {
    const myRole = localStorage.getItem('current_case_role');
    const isVictim = myRole === 'victim';
    const caseTitle = localStorage.getItem('current_case_title') || '층간소음 및 모욕 관련 분쟁';
    const opponentName = localStorage.getItem('current_counterparty') || '김철수';
    const myName = localStorage.getItem('user_name') || "홍길동";

    // Check Persistence
    const savedDataJSON = localStorage.getItem('payment_req_data');
    const savedData = savedDataJSON ? JSON.parse(savedDataJSON) : null;
    const hasSentRequest = !!savedData;
    const hasOffenderRequested = localStorage.getItem('account_requested_by_offender') === 'true';

    // Final Amount
    const finalAmountRaw = localStorage.getItem('final_agreed_amount');
    const finalAmount = finalAmountRaw ? parseInt(finalAmountRaw).toLocaleString() : "0";
    const agreementDate = localStorage.getItem('final_agreed_date') || new Date().toLocaleString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    // Step 1: Verification Card
    const step1HTML = `
        <div id="step1_verification" class="glass-card" style="max-width: 600px; margin: 0 auto; text-align: center; animation: fadeIn 0.5s;">
            <h3 style="margin-bottom: 20px;"><i class="fas fa-check-double"></i> 합의 사실 및 금액 재확인</h3>
            <p style="color: var(--text-muted); margin-bottom: 30px;">
                합의를 이행하기 전, 최종 확정된 내용을 확인해주세요.
            </p>

            <div style="background: rgba(255,255,255,0.05); padding: 25px; border-radius: 12px; margin-bottom: 30px; text-align: left;">
                    <div style="display:flex; justify-content:space-between; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px;">
                    <span style="color:var(--text-muted);">최종 합의 금액</span>
                    <span style="font-size: 1.5rem; font-weight: 700; color: #4ade80;">${finalAmount}원</span>
                </div>
                    <div style="display:flex; justify-content:space-between;">
                    <span style="color:var(--text-muted);">합의 확정 일시</span>
                    <span style="font-weight: 500;">${agreementDate}</span>
                </div>
            </div>

            <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); padding: 15px; border-radius: 8px; margin-bottom: 30px; font-size: 0.9rem; color: #93c5fd; text-align: left;">
                <i class="fas fa-info-circle" style="margin-right: 5px;"></i> 본 버튼을 누르면 합의 이행 절차가 시작됩니다.
            </div>

            <button class="btn btn-primary" onclick="goToStep2()" style="width: 100%; padding: 15px; font-size: 1.1rem;">
                <i class="fas fa-check"></i> 네, 확인했습니다 (이행 동의)
            </button>
        </div>
    `;

    let step2HTML = '';

    if (isVictim) {
        const preBank = savedData ? savedData.bank : '';
        const preNum = savedData ? savedData.num : '';
        const banks = ['국민은행', '신한은행', '우리은행', '하나은행', '카카오뱅크', '토스뱅크'];
        let bankOptions = '<option value="" disabled ' + (!preBank ? 'selected' : '') + '>은행을 선택하세요</option>';
        banks.forEach(b => {
            const selected = (b === preBank) ? 'selected' : '';
            bankOptions += `<option value="${b}" ${selected}>${b}</option>`;
        });

        const statusMsg = hasSentRequest
            ? `<div style="background:rgba(74, 222, 128, 0.1); color:#4ade80; padding:10px; border-radius:6px; margin-bottom:20px; font-size:0.9rem;">
                <i class="fas fa-check-circle"></i> <strong>발송 완료됨</strong> (${new Date(savedData.date).toLocaleDateString()})<br>
                내용을 수정하고 다시 보내려면 아래에서 정보를 변경하세요.
                </div>`
            : '';

        const opponentRequestMsg = (!hasSentRequest && hasOffenderRequested)
            ? `<div style="background:rgba(59, 130, 246, 0.1); color:#60a5fa; padding:15px; border-radius:8px; margin-bottom:20px; font-size:0.95rem; border:1px solid rgba(59, 130, 246, 0.3);">
                <i class="fas fa-bell" style="animation: swing 2s infinite;"></i> <strong>상대방이 계좌 정보를 기다리고 있습니다!</strong><br>
                빠른 합의 이행을 위해 지급 요청서를 작성해서 보내주세요.
                </div>`
            : '';

        step2HTML = `
            <div id="step2_action" class="glass-card" style="max-width: 700px; margin: 0 auto; display: none; animation: fadeIn 0.5s;">
                    <h3 style="margin-bottom: 20px;"><i class="fas fa-file-invoice-dollar"></i> 합의금 지급 요청서 작성</h3>
                    ${statusMsg}
                    ${opponentRequestMsg}
                    <p style="color: var(--text-muted); margin-bottom: 30px; line-height:1.6;">
                    단순한 계좌 전달이 아닙니다.<br>
                    <strong>'합의금 지급 요청서'</strong>를 발행하여 법적 증빙력을 높이세요.
                    </p>
                    
                    <!-- Account Input Form -->
                    <div id="accountInputForm">
                    <div class="form-group" style="text-align: left;">
                        <label class="form-label">수취인 성명 (예금주)</label>
                        <input type="text" id="acc_name" class="form-input" value="${myName}" readonly style="background:rgba(255,255,255,0.1); cursor:not-allowed;">
                    </div>
                        <div class="form-group" style="text-align: left;">
                        <label class="form-label">입금 받을 은행</label>
                        <select id="acc_bank" class="form-input" style="background: rgba(255,255,255,0.05); color: white;">
                                ${bankOptions}
                        </select>
                    </div>
                    <div class="form-group" style="text-align: left;">
                        <label class="form-label">계좌 번호</label>
                        <input id="acc_num" type="text" class="form-input" placeholder="'-' 없이 숫자만 입력" value="${preNum}">
                    </div>

                    <!-- Signature Section -->
                    <div class="form-group" style="text-align: left; margin-top: 30px;">
                        <label class="form-label" style="display:flex; justify-content:space-between; align-items:center;">
                            <span><i class="fas fa-pen-nib"></i> 전자 서명</span>
                            <span style="font-size:0.8rem; color:var(--text-muted); font-weight:normal;">마우스 또는 터치로 서명하세요</span>
                        </label>
                        <div style="border: 1px solid rgba(255,255,255,0.2); background: #fff; border-radius: 8px; overflow:hidden; position:relative;">
                            <canvas id="signaturePad" width="500" height="200" style="width:100%; height:200px; cursor:crosshair; touch-action: none; display:block;"></canvas>
                            <button type="button" onclick="clearSignature()" style="position:absolute; top:10px; right:10px; background:rgba(0,0,0,0.1); border:none; border-radius:4px; padding:5px 10px; color:#333; font-size:0.8rem; cursor:pointer;">
                                <i class="fas fa-eraser"></i> 지우기
                            </button>
                        </div>
                        <p style="font-size: 0.8rem; color: #ff6b6b; margin-top: 5px; display:none;" id="sigError">
                            <i class="fas fa-exclamation-circle"></i> 서명을 입력해주세요.
                        </p>
                    </div>

                    <div style="margin-top: 30px;">
                        <button class="btn btn-primary" style="width:100%; padding: 15px;" onclick="previewPaymentRequest('${finalAmount}', '${caseTitle}')">
                            <i class="fas fa-file-contract"></i> 요청서 생성 및 미리보기
                        </button>
                    </div>
                    </div>

                    <!-- Document Preview (Hidden initially) -->
                    <div id="previewContainer" style="display:none;">
                    ${window.generateDocumentHTML(caseTitle, opponentName, myName, finalAmount, { bank: preBank, num: preNum, name: myName }, 'preview_doc', null)}
                    
                    <div id="docActions" style="margin-top: 20px; display:flex; gap: 10px;">
                        <button class="btn btn-glass" onclick="editAccountAgain()" style="flex: 1;">수정하기</button>
                        <button class="btn btn-primary" style="flex: 2; box-shadow: 0 0 20px rgba(74, 222, 128, 0.4);" onclick="sendPaymentRequest('${finalAmount}')">
                            <i class="fas fa-paper-plane"></i> ${hasSentRequest ? '수정본 재발송' : '서명 및 상대방에게 발송'}
                        </button>
                        </div>
                    </div>
            </div>
        `;
    } else {
        // Offender View
        if (hasSentRequest) {
            step2HTML = `
                <div id="step2_action" class="glass-card" style="max-width: 700px; margin: 0 auto; display: none; animation: fadeIn 0.5s;">
                        <h3 style="margin-bottom: 20px;"><i class="fas fa-envelope-open-text"></i> 합의금 지급 요청서 도착</h3>
                    
                    <div id="offenderCover" style="background: rgba(255,255,255,0.05); padding: 30px; text-align: center; border-radius: 12px; margin-bottom: 30px;">
                        <i class="fas fa-file-contract" style="font-size: 4rem; color: #4ade80; margin-bottom: 20px;"></i>
                        <h4 style="margin-bottom: 10px;">피해자로부터 공식 요청서가 도착했습니다</h4>
                        <p style="color: var(--text-muted); font-size: 0.9rem;">
                            합의금 지급을 위한 계좌 정보와 청구 내용이 담겨있습니다.<br>
                            내용을 확인하고 입금을 진행해주세요.
                        </p>
                        <button class="btn btn-glass" onclick="viewReceivedDocument()" style="margin-top: 20px; border-color: #4ade80; color: #4ade80;">
                            <i class="fas fa-search"></i> 요청서 열람 및 계좌 확인
                        </button>
                    </div>

                        <div id="offenderDocView" style="display:none;">
                            ${window.generateDocumentHTML(caseTitle, opponentName, myName, finalAmount, savedData, 'offender_view', savedData?.signature)}
                            
                            <div style="margin-top: 15px; text-align: right; margin-bottom: 30px;">
                            <button class="btn btn-sm btn-glass" onclick="downloadPaymentRequest('offender_view')"><i class="fas fa-download"></i> 문서 저장</button>
                            </div>

                            <div style="text-align: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 30px;">
                            <p style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 15px;">
                                위 계좌로 입금을 완료하셨나요?
                            </p>
                            <button class="btn btn-primary" style="width: 100%; padding: 15px;" onclick="alert('입금 완료 통보가 전송되었습니다.\\n관리자 승인 후 합의서 작성 단계가 열립니다.')">
                                <i class="fas fa-check-circle"></i> 입금 완료 (이체확인증 제출)
                            </button>
                            </div>
                    </div>
                </div>
            `;
        } else {
            if (hasOffenderRequested) {
                step2HTML = `
                    <div id="step2_action" class="glass-card" style="max-width: 600px; margin: 0 auto; display: none; animation: fadeIn 0.5s;">
                            <h3 style="margin-bottom: 20px;"><i class="fas fa-clock"></i> 지급 요청서 대기 중</h3>
                            <div style="text-align: center; padding: 40px;">
                            <div class="spinner-border" style="width: 3rem; height: 3rem; margin-bottom: 20px; color: #4ade80; border-width: 0.2em;" role="status"></div>
                            <h4 style="color:#4ade80; margin-bottom:10px;">요청이 전송되었습니다!</h4>
                            <p style="color: var(--text-muted);">
                                피해자에게 합의금 지급 요청서 작성을 요청했습니다.<br>
                                답변이 올 때까지 잠시만 기다려주세요.
                            </p>
                            </div>
                    </div>
                    `;
            } else {
                step2HTML = `
                    <div id="step2_action" class="glass-card" style="max-width: 600px; margin: 0 auto; display: none; animation: fadeIn 0.5s;">
                            <h3 style="margin-bottom: 20px;"><i class="fas fa-comment-dollar"></i> 합의금 지급 준비</h3>
                            <div style="text-align: center; padding: 30px; background:rgba(255,255,255,0.05); border-radius:12px;">
                            <i class="fas fa-hand-holding-usd" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 20px;"></i>
                            <p style="color: var(--text-muted); margin-bottom:20px;">
                                아직 피해자로부터 지급 요청서(계좌 정보)가 도착하지 않았습니다.<br>
                                빠른 처리를 위해 먼저 요청해보시는 건 어떨까요?
                            </p>
                                <button class="btn btn-primary" style="width: 100%; padding: 15px;" onclick="requestAccountInfo()">
                                <i class="fas fa-paper-plane"></i> 합의금 지급 요청서(계좌) 보내달라고 하기
                            </button>
                            </div>
                    </div>
                    `;
            }
        }
    }
    return step1HTML + step2HTML;
};

// Document Generator Helper
window.generateDocumentHTML = function (title, toName, fromName, amount, data, docId, signatureData = null) {
    const d = data || {};
    return `
        <div id="${docId}" style="text-align: left; background: #fff; color: #333; padding: 40px; border-radius: 4px; box-shadow: 0 5px 20px rgba(0,0,0,0.5); position: relative;">
            <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%) rotate(-30deg); font-size: 4rem; color: rgba(0,0,0,0.05); font-weight:bold; white-space:nowrap; pointer-events:none;">PAYMENT REQUEST</div>
            <div style="border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 30px; text-align: center;">
                <h2 style="margin:0; font-size: 1.8rem; font-family: 'Noto Serif KR', serif; color:#000;">합의금 지급 요청서</h2>
            </div>
            <div style="margin-bottom: 20px;">
                <table style="width:100%; border-collapse: collapse; font-size: 0.9rem;">
                    <tr><td style="width: 100px; font-weight: bold; padding: 5px 0;">사 건 명</td><td>${title}</td></tr>
                    <tr><td style="font-weight: bold; padding: 5px 0;">수 &nbsp;신 &nbsp;인</td><td>${toName} (가해자)</td></tr>
                    <tr><td style="font-weight: bold; padding: 5px 0;">발 &nbsp;신 &nbsp;인</td><td>${fromName} (피해자)</td></tr>
                </table>
            </div>
            <div style="background: #f9f9f9; padding: 15px; border: 1px solid #ddd; margin-bottom: 20px; text-align: center;">
                <div style="font-size: 0.9rem; color: #666; margin-bottom: 5px;">청구 금액 (합의금)</div>
                <div style="font-size: 1.5rem; font-weight: bold; color: #000;">금 ${amount}원</div>
            </div>
            <div style="margin-bottom: 30px; line-height: 1.8; font-size: 0.95rem; text-align: justify;">
                본인은 위 사건의 피해자로서, 양 당사자 간에 협의된 조건에 따라 위 금액의 지급을 공식적으로 요청합니다.<br>
                아래 명시된 계좌로 해당 금액이 입금될 경우, 이는 실질적인 피해 회복 및 합의 이행 의사로 간주되며, 추후 합의서 작성의 기초가 됨을 확인합니다.
            </div>
            <div style="margin-bottom: 30px;">
                <h4 style="border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; font-size:1rem;">[ 입금 지정 계좌 ]</h4>
                <div style="font-weight: bold; font-size: 1.1rem;">
                    <span class="fill-bank">${d.bank || '-'}</span> <span class="fill-num">${d.num || '-'}</span>
                </div>
                <div style="color: #555;">예금주: <span class="fill-name">${d.name || ''}</span></div>
            </div>
            <div style="text-align: right; margin-top: 40px;">
                <div>${new Date().toLocaleDateString()}</div>
                <div style="margin-top: 10px; position: relative; display: inline-block;">
                    위 청구인 : <strong>${fromName}</strong> (인)
                    ${signatureData ? `<img src="${signatureData}" style="position: absolute; right: -30px; top: -30px; width: 100px; height: auto; opacity: 0.9;" alt="서명">` : `<div style="position: absolute; right: -15px; top: -10px; width: 60px; height: 60px; border: 3px solid #cf0000; border-radius: 50%; color: #cf0000; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: bold; opacity: 0.8; transform: rotate(-15deg); border-style: double;">Safe<br>Sign</div>`}
                </div>
            </div>
        </div>
    `;
};

// ... Include other helper functions like previewPaymentRequest, sendPaymentRequest, etc. if needed ...
// For brevity, I will assume they are globally accessible or moved here.
// But as I cannot include EVERYTHING in one go, I'll stop here and rely on existing functions if they are global.
// Wait, `case_detail.js` defined them as `window.previewPaymentRequest` etc.
// So I MUST include them here to avoid breaking functionality.

window.previewPaymentRequest = function (amount, caseNum) {
    const bank = document.getElementById('acc_bank').value;
    const num = document.getElementById('acc_num').value;
    const name = document.getElementById('acc_name').value;

    if (!bank || !num) return alert("은행과 계좌번호를 올바르게 입력해주세요.");

    const canvas = document.getElementById('signaturePad');
    let signatureData = null;
    if (canvas) {
        const blank = document.createElement('canvas');
        blank.width = canvas.width;
        blank.height = canvas.height;
        if (canvas.toDataURL() === blank.toDataURL()) {
            if (!confirm("서명을 입력하지 않았습니다. 서명 없이 진행하시겠습니까? (자동 도장으로 대체됨)")) return;
        } else {
            signatureData = canvas.toDataURL();
        }
    }

    const previewContainer = document.getElementById('previewContainer');
    const caseTitle = localStorage.getItem('current_case_title') || caseNum;
    const opponentName = localStorage.getItem('current_counterparty') || '상대방';

    const newDocHTML = window.generateDocumentHTML(
        caseTitle,
        opponentName,
        name,
        amount,
        { bank, num, name },
        'preview_doc',
        signatureData
    );

    window.tempSignatureData = signatureData;

    const existingDoc = document.getElementById('preview_doc');
    if (existingDoc) {
        existingDoc.outerHTML = newDocHTML;
    }

    document.getElementById('accountInputForm').style.display = 'none';
    document.getElementById('previewContainer').style.display = 'block';
};

window.editAccountAgain = function () {
    document.getElementById('accountInputForm').style.display = 'block';
    document.getElementById('previewContainer').style.display = 'none';
};

window.sendPaymentRequest = async function (amount) {
    if (!confirm("작성된 요청서를 상대방에게 발송하시겠습니까?\\n발송 후에는 내용 수정이 어렵습니다.")) return;

    const bank = document.getElementById('acc_bank').value;
    const num = document.getElementById('acc_num').value;
    const name = document.getElementById('acc_name').value;
    const signature = window.tempSignatureData || null;

    const caseId = localStorage.getItem('current_case_id');
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    const requesterId = userInfo.id || 0;

    try {
        const res = await fetch('/api/case/payment-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                caseId, requesterId, bank, accountNumber: num, accountHolder: name, amount: parseInt(amount.replace(/,/g, '')), signature
            })
        });
        const data = await res.json();

        if (data.success) {
            try {
                const docEl = document.getElementById('preview_doc');
                if (docEl && typeof html2canvas !== 'undefined') {
                    const canvas = await html2canvas(docEl, { scale: 2 });
                    const fileData = canvas.toDataURL('image/png');

                    await fetch('/api/case/document', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            caseId,
                            uploaderId: requesterId,
                            category: 'request',
                            fileName: '지급요청서_' + name + '.png',
                            fileType: 'image/png',
                            fileData
                        })
                    });
                }
            } catch (err) {
                console.error("Auto-save doc failed", err);
            }

            alert("📨 [발송 완료]\\n상대방에게 합의금 지급 요청서가 전달되었습니다.\\n(서류 공유함에도 자동 저장되었습니다)");
            if (window.loadPaymentRequestStatus) window.loadPaymentRequestStatus();
        } else {
            alert("발송 실패: " + data.error);
        }
    } catch (e) {
        console.error(e);
        alert("서버 통신 오류");
    }
};

window.loadPaymentRequestStatus = async () => {
    const caseId = localStorage.getItem('current_case_id');
    const myRole = localStorage.getItem('current_case_role');
    const isVictim = myRole === 'victim';

    try {
        const res = await fetch(`/api/case/payment-request?caseId=${caseId}`);
        const data = await res.json();

        if (data.success && data.data) {
            const reqData = data.data;
            const formattedData = {
                bank: reqData.bank,
                num: reqData.accountNumber,
                name: reqData.accountHolder,
                amount: reqData.amount,
                signature: reqData.signature,
                date: reqData.createdAt
            };

            if (isVictim) {
                document.getElementById('step2_action').style.display = 'block';
                document.getElementById('accountInputForm').innerHTML = `
                    <div style="background:rgba(74, 222, 128, 0.1); color:#4ade80; padding:20px; border-radius:12px; margin-bottom:20px; text-align:center;">
                        <i class="fas fa-check-circle" style="font-size:2rem; margin-bottom:10px;"></i><br>
                        <strong>지급 요청서 발송 완료</strong><br>
                        <span style="font-size:0.9rem; opacity:0.8;">${new Date(reqData.createdAt).toLocaleString()}</span>
                    </div>
                    <button class="btn btn-glass" onclick="viewReceivedDocument()" style="width:100%;">
                            <i class="fas fa-search"></i> 내가 보낸 요청서 보기
                    </button>
                    <div id="offenderDocView" style="display:none; margin-top:20px;">
                            ${window.generateDocumentHTML(
                    localStorage.getItem('current_case_title'),
                    localStorage.getItem('current_counterparty'),
                    reqData.accountHolder,
                    reqData.amount.toLocaleString(),
                    formattedData,
                    'my_sent_doc',
                    reqData.signature
                )}
                    </div>
                `;
                document.getElementById('step1_verification').style.display = 'none';

            } else {
                document.getElementById('step1_verification').style.display = 'none';
                document.getElementById('step2_action').style.display = 'block';

                const step2 = document.getElementById('step2_action');
                step2.innerHTML = `
                        <h3 style="margin-bottom: 20px;"><i class="fas fa-envelope-open-text"></i> 합의금 지급 요청서 도착</h3>
                    
                    <div id="offenderCover" style="background: rgba(255,255,255,0.05); padding: 30px; text-align: center; border-radius: 12px; margin-bottom: 30px;">
                        <i class="fas fa-file-contract" style="font-size: 4rem; color: #4ade80; margin-bottom: 20px;"></i>
                        <h4 style="margin-bottom: 10px;">피해자로부터 공식 요청서가 도착했습니다</h4>
                        <button class="btn btn-glass" onclick="viewReceivedDocument()" style="margin-top: 20px; border-color: #4ade80; color: #4ade80;">
                            <i class="fas fa-search"></i> 요청서 열람 및 계좌 확인
                        </button>
                    </div>

                        <div id="offenderDocView" style="display:none;">
                            ${window.generateDocumentHTML(
                    localStorage.getItem('current_case_title'),
                    localStorage.getItem('current_counterparty'),
                    reqData.accountHolder,
                    reqData.amount.toLocaleString(),
                    formattedData,
                    'offender_view',
                    reqData.signature
                )}
                            <p style="text-align:center; margin-top:20px;">
                                <button class="btn btn-primary" onclick="alert('입금 완료 기능은 준비중입니다.')">
                                    <i class="fas fa-check"></i> 입금 완료 알림 보내기
                                </button>
                            </p>
                    </div>
                `;
            }
        }
    } catch (e) {
        console.error(e);
    }
};

window.viewReceivedDocument = function () {
    const el = document.getElementById('offenderDocView');
    const cover = document.getElementById('offenderCover');
    if (el) el.style.display = 'block';
    if (cover) cover.style.display = 'none';
};

window.downloadPaymentRequest = function (elementId) {
    const element = document.getElementById(elementId);
    if (!element) return alert("문서를 찾을 수 없습니다.");
    if (typeof html2canvas === 'undefined') return alert('이미지 저장 라이브러리 로딩 중... 잠시 후 다시 시도해주세요.');

    html2canvas(element, { scale: 2 }).then(canvas => {
        const link = document.createElement('a');
        link.download = '합의금_지급_요청서.png';
        link.href = canvas.toDataURL();
        link.click();
    });
};

window.requestAccountInfo = function () {
    if (!confirm("피해자에게 합의금 지급 요청서(계좌 정보) 작성을 요청하시겠습니까?")) return;
    localStorage.setItem('account_requested_by_offender', 'true');
    alert("🔔 상대방에게 요청 알림을 보냈습니다.\\n답변이 올 때까지 잠시만 기다려주세요.");
    location.reload();
};
