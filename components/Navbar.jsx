/**
 * CampusTrust AI - Navbar Component
 * Navigation bar with wallet connection and page routing.
 */

import React, { useState } from 'react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', description: 'Overview & Analytics' },
  { id: 'attendance', label: 'Attendance', icon: '✅', description: 'AI Face Verification' },
  { id: 'permissions', label: 'Smart Permissions', icon: '🏛️', description: 'Event Approvals', featured: true },
  { id: 'voting', label: 'Voting', icon: '🗳️', description: 'Decentralized Elections', featured: true },
  { id: 'compute', label: 'P2P Compute', icon: '💻', description: 'GPU Marketplace' },
  { id: 'research', label: 'Research Cert', icon: '📝', description: 'Paper Certification' },

  { id: 'credentials', label: 'Credentials', icon: '📜', description: 'Digital Certificates' },
  { id: 'governance', label: 'DAO', icon: '🔐', description: 'Decentralized Governance' },
];

export default function Navbar({ activePage, onNavigate, walletAddress, onConnectWallet, onDisconnect, balance }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const shortAddr = walletAddress && typeof walletAddress === 'string'
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : '';

  return (
    <nav className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-cyan-500/30 shadow-2xl backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('dashboard')}>
            <div className="w-11 h-11 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg shadow-cyan-500/50 group-hover:shadow-cyan-500/70 transition-all group-hover:scale-105">
              <span className="text-white">CT</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-xl leading-tight tracking-tight">CampusTrust AI</h1>
              <p className="text-cyan-400 text-xs font-medium">Powered by Algorand</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1.5">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                title={item.description}
                className={`group relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activePage === item.id
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/20'
                    : item.featured
                      ? 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'
                  }`}
              >
                <span className="inline-flex items-center gap-2">
                  <span className={`text-base transition-transform group-hover:scale-110 ${item.featured ? 'animate-pulse' : ''}`}>{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                {item.featured && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Wallet */}
          <div className="flex items-center gap-3">
            {walletAddress ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right px-3 py-2 bg-slate-800/60 rounded-lg border border-slate-700">
                  <p className="text-cyan-300 text-xs font-mono font-semibold">{shortAddr}</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    <span className="text-cyan-500 font-semibold">{balance?.toFixed(2)}</span> ALGO
                  </p>
                </div>
                <button
                  onClick={onDisconnect}
                  className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium hover:bg-red-500/20 hover:border-red-500/50 transition-all"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={onConnectWallet}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600 text-white rounded-lg text-sm font-semibold hover:shadow-xl hover:shadow-cyan-500/40 transition-all hover:scale-105 active:scale-95"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Connect Wallet
                </span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-all"
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
        <div className="lg:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur-xl shadow-2xl">
          <div className="px-4 py-3 space-y-2">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${activePage === item.id
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40'
                    : item.featured
                      ? 'text-cyan-400 hover:text-cyan-300 bg-cyan-500/5 border border-cyan-500/20 hover:border-cyan-500/40'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <span className="text-base">{item.icon}</span>
                    <span>
                      <div className="font-semibold">{item.label}</div>
                      <div className="text-xs opacity-70 mt-0.5">{item.description}</div>
                    </span>
                  </span>
                  {item.featured && (
                    <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30">
                      NEW
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
