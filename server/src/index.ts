import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { emailRoutes } from './routes/emails';
import { accountRoutes } from './routes/accounts';
import { taskRoutes } from './routes/tasks';
import { digestRoutes } from './routes/digest';
import { aiRoutes } from './routes/ai';
import { authRoutes } from './routes/auth';

config();

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
║   🧠 MailMind Server Running                         ║
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

export default app;
