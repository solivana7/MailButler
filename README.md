# SoliMail - AI Email Command Center

An intelligent email management system with AI-powered triage, action extraction, reminders, and weekly digests. Designed for power users with many email accounts.

## Features

- **Smart Inbox Triage**: AI categorizes emails into Urgent, Important, Follow-up, Task, Newsletter, Archive
- **Action Extraction**: Automatically detects tasks and commitments in emails
- **Response Reminders**: Never forget to reply with smart reminders
- **Weekly Digest**: End-of-week summary of outstanding actions
- **Multi-Account Support**: Manage Gmail and IMAP accounts
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Zustand
- TanStack Query

### Backend
- Express.js
- TypeScript
- Drizzle ORM
- Neon PostgreSQL (or in-memory demo mode)
- Kimi AI (optional, falls back to rule-based analysis)

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9 (managed via `corepack` or the `packageManager` field)
- Railway account (for deployment)
- Neon PostgreSQL account (only if you want persistence)

### Local Development

1. **Clone and install**
```bash
git clone https://github.com/YOUR_USERNAME/mailbutler.git
cd mailbutler
corepack enable
pnpm install
cd server
pnpm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. **Start the backend**
```bash
cd server
pnpm dev
```

4. **Start the frontend (in a new terminal)**
```bash
pnpm dev
```

The frontend dev server runs on `http://localhost:5173` and proxies API calls to `http://localhost:3001`.

### Full stack with Docker Compose

```bash
docker-compose up
```

The unified backend image serves both the API and the built frontend SPA at `http://localhost:3001`.

## Deployment to Railway

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mailbutler.git
git push -u origin main
```

2. **Create a Railway project**
   - Go to [railway.app](https://railway.app)
   - Create a new project and deploy from your GitHub repo
   - Railway uses `railway.json` and `Dockerfile.backend` to build a single service

3. **Set environment variables**
   In Railway dashboard → Project → Variables:
   ```
   DATABASE_URL=postgresql://...
   KIMI_API_KEY=your-kimi-api-key
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   PORT=3001
   FRONTEND_URL=https://solimail.app
   SERVER_URL=https://solimail.app
   ```

4. **Add PostgreSQL database (optional)**
   - Railway Marketplace → "Postgres"
   - Creates `DATABASE_URL` automatically
   - Without `DATABASE_URL` the app runs in demo mode with seeded data

5. **Deploy**
   - Railway builds and deploys automatically
   - Your app will be live at `https://solimail.app`

## API Endpoints

### Health
```
GET  /health                 - Health check
```

### Authentication
```
POST /api/auth/gmail         - OAuth2 Gmail login
POST /api/auth/imap          - Add IMAP account
GET  /api/auth/me            - Get current demo user
```

### Accounts
```
GET    /api/accounts         - List all accounts
POST   /api/accounts         - Add account
PATCH  /api/accounts/:id     - Update account
DELETE /api/accounts/:id     - Remove account
POST   /api/accounts/:id/sync - Sync emails
```

### Emails
```
GET    /api/emails           - List emails (with filters)
GET    /api/emails/:id       - Get email details
POST   /api/emails/:id/analyze - AI analysis
PATCH  /api/emails/:id/category - Change category
PATCH  /api/emails/:id/read  - Toggle read status
PATCH  /api/emails/:id/star  - Toggle star
POST   /api/emails/:id/reminder - Set reminder
```

### Tasks
```
GET    /api/tasks            - List all tasks
POST   /api/tasks            - Create task
PATCH  /api/tasks/:id        - Update task
POST   /api/tasks/:id/toggle - Toggle complete
DELETE /api/tasks/:id        - Delete task
```

### Digest
```
GET    /api/digest/weekly    - Get weekly digest
GET    /api/digest/history   - Get digest history
```

### AI
```
POST   /api/ai/analyze          - Analyze single email
POST   /api/ai/analyze/batch    - Batch analyze
POST   /api/ai/insights         - Generate insights
POST   /api/ai/suggest-actions  - Suggest actions
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | No | Neon PostgreSQL connection string. Omit to run demo mode. |
| `KIMI_API_KEY` | No | Kimi AI API key for advanced analysis |
| `GOOGLE_CLIENT_ID` | No | For Gmail OAuth |
| `GOOGLE_CLIENT_SECRET` | No | For Gmail OAuth |
| `PORT` | No | Server port (default: 3001) |
| `FRONTEND_URL` | No | Frontend URL for CORS |
| `SERVER_URL` | No | Public server URL used in OAuth redirects |

## Project Structure

```
solimail/
├── src/                   # Frontend React app
│   ├── components/        # React components
│   ├── store/             # Zustand state management
│   ├── types/             # TypeScript types
│   └── data/              # Mock data
├── server/                # Backend Express API
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── db/            # Database schema
│   │   ├── seed.ts        # Demo data seeder
│   │   └── index.ts       # Entry point
│   └── package.json
├── docker-compose.yml     # Docker setup
├── Dockerfile.frontend    # Standalone frontend container
├── Dockerfile.backend     # Unified backend + frontend container
├── railway.json           # Railway config
└── README.md
```

## License

MIT
