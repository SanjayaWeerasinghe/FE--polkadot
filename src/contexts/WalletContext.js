// Fixed WalletContext.js with enhanced error handling and connection management

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
  const [error, setError] = useState(null);
  const [extensionAvailable, setExtensionAvailable] = useState(false);

  // Check if Polkadot extension is available
  useEffect(() => {
    const checkExtension = () => {
      const available = !!(window.injectedWeb3?.['polkadot-js'] || window.injectedWeb3?.['subwallet-js']);
      setExtensionAvailable(available);
    };

    checkExtension();
    
    // Check periodically in case extension is installed while app is running
    const interval = setInterval(checkExtension, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Auto-connect if accounts were previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (extensionAvailable && !account && !connecting) {
        try {
          const extensions = await web3Enable('Digital Notarized Contracts');
          if (extensions.length > 0) {
            const accountsList = await web3Accounts();
            if (accountsList.length > 0) {
              console.log('🔄 Auto-connecting to previously connected wallet...');
              setAccounts(accountsList);
              
              // Try to restore last used account
              const lastAccount = localStorage.getItem('lastConnectedAccount');
              const targetAccount = lastAccount 
                ? accountsList.find(acc => acc.address === lastAccount) || accountsList[0]
                : accountsList[0];
              
              // Test connection
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
  }, [extensionAvailable, account, connecting]);

  // Connect to wallet
  const connectWallet = async () => {
    setConnecting(true);
    setError(null);

    try {
      console.log('🔗 Connecting to Polkadot wallet extension...');
      
      // Enable extension
      const extensions = await web3Enable('Digital Notarized Contracts');
      
      if (extensions.length === 0) {
        throw new Error(
          'No Polkadot extension found! Please install the Polkadot{.js} extension or SubWallet from your browser\'s extension store.'
        );
      }

      console.log('✅ Extension enabled:', extensions.length, 'extension(s) found');

      // Get accounts
      const accountsList = await web3Accounts();
      
      if (accountsList.length === 0) {
        throw new Error(
          'No accounts found! Please create or import an account in your Polkadot extension first.'
        );
      }

      console.log('📋 Found accounts:', accountsList.length);
      setAccounts(accountsList);
      
      // Use the first account by default
      const selectedAccount = accountsList[0];
      
      // Test if we can get injector (validates the connection)
      console.log('🔍 Testing connection to account:', selectedAccount.meta.name);
      const testInjector = await web3FromAddress(selectedAccount.address);
      if (!testInjector || !testInjector.signer) {
        throw new Error('Unable to connect to wallet signer. Please unlock your wallet and try again.');
      }
      
      setAccount(selectedAccount);
      setExtensionAvailable(true);
      
      // Save last connected account
      localStorage.setItem('lastConnectedAccount', selectedAccount.address);
      
      console.log('✅ Wallet connected successfully:', selectedAccount.meta.name);
      console.log('📍 Account address:', selectedAccount.address);
      
    } catch (error) {
      console.error('❌ Wallet connection error:', error);
      setError(error.message);
    } finally {
      setConnecting(false);
    }
  };

  // Switch account
  const switchAccount = async (newAccount) => {
    try {
      console.log('🔄 Switching to account:', newAccount.meta.name);
      
      // Test if we can get injector for the new account
      const testInjector = await web3FromAddress(newAccount.address);
      if (!testInjector || !testInjector.signer) {
        throw new Error('Unable to connect to this account. Please ensure it is unlocked in your wallet.');
      }
      
      setAccount(newAccount);
      setError(null);
      
      // Save last connected account
      localStorage.setItem('lastConnectedAccount', newAccount.address);
      
      console.log('✅ Switched to account:', newAccount.meta.name);
      
    } catch (error) {
      console.error('❌ Account switch error:', error);
      setError(error.message);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setAccounts([]);
    setError(null);
    localStorage.removeItem('lastConnectedAccount');
    console.log('🔌 Wallet disconnected');
  };

  // Get injector for current account with enhanced error handling
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
      
      // Provide more specific error messages
      if (error.message.includes('not found')) {
        throw new Error('Account not found in wallet. Please check if the account is still available.');
      } else if (error.message.includes('locked')) {
        throw new Error('Wallet is locked. Please unlock your wallet and try again.');
      } else {
        throw new Error(`Wallet connection error: ${error.message}`);
      }
    }
  };

  // Sign message with enhanced error handling
  const signMessage = async (message) => {
    if (!account) {
      throw new Error('No account connected. Please connect your wallet first.');
    }

    try {
      console.log('✍️ Signing message with account:', account.meta.name);
      
      const injector = await getInjector();
      
      // Prepare the signing payload
      const signingPayload = {
        address: account.address,
        data: message,
        type: 'bytes'
      };
      
      console.log('📝 Signing payload:', signingPayload);
      
      const signatureResult = await injector.signer.signRaw(signingPayload);
      
      console.log('✅ Message signed successfully');
      console.log('📋 Signature result:', {
        id: signatureResult.id,
        signature: signatureResult.signature.slice(0, 20) + '...' // Log partial signature for privacy
      });
      
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

  // Format account address for display
  const formatAddress = (address, startChars = 8, endChars = 8) => {
    if (!address) return '';
    if (address.length <= startChars + endChars + 3) return address;
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
  };

  // Check if address is valid Polkadot address
  const isValidAddress = (address) => {
    if (!address) return false;
    
    try {
      // Basic format check for Substrate address
      return typeof address === 'string' && 
             address.length >= 47 && 
             address.length <= 48 && 
             address.startsWith('5');
    } catch {
      return false;
    }
  };

  // *** NEW: Get account balance (if needed) ***
  const getAccountBalance = async (api) => {
    if (!account || !api) return null;
    
    try {
      const { data: balance } = await api.query.system.account(account.address);
      return {
        free: balance.free.toHuman(),
        reserved: balance.reserved.toHuman(),
        frozen: balance.frozen.toHuman()
      };
    } catch (error) {
      console.error('Error getting balance:', error);
      return null;
    }
  };

  // *** NEW: Clear error manually ***
  const clearError = () => {
    setError(null);
  };

  // *** NEW: Refresh accounts (useful if accounts change in extension) ***
  const refreshAccounts = async () => {
    try {
      const accountsList = await web3Accounts();
      setAccounts(accountsList);
      
      // Check if current account is still available
      if (account && !accountsList.find(acc => acc.address === account.address)) {
        console.log('⚠️ Current account no longer available, disconnecting...');
        disconnectWallet();
      }
      
      return accountsList;
    } catch (error) {
      console.error('Error refreshing accounts:', error);
      return [];
    }
  };

  const value = {
    // State
    account,
    accounts,
    connecting,
    error,
    extensionAvailable,
    
    // Actions
    connectWallet,
    switchAccount,
    disconnectWallet,
    getInjector,
    signMessage,
    clearError,
    refreshAccounts,
    
    // Utilities
    formatAddress,
    isValidAddress,
    getAccountBalance,
    
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