const express = require('express');
const router = express.Router();
const { User, Case } = require('../models');

// 1. Sign Up
router.post('/signup', async (req, res) => {
    try {
        const { email, password, name, phoneNumber } = req.body;
        // Role is no longer stored on User
        const user = await User.create({ email, password, name, phoneNumber });

        // Check if there are any pending invites for this phone number
        if (phoneNumber) {
            const pendingCase = await Case.findOne({ where: { victimPhone: phoneNumber } });

            if (pendingCase && !pendingCase.victimId) {
                pendingCase.victimId = user.id;
                pendingCase.connectionStatus = 'pending'; // Waiting for explicit acceptance
                await pendingCase.save();
                console.log(`[Auto-Match] Matched User ${user.name} to Case ${pendingCase.caseNumber}`);
            }
        }

        res.json({ success: true, userId: user.id, name: user.name });

    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: 'User already exists or invalid data' });
    }
});

// 2. Login (Mock)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email, password } });

    if (user) {
        res.json({ success: true, userId: user.id, name: user.name });
    } else {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
});

// 3. Forgot Password (Option B: 임시 비밀번호 발급)
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ success: false, error: '가입되지 않은 이메일입니다.' });
        }

        // 임시 비밀번호 생성 (8자리 랜덤 문자열)
        const tempPassword = Math.random().toString(36).slice(-8);

        // 평문으로 저장 (기존 로그인 시스템과 동일하게 적용)
        user.password = tempPassword;
        await user.save();

        // 실제 이메일 발송은 서버 로그를 통해 확인 (MVP 상태)
        console.log(`[Email System Mock] 사용자 ${email}에게 임시 비밀번호 발송됨: ${tempPassword}`);

        // 데모 환경의 편의성을 위해 임시 비밀번호를 응답에도 포함하여 화면에 알려줍니다. (실제 운영 시에는 이메일로만 발송해야 함)
        res.json({ 
            success: true, 
            message: '임시 비밀번호가 발급되었습니다.',
            tempPassword: tempPassword
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
    }
});

// 4. Change Password
router.post('/change-password', async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ success: false, error: '사용자를 찾을 수 없습니다.' });
        }

        // 현재 비밀번호 확인 (현재 시스템이 평문 저장이므로 단순 비교)
        if (user.password !== currentPassword) {
            return res.status(401).json({ success: false, error: '현재 비밀번호가 일치하지 않습니다.' });
        }

        // 새 비밀번호 저장
        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: '비밀번호가 성공적으로 변경되었습니다.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
    }
});

// 5. Change Email
router.post('/change-email', async (req, res) => {
    try {
        const { userId, newEmail, currentPassword } = req.body;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ success: false, error: '사용자를 찾을 수 없습니다.' });
        }

        // 현재 비밀번호 확인
        if (user.password !== currentPassword) {
            return res.status(401).json({ success: false, error: '현재 비밀번호가 일치하지 않습니다.' });
        }

        // 중복 이메일 확인
        const existingUser = await User.findOne({ where: { email: newEmail } });
        if (existingUser) {
            return res.status(409).json({ success: false, error: '이미 사용 중인 이메일 주소입니다.' });
        }

        // 새 이메일 저장
        user.email = newEmail;
        await user.save();

        res.json({ success: true, message: '이메일이 성공적으로 변경되었습니다.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
    }
});

// 6. Delete Account (Soft Delete / Anonymize)
router.post('/delete-account', async (req, res) => {
    try {
        const { userId, currentPassword } = req.body;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ success: false, error: '사용자를 찾을 수 없습니다.' });
        }

        // 비밀번호 확인
        if (user.password !== currentPassword) {
            return res.status(401).json({ success: false, error: '비밀번호가 일치하지 않습니다.' });
        }

        // 소프트 딜리트 처리 (익명화 처리하여 연관된 방 데이터 보존)
        user.email = `deleted_${user.id}_${Date.now()}@deleted.local`;
        user.password = 'DELETED_ACCOUNT';
        user.name = '(탈퇴한 사용자)';
        user.phoneNumber = null;
        user.messageNotification = false;
        
        await user.save();

        res.json({ success: true, message: '회원 탈퇴가 완료되었습니다.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
    }
});

// 7. Guest Login (Returns transient dummy data without hitting DB)
router.post('/guest-login', (req, res) => {
    res.json({ success: true, userId: 'guest_' + Date.now(), name: '체험자(게스트)' });
});

module.exports = router;
