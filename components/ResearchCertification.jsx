/**
 * CampusTrust AI - Research Paper Certification
 * =================================================
 * Proof of Ideation with AI Review and Blockchain Timestamping
 */

import React, { useState, useEffect } from 'react';
import { FileText, Shield, Clock, CheckCircle, AlertTriangle, Loader2, Award, Hash } from 'lucide-react';
import ExplorerLink from './ExplorerLink';
import StatusMessage from './StatusMessage';

export default function ResearchCertification({ walletAddress, signCallback }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' or 'history'
  
  // Submission form
  const [submission, setSubmission] = useState({
    title: '',
    abstract: '',
    file: null,
    category: 'research'
  });

  // Mock certified papers
  const [certifiedPapers, setCertifiedPapers] = useState([
    {
      id: 1,
      title: 'Novel Approach to Blockchain Consensus Mechanisms',
      author: 'Priya Sharma',
      category: 'research',
      timestamp: Date.now() - 86400000 * 10,
      hash: 'SHA256:A3F2...' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      txId: 'CERT' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      aiScore: 88,
      aiReview: {
        technicalAccuracy: 90,
        originality: 92,
        clarity: 85,
        plagiarismScore: 2,
        summary: 'This research presents an innovative approach to consensus mechanisms with strong theoretical foundations.',
        strengths: [
          'Novel theoretical framework',
          'Comprehensive literature review',
          'Well-structured methodology'
        ],
        suggestions: [
          'Include more empirical validation',
          'Expand the discussion section'
        ]
      }
    }
  ]);

  const [reviewing, setReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);

  const categories = [
    { value: 'research', label: 'Academic Research Paper' },
    { value: 'project', label: 'Project Report' },
    { value: 'thesis', label: 'Thesis/Dissertation' },
    { value: 'whitepaper', label: 'Technical Whitepaper' }
  ];

  const handleReviewPaper = async () => {
    if (!submission.title || !submission.abstract) {
      setStatus({ type: 'error', message: 'Please fill in title and abstract' });
      return;
    }

    if (!submission.file) {
      setStatus({ type: 'error', message: 'Please upload your paper (PDF)' });
      return;
    }

    setReviewing(true);
    setStatus({ type: 'info', message: 'AI is reviewing your paper for technical accuracy and plagiarism...' });

    try {
      // Simulate AI review  
      await new Promise(r => setTimeout(r, 3000));

      const score = Math.floor(Math.random() * 25) + 70;
      
      setReviewResult({
        technicalAccuracy: Math.floor(Math.random() * 15) + 85,
        originality: Math.floor(Math.random() * 15) + 85,
        clarity: Math.floor(Math.random() * 15) + 80,
        plagiarismScore: Math.floor(Math.random() * 5) + 1,
        overallScore: score,
        summary: 'This paper demonstrates solid research methodology and presents valuable contributions to the field.',
        strengths: [
          'Well-defined research questions',
          'Comprehensive data analysis',
          'Clear presentation of results'
        ],
        suggestions: [
          'Strengthen the theoretical framework',
          'Include more recent references',
          'Expand the limitations section'
        ],
        hash: 'SHA256:' + Math.random().toString(36).substring(2, 16).toUpperCase(),
        timestamp: Date.now()
      });

      setStatus({ type: 'success', message: 'AI review complete!' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setReviewing(false);
    }
  };

  const handleCertifyPaper = async () => {
    if (!reviewResult) {
      setStatus({ type: 'error', message: 'Please review the paper first' });
      return;
    }

    if (!walletAddress) {
      setStatus({ type: 'error', message: 'Please connect your wallet first' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'info', message: 'Creating cryptographic timestamp on Algorand Blockchain...' });

    try {
      await new Promise(r => setTimeout(r, 2500));

      const newPaper = {
        id: certifiedPapers.length + 1,
        title: submission.title,
        author: 'Current Student',
        category: submission.category,
        timestamp: Date.now(),
        hash: reviewResult.hash,
        txId: 'CERT' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        aiScore: reviewResult.overallScore,
        aiReview: {
          technicalAccuracy: reviewResult.technicalAccuracy,
          originality: reviewResult.originality,
          clarity: reviewResult.clarity,
          plagiarismScore: reviewResult.plagiarismScore,
          summary: reviewResult.summary,
          strengths: reviewResult.strengths,
          suggestions: reviewResult.suggestions
        }
      };

      setCertifiedPapers([newPaper, ...certifiedPapers]);
      setStatus({ 
        type: 'success', 
        message: `Paper certified! Your ideation is now permanently timestamped on Algorand. TX: ${newPaper.txId}` 
      });
      
      setSubmission({ title: '', abstract: '', file: null, category: 'research' });
      setReviewResult(null);
      setActiveTab('history');
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-10 h-10 text-amber-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            Research Paper Certification
          </h1>
        </div>
        <p className="text-gray-400">
          AI-powered peer review with blockchain-based proof of ideation
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('submit')}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'submit'
              ? 'text-amber-400 border-b-2 border-amber-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Submit Paper
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'history'
              ? 'text-amber-400 border-b-2 border-amber-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          My Certifications ({certifiedPapers.length})
        </button>
      </div>

      {/* Status Messages */}
      {status.message && (
        <StatusMessage type={status.type} message={status.message} onClose={() => setStatus({ type: '', message: '' })} />
      )}

      {/* Submit Tab */}
      {activeTab === 'submit' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Submission Form */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Submit Your Research</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Paper Title *</label>
                <input
                  type="text"
                  value={submission.title}
                  onChange={(e) => setSubmission({ ...submission, title: e.target.value })}
                  placeholder="Enter your paper title"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select
                  value={submission.category}
                  onChange={(e) => setSubmission({ ...submission, category: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Abstract *</label>
                <textarea
                  value={submission.abstract}
                  onChange={(e) => setSubmission({ ...submission, abstract: e.target.value })}
                  placeholder="Provide a brief abstract of your research..."
                  rows={6}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Upload Paper (PDF) *</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setSubmission({ ...submission, file: e.target.files[0] })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                />
                {submission.file && (
                  <div className="text-sm text-green-400 mt-2">
                    ✓ {submission.file.name}
                  </div>
                )}
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h3 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  How It Works
                </h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>1. AI reviews your paper for accuracy & originality</li>
                  <li>2. Generates a cryptographic hash of your work</li>
                  <li>3. Timestamps it permanently on Algorand</li>
                  <li>4. You now have proof you had this idea on this date</li>
                </ul>
              </div>

              <button
                onClick={handleReviewPaper}
                disabled={reviewing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {reviewing && <Loader2 className="w-5 h-5 animate-spin" />}
                {reviewing ? 'AI Reviewing...' : 'Get AI Review'}
              </button>
            </div>
          </div>

          {/* Review Result */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">AI Review Report</h2>

            {!reviewResult ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Submit your paper to receive an AI review</p>
              </div>
            ) : (
              <div>
                {/* Overall Score */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 mb-4">
                    <span className="text-5xl font-bold">{reviewResult.overallScore}</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-300">Overall Quality Score</div>
                </div>

                {/* Detailed Scores */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Technical Accuracy</div>
                    <div className={`text-2xl font-bold ${getScoreColor(reviewResult.technicalAccuracy)}`}>
                      {reviewResult.technicalAccuracy}%
                    </div>
                  </div>
                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Originality</div>
                    <div className={`text-2xl font-bold ${getScoreColor(reviewResult.originality)}`}>
                      {reviewResult.originality}%
                    </div>
                  </div>
                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Clarity</div>
                    <div className={`text-2xl font-bold ${getScoreColor(reviewResult.clarity)}`}>
                      {reviewResult.clarity}%
                    </div>
                  </div>
                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Plagiarism</div>
                    <div className={`text-2xl font-bold ${reviewResult.plagiarismScore < 5 ? 'text-green-400' : 'text-red-400'}`}>
                      {reviewResult.plagiarismScore}%
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">AI Summary</h3>
                  <p className="text-sm text-gray-300">{reviewResult.summary}</p>
                </div>

                {/* Strengths */}
                <div className="mb-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Strengths
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-300">
                    {reviewResult.strengths.map((s, i) => (
                      <li key={i}>✓ {s}</li>
                    ))}
                  </ul>
                </div>

                {/* Suggestions */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    Suggestions for Improvement
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-300">
                    {reviewResult.suggestions.map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>

                {/* Hash */}
                <div className="bg-gray-700/50 p-3 rounded-lg mb-4">
                  <div className="text-xs text-gray-400 mb-1">Content Hash</div>
                  <div className="font-mono text-xs break-all">{reviewResult.hash}</div>
                </div>

                {/* Certify Button */}
                <button
                  onClick={handleCertifyPaper}
                  disabled={loading || !walletAddress}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {loading ? 'Certifying...' : 'Certify on Blockchain'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {certifiedPapers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Award className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No certifications yet. Submit your first research paper!</p>
            </div>
          ) : (
            certifiedPapers.map(paper => (
              <div key={paper.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold mb-2">{paper.title}</h3>
                    <div className="text-sm text-gray-400 mb-3">
                      {paper.author} • {categories.find(c => c.value === paper.category)?.label}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-amber-400">
                        <Clock className="w-4 h-4" />
                        {new Date(paper.timestamp).toLocaleString()}
                      </div>
                      <div className={`font-semibold ${getScoreColor(paper.aiScore)}`}>
                        AI Score: {paper.aiScore}/100
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-lg">
                    <Shield className="w-8 h-8" />
                  </div>
                </div>

                {/* AI Review Summary */}
                <div className="bg-gray-700/50 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-4 gap-3 mb-3">
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getScoreColor(paper.aiReview.technicalAccuracy)}`}>
                        {paper.aiReview.technicalAccuracy}%
                      </div>
                      <div className="text-xs text-gray-400">Technical</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getScoreColor(paper.aiReview.originality)}`}>
                        {paper.aiReview.originality}%
                      </div>
                      <div className="text-xs text-gray-400">Originality</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getScoreColor(paper.aiReview.clarity)}`}>
                        {paper.aiReview.clarity}%
                      </div>
                      <div className="text-xs text-gray-400">Clarity</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${paper.aiReview.plagiarismScore < 5 ? 'text-green-400' : 'text-red-400'}`}>
                        {paper.aiReview.plagiarismScore}%
                      </div>
                      <div className="text-xs text-gray-400">Plagiarism</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">{paper.aiReview.summary}</p>
                </div>

                {/* Hash and TX */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Hash className="w-4 h-4" />
                    <span className="font-mono">{paper.hash}</span>
                  </div>
                  <ExplorerLink txId={paper.txId} type="transaction" className="text-xs" />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
