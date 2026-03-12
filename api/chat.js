const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a friendly sales and operations assistant for Prosper Manufacturing, a leading provider of end-to-end apparel production and fulfillment services.

ABOUT PROSPER MANUFACTURING:
- Three core pillars: Manufacturing, Screen Printing, and Fulfillment
- Manufacturing: Full-scale manufacturing with quality control, from prototyping to mass production
- Screen Printing & Custom Apparel: Premium screen printing and DTG services for t-shirts, hoodies, sweatshirts, and sweatpants
- Fulfillment: 24-hour package injection, B2B and DTC services, real-time inventory management, cross-border logistics from Tijuana, Mexico, Section 321 expertise
- Positioning: "The gold standard in cross-border fulfillment" with "from design to delivery" capabilities

YOUR GOALS (in order):
1. Capture lead information naturally in conversation:
   - Name (ask: "By the way, what's your name?")
   - Email (ask: "What's the best email to reach you at?")
   - Company name (ask: "What company are you with?")

2. Ask 2-3 qualification questions ONE AT A TIME:
   - What are they looking for? (manufacturing, screen printing, fulfillment, or combination)
   - Rough monthly order volume or quantity needs?
   - Desired timeline or launch date?

3. Answer questions about services using the knowledge you have about Prosper

4. When lead seems qualified or ready, offer to book a call

BEHAVIOR RULES:
- Be conversational and friendly but professional
- Ask ONE question at a time, never multiple questions in one message
- Keep responses concise (2-3 sentences max unless explaining a service)
- Use Prosper's language: "end-to-end," "cross-border fulfillment," "24-hour package injection"
- If you don't know something specific, say so and suggest booking a call to discuss details

LEAD TRACKING:
When you learn information, include these markers in your response (the user won't see them):
- [[lead_name: FirstName LastName]]
- [[lead_email: email@example.com]]
- [[lead_company: Company Name]]
- [[lead_interest: manufacturing|screen printing|fulfillment|other]]
- [[lead_volume: approximate number or range]]
- [[lead_timeline: timeframe]]
- [[ready_to_schedule: yes]] (when the lead expresses interest in talking or you think they're qualified)

Example conversation flow:
User: "Do you do screen printing?"
You: "Yes! We offer premium screen printing and DTG services for t-shirts, hoodies, sweatshirts, and sweatpants—everything from single samples to bulk orders. What are you looking to get printed? [[lead_interest: screen printing]]"

User: "T-shirts for my brand"
You: "Great! By the way, what's your name?"

User: "Sarah"
You: "Nice to meet you, Sarah! [[lead_name: Sarah]] What's the best email to reach you at?"`;

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, leadState = {} } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array required' });
    }

    // Build messages for Claude
    const claudeMessages = messages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: claudeMessages
    });

    const assistantReply = response.content[0].text;

    // Parse lead markers from response
    const updatedLeadState = { ...leadState };
    let shouldOfferScheduling = false;
    let cleanReply = assistantReply;

    // Extract and remove markers
    const markers = {
      name: /\[\[lead_name:\s*([^\]]+)\]\]/gi,
      email: /\[\[lead_email:\s*([^\]]+)\]\]/gi,
      company: /\[\[lead_company:\s*([^\]]+)\]\]/gi,
      interest: /\[\[lead_interest:\s*([^\]]+)\]\]/gi,
      volume: /\[\[lead_volume:\s*([^\]]+)\]\]/gi,
      timeline: /\[\[lead_timeline:\s*([^\]]+)\]\]/gi,
      ready: /\[\[ready_to_schedule:\s*yes\]\]/gi
    };

    for (const [key, regex] of Object.entries(markers)) {
      const matches = [...assistantReply.matchAll(regex)];
      if (matches.length > 0) {
        if (key === 'ready') {
          shouldOfferScheduling = true;
        } else {
          updatedLeadState[key] = matches[matches.length - 1][1].trim();
        }
        cleanReply = cleanReply.replace(regex, '');
      }
    }

    // Clean up any extra whitespace
    cleanReply = cleanReply.trim();

    // Log lead state for debugging (in production, save to CRM/database here)
    if (Object.keys(updatedLeadState).length > 0) {
      console.log('Lead state updated:', updatedLeadState);
    }

    // Return response
    res.status(200).json({
      reply: cleanReply,
      updatedLeadState,
      shouldOfferScheduling
    });

  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      details: error.message 
    });
  }
};
