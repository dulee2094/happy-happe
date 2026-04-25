const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Room = sequelize.define('Room', {
    roomCode: { type: DataTypes.STRING, unique: true, allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'negotiating', 'settled', 'expired'), defaultValue: 'pending' },
    expiresAt: { type: DataTypes.DATE },
    partyAId: { type: DataTypes.INTEGER }, // Creator or Party A
    partyBId: { type: DataTypes.INTEGER }, // Party B
    inviteToken: { type: DataTypes.STRING },
    connectionStatus: { type: DataTypes.ENUM('none', 'invited', 'pending', 'connected'), defaultValue: 'none' },
    topic: { type: DataTypes.STRING }, // e.g. "월세 인상", "외주 단가"
    roomPassword: { type: DataTypes.STRING }, 
    creatorId: { type: DataTypes.INTEGER }, 

    // Extension Request
    proposalExtendPartyA: { type: DataTypes.BOOLEAN, defaultValue: false },
    proposalExtendPartyB: { type: DataTypes.BOOLEAN, defaultValue: false },
    
    // Midpoint Agreement Logic
    midpointProposed: { type: DataTypes.BOOLEAN, defaultValue: false },
    midpointAmount: { type: DataTypes.BIGINT }, 

    // Step 1: Procedure Agreement
    midpointProcedurePartyAAgreed: { type: DataTypes.BOOLEAN, defaultValue: false },
    midpointProcedurePartyBAgreed: { type: DataTypes.BOOLEAN, defaultValue: false },

    // Step 2: Final Agreement
    midpointPartyAAgreed: { type: DataTypes.BOOLEAN, defaultValue: false }, 
    midpointPartyBAgreed: { type: DataTypes.BOOLEAN, defaultValue: false }, 

    // Status Tracking
    midpointAmountRevealed: { type: DataTypes.BOOLEAN, defaultValue: false }, 
    midpointRejected: { type: DataTypes.BOOLEAN, defaultValue: false }, 
    midpointRejectedBy: { type: DataTypes.STRING }, 
    midpointRejectedAt: { type: DataTypes.DATE }, 

    // Round Transition Intent
    nextRoundIntentPartyA: { type: DataTypes.BOOLEAN, defaultValue: false },
    nextRoundIntentPartyB: { type: DataTypes.BOOLEAN, defaultValue: false },

    finalAmount: { type: DataTypes.BIGINT }
});

module.exports = Room;
