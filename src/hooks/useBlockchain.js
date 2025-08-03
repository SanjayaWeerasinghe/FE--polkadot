// Fixed useBlockchain.js hook with proper error handling and loading states

import { useState, useCallback } from 'react';
import blockchainService from '../services/blockchainService';

export const useBlockchain = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generic function executor with enhanced loading states and error handling
  const executeBlockchainFunction = useCallback(async (operation, loadingMessage = 'Processing...') => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🚀 Starting operation: ${loadingMessage}`);
      const result = await operation();
      console.log('✅ Operation completed successfully:', result);
      setLoading(false);
      return result;
    } catch (err) {
      console.error('❌ Operation failed:', err);
      
      // Enhanced error handling with user-friendly messages
      let userFriendlyMessage = err.message;
      
      if (err.message.includes('Cancelled')) {
        userFriendlyMessage = 'Transaction was cancelled by user';
      } else if (err.message.includes('1014')) {
        userFriendlyMessage = 'Network is congested. Please try again in a moment.';
      } else if (err.message.includes('1010')) {
        userFriendlyMessage = 'Invalid transaction. Please check your inputs and try again.';
      } else if (err.message.includes('timeout')) {
        userFriendlyMessage = 'Transaction timed out. The network may be slow. Please try again.';
      } else if (err.message.includes('nonce')) {
        userFriendlyMessage = 'Account synchronization issue. Please refresh the page and try again.';
      } else if (err.message.includes('disconnected') || err.message.includes('connection')) {
        userFriendlyMessage = 'Lost connection to blockchain. Please check your internet and try again.';
      } else if (err.message.includes('ContractAlreadyExists')) {
        userFriendlyMessage = 'A contract with this document already exists on the blockchain.';
      } else if (err.message.includes('NotAuthorized')) {
        userFriendlyMessage = 'You are not authorized to perform this action on this contract.';
      } else if (err.message.includes('CannotSign')) {
        userFriendlyMessage = 'Cannot sign this contract. It may already be signed or in a non-signable state.';
      } else if (err.message.includes('DataTooLarge')) {
        userFriendlyMessage = 'Contract name or metadata is too long. Please shorten and try again.';
      } else if (err.message.includes('PartiesMustBeDifferent')) {
        userFriendlyMessage = 'All three party addresses must be different.';
      } else if (err.message.includes('ContractNotFound')) {
        userFriendlyMessage = 'Contract not found. Please verify the document hash is correct.';
      } else if (err.message.includes('InsufficientBalance') || err.message.includes('balance')) {
        userFriendlyMessage = 'Insufficient balance to pay transaction fees.';
      }
      
      setError(userFriendlyMessage);
      setLoading(false);
      throw new Error(userFriendlyMessage);
    }
  }, []);

  // *** FIXED: Initiate contract with proper transaction wrapper ***
  const initiateContract = useCallback(async (
    injector, 
    accountAddress, 
    fileHash, 
    firstParty, 
    secondParty, 
    thirdParty, 
    contractName,
    metadata = ''
  ) => {
    // Validate inputs before making blockchain call
    if (!injector || !injector.signer) {
      throw new Error('Wallet is not properly connected. Please reconnect your wallet.');
    }

    if (!accountAddress) {
      throw new Error('Account address is required. Please connect your wallet.');
    }

    if (!fileHash) {
      throw new Error('File hash is required. Please upload a document first.');
    }

    if (!contractName || contractName.trim().length === 0) {
      throw new Error('Contract name is required.');
    }

    if (contractName.trim().length > 512) {
      throw new Error('Contract name is too long (maximum 512 characters).');
    }

    if (metadata && metadata.length > 1024) {
      throw new Error('Metadata is too long (maximum 1024 characters).');
    }

    // Check if all addresses are different
    const addresses = [firstParty, secondParty, thirdParty].filter(Boolean);
    const uniqueAddresses = new Set(addresses);
    if (uniqueAddresses.size !== addresses.length) {
      throw new Error('All party addresses must be different.');
    }

    return executeBlockchainFunction(
      () => blockchainService.initiateContract(
        injector, 
        accountAddress, 
        fileHash, 
        firstParty, 
        secondParty, 
        thirdParty, 
        contractName.trim(), 
        metadata.trim()
      ),
      'Creating contract on blockchain...'
    );
  }, [executeBlockchainFunction]);

  // *** FIXED: Sign contract with proper error handling ***
  const signContract = useCallback(async (injector, accountAddress, contractHash, signature) => {
    if (!injector || !injector.signer) {
      throw new Error('Wallet is not properly connected. Please reconnect your wallet.');
    }

    if (!accountAddress) {
      throw new Error('Account address is required. Please connect your wallet.');
    }

    if (!contractHash) {
      throw new Error('Contract hash is required. Please upload the contract document.');
    }

    if (!signature) {
      throw new Error('Signature is required. Please sign the document hash first.');
    }

    return executeBlockchainFunction(
      () => blockchainService.signContract(injector, accountAddress, contractHash, signature),
      'Signing contract on blockchain...'
    );
  }, [executeBlockchainFunction]);

  // *** FIXED: Deactivate contract ***
  const deactivateContract = useCallback(async (injector, accountAddress, contractHash, reason = 'User requested') => {
    if (!injector || !injector.signer) {
      throw new Error('Wallet is not properly connected. Please reconnect your wallet.');
    }

    if (!accountAddress) {
      throw new Error('Account address is required. Please connect your wallet.');
    }

    if (!contractHash) {
      throw new Error('Contract hash is required.');
    }

    return executeBlockchainFunction(
      () => blockchainService.deactivateContract(injector, accountAddress, contractHash, reason),
      'Deactivating contract on blockchain...'
    );
  }, [executeBlockchainFunction]);

  // *** FIXED: Complete contract ***
  const completeContract = useCallback(async (injector, accountAddress, contractHash) => {
    if (!injector || !injector.signer) {
      throw new Error('Wallet is not properly connected. Please reconnect your wallet.');
    }

    if (!accountAddress) {
      throw new Error('Account address is required. Please connect your wallet.');
    }

    if (!contractHash) {
      throw new Error('Contract hash is required.');
    }

    return executeBlockchainFunction(
      () => blockchainService.completeContract(injector, accountAddress, contractHash),
      'Completing contract on blockchain...'
    );
  }, [executeBlockchainFunction]);

  // *** FIXED: Update metadata ***
  const updateMetadata = useCallback(async (injector, accountAddress, contractHash, newMetadata) => {
    if (!injector || !injector.signer) {
      throw new Error('Wallet is not properly connected. Please reconnect your wallet.');
    }

    if (!accountAddress) {
      throw new Error('Account address is required. Please connect your wallet.');
    }

    if (!contractHash) {
      throw new Error('Contract hash is required.');
    }

    if (newMetadata && newMetadata.length > 1024) {
      throw new Error('Metadata is too long (maximum 1024 characters).');
    }

    return executeBlockchainFunction(
      () => blockchainService.updateMetadata(injector, accountAddress, contractHash, newMetadata || ''),
      'Updating contract metadata on blockchain...'
    );
  }, [executeBlockchainFunction]);

  // *** ENHANCED: Get contracts with better error handling ***
  const getContracts = useCallback(async (accountAddress) => {
    if (!accountAddress) {
      throw new Error('Account address is required to fetch contracts.');
    }

    return executeBlockchainFunction(
      () => blockchainService.getContractsByAccount(accountAddress),
      'Loading your contracts from blockchain...'
    );
  }, [executeBlockchainFunction]);

  // *** ENHANCED: Check contract exists ***
  const checkContractExists = useCallback(async (contractHash) => {
    if (!contractHash) {
      throw new Error('Contract hash is required to check existence.');
    }

    return executeBlockchainFunction(
      () => blockchainService.checkContractExists(contractHash),
      'Verifying contract on blockchain...'
    );
  }, [executeBlockchainFunction]);

  // *** ENHANCED: Get chain info ***
  const getChainInfo = useCallback(async () => {
    return executeBlockchainFunction(
      () => blockchainService.getChainInfo(),
      'Getting blockchain information...'
    );
  }, [executeBlockchainFunction]);

  // *** ENHANCED: Get contract statistics ***
  const getContractStatistics = useCallback(async () => {
    return executeBlockchainFunction(
      () => blockchainService.getContractStatistics(),
      'Loading contract statistics...'
    );
  }, [executeBlockchainFunction]);

  // *** NEW: Test blockchain connection ***
  const testConnection = useCallback(async () => {
    return executeBlockchainFunction(
      () => blockchainService.testQueries(),
      'Testing blockchain connection...'
    );
  }, [executeBlockchainFunction]);

  // *** NEW: Test transaction format (for debugging) ***
  const testTransactionFormat = useCallback(async (fileHash, firstParty, secondParty, thirdParty, contractName, metadata) => {
    return executeBlockchainFunction(
      () => blockchainService.testTransactionFormat(fileHash, firstParty, secondParty, thirdParty, contractName, metadata),
      'Testing transaction format...'
    );
  }, [executeBlockchainFunction]);

  // Get connection status (no async needed)
  const getConnectionStatus = useCallback(() => {
    return blockchainService.getConnectionStatus();
  }, []);

  // Disconnect (no loading state needed)
  const disconnect = useCallback(async () => {
    try {
      await blockchainService.disconnect();
      console.log('✅ Disconnected from blockchain service');
    } catch (error) {
      console.error('⚠️ Error during disconnect:', error);
    }
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // *** NEW: Retry last operation (useful for network issues) ***
  const retryLastOperation = useCallback(async (operation, loadingMessage = 'Retrying...') => {
    console.log('🔄 Retrying last operation...');
    return executeBlockchainFunction(operation, loadingMessage);
  }, [executeBlockchainFunction]);

  return {
    // State
    loading,
    error,
    
    // Core transaction methods (FIXED)
    initiateContract,
    signContract,
    deactivateContract,
    completeContract,
    updateMetadata,
    
    // Query methods (ENHANCED)
    getContracts,
    checkContractExists,
    getChainInfo,
    getContractStatistics,
    
    // Connection methods
    getConnectionStatus,
    disconnect,
    testConnection,
    
    // Utility methods
    clearError,
    retryLastOperation,
    testTransactionFormat, // For debugging
    
    // Helper functions
    formatAddress: blockchainService.formatAddress.bind(blockchainService),
    formatTimestamp: blockchainService.formatTimestamp.bind(blockchainService),
    getStatusDisplay: blockchainService.getStatusDisplay.bind(blockchainService)
  };
};