# Complexity, Gotchas & Implementation Notes

## Introduction
This document is intended for current and future team members working on the "My Fancy Task Dashboard" codebase. Its purpose is to highlight areas of complexity, non-mainstream implementation details, and known gotchas encountered during development. The goal is to accelerate onboarding, reduce friction, and provide a reference for troubleshooting and future enhancements.

## Objectives
- Summarize non-standard or complex implementation details
- Document known issues, workarounds, and lessons learned
- Help new contributors avoid common pitfalls
- Support maintainability and future scaling

## Areas of Complexity & Gotchas

### 1. Drag-and-Drop with dnd-kit
- dnd-kit is powerful but less mainstream than react-beautiful-dnd; its API and event model differ significantly.
- Handling drag events, overlays, and collision detection requires careful orchestration.
- Edge cases: moving tasks to empty lanes, rapid consecutive moves, and ensuring correct priority recalculation.

### 2. Priority Recalculation & Diffing
- Only affected tasks should be POSTed after reorder/move. Calculating the minimal diff is non-trivial, especially when moving between lanes or reordering within a lane.
- The `calculateAffectedTasks` utility is central but must be kept in sync with business rules.
- Gaps, duplicate priorities, and non-sequential updates can occur if not handled carefully.

### 3. Redux Toolkit & RTK Query
- RTK Query is used for data fetching, but the mock backend means some logic is hard-coded and not representative of production.
- State normalization and cache invalidation are important for scaling but not fully implemented here.
- Optimistic updates are avoided per requirements, but this is not typical in modern UIs.

### 4. MSW Mock Backend
- The mock backend is implemented via MSW and a service worker. It cannot be modified, so all business logic must be handled client-side.
- Debugging MSW can be tricky, especially with network tab and service worker caching.

### 5. Error Handling
- Only basic error notification is implemented. No optimistic rollback or debounce, which is atypical for production apps.
- POST failures must not corrupt local state; this requires careful state management.

### 6. Storybook Integration
- Storybook is set up for component documentation, but some stories may not reflect full app context (e.g., Redux state, MSW handlers).
- Isolating components for stories sometimes required refactoring.

### 7. Playwright E2E Testing
- Playwright is used for E2E, but integration with Vite and MSW required custom setup.
- Some edge cases (race conditions, network latency) are hard to simulate reliably.
- Playwright tests must be run with the app running; this is not automated in CI.

### 8. TypeScript Strictness
- Strict TypeScript is enforced, but some type assertions and casts are needed due to legacy or third-party code.
- Type definitions for tasks and swimlanes must be kept in sync across modules.

### 9. Project Structure & Modularization
- The codebase is modular, but some duplication exists between storybookComponents and components folders.
- Keeping stories, tests, and implementation in sync is an ongoing challenge.

### 10. Known Issues & Workarounds
- Hard-coded mock data instead of real backend/database.
- No CI/CD or automated deployment; manual testing required.
- Accessibility is pointer-based only; keyboard/ARIA DnD is not implemented.
- Some advanced features (filtering, search, real-time updates) are not present.

## Recommendations for Future Work
- Move to a real backend and database for persistence.
- Implement CI/CD and automated test runs.
- Expand accessibility and internationalization.
- Refactor for further modularity and code reuse.
- Document API and architecture for onboarding.

## Conclusion
This document should be updated as the project evolves. Please contribute new learnings, issues, and solutions to help the team and future maintainers.
