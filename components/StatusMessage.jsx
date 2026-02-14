import React from 'react';
import ExplorerLink from './ExplorerLink';

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
      <span>
        {parts[0]}
        <span className="font-mono bg-black/20 px-1 rounded mx-1">
          TX: <ExplorerLink txId={txId} />
        </span>
        {parts[1]}
      </span>
    );
  }

  const styles = {
    success: 'bg-green-500/10 border-green-500/30 text-green-400',
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
  };

  const cssClass = styles[status.type] || styles.info;

  return (
    <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${cssClass}`}>
      <span className="text-xl">
        {status.type === 'success' ? '✅' : 
         status.type === 'error' ? '❌' : 
         status.type === 'warning' ? '⚠️' : 'ℹ️'}
      </span>
      <div className="flex-1 break-words">
        {content}
      </div>
    </div>
  );
};

export default StatusMessage;
