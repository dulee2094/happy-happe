// js/dashboard_view.js
// Handles HTML rendering for Dashboard

window.getCasesPageHTML = function () {
    return `
        <div class="top-bar">
            <div>
                <h2 style="margin-bottom: 5px;">내 협상방 목록</h2>
                <p style="color: var(--text-muted); font-size: 0.9rem;">진행 중인 모든 협상방을 확인하세요</p>
            </div>
        </div>

        <div id="casesContainer" style="display: flex; flex-direction: column; gap: 15px; margin-top: 20px;">
            <div class="glass-card" style="text-align: center; padding: 40px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 15px;"></i>
                <p style="color: var(--text-muted);">협상방 정보를 불러오는 중...</p>
            </div>
        </div>
    `;
};

window.createCaseCard = function (caseItem) {
    const card = document.createElement('div');
    card.className = 'glass-card';
    card.style.cursor = 'pointer';
    card.style.transition = 'all 0.3s';
    card.style.borderLeft = '4px solid ' + getStatusColor(caseItem.connectionStatus);

    card.onclick = () => {
        window.openCaseDetail(
            caseItem.caseId,
            caseItem.caseNumber,
            caseItem.myRole,
            caseItem.connectionStatus,
            caseItem.counterpartyName,
            caseItem.registrationDate,
            caseItem.roomTitle,
            caseItem.summary,
            caseItem.apologyStatus,
            caseItem.apologyContent
        );
    };

    card.onmouseenter = () => {
        card.style.transform = 'translateX(5px)';
        card.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)';
    };
    card.onmouseleave = () => {
        card.style.transform = 'translateX(0)';
        card.style.boxShadow = '';
    };

    const statusBadge = getStatusBadge(caseItem.connectionStatus);
    const roleIcon = caseItem.myRole === 'partyA' ? 'fa-user-tie' : 'fa-user-shield';
    const roleText = caseItem.myRole === 'partyA' ? '제안자' : '참여자';

    let displayTitle = caseItem.roomTitle || caseItem.summary || caseItem.caseNumber;
    let subTitle = '';

    if (caseItem.topic) {
        subTitle = `<span style="font-size: 0.8rem; color: var(--text-muted); font-weight: normal; margin-left: 8px;">Ref: ${caseItem.roomCode}</span>`;
    } else if (displayTitle !== caseItem.roomCode) {
        subTitle = `<span style="font-size: 0.8rem; color: var(--text-muted); font-weight: normal; margin-left: 8px;">${caseItem.roomCode}</span>`;
    }

    if (displayTitle.length > 25) displayTitle = displayTitle.substring(0, 25) + '...';

    card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
            <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                    <i class="fas ${roleIcon}" style="color: var(--text-muted);"></i>
                    <h3 style="font-size: 1.1rem; margin: 0;">${displayTitle} ${subTitle}</h3>
                </div>
                <p style="color: var(--text-muted); font-size: 0.85rem; margin: 0;">내 역할: ${roleText}</p>
            </div>
            ${statusBadge}
        </div>
        <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: rgba(255,255,255,0.03); border-radius: 8px;">
            <div style="width: 45px; height: 45px; background: rgba(255,255,255,0.05); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-user-friends" style="font-size: 1.2rem; color: ${getStatusColor(caseItem.connectionStatus)};"></i>
            </div>
            <div style="flex: 1;">
                <div style="font-size: 0.8rem; color: var(--text-muted);">협상 상대방</div>
                <div style="font-weight: 600; font-size: 1rem;">${caseItem.counterpartyName}</div>
            </div>
            <div style="text-align: right; margin-right: 15px;">
                    <div style="font-size: 0.8rem; color: var(--text-muted);">등록일</div>
                    <div style="font-size: 0.9rem;">${caseItem.registrationDate || '2024.01.01'}</div>
            </div>
            <i class="fas fa-chevron-right" style="color: var(--text-muted); font-size: 1.2rem;"></i>
        </div>
    `;

    return card;
};

window.getStatusColor = function (status) {
    switch (status) {
        case 'connected': return 'var(--secondary)';
        case 'pending': return 'orange';
        case 'invited': return 'rgba(255,255,255,0.3)';
        default: return 'rgba(255,255,255,0.1)';
    }
};

window.getStatusBadge = function (status) {
    let text, bgColor, textColor;
    switch (status) {
        case 'connected':
            text = '연결 완료';
            bgColor = 'var(--secondary)';
            textColor = '#fff';
            break;
        case 'pending':
            text = '수락 대기';
            bgColor = 'rgba(255, 165, 0, 0.2)';
            textColor = 'orange';
            break;
        case 'invited':
            text = '가입 대기';
            bgColor = 'rgba(255,255,255,0.1)';
            textColor = '#aaa';
            break;
        default:
            text = '대기 중';
            bgColor = 'rgba(255,255,255,0.05)';
            textColor = '#888';
    }
    return `<span class="status-badge" style="background: ${bgColor}; color: ${textColor};">${text}</span>`;
};

window.getProfilePageHTML = function () {
    const userName = localStorage.getItem('user_name') || '사용자';
    const userEmail = localStorage.getItem('user_email') || 'user@example.com';
    const userRole = localStorage.getItem('user_role') || 'partyA';
    const roleText = userRole === 'partyA' ? '제안자' : '참여자';

    return `
        <div class="top-bar">
            <h2>나의 정보</h2>
        </div>

        <div style="max-width: 800px; margin: 20px auto; display: flex; flex-direction: column; gap: 20px;">
            <!-- 프로필 정보 -->
            <div class="glass-card">
                <h3 style="margin-bottom: 20px;"><i class="fas fa-user"></i> 프로필 정보</h3>
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <span style="color: var(--text-muted);">이름</span>
                        <span style="font-weight: 600;">${userName}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <span style="color: var(--text-muted);">이메일</span>
                        <span style="font-weight: 600;">${userEmail}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <span style="color: var(--text-muted);">주 역할</span>
                        <span style="font-weight: 600;">${roleText}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 12px 0;">
                        <span style="color: var(--text-muted);">가입일</span>
                        <span style="font-weight: 600;">2024년 1월 1일</span>
                    </div>
                </div>
            </div>

            <!-- 본인 인증 상태 -->
            <div class="glass-card">
                <h3 style="margin-bottom: 20px;"><i class="fas fa-shield-alt"></i> 본인 인증 상태</h3>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px;">
                        <i class="fas fa-check-circle" style="color: var(--secondary); font-size: 1.5rem;"></i>
                        <div style="flex: 1;">
                            <div style="font-weight: 600;">이메일 인증</div>
                            <div style="font-size: 0.85rem; color: var(--text-muted);">인증 완료</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px;">
                        <i class="fas fa-check-circle" style="color: var(--secondary); font-size: 1.5rem;"></i>
                        <div style="flex: 1;">
                            <div style="font-weight: 600;">휴대폰 인증</div>
                            <div style="font-size: 0.85rem; color: var(--text-muted);">인증 완료</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; opacity: 0.6;">
                        <i class="far fa-circle" style="color: var(--text-muted); font-size: 1.5rem;"></i>
                        <div style="flex: 1;">
                            <div style="font-weight: 600;">신분증 인증 (선택)</div>
                            <div style="font-size: 0.85rem; color: var(--text-muted);">미인증</div>
                        </div>
                        <button class="btn btn-glass" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">인증하기</button>
                    </div>
                </div>
            </div>

            <!-- 활동 통계 -->
            <div class="glass-card">
                <h3 style="margin-bottom: 20px;"><i class="fas fa-chart-bar"></i> 활동 통계</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                    <div style="text-align: center; padding: 20px; background: rgba(255,255,255,0.03); border-radius: 8px;">
                        <div style="font-size: 2rem; font-weight: 700; color: var(--primary);">3</div>
                        <div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 5px;">진행 중인 협상방</div>
                    </div>
                    <div style="text-align: center; padding: 20px; background: rgba(255,255,255,0.03); border-radius: 8px;">
                        <div style="font-size: 2rem; font-weight: 700; color: var(--secondary);">0</div>
                        <div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 5px;">완료된 협상</div>
                    </div>
                    <div style="text-align: center; padding: 20px; background: rgba(255,255,255,0.03); border-radius: 8px;">
                        <div style="font-size: 2rem; font-weight: 700; color: #4A9EFF;">24</div>
                        <div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 5px;">총 메시지</div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

