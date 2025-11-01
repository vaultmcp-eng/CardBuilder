import React, { useState, useEffect } from 'react';
import { Upload, LogOut, Search, Plus, Trash2, ChevronDown, AlertCircle } from 'lucide-react';

const MTGDeckBuilder = () => {
  const [authState, setAuthState] = useState('login'); // 'login', 'register', 'dashboard'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  // Card management
  const [cards, setCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCards, setFilteredCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Card verification modal
  const [verificationModal, setVerificationModal] = useState(null);
  const [cardSuggestions, setCardSuggestions] = useState([]);
  
  // Card versions dropdown
  const [expandedCard, setExpandedCard] = useState(null);
  const [cardVersions, setCardVersions] = useState({});
  const [loadingVersions, setLoadingVersions] = useState(null);
  
  // Hover tooltip
  const [hoveredCard, setHoveredCard] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Load token and user on mount
  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  // Verify token is still valid
  const verifyToken = async () => {
    try {
      const response = await fetch(`${API_URL}/verify`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.username);
        setAuthState('dashboard');
        loadUserCards();
      } else {
        localStorage.removeItem('token');
        setToken(null);
        setAuthState('login');
      }
    } catch (err) {
      console.error('Token verification failed:', err);
      setAuthState('login');
    }
  };

  // Filter cards based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = cards.filter(card =>
        card.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCards(filtered);
    } else {
      setFilteredCards(cards);
    }
  }, [searchTerm, cards]);

  // --- AUTHENTICATION FUNCTIONS ---
  
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Registration failed');
      }

      setError('');
      setAuthState('login');
      setUsername('');
      setPassword('');
      setEmail('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setCurrentUser(data.username);
      setAuthState('dashboard');
      setUsername('');
      setPassword('');
      await loadUserCards();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    setCards([]);
    setAuthState('login');
    setUsername('');
    setPassword('');
  };

  // --- CARD MANAGEMENT FUNCTIONS ---

  const loadUserCards = async () => {
    try {
      const response = await fetch(`${API_URL}/cards`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to load cards');

      const data = await response.json();
      setCards(data.cards || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const verifyCardName = async (cardName) => {
    try {
      const response = await fetch(`${API_URL}/verify-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cardName })
      });

      if (!response.ok) throw new Error('Verification failed');

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Card verification error:', err);
      return null;
    }
  };

  const handleTxtUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const text = await file.text();
      const cardNames = text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      // Process each card
      const newCards = [];
      const unrecognizedCards = [];

      for (const cardName of cardNames) {
        const verification = await verifyCardName(cardName);

        if (verification?.found) {
          newCards.push({
            name: verification.card.name,
            type: verification.card.type,
            rarity: verification.card.rarity,
            image: verification.card.image,
            setName: verification.card.setName,
            prices: verification.card.prices,
            cardId: verification.card.cardId
          });
        } else if (verification?.suggestions?.length > 0) {
          unrecognizedCards.push({
            input: cardName,
            suggestions: verification.suggestions
          });
        } else {
          unrecognizedCards.push({
            input: cardName,
            suggestions: []
          });
        }
      }

      // If there are unrecognized cards, show modal
      if (unrecognizedCards.length > 0) {
        setVerificationModal({
          unrecognized: unrecognizedCards,
          recognized: newCards,
          currentIndex: 0
        });
      } else {
        // All cards recognized, add them
        await addCardsToCollection(newCards);
        alert(`Added ${newCards.length} cards to your collection!`);
      }
    } catch (err) {
      setError('Error reading file: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addCardsToCollection = async (cardsToAdd) => {
    try {
      const response = await fetch(`${API_URL}/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cards: cardsToAdd })
      });

      if (!response.ok) throw new Error('Failed to add cards');

      await loadUserCards();
    } catch (err) {
      setError('Error adding cards: ' + err.message);
    }
  };

  const handleVerificationChoice = async (cardIndex, selectedSuggestion) => {
    const modal = verificationModal;
    const unrecognized = modal.unrecognized[cardIndex];

    if (selectedSuggestion) {
      modal.recognized.push({
        name: selectedSuggestion.name,
        image: selectedSuggestion.image
      });
    }

    // Move to next unrecognized card or finish
    if (cardIndex + 1 < modal.unrecognized.length) {
      modal.currentIndex = cardIndex + 1;
      setVerificationModal({ ...modal });
    } else {
      setVerificationModal(null);
      await addCardsToCollection(modal.recognized);
      alert(`Added ${modal.recognized.length} cards to your collection!`);
    }
  };

  const getCardVersions = async (cardName, cardId) => {
    if (cardVersions[cardId]) {
      setExpandedCard(expandedCard === cardId ? null : cardId);
      return;
    }

    setLoadingVersions(cardId);
    try {
      const response = await fetch(`${API_URL}/card-versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cardName })
      });

      if (!response.ok) throw new Error('Failed to fetch versions');

      const data = await response.json();
      setCardVersions(prev => ({ ...prev, [cardId]: data.versions }));
      setExpandedCard(cardId);
    } catch (err) {
      setError('Error fetching card versions: ' + err.message);
    } finally {
      setLoadingVersions(null);
    }
  };

  const handleMouseEnter = (card, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({ x: rect.right + 10, y: rect.top });
    setHoveredCard(card);
  };

  const deleteCard = async (cardId) => {
    try {
      const response = await fetch(`${API_URL}/cards/${cardId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete card');

      await loadUserCards();
    } catch (err) {
      setError('Error deleting card: ' + err.message);
    }
  };

  // --- RENDER AUTH SCREENS ---

  if (authState === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur rounded-lg p-8 border border-gray-700">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              MTG Deck Builder
            </h1>
            <p className="text-gray-400 mb-6">Build, manage, and optimize your Magic decks</p>

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded flex gap-2 text-red-200">
                  <AlertCircle size={20} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold py-2 rounded-lg transition"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-gray-400 text-sm mb-4">Don't have an account?</p>
              <button
                onClick={() => setAuthState('register')}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 rounded-lg transition"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (authState === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur rounded-lg p-8 border border-gray-700">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="text-gray-400 mb-6">Join the MTG community</p>

            <form onSubmit={handleRegister}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded flex gap-2 text-red-200">
                  <AlertCircle size={20} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 text-white font-semibold py-2 rounded-lg transition"
              >
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <button
                onClick={() => {
                  setAuthState('login');
                  setError('');
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- DASHBOARD ---

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              MTG Deck Builder
            </h1>
            <p className="text-gray-400">Welcome, <span className="font-semibold">{currentUser}</span></p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>

        {/* Upload Section */}
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur rounded-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4">Add Cards to Collection</h2>
          <label className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg cursor-pointer transition flex items-center gap-2 w-fit">
            <Upload size={20} />
            Upload .txt File
            <input
              type="file"
              accept=".txt"
              onChange={handleTxtUpload}
              className="hidden"
              disabled={loading}
            />
          </label>
          <p className="text-gray-400 text-sm mt-2">One card name per line. Example: "Lightning Bolt"</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded flex gap-2 text-red-200">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card, idx) => (
            <div key={idx} className="bg-gray-800 bg-opacity-50 backdrop-blur rounded-lg p-4 border border-gray-700 hover:border-purple-500 transition">
              {/* Card Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3
                    className="font-bold text-lg cursor-pointer hover:text-purple-400 transition"
                    onMouseEnter={(e) => handleMouseEnter(card, e)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {card.name}
                  </h3>
                  <p className="text-gray-400 text-sm">{card.type}</p>
                </div>
                <button
                  onClick={() => deleteCard(idx)}
                  className="text-red-400 hover:text-red-300 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Card Details */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Rarity:</span>
                  <span className={card.rarity === 'mythic' ? 'text-red-400' : card.rarity === 'rare' ? 'text-yellow-400' : 'text-gray-300'}>
                    {card.rarity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Set:</span>
                  <span>{card.setName}</span>
                </div>
              </div>

              {/* Versions Dropdown */}
              <button
                onClick={() => getCardVersions(card.name, idx)}
                className="w-full bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg flex items-center justify-between transition text-sm mb-4"
              >
                <span>View Versions</span>
                <ChevronDown size={16} className={expandedCard === idx ? 'rotate-180' : ''} />
              </button>

              {loadingVersions === idx && (
                <div className="text-gray-400 text-sm">Loading versions...</div>
              )}

              {expandedCard === idx && cardVersions[idx] && (
                <div className="space-y-2 border-t border-gray-700 pt-3">
                  {cardVersions[idx].map((version, vIdx) => (
                    <div key={vIdx} className="flex gap-2 p-2 bg-gray-700 rounded text-sm">
                      {version.thumbnail && (
                        <img
                          src={version.thumbnail}
                          alt={version.setName}
                          className="w-8 h-12 object-cover rounded"
                          title={version.setName}
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-gray-300">{version.setName}</p>
                        <p className="text-gray-500 text-xs">${version.prices.usd}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredCards.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No cards yet. Upload a .txt file to get started!</p>
          </div>
        )}

        {/* Hover Tooltip */}
        {hoveredCard && hoveredCard.image && (
          <div
            className="fixed bg-gray-900 border border-purple-500 rounded-lg p-2 pointer-events-none z-50"
            style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
          >
            <img
              src={hoveredCard.image}
              alt={hoveredCard.name}
              className="w-32 h-48 object-cover rounded"
            />
          </div>
        )}

        {/* Verification Modal */}
        {verificationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full border border-gray-700">
              <h2 className="text-2xl font-bold mb-4">Verify Card</h2>
              <p className="text-gray-400 mb-4">
                We couldn't find "{verificationModal.unrecognized[verificationModal.currentIndex].input}"
              </p>

              {verificationModal.unrecognized[verificationModal.currentIndex].suggestions.length > 0 ? (
                <div className="space-y-2 mb-6">
                  <p className="text-sm text-gray-300 mb-3">Did you mean:</p>
                  {verificationModal.unrecognized[verificationModal.currentIndex].suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleVerificationChoice(verificationModal.currentIndex, suggestion)}
                      className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-left transition"
                    >
                      {suggestion.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 mb-6">No suggestions found.</p>
              )}

              <button
                onClick={() => handleVerificationChoice(verificationModal.currentIndex, null)}
                className="w-full bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition"
              >
                Skip
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MTGDeckBuilder;
