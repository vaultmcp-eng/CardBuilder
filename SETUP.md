# MTG Deck Builder - Setup Guide

## Quick Start

### Backend Setup
1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```
Server runs on `http://localhost:5000`

### Frontend Setup (React)

1. Create a new React app:
```bash
npx create-react-app mtg-frontend
cd mtg-frontend
```

2. Install additional dependencies:
```bash
npm install lucide-react papaparse
```

3. Replace `src/App.jsx` with the MTGDeckBuilder.jsx component

4. Create `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
```

5. Start React dev server:
```bash
npm start
```

## Deployment Strategy (Cheapest High-Traffic Solution)

### Option 1: Vercel + Firebase (Recommended)
- **Frontend Hosting**: Vercel (Free tier or Pro $20/month)
  - Automatic deploys from GitHub
  - CDN for fast global delivery
  - Handles lots of traffic efficiently

- **Backend**: Vercel Serverless Functions or Render.com Free ($0 forever)
  - Auto-scales with demand
  - No server management needed

- **Database**: Firebase Firestore (Free tier generous, then pay-as-you-go)
  - 1 GB free storage
  - 50k read/writes per day free
  - Scales automatically

- **Domain**: Your existing wolfehoovermarine.com
  - Update DNS to point to Vercel

- **Square Integration**: 
  - Free to set up
  - They take 2.9% + $0.30 per transaction

**Estimated Monthly Cost**: $0-50 (starts free, scales with traffic)

### Option 2: Full Stack on Single Host (Budget)
- **Host**: Railway.app or Render.com ($5-15/month)
  - Backend + Frontend on same server
  - PostgreSQL database included

- **Domain**: wolfehoovermarine.com (already owned)

- **Square Integration**: Free (just takes commission)

**Estimated Monthly Cost**: $5-15 + Square fees

---

## Production Checklist

- [ ] Change `JWT_SECRET` to a secure random string
- [ ] Set up PostgreSQL or MongoDB (don't use in-memory storage)
- [ ] Enable HTTPS on domain
- [ ] Set up proper error logging
- [ ] Add rate limiting to API endpoints
- [ ] Set up automated backups
- [ ] Add Square billing integration
- [ ] Set up monitoring/alerts

## File Structure

```
mtg-deck-builder/
├── server.js                 # Express backend
├── package.json             # Dependencies
└── frontend/                # React app
    ├── src/
    │   ├── App.jsx         # MTGDeckBuilder component
    │   └── index.js
    └── .env
```

## API Endpoints

### Authentication
- `POST /api/register` - Create new account
- `POST /api/login` - Login user
- `GET /api/verify` - Verify token

### Cards
- `POST /api/verify-card` - Verify card name & get suggestions
- `POST /api/card-versions` - Get all versions of a card
- `GET /api/cards` - Get user's card collection
- `POST /api/cards` - Add cards to collection
- `DELETE /api/cards/:cardId` - Remove card

## Next Steps

1. Test the app locally
2. Upload your card list as .txt file to test
3. Set up production database
4. Deploy to Vercel/Render
5. Point domain to hosting
6. Integrate Square billing
