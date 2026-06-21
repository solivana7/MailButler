import { Router, Request, Response } from 'express';
import { accountRepo } from '../db/repository.js';
import { syncGmailAccount } from '../services/gmail.js';

export const authRoutes = Router();

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = `${SERVER_URL}/api/auth/gmail/callback`;
const GMAIL_SCOPE = encodeURIComponent(
  'openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify'
);

// Demo auth - in production, this would use proper OAuth2
const DEMO_USER = {
  id: 'demo-user',
  email: 'natasha@demo.com',
  name: 'Natasha',
};

// Get current user (demo)
authRoutes.get('/me', (_req: Request, res: Response) => {
  res.json(DEMO_USER);
});

// Gmail OAuth2 initiation
authRoutes.post('/gmail', async (_req: Request, res: Response) => {
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'TBD') {
    return res.status(400).json({
      error: 'Google OAuth not configured',
      message: 'Set GOOGLE_CLIENT_ID environment variable',
    });
  }

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=${GMAIL_SCOPE}` +
    `&access_type=offline` +
    `&prompt=consent`;

  res.json({ authUrl });
});

// Gmail OAuth2 callback
authRoutes.get('/gmail/callback', async (req: Request, res: Response) => {
  const code = req.query.code as string | undefined;

  if (!code) {
    return res.redirect(`${SERVER_URL}/accounts?error=gmail_auth_failed`);
  }

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || GOOGLE_CLIENT_ID === 'TBD' || GOOGLE_CLIENT_SECRET === 'TBD') {
    return res.redirect(`${SERVER_URL}/accounts?error=oauth_not_configured`);
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();

    if (tokens.error) {
      throw new Error(tokens.error_description || tokens.error);
    }

    // Fetch Gmail profile to get email address
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const profile = (await profileRes.json()) as { email?: string; name?: string };
    const email = profile.email || 'user@gmail.com';
    const name = profile.name || email.split('@')[0];

    const now = new Date().toISOString();
    const account = await accountRepo.create({
      id: `gmail-${Date.now()}`,
      userId: 'demo-user',
      name,
      email,
      provider: 'gmail',
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || null,
      imapServer: null,
      imapPort: null,
      imapUser: null,
      imapPassword: null,
      lastSyncAt: null,
      unreadCount: 0,
      totalEmails: 0,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    });

    // Start initial sync in the background
    syncGmailAccount(account.id).catch((err) => {
      console.error('Initial Gmail sync failed:', err);
    });

    res.redirect(`${SERVER_URL}/accounts?success=gmail_connected&account=${account.id}`);
  } catch (error) {
    console.error('Gmail OAuth callback error:', error);
    res.redirect(`${SERVER_URL}/accounts?error=gmail_auth_failed`);
  }
});

// IMAP account setup
authRoutes.post('/imap', async (req: Request, res: Response) => {
  const { server, port, email, password, name } = req.body;

  if (!server || !port || !email || !password) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'server, port, email, and password are required',
    });
  }

  // In production, would validate IMAP connection here
  // For demo, just accept the configuration
  try {
    // Simulate connection test
    await new Promise((resolve) => setTimeout(resolve, 500));

    res.json({
      success: true,
      account: {
        id: `imap-${Date.now()}`,
        email,
        name: name || email.split('@')[0],
        provider: 'imap',
        imapServer: server,
        imapPort: port,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to connect to IMAP server' });
  }
});

// Logout (clear session)
authRoutes.post('/logout', (_req: Request, res: Response) => {
  // In production, invalidate session/token
  res.json({ success: true });
});

// Refresh token
authRoutes.post('/refresh', async (req: Request, res: Response) => {
  const { refreshToken, provider } = req.body;

  if (provider === 'gmail' && refreshToken) {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return res.status(500).json({ error: 'Google OAuth not configured' });
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refresh_token: refreshToken,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          grant_type: 'refresh_token',
        }),
      });

      const tokens = await response.json();

      if (tokens.error) {
        throw new Error(tokens.error);
      }

      res.json({
        accessToken: tokens.access_token,
        expiresIn: tokens.expires_in,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to refresh token' });
    }
  } else {
    res.status(400).json({ error: 'Invalid request' });
  }
});
