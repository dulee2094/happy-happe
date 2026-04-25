
// js/views/case_analysis.js
// Handles Analysis Chart and Result View

window.getAnalysisHTML = function () {
    return `
         <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
            <div class="glass-card">
                <h3 style="margin-bottom: 20px;"><i class="fas fa-chart-line"></i> 예상 합의금</h3>
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 2.5rem; font-weight: 700; color: var(--primary); margin-bottom: 10px;">약 3,500,000원</div>
                    <div style="color: var(--text-muted); margin-bottom: 20px;">AI 분석 평균</div>
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px;">
                        <span style="color: var(--text-muted);">범위:</span>
                        <span style="font-weight: 600;">약 2,000,000 ~ 약 4,500,000원</span>
                    </div>
                </div>
            </div>

            <div class="glass-card" style="grid-column: 1 / -1;">
                <h3 style="margin-bottom: 20px;"><i class="fas fa-chart-bar"></i> 유사 사례 분석</h3>
                <canvas id="analysisChart" style="max-height: 300px;"></canvas>
                <p style="margin-top: 20px; color: var(--text-muted); font-size: 0.9rem; line-height: 1.6;">
                    * 귀하의 사건(폭행, 전치 2주)과 유사한 최근 30개 사례를 분석했습니다.<br>
                    * 일반적으로 <span style="color: var(--text-main); font-weight: 600;">200만원 ~ 450만원</span> 사이에서 합의가 이루어졌습니다.
                </p>
            </div>
        </div>
    `;
};

window.generateChartData = function () {
    const base = 300;
    const data = [];
    for (let i = 0; i < 6; i++) {
        data.push(base + Math.floor(Math.random() * 200) - 100);
    }
    return data;
};

window.initializeChart = function () {
    const ctx = document.getElementById('analysisChart');
    if (!ctx) return;
    if (typeof Chart === 'undefined') return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['사례1', '사례2', '사례3', '사례4', '사례5', '귀하의 사건'],
            datasets: [{
                label: '합의금 분포 (단위: 만원)',
                data: window.generateChartData(),
                borderColor: '#5865F2',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { display: false }
            }
        }
    });
};
