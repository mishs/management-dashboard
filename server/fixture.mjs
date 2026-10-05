// Synthetic demonstration data (no real people or customer records).
// Seeded only into an empty database, or by the explicit reset script.

export const FIXTURE_TASKS = [
  {id: 0, taskName: 'Design wireframes for dashboard', swimLane: 1, priority: 1, description: 'Create initial wireframes for the task management dashboard', assignee: 'Alex Chen', dueDate: '2024-12-15', tags: ['design', 'wireframes'], priorityLevel: 'High'},
  {id: 1, taskName: 'Implement drag and drop functionality', swimLane: 1, priority: 2, description: 'Add dnd-kit library and implement task reordering', assignee: 'Sarah Kim', dueDate: '2024-12-18', tags: ['development', 'frontend'], priorityLevel: 'High'},
  {id: 2, taskName: 'Set up Redux store', swimLane: 1, priority: 3, description: 'Configure Redux Toolkit with RTK Query for state management', assignee: 'Mike Johnson', dueDate: '2024-12-20', tags: ['development', 'state'], priorityLevel: 'Medium'},
  {id: 3, taskName: 'Create responsive layout', swimLane: 1, priority: 4, description: 'Ensure dashboard works on mobile and tablet devices', assignee: 'Emma Davis', dueDate: '2024-12-22', tags: ['design', 'responsive'], priorityLevel: 'Medium'},
  {id: 4, taskName: 'Write unit tests', swimLane: 1, priority: 5, description: 'Add comprehensive test coverage for components', assignee: 'Tom Wilson', dueDate: '2024-12-25', tags: ['testing', 'quality'], priorityLevel: 'Low'},
  {id: 5, taskName: 'API integration testing', swimLane: 2, priority: 1, description: 'Test mock service worker integration', assignee: 'Lisa Brown', dueDate: '2024-12-16', tags: ['testing', 'api'], priorityLevel: 'High'},
  {id: 6, taskName: 'Performance optimization', swimLane: 2, priority: 2, description: 'Optimize rendering and reduce bundle size', assignee: 'David Lee', dueDate: '2024-12-19', tags: ['performance', 'optimization'], priorityLevel: 'Medium'},
  {id: 7, taskName: 'Documentation review', swimLane: 3, priority: 1, description: 'Review and update project documentation', assignee: 'Anna Taylor', dueDate: '2024-12-14', tags: ['documentation'], priorityLevel: 'Low'},
  {id: 8, taskName: 'Code review process', swimLane: 3, priority: 2, description: 'Establish code review guidelines and process', assignee: 'Chris Anderson', dueDate: '2024-12-17', tags: ['process', 'quality'], priorityLevel: 'Medium'},
];
