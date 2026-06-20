import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Use environment variable or fallback to in-memory store for local dev
const databaseUrl = process.env.DATABASE_URL;

let db: NodePgDatabase<typeof schema> | null = null;

if (databaseUrl) {
  // Production: PostgreSQL (works with Railway, Neon, etc.)
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('railway') ? { rejectUnauthorized: false } : undefined,
  });
  db = drizzle(pool, { schema });
  console.log('📦 Using PostgreSQL database');
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
