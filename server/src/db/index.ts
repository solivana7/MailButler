import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Use environment variable or fallback to SQLite for local dev
const databaseUrl = process.env.DATABASE_URL;

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

if (databaseUrl) {
  // Production: Neon PostgreSQL
  const sql = neon(databaseUrl);
  db = drizzle(sql, { schema });
  console.log('📦 Using Neon PostgreSQL database');
} else {
  // Local development: In-memory store (for demo)
  console.log('📦 Using in-memory store (set DATABASE_URL for persistence)');
}

export { db };

// In-memory store for demo (when no DATABASE_URL)
export const inMemoryStore = {
  accounts: new Map<string, schema.Account>(),
  emails: new Map<string, schema.Email>(),
  tasks: new Map<string, schema.Task>(),
  reminders: new Map<string, schema.Reminder>(),
  digests: new Map<string, schema.Digest>(),
};

// Helper to generate IDs
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
