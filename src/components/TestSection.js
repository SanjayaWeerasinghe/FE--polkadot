import React, { useState } from 'react';
import blockchainService from '../services/blockchainService';

const TestSection = ({ onStatus }) => {
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);

  // Test queries
  const testQueries = async () => {
    setTesting(true);
    setTestResults(null);
    
    try {
      onStatus('🔍 Testing blockchain queries...', 'info');
      
      const result = await blockchainService.testQueries();
      
      setTestResults(result);
      
      if (result.success) {
        onStatus(`✅ ${result.message}`, 'success');
      } else {
        onStatus(`❌ ${result.message}: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Test failed:', error);
      onStatus(`❌ Test failed: ${error.message}`, 'error');
      setTestResults({
        success: false,
        error: error.message,
        message: 'Connection or query failed'
      });
    } finally {
      setTesting(false);
    }
  };

  // Test specific contract existence
  const testContractExists = async () => {
    const testHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    
    try {
      onStatus('🔍 Testing contract existence check...', 'info');
      
      const result = await blockchainService.testContractExists(testHash);
      
      if (result.exists) {
        onStatus(`✅ Contract exists! ID: ${result.contractId}`, 'success');
      } else {
        onStatus('✅ Contract existence check working (contract not found, as expected)', 'success');
      }
    } catch (error) {
      onStatus(`❌ Contract test failed: ${error.message}`, 'error');
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-glass animate-fadeInUp">
      <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        🔬 Blockchain Test Center
      </h4>
      
      {/* Test Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={testQueries}
          disabled={testing}
          className="bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {testing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Testing...
            </>
          ) : (
            <>
              🔍 Test Queries
            </>
          )}
        </button>
        
        <button
          onClick={testContractExists}
          disabled={testing}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🔎 Test Contract Check
        </button>
      </div>

      {/* Test Results */}
      {testResults && (
        <div className={`p-4 rounded-xl border ${
          testResults.success 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="font-semibold mb-2 flex items-center gap-2">
            {testResults.success ? '✅' : '❌'} Test Results
          </div>
          
          {testResults.success ? (
            <div className="space-y-2 text-sm">
              <div>📊 Next Contract ID: <code className="bg-green-100 px-1 rounded">{testResults.nextContractId}</code></div>
              <div>📋 Existing Contracts: <code className="bg-green-100 px-1 rounded">{testResults.existingContractsCount}</code></div>
              <div>🔗 Hash Mappings: <code className="bg-green-100 px-1 rounded">{testResults.hashMappingsCount}</code></div>
              <div>🌐 Chain: <code className="bg-green-100 px-1 rounded">{testResults.chainInfo?.chain || 'Unknown'}</code></div>
              <div className="mt-3 p-2 bg-green-100 rounded text-xs">
                ✅ <strong>Pallet Integration:</strong> Working perfectly! The blockchain can read your pallet's storage.
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div><strong>Error:</strong> {testResults.error}</div>
              <div><strong>Pallet Found:</strong> {testResults.palletExists ? '✅ Yes' : '❌ No'}</div>
              {testResults.palletExists ? (
                <div className="mt-3 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
                  ⚠️ Pallet exists but queries failed - may indicate runtime issues.
                </div>
              ) : (
                <div className="mt-3 p-2 bg-red-100 rounded text-xs">
                  ❌ Pallet not found in runtime - check your runtime configuration.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p><strong>What this tests:</strong></p>
        <div className="pl-2 space-y-1">
          <p>• 🔌 Connection to your blockchain node</p>
          <p>• 📦 Pallet integration in runtime</p>
          <p>• 💾 Storage query functionality</p>
          <p>• 🔍 Contract existence checking</p>
        </div>
        <p className="mt-2 text-blue-600">
          💡 If queries work but transactions fail, the issue is with transaction validation, not pallet integration.
        </p>
      </div>
    </div>
  );
};

export default TestSection;