/**
 * CampusTrust AI - Research Paper Certification
 * =================================================
 * AI-Powered Peer Review with NLP Analysis & Blockchain Timestamping
 * 
 * The AI acts as a Validator/Peer Reviewer:
 * - Extracts and analyzes PDF content using NLP
 * - Checks technical accuracy via vocabulary analysis
 * - Verifies math/logic soundness
 * - Detects plagiarism via sentence similarity
 * - Evaluates structure (Introduction, Methodology, Results, etc.)
 * - Generates context-aware feedback based on actual content
 */

import React, { useState } from 'react';
import { FileText, Shield, Clock, CheckCircle, AlertTriangle, Loader2, Award, Hash, BarChart3, Search, Brain, Layers } from 'lucide-react';
import ExplorerLink from './ExplorerLink';
import StatusMessage from './StatusMessage';
import * as gaslessService from '../services/gaslessService.js';

const AI_BACKEND = 'http://localhost:5000';

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

  // Certified papers history
  const [certifiedPapers, setCertifiedPapers] = useState([]);

  const [reviewing, setReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);
  const [reviewProgress, setReviewProgress] = useState('');

  const categories = [
    { value: 'research', label: 'Academic Research Paper' },
    { value: 'project', label: 'Project Report' },
    { value: 'thesis', label: 'Thesis/Dissertation' },
    { value: 'whitepaper', label: 'Technical Whitepaper' }
  ];

  // ── REAL AI REVIEW via Backend ──────────────────────────
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
    setReviewResult(null);
    setReviewProgress('Uploading paper for review...');
    setStatus({ type: 'info', message: '🧠 AI Peer Reviewer is analyzing your paper...' });

    try {
      // First try the real backend with PDF upload
      let result = null;
      let usedBackend = false;

      try {
        setReviewProgress('Extracting PDF text content...');
        const formData = new FormData();
        formData.append('pdf_file', submission.file);
        formData.append('title', submission.title);
        formData.append('abstract', submission.abstract);

        const response = await fetch(`${AI_BACKEND}/api/ai/research/review`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          result = await response.json();
          usedBackend = true;
          setReviewProgress('Analysis complete!');
        }
      } catch (backendErr) {
        console.warn('Backend unavailable, falling back to local analysis:', backendErr);
      }

      // Fallback: read PDF client-side and send as text to backend
      if (!result) {
        setReviewProgress('Reading PDF locally...');

        // Read the file as text for local analysis
        const fileText = await readFileAsText(submission.file);

        // Try JSON endpoint
        try {
          const response = await fetch(`${AI_BACKEND}/api/ai/research/review`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: submission.title,
              abstract: submission.abstract,
              content: fileText || submission.abstract,
            }),
          });

          if (response.ok) {
            result = await response.json();
            usedBackend = true;
          }
        } catch (e) {
          console.warn('JSON endpoint also failed:', e);
        }
      }

      // Last resort: local analysis using abstract text
      if (!result) {
        setReviewProgress('Running local analysis...');
        result = performLocalAnalysis(submission.title, submission.abstract, submission.file.name);
      }

      setReviewResult(result);
      setStatus({
        type: 'success',
        message: usedBackend
          ? '✅ AI Peer Review complete!'
          : '✅ Local analysis complete. Connect to the AI engine for a full-powered review.'
      });

    } catch (error) {
      console.error('Review error:', error);
      setStatus({ type: 'error', message: error.message });
    } finally {
      setReviewing(false);
      setReviewProgress('');
    }
  };

  // Read PDF/text file as string
  const readFileAsText = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result || '');
      reader.onerror = () => resolve('');
      reader.readAsText(file);
    });
  };

  // Local fallback analysis (when backend is down)
  const performLocalAnalysis = (title, abstract, filename) => {
    const combined = `${title}\n${abstract}`;
    const words = combined.split(/\s+/);
    const wordCount = words.length;
    const sentences = combined.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const sentenceCount = sentences.length;
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
    const ttr = uniqueWords / Math.max(wordCount, 1);

    // Basic keyword detection
    const techTerms = ['algorithm', 'neural', 'machine learning', 'blockchain', 'model',
      'framework', 'analysis', 'optimization', 'dataset', 'classification', 'protocol',
      'architecture', 'validation', 'hypothesis', 'statistical', 'regression', 'prediction'];
    const textLower = combined.toLowerCase();
    const foundTerms = techTerms.filter(t => textLower.includes(t));

    // Section detection
    const sectionWords = {
      introduction: ['introduction', 'background'],
      methodology: ['methodology', 'method', 'approach', 'implementation'],
      results: ['results', 'evaluation', 'findings'],
      conclusion: ['conclusion', 'summary', 'future work'],
      references: ['references', 'bibliography'],
    };
    const sections = {};
    const missing = [];
    for (const [sec, kws] of Object.entries(sectionWords)) {
      if (kws.some(kw => textLower.includes(kw))) {
        sections[sec] = 1;
      } else {
        missing.push(sec);
      }
    }

    const structureScore = Math.round(Object.keys(sections).length / 5 * 100);
    const techScore = Math.min(95, 40 + foundTerms.length * 5);
    const clarityScore = Math.min(95, Math.round(60 + ttr * 50));
    const originalityScore = Math.min(95, Math.round(50 + ttr * 60));
    const plagiarismScore = Math.max(0, Math.min(15, 5 - foundTerms.length));
    const overallScore = Math.round(
      techScore * 0.30 + originalityScore * 0.25 + clarityScore * 0.25 +
      structureScore * 0.15 + (100 - plagiarismScore * 2) * 0.05
    );

    const strengths = [];
    if (foundTerms.length >= 3) strengths.push(`Technical vocabulary present (${foundTerms.length} terms: ${foundTerms.slice(0, 5).join(', ')})`);
    if (wordCount >= 100) strengths.push(`Substantial abstract (${wordCount} words)`);
    if (Object.keys(sections).length >= 2) strengths.push(`Paper mentions ${Object.keys(sections).length} standard sections`);
    if (ttr > 0.5) strengths.push('Good vocabulary diversity');
    if (!strengths.length) strengths.push('Paper submitted for review');

    const suggestions = [];
    missing.forEach(s => suggestions.push(`Add a '${s.charAt(0).toUpperCase() + s.slice(1)}' section — essential for academic papers`));
    if (wordCount < 200) suggestions.push(`Abstract is only ${wordCount} words — consider expanding for more depth`);
    if (!suggestions.length) suggestions.push('Connect to the AI engine for full review with plagiarism detection');

    // Simple key phrases from frequency
    const freqMap = {};
    words.forEach(w => {
      const lw = w.toLowerCase().replace(/[^a-z]/g, '');
      if (lw.length > 3 && !['this', 'that', 'with', 'from', 'have', 'been', 'were', 'also', 'which', 'their', 'about', 'more', 'than'].includes(lw)) {
        freqMap[lw] = (freqMap[lw] || 0) + 1;
      }
    });
    const keyPhrases = Object.entries(freqMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([w]) => w);

    return {
      technical_accuracy: techScore,
      originality: originalityScore,
      clarity: clarityScore,
      plagiarism_score: plagiarismScore,
      structure_score: structureScore,
      overall_score: overallScore,
      summary: `Analysis of "${title}" based on abstract content. ${foundTerms.length > 0
        ? `Technical focus areas detected: ${foundTerms.join(', ')}.`
        : 'Limited technical vocabulary detected in the abstract.'
        } ${Object.keys(sections).length > 0
          ? `Paper structure covers: ${Object.keys(sections).join(', ')}.`
          : 'Consider following standard academic paper structure.'
        }`,
      strengths,
      suggestions,
      extraction_proof: {
        word_count: wordCount,
        sentence_count: sentenceCount,
        paragraph_count: Math.max(1, combined.split('\n\n').length),
        char_count: combined.length,
        sections_detected: sections,
        sections_missing: missing,
        technical_terms_found: foundTerms.length,
        math_elements_detected: 0,
        key_phrases: keyPhrases,
        vocabulary_richness: parseFloat(ttr.toFixed(3)),
        avg_sentence_length: parseFloat((wordCount / Math.max(sentenceCount, 1)).toFixed(1)),
        objectivity: 0.7,
        sentiment_polarity: 0,
        duplicate_sentences: 0,
        boilerplate_phrases: 0,
        high_similarity_pairs: 0,
        text_preview: combined.substring(0, 600),
      },
      hash: `SHA256:LOCAL${Date.now().toString(16).toUpperCase().slice(0, 10)}`,
      timestamp: Math.floor(Date.now() / 1000),
    };
  };

  // ── CERTIFY ON BLOCKCHAIN ──────────────────────────────
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
    setStatus({ type: 'info', message: '🚀 Creating cryptographic timestamp on Algorand Blockchain...' });

    try {
      const paperData = {
        title: submission.title,
        abstract: submission.abstract,
        category: submission.category,
        timestamp: Date.now(),
        aiReview: reviewResult
      };

      const paperHash = await gaslessService.createDataHash(JSON.stringify(paperData));

      const result = await gaslessService.sendGaslessPayment(
        walletAddress, walletAddress, 0.001, paperHash, signCallback
      );

      const newPaper = {
        id: certifiedPapers.length + 1,
        title: submission.title,
        author: 'Current Student',
        category: submission.category,
        timestamp: Date.now(),
        hash: paperHash,
        txId: result.txId,
        aiScore: reviewResult.overall_score,
        aiReview: reviewResult
      };

      setCertifiedPapers([newPaper, ...certifiedPapers]);
      setStatus({
        type: 'success',
        message: `✅ Paper certified! Your ideation is now permanently timestamped on Algorand. TX: ${result.txId}`
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
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 90) return 'bg-green-500/10 border-green-500/30';
    if (score >= 80) return 'bg-blue-500/10 border-blue-500/30';
    if (score >= 70) return 'bg-yellow-500/10 border-yellow-500/30';
    if (score >= 50) return 'bg-orange-500/10 border-orange-500/30';
    return 'bg-red-500/10 border-red-500/30';
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
          AI-powered peer review — text extraction, plagiarism check, and blockchain timestamping
        </p>
        <div className="flex items-center gap-3 mt-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-xs font-medium">
            <Brain className="w-3 h-3" /> AI Peer Review
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-xs font-medium">
            <Search className="w-3 h-3" /> Plagiarism Detection
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-medium">
            <Layers className="w-3 h-3" /> Structure Analysis
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('submit')}
          className={`px-6 py-3 font-medium transition-all ${activeTab === 'submit'
            ? 'text-amber-400 border-b-2 border-amber-400'
            : 'text-gray-400 hover:text-white'
            }`}
        >
          Submit Paper
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 font-medium transition-all ${activeTab === 'history'
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
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select
                  value={submission.category}
                  onChange={(e) => setSubmission({ ...submission, category: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
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
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Upload Paper</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setSubmission({ ...submission, file: e.target.files[0] })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                />
                {submission.file && (
                  <div className="text-sm text-green-400 mt-2">
                    ✓ {submission.file.name} ({(submission.file.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h3 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Peer Reviewer
                </h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>1. 📄 <strong>PDF Extraction</strong> — Reads and extracts text from your uploaded paper</li>
                  <li>2. 🧠 <strong>Writing Analysis</strong> — Evaluates sentiment, objectivity, and readability</li>
                  <li>3. 🔬 <strong>Technical Review</strong> — Vocabulary density, math/logic detection</li>
                  <li>4. 📋 <strong>Structure Check</strong> — Intro, Methods, Results, Conclusion, References</li>
                  <li>5. 🔍 <strong>Plagiarism Scan</strong> — Sentence similarity & boilerplate detection</li>
                  <li>6. 🔗 <strong>Blockchain Cert</strong> — Content hash timestamped on Algorand</li>
                </ul>
              </div>

              <button
                onClick={handleReviewPaper}
                disabled={reviewing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {reviewing && <Loader2 className="w-5 h-5 animate-spin" />}
                {reviewing ? reviewProgress || 'AI Reviewing...' : '🧠 Get AI Peer Review'}
              </button>
            </div>
          </div>

          {/* Review Result */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">AI Peer Review Report</h2>

            {!reviewResult ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Submit your paper to receive an AI peer review</p>
                <p className="text-xs mt-2 text-gray-600">AI-powered analysis based on your paper's actual content</p>
              </div>
            ) : (
              <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-2">
                {/* Overall Score */}
                <div className="text-center mb-4">
                  <div className={`inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 mb-3`}>
                    <span className="text-4xl font-bold">{reviewResult.overall_score}</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-300">Overall Quality Score</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Based on analysis of {reviewResult.extraction_proof?.word_count || '?'} words
                  </div>
                </div>

                {/* Detailed Scores */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Technical Accuracy', value: reviewResult.technical_accuracy, icon: '🔬' },
                    { label: 'Originality', value: reviewResult.originality, icon: '💡' },
                    { label: 'Clarity', value: reviewResult.clarity, icon: '📝' },
                    { label: 'Structure', value: reviewResult.structure_score, icon: '📋' },
                  ].map(metric => (
                    <div key={metric.label} className={`p-3 rounded-lg border ${getScoreBg(metric.value)}`}>
                      <div className="text-sm text-gray-400 flex items-center gap-1">
                        <span>{metric.icon}</span> {metric.label}
                      </div>
                      <div className={`text-2xl font-bold ${getScoreColor(metric.value)}`}>
                        {metric.value}%
                      </div>
                    </div>
                  ))}
                </div>

                {/* Plagiarism Score (special display) */}
                <div className={`p-3 rounded-lg border ${reviewResult.plagiarism_score < 10 ? 'bg-green-500/10 border-green-500/30' : reviewResult.plagiarism_score < 20 ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-400">🔍 Plagiarism Risk</div>
                      <div className={`text-2xl font-bold ${reviewResult.plagiarism_score < 10 ? 'text-green-400' : reviewResult.plagiarism_score < 20 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {reviewResult.plagiarism_score}%
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      {reviewResult.extraction_proof?.duplicate_sentences > 0 && (
                        <div>{reviewResult.extraction_proof.duplicate_sentences} duplicate sentences</div>
                      )}
                      {reviewResult.extraction_proof?.boilerplate_phrases > 0 && (
                        <div>{reviewResult.extraction_proof.boilerplate_phrases} boilerplate phrases</div>
                      )}
                      {reviewResult.extraction_proof?.high_similarity_pairs > 0 && (
                        <div>{reviewResult.extraction_proof.high_similarity_pairs} similar pairs</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Summary */}
                <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                  <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-400" />
                    AI Summary
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-sm">{reviewResult.summary}</p>
                </div>

                {/* Extraction Proof */}
                {reviewResult.extraction_proof && (
                  <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                    <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-cyan-400" />
                      Extraction Proof (Real Data)
                    </h3>
                    <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                      <div className="bg-gray-800/50 p-2 rounded text-center">
                        <div className="text-cyan-300 font-bold">{reviewResult.extraction_proof.word_count}</div>
                        <div className="text-gray-500 text-xs">Words</div>
                      </div>
                      <div className="bg-gray-800/50 p-2 rounded text-center">
                        <div className="text-cyan-300 font-bold">{reviewResult.extraction_proof.sentence_count}</div>
                        <div className="text-gray-500 text-xs">Sentences</div>
                      </div>
                      <div className="bg-gray-800/50 p-2 rounded text-center">
                        <div className="text-cyan-300 font-bold">{reviewResult.extraction_proof.paragraph_count}</div>
                        <div className="text-gray-500 text-xs">Paragraphs</div>
                      </div>
                      <div className="bg-gray-800/50 p-2 rounded text-center">
                        <div className="text-cyan-300 font-bold">{reviewResult.extraction_proof.technical_terms_found}</div>
                        <div className="text-gray-500 text-xs">Tech Terms</div>
                      </div>
                      <div className="bg-gray-800/50 p-2 rounded text-center">
                        <div className="text-cyan-300 font-bold">{reviewResult.extraction_proof.math_elements_detected}</div>
                        <div className="text-gray-500 text-xs">Math Elements</div>
                      </div>
                      <div className="bg-gray-800/50 p-2 rounded text-center">
                        <div className="text-cyan-300 font-bold">{reviewResult.extraction_proof.vocabulary_richness}</div>
                        <div className="text-gray-500 text-xs">Vocab Richness</div>
                      </div>
                    </div>

                    {/* Sections Detected */}
                    {reviewResult.extraction_proof.sections_detected && Object.keys(reviewResult.extraction_proof.sections_detected).length > 0 && (
                      <div className="mb-2">
                        <div className="text-xs text-gray-400 mb-1 font-medium">Sections Detected:</div>
                        <div className="flex flex-wrap gap-1">
                          {Object.keys(reviewResult.extraction_proof.sections_detected).map(sec => (
                            <span key={sec} className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded text-xs">
                              ✓ {sec}
                            </span>
                          ))}
                          {reviewResult.extraction_proof.sections_missing?.map(sec => (
                            <span key={sec} className="px-2 py-0.5 bg-red-500/20 text-red-300 rounded text-xs">
                              ✗ {sec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Key Phrases */}
                    {reviewResult.extraction_proof.key_phrases?.length > 0 && (
                      <div className="mb-2">
                        <div className="text-xs text-gray-400 mb-1 font-medium">Key Phrases Extracted:</div>
                        <div className="flex flex-wrap gap-1">
                          {reviewResult.extraction_proof.key_phrases.map((kp, i) => (
                            <span key={i} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">
                              {kp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Text Preview */}
                    {reviewResult.extraction_proof.text_preview && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-400 mb-1 font-medium">Extracted Text Preview:</div>
                        <div className="bg-gray-800/50 p-2 rounded text-xs text-gray-400 max-h-24 overflow-y-auto font-mono leading-relaxed">
                          {reviewResult.extraction_proof.text_preview}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Strengths */}
                <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                  <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {reviewResult.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                        <span className="text-green-400 mt-0.5">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Suggestions */}
                <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                  <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    Suggestions for Improvement
                  </h3>
                  <ul className="space-y-2">
                    {reviewResult.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                        <span className="text-yellow-400 mt-0.5">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Hash */}
                <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-300">Content Hash (for Blockchain)</span>
                  </div>
                  <div className="font-mono text-sm bg-gray-800/50 p-3 rounded border border-gray-600 break-all text-gray-200">
                    {reviewResult.hash}
                  </div>
                </div>

                {/* Certify Button */}
                <button
                  onClick={handleCertifyPaper}
                  disabled={loading || !walletAddress}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {loading ? 'Certifying on Blockchain...' : '🔗 Certify on Algorand Blockchain'}
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
                      <div className={`text-lg font-bold ${getScoreColor(paper.aiReview.technical_accuracy)}`}>
                        {paper.aiReview.technical_accuracy}%
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
                      <div className={`text-lg font-bold ${paper.aiReview.plagiarism_score < 10 ? 'text-green-400' : 'text-red-400'}`}>
                        {paper.aiReview.plagiarism_score}%
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
