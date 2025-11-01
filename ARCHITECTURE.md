# MTG Deck Builder - Project Structure & Architecture

## 📁 Project Layout

```
mtg-deck-builder/
│
├── Backend (Node.js)
│   ├── server.js              # Main Express server with all API endpoints
│   ├── package.json           # Dependencies for backend
│   └── .env                   # Environment variables (create this)
│
├── Frontend (React)
│   ├── src/
│   │   ├── App.jsx           # MTGDeckBuilder component (use MTGDeckBuilder.jsx)
│   │   ├── index.js
│   │   └── App.css
│   ├── public/
│   ├── package.json          # React dependencies
│   └── .env                  # Frontend environment variables
│
├── Documentation
│   ├── QUICK_START.md        # This file - start here
│   ├── SETUP.md              # Detailed setup instructions
│   └── DEPLOYMENT_GUIDE.md   # How to deploy to production
│
└── README.md                 # Project overview
```

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User's Browser                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           React Frontend (MTGDeckBuilder)            │   │
│  │  - Login/Register UI                                │   │
│  │  - .txt file upload                                 │   │
│  │  - Card search & display                            │   │
│  │  - Card version dropdown                            │   │
│  │  - Hover tooltips                                   │   │
│  └────────────────────┬─────────────────────────────────┘   │
└─────────────────────────┼──────────────────────────────────────┘
                          │ HTTP/HTTPS
                          │ JSON requests/responses
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Express.js Backend Server                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API Endpoints:                                      │   │
│  │  - POST /api/register     → Create account          │   │
│  │  - POST /api/login        → Login & get JWT token   │   │
│  │  - GET /api/verify        → Verify token valid      │   │
│  │  - POST /api/verify-card  → Check card name         │   │
│  │  - POST /api/card-versions → Get all printings      │   │
│  │  - GET /api/cards         → Get user's collection   │   │
│  │  - POST /api/cards        → Add cards               │   │
│  │  - DELETE /api/cards/:id  → Remove card             │   │
│  └────────┬──────────────────────────────┬──────────────┘   │
│           │                              │                  │
│    [JWT Auth]              [Database/Cache]                 │
│           │                              │                  │
└───────────┼──────────────────────────────┼──────────────────┘
            │                              │
            │  (In-memory for now,        │  (Eventually: 
            │   use MongoDB for prod)     │   Firebase/PostgreSQL)
            │                              │
            ▼                              ▼
      ┌──────────────┐            ┌───────────────────┐
      │ User Accounts│            │ User Collections  │
      │ Passwords    │            │ Card Lists        │
      │ JWT Tokens   │            │ Deck Info         │
      └──────────────┘            └───────────────────┘
```

---

## 🔄 User Flow

### 1. Account Creation
```
User inputs (username, password, email)
              ↓
Frontend sends POST /api/register
              ↓
Backend hashes password with bcryptjs
              ↓
Backend creates user account
              ↓
Frontend shows login screen
```

### 2. Login
```
User inputs (username, password)
              ↓
Frontend sends POST /api/login
              ↓
Backend verifies password
              ↓
Backend creates JWT token (valid 7 days)
              ↓
Frontend stores token in localStorage
              ↓
Frontend shows dashboard
```

### 3. Upload Cards (.txt file)
```
User selects cards.txt file
              ↓
Frontend reads file, extracts card names
              ↓
Frontend sends card names to /api/verify-card (one at a time)
              ↓
Backend queries Scryfall API for each card
              ↓
If found → Add to verified list
If not found → Get suggestions from Scryfall
              ↓
Frontend shows verification modal if any not found
              ↓
User selects which card they meant (or skip)
              ↓
Frontend sends verified cards to POST /api/cards
              ↓
Backend stores in user's collection
              ↓
Frontend displays cards in grid
```

### 4. View Card Versions
```
User clicks "View Versions"
              ↓
Frontend sends POST /api/card-versions with card name
              ↓
Backend queries Scryfall for all printings
              ↓
Backend returns versions with:
  - Set name & release date
  - Thumbnail image
  - Prices (foil & non-foil)
  - Rarity
              ↓
Frontend displays dropdown with thumbnails
```

### 5. Hover Image Tooltip
```
User hovers over card name
              ↓
Frontend calculates tooltip position
              ↓
Frontend displays card image at that position
              ↓
Uses `position: fixed` so it doesn't affect layout
              ↓
Image disappears on mouseout
```

---

## 🔐 Security Implementation

### Password Hashing (bcryptjs)
```javascript
// Registration
const hashedPassword = await bcrypt.hash(password, 10);
// Stored: $2a$10$...hashed...

// Login
const isValid = await bcrypt.compare(userInput, storedHash);
// Compares without exposing hash
```

### JWT Token Authentication
```javascript
// Login creates token
const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
// Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Stored in browser localStorage
localStorage.setItem('token', token);

// Sent with each request
headers: { 'Authorization': 'Bearer eyJ...' }

// Backend verifies
const decoded = jwt.verify(token, JWT_SECRET);
```

### Data Isolation
```javascript
// Backend always uses req.username from token
// So users can't see other users' cards

app.get('/api/cards', verifyToken, (req, res) => {
  // req.username is extracted from JWT
  const cards = userCollections[req.username];
  // Only returns THEIR cards, not others'
});
```

---

## 🌐 API Endpoints Reference

### Authentication

**POST /api/register**
```json
Request:
{
  "username": "wolfe_hoover",
  "password": "secure123",
  "email": "you@email.com"
}

