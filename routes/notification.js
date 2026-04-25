const express = require('express');
const router = express.Router();
const { Notification, Case, User } = require('../models');

// 1. Get Notifications for User
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await Notification.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            limit: 50
        });
        res.json({ success: true, notifications });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
    }
});

// 2. Mark as Read
router.post('/read', async (req, res) => {
    try {
        const { notificationId, userId, all } = req.body;

        if (all && userId) {
            await Notification.update({ isRead: true }, { where: { userId, isRead: false } });
        } else if (notificationId) {
            await Notification.update({ isRead: true }, { where: { id: notificationId } });
        }

        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: 'Failed to update read status' });
    }
});

// 3. Create Notification (Internal/Test use)
router.post('/create', async (req, res) => {
    try {
        const { userId, type, content, relatedCaseId, actionUrl } = req.body;
        await Notification.create({ userId, type, content, relatedCaseId, actionUrl });
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: 'Failed to create notification' });
    }
});

// 4. Get Notification Settings
router.get('/settings/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });
        
        res.json({ success: true, messageNotification: user.messageNotification });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: 'Failed to fetch settings' });
    }
});

// 5. Update Notification Settings
router.put('/settings', async (req, res) => {
    try {
        const { userId, enabled } = req.body;
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        user.messageNotification = enabled;
        await user.save();
        
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: 'Failed to update settings' });
    }
});

module.exports = router;
