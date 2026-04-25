
// case_detail_chat.js
// Handles Chat Service Logic

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
                </div>

                <div class="message-input-area" style="padding: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <div style="display: flex; gap: 10px;">
                        <input type="text" id="chatInput" style="flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; outline: none; padding: 12px; border-radius: 8px;" placeholder="메시지를 입력하세요.." onkeypress="handleChatEnter(event)">
                        <button class="btn btn-primary" onclick="window.sendChatMessage()">
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
    return '';
};

window.initializeChat = function () {
    if (window.chatInterval) clearInterval(window.chatInterval);

    const caseId = localStorage.getItem('current_case_id');
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    const myId = userInfo.id || 0;

    window.loadChatMessages(caseId, myId);
    window.chatInterval = setInterval(() => window.loadChatMessages(caseId, myId), 3000);
};

window.sendChatMessage = async function () {
    const input = document.getElementById('chatInput');
    if (!input) return;
    const message = input.value.trim();
    if (!message) return;

    const caseId = localStorage.getItem('current_case_id');
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    const myId = userInfo.id || 0;

    try {
        await fetch('/api/case/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ caseId, senderId: myId, content: message })
        });

        input.value = '';
        window.loadChatMessages(caseId, myId);
    } catch (e) { console.error(e); }
};

window.loadChatMessages = async function (caseId, myId) {
    const chatArea = document.getElementById('chatArea');
    if (!chatArea) return;

    try {
        const res = await fetch(`/api/case/chat?caseId=${caseId}`);
        const data = await res.json();

        if (data.success) {
            const currentScroll = chatArea.scrollTop;
            const isNearBottom = chatArea.scrollHeight - chatArea.clientHeight <= chatArea.scrollTop + 100;

            const html = data.messages.map(m => {
                const isMine = (m.senderId == myId);
                return `
                    <div class="message ${isMine ? 'sent' : 'received'}">
                        ${m.text}
                    </div>
                `;
            }).join('');

            if (chatArea.innerHTML !== html) {
                chatArea.innerHTML = html;
                if (isNearBottom) chatArea.scrollTop = chatArea.scrollHeight;
            }
        }
    } catch (e) {
        console.error(e);
    }
};

window.requestChat = function (role) {
    const caseId = localStorage.getItem('current_case_id');
    localStorage.setItem(`chat_status_${caseId}`, `requested_by_${role}`);
    refreshChatView();
};

window.cancelChatRequest = function () {
    const caseId = localStorage.getItem('current_case_id');
    localStorage.setItem(`chat_status_${caseId}`, 'none');
    refreshChatView();
};

window.acceptChat = function () {
    const caseId = localStorage.getItem('current_case_id');
    localStorage.setItem(`chat_status_${caseId}`, 'active');
    refreshChatView();
};

window.declineChat = function () {
    if (confirm('채팅 요청을 거절하시겠습니까?')) {
        const caseId = localStorage.getItem('current_case_id');
        localStorage.setItem(`chat_status_${caseId}`, 'none');
        refreshChatView();
    }
};

window.confirmEndChat = function () {
    if (confirm('정말로 대화를 종료하시겠습니까? 상대방과 연결이 끊어집니다.')) {
        const caseId = localStorage.getItem('current_case_id');
        localStorage.setItem(`chat_status_${caseId}`, 'terminated');
        refreshChatView();
    }
};

window.resetChat = function () {
    const caseId = localStorage.getItem('current_case_id');
    localStorage.setItem(`chat_status_${caseId}`, 'none');
    refreshChatView();
};

window.handleChatEnter = function (e) {
    if (e.key === 'Enter') {
        window.sendChatMessage();
    }
};

function refreshChatView() {
    const activeTab = document.querySelector('.nav-item.active');
    // Assuming loadContent is global or via a custom event, but here we can just reload current tab if it equates to 'chat'
    // Actually, loadContent is in core. We should call that?
    // Since we are refactoring, we can access loadContent from window if we expose it (which we will).
    if (activeTab && activeTab.dataset.menu === 'chat') {
        if (window.loadContent) window.loadContent('chat');
    }
}
