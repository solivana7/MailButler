import { inMemoryStore, generateId } from './db/index.js';
import type { Account, Email, Task, Digest } from './db/schema.js';

const now = Date.now();

const seedAccounts: Account[] = [
  {
    id: 'acc-work',
    userId: 'demo-user',
    name: 'Work',
    email: 'natasha@techcorp.io',
    provider: 'gmail',
    accessToken: null,
    refreshToken: null,
    imapServer: null,
    imapPort: null,
    imapUser: null,
    imapPassword: null,
    lastSyncAt: new Date(now - 5 * 60 * 1000).toISOString(),
    unreadCount: 23,
    totalEmails: 1247,
    isEnabled: true,
    createdAt: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'acc-personal',
    userId: 'demo-user',
    name: 'Personal',
    email: 'natasha@gmail.com',
    provider: 'gmail',
    accessToken: null,
    refreshToken: null,
    imapServer: null,
    imapPort: null,
    imapUser: null,
    imapPassword: null,
    lastSyncAt: new Date(now - 15 * 60 * 1000).toISOString(),
    unreadCount: 8,
    totalEmails: 3421,
    isEnabled: true,
    createdAt: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'acc-freelance',
    userId: 'demo-user',
    name: 'Freelance',
    email: 'freelance@natasha.co',
    provider: 'imap',
    accessToken: null,
    refreshToken: null,
    imapServer: 'mail.freelance.com',
    imapPort: 993,
    imapUser: 'freelance@natasha.co',
    imapPassword: null,
    lastSyncAt: new Date(now - 45 * 60 * 1000).toISOString(),
    unreadCount: 5,
    totalEmails: 289,
    isEnabled: true,
    createdAt: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now - 45 * 60 * 1000).toISOString(),
  },
];

interface EmailTemplate {
  fromName: string;
  fromEmail: string;
  to: string[];
  subject: string;
  preview: string;
  body: string;
  category: Email['category'];
  aiPriority: number;
  aiUrgency: Email['aiUrgency'];
  actionItems?: string[];
}

const emailTemplates: EmailTemplate[] = [
  {
    fromName: 'Sarah Mitchell',
    fromEmail: 'sarah.m@techcorp.io',
    to: ['natasha@techcorp.io'],
    subject: 'Q4 Budget Review - Need Your Input ASAP',
    preview: 'Hi Natasha, we need to finalize the Q4 budget by tomorrow. Can you review the attached spreadsheet and provide your feedback?',
    body: 'Hi Natasha,\n\nWe need to finalize the Q4 budget by tomorrow. Please review the attached spreadsheet and provide your feedback.\n\nThanks,\nSarah',
    category: 'urgent',
    aiPriority: 9,
    aiUrgency: 'critical',
    actionItems: ['Review Q4 budget spreadsheet'],
  },
  {
    fromName: 'GitHub',
    fromEmail: 'notifications@github.com',
    to: ['natasha@techcorp.io'],
    subject: '[repo/project-api] Pull request #234: Add user authentication',
    preview: '@alexchen requested your review on "Add user authentication" in project-api.',
    body: '@alexchen requested your review on PR #234.',
    category: 'task',
    aiPriority: 7,
    aiUrgency: 'medium',
    actionItems: ['Review PR #234'],
  },
  {
    fromName: 'James Rodriguez',
    fromEmail: 'j.rodriguez@client-inc.com',
    to: ['natasha@techcorp.io'],
    subject: 'Follow-up: Website Redesign Proposal',
    preview: 'Hi Natasha, just wanted to follow up on the proposal I sent last week.',
    body: 'Hi Natasha,\n\nI wanted to follow up on the website redesign proposal. Have you had a chance to review it?\n\nBest,\nJames',
    category: 'follow-up',
    aiPriority: 6,
    aiUrgency: 'medium',
    actionItems: ['Reply to James about proposal'],
  },
  {
    fromName: 'AWS',
    fromEmail: 'aws-no-reply@amazon.com',
    to: ['natasha@gmail.com'],
    subject: 'Your AWS Bill for June 2024',
    preview: 'Your estimated bill for June 2024 is $2,847.32.',
    body: 'AWS Account: 1234-5678-9012\nBilling Period: June 1 - June 30, 2024\nTotal: $2,847.32',
    category: 'newsletter',
    aiPriority: 3,
    aiUrgency: 'low',
  },
  {
    fromName: 'Emily Watson',
    fromEmail: 'emily.watson@startup.co',
    to: ['natasha@gmail.com'],
    subject: 'Coffee next Tuesday?',
    preview: "Hey Natasha! It's been a while since we caught up.",
    body: 'Hey Natasha!\n\nWould love to grab coffee next Tuesday afternoon if you are free.\n\nCheers,\nEmily',
    category: 'important',
    aiPriority: 5,
    aiUrgency: 'medium',
    actionItems: ['Reply to Emily about coffee'],
  },
  {
    fromName: 'Michael Chang',
    fromEmail: 'michael.c@techcorp.io',
    to: ['natasha@techcorp.io'],
    subject: 'Urgent: Server down in production',
    preview: 'Natasha, we have a critical issue. Production server is not responding.',
    body: 'Natasha,\n\nWe have a critical issue. The production server is not responding. Can you investigate ASAP?\n\nThanks,\nMichael',
    category: 'urgent',
    aiPriority: 10,
    aiUrgency: 'critical',
    actionItems: ['Investigate production server outage'],
  },
];

