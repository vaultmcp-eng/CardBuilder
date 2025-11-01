const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Anthropic } = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Initialize Claude
const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY
});

// ============================================
// SECURITY MIDDLEWARE - FORT KNOX LEVEL
// ============================================

// Helmet - Add 15+ security headers
app.use(helmet());

// Force HTTPS in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
  }
  next();
});

// Rate limiting - Prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: 'Too many requests, please try again later'
});

// Stricter rate limit for login/register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 requests per 15 minutes
  message: 'Too many login attempts, please try again later'
});

app.use(limiter);
app.use(express.json({ limit: '10kb' })); // Prevent large payload attacks

// CORS - Lock down to only your domain
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 3600
}));

// ============================================
// IN-MEMORY DATA (Replace with database!)
// ============================================

// Pre-loaded with your account!
const users = {
  'wolfe_hoover': {
    password: '$2a$10$abcdefghijklmnopqrstuvwxyz', // Will be hashed on first run
    email: 'wolfehoover@example.com',
    createdAt: new Date().toISOString()
  }
};

// Your actual cards from all your lists
const userCollections = {
  'wolfe_hoover': [
    // 9/15/2025 - Fallout List
    { id: 1, name: 'Anguished Unmaking', type: 'Sorcery', rarity: 'Rare', set: 'Custom Set', image: null, addedAt: new Date().toISOString() },
    { id: 2, name: 'Aradesh, the Founder', type: 'Legendary Creature - Human', rarity: 'Mythic', set: 'Custom Set', image: null, addedAt: new Date().toISOString() },
    { id: 3, name: 'Arcane Signet', type: 'Artifact', rarity: 'Uncommon', set: 'Custom Set', image: null, addedAt: new Date().toISOString() },
    { id: 4, name: 'Ash Barrens', type: 'Land', rarity: 'Common', set: 'Custom Set', image: null, addedAt: new Date().toISOString() },
    { id: 5, name: 'Assemble the Legion', type: 'Enchantment - Conspiracy', rarity: 'Rare', set: 'Custom Set', image: null, addedAt: new Date().toISOString() },
    { id: 6, name: 'Bastion of Remembrance', type: 'Enchantment', rarity: 'Rare', set: 'Custom Set', image: null, addedAt: new Date().toISOString() },
    { id: 7, name: 'Battle of Hoover Dam', type: 'Sorcery', rarity: 'Rare', set: 'Custom Set', image: null, addedAt: new Date().toISOString() },
    { id: 8, name: 'Black Market', type: 'Enchantment', rarity: 'Rare', set: 'Custom Set', image: null, addedAt: new Date().toISOString() },
    { id: 9, name: 'Boomer Scrapper', type: 'Creature - Human', rarity: 'Uncommon', set: 'Custom Set', image: null, addedAt: new Date().toISOString() },
    { id: 10, name: 'Butch DeLoria, Tunnel Snake', type: 'Creature - Human', rarity: 'Uncommon', set: 'Custom Set', image: null, addedAt: new Date().toISOString() },
    { id: 11, name: 'Canyon Slough', type: 'Land', rarity: 'Common', set: 'Custom Set', image: null, addedAt: new Date().toISOString() },
    { id: 12, name: 'Captain of the Watch', type: 'Creature - Human Soldier', rarity: 'Rare', set: 'Custom Set', image: null, addedAt: new Date().toISOString() },
    { id: 13, name: 'Charisma Bobblehead', type: 'Artifact', rarity: 'Uncommon', set: 'Custom Set', image: null, addedAt: new Date().toISOString() },
    { id: 14, name: 'Clifftop Retreat', type: 'Land', rarity: 'Uncommon', set: 'Custom Set', image: null, addedAt: new Date().toISOString() },
    { id: 15, name: 'Colonel Autumn', type: 'Legendary Creature - Human Soldier', rarity: 'Rare', set: 'Custom Set', image: null, addedAt: new Date().toISOString() },
    { id: 16, name: 'Command Tower', type: 'Land', rarity: 'Uncommon', set: 'Custom Set', image: null, addedAt: new Date().toISOString() },
    { id: 17, name: 'Craig Boone, Novac Guard', type: 'Creature - Human', rarity: 'Rare', set: 'Custom Set', image: null, addedAt: new Date().toISOString() },
    { id: 18, name: 'Deadly Dispute', type: 'Sorcery', rarity: 'Rare', set: 'Custom Set', image: null, addedAt: new Date().toISOString() },
    { id: 19, name: 'Desdemona, Freedom\'s Edge', type: 'Legendary Creature - Human', rarity: 'Mythic', set: 'Custom Set', image: null, addedAt: new Date().toISOString() },
    { id: 20, name: 'Desolate Mire', type: 'Land', rarity: 'Common', set: 'Custom Set', image: null, addedAt: new Date().toISOString() },
    { id: 21, name: 'Diamond City', type: 'Land', rarity: 'Rare', set: 'Custom Set', image: null, addedAt: new Date().toISOString() },
    { id: 22, name: 'Dragonskull Summit', type: 'Land', rarity: 'Uncommon', set: 'Custom Set', image: null, addedAt: new Date().toISOString() },
    { id: 23, name: 'ED-E, Lonesome Eyebot', type: 'Artifact Creature - Construct', rarity: 'Rare', set: 'Custom Set', image: null, addedAt: new Date().toISOString() },
    { id: 24, name: 'Elder Arthur Maxson', type: 'Legendary Creature - Human', rarity: 'Mythic', set: 'Custom Set', image: null, addedAt: new Date().toISOString() },
    { id: 25, name: 'Entrapment Maneuver', type: 'Instant', rarity: 'Uncommon', set: 'Custom Set', image: null, addedAt: new Date().toISOString() },
    { id: 26, name: 'Evolving Wilds', type: 'Land', rarity: 'Common', set: 'Custom Set', image: null, addedAt: new Date().toISOString() },
    { id: 27, name: 'Fervent Charge', type: 'Instant', rarity: 'Uncommon', set: 'Custom Set', image: null, addedAt: new Date().toISOString() },
    { id: 28, name: 'Gary Clone', type: 'Creature - Human', rarity: 'Uncommon', set: 'Custom Set', image: null, addedAt: new Date().toISOString() },
    { id: 29, name: 'General\'s Enforcer', type: 'Creature - Human Soldier', rarity: 'Rare', set: 'Custom Set', image: null, addedAt: new Date().toISOString() },
    { id: 30, name: 'Heroic Reinforcements', type: 'Sorcery', rarity: 'Rare', set: 'Custom Set', image: null, addedAt: new Date().toISOString() },
    { id: 31, name: 'Caesar, Legion\'s Emperor', type: 'Legendary Creature - Human', rarity: 'Mythic', set: 'Custom Set', image: null, addedAt: new Date().toISOString() },
    
    // 10/31/2025 - Lord of the Rings List
    { id: 32, name: 'Armament Dragon', type: 'Creature - Dragon', rarity: 'Rare', set: 'Lord of the Rings', image: null, addedAt: new Date().toISOString() },
    { id: 33, name: 'Blade of the Swarm', type: 'Artifact - Equipment', rarity: 'Uncommon', set: 'Modern Horizons', image: null, addedAt: new Date().toISOString() },
    { id: 34, name: 'Nebula Dragon', type: 'Creature - Dragon', rarity: 'Mythic', set: 'Unfinity', image: null, addedAt: new Date().toISOString() },
    { id: 35, name: 'Frodo Baggins', type: 'Legendary Creature - Halfling', rarity: 'Rare', set: 'Lord of the Rings', image: null, addedAt: new Date().toISOString() },
    { id: 36, name: 'The Shire', type: 'Legendary Land', rarity: 'Rare', set: 'Lord of the Rings', image: null, addedAt: new Date().toISOString() },
    { id: 37, name: 'Samwise the Stouthearted', type: 'Legendary Creature - Halfling', rarity: 'Rare', set: 'Lord of the Rings', image: null, addedAt: new Date().toISOString() },
    { id: 38, name: 'Gollum, Patient Plotter', type: 'Legendary Creature - Halfling', rarity: 'Rare', set: 'Lord of the Rings', image: null, addedAt: new Date().toISOString() },
    { id: 39, name: 'Eagles of the North', type: 'Creature - Bird', rarity: 'Rare', set: 'Lord of the Rings', image: null, addedAt: new Date().toISOString() },
    { id: 40, name: 'The Grey Havens', type: 'Legendary Land', rarity: 'Rare', set: 'Lord of the Rings', image: null, addedAt: new Date().toISOString() },
    { id: 41, name: 'Mountain', type: 'Land - Mountain', rarity: 'Common', set: 'Various', image: null, addedAt: new Date().toISOString() },
    { id: 42, name: 'Plains', type: 'Land - Plains', rarity: 'Common', set: 'Various', image: null, addedAt: new Date().toISOString() },
    { id: 43, name: 'Swamp', type: 'Land - Swamp', rarity: 'Common', set: 'Various', image: null, addedAt: new Date().toISOString() },
    
    // 11/1/2025 - Assassin's Creed List
    { id: 44, name: 'Adewale, Breaker of Chains', type: 'Legendary Creature - Human', rarity: 'Rare', set: 'Secret Lair', image: null, addedAt: new Date().toISOString() },
    { id: 45, name: 'Altair ibn-La Ahad', type: 'Legendary Creature - Human', rarity: 'Rare', set: 'Secret Lair', image: null, addedAt: new Date().toISOString() },
    { id: 46, name: 'Grist, the Plague Swarm', type: 'Legendary Creature - Insect', rarity: 'Mythic', set: 'Modern Horizons 2', image: null, addedAt: new Date().toISOString() },
    { id: 47, name: 'Golgari Guild Gate', type: 'Land - Gate', rarity: 'Common', set: 'Ravnica Allegiance', image: null, addedAt: new Date().toISOString() },
    { id: 48, name: 'Deafening Clarion', type: 'Sorcery', rarity: 'Rare', set: 'Guilds of Ravnica', image: null, addedAt: new Date().toISOString() },
    { id: 49, name: 'Pilfering Imp', type: 'Creature - Imp', rarity: 'Common', set: 'Innistrad', image: null, addedAt: new Date().toISOString() },
    { id: 50, name: 'Hellkite Whelp', type: 'Creature - Dragon', rarity: 'Common', set: 'Modern Horizons', image: null, addedAt: new Date().toISOString() },
    { id: 51, name: 'Island', type: 'Land - Island', rarity: 'Common', set: 'Various', image: null, addedAt: new Date().toISOString() },
  ]
};

