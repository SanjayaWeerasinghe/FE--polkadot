// hooks/useTransactionDebug.js - React hook for transaction debugging

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

  // Create signed transaction without sending
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

  // Test with working parameters
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

    // Actions
    createUnsignedTransaction,
    createSignedTransaction,
    testWithWorkingParameters,
    getPaymentInfo,
    compareTransactions,
    clearResults,
    disconnect,

    // Utilities
    isConnected: transactionDebugService.api?.isConnected || false,
  };
};