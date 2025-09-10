import { http, HttpResponse } from 'msw';
import { Tasks } from './tasks.ts';

const tasksInstance = new Tasks();
export const handlers = [
  http.get('/api/tasks', () => {
    return HttpResponse.json(tasksInstance.getTasks());
  }),
  http.post('/api/tasks', async ({ request }) => {
    const updatedTasks = await request.json();

    try {
      tasksInstance.updateTasks(updatedTasks as Partial<Task>[]);
    } catch (error) {
      return new HttpResponse(null, {
        status: 400,
        statusText: (error as Error).message,
      });
    }

    return HttpResponse.json({ status: 201 });
  }),
];