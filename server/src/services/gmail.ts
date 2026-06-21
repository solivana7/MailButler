import { accountRepo, emailRepo } from '../db/repository.js';
import { generateId } from '../db/index.js';

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

interface GmailHeader {
  name: string;
  value: string;
}

interface GmailMessagePart {
  mimeType?: string;
  body?: {
    data?: string;
    size?: number;
  };
  parts?: GmailMessagePart[];
}

interface GmailMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  payload?: {
    headers?: GmailHeader[];
    parts?: GmailMessagePart[];
    body?: {
      data?: string;
      size?: number;
    };
    mimeType?: string;
  };
  internalDate?: string;
}

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = base64.length % 4;
  const padded = padding ? base64 + '='.repeat(4 - padding) : base64;
  try {
    return Buffer.from(padded, 'base64').toString('utf-8');
  } catch {
    return '';
  }
}

function findBodyPart(parts: GmailMessagePart[] | undefined, mimeType: string): string {
  if (!parts) return '';

  for (const part of parts) {
    if (part.mimeType === mimeType && part.body?.data) {
      return base64UrlDecode(part.body.data);
    }
    if (part.parts) {
      const found = findBodyPart(part.parts, mimeType);
      if (found) return found;
    }
  }

  return '';
}

function parseMessage(message: GmailMessage) {
  const headers = message.payload?.headers || [];
  const getHeader = (name: string) =>
    headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  const from = getHeader('From');
  const to = getHeader('To');
  const subject = getHeader('Subject') || '(no subject)';
  const date = getHeader('Date');

  const fromMatch = from.match(/(.*?)\s*<([^>]+)>/);
  const fromName = fromMatch ? fromMatch[1].trim() : from;
  const fromEmail = fromMatch ? fromMatch[2].trim() : from;

  const toList = to
    .split(',')
    .map((addr) => addr.trim())
    .filter(Boolean);

  const bodyText =
    findBodyPart(message.payload?.parts, 'text/plain') ||
    (message.payload?.body?.data ? base64UrlDecode(message.payload.body.data) : '') ||
    '';

  const bodyHtml =
    findBodyPart(message.payload?.parts, 'text/html') ||
    '';

  const snippet = message.snippet || bodyText.slice(0, 200);
  const isUnread = message.labelIds?.includes('UNREAD') ?? false;
  const isStarred = message.labelIds?.includes('STARRED') ?? false;
  const hasAttachment = message.labelIds?.includes('HAS_ATTACHMENT') ?? false;

  const internalDate = message.internalDate
    ? new Date(parseInt(message.internalDate, 10)).toISOString()
    : new Date().toISOString();

  return {
    messageId: message.id,
    fromName,
    fromEmail,
    to: JSON.stringify(toList),
    subject,
    preview: snippet,
    body: bodyText,
    bodyHtml: bodyHtml || null,
    date: internalDate,
    isRead: !isUnread,
    isStarred,
    hasAttachment,
    category: null,
    aiPriority: null,
    aiSentiment: null,
    aiUrgency: null,
    aiSummary: null,
    aiActionItems: '[]',
    replyExpectation: null,
  };
}

async function gmailApiRequest<T>(accessToken: string, path: string): Promise<T | null> {
  const res = await fetch(`${GMAIL_API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`Gmail API error (${path}):`, res.status, err);
    return null;
  }

  return (await res.json()) as T;
}

export async function syncGmailAccount(accountId: string): Promise<{
  success: boolean;
  message: string;
  syncedCount?: number;
}> {
  const account = await accountRepo.findById(accountId);

  if (!account) {
    return { success: false, message: 'Account not found' };
  }

  if (account.provider !== 'gmail') {
    return { success: false, message: 'Account is not a Gmail account' };
  }

  if (!account.accessToken) {
    return { success: false, message: 'No access token available' };
  }

  const listData = await gmailApiRequest<{ messages?: Array<{ id: string; threadId: string }> }>(
    account.accessToken,
    '/messages?maxResults=50&labelIds=INBOX'
  );

  if (!listData || !listData.messages) {
    return { success: false, message: 'Failed to fetch Gmail message list' };
  }

  const existingMessages = new Set<string>();
  const allEmails = await emailRepo.findAll({ limit: 10000 });
  for (const email of allEmails.emails) {
    existingMessages.add(email.messageId);
  }

  let syncedCount = 0;
  const now = new Date().toISOString();

  for (const msgRef of listData.messages) {
    if (existingMessages.has(msgRef.id)) continue;

    const message = await gmailApiRequest<GmailMessage>(
      account.accessToken,
      `/messages/${msgRef.id}?format=full`
    );

    if (!message || !message.payload) continue;

    const parsed = parseMessage(message);

    await emailRepo.create({
      id: `email-${generateId()}`,
      userId: account.userId,
      accountId: account.id,
      ...parsed,
      createdAt: now,
      updatedAt: now,
    });

    syncedCount++;
  }

  const accountEmails = await emailRepo.findAll({ accountId: account.id, limit: 10000 });
  const unreadCount = accountEmails.emails.filter((e) => !e.isRead).length;

  await accountRepo.update(accountId, {
    totalEmails: accountEmails.emails.length,
    unreadCount,
    lastSyncAt: new Date().toISOString(),
  });

  return {
    success: true,
    message: `Synced ${syncedCount} new emails`,
    syncedCount,
  };
}
