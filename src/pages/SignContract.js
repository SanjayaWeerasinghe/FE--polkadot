// Enhanced SignContract.js with detailed success confirmation modal

import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useBlockchain } from '../hooks/useBlockchain';
import FileUpload from '../components/FileUpload';
import { InlineSpinner } from '../components/LoadingSpinner';

const SignContract = ({ onBack, onStatus }) => {
  const { account, getInjector, signMessage } = useWallet();
  const { signContract, checkContractExists, loading } = useBlockchain();
  
  const [fileInfo, setFileInfo] = useState(null);
  const [contractInfo, setContractInfo] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [signatureResult, setSignatureResult] = useState(null);

  // Success Modal Component for Contract Signing
  const ContractSignSuccessModal = ({ result, contractInfo, onClose, onViewContracts }) => {
    const formatAddress = (address) => {
      if (!address) return '';
      return `${address.slice(0, 8)}...${address.slice(-8)}`;
    };

    const formatTimestamp = () => {
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
            <div className="text-6xl mb-4">✍️</div>
            <h2 className="text-3xl font-bold text-green-600 mb-2">Contract Signed Successfully!</h2>
            <p className="text-gray-600">Your digital signature has been recorded on the blockchain</p>
          </div>

          {/* Signature Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Left Column - Signature Info */}
            <div className="space-y-6">
              {/* Your Signature */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-3">✅ Your Signature</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-green-700">Signer Address:</span>
                    <div className="text-sm text-green-600 font-mono bg-green-100 rounded p-2 mt-1">
                      <button
                        onClick={() => copyToClipboard(account?.address || '', 'Address')}
                        className="text-left w-full hover:text-green-800 transition-colors"
                        title="Click to copy"
                      >
                        {account?.address || 'N/A'}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-green-700">Signature Hash:</span>
                    <div className="text-sm text-green-600 font-mono bg-green-100 rounded p-2 mt-1">
                      <button
                        onClick={() => copyToClipboard(result?.signature || '', 'Signature')}
                        className="text-left w-full hover:text-green-800 transition-colors break-all"
                        title="Click to copy"
                      >
                        {result?.signature ? `${result.signature.slice(0, 32)}...${result.signature.slice(-16)}` : 'N/A'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-green-700">Signed At:</span>
                    <div className="text-sm text-green-600 mt-1">{formatTimestamp()}</div>
                  </div>
                </div>
              </div>

              {/* Contract Status */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">📋 Contract Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-blue-700">Contract Name:</span>
                    <span className="text-sm text-blue-600">{contractInfo?.contractName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-blue-700">Current Status:</span>
                    <span className="text-sm text-blue-600 font-semibold">
                      {contractInfo?.status === 'FirstPartySigned' ? 'Waiting for Second Party' : 
                       contractInfo?.status === 'BothPartiesSigned' ? 'Fully Executed' : 
                       'Updated'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-blue-700">Total Signatures:</span>
                    <span className="text-sm text-blue-600">
                      {(contractInfo?.signatures?.length || 0) + 1} of 2
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contract Info */}
            <div className="space-y-6">
              {/* Document Info */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-purple-800 mb-3">📄 Document Info</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-purple-700">Document Hash:</span>
                    <div className="text-sm text-purple-600 font-mono bg-purple-100 rounded p-2 mt-1">
                      <button
                        onClick={() => copyToClipboard(fileInfo?.hash || '', 'Document Hash')}
                        className="text-left w-full hover:text-purple-800 transition-colors break-all"
                        title="Click to copy"
                      >
                        {fileInfo?.hash || 'N/A'}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-purple-700">File Name:</span>
                    <div className="text-sm text-purple-600 mt-1">{fileInfo?.name || 'N/A'}</div>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-purple-700">File Size:</span>
                    <div className="text-sm text-purple-600 mt-1">
                      {fileInfo?.size ? `${(fileInfo.size / 1024).toFixed(2)} KB` : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Blockchain Transaction */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-orange-800 mb-3">⛓️ Blockchain Info</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-orange-700">Network:</span>
                    <span className="text-sm text-orange-600">Substrate</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-orange-700">Transaction:</span>
                    <span className="text-sm text-orange-600">✅ Confirmed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-orange-700">Gas Used:</span>
                    <span className="text-sm text-orange-600">Standard</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">🎯 What Happens Next?</h3>
            <div className="text-blue-700 space-y-2 text-sm">
              {contractInfo?.status === 'Initiated' && (
                <>
                  <p>• Your signature has been recorded as the first party signature</p>
                  <p>• The second party will now be able to sign the contract</p>
                  <p>• Once both parties sign, the contract will be fully executed</p>
                  <p>• You will be notified when the contract is complete</p>
                </>
              )}
              {contractInfo?.status === 'FirstPartySigned' && (
                <>
                  <p>• Your signature has been recorded as the second party signature</p>
                  <p>• The contract is now fully executed with both signatures</p>
                  <p>• All parties can view the complete signed contract</p>
                  <p>• The contract is now legally binding on the blockchain</p>
                </>
              )}
              <p>• You can track this contract's status in the "Check Your Contracts" section</p>
              <p>• All signature data is permanently recorded on the blockchain</p>
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
                setFileInfo(null);
                setContractInfo(null);
                setSignatureResult(null);
                onClose();
              }}
              className="px-8 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all shadow-lg"
            >
              ✍️ Sign Another Contract
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

  // Verify contract exists when file is uploaded
  React.useEffect(() => {
    let isMounted = true;

    const verifyContract = async () => {
      if (!fileInfo?.hash || !account) return;

      if (isMounted) setVerifying(true);
      
      try {
        const contractData = await checkContractExists(fileInfo.hash);
        
        if (!isMounted) return;
        
        if (contractData.exists) {
          setContractInfo(contractData);
          onStatus('✅ Contract found! Ready to sign.', 'success');
        } else {
          setContractInfo({ exists: false });
          onStatus('❌ No contract found with this document hash', 'error');
        }
      } catch (error) {
        if (!isMounted) return;
        
        console.error('Contract verification error:', error);
        onStatus('❌ Error verifying contract', 'error');
        setContractInfo({ exists: false });
      } finally {
        if (isMounted) setVerifying(false);
      }
    };

    verifyContract();

    return () => {
      isMounted = false;
    };
  }, [fileInfo?.hash, account]);

  // Handle contract signing
  const handleSign = async () => {
    if (!fileInfo?.hash || !account) {
      onStatus('Please upload a contract document first', 'error');
      return;
    }

    if (!contractInfo?.exists) {
      onStatus('Contract does not exist or is not verified', 'error');
      return;
    }

    try {
      onStatus('🔄 Preparing to sign contract...', 'info');

      // Sign the document hash with wallet
      onStatus('🔄 Please sign the document hash in your wallet...', 'info');
      const signatureResult = await signMessage(fileInfo.hash);

      onStatus('🔄 Creating transaction...', 'info');

      // Get the injector for transaction signing
      const injector = await getInjector();

      onStatus('🔄 Please sign the transaction in your wallet...', 'info');

      // Call blockchain service
      await signContract(injector, account.address, fileInfo.hash, signatureResult.signature);

      // Store the signature result for the modal
      setSignatureResult(signatureResult);

      // Show success modal instead of just a status message
      setShowSuccessModal(true);

      // Clear the status message since we're showing the modal
      onStatus('', '');

    } catch (error) {
      console.error('Contract signing error:', error);
      
      if (error.message.includes('Cancelled')) {
        onStatus('❌ Signing cancelled by user', 'error');
      } else if (error.message.includes('NotAuthorized')) {
        onStatus('❌ You are not authorized to sign this contract', 'error');
      } else if (error.message.includes('CannotSign')) {
        onStatus('❌ Cannot sign this contract (may already be signed)', 'error');
      } else {
        onStatus(`❌ Error: ${error.message}`, 'error');
      }
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
          <h2 className="text-3xl font-bold text-gray-800">✍️ Sign Contract</h2>
        </div>

        {/* File Upload */}
        <div className="mb-8">
          <FileUpload
            onFileSelect={setFileInfo}
            fileInfo={fileInfo}
            disabled={loading}
            accept=".pdf,.doc,.docx,.txt"
            maxSize={10 * 1024 * 1024}
          />
        </div>

        {/* Contract Verification Status */}
        {fileInfo?.hash && (
          <div className="mb-8">
            {verifying ? (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <InlineSpinner className="border-blue-500" />
                  <span className="text-blue-700 font-medium">Connecting to blockchain and verifying contract...</span>
                </div>
              </div>
            ) : contractInfo ? (
              contractInfo.exists ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-800 mb-2">Contract Found!</h4>
                      <div className="text-sm text-green-700 space-y-1">
                        <p>• Contract status: <span className="font-medium">{contractInfo.status}</span></p>
                        <p>• You are authorized to sign this contract</p>
                        <p>• Document hash matches an existing contract</p>
                        <p>• Blockchain connection established automatically</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-800 mb-2">Contract Not Found</h4>
                      <div className="text-sm text-red-700 space-y-1">
                        <p>• No contract exists with this document hash</p>
                        <p>• Make sure you uploaded the correct file</p>
                        <p>• Check if the contract was already created</p>
                        <p>• Blockchain connection was successful</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ) : null}
          </div>
        )}

        {/* Security Information */}
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <h4 className="font-semibold text-yellow-800 mb-2">🔒 Security Notice</h4>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>• Your signature will be cryptographically verified</p>
            <p>• The document hash ensures file integrity</p>
            <p>• All signing activity is recorded on the blockchain</p>
            <p>• Only authorized parties can sign contracts</p>
            <p>• Connection to blockchain is made securely when needed</p>
          </div>
        </div>

        {/* Sign Button */}
        <button
          onClick={handleSign}
          disabled={!fileInfo?.hash || !contractInfo?.exists || loading || verifying}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-blue-700 transition-all hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none btn-hover-lift"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <InlineSpinner />
              Signing Contract...
            </span>
          ) : verifying ? (
            <span className="flex items-center justify-center gap-2">
              <InlineSpinner />
              Verifying Contract...
            </span>
          ) : (
            '✍️ Sign Contract'
          )}
        </button>

        {/* Help Text */}
        {!fileInfo?.hash && (
          <div className="mt-6 text-center text-gray-500">
            <p className="text-sm">
              Upload the contract document to get started
              <br />
              <small className="text-xs opacity-75">
                💡 We'll connect to the blockchain automatically when you upload a file
              </small>
            </p>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && signatureResult && (
        <ContractSignSuccessModal
          result={signatureResult}
          contractInfo={contractInfo}
          onClose={() => setShowSuccessModal(false)}
          onViewContracts={() => {
            setShowSuccessModal(false);
            // Navigate to contracts page - you'll need to implement this navigation
            // For now, we'll just close the modal
          }}
        />
      )}
    </>
  );
};

export default SignContract;