import { Router, Request, Response } from 'express';
import { inMemoryStore, generateId } from '../db/index.js';
import { generateDigestInsights } from '../services/ai.js';
import type { Digest } from '../db/schema.js';

export const digestRoutes = Router();

// Get weekly digest (generates or returns existing)
digestRoutes.get('/weekly', async (_req: Request, res: Response) => {
  const userId = 'demo-user';
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  // Check if digest already exists for this week
  const existingDigest = Array.from(inMemoryStore.digests.values()).find(d => {
    const dStart = new Date(d.weekStart);
    return d.userId === userId &&
      dStart.getTime() === weekStart.getTime();
  });

  if (existingDigest) {
    return res.json(existingDigest);
  }

  // Generate new digest
  const emails = Array.from(inMemoryStore.emails.values()).filter(e => {
    const emailDate = new Date(e.date);
    return emailDate >= weekStart && emailDate <= weekEnd;
  });

  const tasks = Array.from(inMemoryStore.tasks.values()).filter(t => {
    const taskDate = new Date(t.createdAt);
    return taskDate >= weekStart && taskDate <= weekEnd;
  });

  const allTasks = Array.from(inMemoryStore.tasks.values());
  const pendingTasks = allTasks.filter(t => t.status !== 'completed');

  // Calculate urgent replies
  const urgentReplies = emails.filter(e =>
    e.aiUrgency === 'critical' || e.aiUrgency === 'high'
  ).length;

  // Top senders
  const senderCounts: Record<string, { name: string; count: number }> = {};
  emails.forEach(e => {
    if (!senderCounts[e.fromEmail]) {
      senderCounts[e.fromEmail] = { name: e.fromName, count: 0 };
    }
    senderCounts[e.fromEmail].count++;
  });

  const topSenders = Object.entries(senderCounts)
    .map(([email, data]) => ({ email, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Generate AI insights
  const insights = await generateDigestInsights(
    emails.length,
    { created: tasks.length, completed: tasks.filter(t => t.status === 'completed').length },
    topSenders
  );

  const digest: Digest = {
    id: generateId(),
    userId,
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    totalEmails: emails.length,
    analyzedEmails: emails.filter(e => e.aiPriority !== null).length,
    urgentReplies,
    tasksCreated: tasks.length,
    tasksCompleted: tasks.filter(t => t.status === 'completed').length,
    pendingTasks: pendingTasks.length,
    followUps: JSON.stringify([]),
    topSenders: JSON.stringify(topSenders),
    insights: JSON.stringify(insights),
    createdAt: new Date().toISOString(),
  };

  inMemoryStore.digests.set(digest.id, digest);
  res.json(digest);
});

// Get digest history
digestRoutes.get('/history', (req: Request, res: Response) => {
  const { limit = '12' } = req.query;
  const limitNum = parseInt(limit as string);

  let digests = Array.from(inMemoryStore.digests.values())
    .filter(d => d.userId === 'demo-user')
    .sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime())
    .slice(0, limitNum);

  // Parse JSON fields
  digests = digests.map(d => ({
    ...d,
    followUps: JSON.parse(d.followUps as string || '[]'),
    topSenders: JSON.parse(d.topSenders as string || '[]'),
    insights: JSON.parse(d.insights as string || '[]'),
  }));

  res.json(digests);
});

// Get single digest
digestRoutes.get('/:id', (req: Request, res: Response) => {
  const digest = inMemoryStore.digests.get(req.params.id);

  if (!digest) {
    return res.status(404).json({ error: 'Digest not found' });
  }

  res.json({
    ...digest,
    followUps: JSON.parse(digest.followUps as string || '[]'),
    topSenders: JSON.parse(digest.topSenders as string || '[]'),
    insights: JSON.parse(digest.insights as string || '[]'),
  });
});

// Generate custom date range digest
digestRoutes.post('/custom', async (req: Request, res: Response) => {
  const { startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'startDate and endDate are required' });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  const emails = Array.from(inMemoryStore.emails.values()).filter(e => {
    const emailDate = new Date(e.date);
    return emailDate >= start && emailDate <= end;
  });

  const tasks = Array.from(inMemoryStore.tasks.values()).filter(t => {
    const taskDate = new Date(t.createdAt);
    return taskDate >= start && taskDate <= end;
  });

  // Similar calculations as weekly digest...
  const digest = {
    id: generateId(),
    userId: 'demo-user',
    weekStart: start.toISOString(),
    weekEnd: end.toISOString(),
    totalEmails: emails.length,
    analyzedEmails: emails.filter(e => e.aiPriority !== null).length,
    urgentReplies: emails.filter(e =>
      e.aiUrgency === 'critical' || e.aiUrgency === 'high'
    ).length,
    tasksCreated: tasks.length,
    tasksCompleted: tasks.filter(t => t.status === 'completed').length,
    pendingTasks: 0,
    followUps: '[]',
    topSenders: '[]',
    insights: '[]',
    createdAt: new Date().toISOString(),
  };

  res.json(digest);
});
