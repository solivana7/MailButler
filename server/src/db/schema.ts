import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Email Accounts
export const accounts = sqliteTable('accounts', {
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
  isEnabled: integer('is_enabled', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Emails (cached)
export const emails = sqliteTable('emails', {
  id: text('id').primaryKey(),
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
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  isStarred: integer('is_starred', { mode: 'boolean' }).default(false),
  hasAttachment: integer('has_attachment', { mode: 'boolean' }).default(false),
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
export const tasks = sqliteTable('tasks', {
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
export const reminders = sqliteTable('reminders', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  emailId: text('email_id').notNull().references(() => emails.id),
  remindAt: text('remind_at').notNull(),
  type: text('type').notNull(), // 'reply' | 'action' | 'follow-up'
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  isDismissed: integer('is_dismissed', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
});

// Weekly Digests
export const digests = sqliteTable('digests', {
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
export type NewAccount = typeof accounts.$inferInsert;
export type Email = typeof emails.$inferSelect;
export type NewEmail = typeof emails.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Reminder = typeof reminders.$inferSelect;
export type Digest = typeof digests.$inferSelect;
