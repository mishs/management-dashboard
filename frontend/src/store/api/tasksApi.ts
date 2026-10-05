import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BoardResponse, MoveRequest } from '../../types';

/** A save that has not answered within this time is treated as "outcome unknown" and reconciled. */
export const REQUEST_TIMEOUT_MS = 10_000;

export const tasksApi = createApi({
  reducerPath: 'tasksApi',
  // Same-origin API (absolute so it also resolves outside a browser page, e.g. in unit tests).
  baseQuery: fetchBaseQuery({ baseUrl: `${globalThis.location?.origin ?? ''}/api`, timeout: REQUEST_TIMEOUT_MS }),
  refetchOnFocus: false,
  refetchOnReconnect: false,
  endpoints: (builder) => ({
    getTasks: builder.query<BoardResponse, void>({
      query: () => '/tasks',
      keepUnusedDataFor: 0,
    }),
    moveTask: builder.mutation<BoardResponse, MoveRequest>({
      query: ({ taskId, operationId, toLane }) => ({
        url: `/tasks/${taskId}/move`,
        method: 'POST',
        body: { operationId, toLane },
      }),
    }),
    // Asks whether a specific move was committed (used after a lost response).
    getOperation: builder.query<BoardResponse, string>({
      query: (operationId) => `/operations/${encodeURIComponent(operationId)}`,
      keepUnusedDataFor: 0,
    }),
  }),
});

export const { useGetTasksQuery } = tasksApi;
