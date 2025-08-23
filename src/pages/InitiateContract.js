// pages/InitiateContract.js - Using Your ORIGINAL useBlockchain Hook
import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useBlockchain as useBlockchainHook } from '../hooks/useBlockchain'; // Your ORIGINAL hook
import { useBlockchain as useBlockchainContext } from '../contexts/BlockchainContext'; // Your ORIGINAL context
import ModernContractForm from '../components/ContractForm';

const InitiateContract = ({ onBack, onStatus }) => {
  const { account, getInjector } = useWallet();
  const { connected } = useBlockchainContext(); // Get connection status
  const { initiateContract, loading } = useBlockchainHook(); // Your ORIGINAL hook functions
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (formData) => {
    console.log('Form data received:', formData);

    setIsSubmitting(true);
    
    try {
      onStatus('🔄 Preparing contract...', 'info');
      
      // Get injector for transaction signing
      const injector = await getInjector();
      
      onStatus('📝 Please sign the transaction in your wallet...', 'info');
      
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
      onStatus('✅ Contract created successfully!', 'success');
      
      // Navigate back after success
      setTimeout(() => {
        onBack();
      }, 2000);
      
    } catch (error) {
      console.error('Contract creation error:', error);
      
      // Your hook already provides user-friendly error messages
      onStatus(`❌ ${error.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Connection Warning */}
      {!connected && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-amber-800 font-medium">⚠️ Blockchain Connection Required</p>
          <p className="text-sm text-amber-600 mt-1">
            Please ensure blockchain connection is established to create contracts.
          </p>
        </div>
      )}

      <ModernContractForm
        onBack={onBack}
        onSubmit={handleFormSubmit}
        account={account}
        loading={isSubmitting || loading}
        disabled={!connected}
      />
    </div>
  );
};

export default InitiateContract;