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

// Endpoint 2: Get visitor stats for admin
router.get('/admin/visits', async (req, res) => {
    const { adminKey } = req.query;
    // same key as consultation.js
    if (adminKey !== 'younjin2094') {
        return res.status(403).json({ success: false, error: '관리자 권한이 없습니다.' });
    }

    try {
        // Today
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        // This Week (last 7 days)
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - 7);
        startOfWeek.setHours(0, 0, 0, 0);

        // All Time
        const totalVisits = await PageVisit.count();
        const todayVisits = await PageVisit.count({
            where: { visitedAt: { [Op.gte]: startOfToday } }
        });
        const weeklyVisits = await PageVisit.count({
            where: { visitedAt: { [Op.gte]: startOfWeek } }
        });

        // 7 days daily stats for chart
        const dailyStats = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            
            const nextD = new Date(d);
            nextD.setDate(d.getDate() + 1);

            const count = await PageVisit.count({
                where: {
                    visitedAt: {
                        [Op.gte]: d,
                        [Op.lt]: nextD
                    }
                }
            });
            
            const month = d.getMonth() + 1;
            const day = d.getDate();
            dailyStats.push({ date: `${month}/${day}`, count });
        }

        res.json({
            success: true,
            totalVisits,
            todayVisits,
            weeklyVisits,
            dailyStats
        });
    } catch (e) {
        console.error('Visit stats error:', e);
        res.status(500).json({ success: false, error: e.message });
    }
});

module.exports = router;
