const express = require('express');
const router = express.Router();
const ProposalController = require('../controllers/proposalController');

// ============================================
// 📨 Proposal System Routes
// Base Path: /api/case/proposal (Defined in server.js)
// ============================================

// 1. Get Status (Main Load)
router.get('/', ProposalController.getStatus);

// 2. Submit Proposal
router.post('/', ProposalController.submitProposal);

// 3. View Analysis Result
router.post('/view-result', ProposalController.viewAnalysisResult);

// 4. Case Extension Request
router.post('/extend', ProposalController.extendRequest);

// 5. Expire Sync (Timeout Handling)
router.post('/expire-sync', ProposalController.expireSync);

// ============================================
// ⚖️ Midpoint Agreement System
// ============================================

// 6. Get Midpoint Status
router.get('/midpoint-status', ProposalController.getMidpointStatus);

// 7. Step 1: Procedure Agreement
router.post('/midpoint-procedure-agree', ProposalController.midpointProcedureAgree);

// 8. Step 2: Final Agreement
router.post('/midpoint-final-agree', ProposalController.midpointFinalAgree);

// 9. Next Round Intent (Wait Sync)
router.post('/next-round-intent', ProposalController.nextRoundIntent);


module.exports = router;
