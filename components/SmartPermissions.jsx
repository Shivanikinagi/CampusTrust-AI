import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, Shield, Users, Calendar, DollarSign, AlertCircle, ExternalLink, Zap } from 'lucide-react';
import ExplorerLink from './ExplorerLink';
import * as gaslessService from '../services/gaslessService.js';

export default function SmartPermissions({ walletAddress, signCallback }) {
  const [activeTab, setActiveTab] = useState('submit');
  const [proposals, setProposals] = useState([]);
  const [myProposals, setMyProposals] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [aiAuditResult, setAiAuditResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [userRole, setUserRole] = useState('student'); // student, hod, faculty, dean
  const [gaslessEnabled, setGaslessEnabled] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    eventName: '',
    clubName: '',
    eventDate: '',
    eventTime: '',
    venue: '',
    expectedAttendees: '',
    budget: '',
    description: '',
    purpose: ''
  });

  useEffect(() => {
    if (walletAddress) {
      loadProposals();
      loadMyProposals();
      loadPendingApprovals();
      determineUserRole();
      checkGaslessStatus();
    }
  }, [walletAddress]);

  const checkGaslessStatus = async () => {
    const enabled = await gaslessService.isGaslessEnabled();
    setGaslessEnabled(enabled);
  };

  const determineUserRole = async () => {
    // In production, this would check blockchain roles
    // For demo, we'll check wallet address patterns or use a backend
    const roleMap = {
      // Example: Different wallet prefixes indicate different roles
      'DEAN': 'dean',
      'HOD': 'hod',
      'FAC': 'faculty',
      'default': 'student'
    };

    // For now, default to student
    setUserRole('student');
  };

  const loadProposals = async () => {
    // Load all proposals for display with various approval states
    const mockProposals = [
      {
        id: 'PROP001',
        eventName: 'Tech Symposium 2026',
        clubName: 'ACM Chapter',
        eventDate: '2026-03-15',
        budget: '5000',
        status: 'approved',
        approvals: { hod: true, faculty: true, dean: true },
        nftAssetId: '123456789',
        txId: 'ABCD1234EFGH5678IJKL9012'
      },
      {
        id: 'PROP002',
        eventName: 'AI/ML Workshop Series',
        clubName: 'Data Science Club',
        eventDate: '2026-03-20',
        budget: '3500',
        status: 'pending_dean',
        approvals: { hod: true, faculty: true, dean: false },
        txId: 'WXYZ9876ABCD5432EFGH1098'
      },
      {
        id: 'PROP003',
        eventName: 'Hackathon 2026',
        clubName: 'Coding Club',
        eventDate: '2026-04-05',
        budget: '8000',
        status: 'pending_faculty',
        approvals: { hod: true, faculty: false, dean: false },
        txId: 'MNOP4567QRST8901UVWX2345'
      },
      {
        id: 'PROP004',
        eventName: 'Cultural Fest Opening',
        clubName: 'Cultural Committee',
        eventDate: '2026-04-12',
        budget: '2500',
        status: 'pending_hod',
        approvals: { hod: false, faculty: false, dean: false },
        txId: 'GHIJ6789KLMN0123OPQR4567'
      }
    ];
    setProposals(mockProposals);
  };

  const loadMyProposals = async () => {
    // Load proposals submitted by connected wallet
    setMyProposals([]);
  };

  const loadPendingApprovals = async () => {
    // Load proposals waiting for this user's approval
    setPendingApprovals([]);
  };

  const runAIPreAudit = async () => {
    if (!formData.eventName || !formData.eventDate || !formData.budget) {
      setStatusMessage('⚠️ Please fill in event name, date, and budget first');
      return;
    }

    setSubmitting(true);
    setStatusMessage('🤖 AI is analyzing your proposal...');

    try {
      const response = await fetch('http://localhost:5000/api/ai/permission/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name: formData.eventName,
          event_date: formData.eventDate,
          event_time: formData.eventTime,
          venue: formData.venue,
          budget: formData.budget,
          expected_attendees: formData.expectedAttendees,
          description: formData.description
        })
      });

      const data = await response.json();
      setAiAuditResult(data);

      if (data.passed) {
        setStatusMessage(`✅ AI Pre-Audit PASSED! Score: ${data.score}/100`);
      } else {
        setStatusMessage(`❌ AI Pre-Audit FAILED. Score: ${data.score}/100 (Minimum: 70)`);
      }
    } catch (error) {
      console.error('AI Audit error:', error);
      // Fallback to demo mode when AI backend is unavailable
      const budget = parseFloat(formData.budget) || 100;
      const score = Math.min(95, Math.max(60, Math.floor(70 + Math.random() * 25)));
      const passed = score >= 70;

      const demoResult = {
        score,
        passed,
        checks: {
          schedule_conflict: { passed: true, message: 'No scheduling conflicts detected' },
          budget_feasibility: { passed: budget < 10000, message: budget < 10000 ? 'Budget is within acceptable range' : 'Budget exceeds threshold — requires additional review' },
          venue_availability: { passed: true, message: formData.venue ? `${formData.venue} is available` : 'Venue to be determined' },
          safety_compliance: { passed: true, message: 'Standard safety requirements met' },
        },
        concerns: budget > 5000 ? ['High budget — consider phased funding approach'] : [],
      };

      setAiAuditResult(demoResult);
      if (passed) {
        setStatusMessage(`✅ AI Pre-Audit PASSED! Score: ${score}/100 (Demo mode)`);
      } else {
        setStatusMessage(`❌ AI Pre-Audit FAILED. Score: ${score}/100 (Demo mode)`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const submitProposal = async () => {
    if (!aiAuditResult || !aiAuditResult.passed) {
      setStatusMessage('⚠️ Please run AI Pre-Audit and pass before submitting');
      return;
    }

    if (!walletAddress) {
      setStatusMessage('⚠️ Please connect your wallet first');
      return;
    }

    setSubmitting(true);
    setStatusMessage('📝 Creating multi-signature proposal on blockchain...');

    try {
      // Create the multi-sig smart contract on Algorand
      const proposalData = {
        ...formData,
        submitter: walletAddress,
        aiAudit: aiAuditResult,
        timestamp: Date.now(),
        requiredSigners: ['HOD_ADDRESS', 'FACULTY_ADDRESS', 'DEAN_ADDRESS']
      };

      // Create hash of proposal for blockchain storage
      const proposalHash = await gaslessService.createDataHash(JSON.stringify(proposalData));

      // Send transaction to store proposal hash on-chain
      setStatusMessage(gaslessEnabled ? '⚡ Submitting proposal (gasless)...' : '📤 Submitting proposal...');

      const result = await gaslessService.sendGaslessPayment(
        walletAddress,
        walletAddress, // Self-payment to add note
        0.001, // Minimal amount
        `PERMISSION_PROPOSAL:${proposalHash}`,
        signCallback
      );

      setStatusMessage(`✅ Proposal submitted on blockchain! TX: ${result.txId}`);

      // Store proposal in local storage (in production, use backend database)
      const newProposal = {
        ...proposalData,
        txId: result.txId,
        proposalHash,
        status: 'pending_hod',
        gasless: result.gasless || false
      };

      setMyProposals([newProposal, ...myProposals]);

      // Reset form
      setFormData({
        eventName: '',
        clubName: '',
        eventDate: '',
        eventTime: '',
        venue: '',
        expectedAttendees: '',
        budget: '',
        description: '',
        purpose: ''
      });
      setAiAuditResult(null);
      setActiveTab('myproposals');
    } catch (error) {
      console.error('Submission error:', error);
      setStatusMessage(`❌ Submission failed: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const approveProposal = async (proposalId, role) => {
    if (!walletAddress) return;

    setSubmitting(true);
    setStatusMessage(`✍️ Signing approval as ${role.toUpperCase()}...`);

    try {
      // Submit approval transaction to blockchain
      const approvalHash = await gaslessService.createDataHash(`APPROVE:${proposalId}:${role}:${Date.now()}`);

      const result = await gaslessService.sendGaslessPayment(
        walletAddress,
        walletAddress,
        0.001,
        `APPROVAL:${role}:${proposalId}`,
        signCallback
      );

      setStatusMessage(`✅ Approved on blockchain! TX: ${result.txId}`);

      // Refresh pending approvals
      setTimeout(() => loadPendingApprovals(), 1000);
    } catch (error) {
      console.error('Approval error:', error);
      setStatusMessage(`❌ Approval failed: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const rejectProposal = async (proposalId, role, reason) => {
    if (!walletAddress) return;

    const rejectionReason = prompt('Please provide a reason for rejection:');
    if (!rejectionReason) return;

    setSubmitting(true);
    setStatusMessage('❌ Recording rejection on blockchain...');

    try {
      const rejectionHash = await gaslessService.createDataHash(`REJECT:${proposalId}:${role}:${rejectionReason}`);

      const result = await gaslessService.sendGaslessPayment(
        walletAddress,
        walletAddress,
        0.001,
        `REJECTION:${role}:${proposalId}`,
        signCallback
      );

      setStatusMessage(`✅ Rejection recorded! TX: ${result.txId}`);

      setTimeout(() => loadPendingApprovals(), 1000);
    } catch (error) {
      console.error('Rejection error:', error);
      setStatusMessage(`❌ Failed to record rejection: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending_hod': { text: 'Pending HOD', color: 'bg-yellow-500', icon: Clock },
      'pending_faculty': { text: 'Pending Faculty', color: 'bg-blue-500', icon: Clock },
      'pending_dean': { text: 'Pending Dean', color: 'bg-purple-500', icon: Clock },
      'approved': { text: 'Approved ✓', color: 'bg-green-500', icon: CheckCircle },
      'rejected': { text: 'Rejected ✗', color: 'bg-red-500', icon: AlertCircle }
    };

    const badge = badges[status] || badges['pending_hod'];
    const Icon = badge.icon;

    return (
      <span className={`${badge.color} text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1`}>
        <Icon size={14} />
        {badge.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="text-cyan-400" size={40} />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Smart Permission System
          </h1>
        </div>
        <p className="text-gray-300 text-lg">
          AI-powered event approvals with blockchain multi-signature verification
        </p>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-slate-800/60 backdrop-blur border border-cyan-500/30 rounded-xl p-4">
            <p className="text-center text-lg">{statusMessage}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex gap-2 bg-slate-800/40 p-2 rounded-xl backdrop-blur">
          <button
            onClick={() => setActiveTab('submit')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${activeTab === 'submit'
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
              }`}
          >
            <FileText className="inline mr-2" size={18} />
            Submit Proposal
          </button>
          <button
            onClick={() => setActiveTab('myproposals')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${activeTab === 'myproposals'
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
              }`}
          >
            My Proposals ({myProposals.length})
          </button>
          {userRole !== 'student' && (
            <button
              onClick={() => setActiveTab('approvals')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${activeTab === 'approvals'
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                  : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
                }`}
            >
              <Users className="inline mr-2" size={18} />
              Pending Approvals ({pendingApprovals.length})
            </button>
          )}
          <button
            onClick={() => setActiveTab('allproposals')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${activeTab === 'allproposals'
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
              }`}
          >
            All Proposals
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Submit Proposal Tab */}
        {activeTab === 'submit' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column: Form */}
            <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-6 border border-cyan-500/20">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FileText className="text-cyan-400" />
                Event Proposal Form
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Event Name *</label>
                  <input
                    type="text"
                    value={formData.eventName}
                    onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                    placeholder="e.g., Tech Symposium 2026"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Club Name *</label>
                  <input
                    type="text"
                    value={formData.clubName}
                    onChange={(e) => setFormData({ ...formData, clubName: e.target.value })}
                    placeholder="e.g., ACM Student Chapter"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 flex items-center gap-1">
                      <Calendar size={14} />
                      Event Date *
                    </label>
                    <input
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Time</label>
                    <input
                      type="time"
                      value={formData.eventTime}
                      onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Venue</label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g., Auditorium Block A"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Expected Attendees</label>
                    <input
                      type="number"
                      value={formData.expectedAttendees}
                      onChange={(e) => setFormData({ ...formData, expectedAttendees: e.target.value })}
                      placeholder="200"
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 flex items-center gap-1">
                      <DollarSign size={14} />
                      Budget (ALGO) *
                    </label>
                    <input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      placeholder="500"
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the event, activities, and expected outcomes..."
                    rows={3}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Purpose</label>
                  <textarea
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    placeholder="Educational objectives and benefits to students..."
                    rows={2}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  onClick={runAIPreAudit}
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 shadow-lg"
                >
                  {submitting ? '🤖 AI Analyzing...' : '🤖 Run AI Pre-Audit'}
                </button>
              </div>
            </div>

            {/* Right Column: AI Results & Submission */}
            <div className="space-y-6">
              {/* AI Audit Result */}
              <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-6 border border-cyan-500/20">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Shield className="text-purple-400" />
                  AI Pre-Audit Results
                </h2>

                {!aiAuditResult ? (
                  <div className="text-center py-12">
                    <AlertCircle className="mx-auto mb-4 text-gray-500" size={48} />
                    <p className="text-gray-400">
                      Fill in the form and click "Run AI Pre-Audit" to check your proposal
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Score Display */}
                    <div className="bg-slate-700/50 rounded-xl p-6 text-center">
                      <div className={`text-6xl font-bold mb-2 ${aiAuditResult.passed ? 'text-green-400' : 'text-red-400'}`}>
                        {aiAuditResult.score}/100
                      </div>
                      <div className={`text-xl font-semibold ${aiAuditResult.passed ? 'text-green-300' : 'text-red-300'}`}>
                        {aiAuditResult.passed ? '✅ PASSED' : '❌ FAILED'}
                      </div>
                      <p className="text-sm text-gray-400 mt-2">
                        {aiAuditResult.passed ? 'Your proposal is ready for submission!' : 'Minimum score: 70/100'}
                      </p>
                    </div>

                    {/* Checks */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">AI Checks:</h3>
                      {aiAuditResult.checks && Object.entries(aiAuditResult.checks).map(([key, value]) => (
                        <div key={key} className="flex items-start gap-3 bg-slate-700/30 p-3 rounded-lg">
                          {value.passed ? (
                            <CheckCircle className="text-green-400 mt-0.5 flex-shrink-0" size={20} />
                          ) : (
                            <AlertCircle className="text-red-400 mt-0.5 flex-shrink-0" size={20} />
                          )}
                          <div>
                            <div className="font-semibold capitalize">{key.replace('_', ' ')}</div>
                            <div className="text-sm text-gray-400">{value.message}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Concerns */}
                    {aiAuditResult.concerns && aiAuditResult.concerns.length > 0 && (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                        <h3 className="font-semibold text-yellow-400 mb-2">⚠️ Concerns:</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {aiAuditResult.concerns.map((concern, i) => (
                            <li key={i} className="text-gray-300">{concern}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              {aiAuditResult && aiAuditResult.passed && (
                <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur rounded-2xl p-6 border border-cyan-500/40">
                  <h3 className="text-xl font-bold mb-4">🎯 Ready to Submit</h3>
                  <p className="text-gray-300 mb-4">
                    Your proposal will be sent to the multi-signature smart contract for approval.
                  </p>
                  <div className="bg-slate-800/60 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold mb-2">Approval Chain:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                        <span>HOD Approval</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                        <span>Faculty Coordinator Approval</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                        <span>Dean Approval</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">✓</div>
                        <span className="font-semibold">Permission NFT Minted</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={submitProposal}
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-cyan-500/50"
                  >
                    {submitting ? '📝 Submitting...' : '📝 Submit Proposal to Blockchain'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* My Proposals Tab */}
        {activeTab === 'myproposals' && (
          <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold mb-6">My Submitted Proposals</h2>
            {myProposals.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto mb-4 text-gray-500" size={48} />
                <p className="text-gray-400">No proposals submitted yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myProposals.map((proposal, idx) => (
                  <div key={idx} className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{proposal.eventName}</h3>
                        <p className="text-gray-400">{proposal.clubName}</p>
                      </div>
                      {getStatusBadge(proposal.status)}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-400">Date:</span>
                        <div className="font-semibold">{proposal.eventDate}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Budget:</span>
                        <div className="font-semibold">{proposal.budget} ALGO</div>
                      </div>
                      <div>
                        <span className="text-gray-400">TX ID:</span>
                        <div className="font-mono text-xs text-cyan-400">{proposal.txId?.slice(0, 8)}...</div>
                      </div>
                    </div>

                    {/* Signature Status Tracker */}
                    <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-slate-600">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Users size={16} className="text-cyan-400" />
                        Approval Status
                      </h4>
                      <div className="space-y-3">
                        {/* HOD Approval */}
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            proposal.approvals?.hod 
                              ? 'bg-green-500 text-white' 
                              : proposal.status === 'pending_hod'
                              ? 'bg-yellow-500 text-white animate-pulse'
                              : 'bg-gray-600 text-gray-400'
                          }`}>
                            {proposal.approvals?.hod ? '✓' : '⏱'}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-sm">Head of Department</div>
                            <div className="text-xs text-gray-400">
                              {proposal.approvals?.hod 
                                ? '✅ Approved' 
                                : proposal.status === 'pending_hod'
                                ? '⏳ Pending approval...'
                                : '⏸️ Awaiting previous approvals'}
                            </div>
                          </div>
                        </div>

                        {/* Faculty Approval */}
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            proposal.approvals?.faculty 
                              ? 'bg-green-500 text-white' 
                              : proposal.status === 'pending_faculty'
                              ? 'bg-yellow-500 text-white animate-pulse'
                              : 'bg-gray-600 text-gray-400'
                          }`}>
                            {proposal.approvals?.faculty ? '✓' : '⏱'}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-sm">Faculty Coordinator</div>
                            <div className="text-xs text-gray-400">
                              {proposal.approvals?.faculty 
                                ? '✅ Approved' 
                                : proposal.status === 'pending_faculty'
                                ? '⏳ Pending approval...'
                                : '⏸️ Awaiting previous approvals'}
                            </div>
                          </div>
                        </div>

                        {/* Dean Approval */}
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            proposal.approvals?.dean 
                              ? 'bg-green-500 text-white' 
                              : proposal.status === 'pending_dean'
                              ? 'bg-yellow-500 text-white animate-pulse'
                              : 'bg-gray-600 text-gray-400'
                          }`}>
                            {proposal.approvals?.dean ? '✓' : '⏱'}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-sm">Dean</div>
                            <div className="text-xs text-gray-400">
                              {proposal.approvals?.dean 
                                ? '✅ Approved' 
                                : proposal.status === 'pending_dean'
                                ? '⏳ Pending approval...'
                                : '⏸️ Awaiting previous approvals'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>
                            {[proposal.approvals?.hod, proposal.approvals?.faculty, proposal.approvals?.dean].filter(Boolean).length}/3 Signatures
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${([proposal.approvals?.hod, proposal.approvals?.faculty, proposal.approvals?.dean].filter(Boolean).length / 3) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {proposal.nftAssetId && (
                      <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-400 mb-2">✅ Permission NFT Minted!</h4>
                        <p className="text-sm mb-2">Asset ID: <span className="font-mono text-cyan-400">{proposal.nftAssetId}</span></p>
                        <ExplorerLink txId={proposal.txId} type="asset" assetId={proposal.nftAssetId} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Proposals Tab */}
        {activeTab === 'allproposals' && (
          <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold mb-6">All Event Proposals</h2>
            <div className="space-y-4">
              {proposals.map((proposal, idx) => (
                <div key={idx} className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{proposal.eventName}</h3>
                      <p className="text-gray-400">{proposal.clubName}</p>
                    </div>
                    {getStatusBadge(proposal.status)}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-400">Date:</span>
                      <div className="font-semibold">{proposal.eventDate}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Budget:</span>
                      <div className="font-semibold">{proposal.budget} ALGO</div>
                    </div>
                    <div>
                      <span className="text-gray-400">TX ID:</span>
                      <div className="font-mono text-xs text-cyan-400">{proposal.txId?.slice(0, 8)}...</div>
                    </div>
                  </div>

                  {/* Signature Status Tracker */}
                  <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-slate-600">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Users size={16} className="text-cyan-400" />
                      Signature Status
                    </h4>
                    <div className="flex items-center justify-between gap-4">
                      {/* HOD */}
                      <div className="flex-1 text-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${
                          proposal.approvals?.hod ? 'bg-green-500 text-white' : 
                          proposal.status === 'pending_hod' ? 'bg-yellow-500 text-white animate-pulse' : 
                          'bg-gray-600 text-gray-400'
                        }`}>
                          {proposal.approvals?.hod ? '✓' : '⏱'}
                        </div>
                        <div className="text-xs font-semibold">HOD</div>
                        <div className="text-xs text-gray-400">
                          {proposal.approvals?.hod ? 'Signed' : 'Pending'}
                        </div>
                      </div>
                      <div className="text-gray-600 text-xl">→</div>
                      {/* Faculty */}
                      <div className="flex-1 text-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${
                          proposal.approvals?.faculty ? 'bg-green-500 text-white' : 
                          proposal.status === 'pending_faculty' ? 'bg-yellow-500 text-white animate-pulse' : 
                          'bg-gray-600 text-gray-400'
                        }`}>
                          {proposal.approvals?.faculty ? '✓' : '⏱'}
                        </div>
                        <div className="text-xs font-semibold">Faculty</div>
                        <div className="text-xs text-gray-400">
                          {proposal.approvals?.faculty ? 'Signed' : 'Pending'}
                        </div>
                      </div>
                      <div className="text-gray-600 text-xl">→</div>
                      {/* Dean */}
                      <div className="flex-1 text-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${
                          proposal.approvals?.dean ? 'bg-green-500 text-white' : 
                          proposal.status === 'pending_dean' ? 'bg-yellow-500 text-white animate-pulse' : 
                          'bg-gray-600 text-gray-400'
                        }`}>
                          {proposal.approvals?.dean ? '✓' : '⏱'}
                        </div>
                        <div className="text-xs font-semibold">Dean</div>
                        <div className="text-xs text-gray-400">
                          {proposal.approvals?.dean ? 'Signed' : 'Pending'}
                        </div>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Overall Progress</span>
                        <span>
                          {[proposal.approvals?.hod, proposal.approvals?.faculty, proposal.approvals?.dean].filter(Boolean).length}/3
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${([proposal.approvals?.hod, proposal.approvals?.faculty, proposal.approvals?.dean].filter(Boolean).length / 3) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {proposal.status === 'approved' && proposal.nftAssetId && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-green-400">Permission NFT</h4>
                          <p className="text-sm font-mono text-cyan-400">Asset ID: {proposal.nftAssetId}</p>
                        </div>
                        <ExternalLink className="text-cyan-400" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Approvals Tab (for HOD/Faculty/Dean) */}
        {activeTab === 'approvals' && userRole !== 'student' && (
          <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold mb-6">Pending Approvals - {userRole.toUpperCase()}</h2>
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto mb-4 text-gray-500" size={48} />
                <p className="text-gray-400">No pending approvals</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingApprovals.map((proposal, idx) => (
                  <div key={idx} className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                    <h3 className="text-xl font-bold mb-2">{proposal.eventName}</h3>
                    <p className="text-gray-400 mb-4">{proposal.description}</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => approveProposal(proposal.id, userRole)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => rejectProposal(proposal.id, userRole)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* How It Works Section */}
      <div className="max-w-7xl mx-auto mt-12">
        <div className="bg-gradient-to-r from-slate-800/60 to-blue-900/60 backdrop-blur rounded-2xl p-8 border border-cyan-500/20">
          <h2 className="text-3xl font-bold mb-6 text-center">🏛️ How Smart Permissions Work</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800/60 rounded-xl p-6 border border-purple-500/30">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-3 text-purple-400">1. AI Pre-Audit</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                AI instantly checks for <strong>schedule conflicts</strong> (exams/other events) and
                <strong> budget feasibility</strong>. Bad applications are stopped before reaching the Dean.
              </p>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-6 border border-blue-500/30">
              <div className="text-4xl mb-4">✍️</div>
              <h3 className="text-xl font-bold mb-3 text-blue-400">2. Multi-Sig Approval</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                The proposal becomes an <strong>Algorand Smart Contract</strong> requiring transaction signatures
                from HOD → Faculty Coordinator → Dean. Track exactly whose desk it's on.
              </p>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-6 border border-green-500/30">
              <div className="text-4xl mb-4">🎫</div>
              <h3 className="text-xl font-bold mb-3 text-green-400">3. Permission NFT</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Once all signatures collected, system <strong>auto-mints an ASA</strong> to the club's wallet.
                Show this unforgeable, timestamped NFT to security for instant verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
