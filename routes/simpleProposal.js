const express = require('express');
const router = express.Router();
const { Proposal } = require('../models');

// 5. Blind Proposal (Simple - /api/proposal)
router.post('/', async (req, res) => {
    const { caseId, userId, amount } = req.body;
    try {
        await Proposal.create({ caseId, proposerId: userId, amount });

        // Check gap logic
        const proposals = await Proposal.findAll({ where: { caseId }, limit: 2, order: [['createdAt', 'DESC']] });
        let gapStatus = 'waiting';
        let gapData = {};
        if (proposals.length >= 2) {
            const p1 = proposals[0].amount;
            const p2 = proposals[1].amount;
            const diff = Math.abs(p1 - p2);
            gapStatus = 'analyzed';
            gapData = { diff };
        }
        res.json({ success: true, status: gapStatus, data: gapData });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: e.message });
    }
});

module.exports = router;
