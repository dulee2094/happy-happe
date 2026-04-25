const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Proposal = sequelize.define('Proposal', {
    roomId: { type: DataTypes.INTEGER, allowNull: false },
    proposerId: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.BIGINT, allowNull: false },
    round: { type: DataTypes.INTEGER, defaultValue: 1 }, // Round number for matching proposals
    position: { type: DataTypes.STRING }, // 'payer' or 'receiver'
    message: { type: DataTypes.TEXT },
    duration: { type: DataTypes.INTEGER }, // 1, 3, 7 days
    expiresAt: { type: DataTypes.DATE }, // Calculated expiration time
    resultViewed: { type: DataTypes.BOOLEAN, defaultValue: false }, // Whether user viewed the analysis result
    viewedAt: { type: DataTypes.DATE } // When the result was viewed
});

module.exports = Proposal;
