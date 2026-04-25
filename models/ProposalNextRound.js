const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProposalNextRound = sequelize.define('ProposalNextRound', {
    roomId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    round: { type: DataTypes.INTEGER, allowNull: false },
    agreed: { type: DataTypes.BOOLEAN, defaultValue: true }, // Whether they agreed to proceed
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

module.exports = ProposalNextRound;
