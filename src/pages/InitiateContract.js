// Final InitiateContract.js with complete blockchain + file upload integration

import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useBlockchain } from '../hooks/useBlockchain';
import FileUpload from '../components/FileUpload';
import { InlineSpinner } from '../components/LoadingSpinner';
import fileUploadService from '../services/fileUploadService';

const InitiateContract = ({ onBack, onStatus }) => {
  const { account, getInjector } = useWallet();
  const { initiateContract, loading: blockchainLoading, error: blockchainError, clearError } = useBlockchain();
  
  const [fileInfo, setFileInfo] = useState(null);
  const [formData, setFormData] = useState({
    firstParty: account?.address || '',
    secondParty: '',
    thirdParty: '',
    contractName: '',
    metadata: ''
  });
  
  // Upload state management
  const [uploadState, setUploadState] = useState({
    uploading: false,
    uploadProgress: 0,
    uploadComplete: false,
    uploadResult: null,
    uploadError: null
  });

  // Modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [contractResult, setContractResult] = useState(null);

  // Success Modal Component
  const ContractSuccessModal = ({ result, uploadResult, onClose }) => {
    const formatAddress = (address) => {
      if (!address) return '';
      return `${address.slice(0, 8)}...${address.slice(-8)}`;
    };

    const copyToClipboard = (text, label) => {
      navigator.clipboard.writeText(text);
      onStatus(`📋 ${label} copied to clipboard!`, 'info');
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-green-600 mb-2">Contract Created Successfully!</h2>
            <p className="text-gray-600">Your digital contract has been successfully recorded on the blockchain</p>
            {uploadResult && (
              <p className="text-blue-600 font-medium mt-2 flex items-center justify-center gap-2">
                <span className="text-2xl">☁️</span>
                Document securely uploaded to decentralized storage
              </p>
            )}
          </div>

          {/* Contract & Upload Status Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Contract Information */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2 text-lg">
                🆔 Contract Details
              </h3>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-green-700 font-medium">Contract ID:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xl font-bold text-green-800">#{result.contractId}</span>
                    <button
                      onClick={() => copyToClipboard(result.contractId, 'Contract ID')}
                      className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-100"
                    >
                      📋
                    </button>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-green-700 font-medium">Contract Name:</span>
                  <div className="font-medium text-green-800 mt-1 text-lg">{formData.contractName}</div>
                </div>
                
                <div>
                  <span className="text-sm text-green-700 font-medium">Status:</span>
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      ✅ Initiated & Ready for Signatures
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-sm text-green-700 font-medium">Blockchain Transaction:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xs text-green-800 bg-green-100 px-2 py-1 rounded break-all">
                      {result.txHash}
                    </span>
                    <button
                      onClick={() => copyToClipboard(result.txHash, 'Transaction Hash')}
                      className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-100 flex-shrink-0"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Storage Information */}
            <div className={`border rounded-xl p-6 ${uploadResult ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <h3 className={`font-bold mb-4 flex items-center gap-2 text-lg ${uploadResult ? 'text-blue-800' : 'text-yellow-800'}`}>
                {uploadResult ? '☁️ Storage Details' : '⚠️ Storage Status'}
              </h3>
              
              {uploadResult ? (
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-blue-700 font-medium">Upload Status:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                        ✅ Successfully Uploaded
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-blue-700 font-medium">File Name:</span>
                    <div className="text-blue-800 mt-1 font-medium">{uploadResult.data?.originalName || fileInfo?.name}</div>
                  </div>

                  <div>
                    <span className="text-sm text-blue-700 font-medium">Storage URL:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <a 
                        href={uploadResult.data?.storjUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-xs underline break-all font-mono"
                      >
                        {uploadResult.data?.storjUrl}
                      </a>
                      <button
                        onClick={() => copyToClipboard(uploadResult.data?.storjUrl, 'Storage URL')}
                        className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-100 flex-shrink-0"
                      >
                        📋
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-blue-700 font-medium">Uploaded:</span>
                    <div className="text-blue-800 mt-1">{new Date(uploadResult.data?.uploadedAt).toLocaleString()}</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                      ⚠️ Document Not Uploaded
                    </span>
                  </div>
                  <div className="text-yellow-700 text-sm">
                    Your contract was created successfully on the blockchain, but the document file could not be uploaded to storage. 
                    You can upload it manually later if needed.
                  </div>
                  {uploadState.uploadError && (
                    <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                      Error: {uploadState.uploadError}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Document Hash Information */}
          <div className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              🔐 Document Hash (Blockchain Proof)
            </h3>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-gray-800 bg-white px-3 py-2 rounded border break-all flex-1">
                {fileInfo?.hash}
              </span>
              <button
                onClick={() => copyToClipboard(fileInfo?.hash, 'Document Hash')}
                className="text-gray-600 hover:text-gray-700 p-2 rounded hover:bg-gray-100 flex-shrink-0"
              >
                📋
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              💡 This hash proves the document's integrity and authenticity on the blockchain
            </p>
          </div>

          {/* Contract Parties */}
          <div className="mb-6 bg-purple-50 border border-purple-200 rounded-xl p-4">
            <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
              👥 Contract Parties
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-purple-700 font-medium">First Party:</span>
                <div className="font-mono text-xs text-purple-800 bg-purple-100 px-2 py-1 rounded mt-1 break-all">
                  {formatAddress(formData.firstParty)}
                  {formData.firstParty === account?.address && <span className="text-purple-600 ml-1">(You)</span>}
                </div>
              </div>
              <div>
                <span className="text-purple-700 font-medium">Second Party:</span>
                <div className="font-mono text-xs text-purple-800 bg-purple-100 px-2 py-1 rounded mt-1 break-all">
                  {formatAddress(formData.secondParty)}
                  {formData.secondParty === account?.address && <span className="text-purple-600 ml-1">(You)</span>}
                </div>
              </div>
              <div>
                <span className="text-purple-700 font-medium">Third Party (Notary):</span>
                <div className="font-mono text-xs text-purple-800 bg-purple-100 px-2 py-1 rounded mt-1 break-all">
                  {formatAddress(formData.thirdParty)}
                  {formData.thirdParty === account?.address && <span className="text-purple-600 ml-1">(You)</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          {/* <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2 text-lg">
              🚀 What Happens Next?
            </h3>
            <div className="space-y-3 text-blue-700">
              <div className="flex items-start gap-3">
                <span className="text-lg">✅</span>
                <span className="text-sm">Your contract is now live on the blockchain and ready for signatures</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">👤</span>
                <span className="text-sm">The first party can sign the contract using their wallet</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">👥</span>
                <span className="text-sm">Once first party signs, the second party can add their signature</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">🏛️</span>
                <span className="text-sm">The notary (third party) will validate and finalize the contract</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">📊</span>
                <span className="text-sm">Monitor progress in the "My Contracts" section</span>
              </div>
            </div>
          </div> */}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                // Reset everything and close modal
                setFormData({
                  firstParty: account?.address || '',
                  secondParty: '',
                  thirdParty: '',
                  contractName: '',
                  metadata: ''
                });
                setFileInfo(null);
                setUploadState({
                  uploading: false,
                  uploadProgress: 0,
                  uploadComplete: false,
                  uploadResult: null,
                  uploadError: null
                });
                setContractResult(null);
                onClose();
              }}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-blue-700 transition-all shadow-lg transform hover:-translate-y-1"
            >
              📝 Create Another Contract
            </button>
            
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all shadow-lg transform hover:-translate-y-1"
            >
              ✅ Done
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Upload file to Storj after blockchain success
  const uploadFileToStorj = async (contractResult) => {
    if (!fileInfo?.file) {
      console.warn('⚠️ No file to upload');
      return null;
    }

    try {
      setUploadState(prev => ({ ...prev, uploading: true, uploadProgress: 0, uploadError: null }));
      
      onStatus('📤 Uploading document to secure storage...', 'info');

      const metadata = {
        contractId: contractResult.contractId,
        contractHash: contractResult.eventData?.fileHash || fileInfo.hash,
        contractName: formData.contractName.trim()
      };

      const uploadResult = await fileUploadService.uploadFile(
        fileInfo.file,
        metadata,
        (progress) => {
          setUploadState(prev => ({ ...prev, uploadProgress: progress }));
          onStatus(`📤 Uploading... ${fileUploadService.formatProgress(progress)}`, 'info');
        }
      );

      setUploadState(prev => ({ 
        ...prev, 
        uploading: false, 
        uploadComplete: true, 
        uploadResult: uploadResult 
      }));

      onStatus('✅ Document uploaded to secure storage successfully!', 'success');
      
      return uploadResult;

    } catch (error) {
      console.error('❌ File upload error:', error);
      setUploadState(prev => ({ 
        ...prev, 
        uploading: false, 
        uploadError: error.message 
      }));
      
      onStatus(`⚠️ Document upload failed: ${error.message}`, 'error');
      
      // Don't throw error - contract creation was successful
      return null;
    }
  };

  // Update the account address when account changes
  useEffect(() => {
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

  // Main form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const injector = await getInjector();
      
      // Step 1: Create contract on blockchain
      onStatus('📋 Creating contract on blockchain...', 'info');
      
      const contractResult = await initiateContract(
        injector,
        account.address,
        fileInfo.hash,
        formData.firstParty.trim(),
        formData.secondParty.trim(),
        formData.thirdParty.trim(),
        formData.contractName.trim(),
        formData.metadata.trim()
      );

      console.log('🎉 Contract creation result:', contractResult);
      
      if (contractResult.success) {
        onStatus(`🎉 Contract "${formData.contractName.trim()}" created successfully!`, 'success');
        
        // Step 2: Upload file to Storj (async, don't block UI)
        const uploadResult = await uploadFileToStorj(contractResult);
        
        // Step 3: Show success modal with both results
        setContractResult(contractResult);
        setUploadState(prev => ({ ...prev, uploadResult }));
        setShowSuccessModal(true);
        
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

  // Check if currently processing (blockchain + upload)
  const isProcessing = blockchainLoading || uploadState.uploading;

  return (
    <>
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-glass-lg border border-white/20 animate-fadeInUp">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-gray-100">
          <button
            onClick={onBack}
            disabled={isProcessing}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            ← Back
          </button>
          <h2 className="text-3xl font-bold text-gray-800">📝 Initiate New Contract</h2>
        </div>

        {/* Error display banner */}
        {(blockchainError || uploadState.uploadError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">❌</span>
              <div className="flex-1">
                <h4 className="font-semibold text-red-800 mb-1">Error</h4>
                <p className="text-red-700 text-sm">{blockchainError || uploadState.uploadError}</p>
                <button
                  onClick={() => {
                    clearError();
                    setUploadState(prev => ({ ...prev, uploadError: null }));
                  }}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Progress Display */}
        {uploadState.uploading && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin text-2xl">📤</div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-800 mb-1">Uploading Document</h4>
                <div className="w-full bg-blue-200 rounded-full h-2 mb-1">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadState.uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-blue-700 text-sm">
                  {fileUploadService.formatProgress(uploadState.uploadProgress)} - Uploading to secure storage...
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* File Upload */}
          <FileUpload
            onFileSelect={setFileInfo}
            fileInfo={fileInfo}
            disabled={isProcessing}
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
                disabled={isProcessing}
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
                  disabled={isProcessing}
                  required
                />
                <button
                  type="button"
                  onClick={() => handleAutoFill('firstParty')}
                  className="px-3 py-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors text-sm"
                  disabled={isProcessing}
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
                  disabled={isProcessing}
                  required
                />
                <button
                  type="button"
                  onClick={() => handleAutoFill('secondParty')}
                  className="px-3 py-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors text-sm"
                  disabled={isProcessing}
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
                  disabled={isProcessing}
                  required
                />
                <button
                  type="button"
                  onClick={() => handleAutoFill('thirdParty')}
                  className="px-3 py-3 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors text-sm"
                  disabled={isProcessing}
                >
                  Me
                </button>
              </div>
            </div>

            {/* Optional Metadata */}
            {/* <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={formData.metadata}
                onChange={(e) => handleInputChange('metadata', e.target.value)}
                placeholder="Add any additional information about this contract..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                disabled={isProcessing}
              />
              <p className="text-xs text-gray-500 mt-1">
                This information will be stored on the blockchain with your contract
              </p>
            </div> */}
          </div>

          {/* Submit Button */}
          <div className="space-y-4">
            <button
              type="submit"
              disabled={!fileInfo?.hash || !formData.contractName.trim() || isProcessing}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <InlineSpinner />
                  {blockchainLoading ? 'Creating Contract...' : 'Uploading Document...'}
                </span>
              ) : (
                '📝 Initiate Contract & Upload Document'
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
              <p className="text-xs text-blue-600 mt-2">
                ✨ Your document will be automatically uploaded to secure storage after blockchain confirmation
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && contractResult && (
        <ContractSuccessModal
          result={contractResult}
          uploadResult={uploadState.uploadResult}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </>
  );
};

export default InitiateContract;