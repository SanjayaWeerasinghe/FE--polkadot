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
        <label className="block text-sm font-semibold mb-2" style={{color: '#e9f5f9'}}>
          {title}
        </label>
      )}
      
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${isDragging ? 'scale-102' : ''}`}
        style={{
          borderColor: isDragging ? 'var(--success)' :
                      fileInfo ? 'var(--success)' :
                      error ? 'var(--error)' : 'var(--border-subtle)',
          backgroundColor: isDragging ? 'var(--success-bg)' :
                          fileInfo ? 'var(--success-bg)' :
                          error ? 'var(--error-bg)' : 'var(--bg-hover)'
        }}
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
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{backgroundColor: 'var(--success-bg)'}}>
              <CheckCircle className="w-8 h-8" style={{color: 'var(--success)'}} />
            </div>
            <div>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="text-2xl">{getFileIcon(fileInfo.name)}</span>
                <p className="font-semibold" style={{color: 'var(--text-primary)'}}>{fileInfo.name}</p>
              </div>
              <p className="text-sm" style={{color: 'var(--text-secondary)'}}>
                {formatFileSize(fileInfo.size)}
              </p>
              <div className="mt-3 p-3 rounded-lg" style={{backgroundColor: 'var(--success-bg)', border: '1px solid var(--border-primary)'}}>
                <p className="text-xs font-medium mb-1" style={{color: 'var(--text-primary)'}}>Document Hash:</p>
                <p className="text-xs font-mono break-all" style={{color: 'var(--text-secondary)'}}>
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
              className="text-sm hover:opacity-80 underline"
              style={{color: 'var(--success)'}}
            >
              Remove file
            </button>
          </div>
        ) : error ? (
          // Error State
          <div className="space-y-3">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <p className="font-semibold mb-2" style={{color: '#e9f5f9'}}>Upload Error</p>
              <p className="text-sm text-red-400">{error}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setError(null);
              }}
              className="text-sm text-red-400 hover:opacity-80 underline"
            >
              Try again
            </button>
          </div>
        ) : (
          // Default State
          <div className="space-y-3">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto transition-colors duration-300 ${
              isDragging ? 'bg-[#1ba098]/20' : 'bg-white/10'
            }`}>
              <Upload 
                className="w-8 h-8 transition-colors duration-300" 
                style={{color: isDragging ? '#1ba098' : '#e9f5f9cc'}} 
              />
            </div>
            <div>
              <p 
                className="text-lg font-semibold transition-colors duration-300" 
                style={{color: isDragging ? '#1ba098' : '#e9f5f9'}}
              >
                {isDragging ? 'Drop your file here' : 'Drop your contract here'}
              </p>
              <p className="text-sm" style={{color: 'var(--text-secondary)'}}>or click to browse files</p>
              <p className="text-xs mt-2" style={{color: '#e9f5f9cc'}}>
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