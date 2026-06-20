import { Email, Account, Task, WeeklyDigest } from '@/types';

// Generate realistic mock accounts
export const mockAccounts: Account[] = [
  {
    id: 'acc-1',
    name: 'Work',
    email: 'natasha@techcorp.io',
    provider: 'gmail',
    status: 'connected',
    lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    unreadCount: 23,
    totalEmails: 1247,
    isEnabled: true,
  },
  {
    id: 'acc-2',
    name: 'Personal',
    email: 'natasha@gmail.com',
    provider: 'gmail',
    status: 'connected',
    lastSync: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    unreadCount: 8,
    totalEmails: 3421,
    isEnabled: true,
  },
  {
    id: 'acc-3',
    name: 'Side Projects',
    email: 'projects@natasha.dev',
    provider: 'gmail',
    status: 'connected',
    lastSync: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    unreadCount: 12,
    totalEmails: 534,
    isEnabled: true,
  },
  {
    id: 'acc-4',
    name: 'Freelance',
    email: 'freelance@natasha.co',
    provider: 'imap',
    server: 'mail.freelance.com',
    port: 993,
    status: 'connected',
    lastSync: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    unreadCount: 5,
    totalEmails: 289,
    isEnabled: true,
  },
];

// Generate realistic mock emails
const emailTemplates = [
  {
    from: { name: 'Sarah Mitchell', email: 'sarah.m@techcorp.io' },
    subject: 'Q4 Budget Review - Need Your Input ASAP',
    preview: 'Hi Natasha, we need to finalize the Q4 budget by tomorrow. Can you review the attached spreadsheet and provide your feedback on the proposed allocations?',
    body: `Hi Natasha,

I hope this email finds you well. We need to finalize the Q4 budget by tomorrow and I need your input on the proposed allocations.

The engineering team has requested additional funding for the new infrastructure project. I've attached the detailed breakdown for your review.

Key points:
1. Current proposed allocation: $450,000
2. Your department's share: $120,000
3. Deadline for approval: Friday, 5 PM

Please let me know if you'd like to discuss this further. Can you also send me the updated figures for your team's quarterly projections?

Best regards,
Sarah

--
Sarah Mitchell
VP of Finance
TechCorp Inc.`,
    category: 'urgent' as const,
    priority: 9,
    hasAttachment: true,
  },
  {
    from: { name: 'GitHub', email: 'notifications@github.com' },
    subject: '[repo/project-api] Pull request #234: Add user authentication',
    preview: '@natashaberness requested your review on "Add user authentication" in project-api. Please review the changes and approve or request modifications.',
    body: `[@natashaberness](https://github.com/alexchen) requested your review on "Add user authentication" in project-api.

Repository: techcorp/project-api
Pull Request #234: Add user authentication

The authentication module is ready for review. This includes:
- JWT token generation
- Password hashing with bcrypt
- Session management
- Login/logout endpoints

Please review the code changes and let me know if you have any questions.

[View pull request](https://github.com/techcorp/project-api/pull/234)
[Review changes](https://github.com/techcorp/project-api/pull/234/files)

---
You're receiving this because you were requested to review.
Unsubscribe from this repository's notifications.`,
    category: 'task' as const,
    priority: 7,
    hasAttachment: false,
  },
  {
    from: { name: 'James Rodriguez', email: 'j.rodriguez@client-inc.com' },
    subject: 'Follow-up: Website Redesign Proposal',
    preview: 'Hi Natasha, just wanted to follow up on the proposal I sent last week. Have you had a chance to discuss it with your team?',
    body: `Hi Natasha,

I wanted to follow up on the website redesign proposal I sent last Tuesday. Have you had a chance to review it with your team?

I understand you're busy, but I wanted to check in since we're working against a deadline for the client launch. Let me know if you need any additional information or if you'd like to schedule a call to discuss further.

Looking forward to hearing from you.

Best,
James Rodriguez
Creative Director
Client Inc.`,
    category: 'follow-up' as const,
    priority: 6,
    hasAttachment: false,
  },
  {
    from: { name: 'AWS', email: 'aws-no-reply@amazon.com' },
    subject: 'Your AWS Bill for June 2024',
    preview: 'Your estimated bill for June 2024 is $2,847.32. This is 12% higher than last month. View your detailed usage and costs in the AWS Billing Console.',
    body: `AWS Account: 1234-5678-9012
Billing Period: June 1 - June 30, 2024

Estimated Charges:
- EC2 Instances: $1,245.00
- S3 Storage: $342.50
- RDS Database: $890.00
- CloudFront: $156.82
- Other Services: $213.00

Total: $2,847.32

This is 12% higher than last month ($2,542.18).

To view detailed usage and costs, visit the AWS Billing Console.

Note: These are estimates and may change as we process your month's usage.

Thank you for using AWS.
Amazon Web Services`,
    category: 'newsletter' as const,
    priority: 3,
    hasAttachment: false,
  },
  {
    from: { name: 'Emily Watson', email: 'emily.watson@startup.co' },
    subject: 'Coffee next Tuesday?',
    preview: "Hey Natasha! It's been a while since we caught up. Would love to grab coffee next Tuesday afternoon if you're free.",
    body: `Hey Natasha!

It's been way too long since we caught up! How have you been? I saw on LinkedIn that you're now leading the platform team at TechCorp - congratulations!

Would love to grab coffee (or tea, your choice) next Tuesday afternoon if you're free. There's a great new spot near my office that just opened.

Let me know what works for you!

Cheers,
Emily

---
Emily Watson
Founder, StartupCo
@emilywatson`,
    category: 'important' as const,
    priority: 5,
    hasAttachment: false,
  },
  {
    from: { name: 'System Admin', email: 'admin@techcorp.io' },
    subject: 'Scheduled Maintenance: Email System',
    preview: 'Planned maintenance for email servers on Saturday, June 22 from 2:00 AM to 6:00 AM EST. Expected downtime: 15-30 minutes.',
    body: `Dear User,

This is a notification about scheduled maintenance for the corporate email system.

Date: Saturday, June 22, 2024
Time: 2:00 AM - 6:00 AM EST
Duration: 15-30 minutes expected downtime

During this window, the following services may be temporarily unavailable:
- Email sending/receiving
- Email search
- Mobile email sync

If you have any urgent emails during this period, please use the webmail interface as a backup.

Thank you for your understanding.

IT Department
TechCorp Inc.`,
    category: 'newsletter' as const,
    priority: 2,
    hasAttachment: false,
  },
  {
    from: { name: 'Michael Chang', email: 'michael.c@techcorp.io' },
    subject: 'Urgent: Server down in production',
    preview: 'Natasha, we have a critical issue. Production server is not responding. Need you to investigate ASAP. Error logs attached.',
    body: `Natasha,

We have a critical issue. The production server is not responding and we're getting alerts from multiple users.

Can you investigate ASAP? I've attached the error logs. This started happening about 30 minutes ago.

The error seems related to the database connection pool hitting its limit. We might need to restart the service or scale up temporarily.

Please prioritize this.

Thanks,
Michael

--
Michael Chang
Senior DevOps Engineer
TechCorp Inc.`,
    category: 'urgent' as const,
    priority: 10,
    hasAttachment: true,
  },
  {
    from: { name: 'Product Team', email: 'product@techcorp.io' },
    subject: 'Feature Freeze: October 15th',
    preview: 'Reminder: Feature freeze for Q4 release is October 15th. All features must be merged by then. Please update your status in the tracker.',
    body: `Team,

This is a reminder that feature freeze for the Q4 release is October 15th.

What this means:
- All features must be merged to main branch
- No new feature development after this date
- Focus on bug fixes and stabilization only
- QA will begin full regression testing

Please update your feature status in the project tracker by EOD Friday.

The release is scheduled for October 25th.

Thanks,
Product Team`,
    category: 'important' as const,
    priority: 6,
    hasAttachment: false,
  },
];

