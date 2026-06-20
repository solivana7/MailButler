import { Router, Request, Response } from 'express';
import { emailRepo, reminderRepo } from '../db/repository.js';
import { analyzeEmail } from '../services/ai.js';
import type { Email } from '../db/schema.js';

export const emailRoutes = Router();

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function toFrontendEmail(email: Email) {
  return {
    id: email.id,
    accountId: email.accountId,
    from: {
      name: email.fromName,
      email: email.fromEmail,
    },
    to: parseJson<string[]>(email.to, []),
    subject: email.subject,
    preview: email.preview,
    body: email.body || '',
    date: email.date,
    category: email.category,
    isRead: email.isRead,
    hasAttachment: email.hasAttachment,
    isStarred: email.isStarred,
    aiAnalysis:
      email.aiPriority !== null && email.aiPriority !== undefined
        ? {
            priority: email.aiPriority,
            sentiment: email.aiSentiment || 'neutral',
            urgency: email.aiUrgency || 'medium',
            actionItems: parseJson<string[]>(email.aiActionItems, []),
            replyExpectation: email.replyExpectation || 'optional',
            summary: email.aiSummary || '',
          }
        : undefined,
  };
}

// Get all emails (with filtering)
emailRoutes.get('/', async (req: Request, res: Response) => {
  const { accountId, category, search, limit = '50', offset = '0' } = req.query;

  const { emails, total } = await emailRepo.findAll({
    accountId: accountId as string | undefined,
    category: category as string | undefined,
    search: search as string | undefined,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string),
  });

  res.json({
    emails: emails.map(toFrontendEmail),
    pagination: {
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      hasMore: parseInt(offset as string) + parseInt(limit as string) < total,
    },
  });
});

// Get single email
emailRoutes.get('/:id', async (req: Request, res: Response) => {
  const email = await emailRepo.findById(req.params.id);

  if (!email) {
    return res.status(404).json({ error: 'Email not found' });
  }

  res.json(toFrontendEmail(email));
});

// Analyze email with AI
emailRoutes.post('/:id/analyze', async (req: Request, res: Response) => {
  const email = await emailRepo.findById(req.params.id);

  if (!email) {
    return res.status(404).json({ error: 'Email not found' });
  }

  try {
    const analysis = await analyzeEmail(
      email.subject,
      email.body || '',
      email.fromName,
      email.fromEmail
    );

    const updatedEmail = await emailRepo.update(email.id, {
      category: analysis.category,
      aiPriority: analysis.priority,
      aiSentiment: analysis.sentiment,
      aiUrgency: analysis.urgency,
      aiSummary: analysis.summary,
      aiActionItems: JSON.stringify(analysis.actionItems),
      replyExpectation: analysis.replyExpectation,
    });

    if (!updatedEmail) {
      return res.status(500).json({ error: 'Failed to update email' });
    }

    res.json({ email: toFrontendEmail(updatedEmail), analysis });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Set email category
emailRoutes.patch('/:id/category', async (req: Request, res: Response) => {
  const { category } = req.body;
  const email = await emailRepo.findById(req.params.id);

  if (!email) {
    return res.status(404).json({ error: 'Email not found' });
  }

  const validCategories = ['urgent', 'important', 'follow-up', 'task', 'newsletter', 'archive'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  const updatedEmail = await emailRepo.update(req.params.id, { category });
  if (!updatedEmail) {
    return res.status(404).json({ error: 'Email not found' });
  }

  res.json(toFrontendEmail(updatedEmail));
});

// Toggle read status
emailRoutes.patch('/:id/read', async (req: Request, res: Response) => {
  const email = await emailRepo.findById(req.params.id);

  if (!email) {
    return res.status(404).json({ error: 'Email not found' });
  }

  const updatedEmail = await emailRepo.update(req.params.id, { isRead: !email.isRead });
  if (!updatedEmail) {
    return res.status(404).json({ error: 'Email not found' });
  }

  res.json(toFrontendEmail(updatedEmail));
});

// Toggle star
emailRoutes.patch('/:id/star', async (req: Request, res: Response) => {
  const email = await emailRepo.findById(req.params.id);

  if (!email) {
    return res.status(404).json({ error: 'Email not found' });
  }

  const updatedEmail = await emailRepo.update(req.params.id, { isStarred: !email.isStarred });
  if (!updatedEmail) {
    return res.status(404).json({ error: 'Email not found' });
  }

  res.json(toFrontendEmail(updatedEmail));
});

// Add reminder to email
emailRoutes.post('/:id/reminder', async (req: Request, res: Response) => {
  const { remindAt, type } = req.body;
  const email = await emailRepo.findById(req.params.id);

  if (!email) {
    return res.status(404).json({ error: 'Email not found' });
  }

  const reminder = await reminderRepo.create({
    id: `reminder-${Date.now()}`,
    userId: 'demo-user',
    emailId: email.id,
    remindAt,
    type: type || 'follow-up',
    isActive: true,
    isDismissed: false,
    createdAt: new Date().toISOString(),
  });

  res.json(reminder);
});