const seedEmails: Email[] = emailTemplates.map((template, index) => {
  const daysAgo = Math.floor(Math.random() * 7);
  const hoursAgo = Math.floor(Math.random() * 24);
  const date = new Date(now - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000);
  const accountIds = ['acc-work', 'acc-personal', 'acc-work', 'acc-personal', 'acc-personal', 'acc-work'];

  return {
    id: `email-${index + 1}`,
    userId: 'demo-user',
    accountId: accountIds[index],
    messageId: `msg-${index + 1}`,
    fromName: template.fromName,
    fromEmail: template.fromEmail,
    to: JSON.stringify(template.to),
    subject: template.subject,
    preview: template.preview,
    body: template.body,
    bodyHtml: null,
    date: date.toISOString(),
    isRead: index > 2,
    isStarred: index === 0,
    hasAttachment: false,
    category: template.category,
    aiPriority: template.aiPriority,
    aiSentiment: 'neutral',
    aiUrgency: template.aiUrgency,
    aiSummary: template.preview.substring(0, 100),
    aiActionItems: JSON.stringify(template.actionItems || []),
    replyExpectation: template.category === 'urgent' || template.category === 'follow-up' ? 'required' : 'optional',
    createdAt: date.toISOString(),
    updatedAt: date.toISOString(),
  };
});

const seedTasks: Task[] = [
  {
    id: 'task-1',
    userId: 'demo-user',
    emailId: 'email-1',
    description: 'Review Q4 budget and provide feedback',
    dueDate: new Date(now + 1 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    status: 'pending',
    notes: null,
    createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
  },
  {
    id: 'task-2',
    userId: 'demo-user',
    emailId: 'email-2',
    description: 'Review PR #234: Add user authentication',
    dueDate: null,
    priority: 'medium',
    status: 'in_progress',
    notes: null,
    createdAt: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
  },
  {
    id: 'task-3',
    userId: 'demo-user',
    emailId: 'email-6',
    description: 'Investigate production server issue',
    dueDate: null,
    priority: 'high',
    status: 'completed',
    notes: null,
    createdAt: new Date(now - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(now - 15 * 60 * 1000).toISOString(),
    completedAt: new Date(now - 15 * 60 * 1000).toISOString(),
  },
];

export function seedInMemoryStore(): void {
  if (inMemoryStore.accounts.size > 0 || inMemoryStore.emails.size > 0) {
    return;
  }

  seedAccounts.forEach((account) => inMemoryStore.accounts.set(account.id, account));
  seedEmails.forEach((email) => inMemoryStore.emails.set(email.id, email));
  seedTasks.forEach((task) => inMemoryStore.tasks.set(task.id, task));

  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const digest: Digest = {
    id: generateId(),
    userId: 'demo-user',
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    totalEmails: seedEmails.length,
    analyzedEmails: seedEmails.filter((e) => e.aiPriority !== null).length,
    urgentReplies: seedEmails.filter((e) => e.aiUrgency === 'critical' || e.aiUrgency === 'high').length,
    tasksCreated: seedTasks.length,
    tasksCompleted: seedTasks.filter((t) => t.status === 'completed').length,
    pendingTasks: seedTasks.filter((t) => t.status !== 'completed').length,
    followUps: JSON.stringify([
      { id: '1', subject: 'Website Redesign Proposal', sender: 'James Rodriguez', daysAgo: 3 },
    ]),
    topSenders: JSON.stringify([
      { email: 'sarah.m@techcorp.io', name: 'Sarah Mitchell', count: 2 },
      { email: 'michael.c@techcorp.io', name: 'Michael Chang', count: 1 },
    ]),
    insights: JSON.stringify([
      'You have 2 urgent emails requiring attention',
      'Production server issue was resolved recently',
      'Consider setting up filters for AWS billing notifications',
    ]),
    createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
  };

  inMemoryStore.digests.set(digest.id, digest);

  console.log('🌱 Seeded in-memory store with demo data');
}
