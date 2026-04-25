const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
    userId: { type: DataTypes.INTEGER, allowNull: false }, // Receiver
    type: {
        type: DataTypes.ENUM('CHAT', 'PROPOSAL', 'SYSTEM', 'CASE_UPDATE'),
        allowNull: false,
        defaultValue: 'SYSTEM'
    },
    content: { type: DataTypes.STRING, allowNull: false },
    relatedCaseId: { type: DataTypes.INTEGER, allowNull: true },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
    actionUrl: { type: DataTypes.STRING, allowNull: true } // Optional link
});

module.exports = Notification;
