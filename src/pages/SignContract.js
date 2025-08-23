// pages/SignContract.js - Fixed infinite loading issue
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, CheckCircle, AlertCircle, PenTool } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useBlockchain as useBlockchainHook } from '../hooks/useBlockchain'; // Your ORIGINAL hook
import ModernFileUpload from '../components/FileUpload';
import { ModernSpinner } from '../components/LoadingStates';
import fileUploadService from '../services/fileUploadService';

const SignContract = ({ onBack, onStatus }) => {
  const { account, getInjector, signMessage } = useWallet();
  const { 
    checkContractExists,    // Your ORIGINAL hook functions
    signContract,          
    loading,
    error
  } = useBlockchainHook();
  
  const [fileInfo, setFileInfo] = useState(null);
  const [contractInfo, setContractInfo] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  
  // Use ref to avoid recreating verifyContract function
  const onStatusRef = useRef(onStatus);
  onStatusRef.current = onStatus;

  // Memoized verify function to prevent infinite loops
  const verifyContract = useCallback(async () => {
    if (!fileInfo?.hash) {
      setContractInfo(null);
      return;
    }
    
    console.log('🔍 Starting contract verification for hash:', fileInfo.hash);
    
    setVerifying(true);
    setContractInfo(null);
    
    try {
      onStatusRef.current('🔍 Verifying contract on blockchain...', 'info');
      
      // Use your ORIGINAL hook function
      const result = await checkContractExists(fileInfo.hash);
      
      console.log('📋 Contract verification result:', result);
      
      if (result && result.exists) {
        console.log('✅ Contract found, setting contract info:', result.contract);
        setContractInfo(result.contract);
        onStatusRef.current('✅ Contract found and verified!', 'success');
      } else {
        console.log('❌ Contract not found, result:', result);
        setContractInfo({ exists: false });
        onStatusRef.current('❌ No contract found with this document hash', 'error');
      }
      
    } catch (error) {
      console.error('Contract verification error:', error);
      onStatusRef.current(`⚠️ ${error.message}`, 'warning');
      setContractInfo({ error: error.message });
    } finally {
      setVerifying(false);
      console.log('🏁 Contract verification finished');
    }
  }, [fileInfo?.hash, checkContractExists]);

  // Only verify when fileInfo.hash changes, with a cleanup to prevent multiple calls
  useEffect(() => {
    console.log('📁 File info effect triggered:', fileInfo?.hash ? 'Hash present' : 'No hash');
    
    if (fileInfo?.hash) {
      // Add a small delay to prevent rapid fire calls
      const timeoutId = setTimeout(() => {
        verifyContract();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    } else {
      setContractInfo(null);
      setVerifying(false);
    }
  }, [fileInfo?.hash]); // Removed verifyContract dependency to prevent infinite loop

  const handleSign = async () => {
    if (!contractInfo || !contractInfo.exists) return;
    
    if (!account || !account.address) {
      onStatus('Please ensure wallet is connected', 'error');
      return;
    }
    
    setIsSigning(true);
    
    try {
      onStatus('🔄 Preparing to sign contract...', 'info');

      // Sign the contract hash with wallet
      onStatus('🔄 Please sign the document hash in your wallet...', 'info');
      const signatureResult = await signMessage(fileInfo.hash);

      onStatus('🔄 Creating transaction...', 'info');
      
      // Get injector for signing
      const injector = await getInjector();
      
      onStatus('📝 Please sign the transaction in your wallet...', 'info');
      
      // Use your ORIGINAL hook function with proper signature
      const signResult = await signContract(injector, account.address, fileInfo.hash, signatureResult.signature);
      
      onStatus('🔄 Saving signed contract file to secure storage...', 'loading');
      
      try {
        // Save the signed contract file to backend
        const backendResult = await fileUploadService.uploadFile(
          fileInfo.file, // The original file from form
          {
            contractId: contractInfo?.contractId || 'signed',
            contractHash: signResult?.txHash || fileInfo.hash,
            contractName: contractInfo?.contractName || contractInfo?.name || 'Signed Contract',
            signatureHash: signResult?.txHash
          }
        );
        
        console.log('Signed file saved to backend:', backendResult);
        onStatus('✅ Contract signed and file saved successfully!', 'success');
        
      } catch (backendError) {
        console.error('Backend save error after signing:', backendError);
        onStatus('⚠️ Contract signed successfully, but file save failed', 'warning');
      }
      
      // Refresh contract info to show updated status
      setTimeout(() => {
        verifyContract();
      }, 2000);
      
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
    } finally {
      setIsSigning(false);
    }
  };

  // Check if user can sign this contract
  const canSign = contractInfo && 
    contractInfo.exists !== false && 
    (contractInfo.contractName || contractInfo.name || contractInfo.fileHash) && 
    account?.address && (
      (contractInfo.firstParty === account.address && contractInfo.status === 'Initiated') ||
      (contractInfo.secondParty === account.address && contractInfo.status === 'FirstPartySigned')
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={onBack}
          disabled={isSigning}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sign Contract</h1>
          <p className="text-gray-600">Upload the contract document to verify and sign</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - File Upload */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <ModernFileUpload
              onFileSelect={setFileInfo}
              fileInfo={fileInfo}
              disabled={isSigning}
              accept=".pdf,.doc,.docx,.txt"
              maxSize={10 * 1024 * 1024}
              title="Contract Document"
              description="Upload the same document used to create the contract"
            />
          </div>
        </div>

        {/* Right Column - Contract Verification */}
        <div className="space-y-6">

          {fileInfo && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Verification</h3>
              
              {verifying ? (
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <ModernSpinner size="md" color="blue" />
                  <span className="text-blue-700 font-medium">Verifying contract on blockchain...</span>
                </div>
              ) : contractInfo ? (
                // Check if contract exists and has the necessary data
                (contractInfo.exists !== false && (contractInfo.contractName || contractInfo.name || contractInfo.fileHash)) ? (
                  <div className="space-y-4">
                    {/* Contract Found */}
                    <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-xl border border-green-200">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Contract Found</p>
                        <p className="text-sm text-green-600">Document verified on blockchain</p>
                      </div>
                    </div>
                    
                    {/* Contract Details */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <h4 className="font-semibold text-gray-900">Contract Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Name:</span>
                          <span className="ml-2 text-gray-800 font-medium">{contractInfo.contractName || contractInfo.name}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                            contractInfo.status === 'BothPartiesSigned' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {contractInfo.status.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Signatures:</span>
                          <span className="ml-2 text-gray-800">{contractInfo.signatures?.length || 0} of 2</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Your Role:</span>
                          <span className="ml-2 text-gray-800">
                            {contractInfo.firstParty === account?.address ? 'First Party' :
                             contractInfo.secondParty === account?.address ? 'Second Party' : 'Observer'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sign Button */}
                    {canSign ? (
                      <button
                        onClick={handleSign}
                        disabled={isSigning}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 transition-all duration-200"
                      >
                        {isSigning ? (
                          <span className="flex items-center justify-center space-x-2">
                            <ModernSpinner size="sm" color="white" />
                            <span>Signing Contract...</span>
                          </span>
                        ) : (
                          <span className="flex items-center justify-center space-x-2">
                            <PenTool className="w-5 h-5" />
                            <span>Sign Contract</span>
                          </span>
                        )}
                      </button>
                    ) : contractInfo.status === 'BothPartiesSigned' ? (
                      <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                        <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-green-800 font-medium">Contract Fully Signed</p>
                        <p className="text-sm text-green-600">All parties have signed this contract</p>
                      </div>
                    ) : (
                      <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-gray-600">You cannot sign this contract at this time</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {contractInfo.firstParty !== account?.address && contractInfo.secondParty !== account?.address
                            ? 'You are not a party to this contract'
                            : 'Wait for your turn to sign'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                ) : contractInfo.error ? (
                  <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-xl border border-red-200">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    <div>
                      <p className="font-medium text-red-800">Verification Error</p>
                      <p className="text-sm text-red-600">{contractInfo.error}</p>
                    </div>
                  </div>
                ) : contractInfo.exists === false ? (
                  <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-xl border border-red-200">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    <div>
                      <p className="font-medium text-red-800">Contract Not Found</p>
                      <p className="text-sm text-red-600">No contract exists with this document hash</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800">Unexpected Contract Data</p>
                      <p className="text-sm text-yellow-600">
                        Contract found but data format is unexpected. Check console for details.
                      </p>
                      <pre className="text-xs text-yellow-600 mt-2 bg-yellow-100 p-2 rounded">
                        {JSON.stringify(contractInfo, null, 2)}
                      </pre>
                    </div>
                  </div>
                )
              ) : (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-gray-600">Upload a contract document to verify it on the blockchain</p>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">How to Sign</h3>
            <div className="space-y-2 text-sm text-blue-700">
              <p>1. Upload the exact same document used to create the contract</p>
              <p>2. The system will verify the contract exists on the blockchain</p>
              <p>3. If verified and it's your turn, you can sign the contract</p>
              <p>4. Your wallet will prompt you to sign the transaction</p>
            </div>
          </div>

          {/* Show any global errors */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-800 font-medium">Error: {error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignContract;