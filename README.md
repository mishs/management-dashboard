
# My Fancy Dashboard

A modern task management dashboard built with React, TypeScript, Material-UI, Redux Toolkit, dnd-kit, and Playwright E2E tests. Implements all requirements from the Combined Specification (see below).

 ## 📹 Demo & Live Link

- [Demo Video](#) <!-- Add your video link here -->
- [Live Project](#) <!-- Add your deployed link here -->


## 🚀 Features (summarised)

- **Drag & Drop**: Intuitive task management with dnd-kit
- **Three Swim Lanes**: To Do, In Progress, Completed
- **Priority Recalculation**: Only affected tasks are reprioritized and POSTed
- **Error Handling**: Notification on failed POST, no optimistic rollback
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
- **Mock API**: MSW (Mock Service Worker)


## 📦 Installation

```bash
npm install
```

## 🏃‍♂️ Development

Start the development server:
```bash
npm run dev
```

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

Playwright test:
```bash
npx playwright test
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


## ✅ What Has Been Done (in relation to 'Evaluation Criteria')
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
    - Priority recalculation (ascending from 1) after drop
    - Only affected tasks POSTed to backend
    - Error notification on failed POST
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
- Move tasks within the same swim lane to reorder
- Move tasks between different swim lanes
- Real-time priority updates
- Optimistic UI updates with error handling

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
- Vitest/React Testing Library for unit/component tests (optional, for maintainability)
- MSW for API mocking


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

- No real backend (data is hard-coded)
- No CI/CD pipeline or automated deployment
- No user authentication or advanced features
- No keyboard/ARIA DnD (pointer DnD only)
- Some advanced tests and monitoring not implemented

## 🔧 API Integration

The application uses a mock backend powered by MSW.

## 🎨 Design System

The application uses Material-UI with a custom theme featuring:
- Consistent color palette
- Typography scale
- Component customizations
- Responsive breakpoints
- Accessibility considerations

## 🧪 Testing

Run the full test suite:
```bash
npm test
```

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

## 🚀 Future Enhancements

- [ ] Move task data to a real backend/database (currently hard-coded for demo)
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
