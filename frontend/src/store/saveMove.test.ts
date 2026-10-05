import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeStore, type AppStore } from './index';
import { saveMove } from './saveMove';
import { boardReceived, selectVisibleTasks, type MoveIntent } from './slices/tasksSlice';
import type { BoardResponse, TaskWithSwimLane } from '../types';

const t = (id: number, swimLane: 1 | 2 | 3, priority: number): TaskWithSwimLane => ({ id, taskName: `Task ${id}`, swimLane, priority });
const confirmed: BoardResponse = { revision: 3, tasks: [t(0, 1, 1), t(1, 1, 2), t(5, 2, 1)] };
const afterMove: BoardResponse = {
  revision: 4,
  tasks: [t(1, 1, 1), t(0, 2, 1), t(5, 2, 2)],
  operation: { id: 'op-test-0001', applied: true, replayed: false },
};
const intent: MoveIntent = { operationId: 'op-test-0001', taskId: 0, taskName: 'Task 0', fromLane: 1, toLane: 2 };

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

let store: AppStore;
let fetchMock: ReturnType<typeof vi.fn>;
const urlOf = (input: unknown) => (input instanceof Request ? input.url : String(input));

beforeEach(() => {
  store = makeStore();
  store.dispatch(boardReceived(confirmed));
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

const lane = (lane: number) =>
  selectVisibleTasks(store.getState()).filter((x) => x.swimLane === lane).map((x) => x.id);

describe('saveMove', () => {
  it('shows the move as pending, then saved only after the server confirms it', async () => {
    let answer!: (r: Response) => void;
    fetchMock.mockImplementationOnce(() => new Promise<Response>((resolve) => (answer = resolve)));

    const done = store.dispatch(saveMove(intent));
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(store.getState().tasks.save.status).toBe('saving');
    expect(lane(2)).toEqual([0, 5]); // optimistic view
    expect(store.getState().tasks.tasks.find((x) => x.id === 0)?.swimLane).toBe(1); // confirmed state untouched

    answer(json(200, afterMove));
    await done;
    expect(store.getState().tasks.save.status).toBe('saved');
    expect(store.getState().tasks.revision).toBe(4);
    expect(lane(2)).toEqual([0, 5]);
    expect(urlOf(fetchMock.mock.calls[0][0])).toMatch(/\/api\/tasks\/0\/move$/);
  });

  it('treats a 4xx answer as rejected and returns to the confirmed board', async () => {
    fetchMock.mockResolvedValueOnce(json(409, { error: { code: 'already_in_lane', message: 'The task is already in that lane.' } }));
    await store.dispatch(saveMove(intent));
    const { save } = store.getState().tasks;
    expect(save).toMatchObject({ status: 'failed', failure: 'rejected', serverMessage: 'The task is already in that lane.' });
    expect(lane(1)).toEqual([0, 1]);
    expect(fetchMock).toHaveBeenCalledTimes(1); // no reconciliation needed for an explicit refusal
  });

  it('after a lost response, asks the server and reports "saved" if the move was committed', async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(json(200, { ...afterMove, operation: { id: intent.operationId, applied: true } }));
    await store.dispatch(saveMove(intent));
    expect(urlOf(fetchMock.mock.calls[1][0])).toMatch(/\/api\/operations\/op-test-0001$/);
    expect(store.getState().tasks.save.status).toBe('saved');
    expect(lane(2)).toEqual([0, 5]);
  });

  it('reports "not saved" when the server confirms the move was not committed', async () => {
    fetchMock
      .mockResolvedValueOnce(json(503, { error: { code: 'unavailable', message: 'Unavailable.' } }))
      .mockResolvedValueOnce(json(200, { ...confirmed, operation: { id: intent.operationId, applied: false } }));
    await store.dispatch(saveMove(intent));
    expect(store.getState().tasks.save).toMatchObject({ status: 'failed', failure: 'not-saved' });
    expect(lane(1)).toEqual([0, 1]);
  });

  it('reports "unconfirmed" when the outcome cannot be checked, and Retry re-sends the same operation id', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch')).mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await store.dispatch(saveMove(intent));
    expect(store.getState().tasks.save).toMatchObject({ status: 'failed', failure: 'unconfirmed' });
    expect(lane(1)).toEqual([0, 1]);

    fetchMock.mockResolvedValueOnce(json(200, { ...afterMove, operation: { id: intent.operationId, applied: true, replayed: true } }));
    await store.dispatch(saveMove(intent));
    const retryRequest = fetchMock.mock.calls[2][0] as Request;
    expect(await retryRequest.clone().json()).toEqual({ operationId: 'op-test-0001', toLane: 2 });
    expect(store.getState().tasks.save.status).toBe('saved');
  });

  it('ignores a board older than the one already confirmed', () => {
    store.dispatch(boardReceived(afterMove));
    store.dispatch(boardReceived(confirmed)); // stale response arriving late
    expect(store.getState().tasks.revision).toBe(4);
    expect(lane(2)).toEqual([0, 5]);
  });
});
