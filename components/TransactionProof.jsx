/**
 * TransactionProof Component
 * Displays blockchain transaction proof with explorer links
 */

import React from 'react';
import { ExternalLink, CheckCircle, Copy } from 'lucide-react';

const TransactionProof = ({ txId, appId, type = 'success', message, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const explorerUrl = txId 
    ? `https://testnet.explorer.perawallet.app/tx/${txId}`
    : appId 
    ? `https://testnet.explorer.perawallet.app/application/${appId}`
    : null;

  return (
    <div className={`rounded-xl border-2 p-6 mb-6 ${
      type === 'success' ? 'bg-green-500/10 border-green-500' :
      type === 'error' ? 'bg-red-500/10 border-red-500' :
      'bg-blue-500/10 border-blue-500'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <CheckCircle className={`w-6 h-6 ${
            type === 'success' ? 'text-green-400' :
            type === 'error' ? 'text-red-400' :
            'text-blue-400'
          }`} />
          <div>
            <h3 className={`font-bold text-lg ${
              type === 'success' ? 'text-green-400' :
              type === 'error' ? 'text-red-400' :
              'text-blue-400'
            }`}>
              Blockchain Confirmation
            </h3>
            <p className="text-gray-300 text-sm mt-1">{message}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
        {txId && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Transaction ID:</span>
              <button
                onClick={() => copyToClipboard(txId)}
                className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="font-mono text-xs text-green-400 bg-black/30 p-3 rounded break-all">
              {txId}
            </div>
          </div>
        )}

        {appId && (
          <div>
            <span className="text-gray-400 text-sm">Smart Contract:</span>
            <div className="font-mono text-xs text-green-400 bg-black/30 p-3 rounded mt-2">
              App ID: {appId}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-700">
          <div>
            <p className="text-gray-400 text-xs mb-1">Network</p>
            <p className="text-white text-sm font-semibold">Algorand TestNet</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Finality</p>
            <p className="text-white text-sm font-semibold">~4.5 seconds</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Status</p>
            <p className="text-green-400 text-sm font-semibold">✓ Confirmed</p>
          </div>
        </div>

        {explorerUrl && (
          <div className="pt-3 border-t border-gray-700">
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
            >
              <ExternalLink className="w-4 h-4" />
              View on Algorand Explorer
            </a>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-400 flex items-center gap-2">
        <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
        Transaction is immutable and permanently stored on Algorand blockchain
      </div>
    </div>
  );
};

export default TransactionProof;
