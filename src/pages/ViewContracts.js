import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useBlockchain } from '../hooks/useBlockchain';
import { InlineSpinner } from '../components/LoadingSpinner';

// Contract Card Component
// const ContractCard = ({ contract, userAddress, onSign, onDeactivate, actionLoading }) => {
//   const isFirstParty = contract.firstParty === userAddress;
//   const isSecondParty = contract.secondParty === userAddress;
//   const isThirdParty = contract.thirdParty === userAddress;
  
//   const canSign = (
//     (isFirstParty && contract.status === 'Initiated') ||
//     (isSecondParty && contract.status === 'FirstPartySigned')
//   ) && !['BothPartiesSigned', 'Completed', 'Deactivated'].includes(contract.status);
  
//   // Can deactivate if you're the initiator and contract is not completed/deactivated
//   // Also allow deactivation for non-active contracts (Initiated, FirstPartySigned)
//   const canDeactivate = contract.initiator === userAddress && 
//     ['Initiated', 'FirstPartySigned'].includes(contract.status);

//   const getStatusColor = (status) => {
//     const colors = {
//       'Initiated': 'bg-yellow-100 text-yellow-800 border-yellow-300',
//       'FirstPartySigned': 'bg-blue-100 text-blue-800 border-blue-300',
//       'BothPartiesSigned': 'bg-green-100 text-green-800 border-green-300',
//       'Completed': 'bg-gray-100 text-gray-800 border-gray-300',
//       'Deactivated': 'bg-red-100 text-red-800 border-red-300'
//     };
//     return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
//   };

//   const formatAddress = (address) => {
//     if (!address) return '';
//     return `${address.slice(0, 8)}...${address.slice(-8)}`;
//   };

//   const formatTimestamp = (timestamp) => {
//     if (!timestamp) return 'Unknown';
//     try {
//       // Remove commas from timestamp string and convert to number
//       const cleanTimestamp = timestamp.toString().replace(/,/g, '');
//       const date = new Date(parseInt(cleanTimestamp) * 1000);
//       return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
//     } catch (error) {
//       return 'Invalid date';
//     }
//   };

//   const getUserRole = () => {
//     if (isFirstParty) return 'First Party';
//     if (isSecondParty) return 'Second Party';
//     if (isThirdParty) return 'Third Party';
//     return 'Observer';
//   };

//   const getStatusDisplay = (status) => {
//     const statusMap = {
//       'Initiated': 'Initiated',
//       'FirstPartySigned': 'First Party Signed',
//       'BothPartiesSigned': 'Both Parties Signed (Active)',
//       'Completed': 'Completed',
//       'Deactivated': 'Deactivated'
//     };
//     return statusMap[status] || status;
//   };

//   return (
//     <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
//       {/* Header with Contract Name and Status */}
//       <div className="flex justify-between items-start mb-6">
//         <div className="flex-1">
//           <div className="flex items-center gap-3 mb-2">
//             <h3 className="text-xl font-bold text-gray-800">
//               {contract.contractName || `Contract #${contract.contractId}`}
//             </h3>
//             <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(contract.status)}`}>
//               {getStatusDisplay(contract.status)}
//             </span>
//           </div>
//           <div className="text-sm text-gray-500">
//             Contract ID: <span className="font-mono">{contract.contractId}</span>
//           </div>
//         </div>
        
//         {/* Your Role Badge */}
//         <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
//           You: {getUserRole()}
//         </div>
//       </div>

//       {/* File Hash */}
//       <div className="mb-4 p-3 bg-gray-50 rounded-lg">
//         <div className="text-sm font-semibold text-gray-700 mb-1">📄 File Hash</div>
//         <div className="font-mono text-xs text-gray-600 break-all">
//           {contract.fileHash}
//         </div>
//       </div>

//       {/* Contract Parties */}
//       <div className="space-y-3 mb-4">
//         <h4 className="font-semibold text-gray-800">👥 Contract Parties</h4>
        
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//           <div className="p-3 bg-blue-50 rounded-lg">
//             <div className="font-semibold text-blue-800 mb-1">First Party</div>
//             <div className="font-mono text-blue-700 text-xs mb-1">
//               {formatAddress(contract.firstParty)}
//             </div>
//             {isFirstParty && (
//               <div className="text-blue-600 font-semibold text-xs">👤 This is YOU</div>
//             )}
//           </div>
          
