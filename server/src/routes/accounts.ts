import { Router, Request, Response } from 'express';
import { accountRepo } from '../db/repository.js';
import { syncGmailAccount } from '../services/gmail.js';
import { syncImapAccount } from '../services/imap.js';
import type { Account } from '../db/schema.js';

export const accountRoutes = Router();

function toFrontendAccount(account: Account) {
  let status: 'connected' | 'syncing' | 'error' | 'disabled' = 'connected';
  if (!account.isEnabled) {
    status = 'disabled';
  } else if (!account.lastSyncAt) {
    status = 'syncing';
  }

  return {
    id: account.id,
    name: account.name,
    email: account.email,
    provider: account.provider,
    server: account.imapServer || undefined,
    port: account.imapPort || undefined,
    status,
    lastSync: account.lastSyncAt || undefined,
    unreadCount: account.unreadCount,
    totalEmails: account.totalEmails,
    isEnabled: account.isEnabled,
  };
}

// Get all accounts
accountRoutes.get('/', async (_req: Request, res: Response) => {
  const accounts = await accountRepo.findAll();
  res.json(accounts.map(toFrontendAccount));
});

// Get single account
accountRoutes.get('/:id', async (req: Request, res: Response) => {
  const account = await accountRepo.findById(req.params.id);

  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  res.json(toFrontendAccount(account));
});

// Add account (IMAP or Gmail)
accountRoutes.post('/', async (req: Request, res: Response) => {
  const { name, email, provider, imapServer, imapPort, imapUser, imapPassword } = req.body;

  if (!name || !email || !provider) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const account = await createAccount({
    name,
    email,
    provider,
    imapServer,
    imapPort,
    imapUser,
    imapPassword,
  });

  res.status(201).json(toFrontendAccount(account));
});

interface CreateAccountInput {
  name: string;
  email: string;
  provider: 'gmail' | 'imap';
  imapServer?: string;
  imapPort?: number;
  imapUser?: string;
  imapPassword?: string;
}

async function createAccount(input: CreateAccountInput): Promise<Account> {
  const now = new Date().toISOString();
  return accountRepo.create({
    id: `${input.provider}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId: 'demo-user',
    name: input.name,
    email: input.email,
    provider: input.provider,
    accessToken: null,
    refreshToken: null,
    imapServer: input.imapServer || null,
    imapPort: input.imapPort || null,
    imapUser: input.imapUser || null,
    imapPassword: input.imapPassword || null,
    lastSyncAt: null,
    unreadCount: 0,
    totalEmails: 0,
    isEnabled: true,
    createdAt: now,
    updatedAt: now,
  });
}

// Parse a simple CSV string into rows
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        current.push(field.trim());
        field = '';
      } else if (char === '\n' || char === '\r') {
        if (char === '\r' && next === '\n') i++;
        if (current.length > 0 || field) {
          current.push(field.trim());
          rows.push(current);
          current = [];
          field = '';
        }
      } else {
        field += char;
      }
    }
  }

  if (current.length > 0 || field) {
    current.push(field.trim());
    rows.push(current);
  }

  return rows;
}

// Bulk import accounts from CSV
accountRoutes.post('/import', async (req: Request, res: Response) => {
  const { csv } = req.body;

  if (!csv || typeof csv !== 'string') {
    return res.status(400).json({ error: 'Missing csv field' });
  }

  const rows = parseCsv(csv);
  if (rows.length < 2) {
    return res.status(400).json({ error: 'CSV must have a header row and at least one data row' });
  }

  const headers = rows[0].map((h) => h.toLowerCase().trim());
  const nameIdx = headers.indexOf('name');
  const emailIdx = headers.indexOf('email');
  const providerIdx = headers.indexOf('provider');
  const serverIdx = headers.indexOf('server');
  const portIdx = headers.indexOf('port');
  const usernameIdx = headers.indexOf('username');
  const passwordIdx = headers.indexOf('password');

  if (nameIdx === -1 || emailIdx === -1 || providerIdx === -1) {
    return res.status(400).json({ error: 'CSV must include name, email, and provider columns' });
  }

  const results: { created: number; skipped: number; errors: string[] } = {
    created: 0,
    skipped: 0,
    errors: [],
  };

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 3 || !row.some((cell) => cell)) continue;

    const name = row[nameIdx]?.trim();
    const email = row[emailIdx]?.trim();
    const provider = row[providerIdx]?.trim().toLowerCase();

    if (!name || !email) {
      results.errors.push(`Row ${i + 1}: missing name or email`);
      continue;
    }

    if (provider !== 'gmail' && provider !== 'imap') {
      results.errors.push(`Row ${i + 1}: provider must be 'gmail' or 'imap'`);
      continue;
    }

    try {
      await createAccount({
        name,
        email,
        provider,
        imapServer: row[serverIdx]?.trim(),
        imapPort: row[portIdx] ? parseInt(row[portIdx].trim(), 10) : undefined,
        imapUser: row[usernameIdx]?.trim(),
        imapPassword: row[passwordIdx]?.trim(),
      });
      results.created++;
    } catch (error) {
      results.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  res.json(results);
});

// Update account
accountRoutes.patch('/:id', async (req: Request, res: Response) => {
  const account = await accountRepo.findById(req.params.id);

  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  const updates = req.body;
  const updatedAccount = await accountRepo.update(req.params.id, updates);

  if (!updatedAccount) {
    return res.status(404).json({ error: 'Account not found' });
  }

  res.json(toFrontendAccount(updatedAccount));
});

// Toggle account enabled/disabled
accountRoutes.patch('/:id/toggle', async (req: Request, res: Response) => {
  const account = await accountRepo.findById(req.params.id);

  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  const updatedAccount = await accountRepo.update(req.params.id, {
    isEnabled: !account.isEnabled,
  });

  if (!updatedAccount) {
    return res.status(404).json({ error: 'Account not found' });
  }

  res.json(toFrontendAccount(updatedAccount));
});

// Sync account (trigger email fetch)
accountRoutes.post('/:id/sync', async (req: Request, res: Response) => {
  const account = await accountRepo.findById(req.params.id);

  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  // Mark as syncing
  await accountRepo.update(req.params.id, {
    lastSyncAt: new Date().toISOString(),
  });

  if (account.provider === 'gmail' && account.accessToken) {
    const result = await syncGmailAccount(account.id);
    if (!result.success) {
      return res.status(500).json({ status: 'error', message: result.message });
    }
    return res.json({ status: 'synced', message: result.message, syncedCount: result.syncedCount });
  }

  if (account.provider === 'imap') {
    const result = await syncImapAccount(account.id);
    if (!result.success) {
      return res.status(500).json({ status: 'error', message: result.message });
    }
    return res.json({ status: 'synced', message: result.message, syncedCount: result.syncedCount });
  }

  res.status(400).json({ status: 'error', message: 'Unknown provider' });
});

// Delete account
accountRoutes.delete('/:id', async (req: Request, res: Response) => {
  const account = await accountRepo.findById(req.params.id);

  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  await accountRepo.delete(req.params.id);

  res.json({ success: true });
});
