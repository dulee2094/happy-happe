
// js/views/case_lawyer.js
// Handles Lawyer/Mediation View and Logic

window.getMediationHTML = function () {
    return `
        <div class="glass-card" style="max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 30px;">
            <div style="display: flex; gap: 20px; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 30px; flex-wrap: wrap;">
                <div style="flex-shrink: 0; position: relative;">
                    <div style="width: 120px; height: 120px; border-radius: 50%; overflow: hidden; border: 3px solid var(--primary-color); box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
                        <img src="images/lawyer_profile.png" alt="이동언 변호사" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div style="position: absolute; bottom: 0; right: 0; background: var(--primary-color); color: #fff; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem;">
                        <i class="fas fa-check"></i>
                    </div>
                </div>
                <div style="flex: 1; min-width: 250px;">
                    <h3 style="margin: 0 0 5px 0; font-size: 1.5rem;">이동언 변호사 <span style="font-size: 0.9rem; font-weight: normal; color: var(--text-muted); margin-left:10px;">법률사무소 인피니티 대표</span></h3>
                    <div style="margin-bottom: 10px;">
                        <span style="background: rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 2px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">서울중앙지검 부장검사 출신</span>
                        <span style="background: rgba(255, 255, 255, 0.1); color: var(--text-muted); padding: 2px 8px; border-radius: 4px; font-size: 0.85rem; margin-left: 5px;">형사 전문</span>
                    </div>
                    <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.5; margin-bottom: 10px;">
                        "합의가 원만하지 않거나 법적으로 강력한 대응이 필요하신가요? 20여년간 검사 경험을 바탕으로 해결책을 제시해 드리겠습니다."
                    </p>
                    <button onclick="openProfileModal()" style="background: transparent; border: 1px solid rgba(255,255,255,0.3); color: #fff; padding: 5px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; transition: all 0.2s;">
                        상세 경력 보기 <i class="fas fa-chevron-right" style="font-size: 0.7rem; margin-left: 3px;"></i>
                    </button>
                </div>
            </div>

            <div>
                 <h4 style="margin-bottom: 20px; color: var(--text-muted);"><i class="fas fa-pen"></i> 상담 신청서 작성</h4>
                 <div class="form-group" style="text-align: left;">
                    <div style="display: flex; align-items: baseline; gap: 10px;">
                        <label class="form-label">신청인 이름</label>
                        <span style="font-size: 0.8rem; color: var(--text-muted); opacity: 0.8;">* 실명이 아니어도 괜찮습니다</span>
                    </div>
                    <input id="consultName" type="text" class="form-input" placeholder="이름 또는 닉네임" value="${localStorage.getItem('user_name') || ''}">
                </div>

                <div class="form-group" style="text-align: left;">
                    <label class="form-label">연락받을 전화번호</label>
                    <input id="consultPh" type="tel" class="form-input" placeholder="010-0000-0000" value="${localStorage.getItem('user_phone') || ''}">
                </div>

                 <div class="form-group" style="text-align: left;">
                    <label class="form-label">사건의 요지</label>
                    <textarea id="consultSum" class="form-input" rows="3" placeholder="사건의 경위와 핵심 내용을 간단히 요약해서 작성해주세요."></textarea>
                </div>

                 <div class="form-group" style="text-align: left;">
                    <label class="form-label">상담 요청 내용</label>
                    <textarea id="consultDet" class="form-input" rows="5" placeholder="변호사에게 궁금한 내용이나 현재 상황을 적어주세요."></textarea>
                </div>

                <div class="form-group" style="text-align: left; display: flex; align-items: center; gap: 10px; margin-top: 20px;">
                    <input type="checkbox" id="privacyCheck" style="width: 18px; height: 18px; cursor: pointer;">
                    <label for="privacyCheck" style="cursor: pointer; color: var(--text-muted); font-size: 0.9rem;">
                        [필수] 개인정보 수집 및 이용에 동의합니다.
                    </label>
                </div>

                <button id="btnConsult" class="btn btn-primary" style="width: 100%; padding: 15px;" onclick="submitConsultation()">
                    <i class="fas fa-paper-plane"></i> 상담 신청하기
                </button>
            </div>
        </div>

        <!-- Profile Detail Modal -->
        <div id="profileModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; align-items: center; justify-content: center; backdrop-filter: blur(5px);">
            <div class="glass-card" style="max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; position: relative; padding: 40px;">
                <button onclick="closeProfileModal()" style="position: absolute; top: 20px; right: 20px; background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer;">&times;</button>
                
                <div style="text-align: center; margin-bottom: 30px;">
                    <img src="images/lawyer_profile.png" style="width: 100px; height: 100px; border-radius: 50%; border: 3px solid var(--primary-color); object-fit: cover; margin-bottom: 15px;">
                    <h2 style="margin: 0;">이동언 변호사</h2>
                    <p style="color: var(--primary-color); margin-top: 5px;">법률사무소 인피니티 대표변호사</p>
                </div>

                <div style="margin-bottom: 30px;">
                    <h4 style="border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 10px; margin-bottom: 15px; color: var(--text-muted);">학력</h4>
                    <ul style="list-style: none; padding: 0; line-height: 1.8; font-size: 0.95rem;">
                        <li><span style="color:var(--text-muted); display:inline-block; width: 60px;">1995</span> 여수고등학교 졸업</li>
                        <li><span style="color:var(--text-muted); display:inline-block; width: 60px;">2000</span> 서울대학교 정치학과 졸업</li>
                        <li><span style="color:var(--text-muted); display:inline-block; width: 60px;">2012</span> 미국 UC Davis LL.M.</li>
                    </ul>
                </div>

                <div>
                    <h4 style="border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 10px; margin-bottom: 15px; color: var(--text-muted);">경력</h4>
                     <ul style="list-style: none; padding: 0; line-height: 1.8; font-size: 0.95rem;">
                        <li><span style="color:var(--text-muted); display:inline-block; width: 80px;">2000</span> 제42회 사법시험 합격</li>
                        <li><span style="color:var(--text-muted); display:inline-block; width: 80px;">2003</span> 사법연수원 수료(제32기)</li>
                        <li><span style="color:var(--text-muted); display:inline-block; width: 80px;">2003</span> 육군법무관</li>
                        <li><span style="color:var(--text-muted); display:inline-block; width: 80px;">2006</span> 서울남부지방검찰청 검사</li>
                        <li><span style="color:var(--text-muted); display:inline-block; width: 80px;">2008</span> 광주지검 목포지청 검사</li>
                        <li><span style="color:var(--text-muted); display:inline-block; width: 80px;">2010.2</span> 광주지검 순천지청 검사</li>
                        <li><span style="color:var(--text-muted); display:inline-block; width: 80px;">2013.2</span> 서울중앙지방검찰청 검사</li>
                        <li><span style="color:var(--text-muted); display:inline-block; width: 80px;">2016.1</span> 대검찰청 검찰연구관</li>
                        <li><span style="color:var(--text-muted); display:inline-block; width: 80px;">2018.7</span> 수원지검 평택지청 형사2부장검사</li>
                        <li><span style="color:var(--text-muted); display:inline-block; width: 80px;">2019.8</span> 법무부 국제형사과장</li>
                        <li><span style="color:var(--text-muted); display:inline-block; width: 80px;">2020.9</span> <strong>서울중앙지방검찰청 형사5부장</strong></li>
                        <li><span style="color:var(--text-muted); display:inline-block; width: 80px;">2021.7</span> 제주지방검찰청 형사1부장</li>
                        <li><span style="color:var(--text-muted); display:inline-block; width: 80px;">2022.7</span> 대전지방검찰청 인권보호부장(~2023.9)</li>
                        <li><span style="color:var(--text-muted); display:inline-block; width: 80px;">2023.10</span> 변호사 개업(서울회)</li>
                        <li><span style="color:var(--text-muted); display:inline-block; width: 80px;">2023.10</span> <strong>법률사무소 인피니티 변호사</strong></li>
                    </ul>
                </div>
            </div>
        </div>
    `;
};


