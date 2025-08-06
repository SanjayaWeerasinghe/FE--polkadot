// Enhanced WalletStatus.js with proper extension disconnect options

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useWallet } from '../contexts/WalletContext';
import { useBlockchain } from '../hooks/useBlockchain';

const WalletStatus = () => {
  const { 
    account, 
    accounts, 
    connecting, 
    disconnecting,
    error, 
    extensionAvailable, 
    injectedExtensions,
    connectWallet, 
    switchAccount, 
    disconnectWallet,
    requestExtensionDisconnect,
    formatAddress,
    clearError,
    getConnectionStatus
  } = useWallet();
  
  const { getConnectionStatus: getBlockchainStatus } = useBlockchain();
  const [showDisconnectOptions, setShowDisconnectOptions] = useState(false);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const disconnectButtonRef = useRef(null);
  
  const blockchainStatus = getBlockchainStatus ? getBlockchainStatus() : { connected: false };
  const walletStatus = getConnectionStatus();

  // Calculate dropdown position
  useEffect(() => {
    if (showDisconnectOptions && disconnectButtonRef.current) {
      const rect = disconnectButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.top - 120, // Position above the button
        left: rect.right - 256, // Align to the right edge, 256px is dropdown width
      });
    }
  }, [showDisconnectOptions]);

  // Handle different disconnect methods
  const handleDisconnect = async (method = 'normal') => {
    if (disconnecting) return;
    
    let confirmMessage = '🔌 Disconnect Wallet?\n\nAre you sure you want to disconnect your wallet?';
    
    if (method === 'extension') {
      confirmMessage += '\n\nThis will request the extension to disconnect and may show the extension\'s disconnect interface.';
    } else {
      confirmMessage += '\n\nThis will clear your current session and stored connection data.';
    }
    
    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;
    
    try {
      if (method === 'extension') {
        await requestExtensionDisconnect();
      } else {
        await disconnectWallet();
      }
      
      clearError();
      setShowDisconnectOptions(false);
      console.log('✅ Wallet disconnected successfully');
      
    } catch (error) {
      console.error('❌ Disconnect error:', error);
    }
  };

  // Handle connect
  const handleConnect = async () => {
    if (connecting || disconnecting) return;
    
    try {
      clearError();
      await connectWallet();
    } catch (error) {
      console.error('❌ Connect error:', error);
    }
  };

  // Handle account switching
  const handleAccountSwitch = async (selectedAddress) => {
    if (connecting || disconnecting) return;
    
    const selectedAccount = accounts.find(acc => acc.address === selectedAddress);
    if (selectedAccount && selectedAccount.address !== account?.address) {
      try {
        await switchAccount(selectedAccount);
      } catch (error) {
        console.error('❌ Account switch error:', error);
      }
    }
  };

  // Connected State
  if (account) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 mb-8 shadow-glass border border-white/20 animate-slideInRight">
        {/* Main Status Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Connected Status */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-300"></div>
            </div>
            <div>
              <div className="font-semibold text-gray-800 flex items-center gap-2">
                {account.meta.name || 'Unknown Account'}
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Connected via {account.meta.source || 'Extension'}
                </span>
              </div>
              <div className="text-sm text-gray-600 font-mono">
                {formatAddress(account.address, 6, 6)}
              </div>
            </div>
          </div>

          {/* Account Switcher */}
          {accounts.length > 1 && (
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600 font-medium hidden md:block">
                Switch Account:
              </label>
              <select
                value={account.address}
                onChange={(e) => handleAccountSwitch(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
                disabled={connecting || disconnecting}
              >
                {accounts.map((acc) => (
                  <option key={acc.address} value={acc.address}>
                    {acc.meta.name || 'Unknown'} ({formatAddress(acc.address, 4, 4)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Disconnect Options */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAccountDetails(!showAccountDetails)}
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              title="Account Details"
            >
              ℹ️
            </button>
            
            
          </div>
        </div>

        {/* Account Details (Expandable) */}
        {showAccountDetails && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Account & Extension Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-600 mb-1">Account Info:</div>
                <div className="space-y-1">
                  <div>Name: <span className="font-medium">{account.meta.name || 'Unknown'}</span></div>
                  <div>Source: <span className="font-medium">{account.meta.source || 'Extension'}</span></div>
                  <div>Type: <span className="font-medium">{account.type || 'sr25519'}</span></div>
                </div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Extension Info:</div>
                <div className="space-y-1">
                  <div>Extensions: <span className="font-medium">{injectedExtensions.length} found</span></div>
                  <div>Accounts: <span className="font-medium">{accounts.length} available</span></div>
                  <div>Status: <span className="text-green-600 font-medium">✅ Active</span></div>
                </div>
              </div>
            </div>
            <div className="mt-2 p-2 bg-white rounded text-xs font-mono break-all">
              <span className="text-gray-500">Address:</span> {account.address}
            </div>
          </div>
        )}

        

        {/* Error Display */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="text-sm text-red-700">
                <strong>Connection Error:</strong> {error}
              </div>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700 text-xs"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Click outside to close dropdown */}
        {showDisconnectOptions && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDisconnectOptions(false)}
          />
        )}

        
      </div>
    );
  }

  // Not Connected State
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 mb-8 shadow-glass border border-white/20 animate-slideInRight">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Disconnected Status */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-4 h-4 rounded-full bg-gray-400"></div>
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gray-300"></div>
          </div>
          <div>
            <div className="font-semibold text-gray-800">Wallet Not Connected</div>
            <div className="text-sm text-gray-600">
              {extensionAvailable 
                ? 'Connect your Polkadot wallet to start using the application' 
                : 'Please install Polkadot.js extension to continue'
              }
            </div>
          </div>
        </div>

        {/* Connection Actions */}
        <div className="flex items-center gap-3">
          {extensionAvailable ? (
            <>
              <button
                onClick={handleConnect}
                disabled={connecting || disconnecting}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
              >
                {connecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    🔗 Connect Wallet
                  </>
                )}
              </button>
              
              <button
                onClick={() => window.open('https://polkadot.js.org/docs/', '_blank')}
                className="px-3 py-3 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                title="Get Help"
              >
                ❓
              </button>
            </>
          ) : (
            <>
              <a
                href="https://polkadot.js.org/extension/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors shadow-lg"
              >
                📦 Install Polkadot.js
              </a>
              
              <a
                href="https://www.subwallet.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm"
              >
                or SubWallet
              </a>
            </>
          )}
        </div>
      </div>

      {/* Extension Status */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${extensionAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-gray-600">
              Extension: {extensionAvailable ? 'Detected' : 'Not Found'}
            </span>
          </div>
          
          {extensionAvailable && (
            <span className="text-xs text-gray-500">
              Ready to connect
            </span>
          )}
        </div>
        
        {extensionAvailable && injectedExtensions.length > 0 && (
          <div className="mt-1 text-xs text-gray-500">
            Found: {injectedExtensions.map(ext => ext.name).join(', ')}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="text-sm text-red-700">
              <strong>Connection Error:</strong> {error}
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 text-xs"
            >
              ✕
            </button>
          </div>
          
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded"
            >
              Retry Connection
            </button>
            <button
              onClick={() => window.location.reload()}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )}

      {/* Help Information */}
      {!extensionAvailable && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-700">
            <strong>💡 Getting Started:</strong>
            <ol className="mt-2 space-y-1 text-xs list-decimal list-inside">
              <li>Install the Polkadot.js extension from the link above</li>
              <li>Create or import your account in the extension</li>
              <li>Return to this page and click "Connect Wallet"</li>
              <li>Approve the connection request in the extension popup</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletStatus;