// Email Types
export type Category = 'urgent' | 'important' | 'follow-up' | 'task' | 'newsletter' | 'archive';

export interface Sender {
  name: string;
  email: string;
  avatar?: string;
}

export interface Task {
  id: string;
  emailId: string;
  description: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  completedAt?: string;
}

export interface Reminder {
  id: string;
  emailId: string;
  remindAt: string;
  type: 'reply' | 'action' | 'follow-up';
  isActive: boolean;
}

export interface AIAnalysis {
  priority: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  actionItems: string[];
  replyExpectation: 'required' | 'optional' | 'none';
  summary: string;
}

export interface Email {
  id: string;
  accountId: string;
  from: Sender;
  to: string[];
  subject: string;
  preview: string;
  body: string;
  date: string;
  category: Category;
  isRead: boolean;
  hasAttachment: boolean;
  isStarred: boolean;
  extractedTasks: Task[];
  reminder?: Reminder;
  aiAnalysis?: AIAnalysis;
  isAnalyzing?: boolean;
}

// Account Types
export type AccountStatus = 'connected' | 'syncing' | 'error' | 'disabled';

export interface Account {
  id: string;
  name: string;
  email: string;
  provider: 'gmail' | 'imap';
  server?: string;
  port?: number;
  status: AccountStatus;
  lastSync?: string;
  unreadCount: number;
  totalEmails: number;
  isEnabled: boolean;
}

// Digest Types
export interface WeeklyDigest {
  id: string;
  weekStart: string;
  weekEnd: string;
  totalEmails: number;
  analyzedEmails: number;
  urgentReplies: number;
  tasksCreated: number;
  tasksCompleted: number;
  pendingTasks: number;
  followUps: Array<{
    id: string;
    subject: string;
    sender: string;
    daysAgo: number;
  }>;
  topSenders: Array<{
    email: string;
    name: string;
    count: number;
  }>;
  insights: string[];
  createdAt: string;
}

// Navigation Types
export type TabType = 'all' | 'urgent' | 'tasks' | 'follow-up' | 'newsletters' | 'archive';
export type SidebarSection = 'dashboard' | 'tabs' | 'tasks' | 'reminders' | 'digest' | 'accounts';
