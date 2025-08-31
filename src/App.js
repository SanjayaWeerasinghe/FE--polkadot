// src/App.js - Using Your ORIGINAL BlockchainContext with flexible connection handling
import React, { useState } from 'react';
import { useWallet } from './contexts/WalletContext';
import { useAuth } from './contexts/AuthContext';

// Import modern components
import ModernNavbar from './components/Navbar';
import ModernDashboard from './pages/Dashboard';
import ModernFooter from './components/Footer';
import { ToastContainer, useToast } from './components/StatusToast';

// Import your pages (updated to use your original context)
import InitiateContract from './pages/InitiateContract';
import SignContract from './pages/SignContract';
import ViewContracts from './pages/ViewContracts';

// Import authentication components
import AuthWrapper from './components/auth/AuthWrapper';
import PublicKeyManagement from './components/auth/PublicKeyManagement';

// Error Boundary Component
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [currentPage, setCurrentPage] = useState('menu');
  const { account } = useWallet();
  const { isAuthenticated, isVerified, user, canUsePublicKey } = useAuth();
  
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

    // Authentication pages
    if (currentPage === 'login') {
      return (
        <AuthWrapper 
          onBack={() => setCurrentPage('menu')}
          onAuthSuccess={() => {
            setCurrentPage('menu');
            success('Successfully logged in!');
          }}
        />
      );
    }

    if (currentPage === 'publicKeys') {
      return (
        <PublicKeyManagement 
          onBack={() => setCurrentPage('menu')}
        />
      );
    }

    // Check authentication for protected pages
    if (!isAuthenticated || !isVerified) {
      return (
        <div className="glass-card-dark backdrop-blur-sm rounded-3xl p-10 shadow-lg text-center animate-fadeInUp max-w-md mx-auto" style={{border: '1px solid var(--border-primary)', color: 'var(--text-primary)'}}>
          <div className="text-6xl mb-6">🔐</div>
          <h3 className="text-2xl font-semibold mb-4" style={{color: 'var(--text-primary)'}}>
            Authentication Required
          </h3>
          <p className="leading-relaxed mb-6" style={{color: 'var(--text-secondary)'}}>
            Please log in to your account to access contract management features. 
            You need a verified account to create and manage digital contracts.
          </p>
          <div className="p-4 rounded-xl mb-6" style={{backgroundColor: 'var(--success-bg)', border: '1px solid var(--border-primary)'}}>
            <p className="text-sm" style={{color: 'var(--text-secondary)'}}>
              💡 Create an account to start managing your digital contracts securely.
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setCurrentPage('login')}
              className="flex-1 px-6 py-3 rounded-xl font-medium transition-colors hover:opacity-80"
              style={{backgroundColor: 'var(--success)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)'}}
            >
              Login / Register
            </button>
            <button
              onClick={() => setCurrentPage('menu')}
              className="flex-1 px-6 py-3 rounded-xl font-medium transition-colors hover:opacity-80"
              style={{color: 'var(--text-primary)', border: '1px solid var(--border-primary)'}}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      );
    }

    // Wallet connection check for blockchain operations
    if (!account) {
      return (
        <div className="glass-card-dark backdrop-blur-sm rounded-3xl p-10 shadow-lg text-center animate-fadeInUp max-w-md mx-auto" style={{border: '1px solid var(--border-primary)', color: 'var(--text-primary)'}}>
          <div className="text-6xl mb-6">🔗</div>
          <h3 className="text-2xl font-semibold mb-4" style={{color: 'var(--text-primary)'}}>
            Wallet Connection Required
          </h3>
          <p className="leading-relaxed mb-6" style={{color: 'var(--text-secondary)'}}>
            Please connect your Polkadot wallet to sign transactions and interact with the blockchain.
            You're logged in as <strong>{user?.email}</strong>.
          </p>
          <div className="p-4 rounded-xl mb-6" style={{backgroundColor: 'var(--success-bg)', border: '1px solid var(--border-primary)'}}>
            <p className="text-sm" style={{color: 'var(--text-secondary)'}}>
              💡 Make sure you have the Polkadot.js extension installed and the wallet address is added to your account.
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setCurrentPage('publicKeys')}
              className="flex-1 px-6 py-3 rounded-xl font-medium transition-colors hover:opacity-80"
              style={{color: 'var(--text-primary)', border: '1px solid var(--border-primary)'}}
            >
              Manage Keys
            </button>
            <button
              onClick={() => setCurrentPage('menu')}
              className="flex-1 px-6 py-3 rounded-xl font-medium transition-colors hover:opacity-80"
              style={{color: 'var(--text-primary)', border: '1px solid var(--border-primary)'}}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      );
    }

    // Check if user can use the connected wallet address
    if (!canUsePublicKey(account.address)) {
      return (
        <div className="glass-card-dark backdrop-blur-sm rounded-3xl p-10 shadow-lg text-center animate-fadeInUp max-w-md mx-auto" style={{border: '1px solid var(--border-primary)', color: 'var(--text-primary)'}}>
          <div className="text-6xl mb-6">⚠️</div>
          <h3 className="text-2xl font-semibold mb-4" style={{color: 'var(--text-primary)'}}>
            Wallet Address Not Registered
          </h3>
          <p className="leading-relaxed mb-4" style={{color: 'var(--text-secondary)'}}>
            The connected wallet address is not registered to your account.
          </p>
          <div className="p-3 rounded-xl mb-6" style={{backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-primary)'}}>
            <p className="text-sm font-mono" style={{color: 'var(--text-primary)'}}>{account.address}</p>
          </div>
          <p className="text-sm mb-6" style={{color: 'var(--text-secondary)'}}>
            Please add this address to your account or connect a different wallet.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => setCurrentPage('publicKeys')}
              className="flex-1 px-6 py-3 rounded-xl font-medium transition-colors hover:opacity-80"
              style={{backgroundColor: 'var(--success)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)'}}
            >
              Add This Address
            </button>
            <button
              onClick={() => setCurrentPage('menu')}
              className="flex-1 px-6 py-3 rounded-xl font-medium transition-colors hover:opacity-80"
              style={{backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)'}}
            >
              Back to Dashboard
            </button>
          </div>
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
      <div className="min-h-screen" style={{backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)'}}>
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