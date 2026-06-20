import { Router, Request, Response } from 'express';
import { taskRepo } from '../db/repository.js';
import type { Task } from '../db/schema.js';

export const taskRoutes = Router();

function toFrontendTask(task: Task) {
  return {
    ...task,
    emailId: task.emailId || '',
  };
}

// Get all tasks
taskRoutes.get('/', async (req: Request, res: Response) => {
  const { status, priority, emailId } = req.query;

  const tasks = await taskRepo.findAll({
    status: status as string | undefined,
    priority: priority as string | undefined,
    emailId: emailId as string | undefined,
  });

  res.json(tasks.map(toFrontendTask));
});

// Get task stats
taskRoutes.get('/stats', async (_req: Request, res: Response) => {
  const tasks = await taskRepo.findAll();

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    overdue: tasks.filter((t) => {
      if (!t.dueDate || t.status === 'completed') return false;
      return new Date(t.dueDate) < new Date();
    }).length,
  };

  res.json(stats);
});

// Get single task
taskRoutes.get('/:id', async (req: Request, res: Response) => {
  const task = await taskRepo.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json(toFrontendTask(task));
});

// Create task
taskRoutes.post('/', async (req: Request, res: Response) => {
  const { emailId, description, dueDate, priority, notes } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }

  const now = new Date().toISOString();
  const task = await taskRepo.create({
    id: `task-${Date.now()}`,
    userId: 'demo-user',
    emailId: emailId || null,
    description,
    dueDate: dueDate || null,
    priority: priority || 'medium',
    status: 'pending',
    notes: notes || null,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  });

  res.status(201).json(toFrontendTask(task));
});

// Update task
taskRoutes.patch('/:id', async (req: Request, res: Response) => {
  const task = await taskRepo.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const updates = req.body;
  const updatedTask = await taskRepo.update(req.params.id, {
    ...updates,
    completedAt:
      updates.status === 'completed'
        ? new Date().toISOString()
        : updates.status === 'pending'
        ? null
        : task.completedAt,
  });

  if (!updatedTask) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json(toFrontendTask(updatedTask));
});

// Toggle task completion
taskRoutes.post('/:id/toggle', async (req: Request, res: Response) => {
  const task = await taskRepo.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const newStatus = task.status === 'completed' ? 'pending' : 'completed';
  const updatedTask = await taskRepo.update(req.params.id, {
    status: newStatus,
    completedAt: newStatus === 'completed' ? new Date().toISOString() : null,
  });

  if (!updatedTask) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json(toFrontendTask(updatedTask));
});

// Delete task
taskRoutes.delete('/:id', async (req: Request, res: Response) => {
  const task = await taskRepo.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  await taskRepo.delete(req.params.id);
  res.json({ success: true });
});

// Batch complete tasks
taskRoutes.post('/batch-complete', async (req: Request, res: Response) => {
  const { taskIds } = req.body;

  if (!Array.isArray(taskIds)) {
    return res.status(400).json({ error: 'taskIds must be an array' });
  }

  const now = new Date().toISOString();
  const updatedTasks: Task[] = [];

  for (const id of taskIds) {
    const task = await taskRepo.findById(id);
    if (task) {
      const updated = await taskRepo.update(id, {
        status: 'completed',
        completedAt: now,
      });
      if (updated) updatedTasks.push(updated);
    }
  }

  res.json({ updatedTasks: updatedTasks.map(toFrontendTask) });
});
