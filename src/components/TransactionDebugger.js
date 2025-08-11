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
    directSignAndSend,                // 🚀 NEW: Direct sign and send
    sendManualTransaction,            // 📤 NEW: Send manual transaction
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
  const [manualTransactionHex, setManualTransactionHex] = useState('');

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

  // Send manual transaction from hex input
  const handleSendManualTransaction = async () => {
    if (!manualTransactionHex.trim()) {
      onStatus('Please enter a signed transaction hex first', 'error');
      return;
    }

    const confirmed = window.confirm(
      '📤 Send this manually edited transaction?\n\n' +
      '• This will broadcast the transaction to the blockchain\n' +
      '• You will be charged fees if successful\n' +
      '• Make sure you have edited the hex correctly\n\n' +
      'Are you sure?'
    );

    if (!confirmed) {
      onStatus('❌ Manual send cancelled', 'info');
      return;
    }

    try {
      onStatus('📤 Sending manually edited transaction...', 'info');
      
      const result = await sendManualTransaction(manualTransactionHex.trim());
      
      if (result.success) {
        onStatus(`🎉 Manual transaction successful! Contract ID: ${result.contractId}`, 'success');
        onStatus(`📋 Transaction hash: ${result.txHash}`, 'info');
      } else {
        onStatus(`❌ Manual transaction failed: ${result.error}`, 'error');
      }
      
    } catch (err) {
      if (err.message.includes('WASM')) {
        onStatus('❌ WASM execution failed - transaction format issue confirmed', 'error');
      } else if (err.message.includes('Invalid transaction')) {
        onStatus('❌ Invalid transaction format - check your hex editing', 'error');
      } else {
        onStatus(`❌ Manual transaction failed: ${err.message}`, 'error');
      }
    }
  };
  const handleDirectSignAndSend = async () => {
    if (!account) {
      onStatus('Please connect your wallet first', 'error');
      return;
    }

    const confirmed = window.confirm(
      '🚀 This will create and send a REAL transaction to the blockchain!\n\n' +
      '• You will be charged transaction fees\n' +
      '• A real contract will be created\n' +
      '• This cannot be undone\n\n' +
      'Are you sure you want to proceed?'
    );

    if (!confirmed) {
      onStatus('❌ Transaction cancelled by user', 'info');
      return;
    }

    try {
      onStatus('🚀 Creating and sending transaction to blockchain...', 'info');
      
      const injector = await getInjector();
      
      const params = useCustomParams ? {
        ...customParams,
        firstParty: account.address
      } : {
        ...customParams,
        firstParty: account.address // Always use current account as first party
      };

      // 🚀 Direct sign and send - this will actually create a contract!
      const result = await directSignAndSend(
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
        onStatus(`🎉 SUCCESS! Contract created with ID: ${result.contractId}`, 'success');
        onStatus(`📋 Transaction hash: ${result.txHash}`, 'info');
        if (result.paymentInfo) {
          onStatus(`💰 Fee paid: ${result.paymentInfo.partialFee} units`, 'info');
        }
      } else {
        onStatus(`❌ Transaction failed: ${result.error}`, 'error');
      }

    } catch (err) {
      if (err.message.includes('Cancelled')) {
        onStatus('❌ Transaction was cancelled by user', 'error');
      } else if (err.message.includes('ContractAlreadyExists')) {
        onStatus('❌ A contract with this document already exists', 'error');
      } else if (err.message.includes('Pallet Error')) {
        onStatus(`❌ Blockchain error: ${err.message}`, 'error');
      } else {
        onStatus(`❌ Transaction failed: ${err.message}`, 'error');
      }
    }
  };
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

      {/* Manual Transaction Input Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl border">
        <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
          📤 Manual Transaction Sender
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            Edit hex to fix format issues
          </span>
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Signed Transaction Hex (editable):
            </label>
            <textarea
              value={manualTransactionHex}
              onChange={(e) => setManualTransactionHex(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono resize-vertical h-32"
              placeholder="Paste or edit your signed transaction hex here (e.g., 0xe5038400... or 0xe9038400...)"
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                💡 Tip: Change the 4th character from '5' to '9' to test format fix
              </p>
              <span className="text-xs text-gray-400">
                {manualTransactionHex.length} characters
              </span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleSendManualTransaction}
              disabled={loading || !manualTransactionHex.trim()}
              className="bg-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                '📤'
              )}
              Send Manual Transaction
            </button>
            
            <button
              onClick={() => {
                if (manualTransactionHex.startsWith('0xe5')) {
                  setManualTransactionHex(manualTransactionHex.replace('0xe5', '0xe9'));
                  onStatus('✅ Changed 0xe5 to 0xe9 in transaction hex', 'success');
                } else {
                  onStatus('⚠️ Transaction does not start with 0xe5', 'warning');
                }
              }}
              disabled={!manualTransactionHex.includes('0xe5')}
              className="bg-yellow-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔧 Fix Format (5→9)
            </button>
            
            <button
              onClick={() => {
                setManualTransactionHex('');
                onStatus('✅ Manual transaction input cleared', 'info');
              }}
              disabled={!manualTransactionHex}
              className="bg-gray-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🗑️ Clear
            </button>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-600 bg-blue-50 p-3 rounded border border-blue-200">
          <strong>How to use:</strong>
          <ol className="mt-1 space-y-1 list-decimal list-inside">
            <li>First, create a signed transaction using "✅ signAsync Method" above</li>
            <li>Click "📋 Copy to Manual Input" to copy it to this text box</li>
            <li>Edit the hex manually (e.g., change 0xe<strong>5</strong> to 0xe<strong>9</strong>)</li>
            <li>Click "📤 Send Manual Transaction" to test your edited version</li>
          </ol>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
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
          onClick={handleDirectSignAndSend}
          disabled={loading || !account}
          className="bg-red-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            '🚀'
          )}
          Sign & Send
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
                  <button
                    onClick={() => {
                      setManualTransactionHex(results.data.signedTransaction);
                      onStatus('✅ Transaction hex copied to manual input box', 'success');
                    }}
                    className="mt-2 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                  >
                    📋 Copy to Manual Input
                  </button>
                </div>

                <div className="bg-green-100 p-3 rounded">
                  <strong>✅ Success!</strong> This signed transaction is ready to be broadcast to the network.
                  You can copy it to the manual input box below and edit it before sending.
                </div>
              </div>
            </div>
          )}

          {/* Sent Transaction Results */}
          {results.type === 'sent' && results.data.success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                🎉 Transaction Sent Successfully!
              </h4>
              
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <strong>Contract ID:</strong> {results.data.contractId || 'N/A'}
                  </div>
                  <div>
                    <strong>Block Hash:</strong> 
                    <code className="ml-1 text-xs">{results.data.blockHash?.slice(0, 20)}...</code>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Transaction Hash:
                  </label>
                  <code className="block bg-white p-3 rounded text-xs font-mono break-all border">
                    {results.data.txHash}
                  </code>
                </div>

                {results.data.paymentInfo && (
                  <div className="bg-green-100 p-3 rounded">
                    <strong>💰 Transaction Fee:</strong> {results.data.paymentInfo.partialFee} units
                    <br />
                    <strong>⚖️ Weight:</strong> {results.data.paymentInfo.weight}
                  </div>
                )}

                {results.data.eventData && (
                  <div className="bg-blue-100 p-3 rounded">
                    <strong>📋 Contract Event Data:</strong>
                    <pre className="text-xs mt-1 font-mono">
                      {JSON.stringify(results.data.eventData, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="bg-green-100 p-3 rounded">
                  <strong>🎉 SUCCESS!</strong> Your transaction was successfully processed by the blockchain. 
                  This proves your transaction encoding is working perfectly!
                </div>
              </div>
            </div>
          )}

          {/* Manual Transaction Results */}
          {results.type === 'manual' && results.data.success && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                🎉 Manual Transaction Sent Successfully!
              </h4>
              
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <strong>Contract ID:</strong> {results.data.contractId || 'N/A'}
                  </div>
                  <div>
                    <strong>Block Hash:</strong> 
                    <code className="ml-1 text-xs">{results.data.blockHash?.slice(0, 20)}...</code>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Transaction Hash:
                  </label>
                  <code className="block bg-white p-3 rounded text-xs font-mono break-all border">
                    {results.data.txHash}
                  </code>
                </div>

                {results.data.eventData && (
                  <div className="bg-purple-100 p-3 rounded">
                    <strong>📋 Contract Event Data:</strong>
                    <pre className="text-xs mt-1 font-mono">
                      {JSON.stringify(results.data.eventData, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="bg-green-100 p-3 rounded">
                  <strong>🎉 SUCCESS!</strong> Your manually edited transaction was accepted by the blockchain! 
                  This proves that manual editing can fix transaction format issues.
                </div>
              </div>
            </div>
          )}

          {/* Failed Manual Transaction */}
          {results.type === 'manual' && !results.data.success && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h4 className="font-semibold text-red-800 mb-2">❌ Manual Transaction Failed</h4>
              <p className="text-red-700 text-sm mb-3">{results.data.error}</p>
              <div className="text-xs text-red-600 bg-red-100 p-2 rounded">
                <strong>Original Hex:</strong> {results.data.originalHex?.slice(0, 100)}...
              </div>
            </div>
          )}
          {results.type === 'sent' && !results.data.success && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h4 className="font-semibold text-red-800 mb-2">❌ Transaction Failed</h4>
              <p className="text-red-700 text-sm">{results.data.error}</p>
              <div className="mt-3 text-xs text-red-600">
                This indicates a blockchain validation error, not an encoding issue.
              </div>
            </div>
          )}
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
          <p>• 🚀 <strong>Sign & Send:</strong> Actually broadcast transaction to blockchain (REAL TRANSACTION!)</p>
          <p>• 🎯 <strong>Test All:</strong> Run comprehensive test with exact working parameters</p>
          <p>• 💰 <strong>Payment Info:</strong> Check if transaction validation passes (fee estimation)</p>
        </div>
      </div>

      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
        <p><strong>💡 Debug Strategy:</strong></p>
          <ul className="mt-1 space-y-1">
            <li>1. If call data matches ✅ but signed transaction fails ❌ → Signing/wallet issue</li>
            <li>2. If call data differs ❌ → Parameter encoding issue</li>
            <li>3. If payment info fails ❌ → Transaction validation issue</li>
            <li>4. If signAsync works ✅ but Sign & Send fails ❌ → Blockchain/pallet logic issue</li>
            <li>5. If Sign & Send succeeds 🎉 → Everything is working perfectly!</li>
          </ul>
        </div>
        
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-red-800">
          <p><strong>⚠️ IMPORTANT:</strong> The "🚀 Sign & Send" button creates REAL transactions on the blockchain and charges real fees. Use it only when you're ready to test end-to-end functionality!</p>
        </div>
      </div>


  );
};

export default TransactionDebugger;