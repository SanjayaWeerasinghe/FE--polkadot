// components/TransactionDebugger.js - Complete Enhanced version

import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useTransactionDebug } from '../hooks/useTransactionDebug';

const TransactionDebugger = ({ onStatus }) => {
  const { account, getInjector } = useWallet();
  const { 
    loading, 
    results, 
    error, 
    createUnsignedTransaction,
    createSignedTransactionV2,        // ✅ NEW: Use signAsync approach
    createSignedTransaction,          // ⚠️ LEGACY: Keep for comparison
    testWithWorkingParameters,
    getPaymentInfo,
    clearResults
  } = useTransactionDebug();

  const [customParams, setCustomParams] = useState({
    fileHash: '0x65f61c36aa4608d0d7c4b46afcf8c57edc92210dddd533a7e42a6788cd06edea',
    firstParty: 'd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d',
    secondParty: '8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48',
    thirdParty: '90b5ab205c6974c9ea841be688864633dc9ca8a357843eeacf2314649965fe22',
    contractName: 'Sanjaya',
    metadata: 'Sanjaya'
  });

  const [useCustomParams, setUseCustomParams] = useState(false);

  // Test call data generation
  const handleTestCallData = async () => {
    try {
      onStatus('🔍 Testing call data generation...', 'info');
      
      const params = useCustomParams && account ? {
        ...customParams,
        firstParty: account.address
      } : customParams;

      const result = await createUnsignedTransaction(
        params.fileHash,
        params.firstParty,
        params.secondParty,
        params.thirdParty,
        params.contractName,
        params.metadata
      );

      // Compare with known working call data
      const workingCallData = '0x070065f61c36aa4608d0d7c4b46afcf8c57edc92210dddd533a7e42a6788cd06edead43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a4890b5ab205c6974c9ea841be688864633dc9ca8a357843eeacf2314649965fe221c53616e6a6179611c53616e6a617961';
      
      const matches = result.callData === workingCallData;
      
      if (matches) {
        onStatus('✅ Call data matches Polkadot Apps exactly!', 'success');
      } else {
        onStatus('⚠️ Call data differs from expected format', 'warning');
      }

    } catch (err) {
      onStatus(`❌ Call data test failed: ${err.message}`, 'error');
    }
  };

  // Test signed transaction creation using signAsync (v10+ approach)
  const handleTestSignedTransaction = async () => {
    if (!account) {
      onStatus('Please connect your wallet first', 'error');
      return;
    }

    try {
      onStatus('🔍 Creating signed transaction using signAsync...', 'info');
      
      const injector = await getInjector();
      
      const params = useCustomParams ? {
        ...customParams,
        firstParty: account.address
      } : customParams;

      // ✅ Use the NEW signAsync method (should not fail with DataCloneError)
      const result = await createSignedTransactionV2(
        account.address,
        injector,
        params.fileHash,
        params.firstParty,
        params.secondParty,
        params.thirdParty,
        params.contractName,
        params.metadata
      );

      if (result.success) {
        onStatus('✅ Signed transaction created successfully using signAsync!', 'success');
      } else {
        onStatus(`❌ Failed to create signed transaction: ${result.error}`, 'error');
      }

    } catch (err) {
      if (err.message.includes('Cancelled')) {
        onStatus('❌ Transaction signing was cancelled', 'error');
      } else {
        onStatus(`❌ Signed transaction failed: ${err.message}`, 'error');
      }
    }
  };

  // Test legacy manual payload signing (for comparison)
  const handleTestLegacySignedTransaction = async () => {
    if (!account) {
      onStatus('Please connect your wallet first', 'error');
      return;
    }

    try {
      onStatus('⚠️ Testing legacy manual payload signing (may fail)...', 'info');
      
      const injector = await getInjector();
      
      const params = useCustomParams ? {
        ...customParams,
        firstParty: account.address
      } : customParams;

      // ⚠️ Use the LEGACY manual payload method (likely to fail with DataCloneError)
      const result = await createSignedTransaction(
        account.address,
        injector,
        params.fileHash,
        params.firstParty,
        params.secondParty,
        params.thirdParty,
        params.contractName,
        params.metadata
      );

      if (result.success) {
        onStatus('✅ Legacy signing worked (unexpected but good)!', 'success');
      } else {
        onStatus(`❌ Legacy signing failed as expected: ${result.error}`, 'warning');
      }

    } catch (err) {
      if (err.message.includes('DataCloneError')) {
        onStatus('❌ Legacy method failed with DataCloneError (as expected)', 'warning');
      } else if (err.message.includes('Cancelled')) {
        onStatus('❌ Transaction signing was cancelled', 'error');
      } else {
        onStatus(`❌ Legacy signing failed: ${err.message}`, 'error');
      }
    }
  };

  // Test with working parameters
  const handleTestWorkingParameters = async () => {
    if (!account) {
      onStatus('Please connect your wallet first', 'error');
      return;
    }

    try {
      onStatus('🧪 Testing with exact working parameters...', 'info');
      
      const injector = await getInjector();
      const result = await testWithWorkingParameters(account.address, injector);

      if (result.summary.callDataMatches && result.summary.signedTransactionCreated) {
        onStatus('🎉 All tests passed! Transaction encoding is working correctly.', 'success');
      } else if (result.summary.callDataMatches) {
        onStatus('✅ Call data is correct, but signing failed', 'warning');
      } else {
        onStatus('❌ Call data encoding issue detected', 'error');
      }

    } catch (err) {
      onStatus(`❌ Working parameters test failed: ${err.message}`, 'error');
    }
  };

  // Test payment info
  const handleTestPaymentInfo = async () => {
    if (!account) {
      onStatus('Please connect your wallet first', 'error');
      return;
    }

    try {
      onStatus('💰 Getting payment information...', 'info');
      
      const params = useCustomParams ? {
        ...customParams,
        firstParty: account.address
      } : customParams;

      const result = await getPaymentInfo(
        account.address,
        params.fileHash,
        params.firstParty,
        params.secondParty,
        params.thirdParty,
        params.contractName,
        params.metadata
      );

      if (result.success) {
        onStatus(`💰 Estimated fee: ${result.partialFee} units`, 'info');
      } else {
        onStatus(`❌ Fee estimation failed: ${result.error}`, 'error');
      }

    } catch (err) {
      onStatus(`❌ Payment info failed: ${err.message}`, 'error');
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-glass animate-fadeInUp mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          🔬 Transaction Debugger
        </h3>
        <button
          onClick={clearResults}
          className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Clear Results
        </button>
      </div>
      
      <p className="text-gray-600 mb-6">
        Create and analyze signed transactions without sending them to debug WASM issues and transaction encoding.
      </p>

      {/* Custom Parameters Toggle */}
      <div className="mb-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={useCustomParams}
            onChange={(e) => setUseCustomParams(e.target.checked)}
            className="rounded"
          />
          Use custom parameters (will replace first party with your address)
        </label>
      </div>

      {/* Custom Parameters Form */}
      {useCustomParams && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border">
          <h4 className="font-medium text-gray-700 mb-3">Custom Parameters</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">File Hash</label>
              <input
                type="text"
                value={customParams.fileHash}
                onChange={(e) => setCustomParams(prev => ({ ...prev, fileHash: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                placeholder="0x..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Second Party</label>
              <input
                type="text"
                value={customParams.secondParty}
                onChange={(e) => setCustomParams(prev => ({ ...prev, secondParty: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                placeholder="5..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Third Party</label>
              <input
                type="text"
                value={customParams.thirdParty}
                onChange={(e) => setCustomParams(prev => ({ ...prev, thirdParty: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                placeholder="5..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Contract Name</label>
              <input
                type="text"
                value={customParams.contractName}
                onChange={(e) => setCustomParams(prev => ({ ...prev, contractName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Contract name"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <button
          onClick={handleTestCallData}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            '🧪'
          )}
          Test Call Data
        </button>
        
        <button
          onClick={handleTestSignedTransaction}
          disabled={loading || !account}
          className="bg-green-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            '✅'
          )}
          signAsync Method
        </button>

        <button
          onClick={handleTestLegacySignedTransaction}
          disabled={loading || !account}
          className="bg-yellow-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            '⚠️'
          )}
          Legacy Method
        </button>

        <button
          onClick={handleTestWorkingParameters}
          disabled={loading || !account}
          className="bg-purple-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            '🎯'
          )}
          Test All
        </button>

        <button
          onClick={handleTestPaymentInfo}
          disabled={loading || !account}
          className="bg-orange-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            '💰'
          )}
          Payment Info
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <h4 className="font-semibold text-red-800 mb-2">❌ Error</h4>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Results Display */}
      {results && (
        <div className="space-y-4">
          {/* Unsigned Transaction Results */}
          {results.type === 'unsigned' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                🧪 Unsigned Transaction Analysis
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Generated Call Data:
                  </label>
                  <code className="block bg-white p-3 rounded text-xs font-mono break-all border">
                    {results.data.callData}
                  </code>
                </div>

                <div className="text-sm text-gray-600 bg-blue-100 p-3 rounded">
                  <strong>Parameters:</strong>
                  <ul className="mt-2 space-y-1">
                    <li>• Length: {results.data.callDataLength} characters</li>
                    <li>• Contract name: "{results.data.parameters.contractName}" ({results.data.parameters.contractNameLength} bytes)</li>
                    <li>• Metadata: "{results.data.parameters.metadata}" ({results.data.parameters.metadataLength} bytes)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Signed Transaction Results */}
          {results.type === 'signed' && results.data.success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                ✅ Signed Transaction Created
              </h4>
              
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Nonce:</strong> {results.data.context.nonce}
                  </div>
                  <div>
                    <strong>Block Number:</strong> {results.data.context.blockNumber}
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Complete Signed Transaction:
                  </label>
                  <code className="block bg-white p-3 rounded text-xs font-mono break-all border max-h-32 overflow-y-auto">
                    {results.data.signedTransaction}
                  </code>
                </div>

                <div className="bg-green-100 p-3 rounded">
                  <strong>✅ Success!</strong> This signed transaction is ready to be broadcast to the network.
                  You can copy it and send it manually if needed.
                </div>
              </div>
            </div>
          )}

          {/* Failed Signed Transaction */}
          {results.type === 'signed' && !results.data.success && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h4 className="font-semibold text-red-800 mb-2">❌ Signed Transaction Failed</h4>
              <p className="text-red-700 text-sm">{results.data.error}</p>
            </div>
          )}

          {/* Comparison Results */}
          {results.type === 'comparison' && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                🎯 Complete Test Results
              </h4>
              
              <div className="space-y-4">
                {/* Summary */}
                <div className="bg-purple-100 p-3 rounded">
                  <strong>Summary:</strong>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 text-sm">
                    <div className="flex justify-between">
                      <span>Call Data Match:</span>
                      <span className={results.data.summary.callDataMatches ? 'text-green-600' : 'text-red-600'}>
                        {results.data.summary.callDataMatches ? '✅' : '❌'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Signed Created:</span>
                      <span className={results.data.summary.signedTransactionCreated ? 'text-green-600' : 'text-red-600'}>
                        {results.data.summary.signedTransactionCreated ? '✅' : '❌'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ready for Test:</span>
                      <span className={results.data.summary.readyForTesting ? 'text-green-600' : 'text-red-600'}>
                        {results.data.summary.readyForTesting ? '✅' : '❌'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Call Data Comparison */}
                {results.data.callDataComparison && (
                  <div>
                    <strong>Call Data Comparison:</strong>
                    <div className={`mt-2 p-3 rounded ${
                      results.data.callDataComparison.match 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {results.data.callDataComparison.match 
                        ? '✅ Perfect match with Polkadot Apps encoding!'
                        : '❌ Call data differs from expected format'
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Info Results */}
          {results.type === 'payment' && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                💰 Payment Information
              </h4>
              
              {results.data.success ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Partial Fee:</span>
                    <span className="font-mono">{results.data.partialFee} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weight:</span>
                    <span className="font-mono">{results.data.weight}</span>
                  </div>
                  <div className="bg-orange-100 p-3 rounded mt-3">
                    ✅ Transaction fee estimation successful - this indicates the transaction is valid.
                  </div>
                </div>
              ) : (
                <div className="text-red-700 text-sm">
                  ❌ Payment info failed: {results.data.error}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 text-xs text-gray-500 space-y-1">
        <p><strong>What each test does:</strong></p>
        <div className="pl-2 space-y-1">
          <p>• 🧪 <strong>Test Call Data:</strong> Verify unsigned transaction encoding matches Polkadot Apps</p>
          <p>• ✅ <strong>signAsync Method:</strong> Generate signed transaction using v10+ signAsync (recommended)</p>
          <p>• ⚠️ <strong>Legacy Method:</strong> Test old manual payload signing (will likely fail with DataCloneError)</p>
          <p>• 🎯 <strong>Test All:</strong> Run comprehensive test with exact working parameters</p>
          <p>• 💰 <strong>Payment Info:</strong> Check if transaction validation passes (fee estimation)</p>
        </div>
        
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
          <p><strong>💡 Debug Strategy:</strong></p>
          <ul className="mt-1 space-y-1">
            <li>1. If call data matches ✅ but signed transaction fails ❌ → Signing/wallet issue</li>
            <li>2. If call data differs ❌ → Parameter encoding issue</li>
            <li>3. If payment info fails ❌ → Transaction validation issue</li>
            <li>4. If all pass ✅ → Ready to test actual transaction submission</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TransactionDebugger;