### Objective

Your assignment is to implement a simple task dashboard with priorities.

### Brief

Your task is to implement a simple task dashboard called "My Fancy Dashboard".
There should be swim-lanes called "To Do", "In Progress" and "Completed" and the dashboard should be pre-filled with a number of tasks in the column "To Do". A user should be able to drag and drop tasks from one column onto each other.
When the user drops one task only the affected tasks should be reprioritized accordingly. The priority should be numerically ascending starting from 1.

There is no need to implement a "add Task" feature.

### Technical Requirements

We provide you with a boilerplate project that is setup with Vite, React and TypeScript. It also includes a mock backend that you can use to fetch and send data.
This backend runs in a service worker located in the public folder. Please do not change the service worker.

- Use [Redux Toolkit](https://redux-toolkit.js.org/) (and optionally [RTK-Query](https://redux-toolkit.js.org/rtk-query/overview)) as state management / data fetching tool.
- Use [dnd-kit](https://docs.dndkit.com/introduction/installation) for the drag-and-drop functionality
- Use a React UI component library of your choice, e.g. [MUI](https://mui.com/)
- Use a testing library like [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/), [Playwright](https://playwright.dev/) or [Cypress](https://www.cypress.io/) to test your implementation

- When a task is being moved in a swimlane the position is changed and the priority should be updated accordingly. Send _only_ the tasks affected by the reorder process to the provided mock backend.
- It should be possible to move tasks between swimlanes.

- In the Mock folder you'll find a mockup of the dashboard as well as of the re-prioritization process.
- Feel free to style the dashboard according to your esthetical requirements while sticking to the layout of the mockup.

### Mock Backend

The provided mock backend provides two endpoints:

- GET /api/tasks
- POST /api/tasks

The mock backend is implemented using msw and a service worker. It will start automatically when you run the app.

The GET endpoint returns the tasks in the following format:

```js
{
 1: [
	 {
	 id: number,
	 priority: number,
	 taskName: string
	 }
	],
 2: [
	 {
	 id: number,
	 priority: number,
	 taskName: string
	 }
	],
 3: [
	 {
	 id: number,
	 priority: number,
	 taskName: string
	 }
	],
}
```

**Example response of GET /api/tasks**

```js
{
	1:  [
            {
             id: 1,
             priority: 1,
             taskName: "Rebuild Homepage",
             },
             {
             id: 2,
             priority: 2,
             taskName: "Change Banner",
             },
             {
             id: 3,
             priority: 3,
             taskName: "Do something",
             }
		 ],
	2: [],
	3: []
}
```

The payload needs to confirm to the following format:

```js
[
  {
    id: number,
    priority: number,
    taskName: string,
    swimLane: number,
  },
];
```

**Example payload to POST /api/tasks**

```js
[
  {
    id: 2,
    priority: 1,
    taskName: "Task B",
    swimLane: 1,
  },
  {
    id: 3,
    priority: 2,
    taskName: "Task C",
    swimLane: 1,
  },
];
```

### Deliverables

Make sure to include all source code in the repository. To make reviewing easier, include a fully built version of your assignment in a folder named **public**.

### Evaluation Criteria

- **TypeScript** best practices
- We're looking for you to produce working code, with enough room to demonstrate how to structure components in a small program.
- Show us your work through your commit history
- Completeness: did you complete the features?
- Correctness: does the functionality act in sensible, thought-out ways?
- Maintainability: is it written in a clean, maintainable way?
- Testing: is the system adequately tested?

### CodeSubmit

Please organize, design, test and document your code as if it were going into production - then push your changes to the master branch. After you have pushed your code, you may submit the assignment on the assignment page.

All the best and happy coding,

The Klar! Team

