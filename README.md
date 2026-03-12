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
   - Calls Anthropic Claude API
   - Manages conversation flow:
     - Greets visitor
     - Asks for name → email → qualification questions
     - Answers service questions
     - Offers calendar booking when ready

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

Edit `api/chat.js`, modify the `SYSTEM_PROMPT`:

```javascript
const SYSTEM_PROMPT = `You are a helpful assistant for Prosper Manufacturing...

Your goal:
1. Greet warmly
2. Ask for their name
3. Ask for email
4. Qualify their needs
5. Offer to schedule a call
`;
```

### Add Calendar Integration

When bot detects booking intent, return your Calendly link:

```javascript
if (userMessage.toLowerCase().includes('book')) {
  return {
    response: "Perfect! Pick a time: https://calendly.com/your-link",
    conversationHistory: updatedHistory
  };
}
```

## 🔗 CRM Integration

See [DEPLOY.md](./DEPLOY.md) for GoHighLevel, HubSpot, and email integration examples.

## 🌐 Embed on Your Website

Add this before `</body>` on prosper-mfg.com:

```html
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = 'https://YOUR-PROJECT.vercel.app';
    iframe.style.cssText = 'position:fixed;bottom:0;right:0;width:100%;height:100%;border:none;z-index:9999;pointer-events:none;';
    document.body.appendChild(iframe);
  })();
</script>
```

## 🔐 Environment Variables

Required:
- `ANTHROPIC_API_KEY` - Get from https://console.anthropic.com/

Optional:
- `GHL_API_KEY` - GoHighLevel integration
- `SENDGRID_API_KEY` - Email notifications

## 📊 Monitoring

View logs: **Vercel Dashboard → Deployments → Function Logs**

---

Built for **Prosper Manufacturing** | Made with Claude AI