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
    
    // Fallback to 'status' if 'connectionStatus' is missing (due to Room refactor)
    const connStatus = caseItem.connectionStatus || caseItem.status || 'pending';
    
    card.style.borderLeft = '4px solid ' + getStatusColor(connStatus);

    card.onclick = () => {
        window.openCaseDetail(
            caseItem.id || caseItem.caseId,
            caseItem.roomCode || caseItem.caseNumber,
            caseItem.myRole,
            connStatus,
            caseItem.counterpartyName,
            caseItem.createdAt || caseItem.registrationDate,
            caseItem.topic || caseItem.roomTitle
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

    const statusBadge = getStatusBadge(connStatus);
    const roleIcon = caseItem.myRole === 'partyA' ? 'fa-user-tie' : 'fa-user-shield';
    const roleText = caseItem.myRole === 'partyA' ? '제안자' : '참여자';

    let displayTitle = caseItem.topic || caseItem.roomTitle || caseItem.summary || caseItem.roomCode || caseItem.caseNumber || '제목 없음';
    let subTitle = '';

    if (caseItem.roomCode) {
        subTitle = `<span style="font-size: 0.8rem; color: var(--text-muted); font-weight: normal; margin-left: 8px;">Ref: ${caseItem.roomCode}</span>`;
    }

    if (displayTitle && displayTitle.length > 25) {
        displayTitle = displayTitle.substring(0, 25) + '...';
    }

    const regDate = caseItem.createdAt ? new Date(caseItem.createdAt).toLocaleDateString() : (caseItem.registrationDate || '2024.01.01');

    let inviteButtonHtml = '';
    if (!caseItem.counterpartyName || connStatus === 'pending') {
        const inviteTopic = displayTitle.replace(/<[^>]*>?/gm, '').trim(); // Remove any HTML tags from topic
        const inviteUrl = `invite.html?roomCode=${encodeURIComponent(caseItem.roomCode || '')}&topic=${encodeURIComponent(inviteTopic)}`;
        inviteButtonHtml = `
            <div style="margin-top: 10px; display: flex; justify-content: flex-end;">
                <button class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem; background: rgba(74, 158, 255, 0.2); color: #4A9EFF; border: 1px solid rgba(74, 158, 255, 0.5);" onclick="event.stopPropagation(); location.href='${inviteUrl}'">
                    <i class="fas fa-paper-plane" style="margin-right: 5px;"></i> 상대방 초대하기
                </button>
            </div>
        `;
    }

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
                <i class="fas fa-user-friends" style="font-size: 1.2rem; color: ${getStatusColor(connStatus)};"></i>
            </div>
            <div style="flex: 1;">
                <div style="font-size: 0.8rem; color: var(--text-muted);">협상 상대방</div>
                <div style="font-weight: 600; font-size: 1rem;">${caseItem.counterpartyName || '대기 중'}</div>
            </div>
            <div style="text-align: right; margin-right: 15px;">
                    <div style="font-size: 0.8rem; color: var(--text-muted);">등록일</div>
                    <div style="font-size: 0.9rem;">${regDate}</div>
            </div>
            <i class="fas fa-chevron-right" style="color: var(--text-muted); font-size: 1.2rem;"></i>
        </div>
        ${inviteButtonHtml}
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
                       <span class="faq-a-mark">A.</span> 블라인드 합의는 양측이 원하는 목표 금액을 서로 모르는 상태에서 비밀리에 시스템에 입력하는 방식입니다. <span class="faq-highlight">입력하신 금액은 절대 상대방에게 노출되지 않습니다.</span> 양측이 입력한 금액이 서로 교차(지급자 제시액 ≥ 수령자 요구액)할 때만 합의가 성사되며, 성사 시에만 알림이 전송되므로 심리전 없이 안전하게 속마음을 타진해볼 수 있습니다.
                   </div>
               </details>

               <details class="faq-item">
                   <summary class="faq-summary">
                       <span><span class="faq-q-mark">Q.</span> 합의가 성사되면 바로 법적인 효력이 발생하나요?</span>
                       <i class="fas fa-chevron-down"></i>
                   </summary>
                   <div class="faq-content">
                       <span class="faq-a-mark">A.</span> 시스템상 조율이 매칭되는 것은 '금액에 대한 양측의 조율 의사'가 일치했음을 의미할 뿐, 완벽한 의미의 법적 효력을 시스템이 직접 보장하지는 않습니다. 따라서 가장 안전하고 확실한 법적 마무리를 위해서는 매칭 결과에 만족하셨더라도 <span class="faq-highlight">전문가와 별도로 상담하여 조율 확인서의 효력과 이후 절차를 꼼꼼히 확인</span>받고 진행하시는 것을 권장합니다.
                   </div>
               </details>

               <details class="faq-item">
                   <summary class="faq-summary">
                       <span><span class="faq-q-mark">Q.</span> 사이트 이용 중 오류나 문제가 발생하면 어떻게 하나요?</span>
                       <i class="fas fa-chevron-down"></i>
                   </summary>
                   <div class="faq-content">
                       <span class="faq-a-mark">A.</span> 해피합의는 소모적인 감정싸움 없이 원만한 조율의 성공 가능성을 높이고자 개발되었으며, 현재 모든 기능을 <span class="faq-highlight">무료로 제공</span>하고 있습니다. 무료로 운영 및 관리되는 플랫폼 특성상 이용 중 불가피하게 시스템 오류나 일시적인 문제가 발생할 수 있음을 양해 부탁드립니다. 문제 발생 시 언제든지 <span class="faq-highlight">관리자 이메일(dulee2094@naver.com)</span>로 상황을 알려주시면 신속하게 확인하여 조치하겠습니다.
                   </div>
               </details>
           </div>
       </div>
   `;
};

window.getGuidePageHTML = function () {
    const QUOTES_DB = {
        offender: [
            { text: "타협은 훌륭한 우산이지만, 형편없는 지붕이다.", author: "로웰", icon: "fa-umbrella" },
            { text: "협상에서 가장 중요한 것은 상대방이 말하지 않은 것을 듣는 것이다.", author: "피터 드러커", icon: "fa-ear-listen" },
            { text: "당신이 동의하지 않는 사람의 입장에 서보는 것이 지혜의 시작이다.", author: "찰스 다윈", icon: "fa-shoe-prints" },
            { text: "서로 양보하지 않으면 교착 상태에 빠지지만, 조금씩 양보하면 새로운 길이 열린다.", author: "작자 미상", icon: "fa-door-open" }
        ],
        victim: [
            { text: "성공적인 협상은 양측 모두 약간의 아쉬움을 남긴 채 일어나는 법이다.", author: "에드먼드 버크", icon: "fa-handshake" },
            { text: "이기려는 마음보다 해결하려는 마음이 더 큰 결과를 만든다.", author: "무명", icon: "fa-lightbulb" },
            { text: "요구하기 전에 먼저 상대방의 필요를 이해하라.", author: "협상 격언", icon: "fa-compass" },
            { text: "훌륭한 조율은 서로의 차이를 인정하는 것에서 출발한다.", author: "무명", icon: "fa-bridge" }
        ]
    };

    const randomOffender = QUOTES_DB.offender[Math.floor(Math.random() * QUOTES_DB.offender.length)];
    const randomVictim = QUOTES_DB.victim[Math.floor(Math.random() * QUOTES_DB.victim.length)];

    const themeOffender = {
        gradient: "linear-gradient(135deg, #4f46e5, #3730a3)", // Indigo
        accent: "#c7d2fe" 
    };
    const themeVictim = {
        gradient: "linear-gradient(135deg, #059669, #047857)", // Emerald
        accent: "#a7f3d0" 
    };

    return `
            <div class="top-bar">
                <div>
                    <h2 style="margin-bottom: 5px;">해피 합의 가이드</h2>
                    <p style="color: var(--text-muted);">안전하고 유쾌한 협상을 위한 팁을 확인하세요.</p>
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 30px;">
                <div class="glass-card" style="padding: 30px;">
                    <h3 style="margin-bottom: 20px; font-size: 1.3rem; border-left: 4px solid var(--primary); padding-left: 15px;">
                        블라인드 조율이란 무엇인가요?
                    </h3>
                    <p style="line-height: 1.8; color: #cbd5e1; margin-bottom: 0;">
                        블라인드 조율은 단순한 금액 흥정을 넘어, 양측이 불필요한 감정 소모 없이 원하는 목표를 달성할 수 있도록 돕는 시스템입니다.<br>
                        직접 대면하거나 껄끄러운 대화를 피하고, 
                        <span style="color: #60a5fa; font-weight: bold;">시스템이 제안하는 객관적인 중간점</span>에서 기분 좋게 합의점을 찾을 수 있습니다.
                    </p>
                </div>

                <div class="glass-card" style="padding: 30px;">
                    <h3 style="margin-bottom: 25px; text-align: center;">왜 블라인드 협상이 필요할까요?</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
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

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 10px;">
                     <div class="glass-card" style="position: relative; overflow: hidden; padding: 30px; border: none; background: ${themeOffender.gradient}; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                        <i class="fas ${randomOffender.icon}" style="position: absolute; top: -10px; right: -10px; font-size: 10rem; opacity: 0.1; color: white;"></i>
                        <div style="position: relative; z-index: 1;">
                            <div style="font-size: 0.8rem; color: ${themeOffender.accent}; margin-bottom: 15px; font-weight: bold; letter-spacing: 1px;">
                                협상의 지혜
                            </div>
                            <p style="font-size: 1.1rem; line-height: 1.6; color: white; margin-bottom: 20px; font-family: 'Gowun Dodum', sans-serif;">
                                "${randomOffender.text}"
                            </p>
                            <div style="font-size: 0.9rem; color: rgba(255,255,255,0.7); text-align: right;">
                                - ${randomOffender.author}
                            </div>
                        </div>
                    </div>

                     <div class="glass-card" style="position: relative; overflow: hidden; padding: 30px; border: none; background: ${themeVictim.gradient}; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                        <i class="fas ${randomVictim.icon}" style="position: absolute; top: -10px; right: -10px; font-size: 10rem; opacity: 0.1; color: white;"></i>
                        <div style="position: relative; z-index: 1;">
                            <div style="font-size: 0.8rem; color: ${themeVictim.accent}; margin-bottom: 15px; font-weight: bold; letter-spacing: 1px;">
                                소통의 지혜
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

                <div class="glass-card">
                    <h3 style="margin-bottom: 25px;">이용 방법 안내</h3>
                    <div style="display: flex; justify-content: space-between; position: relative;">
                        <div style="position: absolute; top: 25px; left: 50px; right: 50px; height: 2px; background: rgba(255,255,255,0.1); z-index: 0;"></div>
                        <div style="text-align: center; position: relative; z-index: 1; flex: 1;">
                            <div style="width: 50px; height: 50px; background: var(--bg-card); border: 2px solid var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; font-weight: bold;">1</div>
                            <h4 style="font-size: 0.95rem; margin-bottom: 5px;">안건 등록</h4>
                            <p style="font-size: 0.8rem; color: var(--text-muted);">조율할 안건 정보를<br>입력하세요.</p>
                        </div>
                        <div style="text-align: center; position: relative; z-index: 1; flex: 1;">
                            <div style="width: 50px; height: 50px; background: var(--bg-card); border: 2px solid var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; font-weight: bold;">2</div>
                            <h4 style="font-size: 0.95rem; margin-bottom: 5px;">조율 요청</h4>
                            <p style="font-size: 0.8rem; color: var(--text-muted);">문자나 카톡으로 상대방에게<br>초대 링크를 발송합니다.</p>
                        </div>
                        <div style="text-align: center; position: relative; z-index: 1; flex: 1;">
                            <div style="width: 50px; height: 50px; background: var(--bg-card); border: 2px solid var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; font-weight: bold;">3</div>
                            <h4 style="font-size: 0.95rem; margin-bottom: 5px;">블라인드 조율</h4>
                            <p style="font-size: 0.8rem; color: var(--text-muted);">희망 금액을 입력하고<br>격차를 좁혀갑니다.</p>
                        </div>
                        <div style="text-align: center; position: relative; z-index: 1; flex: 1;">
                            <div style="width: 50px; height: 50px; background: var(--bg-card); border: 2px solid var(--secondary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; font-weight: bold; color: var(--secondary);">4</div>
                            <h4 style="font-size: 0.95rem; margin-bottom: 5px;">조율 확인서 날인</h4>
                            <p style="font-size: 0.8rem; color: var(--text-muted);">조율이 성사되면<br>즉시 문서를 생성합니다.</p>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 40px;">
                        <button class="btn btn-primary" onclick="location.href='dashboard.html?page=cases'">내 협상방 만들기</button>
                    </div>
                </div>

            </div>
    `;
};
