import { describe, expect, it } from 'vitest';
import { isTaskUpdateList } from './handlers';

describe('isTaskUpdateList', () => {
  const valid = { id: 0, taskName: 'Design wireframes for dashboard', priority: 1, swimLane: 2 };

  it('accepts a list of well-formed task updates', () => {
    expect(isTaskUpdateList([valid])).toBe(true);
    expect(isTaskUpdateList([])).toBe(true);
  });

  it('rejects bodies that are not lists', () => {
    expect(isTaskUpdateList(valid)).toBe(false);
    expect(isTaskUpdateList(null)).toBe(false);
    expect(isTaskUpdateList('[]')).toBe(false);
  });

  it('rejects updates with missing or wrongly typed fields', () => {
    expect(isTaskUpdateList([{ ...valid, id: '0' }])).toBe(false);
    expect(isTaskUpdateList([{ ...valid, id: 1.5 }])).toBe(false);
    expect(isTaskUpdateList([{ ...valid, priority: undefined }])).toBe(false);
    expect(isTaskUpdateList([{ ...valid, taskName: 42 }])).toBe(false);
  });

  it('rejects lanes outside 1-3', () => {
    expect(isTaskUpdateList([{ ...valid, swimLane: 0 }])).toBe(false);
    expect(isTaskUpdateList([{ ...valid, swimLane: 4 }])).toBe(false);
    expect(isTaskUpdateList([{ ...valid, swimLane: '2' }])).toBe(false);
  });
});
