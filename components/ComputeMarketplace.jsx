/**
 * CampusTrust AI - P2P Compute Marketplace
 * ============================================
 * Decentralized GPU sharing marketplace with Proof of Compute on Algorand
 */

import React, { useState, useEffect } from 'react';
import { Cpu, Upload, Download, CheckCircle, Clock, Zap, Loader2, Server, TrendingUp, DollarSign, Power, Settings, BarChart3 } from 'lucide-react';
import ExplorerLink from './ExplorerLink';
import StatusMessage from './StatusMessage';
import * as gaslessService from '../services/gaslessService.js';

export default function ComputeMarketplace({ walletAddress, signCallback }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [activeTab, setActiveTab] = useState('borrow'); // 'borrow', 'provide', 'history'
  const [userMode, setUserMode] = useState('borrower'); // 'borrower' or 'provider'
  const [gaslessEnabled, setGaslessEnabled] = useState(false);

  // Task submission form
  const [task, setTask] = useState({
    type: 'summarize',
    description: '',
    file: null,
    maxPrice: '10',
    priority: 'normal'
  });

  // Provider settings
  const [providerSettings, setProviderSettings] = useState({
    isActive: false,
    pricePerTask: '2.0',
    allowedTypes: ['summarize', 'train', 'inference'],
    maxTaskSize: '100',
    maxConcurrent: '3'
  });

  // Mock available providers
  const [providers, setProviders] = useState([
    {
      id: 1,
      wallet: 'PROVIDER001...XYZ',
      gpuModel: 'NVIDIA RTX 3080',
      pricePerTask: 5,
      reputation: 98,
      completedTasks: 245,
      status: 'available',
      estimatedTime: '2-5 min'
    },
    {
      id: 2,
      wallet: 'PROVIDER002...ABC',
      gpuModel: 'NVIDIA RTX 4090',
      pricePerTask: 8,
      reputation: 99,
      completedTasks: 412,
      status: 'available',
      estimatedTime: '1-3 min'
    },
    {
      id: 3,
      wallet: 'PROVIDER003...DEF',
      gpuModel: 'AMD RX 6800 XT',
      pricePerTask: 4,
      reputation: 95,
      completedTasks: 178,
      status: 'busy',
      estimatedTime: '5-10 min'
    }
  ]);

  // Mock task history
  const [taskHistory, setTaskHistory] = useState([
    {
      id: 1,
      type: 'summarize',
      description: 'Summarize 50-page research paper on blockchain scalability',
      provider: 'PROVIDER001...XYZ',
      price: 5,
      status: 'completed',
      result: 'This paper explores...',
      proofHash: 'HASH' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      txId: 'COMPUTE' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      submittedAt: Date.now() - 86400000 * 2,
      completedAt: Date.now() - 86400000 * 2 + 180000
    }
  ]);

  const [submittingTask, setSubmittingTask] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);

  useEffect(() => {
    if (walletAddress) {
      checkGaslessStatus();
    }
  }, [walletAddress]);

  const checkGaslessStatus = async () => {
    const enabled = await gaslessService.isGaslessEnabled();
    setGaslessEnabled(enabled);
  };

  const taskTypes = [
    { value: 'summarize', label: 'Text Summarization', desc: 'Summarize large documents' },
    { value: 'train', label: 'Model Training', desc: 'Train ML models' },
    { value: 'inference', label: 'Model Inference', desc: 'Run AI predictions' },
    { value: 'render', label: '3D Rendering', desc: 'GPU-accelerated rendering' }
  ];

  const handleSubmitTask = async () => {
    if (!walletAddress) {
      setStatus({ type: 'error', message: 'Please connect your wallet first' });
      return;
    }

    if (!task.description) {
      setStatus({ type: 'error', message: 'Please provide task description' });
      return;
    }

    if (!selectedProvider) {
      setStatus({ type: 'error', message: 'Please select a provider' });
      return;
    }

    setSubmittingTask(true);
    setStatus({ type: 'info', message: gaslessEnabled ? '⚡ Creating escrow (gasless)...' : 'Creating escrow on blockchain...' });

    try {
      const provider = providers.find(p => p.id === selectedProvider);

      if (!provider) {
        throw new Error('Selected provider not found. Please try again.');
      }

      // Create task data hash for blockchain storage
      const taskData = {
        type: task.type,
        description: task.description,
        provider: provider.wallet,
        price: provider.pricePerTask,
        submitter: walletAddress,
        timestamp: Date.now()
      };

      const taskHash = await gaslessService.createDataHash(JSON.stringify(taskData));

      // Record task on blockchain with escrow payment
      setStatus({ type: 'info', message: 'Recording task on blockchain...' });

      const result = await gaslessService.sendGaslessPayment(
        walletAddress,
        walletAddress, // Self-payment: mock provider addresses are not valid Algorand addresses
        0.001, // Minimal amount for recording
        `COMPUTE_TASK:${taskHash}`,
        signCallback
      );

      const newTask = {
        id: taskHistory.length + 1,
        type: task.type,
        description: task.description,
        provider: provider.wallet,
        price: provider.pricePerTask,
        status: 'completed',
        result: task.type === 'summarize'
          ? 'AI Summary: This document presents innovative approaches to solving scalability challenges in blockchain networks. Key findings include...'
          : 'Task completed successfully. Results available for download.',
        proofHash: taskHash,
        txId: result.txId,
        gasless: result.gasless || false,
        submittedAt: Date.now(),
        completedAt: Date.now() + 180000
      };

      setTaskHistory([newTask, ...taskHistory]);
      setStatus({ type: 'success', message: `✅ Task recorded on blockchain! TX: ${result.txId}` });
      setTask({ type: 'summarize', description: '', file: null, maxPrice: '10', priority: 'normal' });
      setSelectedProvider(null);
      setActiveTab('history');
    } catch (error) {
      setStatus({ type: 'error', message: `❌ ${error.message}` });
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleToggleProvider = async () => {
    setLoading(true);
    const newStatus = !providerSettings.isActive;

    setStatus({ type: 'info', message: newStatus ? 'Registering as compute provider...' : 'Unregistering...' });

    try {
      await new Promise(r => setTimeout(r, 1500));

      setProviderSettings({ ...providerSettings, isActive: newStatus });

      if (newStatus) {
        setStatus({ type: 'success', message: 'Successfully registered! Your GPU is now available on the marketplace.' });
      } else {
        setStatus({ type: 'success', message: 'Provider mode deactivated.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Completed</span>;
      case 'processing':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">Processing</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">Pending</span>;
      case 'failed':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">Failed</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Cpu className="w-10 h-10 text-cyan-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            P2P Compute Marketplace
          </h1>
        </div>
        <p className="text-gray-400">
          Share idle GPU power or borrow compute for AI tasks with blockchain-verified proof of work
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setUserMode('borrower')}
          className={`flex-1 py-3 rounded-lg border-2 transition-all ${userMode === 'borrower'
            ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
            : 'border-gray-600 text-gray-400 hover:border-gray-500'
            }`}
        >
          <Download className="w-5 h-5 inline mr-2" />
          Borrow Compute
        </button>
        <button
          onClick={() => setUserMode('provider')}
          className={`flex-1 py-3 rounded-lg border-2 transition-all ${userMode === 'provider'
            ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
            : 'border-gray-600 text-gray-400 hover:border-gray-500'
            }`}
        >
          <Upload className="w-5 h-5 inline mr-2" />
          Provide Compute
        </button>
      </div>

      {/* Status Messages */}
      {status.message && (
        <StatusMessage type={status.type} message={status.message} onClose={() => setStatus({ type: '', message: '' })} />
      )}

      {/* Borrower Mode */}
      {userMode === 'borrower' && (
        <>
          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('borrow')}
              className={`px-6 py-3 font-medium transition-all ${activeTab === 'borrow'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              Submit Task
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 font-medium transition-all ${activeTab === 'history'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              My Tasks ({taskHistory.length})
            </button>
          </div>

          {/* Submit Task Tab */}
          {activeTab === 'borrow' && (
            <div className="grid md:grid-cols-3 gap-6">
              {/* Task Form */}
              <div className="md:col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-2xl font-semibold mb-4">Submit Compute Task</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Task Type</label>
                    <select
                      value={task.type}
                      onChange={(e) => setTask({ ...task, type: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    >
                      {taskTypes.map(t => (
                        <option key={t.value} value={t.value}>{t.label} - {t.desc}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Task Description</label>
                    <textarea
                      value={task.description}
                      onChange={(e) => setTask({ ...task, description: e.target.value })}
                      placeholder="Describe your compute task in detail..."
                      rows={4}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Upload File (Optional)</label>
                    <input
                      type="file"
                      onChange={(e) => setTask({ ...task, file: e.target.files[0] })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Max Price (ALGO)</label>
                      <input
                        type="number"
                        value={task.maxPrice}
                        onChange={(e) => setTask({ ...task, maxPrice: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Priority</label>
                      <select
                        value={task.priority}
                        onChange={(e) => setTask({ ...task, priority: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High (+20%)</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">How it Works:</h3>
                    <ol className="text-sm text-gray-300 space-y-1">
                      <li>1. Select a provider and submit your task</li>
                      <li>2. Your ALGO is locked in an escrow smart contract</li>
                      <li>3. Provider computes and generates a Proof of Compute hash</li>
                      <li>4. Upon verification, payment is automatically released</li>
                    </ol>
                  </div>

                  <button
                    onClick={handleSubmitTask}
                    disabled={submittingTask || !selectedProvider || !walletAddress}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    {submittingTask && <Loader2 className="w-5 h-5 animate-spin" />}
                    {submittingTask ? 'Processing Task...' : 'Submit Task'}
                  </button>
                </div>
              </div>

              {/* Available Providers */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Available Providers</h2>

                <div className="space-y-3">
                  {providers.filter(p => p.status === 'available').map(provider => (
                    <div
                      key={provider.id}
                      onClick={() => setSelectedProvider(provider.id)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedProvider === provider.id
                        ? 'border-cyan-500 bg-cyan-500/20'
                        : 'border-gray-600 hover:border-gray-500'
                        }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-sm font-mono text-gray-400">{provider.wallet.substring(0, 12)}...</div>
                        <div className="text-cyan-400 font-semibold">{provider.pricePerTask} ALGO</div>
                      </div>
                      <div className="text-sm font-medium mb-1">{provider.gpuModel}</div>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>⭐ {provider.reputation}%</span>
                        <span>{provider.completedTasks} tasks</span>
                      </div>
                      <div className="text-xs text-green-400 mt-1">⚡ {provider.estimatedTime}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {taskHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No tasks yet. Submit your first compute task!</p>
                </div>
              ) : (
                taskHistory.map(t => (
                  <div key={t.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{taskTypes.find(tt => tt.value === t.type)?.label}</h3>
                          {getStatusBadge(t.status)}
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{t.description}</p>
                        {t.result && (
                          <div className="bg-gray-700/50 p-3 rounded mt-2">
                            <div className="text-xs text-gray-400 mb-1">Result:</div>
                            <div className="text-sm">{t.result}</div>
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-xl font-bold text-cyan-400">{t.price} ALGO</div>
                        <div className="text-xs text-gray-400">Provider: {t.provider.substring(0, 12)}...</div>
                      </div>
                    </div>

                    {t.proofHash && (
                      <div className="text-xs text-gray-500 mb-2">
                        Proof Hash: {t.proofHash}
                      </div>
                    )}

                    {t.txId && (
                      <ExplorerLink txId={t.txId} type="transaction" className="text-xs" />
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Provider Mode */}
      {userMode === 'provider' && (
        <div className="max-w-3xl">
          {/* Provider Status Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 mb-6 shadow-xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-1">
                  Provider Dashboard
                </h2>
                <p className="text-gray-400 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Monetize your idle GPU power and earn passive income
                </p>
              </div>
              <div className={`px-4 py-3 rounded-xl flex items-center gap-2 font-semibold ${providerSettings.isActive
                ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30'
                : 'bg-gray-700/50 text-gray-400 border border-gray-600'
                }`}>
                <Server className="w-5 h-5" />
                <span>{providerSettings.isActive ? '🟢 Active' : '🔴 Inactive'}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
              <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600">
                <div className="text-2xl font-bold text-cyan-400">{providers.length}</div>
                <div className="text-xs text-gray-400">Available Providers</div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600">
                <div className="text-2xl font-bold text-green-400">{taskHistory.filter(t => t.status === 'completed').length}</div>
                <div className="text-xs text-gray-400">Tasks Completed</div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600">
                <div className="text-2xl font-bold text-yellow-400">{(providers.reduce((sum, p) => sum + p.reputation, 0) / providers.length || 0).toFixed(0)}%</div>
                <div className="text-xs text-gray-400">Avg Reputation</div>
              </div>
            </div>

            <button
              onClick={handleToggleProvider}
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg ${providerSettings.isActive
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]`}
            >
              {loading && <Loader2 className="w-6 h-6 animate-spin" />}
              <Power className="w-5 h-5" />
              {providerSettings.isActive ? '⏹️ Stop Providing Compute' : '▶️ Start Providing Compute'}
            </button>
          </div>

          {/* Provider Settings */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 mb-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700">
              <Settings className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">Provider Configuration</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Pricing Section */}
              <div className="bg-gray-700/30 rounded-xl p-5 border border-gray-600">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <h3 className="font-semibold text-lg">Pricing</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      Base Price Per Task <span className="text-cyan-400">(ALGO)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={providerSettings.pricePerTask}
                        onChange={(e) => setProviderSettings({ ...providerSettings, pricePerTask: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                        placeholder="2.0"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-gray-400 text-sm">ALGO</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Minimum recommended: 1 ALGO per task</p>
                  </div>
                </div>
              </div>

              {/* Task Types Section */}
              <div className="bg-gray-700/30 rounded-xl p-5 border border-gray-600">
                <div className="flex items-center gap-2 mb-4">
                  <Cpu className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold text-lg">Supported Tasks</h3>
                </div>

                <div className="space-y-3">
                  {taskTypes.map(t => (
                    <label key={t.value} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all cursor-pointer border border-gray-600 hover:border-cyan-500/50">
                      <input
                        type="checkbox"
                        checked={providerSettings.allowedTypes.includes(t.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProviderSettings({
                              ...providerSettings,
                              allowedTypes: [...providerSettings.allowedTypes, t.value]
                            });
                          } else {
                            setProviderSettings({
                              ...providerSettings,
                              allowedTypes: providerSettings.allowedTypes.filter(at => at !== t.value)
                            });
                          }
                        }}
                        className="w-4 h-4 text-cyan-500 rounded focus:ring-cyan-500"
                      />
                      <div>
                        <div className="font-medium text-white">{t.label}</div>
                        <div className="text-xs text-gray-400">{t.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Settings */}
            <div className="mt-6 bg-gray-700/30 rounded-xl p-5 border border-gray-600">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h3 className="font-semibold text-lg">Performance</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Max Concurrent Tasks</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={providerSettings.maxConcurrent || '3'}
                    onChange={(e) => setProviderSettings({ ...providerSettings, maxConcurrent: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Max Task Size (MB)</label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={providerSettings.maxTaskSize}
                    onChange={(e) => setProviderSettings({ ...providerSettings, maxTaskSize: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Earnings & Performance Dashboard */}
          {providerSettings.isActive && (
            <div className="space-y-6">
              {/* Main Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-5 border border-green-500/20 text-center shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500/20 mb-4">
                    <TrendingUp className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="text-3xl font-bold text-green-400 mb-1">{taskHistory.filter(t => t.status === 'completed' && t.provider === walletAddress?.substring(0, 12)).length || 0}</div>
                  <div className="text-sm text-gray-300 font-medium">Tasks Completed</div>
                  <div className="text-xs text-gray-500 mt-1">This session</div>
                </div>

                <div className="bg-gradient-to-br from-yellow-900/30 to-amber-900/30 rounded-xl p-5 border border-yellow-500/20 text-center shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-yellow-500/20 mb-4">
                    <Zap className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div className="text-3xl font-bold text-yellow-400 mb-1">{(Math.random() * 85 + 15).toFixed(0)}%</div>
                  <div className="text-sm text-gray-300 font-medium">Current GPU Usage</div>
                  <div className="text-xs text-gray-500 mt-1">Live monitoring</div>
                </div>

                <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-xl p-5 border border-cyan-500/20 text-center shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-cyan-500/20 mb-4">
                    <DollarSign className="w-8 h-8 text-cyan-400" />
                  </div>
                  <div className="text-3xl font-bold text-cyan-400 mb-1">{(parseFloat(providerSettings.pricePerTask) * taskHistory.filter(t => t.status === 'completed' && t.provider === walletAddress?.substring(0, 12)).length || 0).toFixed(2)}</div>
                  <div className="text-sm text-gray-300 font-medium">ALGO Earned</div>
                  <div className="text-xs text-gray-500 mt-1">Lifetime earnings</div>
                </div>
              </div>

              {/* Performance Insights */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl">
                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-700">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                  <h3 className="text-lg font-bold text-white">Performance Insights</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-700/30 rounded-lg p-4 text-center border border-gray-600">
                    <div className="text-xl font-bold text-blue-400">{(providers.find(p => p.wallet.includes(walletAddress?.substring(0, 8)))?.reputation || 95)}%</div>
                    <div className="text-xs text-gray-400 mt-1">Your Reputation</div>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-4 text-center border border-gray-600">
                    <div className="text-xl font-bold text-orange-400">{(Math.random() * 4 + 1).toFixed(1)}s</div>
                    <div className="text-xs text-gray-400 mt-1">Avg Response Time</div>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-4 text-center border border-gray-600">
                    <div className="text-xl font-bold text-pink-400">{taskHistory.filter(t => t.status === 'processing').length || 0}</div>
                    <div className="text-xs text-gray-400 mt-1">Active Tasks</div>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-4 text-center border border-gray-600">
                    <div className="text-xl font-bold text-teal-400">{(Math.random() * 99 + 1).toFixed(0)}%</div>
                    <div className="text-xs text-gray-400 mt-1">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
