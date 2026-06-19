import { Router, Request, Response } from 'express';
import { inMemoryStore, generateId } from '../db/index.js';
import type { Task } from '../db/schema.js';

export const taskRoutes = Router();

// Get all tasks
taskRoutes.get('/', (req: Request, res: Response) => {
  const { status, priority, emailId } = req.query;

  let tasks = Array.from(inMemoryStore.tasks.values());

  // Filter by status
  if (status && status !== 'all') {
    tasks = tasks.filter(t => t.status === status);
  }

  // Filter by priority
  if (priority) {
    tasks = tasks.filter(t => t.priority === priority);
  }

  // Filter by email
  if (emailId) {
    tasks = tasks.filter(t => t.emailId === emailId);
  }

  // Sort: pending first, then by priority, then by creation date
  tasks.sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (b.status === 'completed' && a.status !== 'completed') return -1;

    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    const aPriority = priorityOrder[a.priority] ?? 1;
    const bPriority = priorityOrder[b.priority] ?? 1;
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  res.json(tasks);
});

// Get task stats
taskRoutes.get('/stats', (_req: Request, res: Response) => {
  const tasks = Array.from(inMemoryStore.tasks.values());

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      return new Date(t.dueDate) < new Date();
    }).length,
  };

  res.json(stats);
});

// Get single task
taskRoutes.get('/:id', (req: Request, res: Response) => {
  const task = inMemoryStore.tasks.get(req.params.id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json(task);
});

// Create task
taskRoutes.post('/', (req: Request, res: Response) => {
  const { emailId, description, dueDate, priority, notes } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }

  const task: Task = {
    id: generateId(),
    userId: 'demo-user',
    emailId: emailId || null,
    description,
    dueDate: dueDate || null,
    priority: priority || 'medium',
    status: 'pending',
    notes: notes || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
  };

  inMemoryStore.tasks.set(task.id, task);
  res.status(201).json(task);
});

// Update task
taskRoutes.patch('/:id', (req: Request, res: Response) => {
  const task = inMemoryStore.tasks.get(req.params.id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const updates = req.body;
  const updatedTask: Task = {
    ...task,
    ...updates,
    updatedAt: new Date().toISOString(),
    completedAt: updates.status === 'completed' ? new Date().toISOString() : task.completedAt,
  };

  inMemoryStore.tasks.set(task.id, updatedTask);
  res.json(updatedTask);
});

// Toggle task completion
taskRoutes.post('/:id/toggle', (req: Request, res: Response) => {
  const task = inMemoryStore.tasks.get(req.params.id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const newStatus = task.status === 'completed' ? 'pending' : 'completed';
  const updatedTask: Task = {
    ...task,
    status: newStatus,
    updatedAt: new Date().toISOString(),
    completedAt: newStatus === 'completed' ? new Date().toISOString() : null,
  };

  inMemoryStore.tasks.set(task.id, updatedTask);
  res.json(updatedTask);
});

// Delete task
taskRoutes.delete('/:id', (req: Request, res: Response) => {
  const task = inMemoryStore.tasks.get(req.params.id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  inMemoryStore.tasks.delete(req.params.id);
  res.json({ success: true });
});

// Batch complete tasks
taskRoutes.post('/batch-complete', (req: Request, res: Response) => {
  const { taskIds } = req.body;

  if (!Array.isArray(taskIds)) {
    return res.status(400).json({ error: 'taskIds must be an array' });
  }

  const now = new Date().toISOString();
  const updatedTasks: Task[] = [];

  taskIds.forEach(id => {
    const task = inMemoryStore.tasks.get(id);
    if (task) {
      const updatedTask: Task = {
        ...task,
        status: 'completed',
        updatedAt: now,
        completedAt: now,
      };
      inMemoryStore.tasks.set(id, updatedTask);
      updatedTasks.push(updatedTask);
    }
  });

  res.json({ updatedTasks });
});
