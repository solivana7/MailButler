import { create } from 'zustand';
import { Email, Account, Task, WeeklyDigest, Category, TabType, SidebarSection } from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface AppState {
  // Data
  emails: Email[];
  accounts: Account[];
  tasks: Task[];
  digest: WeeklyDigest | null;

  // UI State
  activeTab: TabType;
  activeSection: SidebarSection;
  selectedEmailId: string | null;
  sidebarOpen: boolean;
  isLoading: boolean;
  searchQuery: string;
  initialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  setActiveTab: (tab: TabType) => void;
  setActiveSection: (section: SidebarSection) => void;
  selectEmail: (id: string | null) => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;

  // Email Actions
  fetchEmails: (params?: { accountId?: string; category?: string; search?: string }) => Promise<void>;
  analyzeEmail: (id: string) => Promise<void>;
  setEmailCategory: (id: string, category: Category) => Promise<void>;
  toggleRead: (id: string) => Promise<void>;
  toggleStar: (id: string) => Promise<void>;
  archiveEmail: (id: string) => Promise<void>;
  snoozeEmail: (id: string, days: number) => Promise<void>;

  // Task Actions
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // Reminder Actions
  setReminder: (emailId: string, remindAt: string, type: 'reply' | 'action' | 'follow-up') => Promise<void>;
  dismissReminder: (emailId: string) => void;

  // Account Actions
  addAccount: (account: Partial<Account> & Record<string, unknown>) => Promise<void>;
  fetchAccounts: () => Promise<void>;
  toggleAccount: (id: string) => Promise<void>;
  syncAccount: (id: string) => Promise<void>;

  // Digest Actions
  fetchDigest: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial Data
  emails: [],
  accounts: [],
  tasks: [],
  digest: null,

  // Initial UI State
  activeTab: 'all',
  activeSection: 'dashboard',
  selectedEmailId: null,
  sidebarOpen: true,
  isLoading: false,
  searchQuery: '',
  initialized: false,

  // Initialize app data
  initialize: async () => {
    if (get().initialized) return;
    set({ isLoading: true });
    try {
      await Promise.all([
        get().fetchAccounts(),
        get().fetchEmails(),
        get().fetchTasks(),
        get().fetchDigest(),
      ]);
      set({ initialized: true });
    } catch (error) {
      console.error('Failed to initialize:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // UI Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveSection: (section) => set({ activeSection: section }),
  selectEmail: (id) => set({ selectedEmailId: id }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setLoading: (loading) => set({ isLoading: loading }),

  // Fetch emails from API
  fetchEmails: async (params) => {
    const queryParams = new URLSearchParams();
    if (params?.accountId) queryParams.set('accountId', params.accountId);
    if (params?.category) queryParams.set('category', params.category);
    if (params?.search) queryParams.set('search', params.search);

    const res = await fetch(`${API_BASE}/emails?${queryParams}`);
    const data = await res.json();
    set({ emails: data.emails || [] });
  },

  // Email Actions
  analyzeEmail: async (id) => {
    // Optimistic update
    set((state) => ({
      emails: state.emails.map((email) =>
        email.id === id ? { ...email, isAnalyzing: true } : email
      ),
    }));

    try {
      const res = await fetch(`${API_BASE}/emails/${id}/analyze`, { method: 'POST' });
      const data = await res.json();

      set((state) => ({
        emails: state.emails.map((email) =>
          email.id === id
            ? {
                ...email,
                isAnalyzing: false,
                category: data.analysis?.category || email.category,
                aiAnalysis: data.analysis ? {
                  priority: data.analysis.priority,
                  sentiment: data.analysis.sentiment,
                  urgency: data.analysis.urgency,
                  actionItems: data.analysis.actionItems || [],
                  replyExpectation: data.analysis.replyExpectation,
                  summary: data.analysis.summary,
                } : undefined,
              }
            : email
        ),
      }));
    } catch (error) {
      console.error('Analysis failed:', error);
      set((state) => ({
        emails: state.emails.map((email) =>
          email.id === id ? { ...email, isAnalyzing: false } : email
        ),
      }));
    }
  },

  setEmailCategory: async (id, category) => {
    await fetch(`${API_BASE}/emails/${id}/category`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category }),
    });
    set((state) => ({
      emails: state.emails.map((email) =>
        email.id === id ? { ...email, category } : email
      ),
    }));
  },

  toggleRead: async (id) => {
    await fetch(`${API_BASE}/emails/${id}/read`, { method: 'PATCH' });
    set((state) => ({
      emails: state.emails.map((email) =>
        email.id === id ? { ...email, isRead: !email.isRead } : email
      ),
    }));
  },

  toggleStar: async (id) => {
    await fetch(`${API_BASE}/emails/${id}/star`, { method: 'PATCH' });
    set((state) => ({
      emails: state.emails.map((email) =>
        email.id === id ? { ...email, isStarred: !email.isStarred } : email
      ),
    }));
  },

  archiveEmail: async (id) => {
    await get().setEmailCategory(id, 'archive');
  },

  snoozeEmail: async (id, days) => {
    const snoozeDate = new Date();
    snoozeDate.setDate(snoozeDate.getDate() + days);
    await get().setReminder(id, snoozeDate.toISOString(), 'follow-up');
  },

  // Task Actions
  fetchTasks: async () => {
    const res = await fetch(`${API_BASE}/tasks`);
    const tasks = await res.json();
    set({ tasks });
  },

  addTask: async (taskData) => {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    const newTask = await res.json();
    set((state) => ({ tasks: [...state.tasks, newTask] }));
  },

  updateTask: async (id, updates) => {
    await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    }));
  },

  completeTask: async (id) => {
    await fetch(`${API_BASE}/tasks/${id}/toggle`, { method: 'POST' });
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { ...task, status: 'completed', completedAt: new Date().toISOString() }
          : task
      ),
    }));
  },

  deleteTask: async (id) => {
    await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }));
  },

  // Reminder Actions
  setReminder: async (emailId, remindAt, type) => {
    await fetch(`${API_BASE}/emails/${emailId}/reminder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ remindAt, type }),
    });
    set((state) => ({
      emails: state.emails.map((email) =>
        email.id === emailId
          ? {
              ...email,
              reminder: {
                id: `reminder-${emailId}`,
                emailId,
                remindAt,
                type,
                isActive: true,
              },
            }
          : email
      ),
    }));
  },

  dismissReminder: (emailId) => {
    set((state) => ({
      emails: state.emails.map((email) =>
        email.id === emailId ? { ...email, reminder: undefined } : email
      ),
    }));
  },

  // Account Actions
  addAccount: async (account) => {
    const res = await fetch(`${API_BASE}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account),
    });
    const newAccount = await res.json();
    set((state) => ({ accounts: [...state.accounts, newAccount] }));
  },

  fetchAccounts: async () => {
    const res = await fetch(`${API_BASE}/accounts`);
    const accounts = await res.json();
    set({ accounts });
  },

  toggleAccount: async (id) => {
    await fetch(`${API_BASE}/accounts/${id}/toggle`, { method: 'PATCH' });
    set((state) => ({
      accounts: state.accounts.map((account) =>
        account.id === id ? { ...account, isEnabled: !account.isEnabled } : account
      ),
    }));
  },

  syncAccount: async (id) => {
    set((state) => ({
      accounts: state.accounts.map((account) =>
        account.id === id ? { ...account, status: 'syncing' as const } : account
      ),
    }));

    await fetch(`${API_BASE}/accounts/${id}/sync`, { method: 'POST' });

    setTimeout(() => {
      set((state) => ({
        accounts: state.accounts.map((account) =>
          account.id === id
            ? { ...account, status: 'connected' as const, lastSync: new Date().toISOString() }
            : account
        ),
      }));
    }, 2000);
  },

  // Digest Actions
  fetchDigest: async () => {
    const res = await fetch(`${API_BASE}/digest/weekly`);
    const digest = await res.json();
    set({ digest });
  },
}));
