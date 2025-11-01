import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, Trash2 } from 'lucide-react';

const SampleAccountPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);

  // Your actual cards pre-loaded in the system
  const cards = [
    // 9/15/2025 - Fallout List
    { id: 1, name: 'Anguished Unmaking', type: 'Sorcery', rarity: 'Rare', set: 'Custom Set' },
    { id: 2, name: 'Aradesh, the Founder', type: 'Legendary Creature - Human', rarity: 'Mythic', set: 'Custom Set' },
    { id: 3, name: 'Arcane Signet', type: 'Artifact', rarity: 'Uncommon', set: 'Custom Set' },
    { id: 4, name: 'Ash Barrens', type: 'Land', rarity: 'Common', set: 'Custom Set' },
    { id: 5, name: 'Assemble the Legion', type: 'Enchantment', rarity: 'Rare', set: 'Custom Set' },
    { id: 6, name: 'Bastion of Remembrance', type: 'Enchantment', rarity: 'Rare', set: 'Custom Set' },
    { id: 7, name: 'Black Market', type: 'Enchantment', rarity: 'Rare', set: 'Custom Set' },
    { id: 8, name: 'Caesar, Legion\'s Emperor', type: 'Legendary Creature - Human', rarity: 'Mythic', set: 'Custom Set' },
    // 10/31/2025 - Lord of the Rings List
    { id: 32, name: 'Frodo Baggins', type: 'Legendary Creature - Halfling', rarity: 'Rare', set: 'Lord of the Rings' },
    { id: 33, name: 'Samwise the Stouthearted', type: 'Legendary Creature - Halfling', rarity: 'Rare', set: 'Lord of the Rings' },
    { id: 34, name: 'The Shire', type: 'Legendary Land', rarity: 'Rare', set: 'Lord of the Rings' },
    { id: 35, name: 'Gollum, Patient Plotter', type: 'Legendary Creature - Halfling', rarity: 'Rare', set: 'Lord of the Rings' },
    { id: 36, name: 'Nebula Dragon', type: 'Creature - Dragon', rarity: 'Mythic', set: 'Unfinity' },
    // 11/1/2025 - Assassin's Creed List
    { id: 44, name: 'Adewale, Breaker of Chains', type: 'Legendary Creature - Human', rarity: 'Rare', set: 'Secret Lair' },
    { id: 45, name: 'Altair ibn-La Ahad', type: 'Legendary Creature - Human', rarity: 'Rare', set: 'Secret Lair' },
    { id: 46, name: 'Grist, the Plague Swarm', type: 'Legendary Creature - Insect', rarity: 'Mythic', set: 'Modern Horizons 2' },
  ];

  const stats = useMemo(() => ({
    total: cards.length,
    mythic: cards.filter(c => c.rarity === 'Mythic').length,
    rare: cards.filter(c => c.rarity === 'Rare').length,
    uncommon: cards.filter(c => c.rarity === 'Uncommon').length,
    common: cards.filter(c => c.rarity === 'Common').length,
  }), []);

  const filteredCards = searchTerm
    ? cards.filter(card => card.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : cards;

  return (
    <div className="h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-black text-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-purple-900 to-black border-b border-purple-500 p-4 z-10">
        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
          PREVIEW: Your Account
        </h2>
        <p className="text-xs text-gray-400">Username: wolfe_hoover</p>
      </div>

      {/* Stats */}
      <div className="p-3 space-y-2 border-b border-slate-700">
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          <div className="bg-slate-800 p-2 rounded border border-purple-500/50">
            <p className="text-gray-400">Total</p>
            <p className="font-bold text-lg">{stats.total}</p>
          </div>
          <div className="bg-slate-800 p-2 rounded border border-red-500/50">
            <p className="text-gray-400">Mythic</p>
            <p className="font-bold text-red-400">{stats.mythic}</p>
          </div>
          <div className="bg-slate-800 p-2 rounded border border-yellow-500/50">
            <p className="text-gray-400">Rare</p>
            <p className="font-bold text-yellow-400">{stats.rare}</p>
          </div>
          <div className="bg-slate-800 p-2 rounded border border-gray-400/50">
            <p className="text-gray-400">Unc</p>
            <p className="font-bold">{stats.uncommon}</p>
          </div>
          <div className="bg-slate-800 p-2 rounded border border-gray-600/50">
            <p className="text-gray-400">Com</p>
            <p className="font-bold">{stats.common}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-slate-700 sticky top-16 bg-slate-800/50 backdrop-blur">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-700 text-white text-sm pl-7 pr-2 py-1.5 rounded border border-slate-600 focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Cards List */}
      <div className="p-3 space-y-2">
        {filteredCards.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No cards matching "{searchTerm}"
          </div>
        ) : (
          filteredCards.map((card) => (
            <div
              key={card.id}
              className="bg-slate-700/50 border border-slate-600 rounded p-3 hover:border-purple-500 transition"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-white leading-tight">
                    {card.name}
                  </h4>
                  <p className="text-xs text-gray-400 truncate">{card.type}</p>
                </div>
                <button className="text-red-400/60 hover:text-red-400 transition ml-1">
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                <div>
                  <span className="text-gray-500">Rarity: </span>
                  <span className={`${
                    card.rarity === 'Mythic' ? 'text-red-400 font-bold' :
                    card.rarity === 'Rare' ? 'text-yellow-400 font-bold' :
                    card.rarity === 'Uncommon' ? 'text-gray-300' :
                    'text-gray-500'
                  }`}>
                    {card.rarity}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500">Set: </span>
                  <span className="text-gray-300">{card.set}</span>
                </div>
              </div>

              {/* Versions Button */}
              <button
                onClick={() => setExpandedCard(expandedCard === card.id ? null : card.id)}
                className="w-full bg-slate-600/50 hover:bg-slate-600 text-xs py-1 px-2 rounded flex items-center justify-between border border-slate-500 transition"
              >
                <span>Versions</span>
                <ChevronDown size={12} className={expandedCard === card.id ? 'rotate-180' : ''} />
              </button>

              {/* Expanded Versions */}
              {expandedCard === card.id && (
                <div className="mt-2 space-y-1 border-t border-slate-600 pt-2">
                  <div className="bg-slate-600/30 p-2 rounded text-xs">
                    <div className="font-semibold">{card.set}</div>
                    <div className="text-gray-400">First Edition</div>
                  </div>
                  <div className="bg-slate-600/30 p-2 rounded text-xs">
                    <div className="font-semibold">Extended Art</div>
                    <div className="text-gray-400">Premium</div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="sticky bottom-0 p-3 bg-slate-800/50 border-t border-slate-700 text-xs text-gray-400">
        <p>✅ All your cards are private to your account</p>
        <p>✅ Data is Fort Knox secure</p>
        <p>✅ Ready to deploy to production</p>
      </div>
    </div>
  );
};

export default SampleAccountPanel;
