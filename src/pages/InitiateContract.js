// Enhanced InitiateContract.js with detailed success confirmation

import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useBlockchain } from '../hooks/useBlockchain';
import FileUpload from '../components/FileUpload';
import { InlineSpinner } from '../components/LoadingSpinner';

const InitiateContract = ({ onBack, onStatus }) => {
  const { account, getInjector } = useWallet();
  const { initiateContract, loading, error, clearError } = useBlockchain();
  
  const [fileInfo, setFileInfo] = useState(null);
  const [formData, setFormData] = useState({
    firstParty: account?.address || '',
    secondParty: '',
    thirdParty: '',
    contractName: '',
    metadata: ''
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [contractResult, setContractResult] = useState(null);

  // Success Modal Component
  const ContractSuccessModal = ({ result, onClose, onViewContracts }) => {
    const formatAddress = (address) => {
      if (!address) return '';
      return `${address.slice(0, 8)}...${address.slice(-8)}`;
    };

    const formatTimestamp = (timestamp) => {
      return new Date().toLocaleString();
    };

    const copyToClipboard = (text, label) => {
      navigator.clipboard.writeText(text);
      onStatus(`📋 ${label} copied to clipboard!`, 'info');
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-green-600 mb-2">Contract Created Successfully!</h2>
            <p className="text-gray-600">Your digital contract has been successfully recorded on the blockchain</p>
          </div>

          {/* Contract Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              {/* Contract ID */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  🆔 Contract Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-green-700 font-medium">Contract ID:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-lg font-bold text-green-800">#{result.contractId}</span>
                      <button
                        onClick={() => copyToClipboard(result.contractId, 'Contract ID')}
                        className="text-green-600 hover:text-green-700 text-sm"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-green-700 font-medium">Contract Name:</span>
                    <div className="font-medium text-green-800 mt-1">{result.eventData?.contractName || formData.contractName}</div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-green-700 font-medium">Status:</span>
                    <div className="mt-1">
                      <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                        ✅ Initiated
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* File Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  📄 Document Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-blue-700 font-medium">File Hash:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-xs text-blue-800 bg-blue-100 px-2 py-1 rounded break-all">
                        {result.eventData?.fileHash || fileInfo?.hash}
                      </span>
                      <button
                        onClick={() => copyToClipboard(result.eventData?.fileHash || fileInfo?.hash, 'File Hash')}
                        className="text-blue-600 hover:text-blue-700 text-sm flex-shrink-0"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                  
                  {fileInfo && (
                    <>
                      <div>
                        <span className="text-sm text-blue-700 font-medium">File Name:</span>
                        <div className="text-blue-800 mt-1">{fileInfo.name}</div>
                      </div>
                      <div>
                        <span className="text-sm text-blue-700 font-medium">File Size:</span>
                        <div className="text-blue-800 mt-1">{fileInfo.size} bytes</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Parties & Blockchain Info */}
            <div className="space-y-6">
              {/* Contract Parties */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                  👥 Contract Parties
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-purple-700 font-medium">First Party:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-xs text-purple-800 bg-purple-100 px-2 py-1 rounded">
                        {formatAddress(result.eventData?.firstParty || formData.firstParty)}
                      </span>
                      {(result.eventData?.firstParty || formData.firstParty) === account?.address && (
                        <span className="text-purple-600 text-xs font-semibold">(You)</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-purple-700 font-medium">Second Party:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-xs text-purple-800 bg-purple-100 px-2 py-1 rounded">
                        {formatAddress(result.eventData?.secondParty || formData.secondParty)}
                      </span>
                      {(result.eventData?.secondParty || formData.secondParty) === account?.address && (
                        <span className="text-purple-600 text-xs font-semibold">(You)</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-purple-700 font-medium">Third Party (Notary):</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-xs text-purple-800 bg-purple-100 px-2 py-1 rounded">
                        {formatAddress(result.eventData?.thirdParty || formData.thirdParty)}
                      </span>
                      {(result.eventData?.thirdParty || formData.thirdParty) === account?.address && (
                        <span className="text-purple-600 text-xs font-semibold">(You)</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Blockchain Information */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  ⛓️ Blockchain Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-700 font-medium">Transaction Hash:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-xs text-gray-800 bg-gray-100 px-2 py-1 rounded break-all">
                        {result.txHash}
                      </span>
                      <button
                        onClick={() => copyToClipboard(result.txHash, 'Transaction Hash')}
                        className="text-gray-600 hover:text-gray-700 text-sm flex-shrink-0"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-700 font-medium">Block Hash:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-xs text-gray-800 bg-gray-100 px-2 py-1 rounded break-all">
                        {result.blockHash}
                      </span>
                      <button
                        onClick={() => copyToClipboard(result.blockHash, 'Block Hash')}
                        className="text-gray-600 hover:text-gray-700 text-sm flex-shrink-0"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-700 font-medium">Created:</span>
                    <div className="text-gray-800 mt-1">{formatTimestamp()}</div>
                  </div>
                  
                  {result.paymentInfo && (
                    <div>
                      <span className="text-sm text-gray-700 font-medium">Transaction Fee:</span>
                      <div className="text-gray-800 mt-1">{result.paymentInfo.partialFee} units</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Metadata */}
          {formData.metadata && (
            <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                📝 Contract Metadata
              </h3>
              <div className="text-yellow-700 bg-yellow-100 p-3 rounded-lg">
                {formData.metadata}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              🚀 What's Next?
            </h3>
            <div className="text-blue-700 space-y-2 text-sm">
              <p>• Your contract has been successfully recorded on the blockchain</p>
              <p>• The first party can now sign the contract if they haven't already</p>
              <p>• Once the first party signs, the second party will be able to sign</p>
              <p>• You can view and manage this contract in the "Check Your Contracts" section</p>
              <p>• All parties will be notified when signatures are completed</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* <button
              onClick={onViewContracts}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
            >
              📊 View My Contracts
            </button> */}
            
            <button
              onClick={() => {
                // Reset form and close modal
                setFormData({
                  firstParty: account?.address || '',
                  secondParty: '',
                  thirdParty: '',
                  contractName: '',
                  metadata: ''
                });
                setFileInfo(null);
                onClose();
              }}
              className="px-8 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all shadow-lg"
            >
              📝 Create Another Contract
            </button>
            
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all shadow-lg"
            >
              ✅ Done
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Update the account address when account changes
  React.useEffect(() => {
    if (account && !formData.firstParty) {
      setFormData(prev => ({
        ...prev,
        firstParty: account.address
      }));
    }
  }, [account, formData.firstParty]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!fileInfo?.hash) {
      onStatus('Please upload a contract document', 'error');
      return false;
    }

    if (!formData.contractName.trim()) {
      onStatus('Please enter a contract name', 'error');
      return false;
    }

    if (!formData.firstParty.trim() || !formData.secondParty.trim() || !formData.thirdParty.trim()) {
      onStatus('Please enter all three party addresses', 'error');
      return false;
    }

    // Check if all parties are different
    const parties = [formData.firstParty.trim(), formData.secondParty.trim(), formData.thirdParty.trim()];
    const uniqueParties = new Set(parties);
    if (uniqueParties.size !== 3) {
      onStatus('All three party addresses must be different', 'error');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const injector = await getInjector();
      
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

      console.log('🎉 Contract creation result:', result);
      
      if (result.success) {
        // Show detailed success modal
        setContractResult(result);
        setShowSuccessModal(true);
        
        // Also show status message
        onStatus(`🎉 Contract "${formData.contractName.trim()}" created successfully!`, 'success');
        
      } else {
        onStatus('❌ Contract creation failed - please try again', 'error');
      }

    } catch (error) {
      console.error('❌ Contract initiation error:', error);
      onStatus(`❌ ${error.message}`, 'error');
    }
  };

  // Auto-fill current user address
  const handleAutoFill = (field) => {
    if (account) {
      handleInputChange(field, account.address);
    }
  };

  return (
    <>
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
          <h2 className="text-3xl font-bold text-gray-800"> Initiate New Contract</h2>
        </div>

        {/* Error display banner */}
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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* File Upload */}
          <FileUpload
            onFileSelect={setFileInfo}
            fileInfo={fileInfo}
            disabled={loading}
          />

          {/* Contract Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contract Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contract Name *
              </label>
              <input
                type="text"
                value={formData.contractName}
                onChange={(e) => handleInputChange('contractName', e.target.value)}
                placeholder="Enter a descriptive name for this contract"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
                required
              />
            </div>

            {/* First Party */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                First Party Address *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.firstParty}
                  onChange={(e) => handleInputChange('firstParty', e.target.value)}
                  placeholder="5..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => handleAutoFill('firstParty')}
                  className="px-3 py-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors text-sm"
                  disabled={loading}
                >
                  Me
                </button>
              </div>
            </div>

            {/* Second Party */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Second Party Address *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.secondParty}
                  onChange={(e) => handleInputChange('secondParty', e.target.value)}
                  placeholder="5..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => handleAutoFill('secondParty')}
                  className="px-3 py-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors text-sm"
                  disabled={loading}
                >
                  Me
                </button>
              </div>
            </div>

            {/* Third Party */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Third Party (Notary) Address *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.thirdParty}
                  onChange={(e) => handleInputChange('thirdParty', e.target.value)}
                  placeholder="5..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => handleAutoFill('thirdParty')}
                  className="px-3 py-3 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors text-sm"
                  disabled={loading}
                >
                  Me
                </button>
              </div>
            </div>

            {/* Metadata */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Metadata (Optional)
              </label>
              <textarea
                value={formData.metadata}
                onChange={(e) => handleInputChange('metadata', e.target.value)}
                placeholder="Add any additional information about this contract..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                This information will be stored on the blockchain with your contract
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="space-y-4">
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
      </div>

      {/* Success Modal */}
      {showSuccessModal && contractResult && (
        <ContractSuccessModal
          result={contractResult}
          onClose={() => setShowSuccessModal(false)}
          onViewContracts={() => {
            setShowSuccessModal(false);
            // Navigate to contracts page - you'll need to implement this
            // For now, we'll just close the modal
          }}
        />
      )}
    </>
  );
};

export default InitiateContract;