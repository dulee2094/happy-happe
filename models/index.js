const sequelize = require('../config/database');
const User = require('./User');
const Room = require('./Room');
const Proposal = require('./Proposal');
const Message = require('./Message');
const PaymentReq = require('./PaymentReq');
const Notification = require('./Notification');
const ProposalNextRound = require('./ProposalNextRound');
const PageVisit = require('./PageVisit');

// Associations
// Case.hasMany(Proposal, { foreignKey: 'caseId' });
// Proposal.belongsTo(Case, { foreignKey: 'caseId' });

module.exports = {
    sequelize,
    User,
    Room,
    Proposal,
    Message,
    PaymentReq,
    Notification,
    ProposalNextRound,
    PageVisit
};
