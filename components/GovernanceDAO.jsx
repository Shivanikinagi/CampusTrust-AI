/**
 * CampusTrust AI - Multi-Sig Governance DAO
 * ============================================
 * Decentralized decision making requiring multiple admin signatures.
 * Demonstrates true decentralized control vs single-admin.
 */

import React, { useState } from 'react';
import StatusMessage from './StatusMessage';
import ExplorerLink from './ExplorerLink';

export default function GovernanceDAO({ walletAddress }) {
  const [activeTab, setActiveTab] = useState('proposals');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProposal, setNewProposal] = useState({ title: '', description: '', amount: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  
  // Simulated Multi-Sig Wallet State
  const [daoState, setDaoState] = useState({
    treasuryBalance: 25000,
    requiredSignatures: 3,
    totalSigners: 5,
    signers: [
        { id: 'ADM_1', name: 'Dean of Student Affairs', address: 'DEAN...7X9', signed: false },
        { id: 'ADM_2', name: 'Student Council President', address: 'PRES...3B2', signed: false },
        { id: 'ADM_3', name: 'Faculty Representative', address: 'FAC...8N1', signed: false },
        { id: 'ADM_4', name: 'Algorithms Dept Head', address: 'ALGO...4K5', signed: false },
        { id: 'ADM_5', name: 'Campus Treasurer', address: 'TREAS...9L0', signed: false },
    ]
  });

  const [proposals, setProposals] = useState([
    {
      id: 101,
      title: 'Allocate Q2 Research Grant',
      description: 'Release 5,000 ALGO to the AI Research Lab for GPU compute credits.',
      amount: 5000,
      recipient: 'AI_LAB_WALLET...99X',
      signatures: ['ADM_1', 'ADM_3'], // 2 of 3
      status: 'active',
      deadline: Date.now() + 86400000 * 2,
    },
    {
        id: 102,
        title: 'Upgrade Attendance Contract',
        description: 'Update smart contract logic to include new facial verification thresholds.',
        amount: 0,
        recipient: 'CONTRACT_DEPLOYER',
        signatures: ['ADM_2'], // 1 of 3
        status: 'active',
        deadline: Date.now() + 86400000 * 5,
      }
  ]);

  const handleCreate = () => {
    if(!newProposal.title || !newProposal.description) {
        setStatus({ type: 'error', message: 'Please fill in all fields.' });
        return;
    }

    setStatus({ type: 'info', message: 'Proposing new governance action...' });
    
    setTimeout(() => {
        const proposal = {
            id: proposals.length + 101 + Math.floor(Math.random()*10),
            title: newProposal.title,
            description: newProposal.description,
            amount: parseFloat(newProposal.amount) || 0,
            recipient: 'NEW_GRANTEE...XYZ',
            signatures: ['YOU (Creator)'],
            status: 'active',
            deadline: Date.now() + 86400000 * 7,
        };
        
        setProposals([proposal, ...proposals]);
        setShowCreateForm(false);
        setNewProposal({ title: '', description: '', amount: '' });
        setStatus({ type: 'success', message: 'Proposal Created! Waiting for other signers.' });
    }, 1500);
  };

  const handleSign = (proposalId) => {
    // Simulate signing based on current wallet or just demo action
    const proposal = proposals.find(p => p.id === proposalId);
    
    // Check if already 3 signatures
    if (proposal.signatures.length >= daoState.requiredSignatures) {
        setStatus({ type: 'error', message: 'Proposal already fully signed and executed.' });
        return;
    }

    // In a real app, we check if walletAddress corresponds to a signer
    // For demo, we act as the "Next Available Signer"
    const nextSignerIndex = proposal.signatures.length; 
    /* 
       Logic: If 2 people signed (ADM_1, ADM_3), we pretend current user is ADM_2 or ADM_4.
       To simplify demo: We just add "You (Current Wallet)" as a signer
    */
    
    setStatus({ type: 'info', message: 'Broadcasting signature to Multi-Sig Contract...' });
    
    setTimeout(() => {
        const updatedProposals = proposals.map(p => {
            if (p.id === proposalId) {
                const newSigs = [...p.signatures, 'YOU (0x...)'];
                const isExecuted = newSigs.length >= daoState.requiredSignatures;
                
                return {
                    ...p,
                    signatures: newSigs,
                    status: isExecuted ? 'executed' : 'active',
                    txId: isExecuted ? 'TX_DAO_EXEC_' + Math.floor(Math.random() * 100000) : null
                };
            }
            return p;
        });
        
        setProposals(updatedProposals);
        
        const isExecuted = updatedProposals.find(p => p.id === proposalId).status === 'executed';
        if (isExecuted) {
            setStatus({ type: 'success', message: `Quorum Reached (3/5)! Transaction Executed on Chain.` });
        } else {
            setStatus({ type: 'success', message: 'Signature Confirmed. Waiting for 1 more signer to execute.' });
        }
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white mb-2">🔐 Multi-Sig Governance DAO</h1>
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
                Level 3 Security
            </span>
          </div>
          <p className="text-gray-400">Decentralized treasury management. No single point of failure.</p>
        </div>
        
        <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-4 flex gap-6">
            <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider">Treasury Balance</p>
                <p className="text-2xl font-bold text-cyan-400">25,000 <span className="text-sm text-gray-400">ALGO</span></p>
            </div>
            <div className="border-l border-gray-700 pl-6">
                <p className="text-gray-500 text-xs uppercase tracking-wider">Governance</p>
                <p className="text-lg font-bold text-white">3 of 5 <span className="text-sm text-gray-400 font-normal">Signers Required</span></p>
            </div>
        </div>
      </div>

      <StatusMessage status={status} />

      {/* Proposals Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {proposals.map(proposal => {
            const sigCount = proposal.signatures.length;
            const progress = (sigCount / daoState.requiredSignatures) * 100;
            const isExecuted = proposal.status === 'executed';

            return (
                <div key={proposal.id} className={`rounded-2xl border p-6 transition-all ${
                    isExecuted 
                    ? 'bg-green-900/10 border-green-500/30' 
                    : 'bg-gray-800/50 border-gray-700/50 hover:border-cyan-500/30'
                }`}>
                    <div className="flex justify-between items-start mb-4">
                        <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                            isExecuted ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'
                        }`}>
                            #{proposal.id}
                        </span>
                        {isExecuted && <span className="text-green-400 font-bold text-sm">✅ EXECUTED</span>}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{proposal.title}</h3>
                    <p className="text-gray-400 text-sm mb-6 min-h-[40px]">{proposal.description}</p>
                    
                    {proposal.amount > 0 && (
                        <div className="flex items-center gap-2 mb-6 p-3 bg-black/20 rounded-lg">
                            <span className="text-purple-400">💰 Sending:</span>
                            <span className="text-white font-mono font-bold">{proposal.amount.toLocaleString()} ALGO</span>
                            <span className="text-gray-600">→</span>
                            <span className="text-gray-400 font-mono text-xs">{proposal.recipient}</span>
                        </div>
                    )}

                    {/* Progress Bar */}
                    <div className="mb-2 flex justify-between text-sm">
                        <span className="text-gray-400">Signatures Collected</span>
                        <span className={isExecuted ? "text-green-400 font-bold" : "text-white"}>
                            {sigCount} / {daoState.requiredSignatures}
                        </span>
                    </div>
                    <div className="h-2 w-full bg-gray-700/50 rounded-full mb-6 overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-1000 ${isExecuted ? 'bg-green-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`} 
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>

                    {/* Signers List */}
                    <div className="flex gap-2 mb-6 overflow-hidden">
                        {proposal.signatures.map((sig, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-cyan-900 border border-cyan-500 flex items-center justify-center text-xs text-cyan-300 font-bold" title={sig}>
                                {sig === 'YOU (0x...)' ? 'ME' : '✓'}
                            </div>
                        ))}
                        {[...Array(Math.max(0, daoState.requiredSignatures - sigCount))].map((_, i) => (
                             <div key={i} className="w-8 h-8 rounded-full bg-gray-800 border border-dashed border-gray-600 flex items-center justify-center text-xs text-gray-600">
                                ?
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleSign(proposal.id)}
                            disabled={isExecuted}
                            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                                isExecuted 
                                ? 'bg-gray-800 text-gray-500 cursor-default'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/30'
                            }`}
                        >
                            {isExecuted ? 'Locked & Executed' : '✍️ Sign Proposal'}
                        </button>
                    </div>
                    
                    {proposal.txId && (
                        <div className="mt-4 text-center">
                             <a 
                                href={`https://testnet.explorer.perawallet.app/tx/${proposal.txId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-green-400 hover:text-green-300 hover:underline flex items-center justify-center gap-1"
                             >
                                 <span>🔗</span> Verified Execution: {proposal.txId}
                             </a>
                        </div>
                    )}
                </div>
            );
        })}
      </div>
      
      {/* Create Proposal Form or Button */}
      {showCreateForm ? (
        <div className="mt-8 p-6 rounded-2xl border border-gray-700 bg-gray-800/50 animate-in fade-in slide-in-from-bottom duration-300">
            <h3 className="text-xl font-bold text-white mb-4">📝 New Proposal</h3>
            <input 
                type="text" 
                placeholder="Proposal Title (e.g., Increase Student Grants)"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 mb-3 text-white focus:border-cyan-500 outline-none"
                value={newProposal.title}
                onChange={e => setNewProposal({...newProposal, title: e.target.value})}
            />
            <textarea 
                placeholder="Description & Justification..."
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 mb-3 text-white h-24 focus:border-cyan-500 outline-none"
                value={newProposal.description}
                onChange={e => setNewProposal({...newProposal, description: e.target.value})}
            />
            <div className="flex gap-3 mb-4">
                 <input 
                    type="number" 
                    placeholder="Amount (ALGO)"
                    className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none"
                    value={newProposal.amount}
                    onChange={e => setNewProposal({...newProposal, amount: e.target.value})}
                />
            </div>
            <div className="flex gap-3">
                <button onClick={() => setShowCreateForm(false)} className="px-6 py-2 rounded-lg text-gray-400 hover:text-white">Cancel</button>
                <button onClick={handleCreate} className="px-6 py-2 rounded-lg bg-cyan-600 text-white font-bold hover:bg-cyan-500 shadow-lg shadow-cyan-500/20">Submit Proposal</button>
            </div>
        </div>
      ) : (
        <div 
            onClick={() => setShowCreateForm(true)}
            className="mt-8 p-6 rounded-2xl border border-dashed border-gray-700 text-center opacity-70 hover:opacity-100 transition-opacity cursor-pointer hover:border-cyan-500 hover:bg-gray-800/30 select-none"
            role="button"
            tabIndex={0}
        >
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl text-gray-500 border border-gray-700">+</div>
            <p className="text-white font-bold">New Governance Proposal</p>
            <p className="text-gray-500 text-sm mt-1">Requires 1000 ALGO Stake (Simulation Active)</p>
        </div>
      )}

    </div>
  );
}
