const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 0,
  workers: 1, // 순차적으로 실행하여 계정 충돌 방지
  reporter: 'html',
  use: {
    baseURL: 'https://settlement33.onrender.com', // 실제 서비스되고 있는 렌더 URL
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
