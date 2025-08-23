// components/ModernFileUpload.js
import React, { useState } from 'react';
import { Upload, CheckCircle, FileText, AlertCircle } from 'lucide-react';

const ModernFileUpload = ({ 
  onFileSelect, 
  fileInfo, 
  disabled, 
  accept = ".pdf,.doc,.docx,.txt", 
  maxSize = 10 * 1024 * 1024,
  title = "Contract Document",
  description = "Supports PDF, DOC, DOCX, TXT"
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const validateFile = (file) => {
    // Size validation
    if (maxSize && file.size > maxSize) {
      return `File size must be less than ${(maxSize / (1024 * 1024)).toFixed(1)}MB`;
    }

    // Type validation
    const acceptedTypes = accept.split(',').map(type => type.trim().toLowerCase());
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    const isValidType = acceptedTypes.some(type => 
      type === fileExtension || 
      file.type.includes(type.replace('.', ''))
    );

    if (!isValidType) {
      return `File type not supported. Accepted types: ${accept}`;
    }

    return null;
  };

  const generateHash = async (file) => {
    // In a real implementation, you would use crypto.subtle.digest
    // Use your ORIGINAL hash generation method
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // Use your ORIGINAL format with '0x' prefix
    const hashHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  const handleFileSelection = async (file) => {
    setError(null);
    
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      // Read file and generate hash
      const reader = new FileReader();
      reader.onload = async () => {
        const hash = await generateHash(file);
        
        onFileSelect({
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          hash,
          content: reader.result,
          lastModified: file.lastModified
        });
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setError('Error processing file. Please try again.');
      console.error('File processing error:', err);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'txt': return '📋';
      default: return '📄';
    }
  };

  return (
    <div className="space-y-4">
      {title && (
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          {title}
        </label>
      )}
      
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
          isDragging
            ? 'border-blue-400 bg-blue-50 scale-102'
            : fileInfo
            ? 'border-green-400 bg-green-50'
            : error
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && document.getElementById('file-input').click()}
      >
        <input
          id="file-input"
          type="file"
          className="hidden"
          accept={accept}
          onChange={(e) => e.target.files[0] && handleFileSelection(e.target.files[0])}
          disabled={disabled}
        />

        {fileInfo ? (
          // Success State
          <div className="space-y-3">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="text-2xl">{getFileIcon(fileInfo.name)}</span>
                <p className="font-semibold text-green-800">{fileInfo.name}</p>
              </div>
              <p className="text-sm text-green-600">
                {formatFileSize(fileInfo.size)}
              </p>
              <div className="mt-3 p-3 bg-green-100 rounded-lg">
                <p className="text-xs text-green-700 font-medium mb-1">Document Hash:</p>
                <p className="text-xs text-green-600 font-mono break-all">
                  {fileInfo.hash.slice(0, 32)}...
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFileSelect(null);
                setError(null);
              }}
              className="text-sm text-green-600 hover:text-green-800 underline"
            >
              Remove file
            </button>
          </div>
        ) : error ? (
          // Error State
          <div className="space-y-3">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-red-800 mb-2">Upload Error</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setError(null);
              }}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        ) : (
          // Default State
          <div className="space-y-3">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto transition-colors duration-300 ${
              isDragging ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <Upload className={`w-8 h-8 transition-colors duration-300 ${
                isDragging ? 'text-blue-600' : 'text-gray-400'
              }`} />
            </div>
            <div>
              <p className={`text-lg font-semibold transition-colors duration-300 ${
                isDragging ? 'text-blue-700' : 'text-gray-700'
              }`}>
                {isDragging ? 'Drop your file here' : 'Drop your contract here'}
              </p>
              <p className="text-sm text-gray-500">or click to browse files</p>
              <p className="text-xs text-gray-400 mt-2">
                {description} (max {(maxSize / (1024 * 1024)).toFixed(0)}MB)
              </p>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {disabled && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-2xl">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">Processing...</span>
            </div>
          </div>
        )}
      </div>

      {/* File requirements */}
      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span>Supported formats: {accept.replace(/\./g, '').toUpperCase()}</span>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span>Maximum size: {(maxSize / (1024 * 1024)).toFixed(0)}MB</span>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span>Secure SHA-256 hash generation</span>
        </div>
      </div>
    </div>
  );
};

export default ModernFileUpload;