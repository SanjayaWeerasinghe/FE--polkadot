// Enhanced ViewContracts.js with improved deactivate functionality

import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useBlockchain } from '../hooks/useBlockchain';
import { InlineSpinner } from '../components/LoadingSpinner';

// Contract Card Component - Shows individual contract details with Accordion
const ContractCard = ({ contract, userAddress, onSign, onDeactivate, actionLoading, isExpanded, onToggle }) => {
  const isFirstParty = contract.firstParty === userAddress;
  const isSecondParty = contract.secondParty === userAddress;
  const isThirdParty = contract.thirdParty === userAddress;
  
  // Can sign if you're a party and it's your turn
  const canSign = (
    (isFirstParty && contract.status === 'Initiated') ||
    (isSecondParty && contract.status === 'FirstPartySigned')
  ) && !['BothPartiesSigned', 'Completed', 'Deactivated'].includes(contract.status);
  
  // ENHANCED: Either party can deactivate contracts that are not active or already deactivated
  const canDeactivate = (isFirstParty || isSecondParty) && 
    !['BothPartiesSigned', 'Completed', 'Deactivated'].includes(contract.status);

  const getStatusColor = (status) => {
    const colors = {
      'Initiated': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'FirstPartySigned': 'bg-blue-100 text-blue-800 border-blue-300',
      'BothPartiesSigned': 'bg-green-100 text-green-800 border-green-300',
      'Completed': 'bg-gray-100 text-gray-800 border-gray-300',
      'Deactivated': 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    try {
      // Remove commas from timestamp string and convert to number
      const cleanTimestamp = timestamp.toString().replace(/,/g, '');
      const date = new Date(parseInt(cleanTimestamp) * 1000);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getUserRole = () => {
    if (isFirstParty) return 'First Party';
    if (isSecondParty) return 'Second Party';
    if (isThirdParty) return 'Third Party';
    return 'Observer';
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'Initiated': 'Initiated',
      'FirstPartySigned': 'First Party Signed',
      'BothPartiesSigned': 'Both Parties Signed (Active)',
      'Completed': 'Completed',
      'Deactivated': 'Deactivated'
    };
    return statusMap[status] || status;
  };

  // Get deactivation permission message
  const getDeactivateMessage = () => {
    if (!canDeactivate) {
      if (['BothPartiesSigned', 'Completed'].includes(contract.status)) {
        return 'Cannot deactivate: Contract is active or completed';
      }
      if (contract.status === 'Deactivated') {
        return 'Contract is already deactivated';
      }
      if (!isFirstParty && !isSecondParty) {
        return 'Only contract parties can deactivate contracts';
      }
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow overflow-hidden">
      
      {/* ===== CLICKABLE HEADER SECTION ===== */}
      {/* Contract Name, Status Badge, and User Role - Click to expand/collapse */}
      <div 
        className="flex justify-between items-start p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 flex-1">
          {/* Expand/Collapse Icon - Using Scroll Icons */}
          <div className="flex-shrink-0">
            {isExpanded ? (
              <span className="text-2xl text-blue-600">📰</span>
            ) : (
              <span className="text-2xl text-gray-400">📜</span>
            )}
          </div>
          
          {/* Contract Name and Status */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">
              {contract.contractName || 'Unnamed Contract'}
            </h3>
            
            {/* Status Badge */}
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(contract.status)}`}>
              {getStatusDisplay(contract.status)}
            </div>
          </div>
        </div>

        {/* User Role Badge */}
        <div className="flex-shrink-0 ml-4">
          <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium border border-purple-300">
            {getUserRole()}
          </div>
        </div>
      </div>

      {/* ===== EXPANDABLE CONTENT SECTION ===== */}
      {/* Only visible when isExpanded is true */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          
          {/* ===== CONTRACT PARTIES SECTION ===== */}
          {/* Shows all three parties with role indicators */}
          <div className="space-y-3 mb-6">
            <h4 className="font-semibold text-gray-800">👥 Contract Parties</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              {/* First Party */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-semibold text-blue-800 mb-1">First Party</div>
                <div className="font-mono text-blue-700 text-xs mb-1">
                  {formatAddress(contract.firstParty)}
                </div>
                {isFirstParty && (
                  <div className="text-blue-600 font-semibold text-xs">👤 This is YOU</div>
                )}
              </div>
              
              {/* Second Party */}
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="font-semibold text-green-800 mb-1">Second Party</div>
                <div className="font-mono text-green-700 text-xs mb-1">
                  {formatAddress(contract.secondParty)}
                </div>
                {isSecondParty && (
                  <div className="text-green-600 font-semibold text-xs">👤 This is YOU</div>
                )}
              </div>
              
              {/* Third Party (Notary) */}
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="font-semibold text-purple-800 mb-1">Third Party (Notary)</div>
                <div className="font-mono text-purple-700 text-xs mb-1">
                  {formatAddress(contract.thirdParty)}
                </div>
                {isThirdParty && (
                  <div className="text-purple-600 font-semibold text-xs">👤 This is YOU</div>
                )}
              </div>
            </div>
          </div>

          {/* ===== CONTRACT DETAILS SECTION ===== */}
          {/* Shows creation date and signature status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
            {/* Creation Details */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="font-semibold text-blue-800 mb-1">Created</div>
              <div className="text-blue-700">{formatTimestamp(contract.createdAt)}</div>
              <div className="text-xs text-blue-600 mt-1">Block: {contract.createdBlock}</div>
            </div>
            
            {/* Signature Status */}
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="font-semibold text-green-800 mb-1">Signatures</div>
              <div className="text-green-700">{contract.signatures?.length || 0} of 2 signed</div>
              <div className="text-xs text-green-600 mt-1">
                {contract.signatures?.map(sig => formatAddress(sig.signer)).join(', ')}
              </div>
            </div>
          </div>

          {/* ===== METADATA SECTION ===== */}
          {/* Shows additional contract information if available */}
          {contract.metadata && contract.metadata !== contract.contractName && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-semibold text-gray-700 mb-1">📝 Metadata</div>
              <div className="text-sm text-gray-600">{contract.metadata}</div>
            </div>
          )}

          {/* ===== ACTION BUTTONS SECTION ===== */}
          {/* Sign and Deactivate buttons when applicable */}
          {(canSign || canDeactivate) && (
            <div className="space-y-3 pt-4 border-t border-gray-100">
              
              {/* Action Buttons Row */}
              <div className="flex gap-3">
                {/* Sign Button */}
                {canSign && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSign(contract.fileHash);
                    }}
                    disabled={actionLoading === contract.fileHash}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === contract.fileHash ? (
                      <span className="flex items-center justify-center gap-2">
                        <InlineSpinner className="w-4 h-4" />
                        Signing...
                      </span>
                    ) : (
                      '✍️ Sign Contract'
                    )}
                  </button>
                )}
                
                {/* Deactivate Button */}
                {canDeactivate && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeactivate(contract.fileHash);
                    }}
                    disabled={actionLoading === contract.fileHash}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed border border-red-300"
                  >
                    {actionLoading === contract.fileHash ? (
                      <span className="flex items-center justify-center gap-2">
                        <InlineSpinner className="w-4 h-4" />
                        Deactivating...
                      </span>
                    ) : (
                      '🗑️ Deactivate Contract'
                    )}
                  </button>
                )}
              </div>

              {/* Deactivation Permission Info */}
              {!canDeactivate && getDeactivateMessage() && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-700">
                    ℹ️ {getDeactivateMessage()}
                  </div>
                </div>
              )}

              {/* Deactivation Permissions Info for Valid Cases */}
              {canDeactivate && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-sm text-yellow-800">
                    ⚠️ <strong>Deactivation Rights:</strong> As a contract party, you can deactivate this contract since it's not yet active. This action cannot be undone.
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* ===== STATUS MESSAGES SECTION ===== */}
          {/* Dynamic status messages based on contract state and user role */}
          
          {/* Active Contract Message */}
          {contract.status === 'BothPartiesSigned' && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm text-green-800">
                ✅ <strong>Contract Active:</strong> Both parties have signed this contract successfully. This contract cannot be deactivated.
              </div>
            </div>
          )}
          
          {/* Waiting for Second Party (First Party View) */}
          {contract.status === 'Initiated' && isFirstParty && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm text-yellow-800">
                ⏳ <strong>Waiting for Second Party:</strong> You initiated this contract. Waiting for the second party to sign. You can deactivate if needed.
              </div>
            </div>
          )}

          {/* Waiting for Second Party (Second Party View) */}
          {contract.status === 'Initiated' && isSecondParty && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                📋 <strong>Ready to Review:</strong> This contract is waiting for you to sign. You can also deactivate it if you don't want to proceed.
              </div>
            </div>
          )}
          
          {/* Ready to Sign (Second Party View) */}
          {contract.status === 'FirstPartySigned' && isSecondParty && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                ✍️ <strong>Ready to Sign:</strong> The first party has signed. You can now sign this contract or deactivate it.
              </div>
            </div>
          )}

          {/* First Party Signed (First Party View) */}
          {contract.status === 'FirstPartySigned' && isFirstParty && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm text-yellow-800">
                ⏳ <strong>Waiting for Second Signature:</strong> You've signed the contract. Waiting for the second party to sign. You can still deactivate if needed.
              </div>
            </div>
          )}
          
          {/* Deactivated Contract Message */}
          {contract.status === 'Deactivated' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm text-red-800">
                ❌ <strong>Contract Deactivated:</strong> This contract has been cancelled and is no longer active.
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

const ViewContracts = ({ onBack, onStatus }) => {
  const { account, getInjector, signMessage } = useWallet();
  const { getContracts, signContract, deactivateContract } = useBlockchain();
  
  const [loading, setLoading] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedContract, setExpandedContract] = useState(null);

  // Toggle function for accordion
  const toggleContract = (contractId) => {
    setExpandedContract(expandedContract === contractId ? null : contractId);
  };

  // Load contracts from blockchain using connected account
  const loadContracts = async () => {
    if (!account) {
      onStatus('Please connect your wallet first', 'error');
      return;
    }

    setLoading(true);
    try {
      onStatus(`🔄 Loading contracts for ${account.meta?.name || 'your account'}...`, 'info');
      
      console.log('📊 Fetching contracts for account:', account.address);
      
      // Use the blockchain hook to get real contracts
      const contractsData = await getContracts(account.address);
      
      console.log('📋 Retrieved contracts:', contractsData);
      
      setContracts(contractsData || []);
      onStatus(`✅ Loaded ${contractsData?.length || 0} contracts`, 'success');
      
    } catch (error) {
      console.error('Load contracts error:', error);
      onStatus(`❌ Error loading contracts: ${error.message}`, 'error');
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  // Quick sign contract
  const handleQuickSign = async (contractHash) => {
    if (!account) {
      onStatus('Please ensure wallet is connected', 'error');
      return;
    }

    setActionLoading(contractHash);
    try {
      onStatus('🔄 Preparing to sign contract...', 'info');

      // Sign the contract hash with wallet
      onStatus('🔄 Please sign the document hash in your wallet...', 'info');
      const signatureResult = await signMessage(contractHash);

      onStatus('🔄 Creating transaction...', 'info');

      // Get the injector for transaction signing
      const injector = await getInjector();

      onStatus('🔄 Please sign the transaction in your wallet...', 'info');

      // Use the blockchain hook to sign the contract
      await signContract(injector, account.address, contractHash, signatureResult.signature);

      onStatus('🎉 Contract signed successfully!', 'success');
      
      // Reload contracts after a delay
      setTimeout(() => {
        loadContracts();
      }, 2000);

    } catch (error) {
      console.error('Quick sign error:', error);
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

  // Modal states for deactivation process
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeactivateSuccessModal, setShowDeactivateSuccessModal] = useState(false);
  const [contractToDeactivate, setContractToDeactivate] = useState(null);
  const [deactivationResult, setDeactivationResult] = useState(null);

  // Deactivation Confirmation Modal Component
  const DeactivationConfirmModal = ({ contract, onConfirm, onCancel }) => {
    const formatAddress = (address) => {
      if (!address) return '';
      return `${address.slice(0, 8)}...${address.slice(-8)}`;
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-3xl font-bold text-red-600 mb-2">Confirm Contract Deactivation</h2>
            <p className="text-gray-600">This action cannot be undone</p>
          </div>

          {/* Contract Info */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contract Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Contract Name:</span>
                <span className="text-gray-600">{contract?.contractName || 'Unnamed Contract'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Current Status:</span>
                <span className="text-gray-600">{contract?.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Your Role:</span>
                <span className="text-gray-600">
                  {contract?.firstParty === account?.address ? 'First Party' : 
                   contract?.secondParty === account?.address ? 'Second Party' : 'Observer'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Signatures:</span>
                <span className="text-gray-600">{contract?.signatures?.length || 0} of 2 signed</span>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-red-800 mb-3">⚠️ Warning: This Action Cannot Be Undone</h4>
            <div className="text-sm text-red-700 space-y-2">
              <p>• The contract will be permanently cancelled</p>
              <p>• No further signatures will be possible</p>
              <p>• The contract status will be marked as "Deactivated"</p>
              <p>• This action is recorded on the blockchain</p>
              <p>• All parties will see that the contract was deactivated</p>
            </div>
          </div>

          {/* Reason Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Deactivation (Optional)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              rows="3"
              placeholder="Enter the reason for deactivating this contract..."
              onChange={(e) => setDeactivationReason(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onCancel}
              className="px-8 py-3 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
            
            <button
              onClick={onConfirm}
              disabled={actionLoading}
              className="px-8 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all shadow-lg disabled:opacity-50"
            >
              {actionLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <InlineSpinner className="w-4 h-4" />
                  Deactivating...
                </span>
              ) : (
                '🗑️ Deactivate Contract'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Deactivation Success Modal Component
  const DeactivationSuccessModal = ({ result, contract, onClose, onViewContracts }) => {
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
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-3xl font-bold text-green-600 mb-2">Contract Deactivated Successfully!</h2>
            <p className="text-gray-600">The contract has been permanently cancelled on the blockchain</p>
          </div>

          {/* Deactivation Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Left Column - Deactivation Info */}
            <div className="space-y-6">
              {/* Deactivation Details */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-3">✅ Deactivation Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-green-700">Deactivated By:</span>
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
                    <span className="text-sm font-medium text-green-700">Deactivated At:</span>
                    <div className="text-sm text-green-600 mt-1">{formatTimestamp()}</div>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-green-700">Reason:</span>
                    <div className="text-sm text-green-600 mt-1">
                      {result?.reason || 'User requested deactivation'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Previous Contract Status */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">📋 Previous Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-blue-700">Contract Name:</span>
                    <span className="text-sm text-blue-600">{contract?.contractName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-blue-700">Previous Status:</span>
                    <span className="text-sm text-blue-600">{contract?.status || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-blue-700">Signatures Collected:</span>
                    <span className="text-sm text-blue-600">
                      {contract?.signatures?.length || 0} of 2
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contract Info */}
            <div className="space-y-6">
              {/* Document Info */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-purple-800 mb-3">📄 Contract Info</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-purple-700">Document Hash:</span>
                    <div className="text-sm text-purple-600 font-mono bg-purple-100 rounded p-2 mt-1">
                      <button
                        onClick={() => copyToClipboard(contract?.fileHash || '', 'Document Hash')}
                        className="text-left w-full hover:text-purple-800 transition-colors break-all"
                        title="Click to copy"
                      >
                        {contract?.fileHash || 'N/A'}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-purple-700">First Party:</span>
                    <div className="text-sm text-purple-600 font-mono mt-1">
                      {formatAddress(contract?.firstParty)}
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-purple-700">Second Party:</span>
                    <div className="text-sm text-purple-600 font-mono mt-1">
                      {formatAddress(contract?.secondParty)}
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
                    <span className="text-sm font-medium text-orange-700">Status:</span>
                    <span className="text-sm text-orange-600 font-semibold">Deactivated</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">🎯 What Happens Next?</h3>
            <div className="text-blue-700 space-y-2 text-sm">
              <p>• The contract is now permanently deactivated and cannot be signed</p>
              <p>• All parties can see that the contract has been cancelled</p>
              <p>• The deactivation is recorded on the blockchain as an immutable record</p>
              <p>• You can view this contract in your contracts list with "Deactivated" status</p>
              <p>• If needed, you can create a new contract with the same parties</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* <button
              onClick={onViewContracts}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
            >
              📊 View All Contracts
            </button>
            
            <button
              onClick={() => {
                // Reset states and close modal
                setDeactivationResult(null);
                setContractToDeactivate(null);
                onClose();
              }}
              className="px-8 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all shadow-lg"
            >
              📝 Create New Contract
            </button> */}
            
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

  // Handle deactivation button click - shows confirmation modal
  const handleDeactivateClick = (contractHash) => {
    const contract = contracts.find(c => c.fileHash === contractHash);
    setContractToDeactivate(contract);
    setShowDeactivateModal(true);
  };

  // Handle confirmed deactivation - performs the actual deactivation
  const handleConfirmDeactivation = async () => {
    if (!contractToDeactivate || !account) {
      onStatus('Please ensure wallet is connected', 'error');
      return;
    }

    setActionLoading(contractToDeactivate.fileHash);
    try {
      onStatus('🔄 Preparing to deactivate contract...', 'info');

      // Get the injector for transaction signing
      const injector = await getInjector();

      onStatus('🔄 Please confirm the deactivation transaction in your wallet...', 'info');

      // Use the blockchain hook to deactivate the contract
      await deactivateContract(
        injector, 
        account.address, 
        contractToDeactivate.fileHash, 
        deactivationReason || 'User requested deactivation'
      );

      // Store deactivation result for success modal
      setDeactivationResult({
        reason: deactivationReason || 'User requested deactivation',
        timestamp: new Date(),
        contractHash: contractToDeactivate.fileHash
      });

      // Close confirmation modal and show success modal
      setShowDeactivateModal(false);
      setShowDeactivateSuccessModal(true);

      // Clear status since we're showing success modal
      onStatus('', '');
      
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
      // Close modal on error
      setShowDeactivateModal(false);
    } finally {
      setActionLoading(null);
    }
  };

  // State for deactivation reason
  const [deactivationReason, setDeactivationReason] = useState('');

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-glass-lg border border-white/20 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-gray-100">
        <button
          onClick={onBack}
          disabled={loading || actionLoading}
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
          disabled={loading || actionLoading || !account}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none btn-hover-lift"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <InlineSpinner />
              Loading Contracts...
            </span>
          ) : (
            '🔄 Load Your Contracts'
          )}
        </button>
      </div>

      {/* Contracts List */}
      {contracts.length > 0 ? (
        <div className="space-y-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              📋 Found {contracts.length} contract{contracts.length !== 1 ? 's' : ''}
            </h3>
            <p className="text-sm text-gray-600">
              Click on any contract to view details. You can sign contracts where you're a party or deactivate non-active contracts.
            </p>
          </div>
          
          {contracts.map((contract, index) => (
            <ContractCard
              key={contract.fileHash || index}
              contract={contract}
              userAddress={account?.address}
              onSign={handleQuickSign}
              onDeactivate={handleDeactivateClick}
              actionLoading={actionLoading}
              isExpanded={expandedContract === (contract.fileHash || index)}
              onToggle={() => toggleContract(contract.fileHash || index)}
            />
          ))}
        </div>
      ) : (
        !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Contracts Found</h3>
            <p className="text-gray-500">
              You don't have any contracts yet. Create your first contract to get started.
            </p>
          </div>
        )
      )}

      {/* Deactivation Confirmation Modal */}
      {showDeactivateModal && contractToDeactivate && (
        <DeactivationConfirmModal
          contract={contractToDeactivate}
          onConfirm={handleConfirmDeactivation}
          onCancel={() => {
            setShowDeactivateModal(false);
            setContractToDeactivate(null);
            setDeactivationReason('');
          }}
        />
      )}

      {/* Deactivation Success Modal */}
      {showDeactivateSuccessModal && deactivationResult && contractToDeactivate && (
        <DeactivationSuccessModal
          result={deactivationResult}
          contract={contractToDeactivate}
          onClose={() => {
            setShowDeactivateSuccessModal(false);
            setDeactivationResult(null);
            setContractToDeactivate(null);
            setDeactivationReason('');
          }}
          onViewContracts={() => {
            setShowDeactivateSuccessModal(false);
            setDeactivationResult(null);
            setContractToDeactivate(null);
            setDeactivationReason('');
            // Navigation would go here - for now just reload
            loadContracts();
          }}
        />
      )}

      {/* Contracts List */}
    </div>
  );
};

export default ViewContracts;