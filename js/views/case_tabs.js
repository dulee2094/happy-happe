
// js/views/case_tabs.js
// Handles Proposal Banner and Apology View HTML

window.getProposalHTML = function () {
    return `
        <div class="glass-card" style="max-width: 800px; margin: 0 auto; text-align: center; padding: 60px 20px;">
            <div style="width: 80px; height: 80px; background: rgba(74, 222, 128, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 25px;">
                <i class="fas fa-hand-holding-usd" style="font-size: 2.5rem; color: var(--secondary);"></i>
            </div>
            
            <h2 style="margin-bottom: 15px;">블라인드 합의금 조율</h2>
            <p style="color: var(--text-muted); margin-bottom: 40px; font-size: 1.05rem; line-height: 1.6; max-width: 500px; margin-left: auto; margin-right: auto;">
                상대방에게 구체적인 금액을 노출하지 않고,<br>
                안전하게 합의점을 찾아가는 <strong>블라인드 제안 시스템</strong>입니다.
            </p>
            
            <button class="btn btn-primary" onclick="location.href='blind_proposal.html'" 
                style="padding: 18px 40px; font-size: 1.1rem; border-radius: 50px; box-shadow: 0 10px 30px rgba(74, 222, 128, 0.3); transition: all 0.3s ease;">
                <i class="fas fa-search-dollar" style="margin-right: 10px;"></i> 합의금 제안하러 가기
            </button>
        </div>
    `;
};

window.getApologyHTML = function () {
    const myRole = localStorage.getItem('current_case_role');
    if (myRole === 'offender') {
        return `
            <div class="glass-card" style="max-width: 800px; margin: 0 auto; text-align: center; padding: 60px 20px;">
                    <div style="width: 80px; height: 80px; background: rgba(74, 222, 128, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 25px;">
                    <i class="fas fa-feather-alt" style="font-size: 2.5rem; color: var(--secondary);"></i>
                </div>
                
                <h2 style="margin-bottom: 15px;">사과문 작성 스튜디오</h2>
                <p style="color: var(--text-muted); margin-bottom: 40px; font-size: 1.05rem; line-height: 1.6; max-width: 500px; margin-left: auto; margin-right: auto;">
                    진심이 담긴 사과문은 피해자의 마음을 움직이는 가장 큰 힘입니다.<br>
                    전용 에디터에서 AI의 도움을 받아 진정성 있는 사과문을 작성해보세요.
                </p>
                
                <button class="btn btn-primary" onclick="location.href='apology_write.html'" 
                    style="padding: 18px 40px; font-size: 1.1rem; border-radius: 50px; box-shadow: 0 10px 30px rgba(74, 222, 128, 0.3); transition: all 0.3s ease;">
                    <i class="fas fa-pen-nib" style="margin-right: 10px;"></i> 사과문 작성하러 가기
                </button>
            </div>
        `;
    } else {
        const apologyStatus = localStorage.getItem('current_apology_status') || 'none';
        const apologyContent = localStorage.getItem('current_apology_content') || '';
        const apologyDate = localStorage.getItem('current_apology_date') || new Date().toLocaleDateString();

        if (apologyStatus === 'sent' || apologyStatus === 'read') {
            return `
                <div class="glass-card" style="max-width: 800px; margin: 0 auto;">
                    <h3 style="margin-bottom: 20px;"><i class="fas fa-envelope-open-text"></i> 도착한 사과문</h3>
                    <p style="color: var(--text-muted); margin-bottom: 30px;">피의자로부터 도착한 사과문입니다.</p>

                    <div id="apologyImageContainer" style="margin-bottom: 30px; text-align: center; display: none;">
                        <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; display: inline-block;">
                            <img id="apologyImage" src="" alt="사과문 이미지" style="max-width: 100%; border-radius: 4px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
                        </div>
                        <div style="margin-top: 15px;">
                            <a id="apologyDownloadBtn" href="#" download class="btn btn-glass" style="font-size: 0.9rem; padding: 8px 16px;">
                                <i class="fas fa-download"></i> 이미지 원본 다운로드
                            </a>
                        </div>
                    </div>

                    <!-- Text Fallback: Hidden by default, shown only if image fails to load -->
                    <div id="apologyTextFallback" style="display: none; background: rgba(255,255,255,0.03); padding: 30px; border-radius: 12px; margin-bottom: 20px; line-height: 1.8; white-space: pre-wrap; border: 1px solid rgba(255,255,255,0.05);">${apologyContent}</div>
                    
                    <div style="display: flex; justify-content: flex-end;">
                        <span style="font-size: 0.85rem; color: var(--text-muted);">${apologyDate} 수신됨</span>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="glass-card" style="max-width: 800px; margin: 0 auto; text-align: center; padding: 60px 40px;">
                    <div style="width: 80px; height: 80px; background: rgba(255, 255, 255, 0.05); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 25px;">
                        <i class="far fa-envelope" style="font-size: 2.5rem; color: var(--text-muted);"></i>
                    </div>
                    <h3 style="margin-bottom: 15px; color: var(--text-muted);">아직 도착한 사과문이 없습니다</h3>
                    <p style="color: var(--text-muted); opacity: 0.6; margin-bottom: 0;">
                        피의자가 아직 사과문을 작성하지 않았습니다.<br>
                        사과문이 도착하면 알림을 보내드립니다.
                    </p>
                </div>
            `;
        }
    }
};
