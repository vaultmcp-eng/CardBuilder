import React, { useState } from 'react';
import { Search, ChevronDown, Trash2, MessageCircle } from 'lucide-react';

const SampleAccountPreview = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);
  
  // Your actual cards from the document
  const sampleCards = [
    { id: 1, name: 'Anguished Unmaking', type: 'Sorcery', rarity: 'Rare', set: 'Custom Set', image: null },
    { id: 2, name: 'Aradesh, the Founder', type: 'Legendary Creature - Human', rarity: 'Mythic', set: 'Custom Set', image: null },
    { id: 3, name: 'Arcane Signet', type: 'Artifact', rarity: 'Uncommon', set: 'Custom Set', image: null },
    { id: 4, name: 'Ash Barrens', type: 'Land', rarity: 'Common', set: 'Custom Set', image: null },
    { id: 5, name: 'Assemble the Legion', type: 'Enchantment - Conspiracy', rarity: 'Rare', set: 'Custom Set', image: null },
    { id: 6, name: 'Bastion of Remembrance', type: 'Enchantment', rarity: 'Rare', set: 'Custom Set', image: null },
    { id: 7, name: 'Battle of Hoover Dam', type: 'Sorcery', rarity: 'Rare', set: 'Custom Set', image: null },
    { id: 8, name: 'Black Market', type: 'Enchantment', rarity: 'Rare', set: 'Custom Set', image: null },
    { id: 9, name: 'Boomer Scrapper', type: 'Creature - Human', rarity: 'Uncommon', set: 'Custom Set', image: null },
    { id: 10, name: 'Butch DeLoria, Tunnel Snake', type: 'Creature - Human', rarity: 'Uncommon', set: 'Custom Set', image: null },
    { id: 11, name: 'Caesar, Legion\'s Emperor', type: 'Legendary Creature - Human', rarity: 'Mythic', set: 'Custom Set', image: null },
    { id: 12, name: 'Mountain', type: 'Land - Mountain', rarity: 'Common', set: 'Custom Set', image: null },
    { id: 13, name: 'Plains', type: 'Land - Plains', rarity: 'Common', set: 'Custom Set', image: null },
    { id: 14, name: 'Swamp', type: 'Land - Swamp', rarity: 'Common', set: 'Custom Set', image: null },
    { id: 15, name: 'Armament Dragon', type: 'Creature - Dragon', rarity: 'Rare', set: 'Lord of the Rings', image: null },
    { id: 16, name: 'Blade of the Swarm', type: 'Artifact - Equipment', rarity: 'Uncommon', set: 'Modern Horizons', image: null },
    { id: 17, name: 'Nebula Dragon', type: 'Creature - Dragon', rarity: 'Mythic', set: 'Unfinity', image: null },
    { id: 18, name: 'Frodo Baggins', type: 'Legendary Creature - Halfling', rarity: 'Rare', set: 'Lord of the Rings', image: null },
    { id: 19, name: 'The Shire', type: 'Legendary Land', rarity: 'Rare', set: 'Lord of the Rings', image: null },
    { id: 20, name: 'Samwise the Stouthearted', type: 'Legendary Creature - Halfling', rarity: 'Rare', set: 'Lord of the Rings', image: null },
    { id: 21, name: 'Adewale, Breaker of Chains', type: 'Legendary Creature - Human', rarity: 'Rare', set: 'Secret Lair', image: null },
    { id: 22, name: 'Altair ibn-La Ahad', type: 'Legendary Creature - Human', rarity: 'Rare', set: 'Secret Lair', image: null },
    { id: 23, name: 'Grist, the Plague Swarm', type: 'Legendary Creature - Insect', rarity: 'Mythic', set: 'Modern Horizons 2', image: null },
  ];

  const filteredCards = searchTerm
    ? sampleCards.filter(card => card.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : sampleCards;

  const cardStats = {
    total: sampleCards.length,
    mythic: sampleCards.filter(c => c.rarity === 'Mythic').length,
    rare: sampleCards.filter(c => c.rarity === 'Rare').length,
    uncommon: sampleCards.filter(c => c.rarity === 'Uncommon').length,
    common: sampleCards.filter(c => c.rarity === 'Common').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              MTG Deck Builder
            </h1>
            <p className="text-gray-400">Welcome, <span className="font-semibold text-purple-300">wolfe_hoover</span></p>
          </div>
          <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition">
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur rounded-lg p-4 border border-purple-500">
            <p className="text-gray-400 text-sm">Total Cards</p>
            <p className="text-2xl font-bold">{cardStats.total}</p>
          </div>
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur rounded-lg p-4 border border-red-500">
            <p className="text-gray-400 text-sm">Mythic</p>
            <p className="text-2xl font-bold text-red-400">{cardStats.mythic}</p>
          </div>
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur rounded-lg p-4 border border-yellow-500">
            <p className="text-gray-400 text-sm">Rare</p>
            <p className="text-2xl font-bold text-yellow-400">{cardStats.rare}</p>
          </div>
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur rounded-lg p-4 border border-gray-400">
            <p className="text-gray-400 text-sm">Uncommon</p>
            <p className="text-2xl font-bold text-gray-300">{cardStats.uncommon}</p>
          </div>
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur rounded-lg p-4 border border-gray-600">
            <p className="text-gray-400 text-sm">Common</p>
            <p className="text-2xl font-bold text-gray-400">{cardStats.common}</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search cards... (try 'Frodo' or 'Mountain')"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {filteredCards.map((card) => (
            <div key={card.id} className="bg-gray-800 bg-opacity-50 backdrop-blur rounded-lg p-4 border border-gray-700 hover:border-purple-500 transition">
              {/* Card Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg hover:text-purple-400 transition cursor-pointer">
                    {card.name}
                  </h3>
                  <p className="text-gray-400 text-sm">{card.type}</p>
                </div>
                <button className="text-red-400 hover:text-red-300 transition">
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Card Details */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Rarity:</span>
                  <span className={`${
                    card.rarity === 'Mythic' ? 'text-red-400 font-bold' :
                    card.rarity === 'Rare' ? 'text-yellow-400 font-bold' :
                    card.rarity === 'Uncommon' ? 'text-gray-300' :
                    'text-gray-500'
                  }`}>
                    {card.rarity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Set:</span>
                  <span>{card.set}</span>
                </div>
              </div>

              {/* Versions Button */}
              <button
                onClick={() => setExpandedCard(expandedCard === card.id ? null : card.id)}
                className="w-full bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg flex items-center justify-between transition text-sm"
              >
                <span>View Versions</span>
                <ChevronDown size={16} className={expandedCard === card.id ? 'rotate-180' : ''} />
              </button>

              {/* Expanded Versions (Sample) */}
              {expandedCard === card.id && (
                <div className="space-y-2 border-t border-gray-700 pt-3 mt-3">
                  <div className="flex gap-2 p-2 bg-gray-700 rounded text-sm">
                    <div className="flex-1">
                      <p className="text-gray-300 font-semibold">{card.set}</p>
                      <p className="text-gray-500 text-xs">First Edition</p>
                    </div>
                  </div>
                  <div className="flex gap-2 p-2 bg-gray-700 rounded text-sm">
                    <div className="flex-1">
                      <p className="text-gray-300 font-semibold">Extended Art</p>
                      <p className="text-gray-500 text-xs">Premium Version</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredCards.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No cards found matching "{searchTerm}"</p>
          </div>
        )}

        {/* AI Chat Bubble */}
        <div className="fixed bottom-6 right-6 z-40">
          <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg transition transform hover:scale-110" title="Chat with MTG AI">
            <MessageCircle size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SampleAccountPreview;
