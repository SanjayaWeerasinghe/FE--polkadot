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

  // Verify contract exists when file is uploaded
  React.useEffect(() => {
    let isMounted = true; // Cleanup flag

    const verifyContract = async () => {
      if (!fileInfo?.hash || !account) return;

      if (isMounted) setVerifying(true);
      
      try {
        const contractData = await checkContractExists(fileInfo.hash);
        
        if (!isMounted) return; // Don't update state if component unmounted
        
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

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [fileInfo?.hash, account]); // Removed problematic dependencies

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

      onStatus('🎉 Contract signed successfully!', 'success');
      
      // Reset state
      setFileInfo(null);
      setContractInfo(null);

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

      {/* Instructions */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">📋 How to Sign a Contract</h3>
        <ol className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            Upload the same contract document that was used to create the contract
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            The system will automatically connect to blockchain and verify the contract exists
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            Sign the document hash with your wallet to create a cryptographic signature
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
            Submit the signature to the blockchain to complete the signing process
          </li>
        </ol>
      </div>

      {/* File Upload */}
      <FileUpload
        onFileSelect={setFileInfo}
        fileInfo={fileInfo}
        disabled={loading}
      />

      {/* Contract Verification Status */}
      {fileInfo?.hash && (
        <div className="mb-6">
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
  );
};

export default SignContract;