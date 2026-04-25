const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PageVisit = sequelize.define('PageVisit', {
    sessionToken: { type: DataTypes.STRING, allowNull: true },
    pageUrl: { type: DataTypes.STRING, allowNull: true },
    userAgent: { type: DataTypes.STRING, allowNull: true },
    visitedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

module.exports = PageVisit;
