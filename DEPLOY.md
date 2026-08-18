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

Copy the full snippet from [EMBED.html](./EMBED.html) and change `widgetUrl`
to your Vercel URL. The iframe stays small (just the bubble) until the chat is
opened, then grows to fit it — so it never blocks clicks on the rest of your page.

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

The opening line lives in **two** places that must stay in sync:
`WELCOME_MESSAGE` in `index.html` (what the visitor sees) and `WELCOME_MESSAGE`
in `api/chat.js` (so the model knows it already greeted them).

Everything after the greeting — tone, qualification questions, what counts as a
qualified lead — is in the `SYSTEM_PROMPT` in `api/chat.js`.

### Change Colors

Edit `index.html`, find the `:root` CSS variables:

```css
:root {
  --primary: #2563eb;  /* Change this to your brand color */
  --primary-dark: #1e40af;
}
```

### Change the Booking Link

Calendar booking is built in. When the assistant decides the visitor is
qualified, the API returns a `bookingUrl` and the widget renders a
**Book a call** button.

To point it somewhere else, set the `CALENDLY_LINK` environment variable in
Vercel. It defaults to `https://calendly.com/luke-prosper-mfg/30min`.

---

## Connect to Your CRM

### Send Leads to Email

Captured lead details are collected in the `lead` object in `api/chat.js`
(fields: `name`, `email`, `company`, `interest`, `volume`, `timeline`). It is
currently just logged — look for the `console.log('Lead state:', lead)` line and
send it wherever you need. For example:

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
      value: `Name: ${lead.name}\nEmail: ${lead.email}\nInterest: ${lead.interest}`
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
    name: lead.name,
    email: lead.email,
    customField: lead.interest
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