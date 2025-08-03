// Fixed InitiateContract.js with proper transaction handling

import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useBlockchain } from '../hooks/useBlockchain';
import FileUpload from '../components/FileUpload';
import { InlineSpinner } from '../components/LoadingSpinner';

const InitiateContract = ({ onBack, onStatus }) => {
  const { account, getInjector, isValidAddress } = useWallet();
  const { initiateContract, loading, error, clearError } = useBlockchain();
  
  const [fileInfo, setFileInfo] = useState(null);
  const [formData, setFormData] = useState({
    firstParty: account?.address || '',
    secondParty: '',
    thirdParty: '',
    contractName: '',
    metadata: ''
  });

  // Update first party when account changes
  React.useEffect(() => {
    if (account && !formData.firstParty) {
      setFormData(prev => ({ ...prev, firstParty: account.address }));
    }
  }, [account, formData.firstParty]);

  // Clear error when form data changes
  React.useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formData, fileInfo, clearError, error]);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Comprehensive form validation
  const validateForm = () => {
    const { firstParty, secondParty, thirdParty, contractName } = formData;

    // File validation
    if (!fileInfo?.hash) {
      onStatus('❌ Please upload a contract document first', 'error');
      return false;
    }

    // Contract name validation
    if (!contractName || contractName.trim() === '') {
      onStatus('❌ Please enter a contract name', 'error');
      return false;
    }

    if (contractName.trim().length > 512) {
      onStatus('❌ Contract name must be 512 characters or less', 'error');
      return false;
    }

    // Address validation
    if (!isValidAddress(firstParty)) {
      onStatus('❌ Invalid first party address', 'error');
      return false;
    }

    if (!isValidAddress(secondParty)) {
      onStatus('❌ Invalid second party address', 'error');
      return false;
    }

    if (!isValidAddress(thirdParty)) {
      onStatus('❌ Invalid third party address', 'error');
      return false;
    }

    // Check for duplicate addresses
    const addresses = [firstParty, secondParty, thirdParty];
    const uniqueAddresses = new Set(addresses);
    if (uniqueAddresses.size !== addresses.length) {
      onStatus('❌ All party addresses must be different', 'error');
      return false;
    }

    // Metadata validation
    if (formData.metadata && formData.metadata.length > 1024) {
      onStatus('❌ Metadata must be 1024 characters or less', 'error');
      return false;
    }

    return true;
  };

  // *** FIXED: Handle form submission with proper transaction handling ***
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (!account) {
      onStatus('❌ Please ensure wallet is connected', 'error');
      return;
    }

    try {
      // Clear any previous errors
      clearError();
      
      onStatus('🔄 Preparing contract transaction...', 'info');

      // Get the injector for signing
      const injector = await getInjector();
      
      onStatus('🔄 Please confirm the transaction in your wallet...', 'info');

      // *** CRITICAL FIX: Use the fixed blockchain service ***
      const result = await initiateContract(
        injector,
        account.address,
        fileInfo.hash,
        formData.firstParty.trim(),
        formData.secondParty.trim(),
        formData.thirdParty.trim(),
        formData.contractName.trim(),
        formData.metadata.trim()
      );

      // *** SUCCESS HANDLING ***
      console.log('🎉 Contract creation result:', result);
      
      if (result.success) {
        onStatus(`🎉 Contract "${formData.contractName.trim()}" created successfully!`, 'success');
        
        if (result.contractId) {
          console.log('📋 Contract ID:', result.contractId);
          onStatus(`📋 Contract ID: ${result.contractId}`, 'info');
        }
        
        if (result.txHash) {
          console.log('📋 Transaction Hash:', result.txHash);
        }
        
        // Reset form after successful creation
        setFormData({
          firstParty: account.address,
          secondParty: '',
          thirdParty: '',
          contractName: '',
          metadata: ''
        });
        setFileInfo(null);
        
      } else {
        onStatus('❌ Contract creation failed - please try again', 'error');
      }

    } catch (error) {
      console.error('❌ Contract initiation error:', error);
      
      // The error handling is now done in the useBlockchain hook
      // Just display the user-friendly error message
      onStatus(`❌ ${error.message}`, 'error');
    }
  };

  // Auto-fill current user address
  const handleAutoFill = (field) => {
    if (account) {
      handleInputChange(field, account.address);
    }
  };

  // *** NEW: Test transaction format (for debugging) ***
  const handleTestTransaction = async () => {
    if (!validateForm()) return;
    
    try {
      // Use the testTransactionFormat from the already destructured hook
      if (typeof initiateContract.testTransactionFormat === 'function') {
        const result = await initiateContract.testTransactionFormat(
          fileInfo.hash,
          formData.firstParty,
          formData.secondParty,
          formData.thirdParty,
          formData.contractName,
          formData.metadata
        );
        
        console.log('🔍 Transaction format test:', result);
        onStatus('✅ Transaction format test completed - check console', 'info');
      } else {
        onStatus('❌ Test function not available', 'error');
      }
      
    } catch (error) {
      console.error('❌ Transaction format test failed:', error);
      onStatus(`❌ Test failed: ${error.message}`, 'error');
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-glass-lg border border-white/20 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-gray-100">
        <button
          onClick={onBack}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          ← Back
        </button>
        <h2 className="text-3xl font-bold text-gray-800">📝 Initiate New Contract</h2>
      </div>

      {/* *** NEW: Error display banner *** */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-2xl">❌</span>
            <div className="flex-1">
              <h4 className="font-semibold text-red-800 mb-1">Transaction Error</h4>
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={clearError}
                className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <FileUpload
          onFileSelect={setFileInfo}
          fileInfo={fileInfo}
          disabled={loading}
        />

        {/* Contract Name Field */}
        <div>
          <label className="block font-semibold text-gray-700 mb-3 text-lg">
            Contract Name *
          </label>
          <input
            type="text"
            value={formData.contractName}
            onChange={(e) => handleInputChange('contractName', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none"
            placeholder="Enter a descriptive name for this contract (e.g., 'Employment Agreement - John Doe')"
            required
            maxLength={512}
            disabled={loading}
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-500">A descriptive name to identify this contract</p>
            <p className="text-xs text-gray-400">{formData.contractName.length}/512</p>
          </div>
        </div>

        {/* Metadata Field */}
        <div>
          <label className="block font-semibold text-gray-700 mb-3 text-lg">
            Contract Metadata <span className="text-gray-500 font-normal">(Optional)</span>
          </label>
          <textarea
            value={formData.metadata}
            onChange={(e) => handleInputChange('metadata', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none resize-vertical"
            placeholder="Additional information about the contract (terms, conditions, notes, etc.)"
            rows={4}
            maxLength={1024}
            disabled={loading}
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-500">Additional contract details, terms, or notes</p>
            <p className="text-xs text-gray-400">{formData.metadata.length}/1024</p>
          </div>
        </div>

        {/* Party Addresses */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* First Party */}
          <div>
            <label className="block font-semibold text-gray-700 mb-2 text-lg">
              First Party Address *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.firstParty}
                onChange={(e) => handleInputChange('firstParty', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-mono transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none pr-12"
                placeholder="5D... (Polkadot address)"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => handleAutoFill('firstParty')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700 text-xs px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
                title="Use my address"
                disabled={loading}
              >
                Me
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Usually you (the contract creator)</p>
          </div>

          {/* Second Party */}
          <div>
            <label className="block font-semibold text-gray-700 mb-2 text-lg">
              Second Party Address *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.secondParty}
                onChange={(e) => handleInputChange('secondParty', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-mono transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none pr-12"
                placeholder="5D... (Polkadot address)"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => handleAutoFill('secondParty')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700 text-xs px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
                title="Use my address"
                disabled={loading}
              >
                Me
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">The other contracting party</p>
          </div>

          {/* Third Party */}
          <div>
            <label className="block font-semibold text-gray-700 mb-2 text-lg">
              Third Party (Notary) Address *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.thirdParty}
                onChange={(e) => handleInputChange('thirdParty', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-mono transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none pr-12"
                placeholder="5D... (Polkadot address)"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => handleAutoFill('thirdParty')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700 text-xs px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
                title="Use my address"
                disabled={loading}
              >
                Me
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Neutral party or notary</p>
          </div>
        </div>

        {/* Information Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-semibold text-blue-800 mb-2">📋 What happens next?</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Your contract will be created on the blockchain with the provided name and metadata</li>
            <li>• The document hash ensures file integrity and prevents duplication</li>
            <li>• If you're the First or Second Party, you'll automatically sign upon creation</li>
            <li>• All parties will be notified and can view the contract details</li>
            <li>• The transaction is now properly wrapped with signature data</li>
            <li>• All information is stored securely on the blockchain</li>
          </ul>
        </div>

        {/* Character count warnings */}
        {(formData.contractName.length > 400 || formData.metadata.length > 800) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Input Length Notice</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              {formData.contractName.length > 400 && (
                <li>• Contract name is getting long ({formData.contractName.length}/512 characters)</li>
              )}
              {formData.metadata.length > 800 && (
                <li>• Metadata is quite lengthy ({formData.metadata.length}/1024 characters)</li>
              )}
              <li>• Longer inputs may result in higher blockchain transaction fees</li>
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 space-y-4">
          {/* Main Submit Button */}
          <button
            type="submit"
            disabled={!fileInfo?.hash || !formData.contractName.trim() || loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none btn-hover-lift"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <InlineSpinner />
                Creating Contract...
              </span>
            ) : (
              '📝 Initiate Contract'
            )}
          </button>

          {/* Debug Button (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <button
              type="button"
              onClick={handleTestTransaction}
              disabled={!fileInfo?.hash || !formData.contractName.trim() || loading}
              className="w-full bg-gray-600 text-white px-8 py-2 rounded-xl font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔍 Test Transaction Format (Debug)
            </button>
          )}
          
          {/* Submit requirements */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Required: Document upload, contract name, and all three party addresses
            </p>
            {(!fileInfo?.hash || !formData.contractName.trim()) && (
              <p className="text-xs text-red-500 mt-1">
                {!fileInfo?.hash && "• Upload a document"} 
                {!fileInfo?.hash && !formData.contractName.trim() && " and "}
                {!formData.contractName.trim() && "• Enter contract name"}
              </p>
            )}
          </div>
        </div>
      </form>

      {/* *** NEW: Connection Status Info *** */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl">
        <h4 className="font-semibold text-gray-700 mb-2">🔗 Blockchain Connection</h4>
        <div className="text-sm text-gray-600">
          <p>• Transactions now include proper signature wrapper</p>
          <p>• Fixed WASM unreachable instruction error</p>
          <p>• All transaction metadata handled automatically</p>
          <p>• Compatible with Polkadot Apps transaction format</p>
        </div>
      </div>
    </div>
  );
};

export default InitiateContract;