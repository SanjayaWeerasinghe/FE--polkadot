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
      
      onStatus('🔄 Please sign the transaction in your wallet...', 'info');
      
      // Use the exact same implementation as ViewContracts (which works)
      await signContract(injector, account.address, fileInfo.hash, signatureResult.signature);
      
      onStatus('🎉 Contract signed successfully!', 'success');
      
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
          className="p-2 rounded-xl transition-colors disabled:opacity-50 hover:opacity-80"
          style={{backgroundColor: 'var(--bg-hover)'}}
        >
          <ArrowLeft className="w-5 h-5" style={{color: 'var(--text-secondary)'}} />
        </button>
        <div>
          <h1 className="text-3xl font-bold" style={{color: 'var(--text-primary)'}}>Sign Contract</h1>
          <p style={{color: 'var(--text-secondary)'}}>Upload the contract document to verify and sign</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - File Upload */}
        <div className="space-y-6">
          <div className="glass-card-dark rounded-2xl p-6 shadow-sm" style={{border: '1px solid var(--border-secondary)'}}>
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
            <div className="glass-card-dark rounded-2xl p-6 shadow-sm" style={{border: '1px solid var(--border-secondary)'}}>
              <h3 className="text-lg font-semibold mb-4" style={{color: 'var(--text-primary)'}}>Contract Verification</h3>
              
              {verifying ? (
                <div className="flex items-center space-x-3 p-4 rounded-xl" style={{backgroundColor: 'var(--info-bg)', border: '1px solid var(--info)'}}>
                  <ModernSpinner size="md" color="blue" />
                  <span className="font-medium" style={{color: 'var(--info)'}}>Verifying contract on blockchain...</span>
                </div>
              ) : contractInfo ? (
                // Check if contract exists and has the necessary data
                (contractInfo.exists !== false && (contractInfo.contractName || contractInfo.name || contractInfo.fileHash)) ? (
                  <div className="space-y-4">
                    {/* Contract Found */}
                    <div className="flex items-center space-x-3 p-4 rounded-xl" style={{backgroundColor: 'var(--success-bg)', border: '1px solid var(--success)'}}>
                      <CheckCircle className="w-6 h-6" style={{color: 'var(--success)'}} />
                      <div>
                        <p className="font-medium" style={{color: 'var(--success)'}}>Contract Found</p>
                        <p className="text-sm" style={{color: 'var(--success)'}}>Document verified on blockchain</p>
                      </div>
                    </div>
                    
                    {/* Contract Details */}
                    <div className="rounded-xl p-4 space-y-3" style={{backgroundColor: 'var(--bg-hover)'}}>
                      <h4 className="font-semibold" style={{color: 'var(--text-primary)'}}>Contract Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span style={{color: 'var(--text-secondary)'}}>Name:</span>
                          <span className="ml-2 font-medium" style={{color: 'var(--text-primary)'}}>{contractInfo.contractName || contractInfo.name}</span>
                        </div>
                        <div>
                          <span style={{color: 'var(--text-secondary)'}}>Status:</span>
                          <span 
                            className="ml-2 px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: contractInfo.status === 'BothPartiesSigned' ? 'var(--success-bg)' : 'var(--warning-bg)',
                              color: contractInfo.status === 'BothPartiesSigned' ? 'var(--success)' : 'var(--warning)'
                            }}
                          >
                            {contractInfo.status.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </div>
                        <div>
                          <span style={{color: 'var(--text-secondary)'}}>Signatures:</span>
                          <span className="ml-2" style={{color: 'var(--text-primary)'}}>{contractInfo.signatures?.length || 0} of 2</span>
                        </div>
                        <div>
                          <span style={{color: 'var(--text-secondary)'}}>Your Role:</span>
                          <span className="ml-2" style={{color: 'var(--text-primary)'}}>
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
                        className="w-full py-3 rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 transition-all duration-200"
                        style={{background: 'linear-gradient(to right, var(--success), var(--accent-primary))', color: 'var(--text-primary)'}}
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
                      <div className="text-center p-4 rounded-xl" style={{backgroundColor: 'var(--success-bg)', border: '1px solid var(--success)'}}>
                        <CheckCircle className="w-8 h-8 mx-auto mb-2" style={{color: 'var(--success)'}} />
                        <p className="font-medium" style={{color: 'var(--success)'}}>Contract Fully Signed</p>
                        <p className="text-sm" style={{color: 'var(--success)'}}>All parties have signed this contract</p>
                      </div>
                    ) : (
                      <div className="text-center p-4 rounded-xl" style={{backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-secondary)'}}>
                        <p style={{color: 'var(--text-secondary)'}}>You cannot sign this contract at this time</p>
                        <p className="text-sm mt-1" style={{color: 'var(--text-muted)'}}>
                          {contractInfo.firstParty !== account?.address && contractInfo.secondParty !== account?.address
                            ? 'You are not a party to this contract'
                            : 'Wait for your turn to sign'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                ) : contractInfo.error ? (
                  <div className="flex items-center space-x-3 p-4 bg-red-500/50 rounded-xl border border-red-500/200">
                    <AlertCircle className="w-6 h-6" style={{color: 'var(--error)'}} />
                    <div>
                      <p className="font-medium" style={{color: 'var(--error)'}}>Verification Error</p>
                      <p className="text-sm" style={{color: 'var(--error)'}}>{contractInfo.error}</p>
                    </div>
                  </div>
                ) : contractInfo.exists === false ? (
                  <div className="flex items-center space-x-3 p-4 bg-red-500/50 rounded-xl border border-red-500/200">
                    <AlertCircle className="w-6 h-6" style={{color: 'var(--error)'}} />
                    <div>
                      <p className="font-medium" style={{color: 'var(--error)'}}>Contract Not Found</p>
                      <p className="text-sm" style={{color: 'var(--error)'}}>No contract exists with this document hash</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 p-4 rounded-xl" style={{backgroundColor: 'var(--warning-bg)', border: '1px solid var(--warning)'}}>
                    <AlertCircle className="w-6 h-6" style={{color: 'var(--warning)'}} />
                    <div>
                      <p className="font-medium" style={{color: 'var(--warning)'}}>Unexpected Contract Data</p>
                      <p className="text-sm" style={{color: 'var(--warning)'}}>
                        Contract found but data format is unexpected. Check console for details.
                      </p>
                      <pre className="text-xs mt-2 p-2 rounded" style={{color: 'var(--warning)', backgroundColor: 'var(--warning-bg)'}}>
                        {JSON.stringify(contractInfo, null, 2)}
                      </pre>
                    </div>
                  </div>
                )
              ) : (
                <div className="p-4 rounded-xl" style={{backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-secondary)'}}>
                  <p style={{color: 'var(--text-secondary)'}}>Upload a contract document to verify it on the blockchain</p>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="rounded-2xl p-6" style={{background: 'linear-gradient(to bottom right, var(--info-bg), var(--success-bg))', border: '1px solid var(--border-primary)'}}>
            <h3 className="text-lg font-semibold mb-3" style={{color: 'var(--success)'}}>How to Sign</h3>
            <div className="space-y-2 text-sm" style={{color: 'var(--text-primary)'}}>
              <p>1. Upload the exact same document used to create the contract</p>
              <p>2. The system will verify the contract exists on the blockchain</p>
              <p>3. If verified and it's your turn, you can sign the contract</p>
              <p>4. Your wallet will prompt you to sign the transaction</p>
            </div>
          </div>

          {/* Show any global errors */}
          {error && (
            <div className="p-4 rounded-xl" style={{backgroundColor: 'var(--error-bg)', border: '1px solid var(--error)'}}>
              <p className="font-medium" style={{color: 'var(--error)'}}>Error: {error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignContract;