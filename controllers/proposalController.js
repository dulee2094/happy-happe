// Proposal Controller — Happy HappE
const models = require('../models');
const { Proposal, Room, User, ProposalNextRound: _ProposalNextRound } = models;
const ProposalNextRound = _ProposalNextRound || (models.sequelize && models.sequelize.models.ProposalNextRound);

if (!ProposalNextRound) {
    console.error("❌ CRITICAL: ProposalNextRound model could not be loaded. Next Round logic will fail.");
}

const { Op } = require('sequelize');

const ProposalController = {
    // 1. Get Proposal Status (Blind)
    async getStatus(req, res) {
        const { userId, roomId } = req.query;
        const uid = parseInt(userId, 10);
        try {
            const myProposals = await Proposal.findAll({
                where: { roomId, proposerId: uid },
                order: [['createdAt', 'DESC']]
            });
            const opponentProposals = await Proposal.findAll({
                where: { roomId, proposerId: { [Op.ne]: uid } },
                order: [['createdAt', 'DESC']]
            });

            const room = await Room.findByPk(roomId);
            if (!room) return res.json({ success: false, error: 'Room not found' });

            const isExtended = room.proposalExtendPartyA && room.proposalExtendPartyB;

            let roomTitle = room.topic || room.roomCode;
            let opponentName = '-';
            if (room.partyAId && room.partyBId) {
                const opponentId = (uid === room.partyAId) ? room.partyBId : room.partyAId;
                const opponent = await User.findByPk(opponentId);
                if (opponent) opponentName = opponent.name || opponent.username;
            }

            let iAgreed = false, oppAgreed = false, myNextRoundIntent = false, oppNextRoundIntent = false;
            if (room.partyAId === uid) {
                iAgreed = room.proposalExtendPartyA;
                oppAgreed = room.proposalExtendPartyB;
                myNextRoundIntent = room.nextRoundIntentPartyA;
                oppNextRoundIntent = room.nextRoundIntentPartyB;
            } else if (room.partyBId === uid) {
                iAgreed = room.proposalExtendPartyB;
                oppAgreed = room.proposalExtendPartyA;
                myNextRoundIntent = room.nextRoundIntentPartyB;
                oppNextRoundIntent = room.nextRoundIntentPartyA;
            }

            const myRound = myProposals.length > 0 ? myProposals[0].round : 0;
            const oppRound = opponentProposals.length > 0 ? opponentProposals[0].round : 0;
            let pRound = Math.max(myRound, oppRound);
            if (pRound === 0) pRound = 1;

            let myIntent = null, oppIntent = null;
            if (ProposalNextRound) {
                myIntent = await ProposalNextRound.findOne({ where: { roomId, userId: uid, round: pRound } });
                oppIntent = await ProposalNextRound.findOne({ where: { roomId, userId: { [Op.ne]: uid }, round: pRound } });
            }

            let currentRound = pRound;
            let nextRoundStarted = false;
            if ((myIntent && oppIntent) || (myNextRoundIntent && oppNextRoundIntent)) {
                currentRound++;
                nextRoundStarted = true;
            }

            let isExpired = false;
            if (!nextRoundStarted) {
                const now = new Date();
                const myCurrentProp = myProposals.find(p => p.round === pRound);
                const oppCurrentProp = opponentProposals.find(p => p.round === pRound);
                if (!myCurrentProp || !oppCurrentProp) {
                    if (myCurrentProp && new Date(myCurrentProp.expiresAt) < now) isExpired = true;
                    if (oppCurrentProp && new Date(oppCurrentProp.expiresAt) < now) isExpired = true;
                }
            }

            const allProposals = await Proposal.findAll({ where: { roomId }, order: [['createdAt', 'DESC']] });

            let gapStatus = 'waiting', gapData = {}, currentRoundData = null, roundStatus = 'waiting', midpointStatus = null;

            const pPartyACurrent = allProposals.find(p => p.proposerId == room.partyAId && p.round == currentRound);
            const pPartyBCurrent = allProposals.find(p => p.proposerId == room.partyBId && p.round == currentRound);
            const myProposal = allProposals.find(p => p.proposerId == uid && p.round == currentRound);
            const oppProposal = allProposals.find(p => p.proposerId != uid && p.round == currentRound);

            if (pPartyACurrent && pPartyBCurrent) {
                const amt1 = pPartyACurrent.amount;
                const amt2 = pPartyBCurrent.amount;
                const diff = Math.abs(amt1 - amt2);
                const bothViewed = pPartyACurrent.resultViewed && pPartyBCurrent.resultViewed;

                gapStatus = bothViewed ? 'analyzed' : 'ready';
                roundStatus = bothViewed ? 'completed' : 'ready';
                gapData = { diff, round: currentRound };
                currentRoundData = { round: currentRound, partyAAmount: amt1, partyBAmount: amt2, diff, completed: true, bothViewed, partyAMessage: pPartyACurrent.message, partyBMessage: pPartyBCurrent.message };

                const maxVal = Math.max(amt1, amt2);
                const gapPercent = (diff / maxVal) * 100;
                if (gapPercent <= 10) {
                    let midPhase = 1;
                    const iProcedureAgreed = (uid === room.partyAId) ? room.midpointProcedurePartyAAgreed : room.midpointProcedurePartyBAgreed;
                    const oppProcedureAgreed = (uid === room.partyAId) ? room.midpointProcedurePartyBAgreed : room.midpointProcedurePartyAAgreed;
                    if (room.midpointAmountRevealed) midPhase = 2;
                    if (room.status === 'settled' || (room.midpointPartyAAgreed && room.midpointPartyBAgreed)) midPhase = 3;
                    midpointStatus = {
                        isMidpointActive: true,
                        gapPercent,
                        midpointAmount: Math.floor((amt1 + amt2) / 2),
                        phase: midPhase,
                        myAgreement: iProcedureAgreed,
                        oppAgreement: oppProcedureAgreed,
                        midpointRevealed: room.midpointAmountRevealed
                    };
                }
            } else if (pPartyACurrent || pPartyBCurrent) {
                roundStatus = 'proposing';
                const now = new Date();
                const activeProp = pPartyACurrent || pPartyBCurrent;
                if (activeProp && activeProp.expiresAt && new Date(activeProp.expiresAt) < now) {
                    gapStatus = 'expired';
                    roundStatus = 'expired';
                }
            }

            const previousRounds = [];
            for (let r = 1; r < currentRound; r++) {
                const pA = allProposals.find(p => p.proposerId == room.partyAId && p.round == r);
                const pB = allProposals.find(p => p.proposerId == room.partyBId && p.round == r);
                if (pA && pB) {
                    previousRounds.push({ round: r, partyAAmount: pA.amount, partyBAmount: pB.amount, completed: true, resultViewed: pA.resultViewed && pB.resultViewed, partyAMessage: pA.message, partyBMessage: pB.message });
                } else {
                    previousRounds.push({ round: r, completed: false, expired: true });
                }
            }

            res.json({
                success: true,
                myProposalCount: myProposals.length,
                myLastProposal: myProposals.length > 0 ? myProposals[0] : null,
                myProposals,
                opponentProposalCount: opponentProposals.length,
                hasOpponentProposed: oppRound === currentRound,
                opponentLastProposal: opponentProposals.length > 0 ? { expiresAt: opponentProposals[0].expiresAt, createdAt: opponentProposals[0].createdAt } : null,
                currentRound, myRound, oppRound, roundStatus,
                myResultViewed: myProposal?.resultViewed || false,
                oppResultViewed: oppProposal?.resultViewed || false,
                isExtended, iAgreed, oppAgreed, myNextRoundIntent, oppNextRoundIntent, nextRoundStarted,
                roomTitle, opponentName,
                status: gapStatus,
                data: gapData,
                currentRoundData,
                previousRounds,
                midpointStatus,
                isPartyA: (uid === room.partyAId)
            });

        } catch (e) {
            console.error(e);
            res.status(500).json({ success: false, error: e.message });
        }
    },

    // 2. Submit Proposal
    async submitProposal(req, res) {
        let { userId, roomId, amount, duration, position, message } = req.body;
        userId = parseInt(userId, 10);
        try {
            const room = await Room.findByPk(roomId);
            if (!room) return res.json({ success: false, error: 'Room not found' });

            const isExtended = room.proposalExtendPartyA && room.proposalExtendPartyB;
            const limit = isExtended ? 8 : 5;

            const count = await Proposal.count({ where: { roomId, proposerId: userId } });
            if (count >= limit) return res.json({ success: false, error: `제안 횟수(${limit}회)를 모두 소진했습니다.` });

            const myProposals = await Proposal.findAll({ where: { roomId, proposerId: userId }, order: [['createdAt', 'DESC']] });
            const currentRound = myProposals.length > 0 ? myProposals[0].round + 1 : 1;

            const oppProposal = await Proposal.findOne({ where: { roomId, proposerId: { [Op.ne]: userId }, round: currentRound } });
            if (oppProposal && oppProposal.expiresAt && new Date(oppProposal.expiresAt) < new Date()) {
                return res.json({ success: false, error: '상대방의 제안 유효기간이 만료되었습니다. 페이지를 새로고침하여 다음 라운드를 진행해주세요.' });
            }

            // Convergence Principle: must move toward opponent
            const myPrevProposals = await Proposal.findAll({ where: { roomId, proposerId: userId }, order: [['createdAt', 'DESC']], limit: 1 });
            if (myPrevProposals.length > 0) {
                const lastAmount = myPrevProposals[0].amount;
                if (userId === room.partyAId) {
                    if (amount < lastAmount) return res.json({ success: false, error: `합의 수렴 원칙 위배: 이전 제안(${lastAmount.toLocaleString()}원)보다 낮은 금액을 제안할 수 없습니다.` });
                } else if (userId === room.partyBId) {
                    if (amount > lastAmount) return res.json({ success: false, error: `합의 수렴 원칙 위배: 이전 제안(${lastAmount.toLocaleString()}원)보다 높은 금액을 제안할 수 없습니다.` });
                }
            }

            const expiresAt = new Date();
            const dur = parseFloat(duration);
            if (dur === 0.25) expiresAt.setHours(expiresAt.getHours() + 6);
            else if (dur === 3) expiresAt.setDate(expiresAt.getDate() + 3);
            else expiresAt.setDate(expiresAt.getDate() + 1);

            await Proposal.create({ roomId, proposerId: userId, amount, round: currentRound, position: position || 'payer', duration, expiresAt, message: message ? message.substring(0, 300) : null });

            if (room.status === 'connected' || room.status === 'pending') room.status = 'negotiating';
            if (userId === room.partyAId) room.nextRoundIntentPartyA = false;
            else if (userId === room.partyBId) room.nextRoundIntentPartyB = false;
            await room.save();

            // Gap Analysis
            const proposals = await Proposal.findAll({ where: { roomId }, order: [['createdAt', 'DESC']] });
            let gapStatus = 'waiting', gapData = {}, midpointTriggered = false;

            const pPartyA = proposals.find(p => p.proposerId == room.partyAId && p.round == currentRound);
            const pPartyB = proposals.find(p => p.proposerId == room.partyBId && p.round == currentRound);

            if (pPartyA && pPartyB) {
                const diff = Math.abs(pPartyA.amount - pPartyB.amount);
                gapStatus = 'analyzed';
                gapData = { diff, round: currentRound };
                const maxVal = Math.max(pPartyA.amount, pPartyB.amount);
                if (diff <= maxVal * 0.1) {
                    midpointTriggered = true;
                    room.midpointProposed = true;
                    room.midpointAmount = Math.floor((pPartyA.amount + pPartyB.amount) / 2);
                    await room.save();
                }
            }

            res.json({ success: true, leftCount: limit - count - 1, status: gapStatus, data: gapData, currentRound, midpointTriggered, midpointAmount: null, myLastProposal: { amount, position, round: currentRound } });

        } catch (e) {
            console.error(e);
            res.status(500).json({ success: false, error: e.message });
        }
    },

    // 3. View Analysis Result
    async viewAnalysisResult(req, res) {
        const { userId, roomId, round } = req.body;
        try {
            const uid = parseInt(userId);
            const room = await Room.findByPk(roomId);
            if (!room) return res.json({ success: false, error: 'Room not found' });

            const proposals = await Proposal.findAll({ where: { roomId, round }, order: [['createdAt', 'ASC']] });
            if (proposals.length < 2) return res.json({ success: false, error: 'Both proposals not found for this round' });

            const myProposal = proposals.find(p => p.proposerId === uid);
            const oppProposal = proposals.find(p => p.proposerId !== uid);
            if (!myProposal || !oppProposal) return res.json({ success: false, error: 'Proposal data incomplete' });

            if (!myProposal.resultViewed) { myProposal.resultViewed = true; await myProposal.save(); }

            const bothViewed = myProposal.resultViewed && oppProposal.resultViewed;
            if (!bothViewed) return res.json({ success: true, bothViewed: false, message: 'Waiting for opponent to view results' });

            const diff = Math.abs(myProposal.amount - oppProposal.amount);
            const diffPercent = (diff / Math.max(myProposal.amount, oppProposal.amount)) * 100;

            let isExpired = false;
            if (myProposal.expiresAt && new Date(myProposal.expiresAt) < new Date()) isExpired = true;
            if (oppProposal.expiresAt && new Date(oppProposal.expiresAt) < new Date()) isExpired = true;

            const nextRoundStarted = room.nextRoundIntentPartyA && room.nextRoundIntentPartyB;

            res.json({
                success: true, roomId,
                roomTitle: room.topic || room.roomCode,
                currentRound: round, isExpired,
                nextRoundStarted: !!nextRoundStarted, bothViewed: true,
                analysis: { myAmount: myProposal.amount, oppAmount: oppProposal.amount, diff, diffPercent, midpointPossible: diffPercent <= 10, midpointResolved: room.midpointRejected || room.status === 'settled' }
            });

        } catch (e) {
            console.error(e);
            res.status(500).json({ success: false, error: e.message });
        }
    },

    // 4. Expire Sync
    async expireSync(req, res) {
        const { userId, roomId, round } = req.body;
        try {
            const uid = parseInt(userId);
            const existing = await Proposal.findOne({ where: { roomId, proposerId: uid, round } });
            if (existing) return res.json({ success: true, message: 'Already synced' });

            await Proposal.create({ roomId, proposerId: uid, amount: 0, round, position: 'expired_sync', duration: 0, expiresAt: new Date(), resultViewed: true, message: 'Round Skipped (Timeout)' });
            res.json({ success: true });
        } catch (e) {
            console.error(e);
            res.status(500).json({ success: false, error: e.message });
        }
    },

    // 5. Extend Request
    async extendRequest(req, res) {
        const { roomId, userId } = req.body;
        try {
            const room = await Room.findByPk(roomId);
            if (!room) return res.json({ success: false, error: 'Room not found' });
            const uid = parseInt(userId);
            if (room.partyAId === uid) room.proposalExtendPartyA = true;
            else if (room.partyBId === uid) room.proposalExtendPartyB = true;
            else return res.json({ success: false, error: 'Not a participant' });
            await room.save();
            res.json({ success: true, isExtended: room.proposalExtendPartyA && room.proposalExtendPartyB });
        } catch (e) {
            console.error(e);
            res.status(500).json({ success: false, error: e.message });
        }
    },

    // 6. Midpoint Status
    async getMidpointStatus(req, res) {
        const { roomId, userId } = req.query;
        try {
            const room = await Room.findByPk(roomId);
            if (!room) return res.json({ success: false, error: 'Room not found' });
            const uid = parseInt(userId);

            let iProcedureAgreed = false, oppProcedureAgreed = false, iFinalAgreed = false, oppFinalAgreed = false;
            if (room.partyAId === uid) {
                iProcedureAgreed = room.midpointProcedurePartyAAgreed; oppProcedureAgreed = room.midpointProcedurePartyBAgreed;
                iFinalAgreed = room.midpointPartyAAgreed; oppFinalAgreed = room.midpointPartyBAgreed;
            } else if (room.partyBId === uid) {
                iProcedureAgreed = room.midpointProcedurePartyBAgreed; oppProcedureAgreed = room.midpointProcedurePartyAAgreed;
                iFinalAgreed = room.midpointPartyBAgreed; oppFinalAgreed = room.midpointPartyAAgreed;
            }

            const bothProcedureAgreed = room.midpointProcedurePartyAAgreed && room.midpointProcedurePartyBAgreed;
            const bothFinalAgreed = room.midpointPartyAAgreed && room.midpointPartyBAgreed;
            let phase = 0;
            if (bothFinalAgreed) phase = 3;
            else if (bothProcedureAgreed || room.midpointAmountRevealed) phase = 2;
            else if (room.midpointProposed) phase = 1;

            res.json({
                success: true, midpointProposed: room.midpointProposed, phase,
                procedureAgreement: { iAgreed: iProcedureAgreed, oppAgreed: oppProcedureAgreed, bothAgreed: bothProcedureAgreed },
                finalAgreement: { iAgreed: iFinalAgreed, oppAgreed: oppFinalAgreed, bothAgreed: bothFinalAgreed },
                midpointAmount: room.midpointAmountRevealed ? room.midpointAmount : null,
                rejected: room.midpointRejected, rejectedBy: room.midpointRejectedBy
            });
        } catch (e) {
            console.error(e);
            res.status(500).json({ success: false, error: e.message });
        }
    },

    // 7. Midpoint Procedure Agreement
    async midpointProcedureAgree(req, res) {
        const { userId, roomId, agreed } = req.body;
        try {
            const room = await Room.findByPk(roomId);
            if (!room) return res.json({ success: false, error: 'Room not found' });
            const uid = parseInt(userId);

            if (!agreed) {
                room.midpointRejected = true;
                room.midpointRejectedBy = uid === room.partyAId ? 'partyA' : 'partyB';
                room.midpointRejectedAt = new Date();
                await room.save();
                return res.json({ success: true, rejected: true });
            }

            if (room.partyAId === uid) room.midpointProcedurePartyAAgreed = true;
            else if (room.partyBId === uid) room.midpointProcedurePartyBAgreed = true;
            await room.save();

            const bothAgreedProcedure = room.midpointProcedurePartyAAgreed && room.midpointProcedurePartyBAgreed;
            if (bothAgreedProcedure) {
                room.midpointAmountRevealed = true;
                await room.save();
                return res.json({ success: true, bothAgreedProcedure: true, midpointAmount: room.midpointAmount, phase: 2 });
            }
            res.json({ success: true, waiting: true, phase: 1 });
        } catch (e) {
            console.error(e);
            res.status(500).json({ success: false, error: e.message });
        }
    },

    // 8. Midpoint Final Agreement
    async midpointFinalAgree(req, res) {
        const { userId, roomId, agreed } = req.body;
        try {
            const room = await Room.findByPk(roomId);
            if (!room) return res.json({ success: false, error: 'Room not found' });
            const uid = parseInt(userId);

            if (!room.midpointProcedurePartyAAgreed || !room.midpointProcedurePartyBAgreed) {
                return res.json({ success: false, error: 'Procedure not agreed by both parties' });
            }

            if (!agreed) {
                room.midpointRejected = true;
                room.midpointRejectedBy = uid === room.partyAId ? 'partyA' : 'partyB';
                room.midpointRejectedAt = new Date();
                await room.save();
                return res.json({ success: true, rejected: true });
            }

            if (room.partyAId === uid) room.midpointPartyAAgreed = true;
            else if (room.partyBId === uid) room.midpointPartyBAgreed = true;
            await room.save();

            if (room.midpointPartyAAgreed && room.midpointPartyBAgreed) {
                room.status = 'settled';
                room.finalAmount = room.midpointAmount;
                await room.save();
                return res.json({ success: true, settled: true, finalAmount: room.midpointAmount });
            }
            res.json({ success: true, waiting: true, phase: 2 });
        } catch (e) {
            console.error(e);
            res.status(500).json({ success: false, error: e.message });
        }
    },

    // 9. Next Round Intent
    async nextRoundIntent(req, res) {
        const { userId, roomId, round } = req.body;
        try {
            const room = await Room.findByPk(roomId);
            if (!room) return res.json({ success: false, error: 'Room not found' });
            const uid = parseInt(userId);

            if (room.partyAId === uid) room.nextRoundIntentPartyA = true;
            else if (room.partyBId === uid) room.nextRoundIntentPartyB = true;
            else return res.json({ success: false, error: 'Not a participant' });
            await room.save();

            const bothReady = room.nextRoundIntentPartyA && room.nextRoundIntentPartyB;
            res.json({ success: true, myNextRoundIntent: true, nextRoundStarted: bothReady });
        } catch (e) {
            console.error(e);
            res.status(500).json({ success: false, error: e.message });
        }
    }
};

module.exports = ProposalController;
