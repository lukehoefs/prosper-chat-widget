# 🤖 Prosper Chat Widget

AI-powered chat widget for [prosper-mfg.com](https://prosper-mfg.com) that captures leads, qualifies prospects, and schedules calls — all inside a chat conversation.

## ✨ Features

- **💬 AI-Powered Conversations** - Claude AI answers questions about your services 24/7
- **🎯 Smart Lead Capture** - Automatically collects name, email, and qualification info
- **📅 Call Scheduling** - Integrates with calendars to book meetings directly in chat
- **⚡ Instant Deployment** - Deploy to Vercel in 3 steps, embed with one line of code
- **🔗 CRM Integration** - Ready to connect to GoHighLevel, HubSpot, or any CRM
- **🎨 Fully Customizable** - Change colors, messages, and conversation flow

## 🚀 Quick Start

### 1. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/lukehoefs/prosper-chat-widget)

### 2. Add Your API Key

1. Get an Anthropic API key: https://console.anthropic.com/
2. In Vercel: **Settings → Environment Variables**
3. Add `ANTHROPIC_API_KEY` with your key
4. Redeploy

### 3. Test It

Visit `https://your-project.vercel.app` and click the chat bubble!

**Full deployment guide:** [DEPLOY.md](./DEPLOY.md)

## 💻 Project Structure

```
prosper-chat-widget/
├── api/
│   └── chat.js          # Serverless API endpoint (handles AI conversations)
├── index.html          # Chat widget UI (embed this on your site)
├── EMBED.html          # Copy-paste embed snippet for your site
├── package.json        # Dependencies
├── vercel.json         # Vercel configuration
├── DEPLOY.md           # Detailed deployment instructions
└── README.md           # This file
```

## 🔧 How It Works

1. **Frontend (index.html)**
   - Chat bubble UI in bottom-right corner
   - Sends user messages to `/api/chat`
   - Displays AI responses in real-time

2. **Backend (api/chat.js)**
   - Serverless function on Vercel
   - Calls Claude (`claude-opus-5`) with a structured-output schema, so each
     turn returns the reply text, the lead details learned so far, quick-reply
     suggestions, and whether the visitor is ready to book — as typed JSON
     rather than markers parsed out of prose
   - Manages conversation flow:
     - Greets visitor
     - Asks for name → email → qualification questions
     - Answers service questions
     - Offers calendar booking when ready

### API contract

`POST /api/chat`

```jsonc
// request
{
  "messages": [{ "role": "user", "content": "Sarah" }],  // full transcript, user turn first
  "lead": {}                                              // lead state from the previous response
}

// response
{
  "reply": "Nice to meet you, Sarah! What's the best email to reach you at?",
  "lead": { "name": "Sarah" },
  "quickReplies": ["Screen printing", "Fulfillment"],
  "bookingUrl": null                                      // a Calendly URL once qualified
}
```

3. **Lead Capture Flow**
   ```
   Visitor lands → Chat opens → Bot greets
       ↓
   Asks name → Asks email → Qualifies intent
       ↓
   Saves to CRM → Offers calendar → Books call
   ```

## 🎨 Customization

### Change Colors

Edit `index.html`, find `:root` variables:

```css
:root {
  --primary: #2563eb;       /* Your brand color */
  --primary-dark: #1e40af;  /* Hover state */
}
```

### Customize Messages

Tone, qualification questions, and what counts as a qualified lead all live in
the `SYSTEM_PROMPT` in `api/chat.js`.

The opening line is defined in **two** places that must stay in sync:
`WELCOME_MESSAGE` in `index.html` (shown to the visitor) and `WELCOME_MESSAGE`
in `api/chat.js` (so the model knows it already greeted them).

### Calendar Integration

Booking is built in — once the assistant has a name, an email, and a sense of
what the visitor needs, the API returns a `bookingUrl` and the widget shows a
**Book a call** button. Set the `CALENDLY_LINK` environment variable to change
the destination.

## 🔗 CRM Integration

See [DEPLOY.md](./DEPLOY.md) for GoHighLevel, HubSpot, and email integration examples.

## 🌐 Embed on Your Website

Copy the snippet from [EMBED.html](./EMBED.html), set `widgetUrl` to your
Vercel URL, and paste it before `</body>` on prosper-mfg.com.

The iframe is sized to just the chat bubble and grows only while the chat is
open, so it never blocks clicks anywhere else on the page.

## 🔐 Environment Variables

Required:
- `ANTHROPIC_API_KEY` - Get from https://console.anthropic.com/

Optional:
- `CALENDLY_LINK` - Booking link offered to qualified leads
  (default: `https://calendly.com/luke-prosper-mfg/30min`)
- `ALLOWED_ORIGINS` - Comma-separated origins allowed to call the API
  (default: `*`; set this to `https://prosper-mfg.com` once you go live)
- `GHL_API_KEY` - GoHighLevel integration
- `SENDGRID_API_KEY` - Email notifications

## 📊 Monitoring

View logs: **Vercel Dashboard → Deployments → Function Logs**

---

Built for **Prosper Manufacturing** | Made with Claude AI