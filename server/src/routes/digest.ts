import { Router, Request, Response } from 'express';
import { emailRepo, taskRepo, digestRepo } from '../db/repository.js';
import { generateDigestInsights } from '../services/ai.js';
import type { Digest } from '../db/schema.js';

export const digestRoutes = Router();

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function serializeDigest(digest: Digest) {
  return {
    ...digest,
    followUps: parseJson(digest.followUps, []),
    topSenders: parseJson(digest.topSenders, []),
    insights: parseJson(digest.insights, []),
  };
}

// Get weekly digest (generates or returns existing)
digestRoutes.get('/weekly', async (_req: Request, res: Response) => {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const weekStartIso = weekStart.toISOString();

  // Check if digest already exists for this week
  const existingDigest = await digestRepo.findByWeekStart(weekStartIso);
  if (existingDigest) {
    return res.json(serializeDigest(existingDigest));
  }

  // Generate new digest
  const emails = (await emailRepo.findAll({ limit: 10000 })).emails.filter((e) => {
    const emailDate = new Date(e.date);
    return emailDate >= weekStart && emailDate <= weekEnd;
  });

  const allTasks = await taskRepo.findAll();
  const tasks = allTasks.filter((t) => {
    const taskDate = new Date(t.createdAt);
    return taskDate >= weekStart && taskDate <= weekEnd;
  });
  const pendingTasks = allTasks.filter((t) => t.status !== 'completed');

  // Calculate urgent replies
  const urgentReplies = emails.filter(
    (e) => e.aiUrgency === 'critical' || e.aiUrgency === 'high'
  ).length;

  // Top senders
  const senderCounts: Record<string, { name: string; count: number }> = {};
  emails.forEach((e) => {
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
    { created: tasks.length, completed: tasks.filter((t) => t.status === 'completed').length },
    topSenders
  );

  const digest = await digestRepo.create({
    id: `digest-${Date.now()}`,
    userId: 'demo-user',
    weekStart: weekStartIso,
    weekEnd: weekEnd.toISOString(),
    totalEmails: emails.length,
    analyzedEmails: emails.filter((e) => e.aiPriority !== null).length,
    urgentReplies,
    tasksCreated: tasks.length,
    tasksCompleted: tasks.filter((t) => t.status === 'completed').length,
    pendingTasks: pendingTasks.length,
    followUps: JSON.stringify([]),
    topSenders: JSON.stringify(topSenders),
    insights: JSON.stringify(insights),
    createdAt: new Date().toISOString(),
  });

  res.json(serializeDigest(digest));
});

// Get digest history
digestRoutes.get('/history', async (req: Request, res: Response) => {
  const { limit = '12' } = req.query;
  const limitNum = parseInt(limit as string);
  const digests = await digestRepo.findAll(limitNum);
  res.json(digests.map(serializeDigest));
});

// Get single digest
digestRoutes.get('/:id', async (req: Request, res: Response) => {
  const digest = await digestRepo.findById(req.params.id);

  if (!digest) {
    return res.status(404).json({ error: 'Digest not found' });
  }

  res.json(serializeDigest(digest));
});

// Generate custom date range digest
digestRoutes.post('/custom', async (req: Request, res: Response) => {
  const { startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'startDate and endDate are required' });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  const emails = (await emailRepo.findAll({ limit: 10000 })).emails.filter((e) => {
    const emailDate = new Date(e.date);
    return emailDate >= start && emailDate <= end;
  });

  const tasks = (await taskRepo.findAll()).filter((t) => {
    const taskDate = new Date(t.createdAt);
    return taskDate >= start && taskDate <= end;
  });

  const digest: Digest = {
    id: `digest-${Date.now()}`,
    userId: 'demo-user',
    weekStart: start.toISOString(),
    weekEnd: end.toISOString(),
    totalEmails: emails.length,
    analyzedEmails: emails.filter((e) => e.aiPriority !== null).length,
    urgentReplies: emails.filter((e) => e.aiUrgency === 'critical' || e.aiUrgency === 'high').length,
    tasksCreated: tasks.length,
    tasksCompleted: tasks.filter((t) => t.status === 'completed').length,
    pendingTasks: 0,
    followUps: '[]',
    topSenders: '[]',
    insights: '[]',
    createdAt: new Date().toISOString(),
  };

  res.json(serializeDigest(digest));
});