// Generate emails with varied dates
export const mockEmails: Email[] = emailTemplates.map((template, index) => {
  const daysAgo = Math.floor(Math.random() * 7);
  const hoursAgo = Math.floor(Math.random() * 24);
  const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000);

  return {
    id: `email-${index + 1}`,
    accountId: ['acc-1', 'acc-2', 'acc-3', 'acc-4'][index % 4],
    from: template.from,
    to: ['natasha@techcorp.io'],
    subject: template.subject,
    preview: template.preview,
    body: template.body,
    date: date.toISOString(),
    category: template.category,
    isRead: index > 3,
    hasAttachment: template.hasAttachment,
    isStarred: index === 0,
    extractedTasks: [],
    aiAnalysis: {
      priority: template.priority,
      sentiment: 'neutral',
      urgency: template.category === 'urgent' ? 'critical' : template.category === 'important' ? 'high' : 'medium',
      actionItems: template.subject.includes('?') ? ['Review and respond'] : [],
      replyExpectation: template.category === 'urgent' || template.category === 'follow-up' ? 'required' : 'optional',
      summary: template.preview.substring(0, 100),
    },
    isAnalyzing: false,
  };
});

// Generate more emails for realistic inbox
const additionalEmails: Email[] = [
  {
    id: 'email-9',
    accountId: 'acc-1',
    from: { name: 'Lisa Park', email: 'lisa.park@techcorp.io' },
    to: ['natasha@techcorp.io'],
    subject: 'Team lunch this Friday - RSVP needed',
    preview: 'Hi team! We\'re organizing a team lunch this Friday at 12:30 PM. Please RSVP by Wednesday so we can finalize the reservation.',
    body: 'Hi team!\n\nWe\'re organizing a team lunch this Friday at 12:30 PM at the new Italian place downtown.\n\nPlease RSVP by Wednesday so we can finalize the reservation. Let me know if you have any dietary restrictions.',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    category: 'important',
    isRead: false,
    hasAttachment: false,
    isStarred: false,
    extractedTasks: [],
    aiAnalysis: {
      priority: 5,
      sentiment: 'positive',
      urgency: 'medium',
      actionItems: ['RSVP by Wednesday'],
      replyExpectation: 'required',
      summary: 'Team lunch invitation requiring RSVP',
    },
  },
  {
    id: 'email-10',
    accountId: 'acc-2',
    from: { name: 'Amazon', email: 'order-update@amazon.com' },
    to: ['natasha@gmail.com'],
    subject: 'Your order has shipped',
    preview: 'Your package is on its way! Track your delivery: AirPods Pro. Expected delivery: Thursday, June 20.',
    body: 'Your package is on its way!\n\nTrack your delivery in the Amazon app or at amazon.com.\n\nItems: AirPods Pro (2nd generation)\nExpected delivery: Thursday, June 20',
    date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    category: 'newsletter',
    isRead: true,
    hasAttachment: false,
    isStarred: false,
    extractedTasks: [],
    aiAnalysis: {
      priority: 2,
      sentiment: 'neutral',
      urgency: 'low',
      actionItems: [],
      replyExpectation: 'none',
      summary: 'Order shipment notification',
    },
  },
  {
    id: 'email-11',
    accountId: 'acc-3',
    from: { name: 'Stripe', email: 'receipts@stripe.com' },
    to: ['projects@natasha.dev'],
    subject: 'Payment received: $450.00',
    preview: 'You received a payment of $450.00 from Design Studio Co. This payment will be added to your Stripe balance.',
    body: 'You received a payment!\n\nAmount: $450.00\nFrom: Design Studio Co\nFor: Website development - Phase 2\nDate: June 18, 2024',
    date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    category: 'task',
    isRead: false,
    hasAttachment: false,
    isStarred: true,
    extractedTasks: [{
      id: 'task-extracted-1',
      emailId: 'email-11',
      description: 'Send invoice to Design Studio Co',
      priority: 'medium',
      status: 'completed',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    }],
    aiAnalysis: {
      priority: 8,
      sentiment: 'positive',
      urgency: 'medium',
      actionItems: ['Confirm receipt with client'],
      replyExpectation: 'optional',
      summary: 'Payment received for completed work',
    },
  },
  {
    id: 'email-12',
    accountId: 'acc-1',
    from: { name: 'David Kim', email: 'david.kim@techcorp.io' },
    to: ['natasha@techcorp.io'],
    subject: 'Meeting request: Platform architecture review',
    preview: 'Hi Natasha, I\'d like to schedule a 1-hour meeting to discuss the new platform architecture. Are you available next week?',
    body: 'Hi Natasha,\n\nI\'d like to schedule a 1-hour meeting to discuss the new platform architecture. This is part of our quarterly review.\n\nAre you available next week? I\'m free Tuesday or Thursday afternoon.\n\nAgenda:\n1. Current architecture overview\n2. Proposed changes for Q1\n3. Resource requirements\n4. Timeline\n\nPlease let me know your availability.\n\nThanks,\nDavid',
    date: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    category: 'important',
    isRead: false,
    hasAttachment: false,
    isStarred: false,
    extractedTasks: [],
    aiAnalysis: {
      priority: 7,
      sentiment: 'neutral',
      urgency: 'medium',
      actionItems: ['Schedule meeting with David'],
      replyExpectation: 'required',
      summary: 'Meeting request for architecture review',
    },
  },
  {
    id: 'email-13',
    accountId: 'acc-4',
    from: { name: 'New Client', email: 'hello@newclient.com' },
    to: ['freelance@natasha.co'],
    subject: 'Inquiry about mobile app development',
    preview: 'Hello, I found your portfolio online. We\'re looking for someone to build a mobile app for our startup. Would you be available for a call?',
    body: 'Hello Natasha,\n\nI found your portfolio online and I\'m impressed by your work. We\'re a new startup looking for someone to build a mobile app.\n\nThe app would be similar to a task management tool with some custom features. We\'re in the early stages and would love to discuss this further.\n\nWould you be available for a call next week?\n\nBest regards,\nJohn Smith\nCEO, NewClient Startup',
    date: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    category: 'follow-up',
    isRead: false,
    hasAttachment: false,
    isStarred: false,
    extractedTasks: [],
    aiAnalysis: {
      priority: 6,
      sentiment: 'positive',
      urgency: 'medium',
      actionItems: ['Schedule discovery call with new client'],
      replyExpectation: 'required',
      summary: 'Potential new client inquiry',
    },
  },
  {
    id: 'email-14',
    accountId: 'acc-1',
    from: { name: 'HR Department', email: 'hr@techcorp.io' },
    to: ['natasha@techcorp.io'],
    subject: 'Reminder: Complete your performance review',
    preview: 'This is a reminder to complete your Q2 performance review by June 25. Please log into the HR portal to submit your self-assessment.',
    body: 'Dear Natasha,\n\nThis is a reminder to complete your Q2 performance review by June 25, 2024.\n\nPlease log into the HR portal and submit your self-assessment. Your manager will then review and schedule a 1:1 meeting with you.\n\nSteps:\n1. Log into HR portal\n2. Complete self-assessment form\n3. Set goals for Q3\n\nThank you,\nHR Department',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'important',
    isRead: true,
    hasAttachment: false,
    isStarred: false,
    extractedTasks: [{
      id: 'task-hr-1',
      emailId: 'email-14',
      description: 'Complete Q2 performance review',
      dueDate: '2024-06-25',
      priority: 'high',
      status: 'pending',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    }],
    aiAnalysis: {
      priority: 8,
      sentiment: 'neutral',
      urgency: 'high',
      actionItems: ['Complete self-assessment in HR portal'],
      replyExpectation: 'none',
      summary: 'Performance review deadline reminder',
    },
  },
  {
    id: 'email-15',
    accountId: 'acc-2',
    from: { name: 'Newsletter', email: 'newsletter@javascriptweekly.com' },
    to: ['natasha@gmail.com'],
    subject: 'JavaScript Weekly #623',
    preview: 'This week: React 19 Beta, TypeScript 5.5, and the future of JavaScript runtimes. Plus: 15 trending projects.',
    body: 'JavaScript Weekly #623\n\nWelcome to issue #623!\n\nThis week\'s top stories:\n1. React 19 Beta released\n2. TypeScript 5.5 is out\n3. Deno 2.0 approaching\n\nTrending projects, tutorials, and more inside.',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'newsletter',
    isRead: true,
    hasAttachment: false,
    isStarred: false,
    extractedTasks: [],
    aiAnalysis: {
      priority: 1,
      sentiment: 'neutral',
      urgency: 'low',
      actionItems: [],
      replyExpectation: 'none',
      summary: 'Weekly JavaScript newsletter',
    },
  },
];

