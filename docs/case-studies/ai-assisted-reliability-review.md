# Case study: AI-assisted reliability review, telling a timeout from a rejected write

**In one line:** I used Claude Code as a constrained reviewer to find a write-consistency edge case in this React/TypeScript +
Node/SQLite task board. I added a failing regression test for ambiguous HTTP 408 responses, then corrected the failure
classification to reuse the existing operation-status endpoint. I reviewed every diff and ran every check myself before committing.

- **Video walkthrough (88 s):** [Fixing a silent save failure: AI-assisted debugging with Claude Code](https://youtu.be/md7NpRTJ2MA)
- **Decision record:** [ADR 0001](../adr/0001-reconcile-408-write-outcomes.md)
- **Working rules given to the AI:** [`CLAUDE.md`](../../CLAUDE.md)
- **Commits, in order:** rules [`0f4b1e7`](https://github.com/mishs/management-dashboard/commit/0f4b1e7) → failing test [`b044f03`](https://github.com/mishs/management-dashboard/commit/b044f03) → fix [`0d01cd6`](https://github.com/mishs/management-dashboard/commit/0d01cd6)

## The problem

Moves are saved with an operation ID, and the server can say whether that ID was committed (`GET /api/operations/:id`).
The client already used that check when the outcome was unknown, but it treated **every** 4xx as "the server refused it,
nothing changed". A `408 Request Timeout` doesn't prove that. A proxy or gateway can send it after forwarding the request,
and the user would be told "not saved" for a move that was committed.

## The workflow

| Step | Who | What happened | Evidence |
|---|---|---|---|
| 1. Baseline | Me | Branched from `main` @ `501e1bf`; focused tests 6/6, unit 30/30 | baseline log |
| 2. Rules and context | Me | Wrote [`CLAUDE.md`](../../CLAUDE.md): what the app is, write-outcome rules that must not be weakened, how to change code (smallest change, test first, named files only, stop at checkpoints), exact verification commands. It deliberately states the principle, not the answer | commit `0f4b1e7` |
| 3. Bounded review | AI (read-only) | Asked to find any response classification that equates an unsuccessful response with an uncommitted write. **Tools: Read, Grep, Glob only.** It found the 4xx issue, separated HTTP semantics from this API's guarantees, and found a second, separate race condition | prompt + output below |
| 4. Check the AI's claims | Me | Verified each code reference: the API's own 4xx are rolled back or sent before the store runs; the client timeout is 10 s and already reconciles; the status check is a plain read | review notes |
| 5. Decide scope | Me | **408 only.** 409/400/404/413/415 and 429 stay "rejected". No blind retry. The race condition is recorded as a known limitation, not fixed | ADR |
| 6. One failing test | AI (edit **only** the test file; run **only** the focused test) | Added one test using the existing helpers; it failed for the right reason: 1 request instead of 2 | commit `b044f03` |
| 7. Review the test | Me | Read the test, re-ran it myself: 1 failed (the new one), 6 passed | red run |
| 8. Smallest fix | AI (edit **only** `saveMove.ts`; run **only** the focused test) | One condition, `&& status !== 408`, plus an accurate doc comment. It said plainly that it had not run the full suite | commit `0d01cd6` |
| 9. Verify | Me | Focused 7/7 · unit 31/31 · build passes · browser journeys 27/27 (Chromium, Firefox, WebKit) | green run |

Each AI step was a separate Claude Code session started with `--tools` and `--allowedTools`, so file edits were
limited to the named file. Claude Code also allowed read-only `git show`/`git diff` by default. No session was allowed to commit.

## What the AI did vs what I decided

| The AI | Me |
|---|---|
| Read the code and tests and found the 4xx classification gap | Chose what to ask for and constrained the tools and files for each step |
| Separated RFC 9110 semantics from this API's actual guarantees | Checked every code reference it gave before acting on it |
| Found a second race condition (status check overtaking a delayed write) | Decided it was real but out of scope, and recorded it as a limitation |
| Wrote the failing test and the one-line fix | Chose 408 only, kept 429/409 as rejections, rejected an automatic retry |
| Ran the focused test and reported honestly what it hadn't run | Reviewed each diff and ran the full suite, build and browser journeys myself |

## Prompts (verbatim)

**1. Bounded review (read-only)**
> Read `frontend/src/store/saveMove.ts` and `frontend/src/store/saveMove.test.ts` (and `CLAUDE.md` for this repository's rules).
> Do not modify code. Identify any HTTP response classifications that may incorrectly equate an unsuccessful HTTP response with
> a definitively uncommitted state-changing operation. Provide a failure timeline, evidence from the code, a proposed minimum
> regression test, and uncertainty/assumptions. Distinguish protocol semantics from application-specific guarantees. No speculative refactor.

Excerpt of the answer (the failure timeline, verbatim):
> 1. T0: the client sends `POST /api/tasks/0/move` with `op-A` through a proxy.
> 2. T1: the proxy forwards it. The server commits revision 4 and records `op-A` in `operations`.
> 3. T2: the proxy times out or gets reset on the way back and returns its own `408` or `429` with a JSON body.
> 4. T3: `saveMove.ts:36` sees a numeric 4xx and dispatches `rejected`. The board goes back to revision 3 and no `GET /api/operations/op-A` is sent.
> 5. Result: the user is told "rejected, nothing changed" while the move is committed. That breaks the CLAUDE.md rule "if the outcome is unknown, ask the operations endpoint."

The AI listed 429 alongside 408. I kept 429 as a rejection: rate limiters normally refuse before forwarding (see the ADR).

**2. One red test, then stop** (edit only the test file)
> Given the confirmed risk: HTTP 408 may be an ambiguous outcome for a write. Modify only `frontend/src/store/saveMove.test.ts`
> to add one regression test proving the UI reconciles using `GET /api/operations/:id` if the move actually committed. Use existing
> fixtures/helpers. Do not touch production implementation. Run only the focused test and report the failing assertion. Then stop.

**3. Smallest fix, then stop** (edit only `saveMove.ts`)
> Implement the smallest fix in `frontend/src/store/saveMove.ts` so HTTP 408 uses the existing operation reconciliation path, without
> changing the semantics of explicit rejected writes such as HTTP 409. Do not refactor unrelated logic. Show diff; run focused tests.
> Stop for my review. Do not claim success unless commands pass.

## Result

```
Before:  × after a 408 timeout, asks the server and reports "saved" if the move was committed
           → expected "spy" to be called 2 times, but got 1 times
After:   ✓ saveMove (7 tests) · unit 31/31 · build ✓ · browser journeys 27/27
```

The measurable outcome: after an ambiguous 408, the board shows the committed state ("Saved") instead of a false "Not saved",
at the cost of one idempotent status request.

## Limits, stated plainly

- Verified with unit tests, a build and browser journeys against the real local API. Not verified against a deployed proxy that
  returns 408; this app's own server never sends one.
- The race condition found in step 3 remains (see the ADR). It needs a server-side change.

## Reproduce

```bash
git checkout 0f4b1e7 && npx vitest run frontend/src/store/saveMove.test.ts   # rules only: 6 passing tests
git checkout b044f03 && npx vitest run frontend/src/store/saveMove.test.ts   # red: the new 408 test fails
git checkout 0d01cd6 && npx vitest run && npm run build                      # green
```
