
// case_detail_agreement.js
// Handles Agreement and Payment Request (Step 2) Logic
// Refactored to use: js/case_detail_agreement_view.js and js/modules/signature_pad.js

window.previewPaymentRequest = function (amount, caseNum) {
    const bank = document.getElementById('acc_bank').value;
    const num = document.getElementById('acc_num').value;
    const name = document.getElementById('acc_name').value;

    if (!bank || !num) return alert("은행과 계좌번호를 올바르게 입력해주세요.");

    let signatureData = null;
    if (!window.SignaturePad.isEmpty('signaturePad')) {
        signatureData = window.SignaturePad.getDataURL('signaturePad');
    } else {
        if (!confirm("서명을 입력하지 않았습니다. 서명 없이 진행하시겠습니까? (자동 도장으로 대체됨)")) return;
    }

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
    if (!confirm("작성된 요청서를 상대방에게 발송하시겠습니까?\n발송 후에는 내용 수정이 어렵습니다.")) return;

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
                alert("⚠️ 주의: 지급 요청서는 발송되었으나, '서류 공유함' 자동 저장은 실패했습니다.");
            }

            alert("📨 [발송 완료]\n상대방에게 합의금 지급 요청서가 전달되었습니다.");
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
    if (!caseId) return;

    try {
        const res = await fetch(`/api/case/payment-request?caseId=${caseId}`);
        const data = await res.json();

        if (data.success && data.data) {
            localStorage.setItem('payment_req_data', JSON.stringify(data.data));
            // Trigger re-render of current view if needed, or rely on navigation
            // Ideally we should reload the content part if currently viewing 'account'
            if (document.querySelector('.nav-item.active[data-menu="account"]')) {
                window.loadContent('account');
            }
        }
    } catch (e) {
        console.error(e);
    }
};

window.viewReceivedDocument = function () {
    const docView = document.getElementById('offenderDocView');
    if (docView) docView.style.display = 'block';
    const cover = document.getElementById('offenderCover');
    if (cover) cover.style.display = 'none';
};

window.downloadPaymentRequest = function (elementId) {
    const element = document.getElementById(elementId);
    if (!element) return alert("문서를 찾을 수 없습니다.");

    if (typeof html2canvas === 'undefined') return alert('라이브러리 로딩 중...');

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
    alert("🔔 상대방에게 요청 알림을 보냈습니다.");
    location.reload();
};

window.initializeSignaturePad = function () {
    window.SignaturePad.initialize('signaturePad');
};

window.clearSignature = function () {
    window.SignaturePad.clear('signaturePad');
};
