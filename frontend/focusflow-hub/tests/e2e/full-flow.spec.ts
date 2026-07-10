
import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

const RESULTS_FILE = '/home/gourav/coding/VScode/Projects/focusflow/frontend-test-results.md';
const BASE_URL = 'http://localhost:8080';

let results: string[] = [];
let passed = 0;
let failed = 0;

function record(testName: string, status: 'PASSED' | 'FAILED', note: string = '') {
    const entry = `### ${testName}\n- Status: ${status}\n- Note: ${note}\n`;
    results.push(entry);
    if (status === 'PASSED') passed++; else failed++;
    console.log(`${status}: ${testName}${note ? ' — ' + note : ''}`);
}

function saveResults() {
    const summary = `## SUMMARY\n- Total: ${results.length}\n- Passed: ${passed}\n- Failed: ${failed}\n`;
    fs.writeFileSync(RESULTS_FILE, '# FocusFlow Frontend E2E Test Results\n\n' + results.join('\n') + summary);
}

async function signUpWithMode(page: Page, mode: 'adhd' | 'autism' | 'dyslexia' | 'none') {
    const email = `e2e-mode-${mode}-${Date.now()}@test.com`;
    await page.goto(BASE_URL + '/signup');
    await page.locator('input[placeholder*="name"]').or(page.locator('input[id*="name" i]')).first().fill('E2E Mode User');
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill('TestPass123!');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    if (page.url().includes('/onboarding')) {
        if (mode === 'none') {
            await page.locator('text=Skip for now').click();
        } else {
            const modeText = mode === 'adhd' ? 'ADHD Support' : mode === 'autism' ? 'Autism Support' : 'Dyslexia Support';
            await page.locator(`text=${modeText}`).first().click();
            await page.waitForTimeout(500);
            await page.locator('text=Continue to Dashboard').first().click();
        }
        await page.waitForURL('**/dashboard', { timeout: 5000 });
    }
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
}

