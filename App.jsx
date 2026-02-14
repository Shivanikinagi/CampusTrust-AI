/**
 * CampusTrust AI - Main App Entry Point
 * ========================================
 * AI-Powered Decentralized Campus Governance on Algorand
 * AI and Automation in Blockchain
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Dashboard from './components/Dashboard.jsx';
import VotingSystem from './components/VotingSystem.jsx';
import CredentialManager from './components/CredentialManager.jsx';
import FeedbackSystem from './components/FeedbackSystem.jsx';
import AttendanceTracker from './components/AttendanceTracker.jsx';
import AIAnalytics from './components/AIAnalytics.jsx';
import GovernanceDAO from './components/GovernanceDAO.jsx';
import TokenRewards from './components/TokenRewards.jsx';
import BadgeGallery from './components/BadgeGallery.jsx';
import WalletConnect from './components/WalletConnect.jsx';
import { getAccountInfo } from './services/algorandService.js';

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(0);
  const [showWalletModal, setShowWalletModal] = useState(false);

  // Load balance when wallet connects
  useEffect(() => {
    if (wallet?.address) {
      getAccountInfo(wallet.address)
        .then(info => setBalance(info.balance))
        .catch(() => setBalance(0));
    }
  }, [wallet?.address]);

  const handleConnect = (walletInfo) => {
    setWallet(walletInfo);
    if (walletInfo.balance !== undefined) {
      setBalance(walletInfo.balance);
    }
    setShowWalletModal(false);
  };

  const handleDisconnect = () => {
    if (wallet?.peraWallet) {
      wallet.peraWallet.disconnect();
    }
    setWallet(null);
    setBalance(0);
  };

  const renderPage = () => {
    const commonProps = {
      walletAddress: wallet?.address,
      signCallback: wallet?.signCallback,
    };

    switch (activePage) {
      case 'voting':
        return <VotingSystem {...commonProps} />;
      case 'credentials':
        return <CredentialManager {...commonProps} />;
      case 'feedback':
        return <FeedbackSystem {...commonProps} />;
      case 'attendance':
        return <AttendanceTracker {...commonProps} />;
      case 'governance':
        return <GovernanceDAO {...commonProps} />;
      case 'analytics':
        return <AIAnalytics {...commonProps} />;
      case 'tokens':
        return <TokenRewards {...commonProps} tokenAssetId={import.meta.env.VITE_TOKEN_APP_ID} />;
      case 'badges':
        return <BadgeGallery {...commonProps} badgeAssetIds={[import.meta.env.VITE_BADGE_APP_ID]} />;
      default:
        return (
          <Dashboard
            onNavigate={setActivePage}
            walletAddress={wallet?.address}
            onConnectWallet={() => setShowWalletModal(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar
        activePage={activePage}
        onNavigate={setActivePage}
        walletAddress={wallet?.address}
        onConnectWallet={() => setShowWalletModal(true)}
        onDisconnect={handleDisconnect}
        balance={balance}
      />

      <main>
        {renderPage()}
      </main>

      {/* Wallet Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50">
          <WalletConnect
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            isConnected={!!wallet}
            onClose={() => setShowWalletModal(false)}
          />
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-sm">
            CampusTrust AI — Built on Algorand Blockchain
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
