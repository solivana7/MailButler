import { Router, Request, Response } from 'express';
import { inMemoryStore, generateId } from '../db/index.js';
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
    aiAnalysis: email.aiPriority !== null && email.aiPriority !== undefined
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
emailRoutes.get('/', (req: Request, res: Response) => {
  const { accountId, category, search, limit = '50', offset = '0' } = req.query;

  let emails = Array.from(inMemoryStore.emails.values());

  // Filter by account
  if (accountId) {
    emails = emails.filter(e => e.accountId === accountId);
  }

  // Filter by category
  if (category && category !== 'all') {
    emails = emails.filter(e => e.category === category);
  }

  // Search
  if (search) {
    const query = (search as string).toLowerCase();
    emails = emails.filter(e =>
      e.subject.toLowerCase().includes(query) ||
      e.fromName.toLowerCase().includes(query) ||
      e.fromEmail.toLowerCase().includes(query) ||
      e.preview.toLowerCase().includes(query)
    );
  }

  // Sort by date (newest first)
  emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Pagination
  const total = emails.length;
  const limitNum = parseInt(limit as string);
  const offsetNum = parseInt(offset as string);
  emails = emails.slice(offsetNum, offsetNum + limitNum);

  res.json({
    emails: emails.map(toFrontendEmail),
    pagination: {
      total,
      limit: limitNum,
      offset: offsetNum,
      hasMore: offsetNum + limitNum < total,
    },
  });
});

// Get single email
emailRoutes.get('/:id', (req: Request, res: Response) => {
  const email = inMemoryStore.emails.get(req.params.id);

  if (!email) {
    return res.status(404).json({ error: 'Email not found' });
  }

  res.json(toFrontendEmail(email));
});

// Analyze email with AI
emailRoutes.post('/:id/analyze', async (req: Request, res: Response) => {
  const email = inMemoryStore.emails.get(req.params.id);

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

    // Update email with analysis
    const updatedEmail: Email = {
      ...email,
      category: analysis.category,
      aiPriority: analysis.priority,
      aiSentiment: analysis.sentiment,
      aiUrgency: analysis.urgency,
      aiSummary: analysis.summary,
      aiActionItems: JSON.stringify(analysis.actionItems),
      replyExpectation: analysis.replyExpectation,
      updatedAt: new Date().toISOString(),
    };

    inMemoryStore.emails.set(email.id, updatedEmail);

    res.json({ email: toFrontendEmail(updatedEmail), analysis });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Set email category
emailRoutes.patch('/:id/category', (req: Request, res: Response) => {
  const { category } = req.body;
  const email = inMemoryStore.emails.get(req.params.id);

  if (!email) {
    return res.status(404).json({ error: 'Email not found' });
  }

  const validCategories = ['urgent', 'important', 'follow-up', 'task', 'newsletter', 'archive'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  const updatedEmail: Email = {
    ...email,
    category,
    updatedAt: new Date().toISOString(),
  };

  inMemoryStore.emails.set(email.id, updatedEmail);
  res.json(toFrontendEmail(updatedEmail));
});

// Toggle read status
emailRoutes.patch('/:id/read', (req: Request, res: Response) => {
  const email = inMemoryStore.emails.get(req.params.id);

  if (!email) {
    return res.status(404).json({ error: 'Email not found' });
  }

  const updatedEmail: Email = {
    ...email,
    isRead: !email.isRead,
    updatedAt: new Date().toISOString(),
  };

  inMemoryStore.emails.set(email.id, updatedEmail);
  res.json(toFrontendEmail(updatedEmail));
});

// Toggle star
emailRoutes.patch('/:id/star', (req: Request, res: Response) => {
  const email = inMemoryStore.emails.get(req.params.id);

  if (!email) {
    return res.status(404).json({ error: 'Email not found' });
  }

  const updatedEmail: Email = {
    ...email,
    isStarred: !email.isStarred,
    updatedAt: new Date().toISOString(),
  };

  inMemoryStore.emails.set(email.id, updatedEmail);
  res.json(toFrontendEmail(updatedEmail));
});

// Add reminder to email
emailRoutes.post('/:id/reminder', (req: Request, res: Response) => {
  const { remindAt, type } = req.body;
  const email = inMemoryStore.emails.get(req.params.id);

  if (!email) {
    return res.status(404).json({ error: 'Email not found' });
  }

  const reminder = {
    id: generateId(),
    userId: 'demo-user',
    emailId: email.id,
    remindAt,
    type: type || 'follow-up',
    isActive: true,
    isDismissed: false,
    createdAt: new Date().toISOString(),
  };

  inMemoryStore.reminders.set(reminder.id, reminder);
  res.json(reminder);
});
