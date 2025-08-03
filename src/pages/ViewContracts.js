import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useBlockchain } from '../contexts/BlockchainContext';
import { InlineSpinner } from '../components/LoadingSpinner';

const ContractCard = ({ contract, userAddress, onSign, onDeactivate }) => {
  const getStatusStyle = (status) => {
    const styles = {
      'Initiated': 'status-initiated',
      'FirstPartySigned': 'status-first-signed', 
      'SecondPartySigned': 'status-second-signed',
      'BothPartiesSigned': 'status-both-signed',
      'Completed': 'status-completed',
      'Deactivated': 'status-deactivated'
    };
    return styles[status] || 'status-initiated';
  };

  const getStatusText = (status) => {
    const texts = {
      'Initiated': 'Initiated',
      'FirstPartySigned': 'First Party Signed',
      'SecondPartySigned': 'Second Party Signed', 
      'BothPartiesSigned': 'Both Parties Signed',
      'Completed': 'Completed',
      'Deactivated': 'Deactivated'
    };
    return texts[status] || 'Unknown';
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  // UPDATED: Generate display name from file hash since contract name is removed
  const getContractDisplayName = (contract) => {
    if (contract.file_hash) {
      const shortHash = contract.file_hash.slice(0, 10) + '...' + contract.file_hash.slice(-8);
      return `Contract ${shortHash}`;
    }
    return `Contract #${contract.contract_id}`;
  };

  const isFirstParty = contract.first_party === userAddress;
  const isSecondParty = contract.second_party === userAddress;
  const isThirdParty = contract.third_party === userAddress;

  const canSign = (isFirstParty || isSecondParty) && 
    !['BothPartiesSigned', 'Completed', 'Deactivated'].includes(contract.status) &&
    ((isFirstParty && !['FirstPartySigned', 'BothPartiesSigned'].includes(contract.status)) ||
     (isSecondParty && !['SecondPartySigned', 'BothPartiesSigned'].includes(contract.status)));

  const canDeactivate = (isFirstParty || isSecondParty || isThirdParty) && 
    !['BothPartiesSigned', 'Completed', 'Deactivated'].includes(contract.status);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all contract-card">
      {/* Header (UPDATED: use generated name from file hash) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <div>
          <h4 className="text-xl font-bold text-gray-800 mb-1">
            {getContractDisplayName(contract)}
          </h4>
          <p className="text-sm text-gray-500">
            Contract ID: {contract.contract_id}
          </p>
        </div>
        <div className={`status-badge ${getStatusStyle(contract.status)} self-start sm:self-center`}>
          {getStatusText(contract.status)}
        </div>
      </div>

      {/* Contract Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">File Hash</label>
            <div className="mt-1 font-mono text-xs bg-gray-50 p-2 rounded border break-all">
              {contract.file_hash}
            </div>
          </div>
          
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</label>
            <div className="mt-1 text-sm text-gray-700">
              {formatDate(contract.created_at)}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Initiator</label>
            <div className="mt-1 font-mono text-xs bg-gray-50 p-2 rounded border break-all">
              {formatAddress(contract.initiator)}
              {contract.initiator === userAddress && (
                <span className="ml-2 text-blue-600 font-normal">(You)</span>
              )}
            </div>
          </div>
          
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your Role</label>
            <div className="mt-1 text-sm">
              {isFirstParty && <span className="text-blue-600 font-medium">First Party</span>}
              {isSecondParty && <span className="text-green-600 font-medium">Second Party</span>}
              {isThirdParty && <span className="text-purple-600 font-medium">Third Party (Notary)</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Parties Information */}
      <div className="border-t border-gray-100 pt-4 mb-4">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Contract Parties</label>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-xs">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="font-medium text-blue-800 mb-1">First Party</div>
            <div className="font-mono text-blue-700 break-all">
              {formatAddress(contract.first_party)}
              {contract.first_party === userAddress && <span className="text-blue-600 ml-1">(You)</span>}
            </div>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="font-medium text-green-800 mb-1">Second Party</div>
            <div className="font-mono text-green-700 break-all">
              {formatAddress(contract.second_party)}
              {contract.second_party === userAddress && <span className="text-green-600 ml-1">(You)</span>}
            </div>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="font-medium text-purple-800 mb-1">Third Party (Notary)</div>
            <div className="font-mono text-purple-700 break-all">
              {formatAddress(contract.third_party)}
              {contract.third_party === userAddress && <span className="text-purple-600 ml-1">(You)</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {(canSign || canDeactivate) && (
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          {canSign && (
            <button
              onClick={() => onSign(contract.file_hash)}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
            >
              ✍️ Sign Contract
            </button>
          )}
          {canDeactivate && (
            <button
              onClick={() => onDeactivate(contract.file_hash)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
            >
              🗑️ Deactivate
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const ViewContracts = ({ onBack, onStatus }) => {
  const { account, getInjector, signMessage } = useWallet();
  const { api } = useBlockchain();
  
  const [loading, setLoading] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);

  // Load contracts
  const loadContracts = async () => {
    if (!account || !api) {
      onStatus('Please ensure wallet and blockchain are connected', 'error');
      return;
    }

    setLoading(true);
    try {
      onStatus('🔄 Loading your contracts...', 'info');
      
      // UPDATED: Mock contracts without contract_name field
      const mockContracts = [
        {
          contract_id: '1',
          file_hash: '0x1234567890abcdef1234567890abcdef12345678901234567890abcdef12345678',
          first_party: account.address,
          second_party: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
          third_party: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
          status: 'FirstPartySigned',
          created_at: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
          initiator: account.address
        },
        {
          contract_id: '2', 
          file_hash: '0xabcdef1234567890abcdef1234567890abcdef123456789012345678901234abcd',
          first_party: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          second_party: account.address,
          third_party: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
          status: 'BothPartiesSigned',
          created_at: Math.floor(Date.now() / 1000) - 172800, // 2 days ago
          initiator: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
        }
      ];
      
      setContracts(mockContracts);
      onStatus(`✅ Loaded ${mockContracts.length} contracts`, 'success');
      
    } catch (error) {
      console.error('Load contracts error:', error);
      onStatus(`❌ Error loading contracts: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Quick sign contract
  const handleQuickSign = async (contractHash) => {
    if (!account || !api) {
      onStatus('Please ensure wallet and blockchain are connected', 'error');
      return;
    }

    setActionLoading(contractHash);
    try {
      onStatus('🔄 Signing contract...', 'info');

      // Sign the contract hash
      const signatureResult = await signMessage(contractHash);

      // Get injector and create transaction
      const injector = await getInjector();
      const tx = api.tx.digitalNotarizedContract.signContract(
        contractHash,
        signatureResult.signature
      );

      // Send transaction
      await new Promise((resolve, reject) => {
        tx.signAndSend(account.address, { signer: injector.signer }, (result) => {
          if (result.status.isInBlock) {
            onStatus('🎉 Contract signed successfully!', 'success');
            // Reload contracts after a delay
            setTimeout(() => loadContracts(), 2000);
            resolve();
          } else if (result.status.isError) {
            reject(new Error('Transaction failed'));
          }
        });
      });

    } catch (error) {
      console.error('Quick sign error:', error);
      if (error.message.includes('Cancelled')) {
        onStatus('❌ Signing cancelled by user', 'error');
      } else {
        onStatus(`❌ Error: ${error.message}`, 'error');
      }
    } finally {
      setActionLoading(null);
    }
  };

  // Deactivate contract
  const handleDeactivate = async (contractHash) => {
    if (!window.confirm('Are you sure you want to deactivate this contract? This action cannot be undone.')) {
      return;
    }

    setActionLoading(contractHash);
    try {
      onStatus('🔄 Deactivating contract...', 'info');

      const injector = await getInjector();
      const tx = api.tx.digitalNotarizedContract.deactivateContract(contractHash);

      await new Promise((resolve, reject) => {
        tx.signAndSend(account.address, { signer: injector.signer }, (result) => {
          if (result.status.isInBlock) {
            onStatus('✅ Contract deactivated successfully', 'success');
            setTimeout(() => loadContracts(), 2000);
            resolve();
          } else if (result.status.isError) {
            reject(new Error('Transaction failed'));
          }
        });
      });

    } catch (error) {
      console.error('Deactivate error:', error);
      onStatus(`❌ Error: ${error.message}`, 'error');
    } finally {
      setActionLoading(null);
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
        <h2 className="text-3xl font-bold text-gray-800">📊 Your Contracts</h2>
      </div>

      {/* Load Button */}
      <div className="mb-8">
        <button
          onClick={loadContracts}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none btn-hover-lift"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <InlineSpinner />
              Loading Contracts...
            </span>
          ) : (
            '📋 Load My Contracts'
          )}
        </button>
      </div>

      {/* Contracts List */}
      {contracts.length === 0 && !loading ? (
        <div className="text-center py-16 text-gray-600">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-2xl font-semibold mb-3 text-gray-800">No Contracts Found</h3>
          <p className="text-lg leading-relaxed">
            You haven't participated in any contracts yet.
            <br />
            <span className="text-sm text-gray-500 mt-2 block">
              Click "Load My Contracts" to refresh, or create a new contract to get started.
            </span>
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {contracts.map((contract) => (
            <ContractCard
              key={contract.contract_id}
              contract={contract}
              userAddress={account?.address}
              onSign={handleQuickSign}
              onDeactivate={handleDeactivate}
            />
          ))}
        </div>
      )}

      {/* Info Box (UPDATED: removed contract name references) */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
        <h4 className="font-semibold text-gray-800 mb-3">📋 Contract Status Guide</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
          <div className="flex items-center gap-2">
            <span className="status-badge status-initiated">Initiated</span>
            <span className="text-gray-600">Just created</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="status-badge status-first-signed">First Signed</span>
            <span className="text-gray-600">First party signed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="status-badge status-both-signed">Both Signed</span>
            <span className="text-gray-600">Active contract</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="status-badge status-completed">Completed</span>
            <span className="text-gray-600">Finished</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="status-badge status-deactivated">Deactivated</span>
            <span className="text-gray-600">Cancelled</span>
          </div>
        </div>
        <div className="text-xs text-gray-600 bg-blue-100 p-3 rounded-lg">
          💡 <strong>Note:</strong> Contracts are now identified by their file hash rather than custom names. This ensures uniqueness and reduces on-chain storage requirements.
        </div>
      </div>
    </div>
  );
};

export default ViewContracts;