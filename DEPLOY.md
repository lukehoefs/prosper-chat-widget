# 🚀 DEPLOYMENT GUIDE - Prosper Chat Widget

## Quick Start: Deploy to Vercel in 3 Steps

### Prerequisites
- Vercel account (free): https://vercel.com/signup
- Anthropic API key (see below for setup)

---

## Step 1: Get Your Anthropic API Key

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create Key**
5. Copy the key (starts with `sk-ant-api03-...`)
6. Keep it safe - you'll need it in Step 3

---

## Step 2: Deploy on Vercel

### Option A: One-Click Deploy (Easiest)

1. Click this button:

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/lukehoefs/prosper-chat-widget)

2. Vercel will:
   - Clone this repository to your GitHub account
   - Auto-detect the configuration
   - Start deployment

3. When prompted, click **Deploy**

### Option B: Manual Import

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Select **GitHub** and authorize Vercel
4. Choose `prosper-chat-widget` repository
5. Vercel will auto-detect settings
6. Click **Deploy**

---

## Step 3: Add Your API Key

**CRITICAL:** Your chat won't work until you add the API key.

1. After deployment completes, go to your project dashboard
2. Click **Settings** (top navigation)
3. Click **Environment Variables** (left sidebar)
4. Add new variable:
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** Your API key from Step 1 (starts with `sk-ant-api03-...`)
   - **Environments:** Check all 3 boxes (Production, Preview, Development)
5. Click **Save**
6. Go to **Deployments** tab
7. Click the three dots (⋯) on your latest deployment
8. Click **Redeploy** → **Redeploy**

---

## Step 4: Test Your Widget

1. Your widget is now live at: `https://YOUR-PROJECT.vercel.app`
2. Visit that URL
3. Click the blue chat bubble in the bottom-right
4. Test a conversation:
   - Bot will ask for your name
   - Then email
   - Then qualification questions
   - Try asking: "What services do you offer?"

---

## Step 5: Embed on prosper-mfg.com

Once tested, add this code to your website:

### For WordPress:

1. Go to **Appearance → Theme File Editor**
2. Select **footer.php**
3. Paste this code **before** the closing `</body>` tag:

```html
<!-- Prosper Chat Widget -->
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = 'https://YOUR-PROJECT.vercel.app';
    iframe.style.cssText = 'position:fixed;bottom:0;right:0;width:100%;height:100%;border:none;z-index:9999;pointer-events:none;';
    iframe.onload = function() {
      iframe.contentWindow.postMessage({type: 'init'}, '*');
    };
    document.body.appendChild(iframe);
  })();
</script>
```

### For HTML Sites:

Paste the same code above **before** `</body>` in your template.

### For GoHighLevel:

1. Go to **Settings → Custom Code**
2. Paste the code in **Footer Code**
3. Save and publish

**Replace `YOUR-PROJECT` with your actual Vercel project name.**

---

## Customization

### Change the Greeting Message

Edit `api/chat.js`, find this line:

```javascript
const SYSTEM_PROMPT = `You are a helpful assistant for Prosper Manufacturing...`
```

Customize the greeting and qualification questions.

### Change Colors

Edit `index.html`, find the `:root` CSS variables:

```css
:root {
  --primary: #2563eb;  /* Change this to your brand color */
  --primary-dark: #1e40af;
}
```

### Add Calendar Integration

In `api/chat.js`, when the bot detects booking intent, you can return a Calendly link:

```javascript
if (userMessage.includes('book') || userMessage.includes('schedule')) {
  return {
    response: "Great! Book a time that works for you: https://calendly.com/your-link",
    conversationHistory: updatedHistory
  };
}
```

---

## Connect to Your CRM

### Send Leads to Email

In `api/chat.js`, add this after capturing email:

```javascript
// Send to your email
await fetch('https://api.sendgrid.com/v3/mail/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    personalizations: [{ to: [{ email: 'sales@prosper-mfg.com' }] }],
    from: { email: 'noreply@prosper-mfg.com' },
    subject: 'New Lead from Chat Widget',
    content: [{
      type: 'text/plain',
      value: `Name: ${leadName}\nEmail: ${leadEmail}\nInterest: ${interest}`
    }]
  })
});
```

### Send to GoHighLevel

```javascript
await fetch('https://rest.gohighlevel.com/v1/contacts/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: leadName,
    email: leadEmail,
    customField: interest
  })
});
```

Add the API key as an environment variable in Vercel settings.

---

## Troubleshooting

### Chat not responding?

1. Check Vercel logs: **Project → Deployments → Click deployment → View Function Logs**
2. Verify API key is set correctly in Environment Variables
3. Make sure you redeployed after adding the API key

### Widget not showing on your site?

1. Check browser console for errors (F12 → Console)
2. Verify the embed code domain matches your Vercel URL
3. Check for CSP (Content Security Policy) blocking the iframe

### "API key not found" error?

1. Go to **Settings → Environment Variables**
2. Verify `ANTHROPIC_API_KEY` exists
3. Check all three environment checkboxes are selected
4. Redeploy the project

---

## Advanced: Custom Domain

1. In Vercel project settings, go to **Domains**
2. Click **Add**
3. Enter your domain (e.g., `chat.prosper-mfg.com`)
4. Follow DNS configuration instructions
5. Update embed code with your custom domain

---

## Support

Questions? Issues?

- GitHub Issues: https://github.com/lukehoefs/prosper-chat-widget/issues
- Vercel Docs: https://vercel.com/docs
- Anthropic Docs: https://docs.anthropic.com/

---

## Next Steps

- [ ] Deploy to Vercel
- [ ] Add API key
- [ ] Test the widget
- [ ] Customize colors and messages
- [ ] Add calendar integration
- [ ] Connect to CRM
- [ ] Embed on prosper-mfg.com
- [ ] Monitor conversations in Vercel logs

You're all set! 🎉