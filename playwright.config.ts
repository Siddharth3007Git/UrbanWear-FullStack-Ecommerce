import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:5500/pages',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    viewport: { width: 1600, height: 1200 },
    colorScheme: 'light',
  },
  webServer: [
    {
      command: 'cmd /c docker compose up --build',
      url: 'http://127.0.0.1:5500/pages/login.html',
      reuseExistingServer: true,
      timeout: 600000,
    },
  ],
});
