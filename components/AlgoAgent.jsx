/**
 * CampusTrust AI - Algo-Agent Treasurer
 * =========================================
 * AI-Powered Autonomous Lab/Club Treasurer with Smart Contract Automation
 */

import React, { useState, useEffect } from 'react';
import { Wallet, Send, Receipt, TrendingUp, AlertCircle, CheckCircle, Clock, Loader2, DollarSign, FileText } from 'lucide-react';
import ExplorerLink from './ExplorerLink';
import StatusMessage from './StatusMessage';

export default function AlgoAgent({ walletAddress, signCallback }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [activeTab, setActiveTab] = useState('request'); // 'request', 'approvals', 'budget'
  const [userRole, setUserRole] = useState('member'); // 'member' or 'admin'
  
  // Club/Lab Treasury Info
  const [treasury, setTreasury] = useState({
    name: 'Blockchain Research Lab',
    balance: 1500,
    totalBudget: 2000,
    spent: 500,
    members: 12,
    pendingRequests: 3
  });

  // Funding request form
  const [request, setRequest] = useState({
    item: '',
    amount: '',
    purpose: '',
    projectLink: '',
    priority: 'normal'
  });

  // Mock funding requests
  const [requests, setRequests] = useState([
    {
      id: 1,
      requester: 'Priya Sharma',
      wallet: 'STUDENT001...XYZ',
      item: 'DHT11 Temperature Sensor (x5)',
      amount: 50,
      purpose: 'IoT project for environmental monitoring system',
      projectLink: 'https://github.com/student/iot-project',
      status: 'approved',
      aiScore: 95,
      aiReasoning: 'Request aligns with lab objectives. GitHub shows active development. Budget reasonable.',
      submittedAt: Date.now() - 86400000 * 5,
      approvedAt: Date.now() - 86400000 * 5 + 3600000,
      txId: 'FUND' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      receiptSubmitted: true,
      receiptVerified: true
    },
    {
      id: 2,
      requester: 'Rohan Patel',
      wallet: 'STUDENT002...ABC',
      item: 'Cloud GPU Credits (100 hours)',
      amount: 200,
      purpose: 'Training deep learning model for image classification research',
      projectLink: 'https://github.com/student/ml-research',
      status: 'pending',
      aiScore: 88,
      aiReasoning: 'Valid research request. GitHub activity verified. Slightly high cost - recommend negotiation or alternative providers.',
      submittedAt: Date.now() - 86400000 * 1,
      approvedAt: null,
      txId: null,
      receiptSubmitted: false,
      receiptVerified: false
    },
    {
      id: 3,
      requester: 'Ananya Singh',
      wallet: 'STUDENT003...DEF',
      item: 'Raspberry Pi 4 (8GB)',
      amount: 75,
      purpose: 'Edge computing node for distributed AI system',
      projectLink: 'https://github.com/student/edge-ai',
      status: 'rejected',
      aiScore: 45,
      aiReasoning: 'Project repository shows minimal activity. No clear project plan. Request appears premature.',
      submittedAt: Date.now() - 86400000 * 3,
      approvedAt: null,
      txId: null,
      receiptSubmitted: false,
      receiptVerified: false
    }
  ]);

  // Budget categories
  const [budgetBreakdown, setBudgetBreakdown] = useState([
    { category: 'Hardware Components', allocated: 600, spent: 250, requests: 2 },
    { category: 'Cloud Services', allocated: 400, spent: 150, requests: 1 },
    { category: 'Software Licenses', allocated: 300, spent: 100, requests: 0 },
    { category: 'Research Materials', allocated: 400, spent: 0, requests: 0 },
    { category: 'Event Expenses', allocated: 300, spent: 0, requests: 0 }
  ]);

  const handleAnalyzeRequest = async () => {
    if (!request.item || !request.amount || !request.purpose) {
      setStatus({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    if (!walletAddress) {
      setStatus({ type: 'error', message: 'Please connect your wallet first' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'info', message: 'Algo-Agent is analyzing your request...' });

    try {
      // Simulate AI analysis
      await new Promise(r => setTimeout(r, 2500));

      const score = Math.floor(Math.random() * 40) + 60;
      const amount = parseFloat(request.amount);
      
      let aiReasoning = '';
      let aiStatus = 'pending';

      if (score >= 80) {
        aiReasoning = 'Request aligns with lab objectives. Amount is reasonable within budget constraints. Recommended for approval.';
        aiStatus = 'approved';
      } else if (score >= 65) {
        aiReasoning = 'Valid request but requires manual review. Please provide more project details or reduce requested amount.';
        aiStatus = 'pending';
      } else {
        aiReasoning = 'Request does not meet current lab priorities or budget constraints. Consider revising or resubmitting with more justification.';
        aiStatus = 'rejected';
      }

      // Add project link validation
      if (request.projectLink) {
        aiReasoning += ' GitHub/Jira activity verified.';
      } else {
        aiReasoning += ' No project tracking link provided - reduces confidence score.';
      }

      const newRequest = {
        id: requests.length + 1,
        requester: 'Current Student',
        wallet: walletAddress,
        item: request.item,
        amount: amount,
        purpose: request.purpose,
        projectLink: request.projectLink,
        status: aiStatus,
        aiScore: score,
        aiReasoning: aiReasoning,
        submittedAt: Date.now(),
        approvedAt: aiStatus === 'approved' ? Date.now() : null,
        txId: aiStatus === 'approved' ? 'FUND' + Math.random().toString(36).substring(2, 8).toUpperCase() : null,
        receiptSubmitted: false,
        receiptVerified: false
      };

      setRequests([newRequest, ...requests]);

      if (aiStatus === 'approved') {
        setTreasury({
          ...treasury,
          balance: treasury.balance - amount,
          spent: treasury.spent + amount
        });
        setStatus({ 
          type: 'success', 
          message: `Request auto-approved by AI! ${amount} ALGO released. Please submit receipt within 24 hours.` 
        });
      } else if (aiStatus === 'pending') {
        setStatus({ 
          type: 'info', 
          message: 'Request submitted for manual review by lab admin.' 
        });
      } else {
        setStatus({ 
          type: 'error', 
          message: 'Request rejected by AI. Review the feedback and resubmit if needed.' 
        });
      }

      setRequest({ item: '', amount: '', purpose: '', projectLink: '', priority: 'normal' });
      setActiveTab('approvals');
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadReceipt = async (requestId) => {
    setLoading(true);
    setStatus({ type: 'info', message: 'Verifying receipt with OCR...' });

    try {
      await new Promise(r => setTimeout(r, 2000));

      setRequests(requests.map(r => {
        if (r.id === requestId) {
          return { ...r, receiptSubmitted: true, receiptVerified: true };
        }
        return r;
      }));

      setStatus({ type: 'success', message: 'Receipt verified successfully!' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Wallet className="w-10 h-10 text-emerald-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Algo-Agent Treasurer
          </h1>
        </div>
        <p className="text-gray-400">
          AI-powered autonomous treasurer for clubs and research labs
        </p>
      </div>

      {/* Treasury Overview */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Treasury Balance</span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-400">{treasury.balance}</div>
          <div className="text-xs text-gray-500">ALGO</div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Budget</span>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold">{treasury.totalBudget}</div>
          <div className="text-xs text-gray-500">ALGO</div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Spent</span>
            <Send className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-3xl font-bold text-orange-400">{treasury.spent}</div>
          <div className="text-xs text-gray-500">ALGO</div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Remaining</span>
            <Receipt className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-purple-400">{treasury.balance}</div>
          <div className="text-xs text-gray-500">{Math.round((treasury.balance / treasury.totalBudget) * 100)}% available</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('request')}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'request'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Request Funding
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'approvals'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Requests ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('budget')}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'budget'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Budget Breakdown
        </button>
      </div>

      {/* Status Messages */}
      {status.message && (
        <StatusMessage type={status.type} message={status.message} onClose={() => setStatus({ type: '', message: '' })} />
      )}

      {/* Request Funding Tab */}
      {activeTab === 'request' && (
        <div className="max-w-3xl bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Submit Funding Request</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Item/Service Needed *</label>
              <input
                type="text"
                value={request.item}
                onChange={(e) => setRequest({ ...request, item: e.target.value })}
                placeholder="e.g., DHT11 sensor, GPU credits, software license"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Amount (ALGO) *</label>
              <input
                type="number"
                value={request.amount}
                onChange={(e) => setRequest({ ...request, amount: e.target.value })}
                placeholder="50"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Purpose/Justification *</label>
              <textarea
                value={request.purpose}
                onChange={(e) => setRequest({ ...request, purpose: e.target.value })}
                placeholder="Explain how this will be used for your project..."
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Project Link (GitHub/Jira)</label>
              <input
                type="text"
                value={request.projectLink}
                onChange={(e) => setRequest({ ...request, projectLink: e.target.value })}
                placeholder="https://github.com/username/project"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">Providing a project link increases AI approval score</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select
                value={request.priority}
                onChange={(e) => setRequest({ ...request, priority: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High (Urgent)</option>
              </select>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
              <h3 className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                AI Auto-Approval Process
              </h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>✓ AI checks request against lab budget and objectives</li>
                <li>✓ Verifies GitHub/Jira project activity if link provided</li>
                <li>✓ Analyzes spending patterns and requestor history</li>
                <li>✓ Auto-approves if score ≥ 80, otherwise flags for manual review</li>
                <li>⚠️ You must submit receipt within 24hrs or get locked out</li>
              </ul>
            </div>

            <button
              onClick={handleAnalyzeRequest}
              disabled={loading || !walletAddress}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'AI Analyzing...' : 'Submit Request'}
            </button>
          </div>
        </div>
      )}

      {/* Approvals Tab */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No funding requests yet</p>
            </div>
          ) : (
            requests.map(req => (
              <div key={req.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{req.item}</h3>
                      {getStatusBadge(req.status)}
                    </div>
                    <div className="text-sm text-gray-400 mb-2">
                      {req.requester} • {new Date(req.submittedAt).toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-300 mb-3">{req.purpose}</p>
                    
                    {/* AI Analysis */}
                    <div className={`p-3 rounded-lg mb-3 ${
                      req.aiScore >= 80 ? 'bg-green-500/10 border border-green-500/30' :
                      req.aiScore >= 65 ? 'bg-yellow-500/10 border border-yellow-500/30' :
                      'bg-red-500/10 border border-red-500/30'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold">AI Score: {req.aiScore}/100</span>
                      </div>
                      <p className="text-sm text-gray-300">{req.aiReasoning}</p>
                    </div>

                    {req.projectLink && (
                      <a
                        href={req.projectLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-emerald-400 hover:text-emerald-300"
                      >
                        → View Project
                      </a>
                    )}
                  </div>

                  <div className="text-right ml-4">
                    <div className="text-3xl font-bold text-emerald-400">{req.amount}</div>
                    <div className="text-xs text-gray-400">ALGO</div>
                  </div>
                </div>

                {req.txId && (
                  <div className="mb-3">
                    <ExplorerLink txId={req.txId} type="transaction" className="text-xs" />
                  </div>
                )}

                {/* Receipt Upload */}
                {req.status === 'approved' && !req.receiptSubmitted && (
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-orange-400">
                        <AlertCircle claassName="w-4 h-4" />
                        <span className="text-sm font-semibold">Receipt Required (24hr deadline)</span>
                      </div>
                      <button
                        onClick={() => handleUploadReceipt(req.id)}
                        disabled={loading}
                        className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                      >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Upload Receipt
                      </button>
                    </div>
                  </div>
                )}

                {req.receiptVerified && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Receipt verified successfully
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Budget Breakdown Tab */}
      {activeTab === 'budget' && (
        <div className="space-y-4">
          {budgetBreakdown.map((cat, idx) => {
            const percentage = (cat.spent / cat.allocated) * 100;
            return (
              <div key={idx} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">{cat.category}</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{cat.spent} / {cat.allocated}</div>
                    <div className="text-xs text-gray-400">ALGO</div>
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        percentage >= 90 ? 'bg-red-500' :
                        percentage >= 70 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-sm text-gray-400">
                  <span>{percentage.toFixed(1)}% used</span>
                  <span>{cat.requests} active requests</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
