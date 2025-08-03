// hooks/useTransactionDebug.js - Updated to use signAsync approach

import { useState, useCallback } from 'react';
import transactionDebugService from '../services/transactionDebugService';

export const useTransactionDebug = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Clear previous results and errors
  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  // Create unsigned transaction
  const createUnsignedTransaction = useCallback(async (
    fileHash,
    firstParty,
    secondParty,
    thirdParty,
    contractName,
    metadata
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await transactionDebugService.createUnsignedTransaction(
        fileHash,
        firstParty,
        secondParty,
        thirdParty,
        contractName,
        metadata
      );

      setResults({ type: 'unsigned', data: result });
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ NEW: Create signed transaction using signAsync (RECOMMENDED)
  const createSignedTransactionV2 = useCallback(async (
    accountAddress,
    injector,
    fileHash,
    firstParty,
    secondParty,
    thirdParty,
    contractName,
    metadata,
    options = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await transactionDebugService.createSignedTransactionV2(
        accountAddress,
        injector,
        fileHash,
        firstParty,
        secondParty,
        thirdParty,
        contractName,
        metadata,
        options
      );

      setResults({ type: 'signed', data: result });
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ⚠️ LEGACY: Create signed transaction with manual payload (PROBLEMATIC)
  const createSignedTransaction = useCallback(async (
    accountAddress,
    injector,
    fileHash,
    firstParty,
    secondParty,
    thirdParty,
    contractName,
    metadata,
    options = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await transactionDebugService.createSignedTransaction(
        accountAddress,
        injector,
        fileHash,
        firstParty,
        secondParty,
        thirdParty,
        contractName,
        metadata,
        options
      );

      setResults({ type: 'signed', data: result });
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ NEW: Send manual transaction from hex string
  const sendManualTransaction = useCallback(async (signedTransactionHex) => {
    setLoading(true);
    setError(null);

    try {
      const result = await transactionDebugService.sendManualTransaction(signedTransactionHex);
      setResults({ type: 'manual', data: result });
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  const directSignAndSend = useCallback(async (
    accountAddress,
    injector,
    fileHash,
    firstParty,
    secondParty,
    thirdParty,
    contractName,
    metadata,
    options = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await transactionDebugService.directSignAndSend(
        accountAddress,
        injector,
        fileHash,
        firstParty,
        secondParty,
        thirdParty,
        contractName,
        metadata,
        options
      );

      setResults({ type: 'sent', data: result });
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  const testWithWorkingParameters = useCallback(async (accountAddress, injector) => {
    setLoading(true);
    setError(null);

    try {
      const result = await transactionDebugService.testWithWorkingParameters(
        accountAddress,
        injector
      );

      setResults({ type: 'comparison', data: result });
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get payment information
  const getPaymentInfo = useCallback(async (
    accountAddress,
    fileHash,
    firstParty,
    secondParty,
    thirdParty,
    contractName,
    metadata
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await transactionDebugService.getPaymentInfo(
        accountAddress,
        fileHash,
        firstParty,
        secondParty,
        thirdParty,
        contractName,
        metadata
      );

      setResults({ type: 'payment', data: result });
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Compare two transactions
  const compareTransactions = useCallback((ourSignedHex, workingSignedHex) => {
    try {
      const comparison = transactionDebugService.compareWithWorkingTransaction(
        ourSignedHex,
        workingSignedHex
      );

      setResults({ type: 'comparison', data: comparison });
      return comparison;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Disconnect service
  const disconnect = useCallback(async () => {
    try {
      await transactionDebugService.disconnect();
    } catch (err) {
      console.error('Error disconnecting debug service:', err);
    }
  }, []);

  return {
    // State
    loading,
    results,
    error,

    // Actions (NEW signAsync method is primary)
    createUnsignedTransaction,
    createSignedTransactionV2,        // ✅ NEW: Recommended signAsync approach
    createSignedTransaction,          // ⚠️ LEGACY: Manual payload (may fail)
    directSignAndSend,                // 🚀 NEW: Direct sign and send
    sendManualTransaction,            // 📤 NEW: Send manual hex transaction
    testWithWorkingParameters,        // ✅ UPDATED: Now uses signAsync
    getPaymentInfo,
    compareTransactions,
    clearResults,
    disconnect,

    // Utilities
    isConnected: transactionDebugService.api?.isConnected || false,
  };
};