
# Fancy Dashboard

A modern task management dashboard built with React, TypeScript, Material-UI, Redux Toolkit, dnd-kit, and Playwright E2E tests. Implements all requirements from the Combined Specification (see below).

 ## 📹 Demo & Live Link

- [Demo Video](#) <!-- Add your video link here -->
- [Live Project](#) <!-- Add your deployed link here -->


## 🚀 Features (summarised)

- **Drag & Drop**: Intuitive task management with dnd-kit
- **Three Swim Lanes**: To Do, In Progress, Completed
- **Saved Moves**: Each move is saved to a local SQLite database and is still there after a reload or a server restart
- **Honest Save Feedback**: "Saving…", "Saved" only after the server confirms, and a clear "Not saved" message with Retry
- **Type Safety**: Strict TypeScript throughout
- **Testing**: Playwright E2E tests for main flows; Vitest/RTL for unit/component
- **Storybook**: Component documentation and development
- **Responsive Design**: Material-UI with custom theming


## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Material-UI
- **State Management**: Redux Toolkit, RTK Query
- **Drag & Drop**: dnd-kit
- **Testing**: Playwright (E2E), Vitest, React Testing Library
- **Documentation**: Storybook
- **Build Tool**: Vite
- **Backend**: small Node.js HTTP API (`server/`) with SQLite via Node's built-in `node:sqlite`


## 📦 Installation

Requires Node.js 22.13 or newer (for the built-in `node:sqlite` module).

```bash
npm install
```

## 🏃‍♂️ Running the app

The board reads and saves tasks through a local API backed by a SQLite file
(`server/data/demo.sqlite`, created on first start and seeded with synthetic demo tasks).

**One process (built UI + API), http://127.0.0.1:3001:**
```bash
npm run build
npm start
```

**Development (two terminals), http://localhost:5173:**
```bash
npm run server   # API on http://127.0.0.1:3001
npm run dev      # Vite dev server; forwards /api to the API
```

Starting the server never overwrites saved changes: demo data is only seeded into an empty database.

### Resetting the demo data

```bash
npm run db:reset:demo
```

This explicitly replaces all tasks in `server/data/demo.sqlite` with the original synthetic fixture
(task 0, "Design wireframes for dashboard", back in To Do). It refuses to touch any database outside
`server/data/` or the test folder `frontend/e2e/.tmp/`, and it never runs automatically.

### How saving works

- Dropping a card sends one move (`POST /api/tasks/:id/move` with `{operationId, toLane}`). The server moves
  the task to the top of the destination lane and renumbers both lanes 1..n in a single transaction, then
  returns the saved board.
- While the move is being saved, the card shows "Saving…" and further moves are paused.
- "Saved" (status line and notification) appears only after the server confirms the committed move.
- If the server answers that the move was refused, or confirms it was not committed, the board returns to
  the last saved state and shows "Not saved" with **Retry**.
- If the answer is lost (connection drop or timeout), the app asks the server whether that operation was
  committed (`GET /api/operations/:id`) before saying anything. If it still cannot tell, it shows
  "Save not confirmed". Retry re-sends the same operation id, which the server applies at most once.
- Invalid task ids, lanes or request bodies are rejected without changing stored data.

Run tests:
```bash
npm test
```

Run tests with UI:
```bash
npm run test:ui
```

Start Storybook:
```bash
npm run storybook
```

Browser (Playwright) tests:
```bash
npm run test:e2e
```


## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/          # Shared React components
│   ├── storybookComponents/ # Storybook-specific components
│   │   └── Dashboard/
│   │       ├── Dashboard.stories.tsx
│   │       ├── Dashboard.tsx
│   │       ├── index.ts
│   │       ├── SavingIndicator/
│   │       │   ├── index.ts
│   │       │   └── SavingIndicator.tsx
│   │       ├── StatisticsSection/
│   │       │   ├── index.ts
│   │       │   └── StatisticsSection.tsx
│   │       ├── SwimLane/
│   │       │   ├── SwimLane.stories.tsx
│   │       │   ├── SwimLane.tsx
│   │       ├── TaskCard/
│   │       │   ├── TaskCard.stories.tsx
│   │       │   ├── TaskCard.tsx
│   ├── store/
│   │   ├── api/             # RTK Query API definitions
│   │   └── slices/          # Redux slices
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── mocks/               # MSW handlers
│   └── test/                # Test setup and utilities
│
├── e2e/                     # Playwright E2E tests
├── .storybook/              # Storybook config
├── public/                  # Static assets, MSW service worker
├── package.json             # Project config
└── README.md                # This file
```


## Implementation Overview
Following attended as shown under 'All Functional requirement and Non-Functional Requirements below:
- **TypeScript** best practices (mainly on API Contracts, Redux, etc)
- Working code demonstrating components (and project) structuring.
- Clarifying your commit history
- Completeness of features
- Correctness: functionality act in sensible and thought-out ways.
- Maintainability: written in a clean and maintainable way
- Testing: system tested beyond basic functionality, with a focus on edge cases and inclusion of Storybook (visual testing etc.)
- Built version in my **public** folder.

  - All Functional requirements:
    - Tasks prefilled from GET /api/tasks
    - Three swimlanes: To Do, In Progress, Completed
    - Drag-and-drop reorder and move between lanes
    - Priority recalculation (ascending from 1) after drop, saved atomically by the server
    - Moves saved to a SQLite-backed API; saved state survives reload and server restart
    - Clear "Not saved" feedback with Retry on a failed save
    - No "Add Task" feature (by design)
  - Non-functional requirements:
    - Strict TypeScript, modular structure
    - Playwright E2E tests for main flows
    - Storybook for component documentation
    - Responsive, accessible UI (pointer DnD)
    - No changes to provided service worker
    - Linting and formatting enforced

## 🏆 Above & Beyond

- Storybook for all major components
    Storybook provides:
    - Interactive component playground
    - Props documentation
    - Accessibility testing
    - Visual regression testing setup
- Proper design system and overal documentation of the project.
- Error handling and notification system
- Clean commit history and code organization
- Accessible UI and UX

  ## 🎯 Key Features (Detailed)

### Drag & Drop Functionality
- Move tasks between swim lanes (the moved task goes to the top of the destination lane)
- Priorities renumbered and saved together on the server
- Pending move shown as "Saving…"; on failure the board returns to the last saved state with Retry

### State Management
- Redux Toolkit for predictable state management
- RTK Query for efficient data fetching and caching
- Typed hooks for type-safe state access

### Component Architecture
- Modular, reusable components
- Separation of concerns
- Props validation with TypeScript
- Comprehensive Storybook documentation


### Testing Strategy
- Playwright E2E tests for acceptance criteria
- Vitest for unit tests (server store and API, save logic, board helpers)
- Browser tests run against the real API and an isolated SQLite file; failures are simulated only by
  Playwright request interception inside the tests (there is no switch in the app to make saves fail)


## ⚡️ Important Uncovered Edge Cases

- Dragging a task to a lane with no tasks (empty lane) and ensuring priorities start at 1
- Rapid consecutive drag-and-drop actions (race conditions, UI sync)
- Handling duplicate task IDs or corrupted data from backend
- POST failure with partial update (should not corrupt local state)
- Browser refresh during drag operation (state persistence)
- Moving a task to the same position (should not trigger unnecessary updates)
- Handling very large numbers of tasks (performance, virtualization)
- Accessibility for users with assistive technologies (beyond pointer DnD)
- Network latency or offline scenarios (sync, error handling)
- Edge cases in priority calculation (e.g., gaps, non-sequential priorities)

## ⚠️ Missing/WIP Implementation

- The API is a local, single-user demonstration backend (no authentication)
- No CI/CD pipeline or automated deployment
- No user authentication or advanced features
- No keyboard/ARIA DnD (pointer DnD only)
- Some advanced tests and monitoring not implemented

## 🔧 API Integration

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/tasks` | Saved board: `{revision, tasks}` |
| POST | `/api/tasks/:id/move` | Save a move: body `{operationId, toLane}` (lane 1, 2 or 3) |
| GET | `/api/operations/:id` | Was this operation committed? (used after a lost response) |
| GET | `/api/health` | Liveness check |

Errors are JSON `{error: {code, message}}` with a plain-language message. The older MSW handlers in
`backend/` and `frontend/src/mocks/` are not used by the running app.

## 🎨 Design System

The application uses Material-UI with a custom theme featuring:
- Consistent color palette
- Typography scale
- Component customizations
- Responsive breakpoints
- Accessibility considerations

## 🧪 Testing

Run the unit tests (server store and API, save logic, helpers):
```bash
npm test
```

Run the browser tests (starts Vite and the real API on an isolated test database):
```bash
npx playwright install chromium firefox webkit   # first time only
npm run test:e2e
```

The browser tests cover: a move confirmed by the server and kept after reload; persistence across an API
restart; the "Saving…" state with overlapping moves blocked; a known failed save (no false "Saved"), then
Retry and reload; a lost response that is reconciled without applying the move twice; invalid requests;
and a load failure with "Try again".

Generate coverage report:
```bash
npm run test:coverage
```

The testing strategy includes:
- Component rendering tests
- User interaction tests
- State management tests
- Utility function tests
- API integration tests

## 📚 Storybook

View component documentation:
```bash
npm run storybook
```

## ⚠️ Current Limitations

- The hosted static site (Netlify) only serves the built UI; it does not run the API, so saving
  works only when the API is running locally (`npm start` or `npm run server`). The deployed site has not
  been changed by this work.
- `node:sqlite` is marked experimental by Node.js (the npm scripts hide its warning).
- One move is saved at a time; other moves wait until the current save finishes.
- Moves between lanes only; reordering within a lane is not supported.
- Storybook stories now need the API to show data; `npm run build-storybook` fails for an unrelated,
  pre-existing reason (`__dirname` in `frontend/.storybook/main.ts`).

## 🚀 Future Enhancements

- [x] Save task moves to a local SQLite-backed API (demo scope; not deployed)
- [ ] Add task creation and editing
- [ ] User authentication and roles
- [ ] Real-time collaboration (WebSockets)
- [ ] Advanced filtering, search, and sorting
- [ ] Performance optimizations (virtualization, lazy loading)
- [ ] PWA/offline capabilities
- [ ] Automated CI/CD (GitHub Actions, etc.)
- [ ] Automated deployment (Vercel, Netlify, etc.)
- [ ] Security hardening (input validation, XSS/CSRF protection)
- [ ] Accessibility improvements (ARIA, keyboard DnD)
- [ ] Internationalization (i18n)
- [ ] End-to-end monitoring and error tracking

## 🏢 SDLC (WIP)

- CI/CD pipeline setup (GitHub Actions) recommended for production
- Automated test runs and code coverage reporting
- Automated deployment to staging/production
- Security audits and dependency management
- Documentation: API, architecture, onboarding guides
- Scalability: Consider state normalization, backend pagination
- Maintainability: Modular code, clear separation of concerns
- Monitoring: Integrate error tracking (Sentry, etc.)

## 🤝 Contributing

1. Follow the established code style
2. Write tests for new features
3. Update Storybook documentation
4. Ensure TypeScript compliance
5. Run linting and formatting checks

## 📄 License
