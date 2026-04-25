
/**
 * Agreement View Module
 * Handles HTML generation for the Agreement and Payment sections
 */

// Helper function to generate document HTML (Pure function)
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
                    ${signatureData ?
            `<img src="${signatureData}" style="position: absolute; right: -30px; top: -30px; width: 100px; height: auto; opacity: 0.9;" alt="서명">`
            :
            `<div style="position: absolute; right: -15px; top: -10px; width: 60px; height: 60px; border: 3px solid #cf0000; border-radius: 50%; color: #cf0000; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: bold; opacity: 0.8; transform: rotate(-15deg); border-style: double;">
                            Safe<br>Sign
                        </div>`
        }
                </div>
            </div>
        </div>
    `;
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

window.getAccountInfoHTML = function () {
    const myRole = localStorage.getItem('current_case_role');
    const isVictim = myRole === 'victim';

    const caseTitle = localStorage.getItem('current_case_title') || '층간소음 및 모욕 관련 분쟁';
    const opponentName = localStorage.getItem('current_counterparty') || '김철수';
    const myName = localStorage.getItem('user_name') || "홍길동";

    const finalAmountRaw = localStorage.getItem('final_agreed_amount');
    const finalAmount = finalAmountRaw ? parseInt(finalAmountRaw).toLocaleString() : "0";
    const agreementDate = localStorage.getItem('final_agreed_date') || new Date().toLocaleString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const savedDataJSON = localStorage.getItem('payment_req_data');
    const savedData = savedDataJSON ? JSON.parse(savedDataJSON) : null;
    const hasSentRequest = !!savedData;

    const hasOffenderRequested = localStorage.getItem('account_requested_by_offender') === 'true';

    // Step 1: Verification
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
        // Victim View
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
                    단순한 계좌 전달이 아닙니다 (법적 증빙).
                    </p>
                    
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

                    <div class="form-group" style="text-align: left; margin-top: 30px;">
                        <label class="form-label" style="display:flex; justify-content:space-between; align-items:center;">
                            <span><i class="fas fa-pen-nib"></i> 전자 서명</span>
                            <span style="font-size:0.8rem; color:var(--text-muted); font-weight:normal;">마우스 또는 터치로 서명하세요</span>
                        </label>
                        <div style="border: 1px solid rgba(255,255,255,0.2); background: #fff; border-radius: 8px; overflow:hidden; position:relative;">
                            <canvas id="signaturePad" width="500" height="200" style="width:100%; height:200px; cursor:crosshair; touch-action: none; display:block;"></canvas>
                            <button type="button" onclick="window.SignaturePad.clear('signaturePad')" style="position:absolute; top:10px; right:10px; background:rgba(0,0,0,0.1); border:none; border-radius:4px; padding:5px 10px; color:#333; font-size:0.8rem; cursor:pointer;">
                                <i class="fas fa-eraser"></i> 지우기
                            </button>
                        </div>
                    </div>

                    <div style="margin-top: 30px;">
                        <button class="btn btn-primary" style="width:100%; padding: 15px;" onclick="previewPaymentRequest('${finalAmount}', '${caseTitle}')">
                            <i class="fas fa-file-contract"></i> 요청서 생성 및 미리보기
                        </button>
                    </div>
                    </div>

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
        // Offender View logic (simplified for brevity, keeping existing structure)
        if (hasSentRequest) {
            step2HTML = `
                <div id="step2_action" class="glass-card" style="max-width: 700px; margin: 0 auto; display: none; animation: fadeIn 0.5s;">
                        <h3 style="margin-bottom: 20px;"><i class="fas fa-envelope-open-text"></i> 합의금 지급 요청서 도착</h3>
                    
                    <div id="offenderCover" style="background: rgba(255,255,255,0.05); padding: 30px; text-align: center; border-radius: 12px; margin-bottom: 30px;">
                        <i class="fas fa-file-contract" style="font-size: 4rem; color: #4ade80; margin-bottom: 20px;"></i>
                        <h4 style="margin-bottom: 10px;">피해자로부터 공식 요청서가 도착했습니다</h4>
                        <button class="btn btn-glass" onclick="viewReceivedDocument()" style="margin-top: 20px; border-color: #4ade80; color: #4ade80;">
                            <i class="fas fa-search"></i> 요청서 열람 및 계좌 확인
                        </button>
                    </div>

                        <div id="offenderDocView" style="display:none;">
                            ${window.generateDocumentHTML(caseTitle, opponentName, myName, finalAmount, savedData, 'offender_view', savedData?.signature)}
                            <div style="text-align: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 30px; margin-top:20px;">
                            <button class="btn btn-primary" style="width: 100%; padding: 15px;" onclick="alert('입금 완료 통보가 전송되었습니다.')">
                                <i class="fas fa-check-circle"></i> 입금 완료 (이체확인증 제출)
                            </button>
                            </div>
                    </div>
                </div>
            `;
        } else if (hasOffenderRequested) {
            step2HTML = `
                <div id="step2_action" class="glass-card" style="max-width: 600px; margin: 0 auto; display: none; animation: fadeIn 0.5s;">
                        <h3 style="margin-bottom: 20px;"><i class="fas fa-clock"></i> 지급 요청서 대기 중</h3>
                         <div style="text-align: center; padding: 40px;">
                        <div class="spinner-border" style="width: 3rem; height: 3rem; margin-bottom: 20px; color: #4ade80; border-width: 0.2em;" role="status"></div>
                        <h4 style="color:#4ade80; margin-bottom:10px;">요청이 전송되었습니다!</h4>
                         </div>
                </div>`;
        } else {
            step2HTML = `
                <div id="step2_action" class="glass-card" style="max-width: 600px; margin: 0 auto; display: none; animation: fadeIn 0.5s;">
                        <h3 style="margin-bottom: 20px;"><i class="fas fa-comment-dollar"></i> 합의금 지급 준비</h3>
                        <div style="text-align: center; padding: 30px; background:rgba(255,255,255,0.05); border-radius:12px;">
                         <button class="btn btn-primary" style="width: 100%; padding: 15px;" onclick="requestAccountInfo()">
                            <i class="fas fa-paper-plane"></i> 합의금 지급 요청서(계좌) 보내달라고 하기
                        </button>
                        </div>
                </div>`;
        }
    }

    return step1HTML + step2HTML;
};
