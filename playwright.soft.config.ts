import { defineConfig } from '@playwright/test';
const release=process.env.PORTFOLIO_RELEASE==='1';
const remote=process.env.PORTFOLIO_BASE_URL;
export default defineConfig({
  testDir: 'tests', testMatch: ['soft-lotus.browser.ts', 'lotus-type.browser.ts', 'lotus-continuity.browser.ts', 'lotus-contrast.browser.ts', 'lotus-opening.browser.ts'], workers: 1, retries: 0, timeout: 30000,
  use: { baseURL: remote || (release ? 'http://127.0.0.1:5319' : 'http://127.0.0.1:5318'), headless: true,
    launchOptions: { ...(process.env.CI ? {} : { executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), ...(process.env.PORTFOLIO_WEBGL === 'software' ? { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } : {}) },
    trace: 'retain-on-failure' },
  reporter: [['list']],
  webServer: remote ? undefined : { command: release ? 'node scripts/serve.mjs dist 5319' : 'npm run preview:soft', url: release ? 'http://127.0.0.1:5319/index.html' : 'http://127.0.0.1:5318/soft-lotus.html', reuseExistingServer: !process.env.CI },
});
