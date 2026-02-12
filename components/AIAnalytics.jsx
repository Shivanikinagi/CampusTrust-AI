/**
 * CampusTrust AI - AI Analytics Dashboard Component
 * =====================================================
 * Comprehensive AI analytics and automation dashboard.
 * Shows system-wide insights, automation rules, and AI metrics.
 */

import React, { useState, useEffect } from 'react';

export default function AIAnalytics({ walletAddress }) {
  const [automationData, setAutomationData] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    loadAutomationDashboard();
  }, []);

  const loadAutomationDashboard = async () => {
    try {
      const resp = await fetch('http://localhost:5001/api/ai/automation/dashboard');
      if (resp.ok) {
        setAutomationData(await resp.json());
      }
    } catch {
      // Use fallback data
      setAutomationData({
        total_rules: 6,
        active_rules: 6,
        rules: [
          { name: 'auto_finalize_election', trigger: 'event', enabled: true, last_executed: null },
          { name: 'auto_close_feedback_threshold', trigger: 'threshold', enabled: true, last_executed: null },
          { name: 'auto_flag_attendance_anomaly', trigger: 'threshold', enabled: true, last_executed: null },
          { name: 'auto_issue_credential', trigger: 'event', enabled: true, last_executed: null },
          { name: 'negative_sentiment_alert', trigger: 'threshold', enabled: true, last_executed: null },
          { name: 'auto_end_session', trigger: 'event', enabled: true, last_executed: null },
        ],
        recent_executions: [],
      });
    }
  };

  // Demo analytics data
  const analytics = {
    voting: { totalElections: 3, totalVotes: 342, avgParticipation: 78 },
    credentials: { totalIssued: 156, verified: 148, revoked: 3 },
    feedback: { totalFeedback: 89, avgSentiment: 62, responseRate: 85 },
    attendance: { totalSessions: 45, avgAttendance: 82, anomaliesDetected: 7 },
  };

  const aiMetrics = {
    sentimentAnalyses: 245,
    anomalyScans: 89,
    proposalScores: 34,
    credentialChecks: 156,
    automationTriggers: 18,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">🧠 AI Analytics Dashboard</h1>
        <p className="text-gray-400">Real-time insights and automation for campus governance</p>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1 mb-8 bg-gray-800/50 rounded-lg p-1 max-w-lg">
        {['overview', 'automation', 'insights'].map(sec => (
          <button
            key={sec}
            onClick={() => setActiveSection(sec)}
            className={`flex-1 py-2 rounded-md text-sm font-medium capitalize transition-all ${
              activeSection === sec
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {sec === 'overview' ? '📊 Overview' : sec === 'automation' ? '🤖 Automation' : '💡 Insights'}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeSection === 'overview' && (
        <>
          {/* AI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
            <MetricCard label="Sentiment Analyses" value={aiMetrics.sentimentAnalyses} icon="💬" color="from-orange-500 to-amber-500" />
            <MetricCard label="Anomaly Scans" value={aiMetrics.anomalyScans} icon="🔍" color="from-red-500 to-pink-500" />
            <MetricCard label="Proposal Scores" value={aiMetrics.proposalScores} icon="📋" color="from-purple-500 to-indigo-500" />
            <MetricCard label="Credential Checks" value={aiMetrics.credentialChecks} icon="📜" color="from-emerald-500 to-green-500" />
            <MetricCard label="Auto Triggers" value={aiMetrics.automationTriggers} icon="⚡" color="from-cyan-500 to-blue-500" />
          </div>

          {/* Module Statistics */}
          <h2 className="text-xl font-bold text-white mb-4">Module Statistics</h2>
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            {/* Voting Stats */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🗳️</span>
                <h3 className="text-white font-bold">Voting System</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-500 text-xs">Elections</p>
                  <p className="text-xl font-bold text-purple-300">{analytics.voting.totalElections}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Total Votes</p>
                  <p className="text-xl font-bold text-white">{analytics.voting.totalVotes}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Participation</p>
                  <p className="text-xl font-bold text-cyan-300">{analytics.voting.avgParticipation}%</p>
                </div>
              </div>
            </div>

            {/* Credential Stats */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">📜</span>
                <h3 className="text-white font-bold">Credentials</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-500 text-xs">Issued</p>
                  <p className="text-xl font-bold text-emerald-300">{analytics.credentials.totalIssued}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Verified</p>
                  <p className="text-xl font-bold text-white">{analytics.credentials.verified}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Revoked</p>
                  <p className="text-xl font-bold text-red-400">{analytics.credentials.revoked}</p>
                </div>
              </div>
            </div>

            {/* Feedback Stats */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">💬</span>
                <h3 className="text-white font-bold">Feedback</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-500 text-xs">Responses</p>
                  <p className="text-xl font-bold text-orange-300">{analytics.feedback.totalFeedback}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Avg Sentiment</p>
                  <p className={`text-xl font-bold ${analytics.feedback.avgSentiment > 60 ? 'text-green-400' : analytics.feedback.avgSentiment < 40 ? 'text-red-400' : 'text-yellow-400'}`}>
                    {analytics.feedback.avgSentiment}/100
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Response Rate</p>
                  <p className="text-xl font-bold text-cyan-300">{analytics.feedback.responseRate}%</p>
                </div>
              </div>
            </div>

            {/* Attendance Stats */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">✅</span>
                <h3 className="text-white font-bold">Attendance</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-500 text-xs">Sessions</p>
                  <p className="text-xl font-bold text-blue-300">{analytics.attendance.totalSessions}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Avg Rate</p>
                  <p className="text-xl font-bold text-white">{analytics.attendance.avgAttendance}%</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Anomalies</p>
                  <p className="text-xl font-bold text-red-400">{analytics.attendance.anomaliesDetected}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Automation */}
      {activeSection === 'automation' && (
        <div>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-2">🤖 Smart Automation Engine</h3>
            <p className="text-gray-400 text-sm mb-4">
              AI-driven automation rules that trigger smart contract actions based on conditions.
              These rules run automatically to maintain campus governance integrity.
            </p>
            <div className="flex gap-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2">
                <p className="text-green-400 text-lg font-bold">{automationData?.active_rules || 0}</p>
                <p className="text-gray-500 text-xs">Active Rules</p>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-4 py-2">
                <p className="text-cyan-300 text-lg font-bold">{automationData?.total_rules || 0}</p>
                <p className="text-gray-500 text-xs">Total Rules</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {(automationData?.rules || []).map((rule, i) => (
              <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    rule.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'
                  }`}>
                    {rule.trigger === 'event' ? '📡' : rule.trigger === 'threshold' ? '📊' : '⏰'}
                  </div>
                  <div>
                    <p className="text-white font-medium">{formatRuleName(rule.name)}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs capitalize">Trigger: {rule.trigger}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        rule.enabled ? 'bg-green-500/10 text-green-400' : 'bg-gray-700 text-gray-500'
                      }`}>
                        {rule.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-xs">
                    {rule.last_executed
                      ? `Last: ${new Date(rule.last_executed * 1000).toLocaleString()}`
                      : 'Never triggered'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      {activeSection === 'insights' && (
        <div className="space-y-6">
          <InsightCard
            icon="🧠"
            title="AI-Blockchain Integration"
            description="CampusTrust AI combines on-chain smart contracts with off-chain AI processing. Sentiment scores, anomaly flags, and credential verification scores are computed by AI and stored on the Algorand blockchain for transparency."
            color="from-purple-500 to-indigo-500"
          />
          <InsightCard
            icon="🔒"
            title="Privacy-Preserving Design"
            description="Feedback text is never stored on-chain. Only SHA-256 hashes are recorded on Algorand, ensuring privacy while maintaining verifiability. AI analysis runs server-side with aggregate results published."
            color="from-cyan-500 to-blue-500"
          />
          <InsightCard
            icon="⚡"
            title="Algorand Advantages"
            description="Near-instant finality (~3.5s), negligible transaction fees (~0.001 ALGO), carbon-negative blockchain. Perfect for high-frequency campus operations like attendance tracking and voting."
            color="from-emerald-500 to-green-500"
          />
          <InsightCard
            icon="🤖"
            title="Smart Automation"
            description="Event-driven and threshold-based automation rules trigger smart contract actions automatically. Elections auto-finalize, feedback auto-closes, and anomalies are auto-flagged — reducing manual overhead."
            color="from-orange-500 to-amber-500"
          />
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, icon, color }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-center">
      <div className={`inline-flex w-10 h-10 bg-gradient-to-br ${color} rounded-lg items-center justify-center text-lg mb-2`}>
        {icon}
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-gray-500 text-xs">{label}</p>
    </div>
  );
}

function InsightCard({ icon, title, description, color }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-xl`}>
          {icon}
        </div>
        <h3 className="text-white font-bold text-lg">{title}</h3>
      </div>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function formatRuleName(name) {
  return name
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
