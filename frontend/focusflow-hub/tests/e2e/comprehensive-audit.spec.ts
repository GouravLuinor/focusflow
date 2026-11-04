import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOT_DIR = '/home/gourav/coding/VScode/Projects/focusflow/screenshots';
const BASE_URL = 'http://127.0.0.1:8080';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

interface AuditFinding {
  phase: string;
  testName: string;
  status: 'PASSED' | 'FAILED' | 'WARNING';
  details: string;
  consoleErrors: string[];
  networkErrors: string[];
  screenshot?: string;
}

const auditFindings: AuditFinding[] = [];

async function captureState(
  page: Page,
  phase: string,
  testName: string,
  consoleErrors: string[],
  networkErrors: string[],
  status: 'PASSED' | 'FAILED' | 'WARNING',
  details: string,
  screenshotPrefix: string
) {
  const filename = `${screenshotPrefix}_${testName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.png`;
  const fullPath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: fullPath, fullPage: true }).catch(() => {});
  
  auditFindings.push({
    phase,
    testName,
    status,
    details,
    consoleErrors: [...consoleErrors],
    networkErrors: [...networkErrors],
    screenshot: filename,
  });
  console.log(`[${phase}] ${testName}: ${status} - ${details}`);
}

test.describe('FocusFlow Deep End-to-End Browser Audit', () => {

  test('Complete System Flow Audit across all Pages, Support Modes, and Features', async ({ page }) => {
    test.setTimeout(180000);
    const consoleErrors: string[] = [];
    const networkErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('response', response => {
      if (response.status() >= 400 && !response.url().includes('/auth/login')) {
        networkErrors.push(`${response.status()} on ${response.url()}`);
      }
    });

    // ─── 1. Landing Page Audit ───────────────────────────────────────
    await page.goto(BASE_URL + '/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const hasLandingTitle = await page.locator('text=FocusFlow').first().isVisible();
    const hasHero = await page.locator('text=One thing at a time').first().isVisible();
    const hasGetStarted = await page.locator('text=Get Started').first().isVisible();
    
    await captureState(
      page,
      'Phase 6.1 Landing',
      'Landing Page Visual & Navigation',
      consoleErrors,
      networkErrors,
      (hasLandingTitle && hasHero && hasGetStarted) ? 'PASSED' : 'FAILED',
      `Title visible: ${hasLandingTitle}, Hero: ${hasHero}, CTA: ${hasGetStarted}`,
      '01_landing'
    );

    // ─── 2. Signup Flow Audit ─────────────────────────────────────────
    const testEmail = `audit-${Date.now()}@example.com`;
    await page.locator('text=Get Started').first().click();
    await page.waitForURL('**/signup', { timeout: 5000 });
    await page.waitForTimeout(500);

    await page.locator('input[placeholder*="name"]').or(page.locator('input[id*="name" i]')).first().fill('Audit User');
    await page.locator('input[type="email"]').fill(testEmail);
    await page.locator('input[type="password"]').fill('SecurePass123!');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1500);

    const isAtOnboarding = page.url().includes('/onboarding');
    await captureState(
      page,
      'Phase 6.1 Auth',
      'Signup & Redirect to Onboarding',
      consoleErrors,
      networkErrors,
      isAtOnboarding ? 'PASSED' : 'FAILED',
      `Redirected to /onboarding: ${isAtOnboarding}, URL: ${page.url()}`,
      '02_signup_onboarding'
    );

    // ─── 3. Onboarding Mode Selection (ADHD) ─────────────────────────
    if (isAtOnboarding) {
      const adhdCard = page.locator('text=ADHD Support').first();
      await adhdCard.click();
      await page.waitForTimeout(300);
      const continueBtn = page.locator('[data-testid="onboarding-submit-btn"]').or(page.locator('text=Enter Workspace')).or(page.locator('text=Continue to Dashboard')).first();
      await continueBtn.click();
      await page.waitForURL('**/dashboard', { timeout: 8000 });
    }

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const isAtDashboard = page.url().includes('/dashboard');
    const hasGreeting = await page.locator('text=Audit User').or(page.locator('text=Good')).first().isVisible().catch(() => false);
    const hasEmptyState = await page.locator('text=No tasks ready').or(page.locator('text=Start your journey')).or(page.locator('text=What do you want to accomplish')).first().isVisible().catch(() => false);

    await captureState(
      page,
      'Phase 6.2 Dashboard Empty',
      'ADHD Dashboard Initial State',
      consoleErrors,
      networkErrors,
      (isAtDashboard && (hasGreeting || hasEmptyState)) ? 'PASSED' : 'WARNING',
      `Dashboard reachable: ${isAtDashboard}, Greeting: ${hasGreeting}, EmptyState: ${hasEmptyState}`,
      '03_dashboard_empty'
    );

    // ─── 4. Create Goal ──────────────────────────────────────────────
    const createGoalBtn = page.locator('[data-testid="create-goal-btn"]').or(page.locator('text=Create First Goal')).or(page.locator('text=Set a Goal')).first();
    let createdGoalId: number | null = null;

    if (await createGoalBtn.isVisible()) {
      await createGoalBtn.click();
      await page.waitForTimeout(500);

      const titleInput = page.locator('[data-testid="goal-title-input"]').or(page.locator('input[placeholder*="goal" i]')).first();
      await titleInput.fill('Master Distributed Systems');

      const responsePromise = page.waitForResponse(res =>
        res.url().includes('/goals') && res.request().method() === 'POST'
      );

      const submitGoalBtn = page.locator('[data-testid="goal-submit-btn"]').or(page.locator('button[type="submit"]')).first();
      await submitGoalBtn.click();

      try {
        const response = await responsePromise;
        const data = await response.json();
        createdGoalId = data.id;
      } catch (e) {
        console.error('Goal creation response error:', e);
      }

      await page.waitForTimeout(1500);
    }

    await captureState(
      page,
      'Phase 6.2 Goal CRUD',
      'Create Goal Dialog Submission',
      consoleErrors,
      networkErrors,
      createdGoalId ? 'PASSED' : 'FAILED',
      `Goal created with ID: ${createdGoalId}`,
      '04_goal_created'
    );

    // ─── 5. Create Multiple Tasks under the Goal ──────────────────────
    let task1Id: number | null = null;
    let task2Id: number | null = null;

    // Task 1
    const createTaskBtn = page.locator('[data-testid="create-task-btn"]').or(page.locator('text=New Task')).first();
    if (await createTaskBtn.isVisible()) {
      await createTaskBtn.click();
      await page.waitForTimeout(500);

      await page.locator('[data-testid="task-title-input"]').or(page.locator('input[placeholder*="task" i]')).first().fill('Read Raft Consensus Paper');
      
      const goalSelect = page.locator('#task-goal').or(page.locator('select')).first();
      if (await goalSelect.isVisible() && createdGoalId) {
        await goalSelect.selectOption({ value: String(createdGoalId) }).catch(() => {});
      }

      const taskResPromise = page.waitForResponse(res =>
        res.url().includes('/tasks') && res.request().method() === 'POST'
      );
      await page.locator('[data-testid="task-submit-btn"]').or(page.locator('button[type="submit"]')).first().click();

      try {
        const res = await taskResPromise;
        const data = await res.json();
        task1Id = data.id;
      } catch (e) {}
      await page.waitForTimeout(1500);
    }

    // Task 2
    if (await createTaskBtn.isVisible()) {
      await createTaskBtn.click();
      await page.waitForTimeout(500);

      await page.locator('[data-testid="task-title-input"]').or(page.locator('input[placeholder*="task" i]')).first().fill('Implement Leader Election in Go');
      
      const goalSelect = page.locator('#task-goal').or(page.locator('select')).first();
      if (await goalSelect.isVisible() && createdGoalId) {
        await goalSelect.selectOption({ value: String(createdGoalId) }).catch(() => {});
      }

      const taskResPromise = page.waitForResponse(res =>
        res.url().includes('/tasks') && res.request().method() === 'POST'
      );
      await page.locator('[data-testid="task-submit-btn"]').or(page.locator('button[type="submit"]')).first().click();

      try {
        const res = await taskResPromise;
        const data = await res.json();
        task2Id = data.id;
      } catch (e) {}
      await page.waitForTimeout(1500);
    }

    await captureState(
      page,
      'Phase 6.2 Task CRUD',
      'Create 2 Tasks under Goal',
      consoleErrors,
      networkErrors,
      (task1Id && task2Id) ? 'PASSED' : 'FAILED',
      `Task 1 ID: ${task1Id}, Task 2 ID: ${task2Id}`,
      '05_tasks_created'
    );

    // ─── 6. Goal Detail Page & Workflow Order ────────────────────────
    if (createdGoalId) {
      await page.goto(`${BASE_URL}/goal/${createdGoalId}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      const hasWorkflow = await page.locator('text=Workflow').first().isVisible().catch(() => false);
      const hasTask1 = await page.locator('text=Read Raft Consensus Paper').first().isVisible().catch(() => false);
      const hasTask2 = await page.locator('text=Implement Leader Election in Go').first().isVisible().catch(() => false);

      await captureState(
        page,
        'Phase 6.3 Goal Detail',
        'Goal Detail Workflow List View',
        consoleErrors,
        networkErrors,
        (hasWorkflow && hasTask1 && hasTask2) ? 'PASSED' : 'WARNING',
        `Workflow section: ${hasWorkflow}, Task 1: ${hasTask1}, Task 2: ${hasTask2}`,
        '06_goal_detail_list'
      );

      // Graph View Toggle
      const graphBtn = page.locator('button:has-text("Graph")').first();
      if (await graphBtn.isVisible()) {
        await graphBtn.click();
        await page.waitForTimeout(1000);

        const hasSvgGraph = await page.locator('svg').first().isVisible().catch(() => false);
        await captureState(
          page,
          'Phase 6.3 Goal Graph',
          'Goal Detail Workflow Graph View',
          consoleErrors,
          networkErrors,
          hasSvgGraph ? 'PASSED' : 'WARNING',
          `SVG Graph rendered: ${hasSvgGraph}`,
          '07_goal_detail_graph'
        );
      }
    }

    // ─── 7. Schedule Page Audit ──────────────────────────────────────
    await page.goto(BASE_URL + '/schedule');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const generatePlanBtn = page.locator('button:has-text("Generate Today\'s Plan")').or(page.locator('button:has-text("Generate")')).first();
    if (await generatePlanBtn.isVisible()) {
      await generatePlanBtn.click();
      await page.waitForTimeout(2000);
    }

    const hasTimeline = await page.locator('text=Today\'s Timeline').or(page.locator('text=Why This Plan')).first().isVisible().catch(() => false);
    await captureState(
      page,
      'Phase 6.4 Schedule View',
      'Schedule Generation & Timeline Rendering',
      consoleErrors,
      networkErrors,
      hasTimeline ? 'PASSED' : 'WARNING',
      `Timeline rendered: ${hasTimeline}`,
      '08_schedule_view'
    );

    // ─── 8. Focus Mode Audit ─────────────────────────────────────────
    if (task1Id) {
      await page.goto(`${BASE_URL}/focus/${task1Id}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      const hasFocusHeader = await page.locator('text=Read Raft Consensus Paper').first().isVisible().catch(() => false);
      const startFocusBtn = page.locator('button:has-text("Start Focus")').or(page.locator('button:has-text("Start")')).first();
      const hasStartBtn = await startFocusBtn.isVisible().catch(() => false);

      if (hasStartBtn) {
        await startFocusBtn.click();
        await page.waitForTimeout(2000);
      }

      const hasTimerRunning = await page.locator('button:has-text("Pause")').or(page.locator('button:has-text("Complete")')).first().isVisible().catch(() => false);

      await captureState(
        page,
        'Phase 6.5 Focus Mode',
        'Single Task Focus Session Execution',
        consoleErrors,
        networkErrors,
        (hasFocusHeader && (hasStartBtn || hasTimerRunning)) ? 'PASSED' : 'WARNING',
        `Focus header: ${hasFocusHeader}, Timer active: ${hasTimerRunning}`,
        '09_focus_mode'
      );

      // Complete the session
      const completeBtn = page.locator('button:has-text("Complete")').first();
      if (await completeBtn.isVisible()) {
        await completeBtn.click();
        await page.waitForTimeout(1500);
      }
    }

    // ─── 9. Insights Page Audit ──────────────────────────────────────
    await page.goto(BASE_URL + '/insights');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const hasInsightsHeader = await page.locator('[data-testid="insights-title"]').or(page.locator('text=Insights')).first().isVisible().catch(() => false);
    const hasWeeklyChart = await page.locator('text=This Week').or(page.locator('text=Weekly Completion')).first().isVisible().catch(() => false);
    const hasAccuracyRing = await page.locator('text=Estimation Accuracy').first().isVisible().catch(() => false);

    await captureState(
      page,
      'Phase 6.6 Insights',
      'Insights Analytics & Charts',
      consoleErrors,
      networkErrors,
      (hasInsightsHeader && (hasWeeklyChart || hasAccuracyRing)) ? 'PASSED' : 'WARNING',
      `Insights header: ${hasInsightsHeader}, Charts rendered: ${hasWeeklyChart}`,
      '10_insights'
    );

    // ─── 10. Settings & Theming Audit ────────────────────────────────
    await page.goto(BASE_URL + '/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const hasSettingsTitle = await page.locator('text=Personalization Settings').first().isVisible().catch(() => false);
    const darkBtn = page.locator('button:has-text("Dark")').first();
    if (await darkBtn.isVisible()) {
      await darkBtn.click();
      await page.waitForTimeout(500);
    }

    const isDarkApplied = await page.evaluate(() => document.documentElement.classList.contains('dark'));

    await captureState(
      page,
      'Phase 6.6 Settings',
      'Settings & Dark Mode Toggle',
      consoleErrors,
      networkErrors,
      (hasSettingsTitle && isDarkApplied) ? 'PASSED' : 'WARNING',
      `Settings header: ${hasSettingsTitle}, Dark mode applied: ${isDarkApplied}`,
      '11_settings_dark_mode'
    );

    // Write audit findings JSON
    fs.writeFileSync(
      '/home/gourav/coding/VScode/Projects/focusflow/browser_audit_results.json',
      JSON.stringify(auditFindings, null, 2)
    );
  });
});