//           <div className="p-3 bg-green-50 rounded-lg">
//             <div className="font-semibold text-green-800 mb-1">Second Party</div>
//             <div className="font-mono text-green-700 text-xs mb-1">
//               {formatAddress(contract.secondParty)}
//             </div>
//             {isSecondParty && (
//               <div className="text-green-600 font-semibold text-xs">👤 This is YOU</div>
//             )}
//           </div>
          
//           <div className="p-3 bg-purple-50 rounded-lg">
//             <div className="font-semibold text-purple-800 mb-1">Third Party (Notary)</div>
//             <div className="font-mono text-purple-700 text-xs mb-1">
//               {formatAddress(contract.thirdParty)}
//             </div>
//             {isThirdParty && (
//               <div className="text-purple-600 font-semibold text-xs">👤 This is YOU</div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Contract Details */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
//         <div className="p-3 bg-blue-50 rounded-lg">
//           <div className="font-semibold text-blue-800 mb-1">Created</div>
//           <div className="text-blue-700">{formatTimestamp(contract.createdAt)}</div>
//           <div className="text-xs text-blue-600 mt-1">Block: {contract.createdBlock}</div>
//         </div>
        
//         <div className="p-3 bg-green-50 rounded-lg">
//           <div className="font-semibold text-green-800 mb-1">Signatures</div>
//           <div className="text-green-700">{contract.signatures?.length || 0} of 2 signed</div>
//           <div className="text-xs text-green-600 mt-1">
//             {contract.signatures?.map(sig => formatAddress(sig.signer)).join(', ')}
//           </div>
//         </div>
//       </div>

//       {/* Metadata */}
//       {contract.metadata && contract.metadata !== contract.contractName && (
//         <div className="mb-4 p-3 bg-gray-50 rounded-lg">
//           <div className="text-sm font-semibold text-gray-700 mb-1">📝 Metadata</div>
//           <div className="text-sm text-gray-600">{contract.metadata}</div>
//         </div>
//       )}

//       {/* Action Buttons */}
//       {(canSign || canDeactivate) && (
//         <div className="flex gap-3 pt-4 border-t border-gray-100">
//           {canSign && (
//             <button
//               onClick={() => onSign(contract.fileHash)}
//               disabled={actionLoading === contract.fileHash}
//               className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {actionLoading === contract.fileHash ? (
//                 <span className="flex items-center justify-center gap-2">
//                   <InlineSpinner className="w-4 h-4" />
//                   Signing...
//                 </span>
//               ) : (
//                 '✍️ Sign Contract'
//               )}
//             </button>
//           )}
//           {canDeactivate && (
//             <button
//               onClick={() => onDeactivate(contract.fileHash)}
//               disabled={actionLoading === contract.fileHash}
//               className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {actionLoading === contract.fileHash ? (
//                 <span className="flex items-center justify-center gap-2">
//                   <InlineSpinner className="w-4 h-4" />
//                   Deactivating...
//                 </span>
//               ) : (
//                 '🗑️ Deactivate'
//               )}
//             </button>
//           )}
//         </div>
//       )}
      
//       {/* Info message for different contract states */}
//       {contract.status === 'BothPartiesSigned' && (
//         <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
//           <div className="text-sm text-green-800">
//             ✅ <strong>Contract Active:</strong> Both parties have signed this contract successfully.
//           </div>
//         </div>
//       )}
      
//       {contract.status === 'Initiated' && isFirstParty && (
//         <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//           <div className="text-sm text-yellow-800">
//             ⏳ <strong>Waiting for Second Party:</strong> You initiated this contract. Waiting for the second party to sign.
//           </div>
//         </div>
//       )}
      
//       {contract.status === 'FirstPartySigned' && isSecondParty && (
//         <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//           <div className="text-sm text-blue-800">
//             ✍️ <strong>Ready to Sign:</strong> The first party has signed. You can now sign this contract.
//           </div>
//         </div>
//       )}
      
