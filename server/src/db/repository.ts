import { eq, and, or, ilike, desc, asc, sql } from 'drizzle-orm';
import { db, inMemoryStore, generateId } from './index.js';
import * as schema from './schema.js';

const DEMO_USER_ID = 'demo-user';

// ---------- Helpers ----------

function nowIso() {
  return new Date().toISOString();
}

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

// ---------- Accounts ----------

export const accountRepo = {
  async findAll(): Promise<schema.Account[]> {
    if (!db) return Array.from(inMemoryStore.accounts.values());
    return db.select().from(schema.accounts).where(eq(schema.accounts.userId, DEMO_USER_ID));
  },

  async findById(id: string): Promise<schema.Account | null> {
    if (!db) return inMemoryStore.accounts.get(id) || null;
    const rows = await db
      .select()
      .from(schema.accounts)
      .where(and(eq(schema.accounts.id, id), eq(schema.accounts.userId, DEMO_USER_ID)));
    return rows[0] || null;
  },

  async create(data: schema.NewAccount): Promise<schema.Account> {
    if (!db) {
      const account = { ...data, id: data.id || generateId() } as schema.Account;
      inMemoryStore.accounts.set(account.id, account);
      return account;
    }
    const [row] = await db.insert(schema.accounts).values(data).returning();
    return row;
  },

  async update(id: string, data: Partial<schema.Account>): Promise<schema.Account | null> {
    if (!db) {
      const existing = inMemoryStore.accounts.get(id);
      if (!existing) return null;
      const updated = { ...existing, ...data, updatedAt: nowIso() };
      inMemoryStore.accounts.set(id, updated);
      return updated;
    }
    const [row] = await db
      .update(schema.accounts)
      .set({ ...data, updatedAt: nowIso() })
      .where(and(eq(schema.accounts.id, id), eq(schema.accounts.userId, DEMO_USER_ID)))
      .returning();
    return row || null;
  },

  async delete(id: string): Promise<void> {
    if (!db) {
      inMemoryStore.accounts.delete(id);
      return;
    }
    await db.delete(schema.accounts).where(eq(schema.accounts.id, id));
  },
};

// ---------- Emails ----------

