import { Router, Request, Response } from 'express';
import { inMemoryStore } from '../db/index.js';
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
accountRoutes.get('/', (_req: Request, res: Response) => {
  const accounts = Array.from(inMemoryStore.accounts.values()).map(toFrontendAccount);
  res.json(accounts);
});

// Get single account
accountRoutes.get('/:id', (req: Request, res: Response) => {
  const account = inMemoryStore.accounts.get(req.params.id);

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

  const account: Account = {
    id: `acc-${Date.now()}`,
    userId: 'demo-user', // Would come from auth in production
    name,
    email,
    provider,
    accessToken: null,
    refreshToken: null,
    imapServer: imapServer || null,
    imapPort: imapPort || null,
    imapUser: imapUser || null,
    imapPassword: imapPassword || null,
    lastSyncAt: null,
    unreadCount: 0,
    totalEmails: 0,
    isEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  inMemoryStore.accounts.set(account.id, account);
  res.status(201).json(toFrontendAccount(account));
});

// Update account
accountRoutes.patch('/:id', (req: Request, res: Response) => {
  const account = inMemoryStore.accounts.get(req.params.id);

  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  const updates = req.body;
  const updatedAccount: Account = {
    ...account,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  inMemoryStore.accounts.set(account.id, updatedAccount);
  res.json(toFrontendAccount(updatedAccount));
});

// Toggle account enabled/disabled
accountRoutes.patch('/:id/toggle', (req: Request, res: Response) => {
  const account = inMemoryStore.accounts.get(req.params.id);

  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  const updatedAccount: Account = {
    ...account,
    isEnabled: !account.isEnabled,
    updatedAt: new Date().toISOString(),
  };

  inMemoryStore.accounts.set(account.id, updatedAccount);
  res.json(toFrontendAccount(updatedAccount));
});

// Sync account (trigger email fetch)
accountRoutes.post('/:id/sync', async (req: Request, res: Response) => {
  const account = inMemoryStore.accounts.get(req.params.id);

  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  // Mark as syncing
  const syncingAccount: Account = {
    ...account,
    lastSyncAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  inMemoryStore.accounts.set(account.id, syncingAccount);

  // In production, this would trigger actual email sync
  // For demo, we simulate sync completion
  setTimeout(() => {
    const completedAccount: Account = {
      ...syncingAccount,
      unreadCount: Math.floor(Math.random() * 30),
      totalEmails: (syncingAccount.totalEmails || 0) + Math.floor(Math.random() * 50),
    };
    inMemoryStore.accounts.set(account.id, completedAccount);
  }, 2000);

  res.json({ status: 'syncing', message: 'Sync started' });
});

// Delete account
accountRoutes.delete('/:id', (req: Request, res: Response) => {
  const account = inMemoryStore.accounts.get(req.params.id);

  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  inMemoryStore.accounts.delete(req.params.id);

  // Also delete associated emails
  const emailKeys = Array.from(inMemoryStore.emails.keys());
  emailKeys.forEach(key => {
    const email = inMemoryStore.emails.get(key);
    if (email?.accountId === req.params.id) {
      inMemoryStore.emails.delete(key);
    }
  });

  res.json({ success: true });
});