//       {contract.status === 'Deactivated' && (
//         <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
//           <div className="text-sm text-red-800">
//             ❌ <strong>Contract Deactivated:</strong> This contract has been cancelled and is no longer active.
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// Contract Card Component - Shows individual contract details with Accordion
const ContractCard = ({ contract, userAddress, onSign, onDeactivate, actionLoading, isExpanded, onToggle }) => {
  const isFirstParty = contract.firstParty === userAddress;
  const isSecondParty = contract.secondParty === userAddress;
  const isThirdParty = contract.thirdParty === userAddress;
  
  const canSign = (
    (isFirstParty && contract.status === 'Initiated') ||
    (isSecondParty && contract.status === 'FirstPartySigned')
  ) && !['BothPartiesSigned', 'Completed', 'Deactivated'].includes(contract.status);
  
  // Can deactivate if you're the initiator and contract is not completed/deactivated
  // Also allow deactivation for non-active contracts (Initiated, FirstPartySigned)
  const canDeactivate = contract.initiator === userAddress && 
    ['Initiated', 'FirstPartySigned'].includes(contract.status);

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

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow overflow-hidden">
      
      {/* ===== CLICKABLE HEADER SECTION ===== */}
      {/* Contract Name, Status Badge, and User Role - Click to expand/collapse */}
      <div 
        className="flex justify-between items-start p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 flex-1">
          {/* Expand/Collapse Icon */}
          <div className="flex-shrink-0">
            {isExpanded ? (
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {/* Contract Name */}
              <h3 className="text-xl font-bold text-gray-800">
                {contract.contractName || `Contract #${contract.contractId}`}
              </h3>
              {/* Status Badge with color coding */}
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(contract.status)}`}>
                {getStatusDisplay(contract.status)}
              </span>
            </div>
            {/* Contract ID */}
            <div className="text-sm text-gray-500">
              Contract ID: <span className="font-mono">{contract.contractId}</span>
            </div>
          </div>
        </div>
        
        {/* User Role Badge */}
        <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
          You: {getUserRole()}
        </div>
      </div>

      {/* ===== EXPANDABLE CONTENT ===== */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-6"
             onClick={(e) => e.stopPropagation()}>

          {/* ===== FILE HASH SECTION ===== */}
          {/* Shows the cryptographic hash of the contract document */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-semibold text-gray-700 mb-1">📄 File Hash</div>
            <div className="font-mono text-xs text-gray-600 break-all">
              {contract.fileHash}
            </div>
          </div>

          {/* ===== CONTRACT PARTIES SECTION ===== */}
          {/* Shows all three parties involved in the contract */}
          <div className="space-y-3 mb-4">
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
            <div className="flex gap-3 pt-4 border-t border-gray-100">
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
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === contract.fileHash ? (
                    <span className="flex items-center justify-center gap-2">
                      <InlineSpinner className="w-4 h-4" />
                      Deactivating...
                    </span>
                  ) : (
                    '🗑️ Deactivate'
                  )}
                </button>
              )}
            </div>
          )}
          
          {/* ===== STATUS MESSAGES SECTION ===== */}
          {/* Dynamic status messages based on contract state and user role */}
          
          {/* Active Contract Message */}
          {contract.status === 'BothPartiesSigned' && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm text-green-800">
                ✅ <strong>Contract Active:</strong> Both parties have signed this contract successfully.
              </div>
            </div>
          )}
          
          {/* Waiting for Second Party (First Party View) */}
          {contract.status === 'Initiated' && isFirstParty && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm text-yellow-800">
                ⏳ <strong>Waiting for Second Party:</strong> You initiated this contract. Waiting for the second party to sign.
              </div>
            </div>
          )}
          
          {/* Ready to Sign (Second Party View) */}
          {contract.status === 'FirstPartySigned' && isSecondParty && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                ✍️ <strong>Ready to Sign:</strong> The first party has signed. You can now sign this contract.
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

// const ViewContracts = ({ onBack, onStatus }) => {
//   const { account, getInjector, signMessage } = useWallet();
//   const { getContracts, signContract, deactivateContract } = useBlockchain();
  
//   const [loading, setLoading] = useState(false);
//   const [contracts, setContracts] = useState([]);
//   const [actionLoading, setActionLoading] = useState(null);

//   // Load contracts from blockchain using connected account
//   const loadContracts = async () => {
//     if (!account) {
//       onStatus('Please connect your wallet first', 'error');
//       return;
//     }

//     setLoading(true);
//     try {
//       onStatus(`🔄 Loading contracts for ${account.meta?.name || 'your account'}...`, 'info');
      
//       console.log('📊 Fetching contracts for account:', account.address);
      
//       // Use the blockchain hook to get real contracts
//       const contractsData = await getContracts(account.address);
      
//       console.log('📋 Retrieved contracts:', contractsData);
      
//       setContracts(contractsData || []);
//       onStatus(`✅ Loaded ${contractsData?.length || 0} contracts`, 'success');
      
//     } catch (error) {
//       console.error('Load contracts error:', error);
//       onStatus(`❌ Error loading contracts: ${error.message}`, 'error');
//       setContracts([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Quick sign contract
//   const handleQuickSign = async (contractHash) => {
//     if (!account) {
//       onStatus('Please ensure wallet is connected', 'error');
//       return;
//     }

//     setActionLoading(contractHash);
//     try {
//       onStatus('🔄 Preparing to sign contract...', 'info');

//       // Sign the contract hash with wallet
//       onStatus('🔄 Please sign the document hash in your wallet...', 'info');
//       const signatureResult = await signMessage(contractHash);

//       onStatus('🔄 Creating transaction...', 'info');

//       // Get the injector for transaction signing
//       const injector = await getInjector();

//       onStatus('🔄 Please sign the transaction in your wallet...', 'info');

//       // Use the blockchain hook to sign the contract
//       await signContract(injector, account.address, contractHash, signatureResult.signature);

//       onStatus('🎉 Contract signed successfully!', 'success');
      
//       // Reload contracts after a delay
//       setTimeout(() => {
//         loadContracts();
//       }, 2000);

//     } catch (error) {
//       console.error('Quick sign error:', error);
//       if (error.message.includes('Cancelled')) {
//         onStatus('❌ Signing cancelled by user', 'error');
//       } else if (error.message.includes('NotAuthorized')) {
//         onStatus('❌ You are not authorized to sign this contract', 'error');
//       } else if (error.message.includes('CannotSign')) {
//         onStatus('❌ Cannot sign this contract (may already be signed)', 'error');
//       } else {
//         onStatus(`❌ Error: ${error.message}`, 'error');
//       }
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   // Deactivate contract
//   const handleDeactivate = async (contractHash) => {
//     if (!window.confirm('Are you sure you want to deactivate this contract? This action cannot be undone.')) {
//       return;
//     }

//     if (!account) {
//       onStatus('Please ensure wallet is connected', 'error');
//       return;
//     }

//     setActionLoading(contractHash);
//     try {
//       onStatus('🔄 Preparing to deactivate contract...', 'info');

//       // Get the injector for transaction signing
//       const injector = await getInjector();

//       onStatus('🔄 Please confirm the deactivation transaction in your wallet...', 'info');

//       // Use the blockchain hook to deactivate the contract
//       await deactivateContract(injector, account.address, contractHash, 'User requested deactivation');

//       onStatus('✅ Contract deactivated successfully!', 'success');
      
//       // Reload contracts after a delay
//       setTimeout(() => {
//         loadContracts();
//       }, 2000);

//     } catch (error) {
//       console.error('Deactivate error:', error);
//       if (error.message.includes('Cancelled')) {
//         onStatus('❌ Deactivation cancelled by user', 'error');
//       } else if (error.message.includes('NotAuthorized')) {
//         onStatus('❌ You are not authorized to deactivate this contract', 'error');
//       } else if (error.message.includes('CannotDeactivate')) {
//         onStatus('❌ Cannot deactivate this contract (may be completed or already deactivated)', 'error');
//       } else {
//         onStatus(`❌ Error: ${error.message}`, 'error');
//       }
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   return (
//     <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-glass-lg border border-white/20 animate-fadeInUp">
//       {/* Header */}
//       <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-gray-100">
//         <button
//           onClick={onBack}
//           disabled={loading || actionLoading}
//           className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
//         >
//           ← Back
//         </button>
//         <h2 className="text-3xl font-bold text-gray-800">📊 Your Contracts</h2>
//       </div>

//       {/* Account Info */}
//       {account && (
//         <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
//           <h3 className="text-lg font-semibold text-gray-800 mb-2">👤 Connected Account</h3>
//           <div className="text-sm text-gray-700 space-y-1">
//             <p>• Name: <span className="font-medium">{account.meta?.name || 'Unknown'}</span></p>
//             <p>• Address: <span className="font-mono text-xs">{account.address}</span></p>
//             <p>• Loading all contracts where you are involved as any party</p>
//           </div>
//         </div>
//       )}

//       {/* Load Button */}
//       <div className="mb-8">
//         <button
//           onClick={loadContracts}
//           disabled={loading || actionLoading || !account}
//           className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none btn-hover-lift"
//         >
//           {loading ? (
//             <span className="flex items-center gap-2">
//               <InlineSpinner />
//               Loading Contracts from Blockchain...
//             </span>
//           ) : (
//             '📋 Load My Contracts'
//           )}
//         </button>
//       </div>

//       {/* Contracts Summary */}
//       {contracts.length > 0 && (
//         <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
//           <h3 className="font-semibold text-green-800 mb-2">📈 Contracts Summary</h3>
//           <div className="text-sm text-green-700">
//             Found {contracts.length} contracts where you are involved as a party.
//           </div>
//         </div>
//       )}

//       {/* Contracts List */}
//       {contracts.length === 0 && !loading ? (
//         <div className="text-center py-16 text-gray-600">
//           <div className="text-6xl mb-4">📋</div>
//           <h3 className="text-2xl font-semibold mb-3 text-gray-800">No Contracts Found</h3>
//           <p className="text-lg leading-relaxed">
//             You haven't participated in any contracts yet.
//             <br />
//             <span className="text-sm text-gray-500 mt-2 block">
//               Click "Load My Contracts" to refresh, or create a new contract to get started.
//             </span>
//           </p>
//         </div>
//       ) : (
//         <div className="space-y-6">
//           {contracts.map((contract) => (
//             <ContractCard
//               key={contract.contractId}
//               contract={contract}
//               userAddress={account?.address}
//               onSign={handleQuickSign}
//               onDeactivate={handleDeactivate}
//               actionLoading={actionLoading}
//             />
//           ))}
//         </div>
//       )}

//       {/* Info Box */}
//       <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
//         <h4 className="font-semibold text-gray-800 mb-3">📋 Contract Status Guide</h4>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
//           <div className="space-y-2">
//             <div className="flex items-center gap-2">
//               <span className="px-2 py-1 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-full text-xs font-semibold">Initiated</span>
//               <span className="text-gray-600">Waiting for signatures</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="px-2 py-1 bg-blue-100 text-blue-800 border border-blue-300 rounded-full text-xs font-semibold">First Party Signed</span>
//               <span className="text-gray-600">Second party can sign</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="px-2 py-1 bg-green-100 text-green-800 border border-green-300 rounded-full text-xs font-semibold">Both Parties Signed</span>
//               <span className="text-gray-600">Active contract</span>
//             </div>
//           </div>
//           <div className="space-y-2">
//             <div className="flex items-center gap-2">
//               <span className="px-2 py-1 bg-gray-100 text-gray-800 border border-gray-300 rounded-full text-xs font-semibold">Completed</span>
//               <span className="text-gray-600">Finished</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="px-2 py-1 bg-red-100 text-red-800 border border-red-300 rounded-full text-xs font-semibold">Deactivated</span>
//               <span className="text-gray-600">Cancelled</span>
//             </div>
//           </div>
//         </div>
//         <div className="text-xs text-gray-600 bg-blue-100 p-3 rounded-lg">
//           💡 <strong>Note:</strong> This page loads real contract data from the blockchain. 
//           You can sign contracts where you are the second party and the first party has already signed.
//         </div>
//       </div>
//     </div>
//   );
// };

const ViewContracts = ({ onBack, onStatus }) => {
  const { account, getInjector, signMessage } = useWallet();
  const { getContracts, signContract, deactivateContract } = useBlockchain();
  
  const [loading, setLoading] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  
  // ADD THIS: Accordion state management
  const [expandedContract, setExpandedContract] = useState(null);

  // ADD THIS: Toggle function for accordion
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

  // Deactivate contract
  const handleDeactivate = async (contractHash) => {
    if (!window.confirm('Are you sure you want to deactivate this contract? This action cannot be undone.')) {
      return;
    }

    if (!account) {
      onStatus('Please ensure wallet is connected', 'error');
      return;
    }

    setActionLoading(contractHash);
    try {
      onStatus('🔄 Preparing to deactivate contract...', 'info');

      // Get the injector for transaction signing
      const injector = await getInjector();

      onStatus('🔄 Please confirm the deactivation transaction in your wallet...', 'info');

      // Use the blockchain hook to deactivate the contract
      await deactivateContract(injector, account.address, contractHash, 'User requested deactivation');

      onStatus('✅ Contract deactivated successfully!', 'success');
      
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
        <h2 className="text-3xl font-bold text-gray-800"> Your Contracts</h2>
      </div>

      {/* Account Info */}
      {/* {account && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">👤 Connected Account</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p>• Name: <span className="font-medium">{account.meta?.name || 'Unknown'}</span></p>
            <p>• Address: <span className="font-mono text-xs">{account.address}</span></p>
            <p>• Loading all contracts where you are involved as any party</p>
          </div>
        </div>
      )} */}

      {/* Load Button */}
      <div className="mb-8">
        <button
          onClick={loadContracts}
          disabled={loading || actionLoading || !account}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none btn-hover-lift"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <InlineSpinner />
              Loading Contracts from Blockchain...
            </span>
          ) : (
            '📋 Load My Contracts'
          )}
        </button>
      </div>

      {/* Contracts Summary */}
      {contracts.length > 0 && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <h3 className="font-semibold text-green-800 mb-2">📈 Contracts Summary</h3>
          <div className="text-sm text-green-700">
            Found {contracts.length} contracts where you are involved as a party.
          </div>
        </div>
      )}

      {/* Contracts List */}
      {contracts.length === 0 && !loading ? (
        <div className="text-center py-16 text-gray-600">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-2xl font-semibold mb-3 text-gray-800">Load Your Contracts</h3>
          <p className="text-lg leading-relaxed">
            The contracts will apear here once you load them from the blockchain.
            <br />
            <span className="text-sm text-gray-500 mt-2 block">
              Click "Load My Contracts" to refresh, or create a new contract to get started.
            </span>
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract) => (
            <ContractCard
              key={contract.contractId}
              contract={contract}
              userAddress={account?.address}
              onSign={handleQuickSign}
              onDeactivate={handleDeactivate}
              actionLoading={actionLoading}
              isExpanded={expandedContract === contract.contractId}
              onToggle={() => toggleContract(contract.contractId)}
            />
          ))}
        </div>
      )}

      {/* Info Box */}
      {/* <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
        <h4 className="font-semibold text-gray-800 mb-3">📋 Contract Status Guide</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-full text-xs font-semibold">Initiated</span>
              <span className="text-gray-600">Waiting for signatures</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 border border-blue-300 rounded-full text-xs font-semibold">First Party Signed</span>
              <span className="text-gray-600">Second party can sign</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 border border-green-300 rounded-full text-xs font-semibold">Both Parties Signed</span>
              <span className="text-gray-600">Active contract</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-gray-100 text-gray-800 border border-gray-300 rounded-full text-xs font-semibold">Completed</span>
              <span className="text-gray-600">Finished</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-red-100 text-red-800 border border-red-300 rounded-full text-xs font-semibold">Deactivated</span>
              <span className="text-gray-600">Cancelled</span>
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-600 bg-blue-100 p-3 rounded-lg">
          💡 <strong>Note:</strong> This page loads real contract data from the blockchain. 
          You can sign contracts where you are the second party and the first party has already signed.
        </div>
      </div> */}
    </div>
  );
};

export default ViewContracts;