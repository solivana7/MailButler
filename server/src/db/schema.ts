import { pgTable, text, integer, boolean, real } from 'drizzle-orm/pg-core';

// Email Accounts
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  provider: text('provider').notNull(), // 'gmail' | 'imap'
  accessToken: text('access_token'), // encrypted
  refreshToken: text('refresh_token'), // encrypted
  imapServer: text('imap_server'),
  imapPort: integer('imap_port'),
  imapUser: text('imap_user'),
  imapPassword: text('imap_password'), // encrypted
  lastSyncAt: text('last_sync_at'),
  unreadCount: integer('unread_count').default(0),
  totalEmails: integer('total_emails').default(0),
  isEnabled: boolean('is_enabled').default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Emails (cached)
export const emails = pgTable('emails', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  accountId: text('account_id').notNull().references(() => accounts.id),
  messageId: text('message_id').notNull(),
  fromName: text('from_name').notNull(),
  fromEmail: text('from_email').notNull(),
  to: text('to').notNull(), // JSON array
  subject: text('subject').notNull(),
  preview: text('preview').notNull(),
  body: text('body'),
  bodyHtml: text('body_html'),
  date: text('date').notNull(),
  isRead: boolean('is_read').default(false),
  isStarred: boolean('is_starred').default(false),
  hasAttachment: boolean('has_attachment').default(false),
  category: text('category'), // 'urgent' | 'important' | 'follow-up' | 'task' | 'newsletter' | 'archive'
  aiPriority: real('ai_priority'), // 1-10
  aiSentiment: text('ai_sentiment'), // 'positive' | 'neutral' | 'negative'
  aiUrgency: text('ai_urgency'), // 'low' | 'medium' | 'high' | 'critical'
  aiSummary: text('ai_summary'),
  aiActionItems: text('ai_action_items'), // JSON array
  replyExpectation: text('reply_expectation'), // 'required' | 'optional' | 'none'
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Tasks
export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  emailId: text('email_id').references(() => emails.id),
  description: text('description').notNull(),
  dueDate: text('due_date'),
  priority: text('priority').notNull().default('medium'), // 'low' | 'medium' | 'high'
  status: text('status').notNull().default('pending'), // 'pending' | 'in_progress' | 'completed'
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  completedAt: text('completed_at'),
});

// Reminders
export const reminders = pgTable('reminders', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  emailId: text('email_id').notNull().references(() => emails.id),
  remindAt: text('remind_at').notNull(),
  type: text('type').notNull(), // 'reply' | 'action' | 'follow-up'
  isActive: boolean('is_active').default(true),
  isDismissed: boolean('is_dismissed').default(false),
  createdAt: text('created_at').notNull(),
});

// Weekly Digests
export const digests = pgTable('digests', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  weekStart: text('week_start').notNull(),
  weekEnd: text('week_end').notNull(),
  totalEmails: integer('total_emails').notNull(),
  analyzedEmails: integer('analyzed_emails').notNull(),
  urgentReplies: integer('urgent_replies').notNull(),
  tasksCreated: integer('tasks_created').notNull(),
  tasksCompleted: integer('tasks_completed').notNull(),
  pendingTasks: integer('pending_tasks').notNull(),
  followUps: text('follow_ups'), // JSON array
  topSenders: text('top_senders'), // JSON array
  insights: text('insights'), // JSON array
  createdAt: text('created_at').notNull(),
});

// Types
export type Account = typeof accounts.$inferSelect;
export type NewAccount = Omit<Account, 'id'> & { id: string };
export type Email = typeof emails.$inferSelect;
export type NewEmail = Omit<Email, 'id'> & { id: string };
export type Task = typeof tasks.$inferSelect;
export type NewTask = Omit<Task, 'id'> & { id: string };
export type Reminder = typeof reminders.$inferSelect;
export type NewReminder = Omit<Reminder, 'id'> & { id: string };
export type Digest = typeof digests.$inferSelect;
export type NewDigest = Omit<Digest, 'id'> & { id: string };
