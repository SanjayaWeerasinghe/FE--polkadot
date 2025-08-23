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

  // PROPER DISCONNECT: Clear authorization and force user to reauthorize
  const disconnectWallet = async () => {
    if (disconnecting || connecting) return;
    
    setDisconnecting(true);
    
    try {
      console.log('🔌 Disconnecting from Polkadot extension...');
      
      // Method 1: Clear all extension-related data
      try {
        // Clear extension connection preferences
        const extensionKeys = Object.keys(localStorage).filter(key => 
          key.includes('polkadot') || 
          key.includes('subwallet') || 
          key.includes('extension') ||
          key.includes('web3Enable') ||
          key.includes('injected')
        );
        
        extensionKeys.forEach(key => {
          try {
            localStorage.removeItem(key);
            console.log(`🧹 Cleared: ${key}`);
          } catch (e) {
            // Silent fail for protected keys
          }
        });

        // Clear session storage too
        const sessionKeys = Object.keys(sessionStorage).filter(key => 
          key.includes('polkadot') || 
          key.includes('subwallet') || 
          key.includes('extension')
        );
        
        sessionKeys.forEach(key => {
          try {
            sessionStorage.removeItem(key);
            console.log(`🧹 Cleared session: ${key}`);
          } catch (e) {
            // Silent fail
          }
        });
        
      } catch (storageError) {
        console.log('ℹ️ Extension storage cleanup failed:', storageError.message);
      }

      // Method 2: Try to revoke permissions by re-enabling with null
      try {
        console.log('🔄 Revoking extension authorization...');
        
        // Call web3Enable with a different app name to revoke current authorization
        await web3Enable('__DISCONNECT__' + Date.now());
        
        // Wait for the extension to process
        await new Promise(resolve => setTimeout(resolve, 800));
        
        console.log('✅ Extension authorization revoked');
      } catch (permissionError) {
        console.log('ℹ️ Permission revocation attempt failed:', permissionError.message);
      }

      // Method 3: Send custom events to notify extension
      try {
        // Dispatch custom events that some extensions listen for
        window.dispatchEvent(new CustomEvent('polkadot-disconnect', {
          detail: { 
            origin: 'Digital Notarized Contracts',
            action: 'disconnect',
            timestamp: Date.now()
          }
        }));

        window.dispatchEvent(new CustomEvent('substrate-disconnect', {
          detail: { 
            origin: 'Digital Notarized Contracts'
          }
        }));
        
        console.log('📤 Disconnect events dispatched');
      } catch (eventError) {
        console.log('ℹ️ Event dispatch failed:', eventError.message);
      }

      // Method 4: Try to clear injected web3 references
      try {
        if (window.injectedWeb3) {
          // Clear the cached extensions
          Object.keys(window.injectedWeb3).forEach(extensionName => {
            try {
              // Some extensions expose a disable method
              if (window.injectedWeb3[extensionName]?.disable) {
                window.injectedWeb3[extensionName].disable();
                console.log(`✅ Disabled extension: ${extensionName}`);
              }
            } catch (e) {
              // Extension doesn't support disable
            }
          });
        }
      } catch (injectedError) {
        console.log('ℹ️ Injected web3 cleanup failed:', injectedError.message);
      }

      // Clear our local state
      setAccount(null);
      setAccounts([]);
      setInjectedExtensions([]);
      setError(null);
      
      // Clear our stored connection data
      localStorage.removeItem('lastConnectedAccount');
      
      console.log('✅ App disconnected from wallet');
      console.log('ℹ️ Note: You may need to manually disconnect from the Polkadot.js extension popup');
      
      // Force re-check extension availability after disconnect
      setTimeout(() => {
        const available = !!(window.injectedWeb3?.['polkadot-js'] || window.injectedWeb3?.['subwallet-js']);
        setExtensionAvailable(available);
      }, 1000);
      
    } catch (error) {
      console.error('⚠️ Error during wallet disconnection:', error);
      
      // Always clear local state regardless of errors
      setAccount(null);
      setAccounts([]);
      setInjectedExtensions([]);
      setError(null);
      localStorage.removeItem('lastConnectedAccount');
      
      console.log('✅ Local state cleared');
    } finally {
      setDisconnecting(false);
    }
  };

  // Enhanced disconnect with user guidance
  const disconnectWithGuidance = async (onStatusCallback) => {
    // First do our app-level disconnect
    await disconnectWallet();
    
    // Provide status update
    if (onStatusCallback) {
      onStatusCallback(
        '✅ App disconnected successfully! For complete disconnection, please also disconnect from the Polkadot.js extension by clicking the extension icon and removing this site.',
        'success'
      );
    }
    
    // Try to help open extension popup
    try {
      // Attempt to trigger extension popup for easier access
      await web3Enable('__OPEN_EXTENSION_FOR_DISCONNECT__');
      
      if (onStatusCallback) {
        onStatusCallback(
          'ℹ️ Extension popup should open. Find "Digital Notarized Contracts" and click disconnect.',
          'info'
        );
      }
    } catch (e) {
      if (onStatusCallback) {
        onStatusCallback(
          'ℹ️ Please manually open the Polkadot.js extension, find "Digital Notarized Contracts" in connected sites, and click disconnect.',
          'warning'
        );
      }
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
    disconnectWithGuidance, // Enhanced disconnect with user guidance
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