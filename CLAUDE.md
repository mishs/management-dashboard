# Working rules for AI-assisted changes

Read this before proposing or making any change in this repository.

## What this app is
A task board: React + TypeScript + Redux Toolkit (RTK Query) in `frontend/`, a Node.js API with SQLite in `server/`.
Moves are saved through `POST /api/tasks/:id/move` with a client-generated **operation ID**. The server applies each
operation ID at most once and exposes `GET /api/operations/:id` to say whether it was committed.

## Write-outcome rules (do not weaken)
- Show "Saved" only after the server confirms the committed move.
- An explicit refusal (e.g. 409, 400, 422) means nothing changed: report "rejected".
- If the outcome is unknown, ask `GET /api/operations/:id` before telling the user anything.
  Never retry blindly; a retry re-sends the same operation ID.

## How to change code here
- Smallest change that satisfies the agreed requirement. No refactors, renames or new dependencies unless asked.
- Test first for behaviour changes: add a failing test that shows the problem, then fix it.
- Use the existing test helpers (`fetchMock`, `json`, `afterMove`, `intent`, `urlOf` in `frontend/src/store/saveMove.test.ts`).
- Touch only the files named in the task. If another file seems to need changing, stop and say why.
- Stop at the checkpoint the task names. A human reviews every diff before it is committed.

## Verify before claiming anything
- Focused: `npx vitest run frontend/src/store/saveMove.test.ts`
- All unit tests: `npx vitest run`
- Build: `npm run build`
- Browser journeys (real API, isolated database): `npm run test:e2e`
Report the exact command and its result. Never describe a change as working unless the command passed in this session.
