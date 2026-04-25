const { test, expect } = require('@playwright/test');

const ATTACKER = { email: 'attacker_test1@email.com', pw: 'password123!', name: '테스트가해자' };
const VICTIM = { email: 'victim_test1@email.com', pw: 'password123!', name: '테스트피해자' };

test.use({ launchOptions: { slowMo: 300 } }); // 라운드가 많아진 만큼 테스트 속도를 300ms로 약간 단축합니다.

test.describe('장기전(5라운드~8라운드 연장) 상세 시나리오 테스트', () => {

    async function setupRoom(browser) {
        const attackerContext = await browser.newContext();
        const victimContext = await browser.newContext();
        const attackerPage = await attackerContext.newPage();
        const victimPage = await victimContext.newPage();
        
        attackerPage.on('dialog', async dialog => { await dialog.accept().catch(() => {}); });
        victimPage.on('dialog', async dialog => { await dialog.accept().catch(() => {}); });

        async function doLogin(page, user) {
            await page.goto('/login.html');
            await page.fill('#loginEmail', user.email);
            await page.fill('#loginPw', user.pw);
            await page.click('button[type="submit"]');
            await page.waitForTimeout(1000);
        }
        await doLogin(attackerPage, ATTACKER);
        await doLogin(victimPage, VICTIM);

        const attackerIdCheck = await attackerPage.evaluate(() => localStorage.getItem('user_id'));
        if (!attackerIdCheck) {
            async function ensureAccount(page, user) {
                await page.goto('/signup.html');
                await page.fill('#regName', user.name);
                await page.fill('#regEmail', user.email);
                await page.fill('#regPw', user.pw);
                await page.click('button[type="submit"]');
                await page.waitForTimeout(1500); 
            }
            await ensureAccount(attackerPage, ATTACKER);
            await ensureAccount(victimPage, VICTIM);
            await doLogin(attackerPage, ATTACKER);
            await doLogin(victimPage, VICTIM);
        }

        const attackerId = await attackerPage.evaluate(() => localStorage.getItem('user_id'));
        const createRes = await attackerPage.request.post('https://settlement33.onrender.com/api/case/create-room', {
            headers: { 'Content-Type': 'application/json' },
            data: {
                userId: attackerId,
                roomTitle: `8라운드테스트_${Date.now()}`,
                roomPassword: '1234',
                role: 'offender',
                summary: '최대 8라운드 지연 테스트용'
            }
        });
        const createData = await createRes.json();
        const roomId = createData.caseId;

        const victimId = await victimPage.evaluate(() => localStorage.getItem('user_id'));
        await victimPage.request.post('https://settlement33.onrender.com/api/case/join-room', {
            headers: { 'Content-Type': 'application/json' },
            data: {
                userId: victimId,
                caseId: roomId,
                password: '1234'
            }
        });

        await attackerPage.evaluate((id) => localStorage.setItem('current_case_id', id), roomId);
        await victimPage.evaluate((id) => localStorage.setItem('current_case_id', id), roomId);

        await attackerPage.goto('/blind_proposal.html');
        await victimPage.goto('/blind_proposal.html');

        await attackerPage.evaluate(() => { if (window.ProposalUI && window.ProposalUI.closeGuide) window.ProposalUI.closeGuide(); });
        await victimPage.evaluate(() => { if (window.ProposalUI && window.ProposalUI.closeGuide) window.ProposalUI.closeGuide(); });

        await expect(attackerPage.locator('#currentRoundDisplay')).toBeVisible({ timeout: 15000 });
        await expect(victimPage.locator('#currentRoundDisplay')).toBeVisible({ timeout: 15000 });

        return { attackerPage, victimPage, attackerContext, victimContext };
    }

    // 막노동을 방지하는 반복 라운드 자동화 헬퍼 함수 정의
    async function playRound(attackerPage, victimPage, aAmt, vAmt, actionAfter = 'next') {
        console.log(`라운드 제출: 가해자 ${aAmt}만원 🆚 피해자 ${vAmt}만원 | 이후 행동: ${actionAfter}`);
        await attackerPage.fill('#myAmount', aAmt.toString()); 
        await victimPage.fill('#myAmount', vAmt.toString()); 
        await attackerPage.click('button[onclick="submitProposal()"]', { force: true });
        await victimPage.click('button[onclick="submitProposal()"]', { force: true });
        
        await attackerPage.waitForTimeout(3500); // 제출 후 응답 서버 대기

        if (actionAfter === 'next') {
            await attackerPage.evaluate(() => { if(window.viewAnalysisResult) window.viewAnalysisResult(); });
            await victimPage.evaluate(() => { if(window.viewAnalysisResult) window.viewAnalysisResult(); });
            await attackerPage.waitForTimeout(1500); 

            await attackerPage.evaluate(() => { if(window.confirmNextRoundIntent) window.confirmNextRoundIntent(); });
            await victimPage.evaluate(() => { if(window.confirmNextRoundIntent) window.confirmNextRoundIntent(); });
            await attackerPage.waitForTimeout(2000); 
        } 
        else if (actionAfter === 'extend') {
            await attackerPage.evaluate(() => { if(window.viewAnalysisResult) window.viewAnalysisResult(); });
            await victimPage.evaluate(() => { if(window.viewAnalysisResult) window.viewAnalysisResult(); });
            await attackerPage.waitForTimeout(1500); 

            await attackerPage.evaluate(() => { if(window.requestExtension) window.requestExtension(); });
            await victimPage.evaluate(() => { if(window.requestExtension) window.requestExtension(); });
            await attackerPage.waitForTimeout(2500); 

            // 명시적으로 6라운드 속행 의사 전달 테스트 시뮬레이션
            await attackerPage.evaluate(() => { if(window.confirmNextRoundIntent) window.confirmNextRoundIntent(); });
            await victimPage.evaluate(() => { if(window.confirmNextRoundIntent) window.confirmNextRoundIntent(); });
            await attackerPage.waitForTimeout(2000); 
        } 
        else if (actionAfter === 'midpoint_reject') {
            await attackerPage.waitForTimeout(1000); // 모달 확인
            await attackerPage.evaluate(() => { if(window.acceptMidpoint) window.acceptMidpoint(); });
            await victimPage.evaluate(() => { if(window.rejectMidpoint) window.rejectMidpoint(); }); // 피해자/가해자 중 1명 거절
            await attackerPage.waitForTimeout(2500);

            // [핵심 해결] 중간값 합의 거절 직후 곧바로 다음 라운드로 가기 위해 버튼 클릭 지시 필수 포함!
            await attackerPage.evaluate(() => { if(window.confirmNextRoundIntent) window.confirmNextRoundIntent(); });
            await victimPage.evaluate(() => { if(window.confirmNextRoundIntent) window.confirmNextRoundIntent(); });
            await attackerPage.waitForTimeout(2000);
        } 
        else if (actionAfter === 'midpoint_accept') {
            await attackerPage.waitForTimeout(1000);
            await attackerPage.evaluate(() => { if(window.acceptMidpoint) window.acceptMidpoint(); });
            await victimPage.evaluate(() => { if(window.acceptMidpoint) window.acceptMidpoint(); }); // 1차 절차 동의
            await attackerPage.waitForTimeout(3000);

            // [핵심 해결] 시스템상 금액이 공개된 2차 동의 버튼(Phase 2)까지 확정지어야 타결!
            await attackerPage.evaluate(() => { if(window.acceptMidpointFinal) window.acceptMidpointFinal(); });
            await victimPage.evaluate(() => { if(window.acceptMidpointFinal) window.acceptMidpointFinal(); }); // 2차 최종 동의
            await attackerPage.waitForTimeout(2000);
        } 
        else if (actionAfter === 'end') {
            // 마지막 타결 또는 완전한 결렬 시 관전용 대기시간
            await attackerPage.waitForTimeout(2500);
        }
    }


    test('시나리오 A: 극적 타결 (8라운드 교차 타결)', async ({ browser }) => {
        test.setTimeout(300000); // 5분
        const { attackerPage, victimPage } = await setupRoom(browser);

        await playRound(attackerPage, victimPage, 100, 1000, 'next'); // 1R
        await playRound(attackerPage, victimPage, 150, 900, 'next');  // 2R
        await playRound(attackerPage, victimPage, 250, 700, 'next');  // 3R
        await playRound(attackerPage, victimPage, 300, 600, 'next');  // 4R
        await playRound(attackerPage, victimPage, 350, 500, 'extend'); // 5R 종결 -> 연장 3오픈!
        await playRound(attackerPage, victimPage, 400, 480, 'next');  // 6R (연장1)
        await playRound(attackerPage, victimPage, 430, 450, 'midpoint_reject'); // 7R 중간값 도출 -> 1명 거절
        await playRound(attackerPage, victimPage, 450, 440, 'end');   // 8R 가해자 금액 >= 피해자 금액 -> 8R 타결 끝!
        
        console.log('시나리오 A 처리 완료');
    });

    test('시나리오 B: 끝없는 평행선 (8라운드 전진 후 영구 결렬)', async ({ browser }) => {
        test.setTimeout(300000); 
        const { attackerPage, victimPage } = await setupRoom(browser);

        await playRound(attackerPage, victimPage, 200, 1000, 'next'); // 1R (강경)
        await playRound(attackerPage, victimPage, 200, 1000, 'next'); // 2R (강경)
        await playRound(attackerPage, victimPage, 200, 1000, 'next'); // 3R (강경)
        await playRound(attackerPage, victimPage, 210, 990, 'next');  // 4R (10만찔러봄)
        await playRound(attackerPage, victimPage, 250, 900, 'extend'); // 5R -> 연장오픈
        await playRound(attackerPage, victimPage, 300, 850, 'next');  // 6R
        await playRound(attackerPage, victimPage, 300, 850, 'next');  // 7R
        await playRound(attackerPage, victimPage, 350, 800, 'end');   // 8R (격차 안좁혀지고 파국)
        
        console.log('시나리오 B 처리 완료');
    });

    test('시나리오 C: 롤러코스터 (중간값 수용번복 후 연장전 타결)', async ({ browser }) => {
        test.setTimeout(300000);
        const { attackerPage, victimPage } = await setupRoom(browser);

        await playRound(attackerPage, victimPage, 100, 500, 'next'); // 1R
        await playRound(attackerPage, victimPage, 200, 600, 'next'); // 2R (피해자 금액 더 올림)
        await playRound(attackerPage, victimPage, 300, 400, 'next'); // 3R
        await playRound(attackerPage, victimPage, 330, 360, 'midpoint_reject'); // 4R (중간값 유도 후 1명 거절)
        await playRound(attackerPage, victimPage, 330, 450, 'extend'); // 5R (연장)
        await playRound(attackerPage, victimPage, 350, 420, 'next'); // 6R
        await playRound(attackerPage, victimPage, 380, 400, 'midpoint_accept'); // 7R (중간값 유도 -> 양측 최종 수용!)
        
        console.log('시나리오 C 처리 완료');
    });
});
