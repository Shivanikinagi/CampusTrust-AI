import React from 'react';

/**
 * ExplorerLink Component
 * Renders a clickable link to Pera Explorer for a given transaction ID or App ID
 */
const ExplorerLink = ({ txId, appId, type = 'tx', className }) => {
  const baseUrl = 'https://testnet.explorer.perawallet.app';
  const url = type === 'app' 
    ? `${baseUrl}/application/${appId}`
    : `${baseUrl}/tx/${txId}`;

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={`inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 hover:underline transition-colors ${className}`}
    >
      <span>{type === 'app' ? `App ${appId}` : `${txId.slice(0, 8)}...${txId.slice(-4)}`}</span>
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  );
};

export default ExplorerLink;
