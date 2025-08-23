// components/ModernContractCard.js
import React, { useState } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  PenTool, 
  Copy, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp,
  FileText,
  Users,
  Shield,
  Calendar,
  Download
} from 'lucide-react';

const ModernContractCard = ({ 
  contract, 
  userAddress, 
  onSign, 
  onDeactivate, 
  onDownload,
  onViewDetails,
  actionLoading,
  isExpanded = false,
  onToggle
}) => {
  const [showFullHash, setShowFullHash] = useState(false);

  // Determine user role
  const isFirstParty = contract.firstParty === userAddress;
  const isSecondParty = contract.secondParty === userAddress;
  const isThirdParty = contract.thirdParty === userAddress;
  const userRole = isFirstParty ? 'First Party' : 
                   isSecondParty ? 'Second Party' : 
                   isThirdParty ? 'Notary' : 'Observer';

  // Determine if user can sign
  const canSign = (
    (isFirstParty && contract.status === 'Initiated') ||
    (isSecondParty && contract.status === 'FirstPartySigned')
  ) && !['BothPartiesSigned', 'Completed', 'Deactivated'].includes(contract.status);

  // Determine if user can deactivate
  const canDeactivate = (isFirstParty || isSecondParty) && 
    !['Deactivated', 'BothPartiesSigned', 'Completed'].includes(contract.status);

  const getStatusConfig = (status) => {
    const configs = {
      'BothPartiesSigned': {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        label: 'Completed',
        description: 'All parties have signed'
      },
      'Completed': {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        label: 'Completed',
        description: 'All parties have signed'
      },
      'FirstPartySigned': {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        label: 'Awaiting Second Party',
        description: 'Waiting for second party signature'
      },
      'Initiated': {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: AlertCircle,
        label: 'Initiated',
        description: 'Awaiting first party signature'
      },
      'Deactivated': {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: AlertCircle,
        label: 'Deactivated',
        description: 'Contract has been deactivated'
      }
    };
    return configs[status] || configs['Initiated'];
  };

  const statusConfig = getStatusConfig(contract.status);
  const StatusIcon = statusConfig.icon;

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    // Handle timestamp from blockchain (could be string with commas or number)
    let timestamp = date;
    if (typeof date === 'string') {
      // Remove commas and convert to number
      timestamp = parseInt(date.replace(/,/g, ''));
    }
    
    // Convert to milliseconds if it looks like seconds (less than year 2100 in milliseconds)
    if (timestamp < 4102444800000) {
      timestamp = timestamp * 1000;
    }
    
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    // You can add a toast notification here
    console.log(`Copied ${label} to clipboard`);
  };

  const getProgressPercentage = () => {
    const signatureCount = contract.signatures?.length || 0;
    return (signatureCount / 2) * 100;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{contract.contractName || contract.name || 'Untitled Contract'}</h3>
                <p className="text-sm text-gray-500">Your role: {userRole}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color} flex items-center space-x-1`}>
                <StatusIcon className="w-3 h-3" />
                <span>{statusConfig.label}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(contract.createdAt)}</span>
              </div>
            </div>
          </div>
          
          {/* Top Right Actions */}
          <div className="flex flex-col items-end space-y-3">
            {/* Progress Circle */}
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="6"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke={contract.status === 'BothPartiesSigned' ? '#10b981' : '#3b82f6'}
                  strokeWidth="6"
                  strokeDasharray={`${getProgressPercentage() * 1.76} 176`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-700">
                  {contract.signatures?.length || 0}/2
                </span>
              </div>
            </div>
            <span className="text-xs text-gray-500 mt-1">Signatures</span>
            </div>
          </div>

        {/* Status Description */}
        <p className="text-sm text-gray-600 mb-4">{statusConfig.description}</p>


        {/* Expand/Collapse Button */}
        <button
          onClick={onToggle}
          className="w-full mt-4 flex items-center justify-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors py-2"
        >
          <span className="text-sm font-medium">
            {isExpanded ? 'Show Less' : 'Show Details'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="relative p-6 bg-gray-50 space-y-6">
          {/* Download Icon - Top Right */}
          <button
            onClick={() => onDownload && onDownload(contract.contractId)}
            disabled={actionLoading === `download-${contract.contractId}`}
            className="absolute top-4 right-4 w-10 h-10 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors flex items-center justify-center border border-green-200 disabled:opacity-50"
            title="Download contract file"
          >
            {actionLoading === `download-${contract.contractId}` ? (
              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>
          {/* Parties Information */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-5 h-5 text-gray-600" />
              <h4 className="font-semibold text-gray-900">Contract Parties</h4>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700">First Party</span>
                  {isFirstParty && <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">You</span>}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-600 font-mono">{formatAddress(contract.firstParty)}</span>
                  <button
                    onClick={() => copyToClipboard(contract.firstParty, 'First Party Address')}
                    className="p-1 hover:bg-blue-200 rounded transition-colors"
                  >
                    <Copy className="w-3 h-3 text-blue-600" />
                  </button>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-700">Second Party</span>
                  {isSecondParty && <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">You</span>}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-purple-600 font-mono">{formatAddress(contract.secondParty)}</span>
                  <button
                    onClick={() => copyToClipboard(contract.secondParty, 'Second Party Address')}
                    className="p-1 hover:bg-purple-200 rounded transition-colors"
                  >
                    <Copy className="w-3 h-3 text-purple-600" />
                  </button>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-700">Notary</span>
                  {isThirdParty && <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">You</span>}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-600 font-mono">{formatAddress(contract.thirdParty)}</span>
                  <button
                    onClick={() => copyToClipboard(contract.thirdParty, 'Notary Address')}
                    className="p-1 hover:bg-green-200 rounded transition-colors"
                  >
                    <Copy className="w-3 h-3 text-green-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Document Information */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-5 h-5 text-gray-600" />
              <h4 className="font-semibold text-gray-900">Document Information</h4>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Contract ID:</span>
                  <p className="text-sm text-gray-600 font-mono">{contract.contractId || contract.id}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Block Number:</span>
                  <p className="text-sm text-gray-600">{contract.createdBlock || contract.blockNumber || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Document Hash:</span>
                  <button
                    onClick={() => setShowFullHash(!showFullHash)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    {showFullHash ? 'Hide' : 'Show Full Hash'}
                  </button>
                </div>
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <span className={`text-xs text-gray-600 font-mono ${showFullHash ? 'break-all' : ''}`}>
                    {showFullHash ? contract.fileHash : `${contract.fileHash.slice(0, 32)}...`}
                  </span>
                  <button
                    onClick={() => copyToClipboard(contract.fileHash, 'Document Hash')}
                    className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0 ml-2"
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures */}
          {contract.signatures && contract.signatures.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <PenTool className="w-5 h-5 text-gray-600" />
                <h4 className="font-semibold text-gray-900">Signatures</h4>
              </div>
              <div className="space-y-3">
                {contract.signatures.map((signature, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {signature.signer === contract.firstParty ? 'First Party' :
                             signature.signer === contract.secondParty ? 'Second Party' :
                             'Notary'}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">{formatAddress(signature.signer)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{formatDate(signature.signedAtTime || signature.timestamp)}</p>
                        <button
                          onClick={() => copyToClipboard(signature.signatureData || signature.signature, 'Signature')}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          {contract.metadata && contract.metadata !== contract.contractName && contract.metadata !== contract.name && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-gray-600" />
                <h4 className="font-semibold text-gray-900">Additional Information</h4>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-600 leading-relaxed">{contract.metadata}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="flex space-x-3">
              {canSign && (
                <button
                  onClick={() => onSign && onSign(contract.fileHash)}
                  disabled={actionLoading === contract.fileHash}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-medium hover:bg-blue-200 transition-colors text-sm border border-blue-300 disabled:opacity-50"
                >
                  {actionLoading === contract.fileHash ? (
                    <>
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing...</span>
                    </>
                  ) : (
                    <>
                      <PenTool className="w-4 h-4" />
                      <span>Sign</span>
                    </>
                  )}
                </button>
              )}
              
              {canDeactivate && (
                <button
                  onClick={() => onDeactivate && onDeactivate(contract.fileHash)}
                  disabled={actionLoading === contract.fileHash}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-colors text-sm border border-red-300 disabled:opacity-50"
                >
                  {actionLoading === contract.fileHash ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Deactivating...</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      <span>Deactivate</span>
                    </>
                  )}
                </button>
              )}
              
              {onViewDetails && (
                <button
                  onClick={() => onViewDetails(contract)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View on Explorer</span>
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Last updated: {formatDate(contract.updatedAt || contract.createdAt)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernContractCard;