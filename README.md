# Mikaelmadeit Beat Store — Backend

Vercel serverless backend for:
- PayPal order verification
- PDF license contract generation  
- Email delivery via Resend

---

## Deploy in 5 steps

### Step 1 — Push to GitHub
1. Go to github.com → New repository → name it `mikaelmadeit-backend` → Create
2. Upload all these files (drag and drop the folder)

### Step 2 — Connect to Vercel
1. Go to vercel.com → Add New Project
2. Import your `mikaelmadeit-backend` GitHub repo
3. Click Deploy (no config needed — vercel.json handles it)

### Step 3 — Add Environment Variables
In Vercel: Settings → Environment Variables → add each one:

| Name | Value |
|------|-------|
| `PAYPAL_CLIENT_ID` | Your PayPal Live Client ID |
| `PAYPAL_SECRET` | Your PayPal Live Secret (regenerated) |
| `RESEND_API_KEY` | Your Resend API key (from resend.com) |
| `FROM_EMAIL` | `beats@yourdomain.com` or `onboarding@resend.dev` for testing |

### Step 4 — Get your API URL
After deploy, Vercel gives you a URL like:
`https://mikaelmadeit-backend.vercel.app`

Your API endpoint will be:
`https://mikaelmadeit-backend.vercel.app/api/confirm-order`

### Step 5 — Update the HTML site
In mikaelmadeit_v15.html, find this line:
```js
var BACKEND_URL = '';
```
And change it to:
```js
var BACKEND_URL = 'https://mikaelmadeit-backend.vercel.app';
```

---

## Resend setup

1. Go to resend.com → sign up free
2. Add your domain (or use `onboarding@resend.dev` for testing without a domain)
3. API Keys → Create API Key → copy it → paste into Vercel env vars

Free tier: 3,000 emails/month — more than enough

---

## How it works

```
Buyer clicks BUY
  → Picks license + enters promo code
  → PayPal buttons render
  → Buyer pays
  → PayPal onApprove fires in browser
  → Browser calls /api/confirm-order with order details
  → Server verifies order with PayPal API (prevents fraud)
  → Server generates PDF contract
  → Server emails PDF to buyer via Resend
  → Browser shows download confirmation
```

---

## File structure
```
mikaelmadeit-backend/
├── api/
│   ├── confirm-order.js    ← main endpoint
│   └── lib/
│       ├── paypal.js       ← PayPal verification
│       ├── pdf.js          ← PDF generation
│       └── email.js        ← Resend email sender
├── package.json
├── vercel.json
└── .env.example
```
