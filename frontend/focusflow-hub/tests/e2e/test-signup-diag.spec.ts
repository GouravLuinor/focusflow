import { test, expect } from '@playwright/test';

test('diagnose signup form submission', async ({ page }) => {
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));

  await page.goto('http://127.0.0.1:8080/signup');
  await page.waitForLoadState('networkidle');

  await page.fill('#name', 'Diagnostic User');
  await page.fill('#email', `diag_${Date.now()}@example.com`);
  await page.fill('#password', 'Password123!');

  const [response] = await Promise.all([
    page.waitForResponse(res => res.url().includes('/auth/signup')),
    page.click('button[type="submit"]'),
  ]);

  console.log('Signup Response Status:', response.status());
  const body = await response.text();
  console.log('Signup Response Body:', body);

  await page.waitForTimeout(2000);
  console.log('Current URL after submit:', page.url());
  await page.screenshot({ path: 'screenshots/diag_after_signup.png' });
});
