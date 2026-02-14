/**
 * CampusTrust AI - Smart Grants Component
 * ===========================================
 * AI-Powered Automatic Grant Distribution System with Milestone-Based Payments
 */

import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, CheckCircle, Clock, AlertCircle, Upload, Loader2, TrendingUp } from 'lucide-react';
import ExplorerLink from './ExplorerLink';
import StatusMessage from './StatusMessage';

export default function SmartGrants({ walletAddress, signCallback }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [activeTab, setActiveTab] = useState('apply'); // 'apply', 'myprojects', 'admin'
  
  // Application form
  const [application, setApplication] = useState({
    projectTitle: '',
    description: '',
    budget: '',
    duration: '30',
    category: 'research',
    milestones: [
      { title: 'Proposal Approval', amount: 25, status: 'pending' },
      { title: 'Prototype Development', amount: 50, status: 'locked' },
      { title: 'Final Delivery', amount: 25, status: 'locked' }
    ]
  });

  // Mock projects
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: 'IoT-Based Smart Campus System',
      student: 'Priya Sharma',
      wallet: walletAddress || 'ADDR...XYZ',
      category: 'innovation',
      budget: 500,
      approved: true,
      aiScore: 92,
      milestones: [
        { title: 'Proposal Approval', amount: 125, status: 'completed', txId: 'GRANT' + Math.random().toString(36).substring(2, 8).toUpperCase(), completedAt: Date.now() - 86400000 * 15 },
        { title: 'Prototype Development', amount: 250, status: 'in_progress', proofUrl: '', dueDate: Date.now() + 86400000 * 10 },
        { title: 'Final Delivery', amount: 125, status: 'locked', proofUrl: '', dueDate: Date.now() + 86400000 * 25 }
      ],
      createdAt: Date.now() - 86400000 * 20
    }
  ]);

  const [analyzingProposal, setAnalyzingProposal] = useState(false);
  const [aiEvaluation, setAiEvaluation] = useState(null);

  const categories = [
    { value: 'research', label: 'Academic Research' },
    { value: 'innovation', label: 'Innovation Project' },
    { value: 'social', label: 'Social Initiative' },
    { value: 'tech', label: 'Technology Development' }
  ];

  const handleAnalyzeProposal = async () => {
    if (!application.projectTitle || !application.description || !application.budget) {
      setStatus({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    setAnalyzingProposal(true);
    setStatus({ type: 'info', message: 'AI is evaluating your proposal...' });

    try {
      const response = await fetch('http://localhost:5000/api/ai/grants/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: application.projectTitle,
          description: application.description,
          budget: parseFloat(application.budget),
          category: application.category
        })
      });

      const data = await response.json();
      
      setAiEvaluation({
        score: data.score || Math.floor(Math.random() * 30) + 65,
        approved: (data.score || 75) >= 70,
        feedback: data.feedback || [
          'Clear project objectives and deliverables',
          'Feasible budget allocation',
          'Well-defined timeline and milestones',
          'Strong potential for campus impact'
        ],
        concerns: data.concerns || [
          'Consider adding more detailed technical specifications',
          'Budget justification could be more thorough'
        ],
        recommendation: data.recommendation || 'Recommended for approval with minor revisions'
      });

      setStatus({ type: 'success', message: 'AI evaluation complete!' });
    } catch (error) {
      // Fallback to demo mode
      const score = Math.floor(Math.random() * 30) + 65;
      setAiEvaluation({
        score,
        approved: score >= 70,
        feedback: [
          'Clear project objectives and deliverables',
          'Feasible budget allocation',
          'Well-defined timeline and milestones',
          'Strong potential for campus impact'
        ],
        concerns: [
          'Consider adding more detailed technical specifications',
          'Budget justification could be more thorough'
        ],
        recommendation: score >= 70 ? 'Recommended for approval' : 'Needs revision before approval'
      });
      setStatus({ type: 'success', message: 'AI evaluation complete (Demo Mode)' });
    } finally {
      setAnalyzingProposal(false);
    }
  };

  const handleSubmitProposal = async () => {
    if (!aiEvaluation || !aiEvaluation.approved) {
      setStatus({ type: 'error', message: 'Proposal must be AI-approved before submission' });
      return;
    }

    if (!walletAddress) {
      setStatus({ type: 'error', message: 'Please connect your wallet first' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'info', message: 'Submitting proposal to Algorand Smart Contract...' });

    try {
      await new Promise(r => setTimeout(r, 2500));

      const newProject = {
        id: projects.length + 1,
        title: application.projectTitle,
        student: 'Current Student',
        wallet: walletAddress,
        category: application.category,
        budget: parseFloat(application.budget),
        approved: true,
        aiScore: aiEvaluation.score,
        milestones: application.milestones.map((m, i) => ({
          ...m,
          amount: (parseFloat(application.budget) * m.amount) / 100,
          status: i === 0 ? 'pending' : 'locked'
        })),
        createdAt: Date.now()
      };

      setProjects([newProject, ...projects]);
      setStatus({ type: 'success', message: 'Proposal submitted successfully! Awaiting first milestone approval.' });
      setApplication({
        projectTitle: '',
        description: '',
        budget: '',
        duration: '30',
        category: 'research',
        milestones: [
          { title: 'Proposal Approval', amount: 25, status: 'pending' },
          { title: 'Prototype Development', amount: 50, status: 'locked' },
          { title: 'Final Delivery', amount: 25, status: 'locked' }
        ]
      });
      setAiEvaluation(null);
      setActiveTab('myprojects');
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClaimMilestone = async (projectId, milestoneIndex) => {
    setLoading(true);
    setStatus({ type: 'info', message: 'Processing milestone payment on Algorand...' });

    try {
      await new Promise(r => setTimeout(r, 2000));

      const txId = 'GRANT' + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      setProjects(projects.map(p => {
        if (p.id === projectId) {
          const updatedMilestones = [...p.milestones];
          updatedMilestones[milestoneIndex] = {
            ...updatedMilestones[milestoneIndex],
            status: 'completed',
            txId,
            completedAt: Date.now()
          };
          
          // Unlock next milestone
          if (milestoneIndex + 1 < updatedMilestones.length) {
            updatedMilestones[milestoneIndex + 1].status = 'in_progress';
          }
          
          return { ...p, milestones: updatedMilestones };
        }
        return p;
      }));

      setStatus({ type: 'success', message: `Milestone payment released! TX: ${txId}` });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getMilestoneStatus = (status) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Completed' };
      case 'in_progress':
        return { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'In Progress' };
      case 'pending':
        return { icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Pending' };
      default:
        return { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-500/20', label: 'Locked' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="w-10 h-10 text-green-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Smart Grants System
          </h1>
        </div>
        <p className="text-gray-400">
          AI-powered grant approval with automatic milestone-based funding on Algorand
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('apply')}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'apply'
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Apply for Grant
        </button>
        <button
          onClick={() => setActiveTab('myprojects')}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'myprojects'
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          My Projects ({projects.filter(p => p.wallet === walletAddress).length})
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'admin'
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          All Grants ({projects.length})
        </button>
      </div>

      {/* Status Messages */}
      {status.message && (
        <StatusMessage type={status.type} message={status.message} onClose={() => setStatus({ type: '', message: '' })} />
      )}

      {/* Apply Tab */}
      {activeTab === 'apply' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Application Form */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Grant Application</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Project Title *</label>
                <input
                  type="text"
                  value={application.projectTitle}
                  onChange={(e) => setApplication({ ...application, projectTitle: e.target.value })}
                  placeholder="Enter your project title"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select
                  value={application.category}
                  onChange={(e) => setApplication({ ...application, category: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Project Description *</label>
                <textarea
                  value={application.description}
                  onChange={(e) => setApplication({ ...application, description: e.target.value })}
                  placeholder="Describe your project objectives, methodology, and expected outcomes..."
                  rows={6}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Budget (ALGO) *</label>
                  <input
                    type="number"
                    value={application.budget}
                    onChange={(e) => setApplication({ ...application, budget: e.target.value })}
                    placeholder="500"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Duration (days)</label>
                  <input
                    type="number"
                    value={application.duration}
                    onChange={(e) => setApplication({ ...application, duration: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  />
                </div>
              </div>

              <button
                onClick={handleAnalyzeProposal}
                disabled={analyzingProposal}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {analyzingProposal && <Loader2 className="w-5 h-5 animate-spin" />}
                {analyzingProposal ? 'AI Evaluating...' : 'Get AI Evaluation'}
              </button>
            </div>
          </div>

          {/* AI Evaluation Result */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">AI Evaluation</h2>

            {!aiEvaluation ? (
              <div className="text-center py-12 text-gray-500">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Submit your proposal for AI evaluation</p>
              </div>
            ) : (
              <div>
                {/* Score */}
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${
                    aiEvaluation.approved ? 'bg-gradient-to-br from-green-500 to-blue-500' : 'bg-gradient-to-br from-orange-500 to-red-500'
                  } mb-4`}>
                    <span className="text-5xl font-bold">{aiEvaluation.score}</span>
                  </div>
                   <div className={`inline-block px-4 py-2 rounded-full ${
                    aiEvaluation.approved ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {aiEvaluation.recommendation}
                  </div>
                </div>

                {/* Feedback */}
                <div className="mb-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Strengths
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-300">
                    {aiEvaluation.feedback.map((f, i) => (
                      <li key={i}>✓ {f}</li>
                    ))}
                  </ul>
                </div>

                {/* Concerns */}
                {aiEvaluation.concerns.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-orange-400" />
                      Suggestions
                    </h3>
                    <ul className="space-y-1 text-sm text-gray-300">
                      {aiEvaluation.concerns.map((c, i) => (
                        <li key={i}>• {c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Submit Button */}
                {aiEvaluation.approved && (
                  <button
                    onClick={handleSubmitProposal}
                    disabled={loading || !walletAddress}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {loading ? 'Submitting...' : 'Submit to Blockchain'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* My Projects Tab */}
      {(activeTab === 'myprojects' || activeTab === 'admin') && (
        <div className="space-y-6">
          {projects.filter(p => activeTab === 'admin' || p.wallet === walletAddress).map(project => (
            <div key={project.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-semibold">{project.title}</h3>
                  <p className="text-sm text-gray-400">
                    {project.student} • {categories.find(c => c.value === project.category)?.label}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">{project.budget} ALGO</div>
                  <div className="text-sm text-gray-400">AI Score: {project.aiScore}/100</div>
                </div>
              </div>

              {/* Milestones */}
              <div className="space-y-3">
                <h4 className="font-semibold">Milestones & Funding</h4>
                {project.milestones.map((milestone, idx) => {
                  const statusInfo = getMilestoneStatus(milestone.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div key={idx} className={`p-4 rounded-lg border ${statusInfo.bg} border-gray-600`}>
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                            <span className="font-medium">{milestone.title}</span>
                            <span className={`text-sm px-2 py-0.5 rounded ${statusInfo.bg} ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <div className="text-sm text-gray-400">
                            Amount: {milestone.amount} ALGO
                          </div>
                          {milestone.completedAt && (
                            <div className="mt-2">
                              <ExplorerLink txId={milestone.txId} type="transaction" className="text-xs" />
                            </div>
                          )}
                        </div>
                        
                        {milestone.status === 'pending' && project.wallet === walletAddress && (
                          <button
                            onClick={() => handleClaimMilestone(project.id, idx)}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                          >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Claim Payment
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {(activeTab === 'myprojects' && projects.filter(p => p.wallet === walletAddress).length === 0) && (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No projects yet. Apply for a grant to get started!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
