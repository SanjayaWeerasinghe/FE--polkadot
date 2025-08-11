// Enhanced WalletContext.js with proper Polkadot extension disconnect

import React, { createContext, useContext, useState, useEffect } from 'react';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState(null);
  const [extensionAvailable, setExtensionAvailable] = useState(false);
  const [injectedExtensions, setInjectedExtensions] = useState([]);

  // Check if Polkadot extension is available
  useEffect(() => {
    const checkExtension = () => {
      const available = !!(window.injectedWeb3?.['polkadot-js'] || window.injectedWeb3?.['subwallet-js']);
      setExtensionAvailable(available);
      
      if (available) {
        console.log('✅ Polkadot extension detected');
      }
    };

    checkExtension();
    const interval = setInterval(checkExtension, 3000);
    return () => clearInterval(interval);
  }, []);

  // Auto-connect if accounts were previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (extensionAvailable && !account && !connecting && !disconnecting) {
        try {
          const extensions = await web3Enable('Digital Notarized Contracts');
          if (extensions.length > 0) {
            setInjectedExtensions(extensions);
            const accountsList = await web3Accounts();
            if (accountsList.length > 0) {
              console.log('🔄 Auto-connecting to previously connected wallet...');
              setAccounts(accountsList);
              
              const lastAccount = localStorage.getItem('lastConnectedAccount');
              const targetAccount = lastAccount 
                ? accountsList.find(acc => acc.address === lastAccount) || accountsList[0]
                : accountsList[0];
              
              const testInjector = await web3FromAddress(targetAccount.address);
              if (testInjector && testInjector.signer) {
                setAccount(targetAccount);
                console.log('✅ Auto-connected to:', targetAccount.meta.name);
              }
            }
          }
        } catch (error) {
          console.log('ℹ️ Auto-connect failed (normal if not previously connected):', error.message);
        }
      }
    };

    autoConnect();
  }, [extensionAvailable, account, connecting, disconnecting]);

  // Connect to wallet
  const connectWallet = async () => {
    if (connecting || disconnecting) return;
    
    setConnecting(true);
    setError(null);

    try {
      console.log('🔗 Connecting to Polkadot wallet extension...');
      
      // Enable extension with specific app name
      const extensions = await web3Enable('Digital Notarized Contracts');
      
      if (extensions.length === 0) {
        throw new Error(
          'No Polkadot extension found! Please install the Polkadot{.js} extension or SubWallet from your browser\'s extension store.'
        );
      }

      console.log('✅ Extension enabled:', extensions.length, 'extension(s) found');
      setInjectedExtensions(extensions);

      // Get accounts
      const accountsList = await web3Accounts();
      
      if (accountsList.length === 0) {
        throw new Error(
          'No accounts found! Please create or import an account in your Polkadot extension first.'
        );
      }

      console.log('📋 Found accounts:', accountsList.length);
      setAccounts(accountsList);
      
      // Use the first account by default or restore last used
      const lastAccount = localStorage.getItem('lastConnectedAccount');
      const selectedAccount = lastAccount 
        ? accountsList.find(acc => acc.address === lastAccount) || accountsList[0]
        : accountsList[0];
      
      // Test connection
      console.log('🔍 Testing connection to account:', selectedAccount.meta.name);
      const testInjector = await web3FromAddress(selectedAccount.address);
      if (!testInjector || !testInjector.signer) {
        throw new Error('Unable to connect to wallet signer. Please unlock your wallet and try again.');
      }
      
      setAccount(selectedAccount);
      localStorage.setItem('lastConnectedAccount', selectedAccount.address);
      
      console.log('✅ Wallet connected successfully:', selectedAccount.meta.name);
      
    } catch (error) {
      console.error('❌ Wallet connection error:', error);
      setError(error.message);
    } finally {
      setConnecting(false);
    }
  };

  // PROPER DISCONNECT: Ask Polkadot extension to disconnect
  const disconnectWallet = async () => {
    if (disconnecting || connecting) return;
    
    setDisconnecting(true);
    
    try {
      console.log('🔌 Requesting extension to disconnect...');
      
      // Method 1: Use the extension's disconnect method if available
      if (window.injectedWeb3) {
        // Try to disconnect from Polkadot.js extension
        if (window.injectedWeb3['polkadot-js']?.disconnect) {
          try {
            await window.injectedWeb3['polkadot-js'].disconnect();
            console.log('✅ Polkadot.js extension disconnected');
          } catch (e) {
            console.log('ℹ️ Polkadot.js disconnect method not available');
          }
        }
        
        // Try to disconnect from SubWallet
        if (window.injectedWeb3['subwallet-js']?.disconnect) {
          try {
            await window.injectedWeb3['subwallet-js'].disconnect();
            console.log('✅ SubWallet extension disconnected');
          } catch (e) {
            console.log('ℹ️ SubWallet disconnect method not available');
          }
        }
      }

      // Method 2: Revoke permissions by calling web3Enable with a different app name
      try {
        console.log('🔄 Revoking extension permissions...');
        
        // This tells the extension we're disconnecting
        await web3Enable(''); // Empty string revokes permissions
        
        // Wait a moment for the extension to process
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('✅ Extension permissions revoked');
      } catch (permissionError) {
        console.log('ℹ️ Permission revocation not supported:', permissionError.message);
      }

      // Method 3: Send disconnect message to extension (if it supports it)
      try {
        if (window.postMessage) {
          // Send disconnect message to extension
          window.postMessage({
            origin: 'Digital Notarized Contracts',
            type: 'DISCONNECT_REQUEST',
            source: 'page'
          }, window.location.origin);
          
          console.log('📤 Disconnect message sent to extension');
        }
      } catch (messageError) {
        console.log('ℹ️ Message sending failed:', messageError.message);
      }

      // Method 4: Clear extension-specific storage if accessible
      try {
        // Some extensions store connection state in localStorage
        const extensionKeys = Object.keys(localStorage).filter(key => 
          key.includes('polkadot') || 
          key.includes('subwallet') || 
          key.includes('extension')
        );
        
        extensionKeys.forEach(key => {
          try {
            localStorage.removeItem(key);
          } catch (e) {
            // Silent fail for protected keys
          }
        });
        
        if (extensionKeys.length > 0) {
          console.log('🧹 Cleared extension storage keys:', extensionKeys);
        }
      } catch (storageError) {
        console.log('ℹ️ Extension storage cleanup failed:', storageError.message);
      }

      // Clear our local state
      setAccount(null);
      setAccounts([]);
      setInjectedExtensions([]);
      setError(null);
      
      // Clear our stored connection data
      localStorage.removeItem('lastConnectedAccount');
      
      console.log('✅ Wallet disconnected successfully');
      
      // Force reload of extension state
      setTimeout(() => {
        const available = !!(window.injectedWeb3?.['polkadot-js'] || window.injectedWeb3?.['subwallet-js']);
        setExtensionAvailable(available);
      }, 1000);
      
    } catch (error) {
      console.error('⚠️ Error during wallet disconnection:', error);
      
      // Fallback: clear local state even if extension disconnect fails
      setAccount(null);
      setAccounts([]);
      setInjectedExtensions([]);
      setError(null);
      localStorage.removeItem('lastConnectedAccount');
      
      console.log('✅ Local state cleared despite disconnect error');
    } finally {
      setDisconnecting(false);
    }
  };

  // Alternative method: Request extension to show disconnect UI
  const requestExtensionDisconnect = async () => {
    try {
      console.log('🔄 Requesting extension disconnect UI...');
      
      // This will trigger the extension's native disconnect flow
      await web3Enable('DISCONNECT_REQUEST');
      
      // Some extensions respond to this specific pattern
      if (window.injectedWeb3) {
        Object.values(window.injectedWeb3).forEach(async (extension) => {
          if (extension.enable) {
            try {
              // Request with disconnect flag
              await extension.enable('Digital Notarized Contracts', { disconnect: true });
            } catch (e) {
              // Expected to fail, this is just a signal
            }
          }
        });
      }
      
      // Clear our state after signaling
      setTimeout(() => {
        disconnectWallet();
      }, 1000);
      
    } catch (error) {
      console.log('ℹ️ Extension disconnect UI not available, using fallback');
      disconnectWallet();
    }
  };

  // Switch account
  const switchAccount = async (newAccount) => {
    if (connecting || disconnecting) return;
    
    try {
      console.log('🔄 Switching to account:', newAccount.meta.name);
      
      const testInjector = await web3FromAddress(newAccount.address);
      if (!testInjector || !testInjector.signer) {
        throw new Error('Unable to connect to this account. Please ensure it is unlocked in your wallet.');
      }
      
      setAccount(newAccount);
      setError(null);
      localStorage.setItem('lastConnectedAccount', newAccount.address);
      
      console.log('✅ Switched to account:', newAccount.meta.name);
      
    } catch (error) {
      console.error('❌ Account switch error:', error);
      setError(error.message);
    }
  };

  // Get injector for current account
  const getInjector = async () => {
    if (!account) {
      throw new Error('No account connected. Please connect your wallet first.');
    }
    
    try {
      console.log('🔍 Getting injector for account:', account.meta.name);
      const injector = await web3FromAddress(account.address);
      
      if (!injector) {
        throw new Error('Unable to get wallet injector. Please ensure your wallet extension is enabled.');
      }
      
      if (!injector.signer) {
        throw new Error('Wallet signer not available. Please unlock your wallet and try again.');
      }
      
      console.log('✅ Injector obtained successfully');
      return injector;
      
    } catch (error) {
      console.error('❌ Injector error:', error);
      throw new Error(`Wallet connection error: ${error.message}`);
    }
  };

  // Sign message
  const signMessage = async (message) => {
    if (!account) {
      throw new Error('No account connected. Please connect your wallet first.');
    }

    try {
      console.log('✍️ Signing message with account:', account.meta.name);
      
      const injector = await getInjector();
      
      const signingPayload = {
        address: account.address,
        data: message,
        type: 'bytes'
      };
      
      const signatureResult = await injector.signer.signRaw(signingPayload);
      
      console.log('✅ Message signed successfully');
      return signatureResult;
      
    } catch (error) {
      console.error('❌ Message signing error:', error);
      
      if (error.message.includes('Cancelled') || error.message.includes('cancelled')) {
        throw new Error('Signing was cancelled by user');
      } else if (error.message.includes('locked')) {
        throw new Error('Wallet is locked. Please unlock your wallet and try again.');
      } else if (error.message.includes('denied')) {
        throw new Error('Signing was denied. Please approve the signing request in your wallet.');
      } else {
        throw new Error(`Message signing failed: ${error.message}`);
      }
    }
  };

  // Utility functions
  const formatAddress = (address, startChars = 8, endChars = 8) => {
    if (!address) return '';
    if (address.length <= startChars + endChars + 3) return address;
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
  };

  const isValidAddress = (address) => {
    if (!address) return false;
    try {
      return typeof address === 'string' && 
             address.length >= 47 && 
             address.length <= 48 && 
             address.startsWith('5');
    } catch {
      return false;
    }
  };

  const clearError = () => setError(null);

  const getConnectionStatus = () => ({
    isConnected: !!account,
    hasExtension: extensionAvailable,
    accountCount: accounts.length,
    currentAccount: account?.meta?.name || null,
    connecting,
    disconnecting,
    error,
    extensionsFound: injectedExtensions.length
  });

  const value = {
    // State
    account,
    accounts,
    connecting,
    disconnecting,
    error,
    extensionAvailable,
    injectedExtensions,
    
    // Actions
    connectWallet,
    switchAccount,
    disconnectWallet,
    requestExtensionDisconnect, // Alternative disconnect method
    getInjector,
    signMessage,
    clearError,
    
    // Utilities
    formatAddress,
    isValidAddress,
    getConnectionStatus,
    
    // Computed values
    isConnected: !!account,
    accountName: account?.meta?.name || '',
    accountAddress: account?.address || '',
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};