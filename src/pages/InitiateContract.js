// pages/InitiateContract.js - Using Your ORIGINAL useBlockchain Hook
import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useBlockchain as useBlockchainHook } from '../hooks/useBlockchain'; // Your ORIGINAL hook
import ModernContractForm from '../components/ContractForm';
import ContractSuccessModal from '../components/ContractSuccessModal';
import ErrorModal, { useErrorModal } from '../components/ErrorModal';
import fileUploadService from '../services/fileUploadService';

const InitiateContract = ({ onBack, onStatus }) => {
  const { account, getInjector } = useWallet();
  const { initiateContract, loading } = useBlockchainHook(); // Your ORIGINAL hook functions
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contractResult, setContractResult] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { errorModal, showError, showWalletError, showBlockchainError, hideError } = useErrorModal();

  const handleFormSubmit = async (formData) => {
    console.log('Form data received:', formData);

    setIsSubmitting(true);
    
    try {
      onStatus('🔄 Connecting to blockchain network...', 'loading');
      
      // Get injector for transaction signing
      const injector = await getInjector();
      
      onStatus('📝 Preparing contract transaction...', 'blockchain');
      
      onStatus('🖊️ Please sign the transaction in your wallet...', 'info');
      
      // Use your ORIGINAL hook function with EXACT parameter order
      const result = await initiateContract(
        injector,                              // injector
        account.address,                       // accountAddress  
        formData.fileInfo.hash,               // fileHash
        formData.firstParty.trim(),           // firstParty
        formData.secondParty.trim(),          // secondParty
        formData.thirdParty.trim(),           // thirdParty
        formData.contractName.trim(),         // contractName
        formData.metadata ? formData.metadata.trim() : '' // metadata
      );

      console.log('Contract creation result:', result);
      
      // After blockchain confirmation, save file to Storj backend
      onStatus('🔄 Saving contract file to secure storage...', 'loading');
      
      try {
        // Save the file to backend with contract metadata
        const backendResult = await fileUploadService.uploadFile(
          formData.fileInfo.file, // The original file from form
          {
            contractId: result.contractId,
            contractHash: result.txHash,
            contractName: formData.contractName
          }
        );
        
        console.log('File saved to backend:', backendResult);
        
        // Store the result with backend save status and show success modal
        setContractResult({
          ...result,
          backendSave: {
            success: true,
            data: backendResult
          }
        });
        setShowSuccessModal(true);
        onStatus('🎉 Contract created and file saved successfully!', 'celebration');
        
      } catch (backendError) {
        console.error('Backend save error:', backendError);
        
        // Store the result with backend save error but still show modal
        setContractResult({
          ...result,
          backendSave: {
            success: false,
            error: backendError.message
          }
        });
        setShowSuccessModal(true);
        onStatus('⚠️ Contract created on blockchain, but file save failed', 'warning');
      }
      
    } catch (error) {
      console.error('Contract creation error:', error);
      
      // Show appropriate error modal based on error type
      if (error.message.includes('wallet') || error.message.includes('signer') || error.message.includes('extension')) {
        showWalletError(error, () => handleFormSubmit(formData));
      } else if (error.message.includes('blockchain') || error.message.includes('transaction') || error.message.includes('network')) {
        showBlockchainError(error, () => handleFormSubmit(formData));
      } else {
        showError(error, {
          title: 'Contract Creation Failed',
          type: 'error',
          showRetry: true,
          onRetry: () => handleFormSubmit(formData)
        });
      }
      
      // Also show toast for immediate feedback
      onStatus(`❌ ${error.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
  };

  const handleModalDone = () => {
    setShowSuccessModal(false);
    setContractResult(null);
    onBack(); // Navigate back to main menu
  };

  return (
    <>
      <ModernContractForm
        onBack={onBack}
        onSubmit={handleFormSubmit}
        account={account}
        loading={isSubmitting || loading}
      />
      
      {/* Success Modal */}
      <ContractSuccessModal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
        contractData={contractResult}
        onDone={handleModalDone}
      />
      
      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={hideError}
        error={errorModal.error}
        title={errorModal.title}
        type={errorModal.type}
        showRetry={errorModal.showRetry}
        onRetry={errorModal.onRetry}
      />
    </>
  );
};

export default InitiateContract;