import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { emailRoutes } from './routes/emails';
import { accountRoutes } from './routes/accounts';
import { taskRoutes } from './routes/tasks';
import { digestRoutes } from './routes/digest';
import { aiRoutes } from './routes/ai';
import { authRoutes } from './routes/auth';
import { seedInMemoryStore } from './seed';
import { accountRepo } from './db/repository';
import { syncGmailAccount } from './services/gmail';
import { syncImapAccount } from './services/imap';

config();

// Seed demo data when running without a database
if (!process.env.DATABASE_URL) {
  seedInMemoryStore();
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/digest', digestRoutes);
app.use('/api/ai', aiRoutes);

// Serve built frontend in production deployments
const distPath = path.resolve(__dirname, '../../dist');
const indexHtmlPath = path.join(distPath, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(indexHtmlPath);
  });
}

// Error handling
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🧠 SoliMail Server Running                         ║
║                                                       ║
║   Port: ${PORT}                                          ║
║   Env:  ${process.env.NODE_ENV || 'development'}                            ║
║                                                       ║
║   Endpoints:                                         ║
║   • GET  /health                                     ║
║   • POST /api/auth/gmail                             ║
║   • POST /api/auth/imap                              ║
║   • GET  /api/accounts                               ║
║   • GET  /api/emails                                 ║
║   • POST /api/emails/:id/analyze                     ║
║   • GET  /api/tasks                                  ║
║   • GET  /api/digest/weekly                          ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Background sync every 15 minutes
if (process.env.DATABASE_URL) {
  const SYNC_INTERVAL_MS = 15 * 60 * 1000;

  const runBackgroundSync = async () => {
    try {
      const accounts = await accountRepo.findAll();
      for (const account of accounts) {
        if (!account.isEnabled) continue;

        if (account.provider === 'gmail' && (account.accessToken || account.refreshToken)) {
          await syncGmailAccount(account.id).catch((err) =>
            console.error(`Background Gmail sync failed for ${account.id}:`, err)
          );
        } else if (account.provider === 'imap') {
          await syncImapAccount(account.id).catch((err) =>
            console.error(`Background IMAP sync failed for ${account.id}:`, err)
          );
        }
      }
    } catch (err) {
      console.error('Background sync loop error:', err);
    }
  };

  // Run once shortly after startup, then on interval
  setTimeout(runBackgroundSync, 30000);
  setInterval(runBackgroundSync, SYNC_INTERVAL_MS);
}

export default app;
