/**
 * CampusTrust AI - Dashboard Component
 * ========================================
 * Main dashboard showing overview of all campus governance modules.
 */

import React, { useState, useEffect } from 'react';

const FEATURES = [
  {
    id: 'voting',
    title: 'Decentralized Voting',
    icon: '🗳️',
    desc: 'Tamper-proof campus elections with one-student-one-vote verification on Algorand.',
    color: 'from-purple-500 to-indigo-600',
    stats: { label: 'Active Elections', value: '—' },
  },
  {
    id: 'credentials',
    title: 'Verifiable Credentials',
    icon: '📜',
    desc: 'Issue and verify academic certificates as on-chain records with AI authenticity scoring.',
    color: 'from-emerald-500 to-green-600',
    stats: { label: 'Issued', value: '—' },
  },
  {
    id: 'feedback',
    title: 'AI Feedback Analysis',
    icon: '💬',
    desc: 'Anonymous feedback with real-time AI sentiment analysis stored on blockchain.',
    color: 'from-orange-500 to-amber-600',
    stats: { label: 'Responses', value: '—' },
  },
  {
    id: 'attendance',
    title: 'Smart Attendance',
    icon: '✅',
    desc: 'Blockchain-verified attendance tracking with AI anomaly detection for proxy prevention.',
    color: 'from-cyan-500 to-blue-600',
    stats: { label: 'Sessions', value: '—' },
  },
];

export default function Dashboard({ onNavigate, walletAddress, contractStates, onConnectWallet }) {
  const [aiStatus, setAiStatus] = useState('checking');

  useEffect(() => {
    // Always show offline status for demo
    setAiStatus('offline');
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        {!walletAddress && (
          <div className="mb-6">
            <button
              onClick={onConnectWallet}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all transform hover:scale-105"
            >
              🔗 Connect Wallet to Get Started
            </button>
          </div>
        )}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-300 text-sm mb-6">
          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
          Built on Algorand Blockchain
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          CampusTrust <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">AI</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          AI-Powered Decentralized Campus Governance & Verification Platform.
          Transparent voting, verifiable credentials, smart attendance, and AI-driven feedback analysis.
        </p>
      </div>

      {/* Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatusCard
          icon="🔗"
          label="Blockchain"
          value="Algorand TestNet"
          status="active"
        />
        <StatusCard
          icon="🧠"
          label="AI Engine"
          value="Built-in (NLP)"
          status="active"
        />
        <StatusCard
          icon="👛"
          label="Wallet"
          value={walletAddress ? `Connected` : 'Click to Connect'}
          status={walletAddress ? 'active' : 'warning'}
          onClick={walletAddress ? undefined : onConnectWallet}
          clickable={!walletAddress}
        />
        <StatusCard
          icon="📋"
          label="Contracts"
          value="4 Deployed"
          status="active"
        />
      </div>

      {/* Feature Cards */}
      <h2 className="text-2xl font-bold text-white mb-6">Campus Governance Modules</h2>
      <div className="grid sm:grid-cols-2 gap-6 mb-12">
        {FEATURES.map(feature => (
          <button
            key={feature.id}
            onClick={() => onNavigate(feature.id)}
            className="group text-left bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 hover:border-cyan-500/30 hover:bg-gray-800/80 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                {feature.icon}
              </div>
              <span className="text-gray-600 group-hover:text-cyan-400 transition-colors text-xl">→</span>
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">{feature.desc}</p>
            <div className="border-t border-gray-700/50 pt-3">
              <span className="text-gray-500 text-xs">{feature.stats.label}: </span>
              <span className="text-cyan-300 text-sm font-mono">{feature.stats.value}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Technology Stack */}
      <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-8 mb-8">
        <h2 className="text-xl font-bold text-white mb-6 text-center">Technology Stack</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <TechBadge icon="⛓️" name="Algorand" desc="Blockchain Layer" />
          <TechBadge icon="🐍" name="PyTeal" desc="Smart Contracts" />
          <TechBadge icon="🧠" name="AI/NLP" desc="TextBlob + scikit-learn" />
          <TechBadge icon="⚛️" name="React" desc="Frontend UI" />
        </div>
      </div>

      {/* Track Info */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6 text-center">
        <p className="text-cyan-300 text-sm font-semibold mb-1">AI and Automation in Blockchain</p>
        <p className="text-gray-400 text-xs">
          Improving trust, verification, and coordination for campus activities using Algorand blockchain and AI.
        </p>
      </div>
    </div>
  );
}

function StatusCard({ icon, label, value, status, onClick, clickable }) {
  const statusColors = {
    active: 'border-green-500/30 bg-green-500/5',
    pending: 'border-yellow-500/30 bg-yellow-500/5',
    warning: 'border-orange-500/30 bg-orange-500/5',
    inactive: 'border-gray-600/30 bg-gray-800/50',
  };

  const dotColors = {
    active: 'bg-green-400',
    pending: 'bg-yellow-400 animate-pulse',
    warning: 'bg-orange-400',
    inactive: 'bg-gray-500',
  };

  const Component = clickable ? 'button' : 'div';
  const clickProps = clickable ? {
    onClick,
    className: `border rounded-xl p-4 ${statusColors[status]} cursor-pointer hover:bg-orange-500/15 transition-all hover:border-orange-500/50 text-left w-full`,
  } : {
    className: `border rounded-xl p-4 ${statusColors[status]}`,
  };

  return (
    <Component {...clickProps}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className={`w-2 h-2 rounded-full ${dotColors[status]}`}></span>
      </div>
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="text-white text-sm font-medium">{value}</p>
      {clickable && <p className="text-orange-400 text-xs mt-1">👆 Click here</p>}
    </Component>
  );
}

function TechBadge({ icon, name, desc }) {
  return (
    <div className="text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-white font-semibold text-sm">{name}</p>
      <p className="text-gray-500 text-xs">{desc}</p>
    </div>
  );
}
