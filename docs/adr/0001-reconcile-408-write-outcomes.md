# ADR 0001: Treat HTTP 408 on a move as an unknown outcome, not a rejection

- **Status:** Accepted
- **Date:** 2026-10-20
- **Deciders:** Misheck Siwela (AI-assisted review; see [the case study](../case-studies/ai-assisted-reliability-review.md))
- **Code:** `frontend/src/store/saveMove.ts`, test in `frontend/src/store/saveMove.test.ts`

## Context

Moving a task sends `POST /api/tasks/:id/move` with a client-generated operation ID. The server applies each
operation ID at most once and answers `GET /api/operations/:id` with whether it was committed.

`saveMove` turns the response into what the user is told:

| Response | Before | Meaning to the user |
|---|---|---|
| 2xx | saved | "Saved" |
| any 4xx | **rejected**, no check | "Not saved: the server refused it" |
| lost connection, client timeout, 5xx | ask `GET /api/operations/:id` | "Saved", "Not saved" or "Couldn't confirm" |

This API's own 4xx answers really are refusals. 400, 413 and 415 are sent before the store runs; 404 and 409 are
thrown inside a transaction that rolls back.

**The problem:** a 4xx is not always sent by this API. A proxy, gateway or load balancer in front of it can answer
`408 Request Timeout` after it has already forwarded the request. If the server committed the move, the user is told
it was refused, so they may move the task again or stop trusting the board.

RFC 9110 says a 408 means the server did not receive a complete request in time, so the origin usually did not process it.
But the client cannot tell which hop produced the 408, and this application's guarantee ("rejected means nothing changed")
only holds for responses the API itself sends.

## Decision

Exclude 408 from the "definite rejection" branch. A 408 now takes the existing reconciliation path, `GET /api/operations/:id`,
exactly like a lost connection or a 5xx.

```diff
-  if (typeof status === 'number' && status >= 400 && status < 500) {
+  if (typeof status === 'number' && status >= 400 && status < 500 && status !== 408) {
```

## Alternatives considered

| Option | Why not |
|---|---|
| Keep treating 408 as a rejection | It can tell the user "not saved" for a committed move, breaking the rule that we only report what we know |
| Retry the move automatically on 408 | It hides the ambiguity, adds load, and still needs the same check to report the result. The operation ID makes a retry safe, but a check is cheaper and says what happened |
| Allowlist the API's documented refusals (400, 404, 409, 413, 415) and reconcile every other 4xx | More principled, but it changes behaviour for every other 4xx and would conflict with separate sign-in work (401/403). Kept as a follow-up option |
| Also reconcile 429 | Rate limiters normally refuse before forwarding, so a 429 is good evidence nothing changed. Not changed without a concrete case |

## Consequences

- **Good:** a 408 can no longer make the board claim a committed move failed. The cost is at most one extra GET, which is idempotent.
- **Unchanged:** 400, 404, 409, 413, 415 and 429 are still reported as rejected without a check (existing test kept).
- **Known limitation (not fixed here):** after a client timeout, the status check can reach the server *before* a delayed
  write does. The check then answers "not applied" and the write commits a moment later. `getOperation` is a read and does not
  stop a later commit (`server/store.mjs`). Fixing this needs a server-side change, e.g. recording queried operation IDs so a late
  write is refused, or reporting "pending" rather than "not saved". It was found in the same review and deliberately left out of scope.

## Verification

- New regression test `after a 408 timeout, asks the server and reports "saved" if the move was committed`: failed before the fix
  (1 request instead of 2), passes after.
- `npx vitest run`: 31/31. `npm run build`: passes. `npm run test:e2e`: 27/27 browser journeys (Chromium, Firefox, WebKit).
- Not verified: a real proxy returning 408 in a deployed environment. This app's own server never sends 408.
