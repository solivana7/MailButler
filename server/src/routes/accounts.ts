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

  const now = new Date().toISOString();
  const account = await accountRepo.create({
    id: `acc-${Date.now()}`,
    userId: 'demo-user',
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
    createdAt: now,
    updatedAt: now,
  });

  res.status(201).json(toFrontendAccount(account));
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
