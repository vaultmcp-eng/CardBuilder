# Quick Start - MTG Deck Builder

## What's Been Built

✅ **Authentication System** - No pre-loaded data, users create their own accounts
✅ **.txt File Upload** - Upload card lists with spell-checking and suggestions
✅ **Card Version Dropdown** - Multiple printings with thumbnails
✅ **Hover Tooltips** - Card images appear on hover (won't break layout)
✅ **User-Isolated Data** - Each user only sees their own cards
✅ **Scryfall Integration** - Real card data from the official Magic API

---

## Files Included

1. **MTGDeckBuilder.jsx** - React frontend component
2. **server.js** - Node.js/Express backend with auth
3. **package.json** - All dependencies listed
4. **SETUP.md** - Detailed setup instructions
5. **DEPLOYMENT_GUIDE.md** - How to deploy to your domain
6. **This file** - Quick start guide

---

## Test It Locally (5 minutes)

### Backend Setup

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start
# Server runs on http://localhost:5000
```

### Frontend Setup (New Terminal)

```bash
# 1. Create a new React app
npx create-react-app mtg-frontend
cd mtg-frontend

# 2. Install dependencies
npm install lucide-react papaparse

# 3. Create .env file with:
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# 4. Replace src/App.jsx with MTGDeckBuilder.jsx
cp ../MTGDeckBuilder.jsx src/App.jsx

# 5. Start React
npm start
# Opens http://localhost:3000
```

---

## Test the Features

### 1. Create Your Account
- Click "Create Account"
- Enter username, email, password
- Login with those credentials

### 2. Test .txt Upload
Create a file called `cards.txt`:
```
Lightning Bolt
Counterspell
Dark Ritual
Black Lotus
Ancestral Recall
```

Upload it to see:
- ✅ Correct cards recognized
- ✅ Spell suggestions for typos (try "Lightnin Bolt")
- ✅ Card details fetched from Scryfall

### 3. Click "View Versions"
- See all printings of that card
- Thumbnails show different set releases
- Prices from each version

### 4. Hover Over Card Name
- Card image pops up as tooltip
- Doesn't break page layout
- Disappears when you move mouse away

### 5. Verify User Isolation
- Login as different user
- Create your account and add YOUR cards
- Logout and login as original user
- Your cards are still there, new user's cards are gone

---

## Deploy to Production

When you're ready to go live on wolfehoovermarine.com:

1. **Read DEPLOYMENT_GUIDE.md** - Pick your hosting option
2. **Cheapest option: Vercel + Render + Firebase = $0-25/month**
3. **Push code to GitHub**
4. **Connect to Vercel and Render**
5. **Point domain DNS to Vercel**
6. **Done - live on your domain!**

---

## Add Your Cards

Once deployed and logged in:

1. Create a `.txt` file with all your card names
2. One card per line
3. Upload the file
4. Site verifies and adds them
5. Your collection is now live!

---

## What Happens With Misspelled Cards

**Example: User uploads `"Lightnin Bolt"` (typo)**

1. System can't find exact match
2. Shows suggestions: "Lightning Bolt", "Lightning Strike", etc.
3. User clicks the right one
4. Card gets added correctly

---

## Data Privacy

- Each user's cards are stored in their account ONLY
- Other users cannot see your collection
- Cards are fetched fresh from Scryfall API
- No hardcoded data in the system

---

## Next Steps After Testing

1. ✅ Test locally with your card list
2. ✅ Create account with your username
3. ✅ Upload cards and verify they work
4. ✅ Check the deployment guide
5. ✅ Deploy to production
6. ✅ Create account on production site
7. ✅ Upload your real cards
8. ✅ Add Square billing integration (optional, can do later)

---

## Troubleshooting

**"Cannot find module 'lucide-react'"**
```bash
npm install lucide-react papaparse
```

**Backend won't connect**
- Make sure backend is running on port 5000
- Check `.env` has `REACT_APP_API_URL=http://localhost:5000/api`

**Cards not loading**
- Check Scryfall API isn't rate limited
- Verify card name spelling
- Try a popular card like "Lightning Bolt"

**Account not saving**
- Data currently stored in memory (backend restart loses data)
- Deploy to use permanent database (see DEPLOYMENT_GUIDE.md)

---

## Questions?

Everything is documented in:
- **SETUP.md** - How to set it up
- **DEPLOYMENT_GUIDE.md** - How to deploy
- Comments in the code files

You're ready to build! 🚀
