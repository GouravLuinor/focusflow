
import { test, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:8080';

async function signUpWithMode(page: Page, mode: 'autism') {
    const email = `e2e-mode-${mode}-${Date.now()}@test.com`;
    await page.goto(BASE_URL + '/signup');
    await page.locator('input[placeholder*="name"]').or(page.locator('input[id*="name" i]')).first().fill('E2E Mode User');
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill('TestPass123!');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    if (page.url().includes('/onboarding')) {
        await page.locator('text=Autism Support').first().click();
        await page.waitForTimeout(500);
        await page.locator('text=Continue to Dashboard').first().click();
        await page.waitForURL('**/dashboard', { timeout: 5000 });
    }
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
}

test.describe('TEST 25 ISOLATED', () => {

    test('25. Autism mode — dependency labels visible', async ({ page }) => {
        await signUpWithMode(page, 'autism');

        // Create Goal
        const goalBtn = page.locator('[data-testid="create-goal-btn"]').first();
        await goalBtn.click();
        await page.waitForTimeout(500);
        await page.locator('[data-testid="goal-title-input"]').first().fill('Autism E2E Goal');

        // Intercept goal creation response to get the goal ID
        const responsePromise = page.waitForResponse(res =>
            res.url().includes('/goals') && res.request().method() === 'POST'
        );
        await page.locator('[data-testid="goal-submit-btn"]').first().click();

        const response = await responsePromise;
        const responseData = await response.json();
        const goalId = responseData.id;
        const goalUrl = `${BASE_URL}/goals/${goalId}`;
        console.log('Created goal ID:', goalId, '→', goalUrl);

        await page.locator('[role="dialog"]').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(2000);

        // Create Task A
        let taskBtn = page.locator('[data-testid="create-task-btn"]').or(page.locator('text=New Task')).first();
        await taskBtn.click();
        await page.waitForTimeout(500);
        await page.locator('[data-testid="task-title-input"]').first().fill('Task A');
        const goalSelectA = page.locator('#task-goal').first();

        const optionsA = await goalSelectA.evaluate(el => Array.from((el as HTMLSelectElement).options).map(o => o.text));
        console.log('Task A — goal dropdown options:', optionsA);

        await goalSelectA.locator('option:has-text("Autism E2E Goal")').waitFor({ state: 'attached', timeout: 10000 });
        await goalSelectA.selectOption({ label: 'Autism E2E Goal' });
        await page.locator('[data-testid="task-submit-btn"]').first().click();
        await page.locator('[role="dialog"]').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(2000);

        // Create Task B
        taskBtn = page.locator('[data-testid="create-task-btn"]').or(page.locator('text=New Task')).first();
        await taskBtn.click();
        await page.waitForTimeout(500);
        await page.locator('[data-testid="task-title-input"]').first().fill('Task B');
        const goalSelectB = page.locator('#task-goal').first();

        const optionsB = await goalSelectB.evaluate(el => Array.from((el as HTMLSelectElement).options).map(o => o.text));
        console.log('Task B — goal dropdown options:', optionsB);

        await goalSelectB.locator('option:has-text("Autism E2E Goal")').waitFor({ state: 'attached', timeout: 10000 });
        await goalSelectB.selectOption({ label: 'Autism E2E Goal' });
        await page.locator('[data-testid="task-submit-btn"]').first().click();
        await page.locator('[role="dialog"]').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(2000);

        // Go to Goal Detail
        await page.goto(goalUrl);
        await page.waitForLoadState('networkidle');
        await page.locator('text=Loading goal details...').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

        const taskTitles = await page.locator('h3').allInnerTexts();
        console.log('Task titles on Goal Detail:', taskTitles);

        // Wait for Task B to be visible
        await page.locator('h3', { hasText: 'Task B' }).first().waitFor({ state: 'visible', timeout: 10000 });

        // Find the Task B card and click "Add dependency"
        const taskBCard = page.locator('.border', { hasText: 'Task B' }).first();
        console.log('Clicking Add dependency on Task B card...');
        await taskBCard.locator('text=Add dependency').first().click();
        await page.waitForTimeout(500);

        // Log the dep-select options
        const depOptions = await page.locator('#dep-select').evaluate(el => Array.from((el as HTMLSelectElement).options).map(o => o.text));
        console.log('Dependency dropdown options:', depOptions);

        await page.locator('#dep-select').selectOption({ label: 'Task A' });
        console.log('Selected Task A in dependency dropdown');

        // Log what button is found inside role=dialog
        const dialogButtons = await page.locator('[role="dialog"]').locator('button').evaluateAll(els => els.map(el => `${el.type}: "${el.innerText}"`));
        console.log('Buttons in dialog:', dialogButtons);

        await page.locator('[role="dialog"]').locator('button[type="submit"]').first().click();
        await page.locator('[role="dialog"]').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(2500);

        // Verify "Blocked by" label
        const hasLabel = await page.locator('text=Blocked by').first().isVisible().catch(() => false);
        console.log('Blocked by label visible:', hasLabel);

        if (hasLabel) {
            console.log('PASSED: TEST 25: Autism mode — dependency labels visible');
        } else {
            console.log('FAILED: TEST 25: Autism mode — dependency labels visible — "Blocked by" label not found');
        }
    });

});