export interface EmailFilters {
  accountId?: string;
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export const emailRepo = {
  async findAll(filters: EmailFilters = {}): Promise<{ emails: schema.Email[]; total: number }> {
    const { accountId, category, search, limit = 50, offset = 0 } = filters;

    if (!db) {
      let emails = Array.from(inMemoryStore.emails.values()).filter((e) => e.userId === DEMO_USER_ID);
      if (accountId) emails = emails.filter((e) => e.accountId === accountId);
      if (category && category !== 'all') emails = emails.filter((e) => e.category === category);
      if (search) {
        const q = search.toLowerCase();
        emails = emails.filter(
          (e) =>
            e.subject.toLowerCase().includes(q) ||
            e.fromName.toLowerCase().includes(q) ||
            e.fromEmail.toLowerCase().includes(q) ||
            e.preview.toLowerCase().includes(q)
        );
      }
      emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const total = emails.length;
      return { emails: emails.slice(offset, offset + limit), total };
    }

    const conditions = [eq(schema.emails.userId, DEMO_USER_ID)];
    if (accountId) conditions.push(eq(schema.emails.accountId, accountId));
    if (category && category !== 'all') conditions.push(eq(schema.emails.category, category));
    if (search) {
      const q = `%${search}%`;
      conditions.push(
        or(
          ilike(schema.emails.subject, q),
          ilike(schema.emails.fromName, q),
          ilike(schema.emails.fromEmail, q),
          ilike(schema.emails.preview, q)
        )!
      );
    }

    const where = and(...conditions);

    const allRows = await db
      .select()
      .from(schema.emails)
      .where(where)
      .orderBy(desc(schema.emails.date));

    const total = allRows.length;
    return { emails: allRows.slice(offset, offset + limit), total };
  },

  async findById(id: string): Promise<schema.Email | null> {
    if (!db) return inMemoryStore.emails.get(id) || null;
    const rows = await db.select().from(schema.emails).where(eq(schema.emails.id, id));
    return rows[0] || null;
  },

  async create(data: schema.NewEmail): Promise<schema.Email> {
    if (!db) {
      const email = { ...data, id: data.id || generateId() } as schema.Email;
      inMemoryStore.emails.set(email.id, email);
      return email;
    }
    const [row] = await db.insert(schema.emails).values(data).returning();
    return row;
  },

  async update(id: string, data: Partial<schema.Email>): Promise<schema.Email | null> {
    if (!db) {
      const existing = inMemoryStore.emails.get(id);
      if (!existing) return null;
      const updated = { ...existing, ...data, updatedAt: nowIso() };
      inMemoryStore.emails.set(id, updated);
      return updated;
    }
    const [row] = await db
      .update(schema.emails)
      .set({ ...data, updatedAt: nowIso() })
      .where(eq(schema.emails.id, id))
      .returning();
    return row || null;
  },

  async deleteForAccount(accountId: string): Promise<void> {
    if (!db) {
      for (const [key, email] of inMemoryStore.emails) {
        if (email.accountId === accountId) inMemoryStore.emails.delete(key);
      }
      return;
    }
    await db.delete(schema.emails).where(eq(schema.emails.accountId, accountId));
  },
};

// ---------- Tasks ----------

export interface TaskFilters {
  status?: string;
  priority?: string;
  emailId?: string;
}

export const taskRepo = {
  async findAll(filters: TaskFilters = {}): Promise<schema.Task[]> {
    const { status, priority, emailId } = filters;

    if (!db) {
      let tasks = Array.from(inMemoryStore.tasks.values());
      if (status && status !== 'all') tasks = tasks.filter((t) => t.status === status);
      if (priority) tasks = tasks.filter((t) => t.priority === priority);
      if (emailId) tasks = tasks.filter((t) => t.emailId === emailId);
      tasks.sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (b.status === 'completed' && a.status !== 'completed') return -1;
        const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
        const aPriority = priorityOrder[a.priority] ?? 1;
        const bPriority = priorityOrder[b.priority] ?? 1;
        if (aPriority !== bPriority) return aPriority - bPriority;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      return tasks;
    }

    const conditions = [eq(schema.tasks.userId, DEMO_USER_ID)];
    if (status && status !== 'all') conditions.push(eq(schema.tasks.status, status));
    if (priority) conditions.push(eq(schema.tasks.priority, priority));
    if (emailId) conditions.push(eq(schema.tasks.emailId, emailId));

    return db
      .select()
      .from(schema.tasks)
      .where(and(...conditions))
      .orderBy(
        sql`CASE WHEN ${schema.tasks.status} = 'completed' THEN 1 ELSE 0 END`,
        asc(sql`CASE ${schema.tasks.priority} WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END`),
        desc(schema.tasks.createdAt)
      );
  },

  async findById(id: string): Promise<schema.Task | null> {
    if (!db) return inMemoryStore.tasks.get(id) || null;
    const rows = await db.select().from(schema.tasks).where(eq(schema.tasks.id, id));
    return rows[0] || null;
  },

  async create(data: schema.NewTask): Promise<schema.Task> {
    if (!db) {
      const task = { ...data, id: data.id || generateId() } as schema.Task;
      inMemoryStore.tasks.set(task.id, task);
      return task;
    }
    const [row] = await db.insert(schema.tasks).values(data).returning();
    return row;
  },

  async update(id: string, data: Partial<schema.Task>): Promise<schema.Task | null> {
    if (!db) {
      const existing = inMemoryStore.tasks.get(id);
      if (!existing) return null;
      const updated = { ...existing, ...data, updatedAt: nowIso() };
      inMemoryStore.tasks.set(id, updated);
      return updated;
    }
    const [row] = await db
      .update(schema.tasks)
      .set({ ...data, updatedAt: nowIso() })
      .where(eq(schema.tasks.id, id))
      .returning();
    return row || null;
  },

  async delete(id: string): Promise<void> {
    if (!db) {
      inMemoryStore.tasks.delete(id);
      return;
    }
    await db.delete(schema.tasks).where(eq(schema.tasks.id, id));
  },
};

// ---------- Digests ----------

export const digestRepo = {
  async findAll(limit = 12): Promise<schema.Digest[]> {
    if (!db) {
      return Array.from(inMemoryStore.digests.values())
        .filter((d) => d.userId === DEMO_USER_ID)
        .sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime())
        .slice(0, limit);
    }
    return db
      .select()
      .from(schema.digests)
      .where(eq(schema.digests.userId, DEMO_USER_ID))
      .orderBy(desc(schema.digests.weekStart))
      .limit(limit);
  },

  async findById(id: string): Promise<schema.Digest | null> {
    if (!db) return inMemoryStore.digests.get(id) || null;
    const rows = await db.select().from(schema.digests).where(eq(schema.digests.id, id));
    return rows[0] || null;
  },

  async findByWeekStart(weekStart: string): Promise<schema.Digest | null> {
    if (!db) {
      return (
        Array.from(inMemoryStore.digests.values()).find(
          (d) => d.userId === DEMO_USER_ID && new Date(d.weekStart).getTime() === new Date(weekStart).getTime()
        ) || null
      );
    }
    const rows = await db
      .select()
      .from(schema.digests)
      .where(and(eq(schema.digests.userId, DEMO_USER_ID), eq(schema.digests.weekStart, weekStart)));
    return rows[0] || null;
  },

  async create(data: schema.NewDigest): Promise<schema.Digest> {
    if (!db) {
      const digest = { ...data, id: data.id || generateId() } as schema.Digest;
      inMemoryStore.digests.set(digest.id, digest);
      return digest;
    }
    const [row] = await db.insert(schema.digests).values(data).returning();
    return row;
  },
};

// ---------- Reminders ----------

export const reminderRepo = {
  async create(data: schema.NewReminder): Promise<schema.Reminder> {
    if (!db) {
      const reminder = { ...data, id: data.id || generateId() } as schema.Reminder;
      inMemoryStore.reminders.set(reminder.id, reminder);
      return reminder;
    }
    const [row] = await db.insert(schema.reminders).values(data).returning();
    return row;
  },
};
