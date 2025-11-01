# Deployment Guide - wolfehoovermarine.com

## Domain Configuration

### Your Current Setup
- Domain: wolfehoovermarine.com (via Apple iCloud custom domain)
- Status: You already own the domain

### Connecting Your Domain to Hosting

#### Step 1: Choose Your Hosting (See Options Below)

#### Step 2: Update DNS Records
Depending on your hosting choice, you'll add DNS records:

**For Vercel:**
1. Go to your domain registrar (where you manage wolfehoovermarine.com)
2. Add DNS records (provided by Vercel):
   - A record: points to Vercel IP
   - CNAME record: for www.wolfehoovermarine.com

**For Render.com or Railway:**
1. Similar process - provider gives you DNS records to add
2. Usually just need to point nameservers

---

## Hosting Options (Ranked by Cost/Performance)

### OPTION A: Vercel (Frontend) + Render.com (Backend) - $0/month
**Best for: Scalability + Free tier**

**Frontend (Vercel) - FREE**
- Deploy React app
- Automatic HTTPS
- Global CDN
- Free tier can handle huge traffic

**Backend (Render.com) - FREE**
- Deploy Node.js server
- Spins down after inactivity (not ideal for live, but free)
- OR pay $7/month for "Starter" that stays active

**Database (Firebase Firestore) - FREE-$25/month**
- Free tier: 1 GB storage, 50k daily operations
- Pay-as-you-go after that
- Perfect for scaling

**Steps:**
1. Create Vercel account, connect GitHub
2. Create Render account, connect GitHub
3. Set environment variables
4. Point domain DNS to Vercel
5. Add Square API keys

**Monthly Cost: $0-25 depending on traffic**

---

### OPTION B: Railway.app (All-in-One) - $5-15/month
**Best for: Simplicity**

**What you get:**
- Backend running continuously
- PostgreSQL database included
- Frontend hosting
- All on one platform

**Steps:**
1. Create Railway account
2. Connect GitHub with your code
3. Set environment variables
4. Point domain DNS
5. Done - they handle everything

**Monthly Cost: $5-15 + Square fees**

---

### OPTION C: Netlify + Express on Heroku - $7/month
**Best for: Known setup**

**Frontend (Netlify) - FREE**
- Deploy React app
- Automatic HTTPS
- Global CDN

**Backend (Heroku) - $7/month minimum**
- Node.js server always running
- Add-ons for database ($10-20)

**Monthly Cost: $17-27 + Square fees**

---

## MY RECOMMENDATION FOR YOU

**Use Vercel (Free) + Render.com ($7/month) + Firebase (Free-$25/month)**

Why:
1. **Free tier starts** - no money spent immediately
2. **Scales automatically** - handles traffic spikes
3. **Very cheap** - $7-30/month max (way cheaper than dedicated hosting)
4. **Simple setup** - just connect GitHub
5. **Your domain** - points directly to Vercel

---

## Step-by-Step Setup (Vercel + Render + Firebase)

### 1. Prepare Your Code for Production

Update your backend for production database:

**server.js needs:**
```javascript
// Use MongoDB or PostgreSQL instead of in-memory storage
// Example with MongoDB:

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI);

// User schema, Card schema, etc.
```

### 2. Deploy Frontend to Vercel

1. Push code to GitHub
2. Go to `vercel.com`, sign up, connect GitHub
3. Select your repo
4. Vercel auto-deploys on every push
5. You get a live URL immediately

### 3. Deploy Backend to Render

1. Go to `render.com`, sign up, connect GitHub
2. Create new "Web Service"
3. Select your backend repo
4. Add environment variables:
   - `JWT_SECRET`
   - `MONGODB_URI` or database connection string
   - `PORT=3000`
5. Deploy - backend now live at `yourdomain-backend.onrender.com` or custom domain

### 4. Connect Your Domain

1. In Vercel dashboard, go to project settings
2. Add custom domain: `wolfehoovermarine.com`
3. Vercel shows you DNS records to add
4. Go to your domain registrar, add those records
5. Wait 24-48 hours for DNS to propagate

### 5. Update Frontend to Use Production Backend

Change in `.env`:
```
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

### 6. Set Up Database (Firebase)

1. Go to `firebase.google.com`
2. Create new project
3. Enable Firestore Database
4. Get credentials
5. Add to backend as environment variable

### 7. Add Square Billing (Later)

When ready:
1. Get Square API keys
2. Add endpoints to backend for payments
3. Frontend calls payment endpoint
4. Square handles the rest

---

## Security Checklist

- [ ] Change JWT_SECRET to secure random string
- [ ] Enable HTTPS (automatic on Vercel/Render)
- [ ] Add environment variables for secrets (NOT in code)
- [ ] Set up CORS properly (allow only your domain)
- [ ] Add rate limiting to API
- [ ] Hash passwords (bcryptjs - already in code)
- [ ] Keep dependencies updated
- [ ] Set up error logging

---

## Estimated Costs (Monthly)

| Component | Option A (Recommended) | Option B | Option C |
|-----------|----------------------|----------|----------|
| Frontend  | $0 (Vercel)          | $0 (Railway) | $0 (Netlify) |
| Backend   | $0 (Render free)     | Included | $7 (Heroku)  |
| Database  | $0-25 (Firebase)     | $5-15    | $10-20   |
| **Total** | **$0-25/month**      | **$5-15/month** | **$17-27/month** |
| Scale     | Excellent (10K+)     | Good (1K-5K) | Good (5K+) |

---

## Commands for Deployment

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Build for production
npm run build

# Deploy (handled by Vercel/Render automatically on git push)
git push origin main
```

---

## Troubleshooting

**502 Bad Gateway**
- Backend is down or not responding
- Check Render/backend service status

**Connection refused**
- Backend URL in frontend .env is wrong
- Check `REACT_APP_API_URL`

**Domain not resolving**
- DNS hasn't propagated yet (wait 24-48 hours)
- Check DNS records are correct in registrar

**Square payments failing**
- Check API keys are correct
- Verify CORS settings allow Square domains

---

## Next: Test Your Local Setup

1. Start backend: `npm start`
2. Start frontend: `npm start`
3. Create account at `http://localhost:3000`
4. Test .txt upload with your cards
5. Verify card lookup works

Then deploy to production!
