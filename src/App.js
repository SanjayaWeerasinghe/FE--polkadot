// src/App.js - Using Your ORIGINAL BlockchainContext with flexible connection handling
import React, { useState } from 'react';
import { useWallet } from './contexts/WalletContext';
import { useBlockchain } from './contexts/BlockchainContext'; // Your ORIGINAL context

// Import modern components
import ModernNavbar from './components/Navbar';
import ModernDashboard from './pages/Dashboard';
import ModernFooter from './components/Footer';
import { ToastContainer, useToast } from './components/StatusToast';

// Import your pages (updated to use your original context)
import InitiateContract from './pages/InitiateContract';
import SignContract from './pages/SignContract';
import ViewContracts from './pages/ViewContracts';

// Error Boundary Component
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [currentPage, setCurrentPage] = useState('menu');
  const { account } = useWallet();
  const { connecting, connected, error: blockchainError, retryConnection } = useBlockchain(); // Your ORIGINAL context
  
  // Toast notifications
  const { toasts, removeToast, success, error, warning, info } = useToast();

  const handleNavigation = (page) => {
    setCurrentPage(page);
    // Show navigation feedback but don't block if no connection
    if (page !== 'menu') {
      if (!connected) {
        warning(`Navigating to ${page}. Some features may require blockchain connection.`);
      } else {
        info(`Navigating to ${page}...`);
      }
    }
  };

  const renderPage = () => {
    // Always allow access to dashboard regardless of connection
    if (currentPage === 'menu') {
      return <ModernDashboard onNavigate={handleNavigation} />;
    }

    // Wallet connection check for protected pages
    if (!account) {
      return (
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-10 shadow-lg border border-white/20 text-center animate-fadeInUp max-w-md mx-auto">
          <div className="text-6xl mb-6">🔐</div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">
            Wallet Required
          </h3>
          <p className="text-gray-600 leading-relaxed mb-6">
            Please connect your Polkadot wallet to access contract management features. 
            Your wallet is required to sign transactions and interact with the blockchain.
          </p>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
            <p className="text-sm text-blue-700">
              💡 Make sure you have the Polkadot.js extension installed and at least one account created.
            </p>
          </div>
          <button
            onClick={() => setCurrentPage('menu')}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      );
    }

    // Show blockchain connection status but don't block access
    const connectionWarning = !connected && !connecting && (
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-800 font-medium">⚠️ Blockchain Connection Issue</p>
            <p className="text-sm text-yellow-600 mt-1">
              {blockchainError || 'Unable to connect to blockchain. Some features may not work.'}
            </p>
          </div>
          <button
            onClick={retryConnection}
            className="px-4 py-2 bg-yellow-200 text-yellow-800 rounded-lg hover:bg-yellow-300 transition-colors text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );

    switch (currentPage) {
      case 'initiate':
        return (
          <div>
            {connectionWarning}
            <InitiateContract 
              onBack={() => setCurrentPage('menu')} 
              onStatus={(message, type) => {
                if (type === 'success') success(message);
                else if (type === 'error') error(message);
                else if (type === 'warning') warning(message);
                else info(message);
              }}
            />
          </div>
        );
      case 'sign':
        return (
          <div>
            {connectionWarning}
            <SignContract 
              onBack={() => setCurrentPage('menu')} 
              onStatus={(message, type) => {
                if (type === 'success') success(message);
                else if (type === 'error') error(message);
                else if (type === 'warning') warning(message);
                else info(message);
              }}
            />
          </div>
        );
      case 'view':
        return (
          <div>
            {connectionWarning}
            <ViewContracts 
              onBack={() => setCurrentPage('menu')} 
              onStatus={(message, type) => {
                if (type === 'success') success(message);
                else if (type === 'error') error(message);
                else if (type === 'warning') warning(message);
                else info(message);
              }}
            />
          </div>
        );
      default:
        return <ModernDashboard onNavigate={handleNavigation} />;
    }
  };

  // Show loading screen only briefly during initial connection attempt
  if (connecting && currentPage === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connecting to Blockchain</h2>
          <p className="text-gray-600 mb-6">Establishing connection to the network...</p>
          <button
            onClick={() => setCurrentPage('menu')}
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            Continue without waiting
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Modern Navigation */}
        <ModernNavbar 
          currentPage={currentPage}
          onNavigate={handleNavigation}
          account={account}
        />
        
        {/* Connection Status Bar (if there are issues) */}
        {currentPage === 'menu' && !connected && !connecting && blockchainError && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-yellow-800">
                  Blockchain connection issues detected. App is still functional.
                </span>
              </div>
              <button
                onClick={retryConnection}
                className="text-sm text-yellow-700 hover:text-yellow-900 underline"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}
        
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-fadeInUp">
            {renderPage()}
          </div>
        </main>

        {/* Modern Footer */}
        <ModernFooter />
        
        {/* Toast Notifications */}
        <ToastContainer 
          toasts={toasts} 
          onRemove={removeToast} 
          position="top-right" 
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;