const express = require('express');
const router = express.Router();
const { User, Room, PageVisit } = require('../models');
const { Op } = require('sequelize');

// Middleware to check adminKey
const checkAdmin = (req, res, next) => {
    const { adminKey } = req.query;
    if (adminKey !== 'younjin2094') {
        return res.status(403).json({ success: false, error: '관리자 권한이 없습니다.' });
    }
    next();
};

router.use(checkAdmin);

// 1. Get Consultations (mapped to Rooms for now)
router.get('/consultations', async (req, res) => {
    try {
        const rooms = await Room.findAll({
            order: [['createdAt', 'DESC']]
        });
        
        // Map to the format expected by admin.html
        const list = await Promise.all(rooms.map(async (r) => {
            let creatorName = '알 수 없음';
            let creatorPhone = '-';
            if (r.creatorId) {
                const user = await User.findByPk(r.creatorId);
                if (user) {
                    creatorName = user.name;
                    creatorPhone = user.phoneNumber || '-';
                }
            }
            return {
                submittedAt: r.createdAt,
                name: creatorName,
                phoneNumber: creatorPhone,
                summary: r.topic || '주제 없음',
                details: `방 코드: ${r.roomCode}`,
                status: r.status === 'pending' ? '대기중' : (r.status === 'negotiating' ? '진행중' : (r.status === 'settled' ? '타결' : '종료'))
            };
        }));

        res.json({ success: true, list });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: e.message });
    }
});

// 2. Get Users
router.get('/users', async (req, res) => {
    try {
        const users = await User.findAll({
            order: [['createdAt', 'DESC']]
        });
        
        const list = users.map(u => ({
            createdAt: u.createdAt,
            name: u.name,
            email: u.email,
            phoneNumber: u.phoneNumber,
            messageNotification: u.messageNotification
        }));

        res.json({ success: true, list });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: e.message });
    }
});

// 3. Get Visits
router.get('/visits', async (req, res) => {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - 7);
        startOfWeek.setHours(0, 0, 0, 0);

        const totalVisits = await PageVisit.count();
        const todayVisits = await PageVisit.count({
            where: { visitedAt: { [Op.gte]: startOfToday } }
        });
        const weeklyVisits = await PageVisit.count({
            where: { visitedAt: { [Op.gte]: startOfWeek } }
        });

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