window.getNotificationsPageHTML = function () {
    return `
        <div class="top-bar">
            <h2>알림 센터</h2>
            <button class="btn btn-glass" style="font-size: 0.85rem; padding: 0.5rem 1rem;" onclick="markAllNotificationsRead()">
                <i class="fas fa-check-double"></i> 모두 읽음 처리
            </button>
        </div>

        <div style="max-width: 900px; margin: 20px auto;">
            <div class="glass-card">
                <div id="notificationList" style="display: flex; flex-direction: column; gap: 10px;">
                    <div style="text-align: center; padding: 40px;">
                        <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 15px;"></i>
                        <p style="color: var(--text-muted);">알림을 불러오는 중...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
};

window.getSettingsPageHTML = function () {
    return `
        <div class="top-bar">
            <h2>설정</h2>
        </div>

        <div style="max-width: 800px; margin: 20px auto; display: flex; flex-direction: column; gap: 20px;">
            <!-- 계정 설정 -->
            <div class="glass-card">
                <h3 style="margin-bottom: 20px;"><i class="fas fa-user-cog"></i> 계정 설정</h3>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <button class="btn btn-glass" style="justify-content: space-between; width: 100%; text-align: left;" onclick="openChangeEmailModal()">
                        <span><i class="fas fa-envelope" style="margin-right: 10px;"></i> 이메일 변경</span>
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    <button class="btn btn-glass" style="justify-content: space-between; width: 100%; text-align: left;" onclick="openChangePasswordModal()">
                        <span><i class="fas fa-key" style="margin-right: 10px;"></i> 비밀번호 변경</span>
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
            
            <!-- 알림 설정 -->
            <div class="glass-card">
                <h3 style="margin-bottom: 20px;"><i class="fas fa-bell"></i> 알림 설정</h3>
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <div>
                            <div style="font-weight: 600;">새 메시지 알림</div>
                            <div style="font-size: 0.85rem; color: var(--text-muted);">상대방이 메시지를 보낼 때 알림</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="notiToggle" onchange="toggleMessageNotification(this.checked)">
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
            </div>

            <!-- 기타 -->
             <div class="glass-card">
                <h3 style="margin-bottom: 20px;"><i class="fas fa-ellipsis-h"></i> 기타</h3>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <button class="btn btn-glass" style="justify-content: space-between; width: 100%; text-align: left;" onclick="window.open('privacy.html', '_blank')">
                        <span><i class="fas fa-file-contract" style="margin-right: 10px;"></i> 개인정보 처리방침</span>
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    <button class="btn" style="justify-content: center; width: 100%; background: rgba(255,0,0,0.1); color: #ff4444; border: 1px solid rgba(255,0,0,0.3);" onclick="openDeleteAccountModal()">
                        <i class="fas fa-user-times" style="margin-right: 10px;"></i> 회원 탈퇴
                    </button>
                </div>
            </div>
        </div>
        <style>
            .switch { position: relative; display: inline-block; width: 50px; height: 26px; }
            .switch input { opacity: 0; width: 0; height: 0; }
            .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(255,255,255,0.1); transition: .4s; border-radius: 34px; }
            .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
            input:checked + .slider { background-color: var(--secondary); }
            input:checked + .slider:before { transform: translateX(24px); }
        </style>
    `;
};

window.getHelpPageHTML = function () {
    return `
       <div class="top-bar"><h2>도움말</h2></div>
       <div style="max-width: 900px; margin: 20px auto; display: flex; flex-direction: column; gap: 20px;">
           <div class="glass-card">
               <h3 style="margin-bottom: 20px;">자주 묻는 질문 (FAQ)</h3>
               
               <style>
                 details.faq-item {
                     background: rgba(255, 255, 255, 0.03);
                     border: 1px solid rgba(255, 255, 255, 0.1);
                     border-radius: 10px;
                     margin-bottom: 15px;
                     overflow: hidden;
                     transition: all 0.3s ease;
                 }
                 details.faq-item[open] {
                     background: rgba(255, 255, 255, 0.08);
                     border-color: rgba(59, 130, 246, 0.5); /* blue glow */
                 }
                 summary.faq-summary {
                     padding: 18px 20px;
                     cursor: pointer;
                     font-weight: 600;
                     font-size: 1.05rem;
                     color: #fff;
                     list-style: none;
                     display: flex;
                     justify-content: space-between;
                     align-items: center;
                 }
                 summary.faq-summary::-webkit-details-marker {
                     display: none;
                 }
                 summary.faq-summary i {
                     color: #3b82f6; /* primary color */
                     transition: transform 0.3s ease;
                 }
                 details.faq-item[open] summary.faq-summary i {
                     transform: rotate(180deg);
                 }
                 .faq-content {
                     padding: 0 20px 20px 20px;
                     color: #d1d5db;
                     line-height: 1.7;
                     font-size: 0.95rem;
                     border-top: 1px solid rgba(255, 255, 255, 0.05);
                     margin-top: 5px;
                     padding-top: 15px;
                 }
                 .faq-q-mark {
                     color: #3b82f6;
                     margin-right: 8px;
                     font-weight: bold;
                     font-size: 1.1rem;
                 }
                 .faq-a-mark {
                     color: #10b981; /* emerald indicating answer */
                     margin-right: 8px;
                     font-weight: bold;
                     font-size: 1.1rem;
                 }
                 .faq-highlight {
                     color: #fff;
                     font-weight: bold;
                     background: rgba(255,255,255,0.1);
                     padding: 2px 6px;
                     border-radius: 4px;
                 }
               </style>

               <details class="faq-item">
                   <summary class="faq-summary">
                       <span><span class="faq-q-mark">Q.</span> "블라인드 합의"란 무엇인가요? 내 제시액이 상대방에게 공개되나요?</span>
                       <i class="fas fa-chevron-down"></i>
                   </summary>
                   <div class="faq-content">
                       <span class="faq-a-mark">A.</span> 블라인드 합의는 양측이 원하는 합의금을 서로 모르는 상태에서 비밀리에 시스템에 입력하는 방식입니다. <span class="faq-highlight">입력하신 금액은 절대 상대방에게 노출되지 않습니다.</span> 양측이 입력한 금액이 서로 교차(가해자 제시액 ≥ 피해자 요구액)할 때만 합의가 성사되며, 성사 시에만 알림이 전송되므로 심리전 없이 안전하게 속마음을 타진해볼 수 있습니다.
                   </div>
               </details>

               <details class="faq-item">
                   <summary class="faq-summary">
                       <span><span class="faq-q-mark">Q.</span> 합의가 성사되면 바로 법적인 효력이 발생하나요?</span>
                       <i class="fas fa-chevron-down"></i>
                   </summary>
                   <div class="faq-content">
                       <span class="faq-a-mark">A.</span> 시스템상 합의가 매칭되는 것은 '금액에 대한 양측의 합의 의사'가 일치했음을 의미할 뿐, 완벽한 의미의 법적 효력(처벌불원, 민형사상 청구 포기 등)을 시스템이 직접 보장하지는 않습니다. 따라서 가장 안전하고 확실한 법적 마무리를 위해서는 매칭 결과에 만족하셨더라도 <span class="faq-highlight">변호사 등 법률 전문가와 별도로 상담하여 합의서의 효력과 이후 절차를 꼼꼼히 확인</span>받고 진행하시는 것을 권장합니다.
                   </div>
               </details>

               <details class="faq-item">
                   <summary class="faq-summary">
                       <span><span class="faq-q-mark">Q.</span> 사이트 이용 중 오류나 문제가 발생하면 어떻게 하나요?</span>
                       <i class="fas fa-chevron-down"></i>
                   </summary>
                   <div class="faq-content">
                       <span class="faq-a-mark">A.</span> 세이프합의는 소모적인 감정싸움 없이 형사합의의 성공 가능성을 높이고자 개발되었으며, 현재 모든 기능을 <span class="faq-highlight">무료로 제공</span>하고 있습니다. 무료로 운영 및 관리되는 플랫폼 특성상 이용 중 불가피하게 시스템 오류나 일시적인 문제가 발생할 수 있음을 양해 부탁드립니다. 문제 발생 시 언제든지 <span class="faq-highlight">관리자 이메일(dulee2094@naver.com)</span>로 상황을 알려주시면 신속하게 확인하여 조치하겠습니다.
                   </div>
               </details>
           </div>
       </div>
   `;
};

window.getGuidePageHTML = function () {
    // 1. Logic & Data Definition (Refactored: Moved outside of return string for safety)
    const QUOTES_DB = {
        offender: [
            { text: "잘못을 인정하는 것은 수치가 아니다. 어제보다 오늘 더 현명해졌다는 증거다.", author: "알렉산더 포프", icon: "fa-feather-alt" },
            { text: "진정한 뉘우침은 과거의 행동을 후회하는 것뿐만 아니라, 미래의 행동을 변화시키는 것이다.", author: "스피노자", icon: "fa-road" },
            { text: "허물이 있다면 고치기를 꺼리지 말라. (과즉물탄개)", author: "공자", icon: "fa-scroll" },
            { text: "자신의 잘못을 인정하는 것은 결백한 사람만이 할 수 있는 용기다.", author: "세네카", icon: "fa-balance-scale" },
            { text: "자기 잘못을 시인하면 오히려 존경받는다. 싸움은 끝내고 신뢰는 시작된다.", author: "데일 카네기", icon: "fa-handshake" },
            { text: "가장 위대한 승리는 자기 자신을 이기는 것이다.", author: "톨스토이", icon: "fa-trophy" },
            { text: "실수를 저지르는 것은 인간이다. 하지만 실수를 고치지 않는 것은 어리석음이다.", author: "소포클레스", icon: "fa-landmark" },
            { text: "잘못을 뉘우치는 마음이 곧 도(道)에 들어가는 첫걸음이다.", author: "채근담", icon: "fa-leaf" },
            { text: "부끄러움을 아는 마음이 의로움의 시작이다 (수오지심).", author: "맹자", icon: "fa-spa" },
            { text: "변명을 잘하는 사람은 그 외에 잘하는 것이 거의 없다.", author: "벤자민 프랭클린", icon: "fa-clock" }
        ],
        victim: [
            { text: "용서는 과거를 바꿀 수 없지만, 미래를 확장시킨다.", author: "폴 보시", icon: "fa-cloud-sun" },
            { text: "분노를 품고 있는 것은 독을 마시고 남이 죽기를 바라는 것과 같다.", author: "부처", icon: "fa-fire-alt" },
            { text: "약한 자는 절대 용서할 수 없다. 용서는 강한 자의 속성이다.", author: "마하트마 간디", icon: "fa-fist-raised" },
            { text: "미움은 미움으로 갚아서는 결코 사라지지 않는다. 오직 자비로만 사라진다.", author: "법구경", icon: "fa-hands-holding-circle" },
            { text: "용기 있는 사람들은 평화를 위해 용서하는 것을 두려워하지 않는다.", author: "넬슨 만델라", icon: "fa-dove" },
            { text: "어둠으로 어둠을 몰아낼 수 없다. 오직 빛만이 할 수 있다.", author: "마틴 루터 킹", icon: "fa-lightbulb" },
            { text: "바꿀 수 없는 것을 받아들이는 평온함을 주소서.", author: "라인홀드 니부어", icon: "fa-water" },
            { text: "흐르는 물은 썩지 않나니, 마음의 앙금을 흘려보내라.", author: "장자", icon: "fa-stream" },
            { text: "용서란 내가 겪은 고통이 헛되지 않게 하는 것이다.", author: "CS 루이스", icon: "fa-book-open" },
            { text: "진정한 용서는 과거가 다르기를 바라는 희망을 포기하는 것이다.", author: "오프라 윈프리", icon: "fa-sun" }
        ]
    };

    const randomOffender = QUOTES_DB.offender[Math.floor(Math.random() * QUOTES_DB.offender.length)];
    const randomVictim = QUOTES_DB.victim[Math.floor(Math.random() * QUOTES_DB.victim.length)];

    // Fixed Theme Colors
    const themeOffender = {
        gradient: "linear-gradient(135deg, #14532d, #052e16)", // Deep Forest Green
        accent: "#ecc94b" // Gold
    };
    const themeVictim = {
        gradient: "linear-gradient(135deg, #0f766e, #115e59)", // Deep Ocean Teal
        accent: "#99f6e4" // Mint
    };

    // 2. Return HTML String
    return `
            <div class="top-bar">
                <div>
                    <h2 style="margin-bottom: 5px;">해피 합의 가이드</h2>
                    <p style="color: var(--text-muted);">안전하고 유쾌한 협상을 위한 팁을 확인하세요.</p>
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 30px;">
                <!-- 1. Intro & Meaning -->
                <div class="glass-card" style="padding: 30px;">
                    <h3 style="margin-bottom: 20px; font-size: 1.3rem; border-left: 4px solid var(--primary); padding-left: 15px;">
                        형사 합의란 무엇인가요?
                    </h3>
                    <p style="line-height: 1.8; color: #cbd5e1; margin-bottom: 0;">
                        형사 합의는 단순한 금전적 보상을 넘어, 가해자가 자신의 잘못을 진심으로 뉘우치고 
                        <span style="color: #60a5fa; font-weight: bold;">피해 회복을 위해 노력했음</span>을 증명하는 공식적인 법적 절차입니다.<br>
                        이는 수사기관과 법원에 제출되는 가장 중요한 양형 자료 중 하나로, 사건의 원만한 해결을 위한 첫걸음입니다.
                    </p>
                </div>

                <div class="glass-card" style="padding: 30px;">
                    <h3 style="margin-bottom: 25px; text-align: center;">왜 블라인드 협상이 필요할까요?</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                        <!-- Party A Side -->
                        <div style="background: rgba(255, 255, 255, 0.03); padding: 25px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                            <div style="display: flex; align-items: center; margin-bottom: 15px; color: #fbbf24;">
                                <i class="fas fa-user-tie" style="font-size: 1.2rem; margin-right: 10px;"></i>
                                <h4 style="margin: 0;">제안자 입장</h4>
                            </div>
                            <ul style="padding-left: 20px; color: #94a3b8; font-size: 0.95rem; line-height: 1.8;">
                                <li style="margin-bottom: 10px;">🤐 <strong>눈치 보지 않고 제안</strong><br>내가 원하는 금액을 솔직하게 제시할 수 있습니다.</li>
                                <li style="margin-bottom: 10px;">🤝 <strong>감정 소모 제로</strong><br>서로 얼굴 붉힐 일 없이 시스템이 알아서 조율해줍니다.</li>
                            </ul>
                        </div>

                        <!-- Party B Side -->
                        <div style="background: rgba(255, 255, 255, 0.03); padding: 25px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                            <div style="display: flex; align-items: center; margin-bottom: 15px; color: #34d399;">
                                <i class="fas fa-user-shield" style="font-size: 1.2rem; margin-right: 10px;"></i>
                                <h4 style="margin: 0;">참여자 입장</h4>
                            </div>
                            <ul style="padding-left: 20px; color: #94a3b8; font-size: 0.95rem; line-height: 1.8;">
                                <li style="margin-bottom: 10px;">🛡️ <strong>자존심 지키기</strong><br>내 마지노선을 먼저 들키지 않고 협상할 수 있습니다.</li>
                                <li style="margin-bottom: 10px;">🎯 <strong>객관적 결과</strong><br>시스템이 제안하는 합리적인 중간점을 확인할 수 있습니다.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- 3. Inspirational Quotes (Dynamic Cards) -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 10px;">
                    <!-- Offender Quote Card -->
                     <div class="glass-card" style="position: relative; overflow: hidden; padding: 30px; border: none; background: ${themeOffender.gradient}; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                        <i class="fas ${randomOffender.icon}" style="position: absolute; top: -10px; right: -10px; font-size: 10rem; opacity: 0.1; color: white;"></i>
                        <div style="position: relative; z-index: 1;">
                            <div style="font-size: 0.8rem; color: ${themeOffender.accent}; margin-bottom: 15px; font-weight: bold; letter-spacing: 1px;">
                                성찰의 지혜
                            </div>
                            <p style="font-size: 1.1rem; line-height: 1.6; color: white; margin-bottom: 20px; font-family: 'Gowun Dodum', sans-serif;">
                                "${randomOffender.text}"
                            </p>
                            <div style="font-size: 0.9rem; color: rgba(255,255,255,0.7); text-align: right;">
                                - ${randomOffender.author}
                            </div>
                        </div>
                    </div>

                    <!-- Victim Quote Card -->
                     <div class="glass-card" style="position: relative; overflow: hidden; padding: 30px; border: none; background: ${themeVictim.gradient}; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                        <i class="fas ${randomVictim.icon}" style="position: absolute; top: -10px; right: -10px; font-size: 10rem; opacity: 0.1; color: white;"></i>
                        <div style="position: relative; z-index: 1;">
                            <div style="font-size: 0.8rem; color: ${themeVictim.accent}; margin-bottom: 15px; font-weight: bold; letter-spacing: 1px;">
                                치유의 지혜
                            </div>
                            <p style="font-size: 1.1rem; line-height: 1.6; color: white; margin-bottom: 20px; font-family: 'Gowun Dodum', sans-serif;">
                                "${randomVictim.text}"
                            </p>
                            <div style="font-size: 0.9rem; color: rgba(255,255,255,0.7); text-align: right;">
                                - ${randomVictim.author}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 4. How to Use (Steps) -->
                <div class="glass-card">
                    <h3 style="margin-bottom: 25px;">이용 방법 안내</h3>
                    <div style="display: flex; justify-content: space-between; position: relative;">
                        <div style="position: absolute; top: 25px; left: 50px; right: 50px; height: 2px; background: rgba(255,255,255,0.1); z-index: 0;"></div>
                        <div style="text-align: center; position: relative; z-index: 1; flex: 1;">
                            <div style="width: 50px; height: 50px; background: var(--bg-card); border: 2px solid var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; font-weight: bold;">1</div>
                            <h4 style="font-size: 0.95rem; margin-bottom: 5px;">사건 등록</h4>
                            <p style="font-size: 0.8rem; color: var(--text-muted);">본인의 사건 정보를<br>입력하세요.</p>
                        </div>
                         <!-- Step 2 -->
                        <div style="text-align: center; position: relative; z-index: 1; flex: 1;">
                            <div style="width: 50px; height: 50px; background: var(--bg-card); border: 2px solid var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; font-weight: bold;">2</div>
                            <h4 style="font-size: 0.95rem; margin-bottom: 5px;">합의 요청</h4>
                            <p style="font-size: 0.8rem; color: var(--text-muted);">안심 번호로 상대방에게<br>알림 메시지를 발송합니다.</p>
                        </div>
                         <!-- Step 3 -->
                        <div style="text-align: center; position: relative; z-index: 1; flex: 1;">
                            <div style="width: 50px; height: 50px; background: var(--bg-card); border: 2px solid var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; font-weight: bold;">3</div>
                            <h4 style="font-size: 0.95rem; margin-bottom: 5px;">블라인드 조율</h4>
                            <p style="font-size: 0.8rem; color: var(--text-muted);">희망 금액을 입력하고<br>격차를 좁혀갑니다.</p>
                        </div>
                         <!-- Step 4 -->
                        <div style="text-align: center; position: relative; z-index: 1; flex: 1;">
                            <div style="width: 50px; height: 50px; background: var(--bg-card); border: 2px solid var(--secondary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; font-weight: bold; color: var(--secondary);">4</div>
                            <h4 style="font-size: 0.95rem; margin-bottom: 5px;">합의서 날인</h4>
                            <p style="font-size: 0.8rem; color: var(--text-muted);">합의가 성사되면<br>즉시 문서를 생성합니다.</p>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 40px;">
                        <button class="btn btn-primary" onclick="location.href='dashboard.html?page=cases'">내 사건 등록하러 가기</button>
                    </div>
                </div>

            </div>
    `;
};
