// src/App.js - Using Your ORIGINAL BlockchainContext with flexible connection handling
import React, { useState } from 'react';
import { useWallet } from './contexts/WalletContext';

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
  
  // Toast notifications
  const { toasts, removeToast, success, error, warning, info, loading, celebration, blockchain } = useToast();

  const handleNavigation = (page) => {
    setCurrentPage(page);
    if (page !== 'menu') {
      info(`Navigating to ${page}...`);
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


    switch (currentPage) {
      case 'initiate':
        return (
          <InitiateContract 
            onBack={() => setCurrentPage('menu')} 
            onStatus={(message, type) => {
              if (type === 'success') success(message);
              else if (type === 'error') error(message);
              else if (type === 'warning') warning(message);
              else info(message);
            }}
          />
        );
      case 'sign':
        return (
          <SignContract 
            onBack={() => setCurrentPage('menu')} 
            onStatus={(message, type) => {
              if (type === 'success') success(message);
              else if (type === 'error') error(message);
              else if (type === 'warning') warning(message);
              else info(message);
            }}
          />
        );
      case 'view':
        return (
          <ViewContracts 
            onBack={() => setCurrentPage('menu')} 
            onStatus={(message, type) => {
              if (type === 'success') success(message);
              else if (type === 'error') error(message);
              else if (type === 'warning') warning(message);
              else info(message);
            }}
          />
        );
      default:
        return <ModernDashboard onNavigate={handleNavigation} />;
    }
  };


  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Modern Navigation */}
        <ModernNavbar 
          currentPage={currentPage}
          onNavigate={handleNavigation}
          account={account}
          onStatus={(message, type) => {
            if (type === 'success') success(message);
            else if (type === 'error') error(message);
            else if (type === 'warning') warning(message);
            else if (type === 'loading') loading(message);
            else if (type === 'celebration') celebration(message);
            else if (type === 'blockchain') blockchain(message);
            else info(message);
          }}
        />
        
        
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