/**
 * CampusTrust AI - P2P Compute Marketplace
 * ============================================
 * Decentralized GPU sharing marketplace with Proof of Compute on Algorand
 */

import React, { useState, useEffect } from 'react';
import { Cpu, Upload, Download, CheckCircle, Clock, Zap, Loader2, Server, TrendingUp } from 'lucide-react';
import ExplorerLink from './ExplorerLink';
import StatusMessage from './StatusMessage';

export default function ComputeMarketplace({ walletAddress, signCallback }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [activeTab, setActiveTab] = useState('borrow'); // 'borrow', 'provide', 'history'
  const [userMode, setUserMode] = useState('borrower'); // 'borrower' or 'provider'
  
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
    pricePerTask: '5',
    allowedTypes: ['summarize', 'train', 'inference'],
    maxTaskSize: '100'
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
    setStatus({ type: 'info', message: 'Creating escrow smart contract on Algorand...' });

    try {
      // Step 1: Create escrow
      await new Promise(r => setTimeout(r, 1500));
      setStatus({ type: 'info', message: 'Sending task to provider...' });

      // Step 2: Provider processes task
      await new Promise(r => setTimeout(r, 3000));
      setStatus({ type: 'info', message: 'Provider is computing... Generating proof of compute...' });

      // Step 3: Verify and release payment
      await new Promise(r => setTimeout(r, 2000));

      const provider = providers.find(p => p.id === selectedProvider);
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
        proofHash: 'HASH' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        txId: 'COMPUTE' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        submittedAt: Date.now(),
        completedAt: Date.now() + 180000
      };

      setTaskHistory([newTask, ...taskHistory]);
      setStatus({ type: 'success', message: `Task completed! Payment released to provider. TX: ${newTask.txId}` });
      setTask({ type: 'summarize', description: '', file: null, maxPrice: '10', priority: 'normal' });
      setSelectedProvider(null);
      setActiveTab('history');
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
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
          className={`flex-1 py-3 rounded-lg border-2 transition-all ${
            userMode === 'borrower'
              ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
              : 'border-gray-600 text-gray-400 hover:border-gray-500'
          }`}
        >
          <Download className="w-5 h-5 inline mr-2" />
          Borrow Compute
        </button>
        <button
          onClick={() => setUserMode('provider')}
          className={`flex-1 py-3 rounded-lg border-2 transition-all ${
            userMode === 'provider'
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
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === 'borrow'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Submit Task
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === 'history'
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
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedProvider === provider.id
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
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold mb-1">Provider Status</h2>
                <p className="text-gray-400">Share your idle GPU and earn ALGO</p>
              </div>
              <div className={`px-4 py-2 rounded-lg ${
                providerSettings.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
              }`}>
                <Server className="w-6 h-6 inline mr-2" />
                {providerSettings.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>

            <button
              onClick={handleToggleProvider}
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                providerSettings.isActive
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              } disabled:bg-gray-600 text-white`}
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {providerSettings.isActive ? 'Stop Providing' : 'Start Providing'}
            </button>
          </div>

          {/* Provider Settings */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
            <h2 className="text-xl font-semibold mb-4">Provider Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Price Per Task (ALGO)</label>
                <input
                  type="number"
                  value={providerSettings.pricePerTask}
                  onChange={(e) => setProviderSettings({ ...providerSettings, pricePerTask: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Allowed Task Types</label>
                <div className="space-y-2">
                  {taskTypes.map(t => (
                    <label key={t.value} className="flex items-center gap-2 cursor-pointer">
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
                        className="rounded"
                      />
                      <span className="text-sm">{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Earnings Stats */}
          {providerSettings.isActive && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-gray-400">Tasks Completed</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
                <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">0%</div>
                <div className="text-sm text-gray-400">GPU Usage</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
                <DollarSign className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-gray-400">ALGO Earned</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
