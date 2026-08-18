const Anthropic = require('@anthropic-ai/sdk');
const { z } = require('zod');
const { zodOutputFormat } = require('@anthropic-ai/sdk/helpers/zod');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const CALENDLY_LINK =
  process.env.CALENDLY_LINK || 'https://calendly.com/luke-prosper-mfg/30min';

// Comma-separated list of allowed origins, or '*' to allow any embedder.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '*')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

// Keep in sync with the welcome message rendered in index.html.
const WELCOME_MESSAGE =
  "Hey there! 👋 I'm here to help with your apparel manufacturing, screen printing, or fulfillment needs. Before we dive in, what's your name?";

const MAX_HISTORY_MESSAGES = 40;
const MAX_MESSAGE_CHARS = 4000;

const SYSTEM_PROMPT = `You are a friendly sales and operations assistant for Prosper Manufacturing, a provider of end-to-end apparel production and fulfillment services.

ABOUT PROSPER MANUFACTURING:
- Three core pillars: Manufacturing, Screen Printing, and Fulfillment
- Manufacturing: Full-scale manufacturing with quality control, from prototyping to mass production
- Screen Printing & Custom Apparel: Premium screen printing and DTG services for t-shirts, hoodies, sweatshirts, and sweatpants
- Fulfillment: 24-hour package injection, B2B and DTC services, real-time inventory management, cross-border logistics from Tijuana, Mexico, Section 321 expertise
- Positioning: "the gold standard in cross-border fulfillment," with "from design to delivery" capabilities

CONVERSATION STATE:
You have already sent this opening message to the visitor: "${WELCOME_MESSAGE}"
The conversation history you receive begins with the visitor's reply to it. Do not greet them again.

YOUR GOALS (in order):
1. Capture lead details naturally in conversation: name, email, company.
2. Qualify with 2-3 questions, ONE AT A TIME: what they need (manufacturing, screen printing, fulfillment, or a combination), rough monthly order volume, and desired timeline.
3. Answer questions about Prosper's services.
4. Once you have at least a name and an email AND some sense of what they need, offer to book a call.

BEHAVIOR RULES:
- Conversational and friendly, but professional.
- Ask ONE question at a time, never multiple questions in one message.
- Keep replies to 2-3 sentences unless explaining a service in depth.
- Use Prosper's language: "end-to-end," "cross-border fulfillment," "24-hour package injection."
- If you don't know a specific detail (exact pricing, lead times, capacity), say so plainly and suggest a call to nail it down. Never invent numbers, quotes, or commitments.

RESPONSE FORMAT:
Reply with a JSON object matching the required schema.
- "reply": the ONLY text the visitor sees. Plain conversational text, no JSON, no markers, no field labels.
- "lead": everything you have learned SO FAR, carried forward every turn. Use an empty string "" for anything you don't know yet. Never guess or fill a field with a placeholder.
  - "interest" should be one of: manufacturing, screen printing, fulfillment, combination, or "" if unclear.
- "ready_to_schedule": true only when you have a name AND an email AND a sense of what they need, or when the visitor asks to talk to someone. Otherwise false. When true, your "reply" should invite them to book a call — a booking button is shown to them automatically, so do not paste a URL.
- "quick_replies": 0-3 very short tappable suggestions (max 4 words each) that answer YOUR question. Give an empty array when a canned answer wouldn't make sense, such as when you asked for their name or email.`;

const ReplySchema = z.object({
  reply: z.string(),
  lead: z.object({
    name: z.string(),
    email: z.string(),
    company: z.string(),
    interest: z.string(),
    volume: z.string(),
    timeline: z.string(),
  }),
  ready_to_schedule: z.boolean(),
  quick_replies: z.array(z.string()),
});

function resolveOrigin(req) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes('*')) return '*';
  if (origin && ALLOWED_ORIGINS.includes(origin)) return origin;
  return null;
}

/**
 * Validates and normalizes the client-supplied transcript.
 * Returns { messages } on success or { error } describing the first problem found.
 */
function normalizeMessages(raw) {
  if (!Array.isArray(raw)) return { error: 'messages must be an array' };

  const cleaned = [];
  for (const msg of raw) {
    if (!msg || typeof msg !== 'object') continue;
    if (msg.role !== 'user' && msg.role !== 'assistant') continue;
    if (typeof msg.content !== 'string') continue;

    const content = msg.content.trim().slice(0, MAX_MESSAGE_CHARS);
    if (!content) continue;

    cleaned.push({ role: msg.role, content });
  }

  // Keep the most recent exchanges; the system prompt carries the standing context.
  const recent = cleaned.slice(-MAX_HISTORY_MESSAGES);

  // The Messages API requires the transcript to open with a user turn.
  const firstUser = recent.findIndex(m => m.role === 'user');
  if (firstUser === -1) return { error: 'messages must contain at least one user message' };

  return { messages: recent.slice(firstUser) };
}

/** Drops empty strings so a blank field never overwrites something we already know. */
function mergeLead(previous, incoming) {
  const merged = { ...previous };
  for (const [key, value] of Object.entries(incoming)) {
    if (typeof value === 'string' && value.trim()) {
      merged[key] = value.trim();
    }
  }
  return merged;
}

module.exports = async (req, res) => {
  const origin = resolveOrigin(req);
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is not set');
    return res.status(500).json({ error: 'Chat is not configured yet.' });
  }

  try {
    const body = req.body || {};
    const { messages, error } = normalizeMessages(body.messages);
    if (error) {
      return res.status(400).json({ error });
    }

    const previousLead =
      body.lead && typeof body.lead === 'object' && !Array.isArray(body.lead)
        ? body.lead
        : {};

    const response = await anthropic.messages.parse({
      model: 'claude-opus-5',
      max_tokens: 2048,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      thinking: { type: 'adaptive' },
      output_config: {
        // 'low' keeps replies snappy — this is a live chat widget, not a research task.
        effort: 'low',
        format: zodOutputFormat(ReplySchema),
      },
      messages,
    });

    if (response.stop_reason === 'refusal') {
      console.warn('Model refused:', response.stop_details);
      return res.status(200).json({
        reply: "Sorry, I can't help with that one. Want me to connect you with the team instead?",
        lead: previousLead,
        quickReplies: ['Book a call'],
        bookingUrl: null,
      });
    }

    const parsed = response.parsed_output;
    if (!parsed) {
      throw new Error('Model response did not match the expected schema');
    }

    const lead = mergeLead(previousLead, parsed.lead);
    const quickReplies = parsed.quick_replies
      .filter(q => typeof q === 'string' && q.trim())
      .slice(0, 3)
      .map(q => q.trim());

    // In production, this is where the lead would be pushed to a CRM.
    if (Object.keys(lead).length > 0) {
      console.log('Lead state:', lead);
    }

    return res.status(200).json({
      reply: parsed.reply,
      lead,
      quickReplies,
      bookingUrl: parsed.ready_to_schedule ? CALENDLY_LINK : null,
    });
  } catch (err) {
    // Log the detail server-side; never hand internals back to the browser.
    console.error('Chat API error:', err);
    return res.status(500).json({ error: 'Failed to process message' });
  }
};
