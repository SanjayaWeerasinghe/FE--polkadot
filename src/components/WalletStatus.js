import React from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useBlockchain } from '../contexts/BlockchainContext';

const WalletStatus = () => {
  const { 
    account, 
    accounts, 
    connecting, 
    error, 
    extensionAvailable, 
    connectWallet, 
    switchAccount, 
    disconnectWallet,
    formatAddress 
  } = useWallet();
  
  const { connected: blockchainConnected, error: blockchainError } = useBlockchain();

  if (account) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 mb-8 shadow-glass border border-white/20 animate-slideInRight">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Connected Status */}
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <div>
              <div className="font-semibold text-gray-800">
                {account.meta.name || 'Unknown Account'}
              </div>
              <div className="text-sm text-gray-600 font-mono">
                {formatAddress(account.address, 6, 6)}
              </div>
            </div>
          </div>

          {/* Account Switcher */}
          {accounts.length > 1 && (
            <div className="flex items-center gap-3">
              <select
                value={account.address}
                onChange={(e) => {
                  const selectedAccount = accounts.find(acc => acc.address === e.target.value);
                  if (selectedAccount) {
                    switchAccount(selectedAccount);
                  }
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.address} value={acc.address}>
                    {acc.meta.name || 'Unknown'} ({formatAddress(acc.address, 4, 4)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Disconnect Button */}
          <button
            onClick={disconnectWallet}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            Disconnect
          </button>
        </div>

        {/* Blockchain Status */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${blockchainConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-gray-600">
                Blockchain: {blockchainConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {blockchainError && (
              <span className="text-red-600 text-xs">
                {blockchainError}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 mb-8 shadow-glass border border-white/20 text-center animate-scaleIn">
      {/* Extension Check */}
      {!extensionAvailable ? (
        <div className="space-y-4">
          <div className="text-6xl mb-4">🔌</div>
          <h3 className="text-xl font-semibold text-gray-800">Extension Required</h3>
          <p className="text-gray-600 leading-relaxed">
            Please install the Polkadot extension to connect your wallet.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <a
              href="https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Install for Chrome
            </a>
            <a
              href="https://addons.mozilla.org/en-US/firefox/addon/polkadot-js-extension/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              Install for Firefox
            </a>
          </div>
        </div>
      ) : (
        /* Connect Wallet */
        <div className="space-y-4">
          <button
            onClick={connectWallet}
            disabled={connecting}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none btn-hover-lift"
          >
            {connecting ? (
              <span className="flex items-center gap-2">
                <div className="spinner"></div>
                Connecting...
              </span>
            ) : (
              '🔗 Connect Polkadot Wallet'
            )}
          </button>
          
          <p className="text-gray-600">
            Connect your wallet to access contract features
          </p>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">Connection Error</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <button
                onClick={connectWallet}
                className="mt-2 text-red-600 text-sm hover:text-red-700 underline"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-6 text-xs text-gray-500 space-y-1">
            <p>Make sure your Polkadot.js extension is:</p>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              <span>✓ Installed</span>
              <span>✓ Unlocked</span>
              <span>✓ Has accounts</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletStatus;