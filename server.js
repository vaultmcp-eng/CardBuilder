const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

// In-memory data (use database in production)
const users = {};
const userCollections = {};

// Middleware: Verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.username = decoded.username;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Utility: Fetch card from Scryfall API with error handling
const fetchCardFromScryfall = async (cardName) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
    const response = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardName)}`);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return {
      name: data.name,
      type: data.type_line,
      rarity: data.rarity,
      prices: {
        usd: data.prices?.usd || '0.00',
        usd_foil: data.prices?.usd_foil || '0.00'
      },
      image: data.image_uris?.normal || data.card_faces?.[0]?.image_uris?.normal || null,
      setName: data.set_name,
      cardId: data.id
    };
  } catch (error) {
    console.error(`Error fetching ${cardName}:`, error);
    return null;
  }
};

// Utility: Search for similar cards (spell-check)
const searchSimilarCards = async (cardName) => {
  try {
    const response = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(cardName)}&unique=prints&order=name&per_page=5`);
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.data.map(card => ({
      name: card.name,
      image: card.image_uris?.small || card.card_faces?.[0]?.image_uris?.small || null
    }));
  } catch (error) {
    console.error('Error searching cards:', error);
    return [];
  }
};

// Utility: Get all versions of a card
const getCardVersions = async (cardName) => {
  try {
    const response = await fetch(`https://api.scryfall.com/cards/search?q="${encodeURIComponent(cardName)}"&unique=prints&order=released&per_page=50`);
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.data.map(card => ({
      name: card.name,
      setName: card.set_name,
      setCode: card.set,
      releaseDate: card.released_at,
      rarity: card.rarity,
      image: card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || null,
      thumbnail: card.image_uris?.small || card.card_faces?.[0]?.image_uris?.small || null,
      prices: {
        usd: card.prices?.usd || '0.00',
        usd_foil: card.prices?.usd_foil || '0.00'
      },
      cardId: card.id
    }));
  } catch (error) {
    console.error('Error fetching card versions:', error);
    return [];
  }
};

// --- AUTHENTICATION ENDPOINTS ---

app.post('/api/register', async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (users[username]) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    users[username] = {
      password: hashedPassword,
      email,
      createdAt: new Date().toISOString()
    };
    userCollections[username] = [];

    res.json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  const user = users[username];
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  try {
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/verify', verifyToken, (req, res) => {
  res.json({ username: req.username });
});

// --- CARD ENDPOINTS ---

app.post('/api/verify-card', verifyToken, async (req, res) => {
  const { cardName } = req.body;

  if (!cardName) {
    return res.status(400).json({ error: 'Card name required' });
  }

  const card = await fetchCardFromScryfall(cardName);

  if (card) {
    res.json({ found: true, card });
  } else {
    const suggestions = await searchSimilarCards(cardName);
    res.json({ found: false, suggestions });
  }
});

app.post('/api/card-versions', verifyToken, async (req, res) => {
  const { cardName } = req.body;

  if (!cardName) {
    return res.status(400).json({ error: 'Card name required' });
  }

  const versions = await getCardVersions(cardName);
  res.json({ versions });
});

app.get('/api/cards', verifyToken, (req, res) => {
  const cards = userCollections[req.username] || [];
  res.json({ cards });
});

app.post('/api/cards', verifyToken, (req, res) => {
  const { cards } = req.body;

  if (!Array.isArray(cards)) {
    return res.status(400).json({ error: 'Cards must be an array' });
  }

  if (!userCollections[req.username]) {
    userCollections[req.username] = [];
  }

  // Add unique ID to each card
  const newCards = cards.map(card => ({
    ...card,
    id: Date.now() + Math.random(),
    addedAt: new Date().toISOString()
  }));

  userCollections[req.username].push(...newCards);
  res.json({ message: 'Cards added successfully', cards: newCards });
});

app.delete('/api/cards/:cardId', verifyToken, (req, res) => {
  const { cardId } = req.params;

  if (!userCollections[req.username]) {
    return res.status(404).json({ error: 'No cards found' });
  }

  const initialLength = userCollections[req.username].length;
  userCollections[req.username] = userCollections[req.username].filter(
    card => card.id !== parseFloat(cardId)
  );

  if (userCollections[req.username].length === initialLength) {
    return res.status(404).json({ error: 'Card not found' });
  }

  res.json({ message: 'Card deleted successfully' });
});

// --- ERROR HANDLING ---

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`MTG Deck Builder server running on port ${PORT}`);
});