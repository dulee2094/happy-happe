// Notifications Logic
function initializeNotifications() {
    if (window.fetchNotifications) window.fetchNotifications();
}

window.fetchNotifications = async function () {
    const userId = localStorage.getItem('user_id');
    const container = document.getElementById('notificationList');
    if (!container) return;

    try {
        const res = await fetch(`${API_BASE}/notification/${userId}`);
        const data = await res.json();

        if (data.success && data.notifications.length > 0) {
            container.innerHTML = '';
            data.notifications.forEach(noti => {
                const div = document.createElement('div');
                const isReadStyle = noti.isRead ? 'opacity: 0.6; background: rgba(255,255,255,0.03);' : 'background: rgba(100, 100, 255, 0.1); border-left: 3px solid #4A9EFF;';
                const iconInfo = getNotificationIcon(noti.type);

                div.style.cssText = `display: flex; gap: 15px; padding: 15px; border-radius: 8px; transition: 0.2s; ${isReadStyle}`;
                div.innerHTML = `
                        <div style="width: 40px; height: 40px; background: ${iconInfo.bg}; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <i class="fas ${iconInfo.icon}" style="color: ${iconInfo.color};"></i>
                        </div>
                        <div style="flex: 1; cursor: pointer;" onclick="handleNotificationClick(${noti.id}, ${noti.relatedCaseId})">
                            <div style="font-weight: 600; margin-bottom: 5px;">${noti.content}</div>
                            <div style="font-size: 0.85rem; color: var(--text-muted);">${formatTimeAgo(noti.createdAt)}</div>
                        </div>
                        ${!noti.isRead ? `<button class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;" onclick="markNotificationRead(${noti.id}, event)">확인</button>` : ''}
                    `;
                container.appendChild(div);
            });
        } else {
            container.innerHTML = `
                    <div style="text-align: center; padding: 40px;">
                        <i class="far fa-bell-slash" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 15px;"></i>
                        <p style="color: var(--text-muted);">새로운 알림이 없습니다.</p>
                    </div>
                `;
        }
    } catch (e) {
        console.error(e);
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: #ff6b6b">알림을 불러오지 못했습니다.</div>';
    }
};

function getNotificationIcon(type) {
    switch (type) {
        case 'CHAT': return { icon: 'fa-comment', color: '#4A9EFF', bg: 'rgba(74, 158, 255, 0.2)' };
        case 'PROPOSAL': return { icon: 'fa-hand-holding-usd', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.2)' };
        case 'CASE_UPDATE': return { icon: 'fa-folder-open', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.2)' };
        default: return { icon: 'fa-bell', color: '#a8a29e', bg: 'rgba(255,255,255,0.1)' };
    }
}

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return '방금 전';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    return `${Math.floor(diffInSeconds / 86400)}일 전`;
}

window.handleNotificationClick = async function (id, caseId) {
    await window.markNotificationRead(id);
    if (caseId) {
        // Need to fetch basic case info or just setup minimal info to redirect
        // For now, simpler redirect might be tricky without full case info.
        // We'll rely on dashboard to load case list or just direct redirect if we trust caseId.
        // But openCaseDetail needs more args.
        // Let's just try to go to dashboard and open? 
        // Or simpler: just alert for now or implement a 'fetchCaseInfo' 
        // Ideally: fetch case info then openCaseDetail.
        alert("해당 사건으로 이동합니다 (구현 예정)");
        // TODO: Fetch single case info and redirect
    }
};

window.markNotificationRead = async function (id, event) {
    if (event) event.stopPropagation();
    try {
        await fetch(`${API_BASE}/notification/read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationId: id })
        });
        window.fetchNotifications(); // Refresh
        // Update Badge
        const notifBadge = document.getElementById('notifBadge');
        if (notifBadge) {
            // Ideally decrement or re-fetch count
            // For now, let's just re-fetch
        }
    } catch (e) { console.error(e); }
};

window.markAllNotificationsRead = async function () {
    if (!confirm("모든 알림을 읽음 처리하시겠습니까?")) return;
    const userId = localStorage.getItem('user_id');
    try {
        await fetch(`${API_BASE}/notification/read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, all: true })
        });
        window.fetchNotifications();
    } catch (e) { console.error(e); }
};
