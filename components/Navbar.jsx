/**
 * CampusTrust AI - Navbar Component
 * Navigation bar with wallet connection and page routing.
 */

import React, { useState } from 'react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'voting', label: 'Voting', icon: '🗳️' },
  { id: 'credentials', label: 'Credentials', icon: '📜' },
  { id: 'feedback', label: 'Feedback', icon: '💬' },
  { id: 'attendance', label: 'Attendance', icon: '✅' },
  { id: 'skillbadges', label: 'Skill Badges', icon: '🏆' },
  { id: 'grants', label: 'Smart Grants', icon: '💰' },
  { id: 'compute', label: 'P2P Compute', icon: '💻' },
  { id: 'research', label: 'Research Cert', icon: '📝' },
  { id: 'treasurer', label: 'Algo-Agent', icon: '🤖' },
  { id: 'governance', label: 'DAO', icon: '🔐' },
];

export default function Navbar({ activePage, onNavigate, walletAddress, onConnectWallet, onDisconnect, balance }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const shortAddr = walletAddress && typeof walletAddress === 'string'
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : '';

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-cyan-500/20 shadow-lg shadow-cyan-500/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg shadow-cyan-500/30">
              CT
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">CampusTrust AI</h1>
              <p className="text-cyan-400 text-xs">Powered by Algorand</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activePage === item.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="mr-1.5">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Wallet */}
          <div className="flex items-center gap-3">
            {walletAddress ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:block text-right">
                  <p className="text-cyan-300 text-xs font-mono">{shortAddr}</p>
                  <p className="text-gray-500 text-xs">{balance?.toFixed(2)} ALGO</p>
                </div>
                <button
                  onClick={onDisconnect}
                  className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-xs hover:bg-red-500/20 transition-all"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={onConnectWallet}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
              >
                Connect Wallet
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden text-gray-400 hover:text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-800 bg-gray-900/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activePage === item.id
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