Response:
{
  "message": "User created successfully"
}
```

**POST /api/login**
```json
Request:
{
  "username": "wolfe_hoover",
  "password": "secure123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "username": "wolfe_hoover"
}
```

**GET /api/verify**
```
Headers: Authorization: Bearer eyJ...

Response:
{
  "username": "wolfe_hoover"
}
```

### Cards

**POST /api/verify-card**
```json
Request:
{
  "cardName": "Lightning Bolt"
}

Response (if found):
{
  "found": true,
  "card": {
    "name": "Lightning Bolt",
    "type": "Instant",
    "rarity": "common",
    "image": "https://...",
    "setName": "Limited Edition Alpha",
    "prices": { "usd": "0.25", "usd_foil": "0.50" }
  }
}

Response (if not found):
{
  "found": false,
  "suggestions": [
    { "name": "Lightning Strike", "image": "..." },
    { "name": "Lightning Greeting", "image": "..." }
  ]
}
```

**POST /api/card-versions**
```json
Request:
{
  "cardName": "Lightning Bolt"
}

Response:
{
  "versions": [
    {
      "name": "Lightning Bolt",
      "setName": "Limited Edition Alpha",
      "releaseDate": "1993-08-05",
      "rarity": "common",
      "thumbnail": "https://...",
      "image": "https://...",
      "prices": { "usd": "500.00", "usd_foil": "0.00" }
    },
    {
      "name": "Lightning Bolt",
      "setName": "Beta",
      "releaseDate": "1993-10-01",
      "rarity": "common",
      "thumbnail": "https://...",
      "image": "https://...",
      "prices": { "usd": "100.00", "usd_foil": "0.00" }
    },
    // ... more versions
  ]
}
```

**GET /api/cards**
```
Headers: Authorization: Bearer eyJ...

Response:
{
  "cards": [
    {
      "id": 1234567890,
      "name": "Lightning Bolt",
      "type": "Instant",
      "rarity": "common",
      "image": "https://...",
      "setName": "Limited Edition Alpha",
      "prices": { "usd": "0.25", "usd_foil": "0.50" },
      "addedAt": "2024-01-15T10:30:00Z"
    },
    // ... more cards
  ]
}
```

**POST /api/cards**
```json
Request:
{
  "cards": [
    {
      "name": "Lightning Bolt",
      "type": "Instant",
      "rarity": "common",
      "image": "https://...",
      "setName": "Limited Edition Alpha",
      "prices": { "usd": "0.25" }
    }
  ]
}

Response:
{
  "message": "Cards added successfully",
  "cards": [
    {
      "id": 1234567890,
      "name": "Lightning Bolt",
      "addedAt": "2024-01-15T10:30:00Z",
      ...
    }
  ]
}
```

**DELETE /api/cards/:cardId**
```
Headers: Authorization: Bearer eyJ...

Response:
{
  "message": "Card deleted successfully"
}
```

---

## 🚀 Deployment Ready Checklist

- [x] No hardcoded user data
- [x] Authentication system working
- [x] .txt file upload implemented
- [x] Card spell-checking working
- [x] Card versions dropdown built
- [x] Hover tooltips implemented
- [x] Data isolation (users see only their cards)
- [x] API endpoints documented
- [x] Error handling in place
- [x] CORS configured
- [ ] Database setup (Firebase/MongoDB)
- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] Rate limiting added
- [ ] Error logging setup
- [ ] Domain pointed to hosting
- [ ] Square billing integrated

---

## 📊 Database Schema (For Production)

When you migrate to a real database (Firebase/MongoDB/PostgreSQL):

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String,
  password: String (hashed),
  createdAt: Date,
  lastLogin: Date
}
```

### Cards Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (references Users),
  cardName: String,
  type: String,
  rarity: String,
  setName: String,
  scryfallId: String (unique card ID),
  image: String (URL),
  prices: {
    usd: Number,
    usd_foil: Number
  },
  addedAt: Date
}
```

### Decks Collection (Future)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  name: String,
  format: String (Standard, Commander, etc.),
  cards: [ObjectId] (references to Cards),
  createdAt: Date,
  lastModified: Date
}
```

---

## 💡 Key Technologies

| Component | Technology | Why |
|-----------|-----------|-----|
| Frontend | React | Component-based UI, hooks for state |
| Backend | Express.js | Lightweight, perfect for REST APIs |
| Auth | JWT + bcryptjs | Secure, stateless authentication |
| API | Scryfall | Official MTG card database |
| Hosting | Vercel + Render | Free/cheap, auto-scales |
| Database | Firebase/MongoDB | Scalable, real-time (later) |
| UI Icons | Lucide React | Beautiful, lightweight icons |
| CSV Parsing | Papa Parse | Handle card list uploads |

---

## 🎯 Next Features to Add

1. **Deck Building** - Group cards into decks with format validation
2. **Deck Recommendations** - AI suggests cards based on synergies
3. **Price Tracking** - Alert when card prices drop
4. **Format Legality** - Validate cards are legal in Standard/Commander
5. **Collection Stats** - Total value, by rarity, by set
6. **Deck Sharing** - Export deck code or share with friends
7. **Mobile App** - React Native version
8. **Advanced Search** - Filter by mana cost, type, ability
9. **Wishlist** - Cards you want to buy
10. **Trading** - Peer-to-peer card trading

---

You're all set! Start with QUICK_START.md to test locally. 🎉
