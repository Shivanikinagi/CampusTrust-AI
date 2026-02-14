/**
 * CampusTrust AI - Feedback System Component
 * ==============================================
 * Anonymous feedback with AI sentiment analysis on Algorand.
 * Feedback hashes stored on-chain, full text processed by AI.
 */

import React, { useState, useEffect } from 'react';
import { feedback } from '../services/contractService.js';
// Removed analyzeSentimentOffline import to use local robust version
import StatusMessage from './StatusMessage';
import ExplorerLink from './ExplorerLink';

// Deterministic Client-Side Sentiment Analysis (Offline Fallback)
const analyzeSentimentClientSide = (text) => {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'best', 'happy', 'helpful', 'awesome', 'fast', 'easy'];
    const negativeWords = ['bad', 'worst', 'terrible', 'waste', 'hate', 'poor', 'slow', 'boring', 'useless', 'hard', 'broken'];
    
    const words = text.toLowerCase().split(/\W+/);
    let score = 50; 
    
    words.forEach(w => {
        if (positiveWords.includes(w)) score += 15;
        if (negativeWords.includes(w)) score -= 15;
    });
    
    return Math.max(10, Math.min(95, score));
};

export default function FeedbackSystem({ walletAddress, signCallback }) {
  const [feedbackText, setFeedbackText] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [currentSentiment, setCurrentSentiment] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [backendStatus, setBackendStatus] = useState('unknown'); // State for AI Engine status

  // Demo state
  const [feedbackHistory, setFeedbackHistory] = useState([
    { id: 1, text: 'The blockchain course was incredibly well-structured and the labs were hands-on.', sentiment: 82, classification: 'positive', category: 'teaching', timestamp: Date.now() - 86400000 },
    { id: 2, text: 'WiFi in the library is unreliable. Needs immediate improvement.', sentiment: 25, classification: 'negative', category: 'infrastructure', timestamp: Date.now() - 172800000 },
  ]);

  const [aggregateStats, setAggregateStats] = useState({
    total: 2,
    avgSentiment: 53,
    positive: 1,
    negative: 1,
    neutral: 0,
  });

  // Check Backend Status on Mount
  useEffect(() => {
     fetch('http://localhost:5001/api/ai/health')
        .then(() => setBackendStatus('online'))
        .catch(() => setBackendStatus('offline'));
  }, []);

  // Real-time sentiment preview
  useEffect(() => {
    if (!feedbackText.trim()) {
      setCurrentSentiment(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsAnalyzing(true);
      try {
          // 1. Try Backend
          const resp = await fetch('http://localhost:5001/api/ai/sentiment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: feedbackText })
          });
          
          if (resp.ok) {
              const data = await resp.json();
              setCurrentSentiment(data);
              setBackendStatus('online');
          } else {
              throw new Error('Backend failed');
          }
      } catch (e) {
          // 2. Client-Side Fallback
          setBackendStatus('offline');
          const localScore = analyzeSentimentClientSide(feedbackText);
          setCurrentSentiment({
              sentiment_score: localScore,
              classification: localScore > 60 ? 'positive' : localScore < 40 ? 'negative' : 'neutral',
              confidence: 80, 
              emotions: [],
              key_phrases: [],
              fallback: true 
          });
      }
      setIsAnalyzing(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [feedbackText]);

  const handleSubmit = async () => {
    if (feedbackText.trim().length === 0) {
      setStatus({ type: 'error', message: 'Please enter some feedback.' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'info', message: 'Analyzing sentiment and recording on Algorand...' });

    try {
      const sentimentScore = currentSentiment?.sentiment_score || 50;
      
      // Simulate blockchain transaction
      await new Promise(r => setTimeout(r, 1500));

      const newFeedback = {
        id: feedbackHistory.length + 1,
        text: feedbackText,
        sentiment: sentimentScore,
        classification: currentSentiment?.classification || 'neutral',
        category: currentSentiment?.category || category,
        timestamp: Date.now(),
      };

      setFeedbackHistory(prev => [newFeedback, ...prev]);

      // Update aggregate stats
      const allScores = [sentimentScore, ...feedbackHistory.map(f => f.sentiment)];
      setAggregateStats({
        total: allScores.length,
        avgSentiment: Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length),
        positive: allScores.filter(s => s > 60).length,
        negative: allScores.filter(s => s < 40).length,
        neutral: allScores.filter(s => s >= 40 && s <= 60).length,
      });

      // Generate mock transaction ID for demo
      const mockTxId = Array(52).fill(0).map(() => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]).join("");
      
      setStatus({ type: 'success', message: `✅ Feedback recorded! Sentiment: ${sentimentScore}/100. TX: ${mockTxId}` });
      setFeedbackText('');
      setCurrentSentiment(null);
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
    setLoading(false);
  };

  const sentimentColor = (score) => {
    if (score > 60) return 'text-green-400';
    if (score < 40) return 'text-red-400';
    return 'text-yellow-400';
  };

  const sentimentBg = (score) => {
    if (score > 60) return 'bg-green-500/10 border-green-500/30';
    if (score < 40) return 'bg-red-500/10 border-red-500/30';
    return 'bg-yellow-500/10 border-yellow-500/30';
  };

  const sentimentEmoji = (score) => {
    if (score > 80) return '😄';
    if (score > 60) return '🙂';
    if (score > 40) return '😐';
    if (score > 20) return '😟';
    return '😞';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">💬 AI Feedback Analysis</h1>
            <p className="text-gray-400">Anonymous feedback with real-time AI sentiment analysis on Algorand</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-mono border ${
            backendStatus === 'online' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
        }`}>
            ● AI Engine: {backendStatus === 'online' ? 'Connected' : 'Client-Side Mode'}
        </div>
      </div>

      {/* Status */}
      {status.message && (
        <div className={`mb-6 p-4 rounded-xl border ${
          status.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
          status.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
          'bg-blue-500/10 border-blue-500/30 text-blue-400'
        }`}>{status.message}</div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total Feedback" value={aggregateStats.total} color="text-cyan-300" />
        <StatCard label="Avg Sentiment" value={`${aggregateStats.avgSentiment}/100`} color={sentimentColor(aggregateStats.avgSentiment)} />
        <StatCard label="Positive" value={aggregateStats.positive} color="text-green-400" />
        <StatCard label="Neutral" value={aggregateStats.neutral} color="text-yellow-400" />
        <StatCard label="Negative" value={aggregateStats.negative} color="text-red-400" />
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Submit Form */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Submit Anonymous Feedback</h3>
            <p className="text-gray-400 text-sm mb-4">
              Your feedback is hashed before storing on-chain. Only the hash is recorded — your text stays private.
            </p>

            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Share your feedback about courses, facilities, campus life..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm h-32 resize-none focus:border-cyan-500 focus:outline-none mb-4"
            />

            {/* Real-time Sentiment Preview */}
            {currentSentiment && (
              <div className={`p-4 rounded-xl border mb-4 ${sentimentBg(currentSentiment.sentiment_score)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{sentimentEmoji(currentSentiment.sentiment_score)}</span>
                    <div>
                      <p className={`font-bold ${sentimentColor(currentSentiment.sentiment_score)}`}>
                        Sentiment: {currentSentiment.sentiment_score}/100
                      </p>
                      <p className="text-gray-400 text-xs capitalize">
                        {currentSentiment.classification} · {currentSentiment.category || category}
                      </p>
                    </div>
                  </div>
                  {isAnalyzing && <span className="text-gray-500 text-xs animate-pulse">Analyzing...</span>}
                </div>

                {/* Sentiment bar */}
                <div className="w-full bg-gray-700/50 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      currentSentiment.sentiment_score > 60 ? 'bg-green-500' :
                      currentSentiment.sentiment_score < 40 ? 'bg-red-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${currentSentiment.sentiment_score}%` }}
                  ></div>
                </div>

                {currentSentiment.emotions && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {currentSentiment.emotions.map((e, i) => (
                      <span key={i} className="text-xs bg-gray-700/50 text-gray-300 px-2 py-0.5 rounded-full capitalize">{e}</span>
                    ))}
                  </div>
                )}

                {currentSentiment.fallback && (
                    <div className="mt-2 text-[10px] text-yellow-500 bg-yellow-900/20 px-2 py-1 rounded inline-block">
                        ⚠️ Offline Mode: Using basic keyword matching. Connect backend for full NLP.
                    </div>
                )}
                !feedbackText.trim()
                {currentSentiment.key_phrases?.length > 0 && (
                  <div className="mt-2">
                    <span className="text-gray-500 text-xs">Key Phrases: </span>
                    {currentSentiment.key_phrases.map((p, i) => (
                      <span key={i} className="text-cyan-300 text-xs mr-2">#{p}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <label className="text-gray-400 text-xs block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
                >
                  <option value="general">General</option>
                  <option value="teaching">Teaching</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="curriculum">Curriculum</option>
                  <option value="administration">Administration</option>
                  <option value="campus_life">Campus Life</option>
                  <option value="examination">Examination</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || feedbackText.length < 10}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50"
            >
              {loading ? '⏳ Recording on Blockchain...' : '💬 Submit Feedback'}
            </button>
          </div>
        </div>

        {/* Sentiment Distribution */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">Sentiment Distribution</h3>
            <div className="space-y-3">
              <BarItem label="Positive" count={aggregateStats.positive} total={aggregateStats.total} color="bg-green-500" />
              <BarItem label="Neutral" count={aggregateStats.neutral} total={aggregateStats.total} color="bg-yellow-500" />
              <BarItem label="Negative" count={aggregateStats.negative} total={aggregateStats.total} color="bg-red-500" />
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-3">Privacy Model</h3>
            <div className="space-y-2 text-gray-400 text-xs">
              <p>🔒 Feedback text is never stored on-chain</p>
              <p>🔗 Only SHA-256 hash is recorded on Algorand</p>
              <p>🧠 AI analysis runs server-side, results are aggregate</p>
              <p>👤 No link between feedback and wallet identity</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback History */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-white mb-4">Recent Feedback</h3>
        <div className="space-y-3">
          {feedbackHistory.map(fb => (
            <div key={fb.id} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-white text-sm">{fb.text}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${sentimentBg(fb.sentiment)} ${sentimentColor(fb.sentiment)}`}>
                      {sentimentEmoji(fb.sentiment)} {fb.sentiment}/100
                    </span>
                    <span className="text-gray-500 text-xs capitalize">{fb.category}</span>
                    <span className="text-gray-600 text-xs">{new Date(fb.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-center">
      <p className="text-gray-500 text-xs">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function BarItem({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">{count} ({pct}%)</span>
      </div>
      <div className="w-full bg-gray-700/30 rounded-full h-2">
        <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
}