window.openProfileModal = function () {
    const modal = document.getElementById('profileModal');
    if (modal) modal.style.display = 'flex';
};

window.closeProfileModal = function () {
    const modal = document.getElementById('profileModal');
    if (modal) modal.style.display = 'none';
};

window.submitConsultation = async function () {
    const name = document.getElementById('consultName').value;
    const summary = document.getElementById('consultSum').value;
    const details = document.getElementById('consultDet').value;
    const phoneNumber = document.getElementById('consultPh').value;
    const privacyCheck = document.getElementById('privacyCheck').checked;

    if (!name || !summary || !details || !phoneNumber) {
        alert("모든 내용을 입력해주세요.");
        return;
    }

    if (!privacyCheck) {
        alert("개인정보 수집 및 이용에 동의해주세요.");
        return;
    }

    const btn = document.getElementById('btnConsult');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 전송 중...';

    try {
        const res = await fetch('/api/consultation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, summary, details, phoneNumber })
        });
        const data = await res.json();

        if (data.success) {
            alert("✅ 상담 신청이 성공적으로 접수되었습니다.\n담당 변호사가 확인 후 연락드리겠습니다.");
            document.getElementById('consultName').value = '';
            document.getElementById('consultSum').value = '';
            document.getElementById('consultDet').value = '';
            document.getElementById('consultPh').value = '';
            document.getElementById('privacyCheck').checked = false;
        } else {
            alert("오류가 발생했습니다: " + data.error);
        }
    } catch (e) {
        console.error(e);
        alert("서버 통신 오류가 발생했습니다.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> 상담 신청하기';
    }
};
