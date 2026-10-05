import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { BoardResponse, LaneId, TaskWithSwimLane } from '../../types';
import { applyMove } from '../../utils/boardHelpers';

export interface MoveIntent {
  operationId: string;
  taskId: number;
  taskName: string;
  fromLane: LaneId;
  toLane: LaneId;
}

/**
 * - not-saved:   the server confirmed the move was not committed.
 * - unconfirmed: no reliable answer (connection lost / timeout); it may or may not be saved.
 *                Retry re-sends the same operation id, which the server de-duplicates.
 * - rejected:    the server refused the move (e.g. invalid request); retrying would not help.
 */
export type SaveFailure = 'not-saved' | 'unconfirmed' | 'rejected';

export type SaveState =
  | { status: 'idle' }
  | { status: 'saving'; intent: MoveIntent }
  | { status: 'saved'; intent: MoveIntent }
  | { status: 'failed'; intent: MoveIntent; failure: SaveFailure; serverMessage?: string };

export interface TasksState {
  /** Last state confirmed by the server - never contains unsaved changes. */
  tasks: TaskWithSwimLane[];
  revision: number;
  loaded: boolean;
  activeTask: string | null;
  save: SaveState;
}

const initialState: TasksState = { tasks: [], revision: -1, loaded: false, activeTask: null, save: { status: 'idle' } };

// An older response must never overwrite a newer confirmed board.
const acceptBoard = (state: TasksState, board: BoardResponse) => {
  if (state.loaded && board.revision < state.revision) return;
  state.tasks = board.tasks;
  state.revision = board.revision;
  state.loaded = true;
};
const isCurrent = (state: TasksState, intent: MoveIntent) =>
  state.save.status !== 'idle' && state.save.intent.operationId === intent.operationId;

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    boardReceived: (state, action: PayloadAction<BoardResponse>) => acceptBoard(state, action.payload),
    setActiveTask: (state, action: PayloadAction<string | null>) => {
      state.activeTask = action.payload;
    },
    saveStarted: (state, action: PayloadAction<MoveIntent>) => {
      state.save = { status: 'saving', intent: action.payload };
    },
    saveSucceeded: (state, action: PayloadAction<{ intent: MoveIntent; board: BoardResponse }>) => {
      acceptBoard(state, action.payload.board);
      if (isCurrent(state, action.payload.intent)) state.save = { status: 'saved', intent: action.payload.intent };
    },
    saveFailed: (
      state,
      action: PayloadAction<{ intent: MoveIntent; failure: SaveFailure; serverMessage?: string; board?: BoardResponse }>,
    ) => {
      const { intent, failure, serverMessage, board } = action.payload;
      if (board) acceptBoard(state, board);
      if (isCurrent(state, intent)) state.save = { status: 'failed', intent, failure, serverMessage };
    },
    dismissSaveStatus: (state) => {
      if (state.save.status !== 'saving') state.save = { status: 'idle' };
    },
  },
});

export const { boardReceived, setActiveTask, saveStarted, saveSucceeded, saveFailed, dismissSaveStatus } =
  tasksSlice.actions;
export default tasksSlice.reducer;

/** What the board shows: confirmed tasks, plus the in-flight move while it is being saved. */
export const selectVisibleTasks = createSelector(
  [(state: { tasks: TasksState }) => state.tasks.tasks, (state: { tasks: TasksState }) => state.tasks.save],
  (tasks, save) => (save.status === 'saving' ? applyMove(tasks, save.intent.taskId, save.intent.toLane) : tasks),
);
