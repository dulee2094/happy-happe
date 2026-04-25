const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false }, // In production, hash this!
    // role: { type: DataTypes.ENUM('offender', 'victim'), allowNull: false }, // Removed global role
    name: { type: DataTypes.STRING, allowNull: false },
    phoneNumber: { type: DataTypes.STRING }, // Added for matching invites
    messageNotification: { type: DataTypes.BOOLEAN, defaultValue: true } // Notification setting
});

module.exports = User;
