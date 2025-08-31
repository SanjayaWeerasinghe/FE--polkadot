// components/auth/PublicKeyManagement.js
import React, { useState } from 'react';
import { Plus, Trash2, Key, Copy, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import publicKeyService from '../../services/publicKeyService';

const PublicKeyManagement = ({ onBack }) => {
  const { publicKeys, addPublicKey, removePublicKey, isLoading, error, clearError } = useAuth();
  const [newPublicKey, setNewPublicKey] = useState('');
  const [keyError, setKeyError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const handleAddKey = async (e) => {
    e.preventDefault();
    
    if (!newPublicKey.trim()) {
      setKeyError('Public key is required');
      return;
    }
    
    if (!publicKeyService.isValidPolkadotAddress(newPublicKey.trim())) {
      setKeyError('Invalid Polkadot address format');
      return;
    }
    
    try {
      setActionLoading('add');
      const response = await addPublicKey(newPublicKey.trim());
      
      if (response.success) {
        setNewPublicKey('');
        setKeyError('');
      }
    } catch (error) {
      console.error('Add public key failed:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveKey = async (publicKey) => {
    if (!window.confirm('Are you sure you want to remove this public key?')) {
      return;
    }
    
    try {
      setActionLoading(publicKey);
      const response = await removePublicKey(publicKey);
      
      if (response.success) {
        // Success handled by context
      }
    } catch (error) {
      console.error('Remove public key failed:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const copyToClipboard = (key) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleInputChange = (e) => {
    setNewPublicKey(e.target.value);
    setKeyError('');
    if (error) {
      clearError();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Public Key Management</h1>
            <p className="text-gray-600">Manage your Polkadot wallet addresses</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Key className="w-4 h-4" />
          <span>{publicKeys.length} keys registered</span>
        </div>
      </div>

      {/* Add New Key Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Public Key</h2>
        <form onSubmit={handleAddKey} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Polkadot Public Key / Address
            </label>
            <div className="flex space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={newPublicKey}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm ${
                    keyError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your Polkadot address (SS58 format)"
                  disabled={actionLoading === 'add'}
                />
                {keyError && (
                  <p className="text-red-500 text-sm mt-1">{keyError}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Example: 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
                </p>
              </div>
              <button
                type="submit"
                disabled={actionLoading === 'add' || !newPublicKey.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2 h-12"
              >
                {actionLoading === 'add' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add Key</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Global Error */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Existing Keys */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Public Keys</h2>
        
        {publicKeys.length === 0 ? (
          <div className="text-center py-12">
            <Key className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500 mb-2">No public keys added</h3>
            <p className="text-gray-400 mb-6">
              Add your first Polkadot wallet address to start creating contracts
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {publicKeys.map((publicKey, index) => (
              <div
                key={publicKey}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Key className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-semibold text-gray-700">
                        Address {index + 1}
                      </span>
                      {index === 0 && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-mono text-gray-600 break-all">
                      {publicKeyService.formatAddress(publicKey)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyToClipboard(publicKey)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copy full address"
                  >
                    {copiedKey === publicKey ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleRemoveKey(publicKey)}
                    disabled={actionLoading === publicKey}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Remove key"
                  >
                    {actionLoading === publicKey ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Important Information</h3>
        <ul className="text-blue-800 text-sm space-y-2">
          <li className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
            <span>You can only create and sign contracts using registered public keys</span>
          </li>
          <li className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
            <span>Each public key can only be registered to one account</span>
          </li>
          <li className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
            <span>Make sure you have access to the wallet for each registered address</span>
          </li>
          <li className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
            <span>Remove keys you no longer have access to</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PublicKeyManagement;