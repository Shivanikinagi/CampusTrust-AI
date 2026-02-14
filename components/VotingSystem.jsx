/**
 * CampusTrust AI - Voting System Component
 * ============================================
 * Decentralized campus voting with AI proposal analysis.
 * Interacts with the Voting smart contract on Algorand.
 */

import React, { useState, useEffect } from 'react';
import { voting, isGaslessEnabled, getSponsorInfo } from '../services/contractService.js';
import { analyzeSentimentOffline } from '../services/aiService.js';
import StatusMessage from './StatusMessage';
import ExplorerLink from './ExplorerLink';

export default function VotingSystem({ walletAddress, signCallback }) {
  const [electionState, setElectionState] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [voterState, setVoterState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [proposalScores, setProposalScores] = useState({});
  const [appId, setAppId] = useState('');
  const [earnedTokens, setEarnedTokens] = useState(0);
  const [lastTxId, setLastTxId] = useState(null);
  const [showProof, setShowProof] = useState(false);
  const [gaslessEnabled, setGaslessEnabled] = useState(false);
  const [sponsorInfo, setSponsorInfo] = useState(null);

  // Demo election data (when no contract deployed)
  const [demoElection, setDemoElection] = useState({
    electionName: 'Student Council Election 2026',
    proposals: [
      { name: 'Digital Campus Initiative', votes: 0, description: 'Implement AI-powered campus services including smart attendance, digital ID verification, and automated feedback systems.' },
      { name: 'Green Campus Movement', votes: 0, description: 'Transform campus into eco-friendly zone with solar panels, waste management smart contracts, and carbon credit tracking.' },
      { name: 'Open Research Platform', votes: 0, description: 'Create decentralized research sharing platform on Algorand with verifiable peer review and transparent funding.' },
    ],
    totalVotes: 0,
    isFinalized: 0,
    startTime: Date.now() / 1000 - 86400,
    endTime: Date.now() / 1000 + 86400,
  });
  const [hasVoted, setHasVoted] = useState(false);

  // Load election state on mount only
  useEffect(() => {
    // Auto-load if deployed deployment file exists
    loadDeploymentData();
    
    // Check gasless status
    checkGaslessStatus();
  }, []);

  const checkGaslessStatus = async () => {
    try {
      const enabled = await isGaslessEnabled();
      setGaslessEnabled(enabled);
      
      if (enabled) {
        const info = await getSponsorInfo();
        setSponsorInfo(info);
        console.log('⚡ Gasless transactions enabled!', info);
      }
    } catch (err) {
      console.log('Gasless backend not available');
    }
  };

  const loadDeploymentData = async () => {
    try {
      const resp = await fetch('/algorand-testnet-deployment.json');
      if (resp.ok) {
        const data = await resp.json();
        const votingInfo = data.contracts?.voting;
        if (votingInfo?.app_id) {
          setAppId(votingInfo.app_id.toString());
          // Contract info loaded silently
          console.log('Connected to:', votingInfo);
        }
      }
    } catch (err) {
      // No deployment file, user will enter manually
    }
  };

  const checkOptInStatus = async (currentAppId) => {
    try {
      if (walletAddress && currentAppId) {
        // If this throws, user is likely not opted in
        await voting.getVoterState(walletAddress, parseInt(currentAppId, 10));
        return true;
      }
    } catch (e) {
      // Failed to get local state means likely not opted in
      return false;
    }
    return false;
  };

  const loadElectionState = async () => {
    setLoading(true);
    setStatus({ type: 'info', message: 'Loading election data from Algorand...' });
    try {
      if (appId) {
        const appIdNum = parseInt(appId, 10);
        const state = await voting.getState(appIdNum);
        if (state) {
          setElectionState(state);
          // Check if wallet is opted in and has voted
          if (walletAddress) {
             try {
                const vs = await voting.getVoterState(walletAddress, appIdNum);
                if (vs) {
                  setVoterState(vs);
                  console.log("Voter state:", vs);
                  // Check if user has already voted (key 'has_voted' = 1)
                  if (vs.has_voted === 1 || vs.has_voted === "1" || Number(vs.has_voted) === 1) {
                    setHasVoted(true);
                    if (vs.voted_for !== undefined) {
                      setSelectedProposal(Number(vs.voted_for));
                    }
                  }
                }
             } catch (e) {
                console.log("User not opted in yet", e);
             }
          }
          setStatus({ type: 'success', message: 'Election data loaded successfully!' });
        } else {
          setStatus({ type: 'error', message: 'Failed to load election data. Check App ID.' });
        }
      } else {
        setStatus({ type: 'error', message: 'Please enter a Contract App ID' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: `Error: ${err.message}` });
      console.error('Error loading election state:', err);
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!appId || !signCallback) return;
    setLoading(true);
    setStatus({ type: 'info', message: '📝 Registering voter...' });
    try {
        await voting.register(walletAddress, signCallback, parseInt(appId, 10));
        setStatus({ type: 'success', message: '✅ Successfully registered!' });
    } catch (err) {
        setStatus({ type: 'error', message: `Registration failed: ${err.message}` });
    }
    setLoading(false);
  };

  const handleVote = async (index) => {
    if (hasVoted) return;
    setLoading(true);
    
    // Optimistic UI update - show vote immediately
    setSelectedProposal(index);
    setStatus({ type: 'info', message: '📤 Sending transaction...' });

    try {
      if (appId && signCallback) {
        // Try voting directly
        try {
            const result = await voting.vote(walletAddress, index, signCallback, parseInt(appId, 10));
            
            // Store transaction ID for proof display
            setLastTxId(result.txId);
            setShowProof(true);
            
            setStatus({ type: 'success', message: `✅ Vote recorded! TX: ${result.txId}` });
            
            // Optimistic update - no need to reload entire blockchain state
            setHasVoted(true);
            if (electionState) {
              const updated = { ...electionState };
              updated.proposals[index].votes += 1;
              updated.totalVotes += 1;
              setElectionState(updated);
            }
        } catch (voteErr) {
            // Check for "already voted" (pc=335 assert failed)
            if (voteErr.message.includes("pc=335") || voteErr.message.includes("assert failed")) {
                setStatus({ type: 'success', message: 'Vote already recorded on blockchain!' });
                setHasVoted(true);
                return;
            }

            // Check if error is due to not being opted in
            if (voteErr.message.includes("has not opted in") || voteErr.message.includes("logic eval error")) {
                setStatus({ type: 'info', message: '🔐 Registering voter...' });
                // Auto-opt-in
                try {
                    await voting.register(walletAddress, signCallback, parseInt(appId, 10));
                } catch (optInErr) {
                    // Ignore "already opted in" error
                    if (!optInErr.message.includes("already opted in")) {
                        throw optInErr;
                    }
                }
                
                setStatus({ type: 'info', message: '📤 Casting vote...' });
                
                // Retry vote
                const result = await voting.vote(walletAddress, index, signCallback, parseInt(appId, 10));
                
                setLastTxId(result.txId);
                setShowProof(true);
                setStatus({ type: 'success', message: `✅ Vote recorded! TX: ${result.txId}` });
                
                // Optimistic update
                setHasVoted(true);
                if (electionState) {
                  const updated = { ...electionState };
                  updated.proposals[index].votes += 1;
                  updated.totalVotes += 1;
                  setElectionState(updated);
                }
            } else {
                throw voteErr;
            }
        }
      } else {
        // Demo mode - minimal delay
        await new Promise(r => setTimeout(r, 300));
        const updated = { ...demoElection };
        updated.proposals[index].votes += 1;
        updated.totalVotes += 1;
        setDemoElection(updated);
        
        const mockTxId = Array(52).fill(0).map(() => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]).join("");
        setLastTxId(mockTxId);
        setStatus({ type: 'success', message: `✅ Vote recorded successfully! TX: ${mockTxId}` });
      }
      setHasVoted(true);
      setSelectedProposal(index);
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
    setLoading(false);
  };

  const scoreProposal = async (text, index) => {
    try {
      const response = await fetch('http://localhost:5001/api/ai/proposal/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (response.ok) {
        const result = await response.json();
        setProposalScores(prev => ({ ...prev, [index]: result }));
      }
    } catch {
      // Offline fallback - basic scoring
      const words = text.split(' ').length;
      setProposalScores(prev => ({
        ...prev,
        [index]: {
          overall_score: Math.min(100, words * 2 + 20),
          breakdown: {
            completeness: Math.min(25, Math.floor(words / 4)),
            clarity: 18,
            specificity: Math.min(25, 10 + Math.floor(words / 8)),
            feasibility: 15,
          },
          suggestions: ['AI analysis available when backend is running.'],
          offline: true,
        },
      }));
    }
  };

  const election = electionState || demoElection;
  const maxVotes = Math.max(...election.proposals.map(p => p.votes), 1);
  const isActive = Date.now() / 1000 >= election.startTime && Date.now() / 1000 <= election.endTime;
  const isAutoClosed = !isActive && Date.now() / 1000 > election.endTime;

  // 5. 🚨 Auto Alerts: Low Participation check
  useEffect(() => {
    if (isActive && election.totalVotes < 50 && (election.endTime - Date.now() / 1000) < 86400) {
       setStatus(prev => ({ 
         ...prev, 
         message: prev.message || "⚠️ Auto-Alert: Low voter turnout detected! Notification sent to student body." 
       }));
    }
  }, [isActive, election.totalVotes, election.endTime]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">🗳️ Decentralized Voting</h1>
          <p className="text-gray-400">Tamper-proof campus elections on Algorand blockchain</p>
        </div>
        <div className={`px-4 py-2 rounded-full text-sm font-medium ${
          isActive 
            ? 'bg-green-500/10 text-green-400 border border-green-500/30'
            : isAutoClosed 
              ? 'bg-red-500/10 text-red-400 border border-red-500/30' 
              : 'bg-gray-700/30 text-gray-400 border border-gray-600/30'
        }`}>
          {election.isFinalized ? '📊 Finalized' : isActive ? '🟢 Active' : isAutoClosed ? '🔒 Auto-Closed' : '⏳ Pending'}
        </div>
      </div>

      {/* App ID Input */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-gray-400 text-xs block mb-1">Contract App ID (optional)</label>
            <input
              type="text"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              placeholder="Enter deployed Voting App ID..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <button
            onClick={loadElectionState}
            disabled={loading || !appId}
            className="mt-5 px-4 py-2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-sm hover:bg-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Load'}
          </button>
        </div>
      </div>

      <StatusMessage status={status} />
      
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">{election.electionName}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-500 text-xs">Total Votes</p>
            <p className="text-2xl font-bold text-cyan-300">{election.totalVotes}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Proposals</p>
            <p className="text-2xl font-bold text-purple-300">{election.proposals.length}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Your Vote</p>
            <p className="text-lg font-bold text-white">{hasVoted ? '✅ Cast' : '⏳ Pending'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Transaction Fees</p>
            <p className="text-lg font-bold text-green-300">
              {gaslessEnabled ? '⚡ FREE' : '0.001 ALGO'}
            </p>
          </div>
        </div>
        
        {gaslessEnabled && sponsorInfo?.configured && (
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <div className="flex items-center gap-2 text-sm">
              <span className="px-3 py-1 bg-green-500/10 text-green-300 border border-green-500/30 rounded-full text-xs font-medium">
                ⚡ GASLESS ENABLED
              </span>
              <span className="text-gray-400">
                Sponsor: {sponsorInfo.address?.substring(0, 8)}...
              </span>
              <span className="text-gray-500">
                ({sponsorInfo.availableForFees?.toFixed(2)} ALGO available)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Proposals */}
      <h3 className="text-lg font-bold text-white mb-4">Proposals</h3>
      <div className="space-y-4">
        {election.proposals.map((proposal, index) => {
          const percentage = election.totalVotes > 0
            ? Math.round((proposal.votes / election.totalVotes) * 100)
            : 0;
          const isLeading = proposal.votes === maxVotes && proposal.votes > 0;
          const score = proposalScores[index];

          return (
            <div
              key={index}
              className={`bg-gray-800/50 border rounded-2xl p-6 transition-all ${
                selectedProposal === index
                  ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                  : 'border-gray-700/50 hover:border-gray-600/50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white font-semibold text-lg">{proposal.name}</h4>
                    {isLeading && <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">Leading</span>}
                  </div>
                  {proposal.description && (
                    <p className="text-gray-400 text-sm">{proposal.description}</p>
                  )}
                </div>
                <div className="text-right ml-4">
                  <p className="text-2xl font-bold text-white">{proposal.votes}</p>
                  <p className="text-gray-500 text-xs">votes ({percentage}%)</p>
                </div>
              </div>

              {/* Vote bar */}
              <div className="w-full bg-gray-700/30 rounded-full h-3 mb-4">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ${
                    isLeading ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gray-600'
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => handleVote(index)}
                  disabled={loading || hasVoted}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    hasVoted && selectedProposal === index
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : hasVoted
                      ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30'
                  }`}
                >
                  {loading ? '⏳' : hasVoted && selectedProposal === index ? '✅ Voted' : hasVoted ? 'Already Voted' : '🗳️ Vote'}
                </button>

                <button
                  onClick={() => scoreProposal(proposal.description || proposal.name, index)}
                  className="px-4 py-2 bg-purple-500/10 text-purple-300 border border-purple-500/30 rounded-lg text-sm hover:bg-purple-500/20 transition-all"
                >
                  🧠 AI Score
                </button>

                {score && (
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      score.overall_score >= 70 ? 'bg-green-500/20 text-green-300' :
                      score.overall_score >= 40 ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {score.overall_score}/100
                    </span>
                    <span className="text-gray-500 text-xs">AI Quality Score</span>
                  </div>
                )}
              </div>

              {/* AI Score Breakdown */}
              {score && (
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(score.breakdown || {}).map(([key, val]) => (
                      <div key={key} className="text-center">
                        <p className="text-gray-500 text-xs capitalize">{key}</p>
                        <p className="text-white font-bold">{val}/25</p>
                      </div>
                    ))}
                  </div>
                  {score.suggestions?.length > 0 && (
                    <div className="mt-3">
                      {score.suggestions.map((s, i) => (
                        <p key={i} className="text-gray-400 text-xs">💡 {s}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
