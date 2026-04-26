const express = require('express');
const router = express.Router();
const { Room, User } = require('../models');
const { Op } = require('sequelize');

// Create Room
router.post('/create', async (req, res) => {
    const { userId, role, topic, password } = req.body;
    const uid = parseInt(userId, 10);

    const roomCode = 'HAPPY-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    try {
        const newRoom = {
            roomCode,
            topic,
            roomPassword: password,
            creatorId: uid,
            status: 'pending',
            connectionStatus: 'pending'
        };

        if (role === 'partyA') newRoom.partyAId = uid;
        else if (role === 'partyB') newRoom.partyBId = uid;

        const roomData = await Room.create(newRoom);
        res.json({ success: true, roomId: roomData.id, roomCode: roomData.roomCode });

    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: e.message });
    }
});

// Search Rooms
router.get('/search', async (req, res) => {
    const { query, userId } = req.query;

    try {
        const whereClause = {
            [Op.or]: [
                { partyAId: null },
                { partyBId: null }
            ]
        };

        if (userId) {
            const uid = parseInt(userId);
            whereClause[Op.and] = [
                { creatorId: { [Op.or]: [{ [Op.ne]: uid }, null] } },
                { partyAId: { [Op.or]: [{ [Op.ne]: uid }, null] } },
                { partyBId: { [Op.or]: [{ [Op.ne]: uid }, null] } }
            ];
        }

        if (query) {
            whereClause.topic = { [Op.like]: `%${query}%` };
        }

        let rooms = await Room.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit: 20
        });

        if (userId) {
            const uid = parseInt(userId, 10);
            if (!isNaN(uid)) {
                rooms = rooms.filter(c =>
                    c.creatorId !== uid && c.partyAId !== uid && c.partyBId !== uid
                );
            }
        }

        const result = await Promise.all(rooms.map(async (c) => {
            let creatorName = '알 수 없음';
            const creatorId = c.creatorId || c.partyAId || c.partyBId;

            if (creatorId) {
                const user = await User.findByPk(creatorId);
                if (user) creatorName = user.name;
            }

            let creatorRole = '미정';
            if (c.creatorId) {
                if (c.creatorId === c.partyAId) creatorRole = '제안자';
                else if (c.creatorId === c.partyBId) creatorRole = '참여자';
            }

            return {
                id: c.id,
                roomCode: c.roomCode,
                topic: c.topic,
                creatorRole: creatorRole,
                creatorName: creatorName,
                createdAt: c.createdAt
            };
        }));

        res.json({ success: true, rooms: result });

    } catch (e) {
        console.error(e);
        res.json({ success: false, error: e.message });
    }
});

// Join Room
router.post('/join', async (req, res) => {
    let { userId, roomId, password } = req.body;
    userId = parseInt(userId, 10);

    try {
        const roomData = await Room.findByPk(roomId);

        if (!roomData) return res.json({ success: false, error: '존재하지 않는 방입니다.' });
        if (roomData.roomPassword !== password) return res.json({ success: false, error: '비밀번호가 일치하지 않습니다.' });

        if (roomData.partyAId == userId || roomData.partyBId == userId) {
            return res.json({ success: false, error: '이미 참여한 방입니다.' });
        }

        let myRole = '';
        if (roomData.partyAId && !roomData.partyBId) {
            roomData.partyBId = userId;
            myRole = 'partyB';
        } else if (!roomData.partyAId && roomData.partyBId) {
            roomData.partyAId = userId;
            myRole = 'partyA';
        } else {
            return res.json({ success: false, error: '이미 정원이 가득 찬 방입니다.' });
        }

        roomData.connectionStatus = 'connected';
        await roomData.save();

        res.json({ success: true, role: myRole });

    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: e.message });
    }
});

// Status (Get user's rooms)
router.get('/status', async (req, res) => {
    const { userId } = req.query;
    try {
        const rooms = await Room.findAll({
            where: {
                [Op.or]: [
                    { partyAId: userId },
                    { partyBId: userId }
                ]
            },
            order: [['createdAt', 'DESC']]
        });
        
        if (rooms.length > 0) {
            const formattedRooms = await Promise.all(rooms.map(async (r) => {
                let counterpartyName = '대기 중';
                let counterpartyId = r.partyAId == userId ? r.partyBId : r.partyAId;
                if (counterpartyId) {
                    const user = await User.findByPk(counterpartyId);
                    if (user) counterpartyName = user.name;
                }
                
                return {
                    id: r.id,
                    roomCode: r.roomCode,
                    topic: r.topic,
                    status: r.status,
                    connectionStatus: r.connectionStatus,
                    myRole: r.partyAId == userId ? 'partyA' : 'partyB',
                    counterpartyName,
                    createdAt: r.createdAt
                };
            }));
            res.json({ found: true, rooms: formattedRooms });
        } else {
            res.json({ found: false, rooms: [] });
        }
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

module.exports = router;
