// Kimi API (Moonshot AI) integration
// API Docs: https://platform.moonshot.cn/docs/api/chat

const KIMI_API_KEY = process.env.KIMI_API_KEY;
const KIMI_API_URL = 'https://api.moonshot.cn/v1/chat/completions';

export interface EmailAnalysis {
  priority: number; // 1-10
  sentiment: 'positive' | 'neutral' | 'negative';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  actionItems: string[];
  replyExpectation: 'required' | 'optional' | 'none';
  category: 'urgent' | 'important' | 'follow-up' | 'task' | 'newsletter' | 'archive';
}

async function callKimi(prompt: string, systemPrompt: string): Promise<string> {
  if (!KIMI_API_KEY) {
    throw new Error('KIMI_API_KEY not configured');
  }

  const response = await fetch(KIMI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KIMI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'moonshot-v1-8k', // Kimi 8K context model
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`Kimi API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function analyzeEmail(
  subject: string,
  body: string,
  senderName: string,
  senderEmail: string
): Promise<EmailAnalysis> {
  // If Kimi API is configured, use it
  if (KIMI_API_KEY) {
    try {
      const systemPrompt = `你是一位专业的邮件分析师。请分析邮件并提取以下信息：
1. Priority (1-10, 10为最紧急)
2. Sentiment (positive/neutral/negative)
3. Urgency level (low/medium/high/critical)
4. A brief summary (max 100 chars)
5. Action items detected (array, can be empty)
6. Reply expectation (required/optional/none)
7. Category (urgent/important/follow-up/task/newsletter/archive)

请仅返回符合以下结构的JSON：
{
  "priority": number,
  "sentiment": "positive" | "neutral" | "negative",
  "urgency": "low" | "medium" | "high" | "critical",
  "summary": "string max 100 chars",
  "actionItems": ["action1", "action2"],
  "replyExpectation": "required" | "optional" | "none",
  "category": "urgent" | "important" | "follow-up" | "task" | "newsletter" | "archive"
}`;

      const userPrompt = `分析这封邮件：\n\n发件人: ${senderName} (${senderEmail})\n主题: ${subject}\n\n正文:\n${body.substring(0, 2000)}`;

      const result = await callKimi(userPrompt, systemPrompt);
      const parsed = JSON.parse(result || '{}');

      return {
        priority: parsed.priority || 5,
        sentiment: parsed.sentiment || 'neutral',
        urgency: parsed.urgency || 'medium',
        summary: parsed.summary || '',
        actionItems: parsed.actionItems || [],
        replyExpectation: parsed.replyExpectation || 'optional',
        category: parsed.category || 'important',
      };
    } catch (error) {
      console.error('Kimi analysis failed:', error);
      // Fall through to rule-based analysis
    }
  }

  // Fallback: Rule-based analysis
  return ruleBasedAnalysis(subject, body, senderEmail);
}

function ruleBasedAnalysis(
  subject: string,
  body: string,
  senderEmail: string
): EmailAnalysis {
  const text = `${subject} ${body}`.toLowerCase();

  // Urgency keywords
  const urgentKeywords = ['urgent', 'asap', 'immediately', 'critical', 'emergency', 'deadline today', '紧急', '速办'];
  const highUrgencyKeywords = ['important', 'please review', 'need your input', 'waiting', 'action required', '重要', '请审核'];
  const lowUrgencyKeywords = ['newsletter', 'update', 'digest', 'notification', 'automated', '订阅', '更新'];

  // Action keywords
  const actionKeywords = ['please', 'can you', 'could you', 'would you', 'need', 'should', 'must', '请', '能否', '麻烦'];
  const hasAction = actionKeywords.some(k => text.includes(k));

  // Reply expectation
  const asksQuestion = text.includes('?') || text.includes('？');
  const hasCommitment = /\b(i'll|i will|we'll|we will|我会|我们会)\b/i.test(text);
  const replyRequired = asksQuestion || hasCommitment;

  // Newsletter detection
  const isNewsletter = lowUrgencyKeywords.some(k => text.includes(k)) ||
    /^(no-reply|noreply|notification|newsletter|updates?)/i.test(senderEmail);

  // Calculate priority
  let priority = 5;
  if (urgentKeywords.some(k => text.includes(k))) priority = 9;
  else if (highUrgencyKeywords.some(k => text.includes(k))) priority = 7;
  else if (isNewsletter) priority = 2;
  else if (hasAction) priority = 6;

  // Determine category
  let category: EmailAnalysis['category'] = 'important';
  if (priority >= 9) category = 'urgent';
  else if (isNewsletter) category = 'newsletter';
  else if (replyRequired && priority >= 6) category = 'follow-up';
  else if (hasAction) category = 'task';

  // Extract simple action items
  const actionItems: string[] = [];
  if (hasAction) {
    actionItems.push('Review and respond / 查看并回复');
  }

  // Generate summary (first 100 chars of preview)
  const summary = body.substring(0, 100).replace(/\n/g, ' ').trim();

  return {
    priority,
    sentiment: 'neutral',
    urgency: priority >= 9 ? 'critical' : priority >= 7 ? 'high' : priority >= 5 ? 'medium' : 'low',
    summary,
    actionItems,
    replyExpectation: replyRequired ? 'required' : 'optional',
    category,
  };
}

export async function generateDigestInsights(
  emailCount: number,
  taskStats: { created: number; completed: number },
  topSenders: Array<{ email: string; count: number }>
): Promise<string[]> {
  const insights: string[] = [];

  if (KIMI_API_KEY) {
    try {
      const systemPrompt = `你是一位邮件生产力教练。根据邮件统计数据生成3-4条简短、可操作的洞察。要具体且有帮助。请仅返回JSON字符串数组。`;

      const userPrompt = `生成本周邮件统计的洞察：
- 总邮件数: ${emailCount}
- 创建的任务: ${taskStats.created}
- 完成的任务: ${taskStats.completed}
- Top发件人: ${topSenders.map(s => `${s.email} (${s.count})`).join(', ')}`;

      const result = await callKimi(userPrompt, systemPrompt);
      const parsed = JSON.parse(result || '{}');
      return parsed.insights || [];
    } catch (error) {
      console.error('Kimi insights failed:', error);
    }
  }

  // Fallback insights
  const completionRate = taskStats.created > 0
    ? Math.round((taskStats.completed / taskStats.created) * 100)
    : 0;

  insights.push(`本周你完成了 ${completionRate}% 的任务`);

  if (topSenders.length > 0) {
    insights.push(`${topSenders[0].email} 发送了最多邮件 (${topSenders[0].count})`);
  }

  if (emailCount > 500) {
    insights.push('建议退订低优先级的订阅邮件');
  }

  return insights;
}

// Additional Kimi-powered functions
export async function suggestEmailReply(
  subject: string,
  body: string,
  senderName: string
): Promise<string> {
  if (!KIMI_API_KEY) {
    return '';
  }

  try {
    const systemPrompt = `你是一位专业的邮件助手。根据邮件内容生成一封简洁、专业的回复草稿。用中文回复。`;

    const userPrompt = `为以下邮件生成回复草稿：\n\n发件人: ${senderName}\n主题: ${subject}\n\n正文:\n${body.substring(0, 2000)}`;

    return await callKimi(userPrompt, systemPrompt);
  } catch (error) {
    console.error('Kimi reply suggestion failed:', error);
    return '';
  }
}

export async function summarizeEmailThread(
  emails: Array<{ fromName: string; subject: string; body: string; date: string }>
): Promise<string> {
  if (!KIMI_API_KEY || emails.length === 0) {
    return '';
  }

  try {
    const systemPrompt = `你是一位邮件总结助手。用2-3句话总结邮件对话线程，重点关注主要话题和任何待处理的操作项。用中文回复。`;

    const threadContent = emails
      .slice(0, 10)
      .map((e, i) => `[邮件 ${i + 1}] 发件人: ${e.fromName}\n日期: ${e.date}\n${e.body || e.subject}`)
      .join('\n\n---\n\n');

    return await callKimi(threadContent, systemPrompt);
  } catch (error) {
    console.error('Kimi thread summary failed:', error);
    return '';
  }
}
