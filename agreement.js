// Signature Pad Logic
const canvas = document.getElementById('signaturePad');
const ctx = canvas.getContext('2d');
let painting = false;

function startPosition(e) {
    painting = true;
    draw(e);
}

function finishedPosition() {
    painting = false;
    ctx.beginPath();
}

function draw(e) {
    if (!painting) return;

    // Handle both mouse and touch events
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;

    // Get canvas position relative to viewport
    const rect = canvas.getBoundingClientRect();

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    // For smooth drawing
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
}

// Event Listeners for Drawing
canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', finishedPosition);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseleave', finishedPosition); // Fix for dragging out

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent scrolling
    startPosition(e);
});
canvas.addEventListener('touchend', finishedPosition);
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    draw(e);
});

// Clear Button
document.getElementById('clearSignBtn').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Confirm Sign & Enable Payment
const confirmBtn = document.getElementById('confirmSignBtn');
const paymentCard = document.getElementById('paymentCard');
const stepIndicator = document.querySelectorAll('.step');

confirmBtn.addEventListener('click', () => {
    // Check if empty (basic check)
    // In real app, we would check pixels or save dataURL

    // Visual feedback
    confirmBtn.textContent = '서명 완료';
    confirmBtn.classList.remove('btn-primary');
    confirmBtn.classList.add('btn-glass');
    confirmBtn.disabled = true;

    // Update Document
    document.getElementById('sign-place-1').textContent = '홍길동(서명완료)';
    document.getElementById('sign-place-1').style.color = 'black';
    document.getElementById('sign-place-1').style.fontWeight = 'bold';

    // Enable Payment
    paymentCard.style.opacity = '1';
    paymentCard.style.pointerEvents = 'auto';

    // Update Step Indicator
    stepIndicator[0].textContent = '1. 완료';
    stepIndicator[2].classList.add('active'); // Highlight Payment Step

    alert('전자 서명이 완료되었습니다. 다음 단계인 결제를 진행해주세요.');
});

// Payment Logic
const payBtn = document.getElementById('payBtn');
const methods = document.querySelectorAll('.method');

methods.forEach(method => {
    method.addEventListener('click', () => {
        methods.forEach(m => m.classList.remove('selected'));
        method.classList.add('selected');
    });
});

payBtn.addEventListener('click', () => {
    if (confirm('에스크로 계좌로 3,500,000원을 입금요청하시겠습니까?')) {
        payBtn.textContent = '입금 확인 요청중...';
        payBtn.disabled = true;

        // Simulate API call
        setTimeout(async () => {
            // New Flow: Auto-save Agreement to Document Box using mocked PDF or Image
            // Since we can't easily capture the PDF modal content (it's hidden or complex), 
            // we will upload a text confirmation or placeholder.

            try {
                // Wait for UI to update (spinner or generic confirmation)
                // Use html2canvas to capture the agreement paper
                const docEl = document.querySelector('.paper-doc'); // Using specific class for the document paper
                if (docEl && typeof html2canvas !== 'undefined') {
                    // Slight delay to ensure rendering
                    await new Promise(r => setTimeout(r, 100));

                    const canvas = await html2canvas(docEl, { scale: 2 });
                    const fileData = canvas.toDataURL('image/png');

                    const caseId = localStorage.getItem('current_case_id');
                    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
                    const userId = userInfo.id || 0;

                    await fetch('/api/case/document', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            caseId,
                            uploaderId: userId,
                            category: 'agreement',
                            fileName: '최종합의서_' + new Date().toLocaleDateString().replace(/\./g, '') + '_signed.png',
                            fileType: 'image/png',
                            fileData: fileData
                        })
                    });

                    alert("✅ 최종 합의서(서명본)가 안전하게 저장되었습니다.\n서류 공유함에서 확인 가능합니다.");
                }

            } catch (e) {
                console.error("Auto-save agreement failed", e);
            }


            // Open PDF Modal directly after payment for demo
            const modal = document.getElementById('pdfModal');
            modal.style.display = 'flex';

            // Mock Processing Time
            setTimeout(() => {
                document.getElementById('pdfLoading').style.display = 'none';
                document.getElementById('pdfSuccess').style.display = 'block';
            }, 2000);

        }, 1500);
    }
});

function downloadMockPDF() {
    // Create a dummy link to download a file
    const link = document.createElement('a');
    link.href = 'data:application/pdf;base64,JVBERi0xL...'; // Dummy Data header
    link.download = '2024?뺤젣12345_?⑹쓽??理쒖쥌.pdf';
    link.click();
}

function closePdfModal() {
    document.getElementById('pdfModal').style.display = 'none';
    location.href = 'dashboard.html'; // Return to dash
}