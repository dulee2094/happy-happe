const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PaymentReq = sequelize.define('PaymentReq', {
    caseId: { type: DataTypes.INTEGER, allowNull: false },
    requesterId: { type: DataTypes.INTEGER, allowNull: false },
    bank: { type: DataTypes.STRING },
    accountNumber: { type: DataTypes.STRING },
    accountHolder: { type: DataTypes.STRING },
    amount: { type: DataTypes.INTEGER }, // Final amount
    signature: { type: DataTypes.TEXT }, // Base64
    status: { type: DataTypes.STRING, defaultValue: 'sent' } // sent, confirmed
});

module.exports = PaymentReq;
