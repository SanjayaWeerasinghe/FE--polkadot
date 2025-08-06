// src/App.js - Updated with Transaction Debugger
import React, { useState } from 'react';
import { useWallet } from './contexts/WalletContext';
import Header from './components/Header';
import WalletStatus from './components/WalletStatus';
import MainMenu from './components/MainMenu';
import InitiateContract from './pages/InitiateContract';
import SignContract from './pages/SignContract';
import ViewContracts from './pages/ViewContracts';
import StatusMessage from './components/StatusMessage';
import QuickInitiate from './components/QuickInitiate';
import TransactionDebugger from './components/TransactionDebugger'; // NEW

function App() {
  const [currentPage, setCurrentPage] = useState('menu');
  const [status, setStatus] = useState({ message: '', type: '' });
  const [showDebugger, setShowDebugger] = useState(true); // NEW: Control debugger visibility
  const { account } = useWallet();

  const clearStatus = () => setStatus({ message: '', type: '' });
  const showStatus = (message, type = 'info') => setStatus({ message, type });
  const handleNavigation = (page) => {
    setCurrentPage(page);
    clearStatus();
  };

  const renderPage = () => {
    if (!account) {
      return (
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-10 shadow-glass-lg border border-white/20 text-center animate-fadeInUp">
          <div className="text-6xl mb-6">🔐</div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">
            Wallet Required
          </h3>
          <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
            Please connect your Polkadot wallet to access contract management features. 
            Your wallet is required to sign transactions and interact with the blockchain.
          </p>
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-700">
              💡 Make sure you have the Polkadot.js extension installed and at least one account created.
            </p>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'initiate':
        return <InitiateContract onBack={() => handleNavigation('menu')} onStatus={showStatus} />;
      case 'sign':
        return <SignContract onBack={() => handleNavigation('menu')} onStatus={showStatus} />;
      case 'contracts':
        return <ViewContracts onBack={() => handleNavigation('menu')} onStatus={showStatus} />;
      default:
        return <MainMenu onNavigate={handleNavigation} onStatus={showStatus} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-blue-700">
      <div className="container mx-auto px-5 py-8 max-w-6xl">
        {/* Header */}
        <Header />

        {/* Wallet Status */}
        <WalletStatus />

        {/* Status Messages */}
        {status.message && (
          <StatusMessage message={status.message} type={status.type} onClose={clearStatus} />
        )}

        {/* NEW: Debug Toggle Button */}
        {/* <div className="mb-4 flex justify-end">
          <button
            onClick={() => setShowDebugger(!showDebugger)}
            className="bg-gray-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            {showDebugger ? '🙈 Hide Debugger' : '🔬 Show Debugger'}
          </button>
        </div> */}

        {/* NEW: Transaction Debugger */}
        {/* {showDebugger && (
          <TransactionDebugger onStatus={showStatus} />
        )} */}

        {/* QUICK INITIATE DEMO */}
        {/* <QuickInitiate /> */}

        {/* Main Content */}
        <main className="animate-fadeInUp">
          {renderPage()}
        </main>

        {/* Footer */}
        <footer className="text-center mt-16 text-white/70">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm">Powered by Substrate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
              <span className="text-sm">Secured by Polkadot</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
              <span className="text-sm">Decentralized Notarization</span>
            </div>
          </div>
          <p className="text-sm opacity-60">
            Digital Notarized Contracts v1.0 - Making contract management transparent and secure
          </p>
          
          {/* NEW: Debug Info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 text-xs opacity-50">
              <p>Debug Mode: Transaction analysis tools enabled</p>
              <p>Environment: {process.env.NODE_ENV}</p>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}

export default App;