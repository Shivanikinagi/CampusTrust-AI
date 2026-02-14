import React from 'react';
import ExplorerLink from './ExplorerLink';
import { CheckCircle, AlertCircle, Info, AlertTriangle, ExternalLink } from 'lucide-react';

/**
 * StatusMessage Component
 * Parses status messages and automatically converts TX IDs to Explorer Links
 */
const StatusMessage = ({ status }) => {
  if (!status.message) return null;

  // Check for Transaction ID pattern: "TX: XXXXX..."
  const txMatch = status.message.match(/TX:\s*([A-Z0-9]{52})/i) || status.message.match(/TX:\s*([A-Z0-9]+)/i);
  
  let content = status.message;
  let txId = null;

  if (txMatch) {
    txId = txMatch[1];
    // Split message around the TX ID
    const parts = status.message.split(txMatch[0]);
    content = (
      <div className="space-y-2">
        <div className="font-semibold text-lg">
          {parts[0]}{parts[1]}
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-green-400 font-bold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Confirmed on Algorand TestNet
            </span>
            <span className="text-xs text-gray-500 font-mono">{new Date().toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center gap-3">
             <ExplorerLink txId={txId} label="View Transaction Proof" className="inline-flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition-colors no-underline hover:no-underline" />
          </div>
        </div>
      </div>
    );
  }

  const styles = {
    success: { bg: 'bg-green-500/10 border-green-500', text: 'text-green-400', icon: CheckCircle },
    error: { bg: 'bg-red-500/10 border-red-500', text: 'text-red-400', icon: AlertCircle },
    info: { bg: 'bg-blue-500/10 border-blue-500', text: 'text-blue-400', icon: Info },
    warning: { bg: 'bg-yellow-500/10 border-yellow-500', text: 'text-yellow-400', icon: AlertTriangle }
  };

  const styleConfig = styles[status.type] || styles.info;
  const Icon = styleConfig.icon;

  return (
    <div className={`mb-6 p-5 rounded-xl border-2 ${styleConfig.bg} ${styleConfig.text}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-6 h-6 flex-shrink-0 mt-0.5 ${styleConfig.text}`} />
        <div className="flex-1 break-words">
          {content}
        </div>
      </div>
    </div>
  );
};

export default StatusMessage;