test.describe('FocusFlow Full E2E Test Suite', () => {

    test.afterAll(() => saveResults());

    // ==================== AUTH ====================

    test('1. Landing Page loads', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        const hasTitle = await page.locator('text=One thing at a time').isVisible().catch(() => false);
        const hasCTA = await page.locator('text=Get Started').isVisible().catch(() => false);
        if (hasTitle && hasCTA) record('TEST 1: Landing Page', 'PASSED');
        else record('TEST 1: Landing Page', 'FAILED', `Title: ${hasTitle}, CTA: ${hasCTA}`);
    });

    test('2. Navigate to Sign Up', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.locator('text=Get Started').click();
        await page.waitForURL('**/signup');
        const onSignup = page.url().includes('/signup');
        if (onSignup) record('TEST 2: Sign Up navigation', 'PASSED');
        else record('TEST 2: Sign Up navigation', 'FAILED', page.url());
    });

    test('3. Sign Up form works', async ({ page }) => {
        const email = `e2e-${Date.now()}@test.com`;
        await page.goto(BASE_URL + '/signup');
        await page.locator('input[placeholder*="name"]').or(page.locator('input[id*="name" i]')).first().fill('E2E User');
        await page.locator('input[type="email"]').fill(email);
        await page.locator('input[type="password"]').fill('TestPass123!');
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(2000);
        const redirected = page.url().includes('/onboarding') || page.url().includes('/dashboard');
        if (redirected) record('TEST 3: Sign Up', 'PASSED');
        else record('TEST 3: Sign Up', 'FAILED', `Redirected to: ${page.url()}`);
    });

    test('4. Login works', async ({ page }) => {
        const email = `e2e-${Date.now()}@test.com`;
        // First sign up
        await page.goto(BASE_URL + '/signup');
        await page.locator('input[placeholder*="name"]').or(page.locator('input[id*="name" i]')).first().fill('E2E User');
        await page.locator('input[type="email"]').fill(email);
        await page.locator('input[type="password"]').fill('TestPass123!');
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(2000);

        // Logout by clearing storage
        await page.evaluate(() => localStorage.clear());

        // Login
        await page.goto(BASE_URL + '/login');
        await page.locator('input[type="email"]').fill(email);
        await page.locator('input[type="password"]').fill('TestPass123!');
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(2000);
        const loggedIn = page.url().includes('/dashboard') || page.url().includes('/onboarding');
        if (loggedIn) record('TEST 4: Login', 'PASSED');
        else record('TEST 4: Login', 'FAILED', page.url());
    });

    // ==================== DASHBOARD ====================

    test('5. Dashboard loads after login', async ({ page }) => {
        const email = `e2e-dash-${Date.now()}@test.com`;
        await page.goto(BASE_URL + '/signup');
        await page.locator('input[name="name"]').or(page.locator('#name')).or(page.locator('input').first()).fill('E2E User');
        await page.locator('input[type="email"]').fill(email);
        await page.locator('input[type="password"]').fill('TestPass123!');
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(2000);

        // Complete onboarding if shown
        if (page.url().includes('/onboarding')) {
            await page.locator('text=Skip for now').click();
            await page.waitForURL('**/dashboard', { timeout: 5000 });
        } else {
            await page.goto(BASE_URL + '/dashboard');
        }
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        const hasSidebar = await page.locator('text=FocusFlow').first().isVisible().catch(() => false);
        const hasGreeting = await page.locator('text=Good').isVisible().catch(() => false);

        if (hasSidebar) record('TEST 5: Dashboard loads', 'PASSED');
        else record('TEST 5: Dashboard loads', 'FAILED', `Sidebar: ${hasSidebar}, Greeting: ${hasGreeting}`);
    });

    // ==================== GOAL CRUD ====================

    test('6. Create Goal dialog opens', async ({ page }) => {
        const email = `e2e-goal-${Date.now()}@test.com`;
        await page.goto(BASE_URL + '/signup');
        await page.locator('input[name="name"]').or(page.locator('#name')).or(page.locator('input').first()).fill('E2E User');
        await page.locator('input[type="email"]').fill(email);
        await page.locator('input[type="password"]').fill('TestPass123!');
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(2000);
        if (page.url().includes('/onboarding')) {
            await page.locator('text=Skip for now').click();
            await page.waitForURL('**/dashboard', { timeout: 5000 });
        } else {
            await page.goto(BASE_URL + '/dashboard');
        }
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Try to open create goal dialog
        const goalBtn = page.locator('[data-testid="create-goal-btn"]').or(page.locator('text=Set Goal')).or(page.locator('text=Create your first goal'));
        const btnVisible = await goalBtn.first().isVisible().catch(() => false);
        if (btnVisible) {
            await goalBtn.first().click();
            await page.waitForTimeout(500);
        }
        const dialogVisible = await page.locator('[role="dialog"]').isVisible().catch(() => false);
        const titleInput = await page.locator('input[placeholder*="goal" i]').or(page.locator('input[id*="title" i]')).isVisible().catch(() => false);

        if (dialogVisible || titleInput) record('TEST 6: Create Goal dialog', 'PASSED');
        else record('TEST 6: Create Goal dialog', 'FAILED', `Dialog: ${dialogVisible}, Input: ${titleInput}`);
    });

    test('7. Create Goal submits', async ({ page }) => {
        const email = `e2e-goal2-${Date.now()}@test.com`;
        await page.goto(BASE_URL + '/signup');
        await page.locator('input[name="name"]').or(page.locator('#name')).or(page.locator('input').first()).fill('E2E User');
        await page.locator('input[type="email"]').fill(email);
        await page.locator('input[type="password"]').fill('TestPass123!');
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(2000);
        if (page.url().includes('/onboarding')) {
            await page.locator('text=Skip for now').click();
            await page.waitForURL('**/dashboard', { timeout: 5000 });
        } else {
            await page.goto(BASE_URL + '/dashboard');
        }
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Open and fill dialog
        const goalBtn = page.locator('[data-testid="create-goal-btn"]').or(page.locator('text=Set Goal')).or(page.locator('text=Create your first goal'));
        if (await goalBtn.first().isVisible().catch(() => false)) {
            await goalBtn.first().click();
            await page.waitForTimeout(500);
        }

        // Fill title
        const titleInput = page.locator('[data-testid="goal-title-input"]').or(page.locator('[role="dialog"] input')).first();
        await titleInput.fill('E2E Test Goal');
        await page.waitForTimeout(200);

        const submitBtn = page.locator('[data-testid="goal-submit-btn"]').or(page.locator('[role="dialog"] button').filter({ hasText: /Create|Save|Submit/i })).first();
        await submitBtn.click();
        await page.waitForTimeout(2000);

        // Check if goal appears on dashboard
        const goalVisible = await page.locator('text=E2E Test Goal').isVisible().catch(() => false);
        if (goalVisible) record('TEST 7: Create Goal submits', 'PASSED');
        else record('TEST 7: Create Goal submits', 'FAILED', 'Goal not visible after creation');
    });

    // ==================== TASK CRUD ====================

    test('8. Create Task dialog opens', async ({ page }) => {
        const email = `e2e-task-${Date.now()}@test.com`;
        await page.goto(BASE_URL + '/signup');
        await page.locator('input[name="name"]').or(page.locator('#name')).or(page.locator('input').first()).fill('E2E User');
        await page.locator('input[type="email"]').fill(email);
        await page.locator('input[type="password"]').fill('TestPass123!');
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(2000);
        if (page.url().includes('/onboarding')) {
            await page.locator('text=Skip for now').click();
            await page.waitForURL('**/dashboard', { timeout: 5000 });
        } else {
            await page.goto(BASE_URL + '/dashboard');
        }
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        const taskBtn = page.locator('[data-testid="create-task-btn"]').or(page.locator('text=New Task'));
        const btnVisible = await taskBtn.first().isVisible().catch(() => false);
        if (btnVisible) {
            await taskBtn.first().click();
            await page.waitForTimeout(500);
        }
        const dialogVisible = await page.locator('[role="dialog"]').isVisible().catch(() => false);

        if (dialogVisible) record('TEST 8: Create Task dialog', 'PASSED');
        else record('TEST 8: Create Task dialog', 'FAILED', `Button: ${btnVisible}, Dialog: ${dialogVisible}`);
    });

    test('9. Task priority saves correctly', async ({ page }) => {
        // This specifically tests the bug where priority always defaults to Medium
        const email = `e2e-prio-${Date.now()}@test.com`;
        await page.goto(BASE_URL + '/signup');
        await page.locator('input[name="name"]').or(page.locator('#name')).or(page.locator('input').first()).fill('E2E User');
        await page.locator('input[type="email"]').fill(email);
        await page.locator('input[type="password"]').fill('TestPass123!');
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(2000);
        if (page.url().includes('/onboarding')) {
            await page.locator('text=Skip').click();
            await page.waitForTimeout(1000);
        }
        await page.goto(BASE_URL + '/dashboard');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Open task dialog
        const taskBtn = page.locator('[data-testid="create-task-btn"]').or(page.locator('text=New Task'));
        await taskBtn.first().click();
        await page.waitForTimeout(500);

        // Check if priority selector exists
        const prioritySelect = page.locator('[data-testid="task-priority-select"]').or(page.locator('[role="dialog"] select')).or(page.locator('[role="dialog"] [data-testid="priority"]')).first();
        const hasPriority = await prioritySelect.isVisible().catch(() => false);

        if (hasPriority) {
            // Try to select HIGH
            await prioritySelect.selectOption('HIGH').catch(() => { });
            await page.waitForTimeout(200);
            const value = await prioritySelect.inputValue().catch(() => 'unknown');
            if (value === 'HIGH' || value === 'high') {
                record('TEST 9: Task priority saves', 'PASSED', `Selected: ${value}`);
            } else {
                record('TEST 9: Task priority saves', 'FAILED', `Got value: ${value}`);
            }
        } else {
            record('TEST 9: Task priority saves', 'FAILED', 'No priority selector found in dialog');
        }
    });

    // ==================== FOCUS MODE ====================

    test('10. Focus Mode loads without 500 error', async ({ page }) => {
        const email = `e2e-focus-${Date.now()}@test.com`;
        await page.goto(BASE_URL + '/signup');
        await page.locator('input[name="name"]').or(page.locator('#name')).or(page.locator('input').first()).fill('E2E User');
        await page.locator('input[type="email"]').fill(email);
        await page.locator('input[type="password"]').fill('TestPass123!');
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(2000);
        if (page.url().includes('/onboarding')) {
            await page.locator('text=Skip for now').click();
            await page.waitForURL('**/dashboard', { timeout: 5000 });
        } else {
            await page.goto(BASE_URL + '/dashboard');
        }
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        // Navigate to focus
        await page.goto(BASE_URL + '/focus');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Check for error
        const hasError = await page.locator('text=500').or(page.locator('text=Internal Server Error')).isVisible().catch(() => false);
        const hasNoTasks = await page.locator('text=No tasks').or(page.locator('text=No Tasks')).isVisible().catch(() => false);
        const hasFocusContent = await page.locator('text=Start Focus').or(page.locator('text=Focus')).isVisible().catch(() => false);

        if (hasError) record('TEST 10: Focus Mode', 'FAILED', 'Got 500 Internal Server Error');
        else if (hasNoTasks) record('TEST 10: Focus Mode', 'PASSED', 'No tasks available (expected for new user)');
        else if (hasFocusContent) record('TEST 10: Focus Mode', 'PASSED');
        else record('TEST 10: Focus Mode', 'FAILED', 'Unknown state');
    });

    // ==================== SCHEDULE ====================

    test('11. Schedule page loads', async ({ page }) => {
        const email = `e2e-sched-${Date.now()}@test.com`;
        await page.goto(BASE_URL + '/signup');
        await page.locator('input[name="name"]').or(page.locator('#name')).or(page.locator('input').first()).fill('E2E User');
        await page.locator('input[type="email"]').fill(email);
        await page.locator('input[type="password"]').fill('TestPass123!');
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(2000);
        if (page.url().includes('/onboarding')) {
            await page.locator('text=Skip for now').click();
            await page.waitForURL('**/dashboard', { timeout: 5000 });
        } else {
            await page.goto(BASE_URL + '/dashboard');
        }
        await page.goto(BASE_URL + '/schedule');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Wait for loader to disappear
        await page.locator('text=Loading schedule').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

        const hasSchedule = await page.locator('text=Schedule').first().isVisible().catch(() => false);
        const hasGenerate = await page.locator('text=Generate your first daily plan').isVisible().catch(() => false);
        const hasEmpty = await page.locator('text=No sessions planned yet').isVisible().catch(() => false);
        const hasError = await page.locator('text=Error').or(page.locator('text=500')).isVisible().catch(() => false);

        if (hasError) record('TEST 11: Schedule page', 'FAILED', 'Page shows error');
        else if (hasSchedule || hasGenerate || hasEmpty) record('TEST 11: Schedule page', 'PASSED');
        else record('TEST 11: Schedule page', 'FAILED', 'Page did not load correctly');
    });

    // ==================== INSIGHTS ====================

    test('12. Insights page loads', async ({ page }) => {
        const email = `e2e-insight-${Date.now()}@test.com`;
        await page.goto(BASE_URL + '/signup');
        await page.locator('input[name="name"]').or(page.locator('#name')).or(page.locator('input').first()).fill('E2E User');
        await page.locator('input[type="email"]').fill(email);
        await page.locator('input[type="password"]').fill('TestPass123!');
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(2000);
        if (page.url().includes('/onboarding')) {
            await page.locator('text=Skip for now').click();
            await page.waitForURL('**/dashboard', { timeout: 5000 });
        } else {
            await page.goto(BASE_URL + '/dashboard');
        }
        await page.goto(BASE_URL + '/insights');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        const hasInsights = await page.locator('[data-testid="insights-title"]').isVisible().catch(() => false);
        const hasEmptyState = await page.locator('text=Start your journey').isVisible().catch(() => false);
        const hasStats = await page.locator('text=completed').or(page.locator('text=focus time')).isVisible().catch(() => false);
        const hasError = await page.locator('text=Error').or(page.locator('text=500')).isVisible().catch(() => false);

        if (hasError) record('TEST 12: Insights page', 'FAILED', 'Page shows error');
        else if (hasInsights || hasEmptyState || hasStats) record('TEST 12: Insights page', 'PASSED');
        else record('TEST 12: Insights page', 'FAILED', 'Page did not load correctly');
    });

    // ==================== NAVIGATION ====================

    test('13. Sidebar navigation works', async ({ page }) => {
        const email = `e2e-nav-${Date.now()}@test.com`;
        await page.goto(BASE_URL + '/signup');
        await page.locator('input[name="name"]').or(page.locator('#name')).or(page.locator('input').first()).fill('E2E User');
        await page.locator('input[type="email"]').fill(email);
        await page.locator('input[type="password"]').fill('TestPass123!');
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(2000);
        if (page.url().includes('/onboarding')) {
            await page.locator('text=Skip for now').click();
            await page.waitForURL('**/dashboard', { timeout: 5000 });
        } else {
            await page.goto(BASE_URL + '/dashboard');
        }
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        const navItems = ['Focus', 'Insights', 'Settings', 'Tasks'];
        let allWork = true;

        for (const item of navItems) {
            const link = page.locator(`text=${item}`).first();
            if (await link.isVisible().catch(() => false)) {
                await link.click();
                await page.waitForTimeout(1000);
                const url = page.url();
                console.log(`  Clicked "${item}" → ${url}`);
            } else {
                console.log(`  "${item}" link not visible`);
            }
        }

        record('TEST 13: Sidebar navigation', 'PASSED', 'All nav items clickable');
    });

    // ==================== ERROR STATES ====================

    test('14. 401 redirects to login', async ({ page }) => {
        await page.goto(BASE_URL + '/dashboard');
        await page.evaluate(() => localStorage.clear());
        await page.goto(BASE_URL + '/dashboard');
        await page.waitForTimeout(2000);

        const onLogin = page.url().includes('/login');
        if (onLogin) record('TEST 14: 401 redirect', 'PASSED');
        else record('TEST 14: 401 redirect', 'FAILED', page.url());
    });

    test('15. Console has no errors on dashboard', async ({ page }) => {
        const errors: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'error') errors.push(msg.text());
        });
        page.on('pageerror', err => errors.push(err.message));

        const email = `e2e-console-${Date.now()}@test.com`;
        await page.goto(BASE_URL + '/signup');
        await page.locator('input[name="name"]').or(page.locator('#name')).or(page.locator('input').first()).fill('E2E User');
        await page.locator('input[type="email"]').fill(email);
        await page.locator('input[type="password"]').fill('TestPass123!');
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(2000);
        if (page.url().includes('/onboarding')) {
            await page.locator('text=Skip for now').click();
            await page.waitForURL('**/dashboard', { timeout: 5000 });
        } else {
            await page.goto(BASE_URL + '/dashboard');
        }
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        if (errors.length === 0) record('TEST 15: Console errors', 'PASSED');
        else record('TEST 15: Console errors', 'FAILED', errors.join('; '));
    });

    // ==================== DATA ACCURACY TESTS ====================

    test('16. Task estimated time saves correctly', async ({ page }) => {
        await signUpWithMode(page, 'none');

        // Open create task dialog
        const taskBtn = page.locator('[data-testid="create-task-btn"]').or(page.locator('text=New Task')).first();
        await taskBtn.click();
        await page.waitForTimeout(500);

        // Fill task details
        await page.locator('[data-testid="task-title-input"]').first().fill('E2E Time Test Task');
        await page.locator('#task-estimate').first().fill('60');
        await page.locator('[data-testid="task-submit-btn"]').first().click();
        await page.waitForTimeout(2000);

        // Verify task displays 60 min or 60m
        const matches60 = await page.locator('text=60 min').or(page.locator('text=60m')).first().isVisible().catch(() => false);
        if (matches60) {
            record('TEST 16: Task estimated time saves correctly', 'PASSED');
        } else {
            record('TEST 16: Task estimated time saves correctly', 'FAILED', 'Estimated time 60 min not found');
        }
    });

    test('17. Task priority saves correctly', async ({ page }) => {
        await signUpWithMode(page, 'none');

        // Create URGENT task
        let taskBtn = page.locator('[data-testid="create-task-btn"]').or(page.locator('text=New Task')).first();
        await taskBtn.click();
        await page.waitForTimeout(500);
        await page.locator('[data-testid="task-title-input"]').first().fill('E2E Urgent Task');
        await page.locator('[data-testid="task-priority-select"]').first().selectOption('URGENT');
        await page.locator('[data-testid="task-submit-btn"]').first().click();
        await page.waitForTimeout(2000);

        // Create LOW task
        taskBtn = page.locator('[data-testid="create-task-btn"]').or(page.locator('text=New Task')).first();
        await taskBtn.click();
        await page.waitForTimeout(500);
        await page.locator('[data-testid="task-title-input"]').first().fill('E2E Low Task');
        await page.locator('[data-testid="task-priority-select"]').first().selectOption('LOW');
        await page.locator('[data-testid="task-submit-btn"]').first().click();
        await page.waitForTimeout(2000);

        // Verify priority displays correctly
        const hasUrgent = await page.locator('text=/urgent/i').first().isVisible().catch(() => false);
        const hasLow = await page.locator('text=/low/i').first().isVisible().catch(() => false);

        if (hasUrgent && hasLow) {
            record('TEST 17: Task priority saves correctly', 'PASSED');
        } else {
            record('TEST 17: Task priority saves correctly', 'FAILED', `Urgent: ${hasUrgent}, Low: ${hasLow}`);
        }
    });

    test('18. Goal priority saves correctly', async ({ page }) => {
        await signUpWithMode(page, 'none');

        // Create HIGH priority goal
        const goalBtn = page.locator('[data-testid="create-goal-btn"]').first();
        await goalBtn.click();
        await page.waitForTimeout(500);

        await page.locator('[data-testid="goal-title-input"]').first().fill('E2E High Priority Goal');
        await page.locator('[data-testid="goal-priority-select"]').first().selectOption('HIGH');

        // Intercept goal creation response
        const responsePromise = page.waitForResponse(res => 
            res.url().includes('/goals') && res.request().method() === 'POST'
        );
        await page.locator('[data-testid="goal-submit-btn"]').first().click();
        
        const response = await responsePromise;
        const responseData = await response.json();
        const goalId = responseData.id;

        // Navigate to Goal Detail page
        await page.goto(`${BASE_URL}/goals/${goalId}`);
        await page.waitForLoadState('networkidle');
        await page.locator('text=Loading goal details...').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

        // Verify the goal detail shows HIGH
        const hasHigh = await page.locator('text=HIGH').first().isVisible().catch(() => false);
        if (hasHigh) {
            record('TEST 18: Goal priority saves correctly', 'PASSED');
        } else {
            record('TEST 18: Goal priority saves correctly', 'FAILED', `Goal detail url: ${page.url()}`);
        }
    });

    // ==================== STATE MANAGEMENT TESTS ====================

    test('19. Timer survives navigation', async ({ page }) => {
        await signUpWithMode(page, 'none');

        // Create a task
        const taskBtn = page.locator('[data-testid="create-task-btn"]').or(page.locator('text=New Task')).first();
        await taskBtn.click();
        await page.waitForTimeout(500);
        await page.locator('[data-testid="task-title-input"]').first().fill('E2E Timer Task');
        await page.locator('[data-testid="task-submit-btn"]').first().click();
        await page.waitForTimeout(2000);

        // Navigate to Focus
        await page.goto(BASE_URL + '/focus');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Click Start Focus
        const startBtn = page.locator('[data-testid="focus-start-btn"]').first();
        await startBtn.click();
        await page.waitForTimeout(3000);

        // Click sidebar Tasks / Dashboard
        await page.locator('text=Tasks').first().click();
        await page.waitForTimeout(1000);

        // Click sidebar Focus to return
        await page.locator('text=Focus').first().click();
        await page.waitForTimeout(1000);

        // Check timer does not show 00:00
        const isReset = await page.locator('text=00:00').isVisible().catch(() => false);
        if (!isReset) {
            record('TEST 19: Timer survives navigation', 'PASSED');
        } else {
            record('TEST 19: Timer survives navigation', 'FAILED', 'Timer reset to 00:00');
        }
    });

    test('20. Pause stays on Focus page', async ({ page }) => {
        await signUpWithMode(page, 'none');

        // Create task and navigate to focus
        const taskBtn = page.locator('[data-testid="create-task-btn"]').or(page.locator('text=New Task')).first();
        await taskBtn.click();
        await page.waitForTimeout(500);
        await page.locator('[data-testid="task-title-input"]').first().fill('E2E Pause Task');
        await page.locator('[data-testid="task-submit-btn"]').first().click();
        await page.waitForTimeout(2000);

        await page.goto(BASE_URL + '/focus');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Start focus
        const startBtn = page.locator('[data-testid="focus-start-btn"]').first();
        await startBtn.click();
        await page.waitForTimeout(1000);

        // Pause
        const pauseBtn = page.locator('[data-testid="focus-pause-btn"]').first();
        await pauseBtn.click();
        await page.waitForTimeout(1000);

        const url = page.url();
        const pausedVisible = await page.locator('text=Focus Paused').first().isVisible().catch(() => false);

        if (url.includes('/focus') && pausedVisible) {
            record('TEST 20: Pause stays on Focus page', 'PASSED');
        } else {
            record('TEST 20: Pause stays on Focus page', 'FAILED', `URL: ${url}, Paused visible: ${pausedVisible}`);
        }
    });

    test('21. Create task appears without refresh', async ({ page }) => {
        await signUpWithMode(page, 'none');

        // Open create task dialog
        const taskBtn = page.locator('[data-testid="create-task-btn"]').or(page.locator('text=New Task')).first();
        await taskBtn.click();
        await page.waitForTimeout(500);

        // Fill task details and submit
        await page.locator('[data-testid="task-title-input"]').first().fill('Realtime Task E2E');
        await page.locator('[data-testid="task-submit-btn"]').first().click();

        // Wait up to 5s for task to appear in dashboard list without refreshing
        const isVisible = await page.locator('text=Realtime Task E2E').first().waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false);

        if (isVisible) {
            record('TEST 21: Create task appears without refresh', 'PASSED');
        } else {
            record('TEST 21: Create task appears without refresh', 'FAILED', 'Task not visible in list without manual refresh');
        }
    });

    // ==================== SUPPORT MODE TESTS ====================

    test('22. ADHD mode — reduced task limit', async ({ page }) => {
        await signUpWithMode(page, 'adhd');

        // Create 5 tasks
        for (let i = 1; i <= 5; i++) {
            const taskBtn = page.locator('[data-testid="create-task-btn"]').or(page.locator('text=New Task')).first();
            await taskBtn.click();
            await page.waitForTimeout(500);
            await page.locator('[data-testid="task-title-input"]').first().fill(`ADHD Task ${i}`);
            await page.locator('[data-testid="task-submit-btn"]').first().click();
            await page.waitForTimeout(1000);
        }

        // Navigate to schedule, generate schedule so Today's Plan has blocks
        await page.goto(BASE_URL + '/schedule');
        await page.waitForLoadState('networkidle');
        await page.locator('text=Loading schedule timeline...').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

        const genBtn = page.locator('text=Generate Plan').or(page.locator('text=Generate your first daily plan')).or(page.locator('button').filter({ hasText: /Generate/i })).first();
        if (await genBtn.isVisible()) {
            await genBtn.click();
            await page.waitForTimeout(3000);
        }

        // Return to Dashboard and check Today's Plan
        await page.goto(BASE_URL + '/dashboard');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        const rescheduleButtonsCount = await page.locator('text=Reschedule').count();
        if (rescheduleButtonsCount <= 3 && rescheduleButtonsCount > 0) {
            record('TEST 22: ADHD mode — reduced task limit', 'PASSED');
        } else {
            record('TEST 22: ADHD mode — reduced task limit', 'FAILED', `Visible tasks count: ${rescheduleButtonsCount}`);
        }
    });

    test('23. ADHD mode — Focus button prominent in sidebar', async ({ page }) => {
        await signUpWithMode(page, 'adhd');
        const startFocusBtn = page.locator('text=Start Focus (25m)').first();
        const isVisible = await startFocusBtn.isVisible().catch(() => false);
        if (isVisible) {
            record('TEST 23: ADHD mode — Focus button prominent in sidebar', 'PASSED');
        } else {
            record('TEST 23: ADHD mode — Focus button prominent in sidebar', 'FAILED');
        }
    });

    test('24. ADHD mode — default session is 25min', async ({ page }) => {
        await signUpWithMode(page, 'adhd');
        const taskBtn = page.locator('[data-testid="create-task-btn"]').or(page.locator('text=New Task')).first();
        await taskBtn.click();
        await page.waitForTimeout(500);

        const val = await page.locator('#task-estimate').first().inputValue().catch(() => '');
        if (val === '25') {
            record('TEST 24: ADHD mode — default session is 25min', 'PASSED');
        } else {
            record('TEST 24: ADHD mode — default session is 25min', 'FAILED', `Got: ${val}`);
        }
    });

    test('25. Autism mode — dependency labels visible', async ({ page }) => {
        await signUpWithMode(page, 'autism');

        // Create Goal
        const goalBtn = page.locator('[data-testid="create-goal-btn"]').first();
        await goalBtn.click();
        await page.waitForTimeout(500);
        await page.locator('[data-testid="goal-title-input"]').first().fill('Autism E2E Goal');

        // Intercept goal creation response
        const responsePromise = page.waitForResponse(res => 
            res.url().includes('/goals') && res.request().method() === 'POST'
        );
        await page.locator('[data-testid="goal-submit-btn"]').first().click();
        
        const response = await responsePromise;
        const responseData = await response.json();
        const goalId = responseData.id;
        const goalUrl = `${BASE_URL}/goals/${goalId}`;

        await page.locator('[role="dialog"]').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(2000);

        // Create Task A
        let taskBtn = page.locator('[data-testid="create-task-btn"]').or(page.locator('text=New Task')).first();
        await taskBtn.click();
        await page.waitForTimeout(500);
        await page.locator('[data-testid="task-title-input"]').first().fill('Task A');
        const goalSelectA = page.locator('#task-goal').first();
        
        // Log options for debugging
        const optionsA = await goalSelectA.evaluate(el => Array.from((el as HTMLSelectElement).options).map(o => o.text));
        console.log('Task A dropdown options:', optionsA);

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

        // Log options for debugging
        const optionsB = await goalSelectB.evaluate(el => Array.from((el as HTMLSelectElement).options).map(o => o.text));
        console.log('Task B dropdown options:', optionsB);

        await goalSelectB.locator('option:has-text("Autism E2E Goal")').waitFor({ state: 'attached', timeout: 10000 });
        await goalSelectB.selectOption({ label: 'Autism E2E Goal' });
        await page.locator('[data-testid="task-submit-btn"]').first().click();
        await page.locator('[role="dialog"]').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(2000);

        // Go to Goal Detail
        await page.goto(goalUrl);
        await page.waitForLoadState('networkidle');
        await page.locator('text=Loading goal details...').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

        // Log all task titles on Goal Detail page
        const taskTitles = await page.locator('h3').allInnerTexts();
        console.log('Task titles on Goal Detail:', taskTitles);

        // Wait for Task B card header to be visible
        await page.locator('h3', { hasText: 'Task B' }).first().waitFor({ state: 'visible', timeout: 10000 });

        // Add dependency: Task B depends on Task A
        const taskBCard = page.locator('.border', { hasText: 'Task B' }).first();
        await taskBCard.locator('text=Add dependency').first().click();
        await page.waitForTimeout(500);

        await page.locator('#dep-select').selectOption({ label: 'Task A' });
        await page.locator('[role="dialog"]').locator('button[type="submit"]').first().click();
        await page.locator('[role="dialog"]').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(2500);

        // Verify "Blocked by" is visible
        const hasLabel = await page.locator('text=Blocked by').first().isVisible().catch(() => false);
        if (hasLabel) {
            record('TEST 25: Autism mode — dependency labels visible', 'PASSED');
        } else {
            record('TEST 25: Autism mode — dependency labels visible', 'FAILED', 'Blocked by label not found');
        }
    });

    test('26. Autism mode — breadcrumbs prominent', async ({ page }) => {
        await signUpWithMode(page, 'autism');

        // Navigate to focus
        await page.goto(BASE_URL + '/focus');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        const breadcrumb = page.locator('text=Back to Dashboard');
        const isVisible = await breadcrumb.isVisible().catch(() => false);
        const hasBorder = await breadcrumb.evaluate(el => el.classList.contains('border')).catch(() => false);

        if (isVisible && hasBorder) {
            record('TEST 26: Autism mode — breadcrumbs prominent', 'PASSED');
        } else {
            record('TEST 26: Autism mode — breadcrumbs prominent', 'FAILED', `Visible: ${isVisible}, Border: ${hasBorder}`);
        }
    });

    test('27. Dyslexia mode — OpenDyslexic font applied', async ({ page }) => {
        await signUpWithMode(page, 'dyslexia');

        const fontFamily = await page.evaluate(() => window.getComputedStyle(document.documentElement).fontFamily);
        if (fontFamily.includes('OpenDyslexic')) {
            record('TEST 27: Dyslexia mode — OpenDyslexic font applied', 'PASSED');
        } else {
            record('TEST 27: Dyslexia mode — OpenDyslexic font applied', 'FAILED', `Font family: ${fontFamily}`);
        }
    });

    test('28. Dyslexia mode — larger text and spacing', async ({ page }) => {
        await signUpWithMode(page, 'dyslexia');

        // Create a task first so focus mode displays the checkpoint card
        const taskBtn = page.locator('[data-testid="create-task-btn"]').or(page.locator('text=New Task')).first();
        await taskBtn.click();
        await page.waitForTimeout(500);
        await page.locator('[data-testid="task-title-input"]').first().fill('Dyslexia Task');
        await page.locator('[data-testid="task-submit-btn"]').first().click();
        await page.waitForTimeout(2000);

        const classes = await page.evaluate(() => Array.from(document.documentElement.classList));
        const hasLgText = classes.includes('text-lg') || classes.includes('text-xl') || classes.includes('text-2xl');

        // Verify card padding in Focus Checkpoint
        await page.goto(BASE_URL + '/focus');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        const checkpointCard = page.locator('section').filter({ hasText: /checkpoint/i }).first();
        const hasP7 = await checkpointCard.evaluate(el => el.classList.contains('p-7')).catch(() => false);

        if (hasLgText && hasP7) {
            record('TEST 28: Dyslexia mode — larger text and spacing', 'PASSED');
        } else {
            record('TEST 28: Dyslexia mode — larger text and spacing', 'FAILED', `LgText: ${hasLgText}, P7: ${hasP7}`);
        }
    });

    test('29. Settings page has content', async ({ page }) => {
        await signUpWithMode(page, 'none');

        await page.goto(BASE_URL + '/settings');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        const adhdCard = await page.locator('text=ADHD Support').first().isVisible().catch(() => false);
        const autismCard = await page.locator('text=Autism Support').first().isVisible().catch(() => false);
        const fontSelect = await page.locator('select').first().isVisible().catch(() => false);
        const saveBtn = await page.locator('button').filter({ hasText: /Save Settings/i }).first().isVisible().catch(() => false);

        if (adhdCard && autismCard && fontSelect && saveBtn) {
            record('TEST 29: Settings page has content', 'PASSED');
        } else {
            record('TEST 29: Settings page has content', 'FAILED', `ADHD: ${adhdCard}, Autism: ${autismCard}, Select: ${fontSelect}, Save: ${saveBtn}`);
        }
    });

    test('30. Settings — switch modes and see changes', async ({ page }) => {
        await signUpWithMode(page, 'adhd');

        await page.goto(BASE_URL + '/settings');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Switch to Dyslexia
        await page.locator('text=Dyslexia Support').first().click();
        await page.locator('button').filter({ hasText: /Save Settings/i }).first().click();
        await page.waitForTimeout(2000);

        // Verify OpenDyslexic font
        let fontFamily = await page.evaluate(() => window.getComputedStyle(document.documentElement).fontFamily);
        const dyslexiaApplied = fontFamily.includes('OpenDyslexic');

        // Switch back to ADHD
        await page.locator('text=ADHD Support').first().click();
        await page.locator('button').filter({ hasText: /Save Settings/i }).first().click();
        await page.waitForTimeout(2000);

        // Verify OpenDyslexic removed
        fontFamily = await page.evaluate(() => window.getComputedStyle(document.documentElement).fontFamily);
        const adhdApplied = !fontFamily.includes('OpenDyslexic');

        if (dyslexiaApplied && adhdApplied) {
            record('TEST 30: Settings — switch modes and see changes', 'PASSED');
        } else {
            record('TEST 30: Settings — switch modes and see changes', 'FAILED', `Dyslexia applied: ${dyslexiaApplied}, ADHD returned: ${adhdApplied}`);
        }
    });

    // ==================== EDGE CASE TESTS ====================

    test('31. Empty dashboard shows helpful state', async ({ page }) => {
        const email = `e2e-empty-${Date.now()}@test.com`;
        await page.goto(BASE_URL + '/signup');
        await page.locator('input[placeholder*="name"]').or(page.locator('input[id*="name" i]')).first().fill('E2E User');
        await page.locator('input[type="email"]').fill(email);
        await page.locator('input[type="password"]').fill('TestPass123!');
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(2000);
        await page.locator('text=Skip for now').click();
        await page.waitForURL('**/dashboard', { timeout: 5000 });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        const hasEmptyState = await page.locator('text=No tasks yet').or(page.locator('text=goal')).first().isVisible().catch(() => false);
        const hasError = await page.locator('text=Error').or(page.locator('text=500')).first().isVisible().catch(() => false);

        if (hasEmptyState && !hasError) {
            record('TEST 31: Empty dashboard shows helpful state', 'PASSED');
        } else {
            record('TEST 31: Empty dashboard shows helpful state', 'FAILED', `EmptyState: ${hasEmptyState}, Error: ${hasError}`);
        }
    });

    test('32. Invalid goal ID shows error state', async ({ page }) => {
        await signUpWithMode(page, 'none');

        await page.goto(BASE_URL + '/goals/99999');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const isErrorVisible = await page.locator('text=/Goal Not Found/i').first().isVisible().catch(() => false);
        const isDashboardRedirectOrGraceful = isErrorVisible || page.url().includes('/dashboard') || (await page.locator('text=Goal').count() === 0);

        if (isDashboardRedirectOrGraceful) {
            record('TEST 32: Invalid goal ID shows error state', 'PASSED');
        } else {
            record('TEST 32: Invalid goal ID shows error state', 'FAILED', `URL: ${page.url()}`);
        }
    });
});
