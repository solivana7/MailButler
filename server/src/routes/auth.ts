import { Router, Request, Response } from 'express';

export const authRoutes = Router();

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
authRoutes.post('/gmail', async (req: Request, res: Response) => {
  const { code } = req.body;

  if (!code) {
    // Return OAuth URL for user to authorize
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.SERVER_URL || 'http://localhost:3001'}/api/auth/gmail/callback`;

    if (!clientId) {
      return res.status(400).json({
        error: 'Google OAuth not configured',
        message: 'Set GOOGLE_CLIENT_ID environment variable',
      });
    }

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent('https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify')}` +
      `&access_type=offline` +
      `&prompt=consent`;

    return res.json({ authUrl });
  }

  // Exchange code for tokens
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.SERVER_URL || 'http://localhost:3001'}/api/auth/gmail/callback`,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await response.json();

    if (tokens.error) {
      throw new Error(tokens.error_description || tokens.error);
    }

    // In production, store tokens securely and fetch email address
    res.json({
      success: true,
      account: {
        id: `gmail-${Date.now()}`,
        email: 'user@gmail.com', // Would be fetched from Gmail API
        provider: 'gmail',
      },
    });
  } catch (error) {
    console.error('Gmail OAuth error:', error);
    res.status(500).json({ error: 'Failed to authenticate with Gmail' });
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
    await new Promise(resolve => setTimeout(resolve, 500));

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
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refresh_token: refreshToken,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
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
