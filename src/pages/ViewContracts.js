// ViewContracts.js - Perfect UI with Working Functions

import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useBlockchain as useBlockchainHook } from '../hooks/useBlockchain'; // Your ORIGINAL hook
import { useBlockchain as useBlockchainContext } from '../contexts/BlockchainContext'; // Your ORIGINAL context
import ModernContractCard from '../components/ContractCard';
import { LoadingCard, EmptyState } from '../components/LoadingStates';

const ViewContracts = ({ onBack, onStatus }) => {
  const { account, getInjector, signMessage } = useWallet();
  const { connected } = useBlockchainContext(); // Get connection status
  const { 
    getContracts,           // Your ORIGINAL hook functions
    signContract,           
    deactivateContract,     
    loading: hookLoading,
    error
  } = useBlockchainHook();
  
  const [contracts, setContracts] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState('all');
  const [expandedCard, setExpandedCard] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load contracts from blockchain using connected account - CALLED ON COMPONENT MOUNT
  const loadContracts = async () => {
    console.log('🚀 loadContracts called');
    
    if (!account || !account.address) {
      console.log('❌ No account or address found');
      onStatus('Please connect your wallet first', 'error');
      return;
    }

    console.log('📝 Account found:', account.address);
    console.log('🔧 getContracts function:', typeof getContracts);

    setLoading(true);
    try {
      onStatus(`🔄 Loading contracts for ${account.meta?.name || 'your account'}...`, 'info');
      
      console.log('📊 Calling getContracts for account:', account.address);
      
      // Use your ORIGINAL hook function
      const contractsData = await getContracts(account.address);
      
      console.log('📋 Retrieved contracts data:', contractsData);
      console.log('📊 Contracts data type:', typeof contractsData);
      console.log('📈 Contracts data length:', contractsData?.length);
      
      if (contractsData) {
        console.log('📄 First contract sample:', contractsData[0]);
      }
      
      setContracts(contractsData || []);
      
      if (contractsData?.length > 0) {
        onStatus(`✅ Loaded ${contractsData.length} contracts`, 'success');
      } else {
        console.log('📭 No contracts found');
        onStatus('No contracts found for this account', 'info');
      }
      
    } catch (error) {
      console.error('❌ Load contracts error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      onStatus(`❌ Error loading contracts: ${error.message}`, 'error');
      setContracts([]);
    } finally {
      setLoading(false);
      console.log('🏁 loadContracts finished');
    }
  };

  // Load contracts when component mounts and account is available
  useEffect(() => {
    console.log('🔍 ViewContracts useEffect triggered:', { 
      account: account?.address, 
      hasGetContracts: !!getContracts 
    });
    
    if (account && account.address) {
      console.log('✅ Account found, calling loadContracts...');
      loadContracts();
    } else {
      console.log('❌ No account or address:', { 
        hasAccount: !!account, 
        accountAddress: account?.address 
      });
    }
  }, [account]);

  // Sign contract - USING YOUR WORKING FUNCTION
  const handleSign = async (fileHash) => {
    if (!account || !account.address) {
      onStatus('Please ensure wallet is connected', 'error');
      return;
    }

    setActionLoading(fileHash);
    try {
      onStatus('🔄 Preparing to sign contract...', 'info');

      // Sign the contract hash with wallet
      onStatus('🔄 Please sign the document hash in your wallet...', 'info');
      const signatureResult = await signMessage(fileHash);

      onStatus('🔄 Creating transaction...', 'info');

      // Get the injector for transaction signing
      const injector = await getInjector();

      onStatus('🔄 Please sign the transaction in your wallet...', 'info');

      // Use your ORIGINAL hook function
      await signContract(injector, account.address, fileHash, signatureResult.signature);

      onStatus('🎉 Contract signed successfully!', 'success');
      
      // Reload contracts after a delay
      setTimeout(() => {
        loadContracts();
      }, 2000);

    } catch (error) {
      console.error('Sign error:', error);
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
      setActionLoading(null);
    }
  };

  // Deactivate contract - USING YOUR WORKING FUNCTION
  const handleDeactivate = async (fileHash) => {
    if (!account || !account.address) {
      onStatus('Please ensure wallet is connected', 'error');
      return;
    }

    // Show confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to deactivate this contract? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    setActionLoading(fileHash);
    try {
      onStatus('🔄 Preparing to deactivate contract...', 'info');

      // Get the injector for transaction signing
      const injector = await getInjector();

      onStatus('🔄 Please confirm the deactivation transaction in your wallet...', 'info');

      // Use your ORIGINAL hook function
      await deactivateContract(
        injector, 
        account.address, 
        fileHash, 
        'User requested deactivation'
      );

      onStatus('🎉 Contract deactivated successfully!', 'success');
      
      // Reload contracts after a delay
      setTimeout(() => {
        loadContracts();
      }, 2000);

    } catch (error) {
      console.error('Deactivate error:', error);
      if (error.message.includes('Cancelled')) {
        onStatus('❌ Deactivation cancelled by user', 'error');
      } else if (error.message.includes('NotAuthorized')) {
        onStatus('❌ You are not authorized to deactivate this contract', 'error');
      } else if (error.message.includes('CannotDeactivate')) {
        onStatus('❌ Cannot deactivate this contract (may be completed or already deactivated)', 'error');
      } else {
        onStatus(`❌ Error: ${error.message}`, 'error');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleCardToggle = (contractId) => {
    setExpandedCard(expandedCard === contractId ? null : contractId);
  };

  const handleRefresh = () => {
    console.log('🔄 Refresh button clicked');
    console.log('🔍 Current state:', { 
      hasAccount: !!account, 
      loading,
      accountAddress: account?.address 
    });
    
    if (account && account.address) {
      console.log('✅ Calling loadContracts from refresh...');
      loadContracts();
    } else {
      console.log('❌ Cannot refresh - no account or address');
      onStatus('Please connect your wallet first', 'error');
    }
  };

  // Filter contracts
  const filteredContracts = contracts.filter(contract => {
    if (filter === 'all') return true;
    if (filter === 'pending') return contract.status !== 'BothPartiesSigned';
    if (filter === 'completed') return contract.status === 'BothPartiesSigned';
    return true;
  });

  const filterOptions = [
    { key: 'all', label: 'All', count: contracts.length },
    { 
      key: 'pending', 
      label: 'Pending', 
      count: contracts.filter(c => c.status !== 'BothPartiesSigned').length 
    },
    { 
      key: 'completed', 
      label: 'Completed', 
      count: contracts.filter(c => c.status === 'BothPartiesSigned').length 
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Contracts</h1>
            <p className="text-gray-600">Manage and track your digital contracts</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={loading || !account || !account.address}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>

          {/* Filter Buttons */}
          <div className="flex space-x-2">
            {filterOptions.map(filterOption => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  filter === filterOption.key
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filterOption.label} ({filterOption.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingCard count={3} />
      ) : !account || !account.address ? (
        <EmptyState
          icon={FileText}
          title="Wallet Not Connected"
          description="Please connect your wallet to view your contracts."
          action={() => onBack()}
          actionText="Go to Dashboard"
        />
      ) : filteredContracts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No contracts found"
          description={
            filter === 'all' 
              ? "You don't have any contracts yet. Create your first contract to get started."
              : `No contracts match the ${filter} filter.`
          }
          action={filter === 'all' ? () => onBack() : undefined}
          actionText="Create Contract"
        />
      ) : (
        <div className="space-y-4">
          {filteredContracts.map((contract) => (
            <ModernContractCard
              key={contract.fileHash || contract.id}
              contract={contract}
              userAddress={account?.address}
              onSign={handleSign}
              onDeactivate={handleDeactivate}
              actionLoading={actionLoading}
              isExpanded={expandedCard === (contract.fileHash || contract.id)}
              onToggle={() => handleCardToggle(contract.fileHash || contract.id)}
            />
          ))}
        </div>
      )}

      {/* Show error if any */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-800 font-medium">Error: {error}</p>
        </div>
      )}
    </div>
  );
};

export default ViewContracts;