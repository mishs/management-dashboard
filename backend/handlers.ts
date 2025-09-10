import { http, HttpResponse } from 'msw';
import { Tasks, Task } from './tasks.ts';

const tasksInstance = new Tasks();

export const handlers = [
  http.get('/api/tasks', () => {
    return HttpResponse.json(tasksInstance.getTasks());
  }),
  
  http.post('/api/tasks', async ({ request }) => {
    try {
      const updatedTasks = await request.json();
      tasksInstance.updateTasks(updatedTasks as Partial<Task>[]);
      return HttpResponse.json({ status: 201 });
    } catch (error) {
      return new HttpResponse(null, {
        status: 400,
        statusText: (error as Error).message,
      });
    }
  }),
];