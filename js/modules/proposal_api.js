/**
 * ProposalAPI — Happy HappE
 * Handling all server communications for blind proposal
 */
window.ProposalAPI = {
    // Check Proposal Status (Polling)
    async checkStatus(roomId, userId) {
        if (!roomId || !userId) throw new Error('Missing credentials');
        const res = await fetch(`/api/proposal?roomId=${roomId}&userId=${userId}`);
        return res.json();
    },

    // Submit a new proposal
    async submitProposal(payload) {
        const res = await fetch('/api/proposal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return res.json();
    },

    // View Analysis Result (2-Step Verification)
    async viewAnalysisResult(userId, roomId, round) {
        const res = await fetch('/api/proposal/view-result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, roomId, round })
        });
        return res.json();
    },

    // Agree/Reject Midpoint (Step 1 or 2)
    async decideMidpoint(userId, roomId, isAgreed, phase = 1) {
        const endpoint = phase === 2
            ? '/api/proposal/midpoint-final-agree'
            : '/api/proposal/midpoint-procedure-agree';
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, roomId, agreed: isAgreed })
        });
        return res.json();
    },

    // Request Extension
    async requestExtension(roomId, userId) {
        const res = await fetch('/api/proposal/extend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId, userId })
        });
        return res.json();
    },

    // Skip/Sync Expiration Round
    async syncExpiration(userId, roomId, round) {
        const res = await fetch('/api/proposal/expire-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, roomId, round })
        });
        return res.json();
    },

    // Request to proceed to next round (Intent)
    async requestNextRound(userId, roomId, currentRound) {
        const res = await fetch('/api/proposal/next-round-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, roomId, round: currentRound })
        });
        return res.json();
    }
};
