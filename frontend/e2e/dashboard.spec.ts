import { test, expect, type APIRequestContext, type Page } from '@playwright/test';
import { API_URL, Backend, resetDatabase } from './support/backend';

// End-to-end checks through the real browser UI, the real task API and a real
// (isolated) SQLite database. Network failures are simulated only by Playwright
// request interception inside these tests; the app has no "make saves fail" switch.

interface BoardTask { id: number; swimLane: number; priority: number }
interface Board { revision: number; tasks: BoardTask[] }

const backend = new Backend();
test.beforeAll(async () => backend.start());
test.afterAll(async () => backend.stop());
test.beforeEach(async () => {
  await backend.start(); // in case a previous test stopped it
  resetDatabase();
});

const TASK = 0; // "Design wireframes for dashboard"
const card = (page: Page, lane: number, id = TASK) => page.getByTestId(`swim-lane-${lane}`).getByTestId(`task-card-${id}`);
const saveStatus = (page: Page) => page.getByTestId('save-status');
const successToast = (page: Page) => page.locator('[data-sonner-toast][data-type="success"]');

/** Real pointer drag past dnd-kit's 8px activation threshold. */
async function dragTask(page: Page, id: number, lane: number) {
  const from = await page.getByTestId(`task-card-${id}`).first().boundingBox();
  const to = await page.getByTestId(`drop-zone-${lane}`).boundingBox();
  if (!from || !to) throw new Error('card or drop zone not visible');
  const sx = from.x + from.width / 2;
  const sy = from.y + from.height / 2;
  await page.mouse.move(sx, sy);
  await page.mouse.down();
  await page.mouse.move(sx + 14, sy + 4, { steps: 4 });
  await page.mouse.move(to.x + to.width / 2, to.y + Math.min(to.height / 2, 200), { steps: 20 });
  await page.mouse.up();
}

/** What the database holds, read straight from the API (not through the page). */
async function storedBoard(request: APIRequestContext): Promise<Board> {
  const res = await request.get(`${API_URL}/tasks`);
  expect(res.ok()).toBe(true);
  return res.json();
}
const storedTask = (board: Board, id = TASK) => board.tasks.find((t) => t.id === id);

/** Every lane is numbered 1..n with no gaps or duplicates. */
function expectConsistentPriorities(board: Board) {
  for (const lane of [1, 2, 3]) {
    const priorities = board.tasks.filter((t) => t.swimLane === lane).map((t) => t.priority).sort((a, b) => a - b);
    expect(priorities).toEqual(priorities.map((_, i) => i + 1));
  }
}

async function openBoard(page: Page) {
  await page.goto('/');
  await expect(page.getByTestId('dashboard')).toBeVisible();
}

