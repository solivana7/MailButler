import Imap from 'imap';
import { simpleParser, ParsedMail } from 'mailparser';
import { accountRepo, emailRepo } from '../db/repository.js';
import { generateId } from '../db/index.js';

function openInbox(imap: Imap): Promise<Imap.Box> {
  return new Promise((resolve, reject) => {
    imap.openBox('INBOX', true, (err, box) => {
      if (err) return reject(err);
      resolve(box);
    });
  });
}

function search(imap: Imap, criteria: any[]): Promise<number[]> {
  return new Promise((resolve, reject) => {
    imap.search(criteria, (err, results) => {
      if (err) return reject(err);
      resolve(results || []);
    });
  });
}

function fetchMessages(imap: Imap, sources: number[]): Promise<ParsedMail[]> {
  return new Promise((resolve, reject) => {
    const messages: ParsedMail[] = [];
    const fetch = imap.fetch(sources, { bodies: '' });

    fetch.on('message', (msg) => {
      let buffer = Buffer.alloc(0);
      msg.on('body', (stream) => {
        stream.on('data', (chunk: Buffer) => {
          buffer = Buffer.concat([buffer, chunk]);
        });
      });
      msg.once('end', async () => {
        try {
          const parsed = await simpleParser(buffer);
          messages.push(parsed);
        } catch (e) {
          console.error('Failed to parse IMAP message:', e);
        }
      });
    });

    fetch.once('error', reject);
    fetch.once('end', () => resolve(messages));
  });
}

export async function syncImapAccount(accountId: string): Promise<{
  success: boolean;
  message: string;
  syncedCount?: number;
}> {
  const account = await accountRepo.findById(accountId);

  if (!account) {
    return { success: false, message: 'Account not found' };
  }

  if (account.provider !== 'imap') {
    return { success: false, message: 'Account is not an IMAP account' };
  }

  if (!account.imapServer || !account.imapPort || !account.imapUser || !account.imapPassword) {
    return { success: false, message: 'Missing IMAP credentials' };
  }

  const imap = new Imap({
    user: account.imapUser,
    password: account.imapPassword,
    host: account.imapServer,
    port: account.imapPort,
    tls: account.imapPort === 993,
    tlsOptions: { rejectUnauthorized: false },
  });

  return new Promise((resolve) => {
    imap.once('ready', async () => {
      try {
        await openInbox(imap);
        const results = await search(imap, ['ALL']);
        const recent = results.slice(-50);

        if (recent.length === 0) {
          imap.end();
          return resolve({ success: true, message: 'No messages to sync', syncedCount: 0 });
        }

        const allEmails = await emailRepo.findAll({ accountId: account.id, limit: 10000 });
        const existingIds = new Set(allEmails.emails.map((e) => e.messageId));

        const messages = await fetchMessages(imap, recent);
        let syncedCount = 0;
        const now = new Date().toISOString();

        for (const msg of messages) {
          const messageId = msg.messageId || `imap-${Date.now()}-${Math.random()}`;
          if (existingIds.has(messageId)) continue;

          const fromObj = Array.isArray(msg.from) ? msg.from[0] : msg.from;
          const from = fromObj?.value?.[0];
          const toObj = Array.isArray(msg.to) ? msg.to[0] : msg.to;
          const toList = ((toObj?.value || []) as Array<{ address?: string }>)
            .map((a) => a.address)
            .filter(Boolean) as string[];
          const bodyText = msg.text || '';
          const bodyHtml = msg.html || null;
          const preview = msg.subject
            ? `${msg.subject} — ${bodyText.slice(0, 120)}`
            : bodyText.slice(0, 150);

          await emailRepo.create({
            id: `email-${generateId()}`,
            userId: account.userId,
            accountId: account.id,
            messageId,
            fromName: from?.name || from?.address || 'Unknown',
            fromEmail: from?.address || 'unknown@example.com',
            to: JSON.stringify(toList),
            subject: msg.subject || '(no subject)',
            preview,
            body: bodyText,
            bodyHtml,
            date: msg.date?.toISOString() || now,
            isRead: true,
            isStarred: false,
            hasAttachment: msg.attachments.length > 0,
            category: null,
            aiPriority: null,
            aiSentiment: null,
            aiUrgency: null,
            aiSummary: null,
            aiActionItems: '[]',
            replyExpectation: null,
            createdAt: now,
            updatedAt: now,
          });

          syncedCount++;
        }

        const updatedEmails = await emailRepo.findAll({ accountId: account.id, limit: 10000 });
        const unreadCount = updatedEmails.emails.filter((e) => !e.isRead).length;
        await accountRepo.update(account.id, {
          totalEmails: updatedEmails.emails.length,
          unreadCount,
          lastSyncAt: new Date().toISOString(),
        });

        imap.end();
        resolve({ success: true, message: `Synced ${syncedCount} new emails`, syncedCount });
      } catch (error) {
        console.error('IMAP sync error:', error);
        imap.end();
        resolve({ success: false, message: `IMAP sync failed: ${(error as Error).message}` });
      }
    });

    imap.once('error', (err) => {
      console.error('IMAP connection error:', err);
      resolve({ success: false, message: `IMAP connection failed: ${err.message}` });
    });

    imap.connect();
  });
}
