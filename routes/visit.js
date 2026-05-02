const express = require('express');
const router = express.Router();
const { PageVisit } = require('../models');
const { Op } = require('sequelize');

// Endpoint 1: Record a visit
router.post('/visit', async (req, res) => {
    try {
        const { sessionToken, pageUrl } = req.body;
        const userAgent = req.headers['user-agent'] || '';

        // Anti-spam/refresh: Only record once per session Token per day, or just record every unique session Token.
        // For simplicity, we just record every request, or check if this token already visited today.
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (sessionToken) {
            const existingVisit = await PageVisit.findOne({
                where: {
                    sessionToken,
                    visitedAt: {
                        [Op.gte]: today
                    }
                }
            });
            if (existingVisit) {
                return res.json({ success: true, message: 'Already recorded today for this session.' });
            }
        }

        await PageVisit.create({
            sessionToken: sessionToken || 'unknown',
            pageUrl: pageUrl || '/',
            userAgent
        });

        res.json({ success: true });
    } catch (e) {
        console.error('Visit record error:', e);
        res.status(500).json({ success: false });
    }
});

module.exports = router;
