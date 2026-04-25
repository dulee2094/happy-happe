// utils.js
// Shared utility functions for case_detail module.
// Exposed on window for global access.

function getRoleText(role) {
    return role === 'offender' ? '피의자 (가해자)' : '피해자';
}

function getStatusText(status) {
    switch (status) {
        case 'connected': return '연결 완료';
        case 'pending': return '수락 대기';
        case 'invited': return '가입 대기';
        case 'negotiating': return '협의 중';
        case 'completed': return '합의 완료';
        default: return '대기 중';
    }
}

function getIconClass(condition) {
    return condition ? 'fas fa-check-circle' : 'far fa-circle';
}

function getColor(condition) {
    return condition ? 'var(--secondary)' : 'var(--text-muted)';
}

function getOpacity(condition) {
    return condition ? '1' : '0.5';
}

// Expose functions globally
window.getRoleText = getRoleText;
window.getStatusText = getStatusText;
window.getIconClass = getIconClass;
window.getColor = getColor;
window.getOpacity = getOpacity;
