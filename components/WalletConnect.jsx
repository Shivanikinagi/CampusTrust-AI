/**
 * CampusTrust AI - Wallet Connect Component
 * =============================================
 * Handles Algorand wallet connection using Pera Wallet
 * or demo mode with generated accounts.
 */

import React, { useState } from 'react';
import { generateAccount, getAccountInfo, checkNetwork } from '../services/algorandService.js';

export default function WalletConnect({ onConnect, onDisconnect, isConnected, onClose }) {
  const [mode, setMode] = useState('demo'); // 'pera' | 'demo' | 'mnemonic'
  const [mnemonic, setMnemonic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [networkStatus, setNetworkStatus] = useState(null);

  const connectDemo = async () => {
    setLoading(true);
    setError('');
    try {
      // Check network first
      const status = await checkNetwork();
      setNetworkStatus(status);

      // Check if we have a stored demo account
      let account;
      // Use the Deployer account for Demo mode to ensure funds availability
      // Address: DM3C5EZCEA6JFB7BCBTECUQ7JU7UQ3WQA4PEVUU4ERUVLDWNGO6GTR7GNU
      const DEPLOYER_MNEMONIC = "clinic flight whip bounce jaguar glide alcohol test wise educate broccoli cushion crystal bullet capital purpose junior scrub attract logic kitchen category enact abandon brisk";
      
      const storedDemo = localStorage.getItem('demo_account_mnemonic');
      const mnemonicToUse = storedDemo || DEPLOYER_MNEMONIC;

      // Always prefer the funded deployer account if the stored one is empty/invalid
      // or simply force use the deployer account for this session to fix overspend
      
      const algosdk = (await import('algosdk')).default;
      const sk = algosdk.mnemonicToSecretKey(DEPLOYER_MNEMONIC);
      
      account = {
          address: sk.addr,
          mnemonic: DEPLOYER_MNEMONIC,
          sk: sk.sk
      };
      
      // Save it so it persists (though we hardcoded it now)
      localStorage.setItem('demo_account_mnemonic', DEPLOYER_MNEMONIC);
      console.log("Using funded Demo account:", account.address);
      
      /* 
      // Original logic disabled to prevent 0-balance accounts
      if (storedDemo) { ... } else { ... }
      */
      
      // Create a sign callback that uses the secret key directly
      const signCallback = async (txn) => {
        const algosdk = (await import('algosdk')).default;
        return txn.signTxn(account.sk);
      };

      onConnect({
        address: account.address,
        mnemonic: account.mnemonic,
        signCallback,
        mode: 'demo',
      });
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const connectPera = async () => {
    setLoading(true);
    setError('');
    try {
      // Dynamic import for Pera Wallet
      const { PeraWalletConnect } = await import('@perawallet/connect');
      const peraWallet = new PeraWalletConnect();
      
      const accounts = await peraWallet.connect();
      const address = accounts[0];

      const signCallback = async (txnGroup) => {
        const signedTxns = await peraWallet.signTransaction([
          [{ txn: txnGroup }],
        ]);
        return signedTxns[0];
      };

      onConnect({
        address,
        signCallback,
        mode: 'pera',
        peraWallet,
      });
    } catch (err) {
      if (err.message?.includes('cancelled') || err.message?.includes('rejected')) {
        setError('Connection cancelled by user');
      } else {
        setError('Pera Wallet not available. Try demo mode.');
      }
    }
    setLoading(false);
  };

  const connectMnemonic = async () => {
    setLoading(true);
    setError('');
    try {
      const algosdk = (await import('algosdk')).default;
      const sk = algosdk.mnemonicToSecretKey(mnemonic.trim());

      const signCallback = async (txn) => {
        return txn.signTxn(sk.sk);
      };

      // Verify account exists on network (with fallback)
      let balance = 0;
      try {
        setError('Connecting to Algorand TestNet...');
        const info = await getAccountInfo(sk.addr);
        balance = info.balance;
      } catch (networkErr) {
        console.warn('Network verification failed, proceeding without balance check:', networkErr);
        // If network fails but mnemonic is valid, allow connection anyway
        // This is safe because transactions will fail if account has no funds
        setError('⚠️ Network slow - Connecting anyway (balance unknown)');
        await new Promise(r => setTimeout(r, 1000)); // Brief delay to show message
      }

      onConnect({
        address: sk.addr,
        signCallback,
        mode: 'mnemonic',
        balance: balance,
      });
      setMnemonic('');
    } catch (err) {
      console.error("Wallet connection error:", err);
      // Show the actual error message from the service
      setError(err.message || 'Invalid mnemonic phrase. Please check and try again.');
    }
    setLoading(false);
  };

  if (isConnected) return null;

  return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-cyan-500/20 rounded-2xl max-w-md w-full p-6 shadow-2xl shadow-cyan-500/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
              <button
                onClick={() => { onClose?.(); setError(''); }}
                className="text-gray-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-gray-400 text-sm mb-6">
              Connect your Algorand wallet to interact with CampusTrust on TestNet.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Mode Tabs */}
            <div className="flex gap-1 mb-6 bg-gray-800 rounded-lg p-1">
              {[
                { id: 'demo', label: '🎮 Demo' },
                { id: 'pera', label: '📱 Pera' },
                { id: 'mnemonic', label: '🔑 Mnemonic' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setMode(tab.id)}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                    mode === tab.id
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Demo Mode */}
            {mode === 'demo' && (
              <div>
                <p className="text-gray-400 text-sm mb-4">
                  Generate a temporary account for testing. No real ALGO needed - 
                  all transactions are simulated with the contract interaction layer.
                </p>
                <button
                  onClick={connectDemo}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50"
                >
                  {loading ? '⏳ Generating...' : '🚀 Start Demo Mode'}
                </button>
              </div>
            )}

            {/* Pera Wallet */}
            {mode === 'pera' && (
              <div>
                <p className="text-gray-400 text-sm mb-4">
                  Connect using Pera Wallet (mobile or browser extension).
                  Make sure you have TestNet ALGO in your wallet.
                </p>
                <button
                  onClick={connectPera}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? '⏳ Connecting...' : '📱 Connect Pera Wallet'}
                </button>
                <p className="text-gray-500 text-xs mt-3 text-center">
                  Get TestNet ALGO: <a href="https://bank.testnet.algorand.network/" target="_blank" className="text-cyan-400 hover:underline">TestNet Faucet</a>
                </p>
              </div>
            )}

            {/* Mnemonic */}
            {mode === 'mnemonic' && (
              <div>
                <p className="text-gray-400 text-sm mb-4">
                  Enter your 25-word mnemonic phrase. Only use TestNet accounts!
                </p>
                <textarea
                  value={mnemonic}
                  onChange={(e) => setMnemonic(e.target.value)}
                  placeholder="Enter 25-word mnemonic phrase..."
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm mb-4 h-24 resize-none focus:border-cyan-500 focus:outline-none"
                />
                <button
                  onClick={connectMnemonic}
                  disabled={loading || !mnemonic.trim()}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? '⏳ Connecting...' : '🔑 Connect with Mnemonic'}
                </button>
                <p className="text-red-400/60 text-xs mt-3 text-center">
                  ⚠️ Never enter mainnet mnemonics. TestNet only!
                </p>
              </div>
            )}
          </div>
        </div>
  );
}
