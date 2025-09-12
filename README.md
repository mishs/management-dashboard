# My Fancy Dashboard

A modern task management dashboard built with React, TypeScript, and Material-UI featuring drag-and-drop functionality.

## 🚀 Features

- **Drag & Drop**: Intuitive task management with @dnd-kit
- **Three Swim Lanes**: To Do, In Progress, and Completed
- **Real-time Updates**: Redux Toolkit with RTK Query for state management
- **Responsive Design**: Material-UI components with custom theming
- **Type Safety**: Full TypeScript implementation
- **Testing**: Comprehensive test suite with Vitest and React Testing Library
- **Storybook**: Component documentation and development

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Material-UI
- **State Management**: Redux Toolkit, RTK Query
- **Drag & Drop**: @dnd-kit
- **Testing**: Vitest, React Testing Library, Jest DOM
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

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard/       # Main dashboard component
│   ├── SwimLane/       # Swim lane component
│   └── TaskCard/       # Individual task card
├── store/              # Redux store configuration
│   ├── api/            # RTK Query API definitions
│   └── slices/         # Redux slices
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── test/               # Test setup and utilities
```

## 🎯 Key Features

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
- Unit tests for components and utilities
- Integration tests for complex interactions
- Mocked API responses for reliable testing
- High test coverage with meaningful assertions

## 🔧 API Integration

The application uses a mock backend powered by MSW that provides:

- `GET /api/tasks` - Fetch all tasks organized by swim lanes
- `POST /api/tasks` - Update task priorities and swim lane assignments

### Task Data Structure

```typescript
interface Task {
  id: number;
  taskName: string;
  priority: number;
}

interface TaskWithSwimLane extends Task {
  swimLane: number;
}
```

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

Storybook provides:
- Interactive component playground
- Props documentation
- Usage examples
- Accessibility testing
- Visual regression testing setup

## 🚀 Future Enhancements

- [ ] Add task creation functionality
- [ ] Implement task editing
- [ ] Add due dates and labels
- [ ] User authentication
- [ ] Real-time collaboration
- [ ] Advanced filtering and search
- [ ] Performance optimizations
- [ ] PWA capabilities

## 🤝 Contributing

1. Follow the established code style
2. Write tests for new features
3. Update Storybook documentation
4. Ensure TypeScript compliance
5. Run linting and formatting checks

## 📄 License