// components/ModernContractForm.js
import React, { useState } from 'react';
import { ArrowLeft, Users, FileText, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import ModernFileUpload from './FileUpload';

const ModernContractForm = ({ 
  onBack, 
  onSubmit, 
  account, 
  loading = false,
  initialData = {},
  onFileValidate = null // Optional file validation function
}) => {
  const [fileInfo, setFileInfo] = useState(null);
  const [fileValidationState, setFileValidationState] = useState({
    validating: false,
    error: null,
    exists: false
  });
  const [formData, setFormData] = useState({
    contractName: '',
    firstParty: account?.address || '',
    secondParty: '',
    thirdParty: '',
    metadata: '',
    ...initialData
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case 'contractName':
        return value.length < 3 ? 'Contract name must be at least 3 characters' : '';
      case 'secondParty':
        return !value ? 'Second party address is required' : 
               value.length < 47 ? 'Invalid Substrate address format' : '';
      case 'thirdParty':
        return !value ? 'Notary address is required' : 
               value.length < 47 ? 'Invalid Substrate address format' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Handle file selection with validation
  const handleFileSelect = async (file) => {
    setFileInfo(file);
    setFileValidationState({ validating: false, error: null, exists: false });

    // If no validation function provided, just set the file
    if (!onFileValidate || !file?.hash) {
      return;
    }

    // Start validation
    setFileValidationState(prev => ({ ...prev, validating: true }));
    
    try {
      console.log('🔍 Validating file with hash:', file.hash);
      const validationResult = await onFileValidate(file.hash);
      
      if (validationResult && validationResult.exists) {
        const contractName = validationResult.contract?.contractName || validationResult.contract?.name || 'Unknown Contract';
        setFileValidationState({
          validating: false,
          error: `Contract already exists: "${contractName}"`,
          exists: true
        });
        setErrors(prev => ({ ...prev, file: `This file is already used in contract "${contractName}"` }));
      } else {
        setFileValidationState({
          validating: false,
          error: null,
          exists: false
        });
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.file;
          return newErrors;
        });
      }
    } catch (error) {
      console.error('❌ File validation error:', error);
      setFileValidationState({
        validating: false,
        error: `Validation failed: ${error.message}`,
        exists: false
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    
    if (!fileInfo) {
      newErrors.file = 'Please upload a contract document';
    } else if (fileValidationState.exists) {
      newErrors.file = fileValidationState.error;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Mark all fields as touched to show validation errors
      const allFields = Object.keys(formData);
      const touchedState = {};
      allFields.forEach(field => touchedState[field] = true);
      setTouched(touchedState);
      return;
    }

    // Call parent submit handler
    if (onSubmit) {
      await onSubmit({
        ...formData,
        fileInfo
      });
    }
  };

  const isFormValid = !Object.values(errors).some(error => error) && 
                     fileInfo && 
                     formData.contractName &&
                     formData.secondParty &&
                     formData.thirdParty &&
                     !fileValidationState.validating &&  // Don't allow submit during validation
                     !fileValidationState.exists;        // Don't allow submit if file exists

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={onBack}
          disabled={loading}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Contract</h1>
          <p className="text-gray-600">Upload documents and specify contract parties</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Contract Details</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contract Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Contract Name *
                </label>
                <input
                  type="text"
                  value={formData.contractName}
                  onChange={(e) => handleInputChange('contractName', e.target.value)}
                  onBlur={() => handleBlur('contractName')}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.contractName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter a descriptive contract name"
                  disabled={loading}
                />
                {errors.contractName && (
                  <div className="flex items-center space-x-2 mt-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600">{errors.contractName}</span>
                  </div>
                )}
              </div>

              {/* First Party (Current User) */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  First Party (You)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.firstParty}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 pr-12"
                    disabled
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Your wallet address: {formatAddress(formData.firstParty)}
                </p>
              </div>

              {/* Second Party */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Second Party Address *
                </label>
                <input
                  type="text"
                  value={formData.secondParty}
                  onChange={(e) => handleInputChange('secondParty', e.target.value)}
                  onBlur={() => handleBlur('secondParty')}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm ${
                    errors.secondParty ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
                  disabled={loading}
                />
                {errors.secondParty && (
                  <div className="flex items-center space-x-2 mt-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600">{errors.secondParty}</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  The counterparty who will sign this contract
                </p>
              </div>

              {/* Third Party (Notary) */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Notary (Third Party) Address *
                </label>
                <input
                  type="text"
                  value={formData.thirdParty}
                  onChange={(e) => handleInputChange('thirdParty', e.target.value)}
                  onBlur={() => handleBlur('thirdParty')}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm ${
                    errors.thirdParty ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y"
                  disabled={loading}
                />
                {errors.thirdParty && (
                  <div className="flex items-center space-x-2 mt-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600">{errors.thirdParty}</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  The trusted third party who will notarize this contract
                </p>
              </div>

              {/* Additional Metadata */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Additional Metadata (Optional)
                </label>
                <textarea
                  value={formData.metadata}
                  onChange={(e) => handleInputChange('metadata', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  rows="3"
                  placeholder="Additional contract information, terms, or notes..."
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional details that will be stored with the contract
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Contract...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Create Contract</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Party Information Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-blue-800">Three-Party System</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-blue-800">First Party (You)</p>
                  <p className="text-blue-600">Contract initiator and primary signatory</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-blue-800">Second Party</p>
                  <p className="text-blue-600">Counterparty who agrees to contract terms</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-blue-800">Notary (Third Party)</p>
                  <p className="text-blue-600">Trusted witness for contract validation</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - File Upload */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <ModernFileUpload
              onFileSelect={handleFileSelect}
              fileInfo={fileInfo}
              disabled={loading || fileValidationState.validating}
              accept=".pdf,.doc,.docx,.txt"
              maxSize={10 * 1024 * 1024}
              title="Contract Document"
              description="Upload your contract document"
            />
            
            {/* File validation feedback */}
            {fileValidationState.validating && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-blue-700">Checking if file already exists on blockchain...</span>
                </div>
              </div>
            )}
            
            {fileValidationState.error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="text-sm text-red-700">{fileValidationState.error}</span>
                </div>
              </div>
            )}
            
            {fileInfo && !fileValidationState.validating && !fileValidationState.error && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-green-700">✅ File is unique and ready for contract creation</span>
                </div>
              </div>
            )}
            {errors.file && (
              <div className="flex items-center space-x-2 mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600">{errors.file}</span>
              </div>
            )}
          </div>

          {/* Contract Preview */}
          {fileInfo && isFormValid && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-800">Contract Preview</h3>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-green-700">Contract Name:</span>
                    <p className="text-sm text-green-600">{formData.contractName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-green-700">Document:</span>
                    <p className="text-sm text-green-600">{fileInfo.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-green-700">File Size:</span>
                    <p className="text-sm text-green-600">{(fileInfo.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-green-700">Parties:</span>
                    <p className="text-sm text-green-600">3 parties specified</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-green-200">
                  <span className="text-sm font-medium text-green-700">Document Hash:</span>
                  <div className="text-xs text-green-600 font-mono mt-1 break-all bg-green-100 p-2 rounded">
                    {fileInfo.hash}
                  </div>
                </div>
                {formData.metadata && (
                  <div className="pt-2">
                    <span className="text-sm font-medium text-green-700">Metadata:</span>
                    <p className="text-sm text-green-600 mt-1">{formData.metadata}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
            <div className="flex items-center space-x-3 mb-3">
              <Shield className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-amber-800">Security Notice</h3>
            </div>
            <div className="space-y-2 text-sm text-amber-700">
              <p>• Your document will be hashed using SHA-256</p>
              <p>• Only the hash is stored on-chain, not the document</p>
              <p>• All parties must sign with their private keys</p>
              <p>• Contract data is immutable once created</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernContractForm;