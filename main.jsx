/**
 * React Entry Point - main.jsx
 * Used with Vite or similar bundlers
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './src/index.css'

// Error boundary to catch and display runtime crashes
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('App crashed:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return React.createElement('div', {
        style: { padding: '40px', color: '#ff6b6b', background: '#1a1a2e', minHeight: '100vh', fontFamily: 'monospace' }
      },
        React.createElement('h1', null, '⚠️ App Runtime Error'),
        React.createElement('pre', { style: { marginTop: '20px', padding: '20px', background: '#0d1117', borderRadius: '8px', overflow: 'auto', color: '#f0f0f0' } },
          this.state.error?.message || 'Unknown error'
        ),
        React.createElement('pre', { style: { marginTop: '10px', padding: '20px', background: '#0d1117', borderRadius: '8px', overflow: 'auto', color: '#888', fontSize: '12px' } },
          this.state.error?.stack || ''
        ),
        React.createElement('button', {
          onClick: () => window.location.reload(),
          style: { marginTop: '20px', padding: '10px 20px', background: '#4ecdc4', color: '#1a1a2e', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
        }, '🔄 Reload Page')
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(ErrorBoundary, null,
    React.createElement(React.StrictMode, null,
      React.createElement(App)
    )
  )
)
