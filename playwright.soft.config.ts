import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'tests', testMatch: 'soft-lotus.browser.ts', workers: 1, retries: 0, timeout: 30000,
  use: { baseURL: 'http://127.0.0.1:5318', headless: true,
    launchOptions: process.env.CI ? {} : { executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' },
    trace: 'retain-on-failure' },
  reporter: [['list']],
  webServer: { command: 'npm run preview:soft', url: 'http://127.0.0.1:5318/soft-lotus.html', reuseExistingServer: !process.env.CI },
});