test.describe('My Fancy Task Dashboard', () => {
  test('loads tasks and displays To Do lane', async ({ page }) => {
    await openBoard(page);
    await expect(page.getByRole('heading', { name: 'To Do' })).toBeVisible();
    await expect(card(page, 1)).toContainText('Design wireframes for dashboard');
    await expect(saveStatus(page)).toHaveAttribute('data-state', 'idle');
  });

  // A. Successful movement, confirmed by the server, still there after reload.
  test('drag and drop task between lanes', async ({ page, request }) => {
    await openBoard(page);
    await dragTask(page, TASK, 2);

    await expect(saveStatus(page)).toHaveAttribute('data-state', 'saved');
    await expect(saveStatus(page)).toContainText('Saved. “Design wireframes for dashboard” is now in In Progress.');
    await expect(successToast(page)).toContainText('Saved: “Design wireframes for dashboard” moved to In Progress');

    const stored = await storedBoard(request);
    expect(stored.revision).toBe(1);
    expect(storedTask(stored)).toMatchObject({ swimLane: 2, priority: 1 });
    expectConsistentPriorities(stored);

    await page.reload();
    await expect(card(page, 2)).toBeVisible();
    await expect(card(page, 1)).toHaveCount(0);
    await expect(page.getByTestId(`task-priority-${TASK}`)).toHaveText('Priority: 1');
    await expect(page.getByTestId('lane-task-count-1')).toHaveText('4');
    await expect(page.getByTestId('lane-task-count-2')).toHaveText('3');
  });

  // B. Durable persistence across a backend restart (database not reset).
  test('keeps a saved move after the backend restarts', async ({ page }) => {
    await openBoard(page);
    await dragTask(page, TASK, 2);
    await expect(saveStatus(page)).toHaveAttribute('data-state', 'saved');

    await backend.stop();
    await backend.start();

    await page.reload();
    await expect(card(page, 2)).toBeVisible();
    await expect(card(page, 1)).toHaveCount(0);
  });

  // C. Pending feedback: "saving" is visible, success is not claimed early, and
  //    further moves are paused so saves cannot overlap.
  test('shows saving until the server answers and blocks overlapping moves', async ({ page, request }) => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    let moveRequests = 0;
    await page.route('**/api/tasks/*/move', async (route) => {
      moveRequests += 1;
      await gate; // deterministic delay, test-only
      await route.continue();
    });

    await openBoard(page);
    await dragTask(page, TASK, 2);

    await expect(saveStatus(page)).toHaveAttribute('data-state', 'saving');
    await expect(saveStatus(page)).toContainText('Saving… moving “Design wireframes for dashboard” to In Progress');
    await expect(page.getByTestId(`task-saving-${TASK}`)).toBeVisible();
    await expect(successToast(page)).toHaveCount(0);
    expect(storedTask(await storedBoard(request))).toMatchObject({ swimLane: 1 });

    // A second drag while saving is ignored: no second request, task 1 stays put.
    await dragTask(page, 1, 3);
    await page.waitForTimeout(500);
    expect(moveRequests).toBe(1);
    await expect(card(page, 1, 1)).toBeVisible();

    release();
    await expect(saveStatus(page)).toHaveAttribute('data-state', 'saved');
    await expect(page.getByTestId(`task-saving-${TASK}`)).toHaveCount(0);
    const stored = await storedBoard(request);
    expect(stored.revision).toBe(1);
    expect(storedTask(stored)).toMatchObject({ swimLane: 2, priority: 1 });
    expect(storedTask(stored, 1)).toMatchObject({ swimLane: 1 });
    expect(moveRequests).toBe(1);
  });

  // D + E. Known unsuccessful save, then Retry after the problem is resolved.
  test('shows error notification on failed POST', async ({ page, request }) => {
    // Simulated failure: the save request is answered with 503 before it reaches
    // the API, so it is KNOWN not to be committed (like a gateway outage).
    await page.route('**/api/tasks/*/move', (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: { code: 'unavailable', message: 'The service is temporarily unavailable.' } }),
      }),
    );

    await openBoard(page);
    await dragTask(page, TASK, 2);

    const error = page.getByTestId('save-error');
    await expect(error).toBeVisible();
    await expect(error).toHaveAttribute('role', 'alert');
    await expect(error).toHaveAttribute('data-failure', 'not-saved');
    await expect(error).toContainText('Not saved');
    await expect(error).toContainText('“Design wireframes for dashboard” was not moved to In Progress, so it is still in To Do.');
    await expect(saveStatus(page)).not.toHaveAttribute('data-state', 'saved');
    await expect(successToast(page)).toHaveCount(0);
    await expect(card(page, 1)).toBeVisible(); // back to the last confirmed state
    await expect(card(page, 2)).toHaveCount(0);

    const unchanged = await storedBoard(request);
    expect(unchanged.revision).toBe(0);
    expect(storedTask(unchanged)).toMatchObject({ swimLane: 1, priority: 1 });

    // Problem resolved: Retry (keyboard) re-attempts the intended move.
    await page.unroute('**/api/tasks/*/move');
    await page.getByTestId('save-retry').focus();
    await page.keyboard.press('Enter');

    await expect(saveStatus(page)).toHaveAttribute('data-state', 'saved');
    await expect(page.getByTestId('save-error')).toHaveCount(0);
    await expect(card(page, 2)).toBeVisible();

    await page.reload();
    await expect(card(page, 2)).toBeVisible();
    await expect(page.getByTestId(`task-priority-${TASK}`)).toHaveText('Priority: 1');
    const stored = await storedBoard(request);
    expect(stored.revision).toBe(1);
    expect(storedTask(stored)).toMatchObject({ swimLane: 2, priority: 1 });
    expectConsistentPriorities(stored);
  });

  // F. Uncertain outcome: the server commits but the response is lost, and the
  //    follow-up check cannot get through either. Retry must not apply it twice.
  test('reconciles a lost response without duplicating the move', async ({ page, request }) => {
    await page.route('**/api/tasks/*/move', async (route) => {
      await route.fetch(); // reaches the real API and commits
      await route.abort('failed'); // ...but the browser never sees the answer
    });
    await page.route('**/api/operations/*', (route) => route.abort('failed'));

    await openBoard(page);
    await dragTask(page, TASK, 2);

    const error = page.getByTestId('save-error');
    await expect(error).toHaveAttribute('data-failure', 'unconfirmed');
    await expect(error).toContainText('Save not confirmed');
    await expect(error).toContainText('Retrying is safe: it will not move the task twice.');
    await expect(successToast(page)).toHaveCount(0);

    const committed = await storedBoard(request);
    expect(committed.revision).toBe(1);
    expect(storedTask(committed)).toMatchObject({ swimLane: 2, priority: 1 });

    await page.unrouteAll();
    await page.getByTestId('save-retry').click();
    await expect(saveStatus(page)).toHaveAttribute('data-state', 'saved');

    const after = await storedBoard(request);
    expect(after.revision).toBe(1); // replayed, not applied again
    expect(after.tasks).toEqual(committed.tasks);
    expectConsistentPriorities(after);

    await page.reload();
    await expect(card(page, 2)).toBeVisible();
  });

  test('confirms a committed save via the server when only the response was lost', async ({ page, request }) => {
    await page.route('**/api/tasks/*/move', async (route) => {
      await route.fetch();
      await route.abort('failed');
    });

    await openBoard(page);
    await dragTask(page, TASK, 2);

    await expect(saveStatus(page)).toHaveAttribute('data-state', 'saved');
    await expect(page.getByTestId('save-error')).toHaveCount(0);
    expect((await storedBoard(request)).revision).toBe(1);
  });

  // G. Invalid requests are rejected without changing stored data.
  test('rejects invalid task and lane requests without changing data', async ({ request }) => {
    const before = await storedBoard(request);
    const post = (taskId: string, data: unknown) => request.post(`${API_URL}/tasks/${taskId}/move`, { data });
    expect((await post('0', { operationId: 'op-e2e-invalid-1', toLane: 5 })).status()).toBe(400);
    expect((await post('999', { operationId: 'op-e2e-invalid-2', toLane: 2 })).status()).toBe(404);
    expect((await post('abc', { operationId: 'op-e2e-invalid-3', toLane: 2 })).status()).toBe(400);
    expect((await post('0', { toLane: 2 })).status()).toBe(400);
    expect((await post('5', { operationId: 'op-e2e-invalid-4', toLane: 2 })).status()).toBe(409);
    expect(await storedBoard(request)).toEqual(before);
  });

  test('explains a load failure and recovers with Try again', async ({ page }) => {
    await backend.stop();
    await page.goto('/');
    await expect(page.getByTestId('load-error')).toContainText("We couldn't load your tasks");
    await expect(page.getByTestId('dashboard')).toHaveCount(0); // not shown as an empty board

    await backend.start();
    await page.getByTestId('load-retry').click();
    await expect(card(page, 1)).toBeVisible();
  });
});
