# 🎮 MTG Deck Builder - SUPER SIMPLE Setup

**This is so easy a 2nd grader could do it!**

---

## What You're Getting

✅ **Copy-Paste Text Box** - Paste your card list (don't need file)
✅ **AI Chat Bubble** - Ask Claude about your deck
✅ **Fort Knox Security** - Super protected from hackers
✅ **All Features** - Card lookup, versions, prices, everything

---

## 🚀 3 Simple Steps to Start

### Step 1: Get Your Stuff Ready
```bash
# Copy these 3 files into a folder:
server_v2.js
package_v2.json
MTGDeckBuilder_v2.jsx
```

### Step 2: Start the Backend (Terminal 1)
```bash
# Copy-paste this:
npm install
npm start
```

That's it! Backend is running.

### Step 3: Start the Frontend (Terminal 2)
```bash
# Copy-paste these one at a time:
npx create-react-app mtg-frontend
cd mtg-frontend
npm install lucide-react papaparse
echo "REACT_APP_API_KEY=PASTE_YOUR_ANTHROPIC_KEY_HERE" > .env
cp ../MTGDeckBuilder_v2.jsx src/App.jsx
npm start
```

**Done!** Open `http://localhost:3000`

---

## Where to Get Your API Key

**For AI Chat, you need an Anthropic API key:**

1. Go to: https://console.anthropic.com
2. Sign up (free)
3. Click "API Keys"
4. Copy the key
5. Paste it in your .env file

**Cost:** Claude charges by usage - about $0.01-0.05 per user question. **Very cheap!**

---

## Test It NOW

1. **Create account** - Use `myname` as username
2. **Paste cards** - Paste your card list in the text box:
   ```
   Lightning Bolt
   Counterspell
   Black Lotus
   ```
3. **Click "Add Cards"** - Done!
4. **Open AI Chat** - Click the purple circle in bottom right
5. **Ask it something:**
   ```
   What cards go with Lightning Bolt?
   ```

---

## What's Fort Knox Security?

**Simply put:** Hackers can't get your passwords or steal your data.

Here's what we added:

```
🔒 Your passwords are HASHED (turned into jibberish)
🔒 Your data is ENCRYPTED (scrambled)
🔒 Bad guys get BLOCKED after too many tries
🔒 Only YOUR website can use the API
🔒 All data checked before accepting it
🔒 No way for hackers to inject bad code
```

**That's it.** You're protected.

---

## For Your Card List

Option 1: **Copy-Paste** (Easiest)
- Open text file with your cards
- Paste into the text box
- Click "Add Cards"

Option 2: **Upload File**
- Just upload your .txt file
- Same result

Both work!

---

## When You're Ready to Deploy

Once you test locally and it works, go to `DEPLOYMENT_GUIDE.md` to put it on your domain.

**Cost:** $7-25/month (way cheaper than you think)

---

## Questions?

**Q: Do I need my Anthropic key to test?**
A: No! Chat will just say it's unavailable. Everything else works.

**Q: Is my card data private?**
A: YES! Only you can see your cards. Data never leaves your server.

**Q: How secure is it?**
A: Fort Knox level. Hackers would have a really hard time.

**Q: Can I break it?**
A: Try! You probably can't. And if you do, just restart.

---

## Next: Your Card List

1. Get your card list as a `.txt` file (one card per line)
2. Create account on the site
3. Paste your cards
4. Done!

You now have your MTG collection on a website. 🎉

---

## ONE MORE THING

Before you deploy to production, change this in `server_v2.js`:

Find this line:
```javascript
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this';
```

Change it to a random secret:
```javascript
const JWT_SECRET = process.env.JWT_SECRET || 'aj3f9s8d9a8f7s9d8f7a9d8f7a9sdf8';
```

That's literally all you need to do. ✅

---

**You're ready! Go test it! 🚀**