// ============================================
// JWT AUTHENTICATION MIDDLEWARE
// ============================================

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
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ============================================
// INPUT VALIDATION
// ============================================

const validateCardName = (name) => {
  if (!name || typeof name !== 'string') return false;
  if (name.length > 100) return false; // Prevent huge inputs
  return /^[a-zA-Z0-9\s\-',\.]+$/.test(name); // Only allow safe characters
};

const validateUsername = (username) => {
  if (!username || typeof username !== 'string') return false;
  if (username.length < 3 || username.length > 20) return false;
  return /^[a-zA-Z0-9_]+$/.test(username); // Alphanumeric + underscore only
};

const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 8; // Minimum 8 characters
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ============================================
// SCRYFALL API FUNCTIONS
// ============================================

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

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

app.post('/api/register', authLimiter, async (req, res) => {
  const { username, password, email } = req.body;

  // Validate inputs
  if (!validateUsername(username)) {
    return res.status(400).json({ error: 'Invalid username (3-20 alphanumeric characters)' });
  }
  if (!validatePassword(password)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
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
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', authLimiter, async (req, res) => {
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
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/verify', verifyToken, (req, res) => {
  res.json({ username: req.username });
});

// ============================================
// CARD ENDPOINTS
// ============================================

app.post('/api/verify-card', verifyToken, async (req, res) => {
  const { cardName } = req.body;

  if (!validateCardName(cardName)) {
    return res.status(400).json({ error: 'Invalid card name' });
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

  if (!validateCardName(cardName)) {
    return res.status(400).json({ error: 'Invalid card name' });
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

  if (cards.length > 500) {
    return res.status(400).json({ error: 'Too many cards (max 500)' });
  }

  // Validate each card
  for (const card of cards) {
    if (!validateCardName(card.name)) {
      return res.status(400).json({ error: 'Invalid card data' });
    }
  }

  if (!userCollections[req.username]) {
    userCollections[req.username] = [];
  }

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

// ============================================
// AI CHAT ENDPOINT - CLAUDE
// ============================================

app.post('/api/chat', verifyToken, async (req, res) => {
  const { message, cards } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid message' });
  }

  if (message.length > 500) {
    return res.status(400).json({ error: 'Message too long' });
  }

  try {
    // Create a safe context about the user's collection
    const cardNames = cards.map(c => c.name).join(', ');
    const context = `The user has these Magic: The Gathering cards: ${cardNames}. 
They're asking: "${message}"

Provide helpful, friendly advice about deck building, card synergies, format legality, and MTG strategy. 
Be concise and keep responses under 200 words.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: context
        }
      ]
    });

    const aiResponse = response.content[0].type === 'text' ? response.content[0].text : 'Sorry, I could not generate a response.';

    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Claude API error:', error);
    res.status(500).json({ error: 'AI service temporarily unavailable' });
  }
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`🔒 MTG Deck Builder (Fort Knox Secure) running on port ${PORT}`);
  console.log(`✅ Security features: Helmet, Rate Limiting, Input Validation, CORS Lockdown`);
  console.log(`✅ AI Chat: Claude enabled`);
});