// Combine and sort by date
export const allMockEmails = [...mockEmails, ...additionalEmails].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

// Mock tasks
export const mockTasks: Task[] = [
  {
    id: 'task-1',
    emailId: 'email-1',
    description: 'Review Q4 budget and provide feedback',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-2',
    emailId: 'email-2',
    description: 'Review PR #234: Add user authentication',
    priority: 'medium',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-3',
    emailId: 'email-14',
    description: 'Complete Q2 performance review',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-4',
    emailId: 'email-7',
    description: 'Investigate production server issue',
    priority: 'high',
    status: 'completed',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-5',
    emailId: 'email-12',
    description: 'Schedule architecture review meeting with David',
    priority: 'medium',
    status: 'pending',
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-6',
    emailId: 'email-13',
    description: 'Schedule discovery call with new client',
    priority: 'medium',
    status: 'pending',
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock weekly digest
export const mockDigest: WeeklyDigest = {
  id: 'digest-1',
  weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  weekEnd: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  totalEmails: 847,
  analyzedEmails: 234,
  urgentReplies: 3,
  tasksCreated: 23,
  tasksCompleted: 18,
  pendingTasks: 5,
  followUps: [
    { id: '1', subject: 'Website Redesign Proposal', sender: 'James Rodriguez', daysAgo: 5 },
    { id: '2', subject: 'Follow-up: Mobile app inquiry', sender: 'John Smith', daysAgo: 2 },
  ],
  topSenders: [
    { email: 'sarah.m@techcorp.io', name: 'Sarah Mitchell', count: 45 },
    { email: 'notifications@github.com', name: 'GitHub', count: 32 },
    { email: 'hr@techcorp.io', name: 'HR Department', count: 28 },
  ],
  insights: [
    'You respond fastest to emails received before 10 AM',
    'Tuesday afternoons have 40% higher email engagement',
    'Consider setting up filters for GitHub notifications',
    '3 newsletters have low open rates - consider unsubscribing',
  ],
  createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
};
