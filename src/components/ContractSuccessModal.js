// components/ContractSuccessModal.js
import React from 'react';
import { CheckCircle, Copy, ExternalLink, X, FileText, Users, Hash, Calendar, Globe } from 'lucide-react';

const ContractSuccessModal = ({ 
  isOpen, 
  onClose, 
  contractData,
  onDone 
}) => {
  if (!isOpen || !contractData) return null;

  const { 
    success,
    contractId,
    txHash,
    blockHash,
    eventData,
    backendSave
  } = contractData;

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 10)}...${address.slice(-10)}`;
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    // You can add toast notification here if needed
    console.log(`Copied ${label} to clipboard: ${text}`);
  };

  const formatTimestamp = () => {
    return new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-t-3xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Contract Created Successfully!</h2>
              <p className="text-green-100 mt-1">Your digital contract has been deployed to the blockchain</p>
            </div>
          </div>
        </div>

        {/* Contract Details */}
        <div className="p-6 space-y-6">
          {/* Contract Info */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">Contract Information</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Contract Name</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">{eventData?.contractName || 'Untitled'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Contract ID</label>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-lg font-semibold text-blue-600 font-mono">#{contractId}</span>
                  <button
                    onClick={() => copyToClipboard(contractId, 'Contract ID')}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Created</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">{formatTimestamp()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Parties Information */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900">Contract Parties</h3>
            </div>
            
            <div className="space-y-3">
              <div className="bg-white/70 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-blue-700">First Party (Initiator)</label>
                    <p className="text-sm text-blue-600 font-mono mt-1">{formatAddress(eventData?.firstParty)}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(eventData?.firstParty, 'First Party Address')}
                    className="p-2 text-blue-400 hover:text-blue-600 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="bg-white/70 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-purple-700">Second Party</label>
                    <p className="text-sm text-purple-600 font-mono mt-1">{formatAddress(eventData?.secondParty)}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(eventData?.secondParty, 'Second Party Address')}
                    className="p-2 text-purple-400 hover:text-purple-600 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="bg-white/70 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-green-700">Third Party (Notary)</label>
                    <p className="text-sm text-green-600 font-mono mt-1">{formatAddress(eventData?.thirdParty)}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(eventData?.thirdParty, 'Third Party Address')}
                    className="p-2 text-green-400 hover:text-green-600 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* File Storage Status */}
          <div className={`rounded-2xl p-5 ${backendSave?.success 
            ? 'bg-gradient-to-br from-green-50 to-emerald-50' 
            : 'bg-gradient-to-br from-red-50 to-pink-50'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              <Globe className={`w-6 h-6 ${backendSave?.success ? 'text-green-600' : 'text-red-600'}`} />
              <h3 className="text-xl font-semibold text-gray-900">File Storage Status</h3>
            </div>
            
            <div className="space-y-3">
              <div className={`p-4 rounded-xl ${backendSave?.success ? 'bg-white/70' : 'bg-white/70'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  {backendSave?.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`font-medium ${backendSave?.success ? 'text-green-700' : 'text-red-700'}`}>
                    {backendSave?.success ? 'File Saved Successfully' : 'File Save Failed'}
                  </span>
                </div>
                
                {backendSave?.success ? (
                  <div className="text-sm text-green-600">
                    <p>✅ Contract file securely stored in decentralized storage</p>
                    <p>✅ File URL: {backendSave.data?.storjUrl && 
                      <span className="font-mono break-all">{backendSave.data.storjUrl}</span>
                    }</p>
                    <p>✅ Storage ID: {backendSave.data?.filename && 
                      <span className="font-mono">{backendSave.data.filename}</span>
                    }</p>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    <p>❌ Failed to save contract file to secure storage</p>
                    <p>❌ Error: {backendSave?.error || 'Unknown storage error'}</p>
                    <p className="mt-2 text-orange-600">⚠️ Contract is still valid on blockchain, but file backup failed</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Blockchain Details */}
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-5">
            <div className="flex items-center space-x-3 mb-4">
              <Hash className="w-6 h-6 text-gray-600" />
              <h3 className="text-xl font-semibold text-gray-900">Blockchain Details</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Document Hash</label>
                <div className="flex items-center justify-between bg-white rounded-xl p-3 mt-1">
                  <span className="text-sm text-gray-600 font-mono break-all">{eventData?.fileHash}</span>
                  <button
                    onClick={() => copyToClipboard(eventData?.fileHash, 'Document Hash')}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-2"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Transaction Hash</label>
                <div className="flex items-center justify-between bg-white rounded-xl p-3 mt-1">
                  <span className="text-sm text-gray-600 font-mono break-all">{txHash}</span>
                  <button
                    onClick={() => copyToClipboard(txHash, 'Transaction Hash')}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-2"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Block Hash</label>
                <div className="flex items-center justify-between bg-white rounded-xl p-3 mt-1">
                  <span className="text-sm text-gray-600 font-mono break-all">{blockHash}</span>
                  <button
                    onClick={() => copyToClipboard(blockHash, 'Block Hash')}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-2"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🎉 What's Next?</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Your contract is now live on the blockchain</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Share the contract ID <strong>#{contractId}</strong> with the parties for signing</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Monitor progress in "My Contracts" section</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>All parties need to sign for the contract to become active</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={onDone}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>Done</span>
            </button>
            
            <button
              onClick={() => copyToClipboard(
                `Contract "${eventData?.contractName}" created successfully!\nContract ID: #${contractId}\nTransaction: ${txHash}`,
                'Contract Summary'
              )}
              className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-2xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <Copy className="w-5 h-5" />
              <span>Copy Summary</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractSuccessModal;