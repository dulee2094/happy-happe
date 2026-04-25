/**
 * ProposalState
 * Determines the current state of the proposal process based on server data.
 * Pure logic module - No UI rendering here.
 */

const PROPOSAL_STATE = {
    LOADING: 'LOADING',

    // Step 0: Expired (Round Ended due to timeout)
    STEP_EXPIRED: 'STEP_EXPIRED',

    // Step 1: Input Required (Both might be idle, or I am idle)
    // Round 1 and Round 2+ are logically same functionality (Input), just different context
    STEP_1_INPUT: 'STEP_1_INPUT',

    // Step 2: Waiting for Opponent (I submitted, They haven't)
    STEP_2_WAITING: 'STEP_2_WAITING',

    // Step 3: Both Submitted, Ready to View Result
    // (Server says 'ready', but I haven't viewed result yet)
    STEP_3_READY_TO_VIEW: 'STEP_3_READY_TO_VIEW',

    // Step 4: Result Viewed (Gauge Chart shown)
    STEP_4_RESULT_VIEW: 'STEP_4_RESULT_VIEW',

    // Step 5-A: Midpoint Agreement (Gap <= 10%)
    STEP_5A_MIDPOINT: 'STEP_5A_MIDPOINT',

    // Step 5-B: Next Round Decision (Gap > 10%)
    // Can be: Waiting for next round, or Ready for next round
    STEP_5B_NEXT_ROUND_WAITING: 'STEP_5B_NEXT_ROUND_WAITING', // I clicked, opponent hasn't
    STEP_5B_NEXT_ROUND_READY: 'STEP_5B_NEXT_ROUND_READY', // Both clicked -> logic usually resets to Step 1 of next round immediately, but this is for the transition moment

    // Extension (Special State)
    EXTENSION_REQUESTED: 'EXTENSION_REQUESTED',
    EXTENSION_AGREED: 'EXTENSION_AGREED'
};

window.ProposalState = {
    // Expose constants
    CONST: PROPOSAL_STATE,

    /**
     * Analyzes data and returns the correct state constant
     * @param {Object} data - Server response data
     * @param {Object} localState - Local tracking variables { currentRound, myRound, etc }
     */
    determineState(data, localState) {
        if (!data) return PROPOSAL_STATE.LOADING;

        // 0. Expiration Check (Priority Interrupt)
        if (data.isExpired) {
            return PROPOSAL_STATE.STEP_EXPIRED;
        }

        // 0. Extension Check (Highest Priority Interrupt)
        // If extension is requested but not fully agreed/rejected yet
        if (data.isExtended && (!data.iAgreed || !data.oppAgreed)) {
            // Actually 'isExtended' from server usually means FULLY extended.
            // We need to check if there is a PENDING request. 
            // Based on original code: 'extensionNotification' logic
            // ... Logic for pending extension would go here if server provided it explicitly.
            // For now, let's follow the standard flow and handle extension in UI as notification.
        }

        const currentRound = data.currentRound || 1;
        const myRound = data.myRound || 0;

        // 1. Input Phase (Highest Priority for New Round)
        // If my round is lagging behind Current Round (e.g., My: 1, Current: 2)
        // This means a new round has started and I haven't submitted yet.
        if (myRound < currentRound) {
            return PROPOSAL_STATE.STEP_1_INPUT;
        }

        // 2. Result View State (Most stable state)
        // If I have viewed the result of the CURRENT round
        // AND both have proposed in this round (implied by result availability)
        // BUT: If a new round has started (currentRound > myRound), we enter Step 1.
        // So we must check: Is the result I viewed for the CURRENT round?

        // Logic fix: Server `currentRound` increments only when both agree to next round.
        // So if `data.myResultViewed` is true, it means I saw the result of `currentRound`.

        // Exception: Midpoint Agreement Phase
        // If gap <= 10%, we are in Midpoint phase regardless of view status (force view usually)
        if (data.midpointStatus && data.midpointStatus.isMidpointActive) {
            return PROPOSAL_STATE.STEP_5A_MIDPOINT;
        }

        // 2. Next Round Intent Check (Step 5-B Transition)
        // If I have signaled intent for next round, but round hasn't incremented yet
        if (data.myNextRoundIntent && !data.nextRoundStarted) {
            return PROPOSAL_STATE.STEP_5B_NEXT_ROUND_WAITING;
        }

        // 3. View Result Phase (Step 4)
        if (data.myResultViewed && data.oppResultViewed) {
            return PROPOSAL_STATE.STEP_4_RESULT_VIEW; // This includes Step 5-B dashboard
        }

        // 4. Ready to View Phase (Step 3)
        // Both submitted, but I haven't clicked "View Result" yet
        if (data.roundStatus === 'ready' && !data.myResultViewed) {
            return PROPOSAL_STATE.STEP_3_READY_TO_VIEW;
        }

        // 5. Waiting Phase (Step 2)
        // I submitted for CURRENT round, Opponent hasn't.
        if (myRound === currentRound) {
            // wait, if roundStatus is 'ready', it's Step 3.
            // So this runs if roundStatus != 'ready' (meaning opponent hasn't submitted)
            return PROPOSAL_STATE.STEP_2_WAITING;
        }

        // 6. Input Phase (Step 1)
        // Redundant check removed (handled at top)
        if (myRound < currentRound) {
            return PROPOSAL_STATE.STEP_1_INPUT;
        }

        // Fallback
        return PROPOSAL_STATE.STEP_1_INPUT;
    }
};
