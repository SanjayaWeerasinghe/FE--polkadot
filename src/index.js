// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// 1. Bring in your providers:
import { WalletProvider } from './contexts/WalletContext';
import { BlockchainProvider } from './contexts/BlockchainContext';
import { AuthProvider } from './contexts/AuthContext';

// 2. Optional but highly recommended: catch render errors at the top:
import ErrorBoundary from './components/ErrorBoundary';

// 3. Your global styles (Tailwind, etc)
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <WalletProvider>
          <BlockchainProvider>
            <App />
          </BlockchainProvider>
        </WalletProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
);
