import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import { tasksApi } from './api/tasksApi';
import { saveFailed, saveStarted, saveSucceeded, type MoveIntent } from './slices/tasksSlice';
import type { AppDispatch } from './index';

const serverMessage = (error: FetchBaseQueryError | SerializedError): string | undefined => {
  if ('data' in error && error.data && typeof error.data === 'object' && 'error' in error.data) {
    const message = (error.data as { error?: { message?: unknown } }).error?.message;
    return typeof message === 'string' ? message : undefined;
  }
  return undefined;
};

/**
 * Saves one move and reports the outcome honestly:
 * - success only after the server confirms the committed move;
 * - a 4xx answer means the server refused it (nothing changed);
 * - anything else (lost connection, timeout, server error) means the outcome is
 *   unknown, so we ask the server whether this operation id was committed before
 *   saying anything. Retrying re-sends the same id, so it can never apply twice.
 */
export const saveMove = (intent: MoveIntent) => async (dispatch: AppDispatch) => {
  dispatch(saveStarted(intent));

  const result = await dispatch(
    tasksApi.endpoints.moveTask.initiate({ operationId: intent.operationId, taskId: intent.taskId, toLane: intent.toLane }),
  );
  if ('data' in result && result.data) {
    dispatch(saveSucceeded({ intent, board: result.data }));
    return;
  }

  const error = result.error as FetchBaseQueryError | SerializedError;
  const status = 'status' in error ? error.status : undefined;
  if (typeof status === 'number' && status >= 400 && status < 500) {
    dispatch(saveFailed({ intent, failure: 'rejected', serverMessage: serverMessage(error) }));
    return;
  }

  const check = await dispatch(
    tasksApi.endpoints.getOperation.initiate(intent.operationId, { subscribe: false, forceRefetch: true }),
  );
  if (check.data?.operation?.applied) {
    dispatch(saveSucceeded({ intent, board: check.data }));
  } else if (check.data) {
    dispatch(saveFailed({ intent, failure: 'not-saved', board: check.data }));
  } else {
    dispatch(saveFailed({ intent, failure: 'unconfirmed' }));
  }
};
