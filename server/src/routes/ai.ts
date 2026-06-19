import { Router, Request, Response } from 'express';
import { analyzeEmail, generateDigestInsights, suggestEmailReply, summarizeEmailThread } from '../services/ai.js';

export const aiRoutes = Router();

// Generic email analysis
aiRoutes.post('/analyze', async (req: Request, res: Response) => {
  const { subject, body, senderName, senderEmail } = req.body;

  if (!subject) {
    return res.status(400).json({ error: 'Subject is required' });
  }

  try {
    const analysis = await analyzeEmail(
      subject,
      body || '',
      senderName || 'Unknown',
      senderEmail || 'unknown@unknown.com'
    );

    res.json(analysis);
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Batch analyze multiple emails
aiRoutes.post('/analyze/batch', async (req: Request, res: Response) => {
  const { emails } = req.body;

  if (!Array.isArray(emails)) {
    return res.status(400).json({ error: 'emails must be an array' });
  }

  if (emails.length > 20) {
    return res.status(400).json({ error: 'Maximum 20 emails per batch' });
  }

  try {
    const results = await Promise.all(
      emails.map(async (email) => {
        const analysis = await analyzeEmail(
          email.subject,
          email.body || '',
          email.senderName || 'Unknown',
          email.senderEmail || 'unknown@unknown.com'
        );
        return { id: email.id, analysis };
      })
    );

    res.json(results);
  } catch (error) {
    console.error('Batch analysis error:', error);
    res.status(500).json({ error: 'Batch analysis failed' });
  }
});

// Generate insights
aiRoutes.post('/insights', async (req: Request, res: Response) => {
  const { emailCount, tasksCreated, tasksCompleted, topSenders } = req.body;

  try {
    const insights = await generateDigestInsights(
      emailCount || 0,
      { created: tasksCreated || 0, completed: tasksCompleted || 0 },
      topSenders || []
    );

    res.json({ insights });
  } catch (error) {
    console.error('Insights generation error:', error);
    res.status(500).json({ error: 'Insights generation failed' });
  }
});

// Suggest reply using Kimi
aiRoutes.post('/suggest-reply', async (req: Request, res: Response) => {
  const { subject, body, senderName } = req.body;

  if (!body) {
    return res.status(400).json({ error: 'Email body is required' });
  }

  try {
    const reply = await suggestEmailReply(subject || '', body, senderName || 'Unknown');
    res.json({ reply });
  } catch (error) {
    console.error('Suggest reply error:', error);
    res.status(500).json({ error: 'Failed to suggest reply' });
  }
});

// Summarize email thread
aiRoutes.post('/summarize', async (req: Request, res: Response) => {
  const { emails } = req.body;

  if (!Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ error: 'emails array is required' });
  }

  try {
    const summary = await summarizeEmailThread(emails);
    res.json({
      summary,
      emailCount: emails.length,
    });
  } catch (error) {
    console.error('Summarize error:', error);
    res.status(500).json({ error: 'Failed to summarize thread' });
  }
});

// Suggest actions based on email content (using Kimi)
aiRoutes.post('/suggest-actions', async (req: Request, res: Response) => {
  const { subject, body, senderName } = req.body;

  if (!body) {
    return res.status(400).json({ error: 'Email body is required' });
  }

  try {
    // Reuse the analyzeEmail function to get action items
    const analysis = await analyzeEmail(
      subject || '',
      body,
      senderName || 'Unknown',
      'unknown@unknown.com'
    );

    const actions = analysis.actionItems.map((item, index) => ({
      type: analysis.replyExpectation === 'required' ? 'reply' : 'task',
      description: item,
      priority: analysis.priority >= 8 ? 'high' : analysis.priority >= 5 ? 'medium' : 'low',
    }));

    res.json({ actions });
  } catch (error) {
    console.error('Suggest actions error:', error);
    res.status(500).json({ error: 'Failed to suggest actions' });
  }
});
