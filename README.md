# MailMind - AI Email Command Center

An intelligent email management system with AI-powered triage, action extraction, reminders, and weekly digests. Designed for power users with 17+ email accounts.

## Features

- **Smart Inbox Triage**: AI categorizes emails into Urgent, Important, Follow-up, Task, Newsletter, Archive
- **Action Extraction**: Automatically detects tasks and commitments in emails
- **Response Reminders**: Never forget to reply with smart reminders
- **Weekly Digest**: End-of-week summary of outstanding actions
- **Multi-Account Support**: Manage 17+ email accounts (Gmail + IMAP)
- **Responsive Design**: Works on Mac and iPhone

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Zustand

### Backend
- Express.js
- TypeScript
- Drizzle ORM
- Neon PostgreSQL (or in-memory for demo)
- OpenAI GPT-4 (optional, falls back to rule-based)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm)
- Railway account (for deployment)
- Supabase/Neon account (for database)

### Local Development

1. **Clone and install**
```bash
git clone https://github.com/YOUR_USERNAME/mailmind.git
cd mailmind
pnpm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. **Start development servers**
```bash
# Frontend only (with mock data)
cd mailmind
pnpm dev

# Full stack with Docker
docker-compose up
```

### Deployment to Railway

1. **Create Railway account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Push to GitHub**
```bash
cd mailmind
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mailmind.git
git push -u origin main
```

3. **Deploy on Railway**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway auto-detects Node.js

4. **Set environment variables**
   In Railway dashboard → Project → Variables:
   ```
   DATABASE_URL=postgresql://...
   OPENAI_API_KEY=sk-...
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   PORT=3001
   FRONTEND_URL=https://your-app.railway.app
   ```

5. **Add PostgreSQL database**
   - Railway Marketplace → "Postgres"
   - Creates `DATABASE_URL` automatically

6. **Deploy**
   - Railway builds and deploys automatically
   - Your app will be live at `https://your-app.railway.app`

## API Endpoints

### Authentication
```
POST /api/auth/gmail     - OAuth2 Gmail login
POST /api/auth/imap       - Add IMAP account
GET  /api/auth/me        - Get current user
```

### Accounts
```
GET    /api/accounts      - List all accounts
POST   /api/accounts      - Add account
PATCH  /api/accounts/:id  - Update account
DELETE /api/accounts/:id  - Remove account
POST   /api/accounts/:id/sync - Sync emails
```

### Emails
```
GET    /api/emails        - List emails (with filters)
GET    /api/emails/:id    - Get email details
POST   /api/emails/:id/analyze - AI analysis
PATCH  /api/emails/:id/category - Change category
POST   /api/emails/:id/reminder - Set reminder
```

### Tasks
```
GET    /api/tasks         - List all tasks
POST   /api/tasks         - Create task
PATCH  /api/tasks/:id     - Update task
POST   /api/tasks/:id/toggle - Toggle complete
DELETE /api/tasks/:id     - Delete task
```

### Digest
```
GET    /api/digest/weekly - Get weekly digest
GET    /api/digest/history - Get digest history
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
| `DATABASE_URL` | Yes (prod) | Neon PostgreSQL connection string |
| `OPENAI_API_KEY` | No | For advanced AI features |
| `GOOGLE_CLIENT_ID` | No | For Gmail OAuth |
| `GOOGLE_CLIENT_SECRET` | No | For Gmail OAuth |
| `PORT` | No | Server port (default: 3001) |
| `FRONTEND_URL` | Yes (prod) | Frontend URL for CORS |

## Project Structure

```
mailmind/
├── mailmind/              # Frontend React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── store/         # Zustand state management
│   │   ├── types/         # TypeScript types
│   │   └── data/          # Mock data
│   └── package.json
├── server/                # Backend Express API
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/       # Business logic
│   │   ├── db/             # Database schema
│   │   └── index.ts         # Entry point
│   └── package.json
├── docker-compose.yml     # Docker setup
├── Dockerfile.frontend    # Frontend container
├── Dockerfile.backend      # Backend container
├── railway.json           # Railway config
└── README.md
```

## License

MIT
