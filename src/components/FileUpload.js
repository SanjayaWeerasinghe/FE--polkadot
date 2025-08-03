import React, { useState, useRef } from 'react';

const FileUpload = ({ 
  onFileSelect, 
  fileInfo, 
  disabled = false, 
  accept = '.pdf,.doc,.docx,.txt',
  maxSize = 10 * 1024 * 1024, // 10MB
  className = ''
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const fileInputRef = useRef(null);

  // Calculate SHA256 hash of file
  const calculateFileHash = async (file) => {
    setCalculating(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hash;
    } finally {
      setCalculating(false);
    }
  };

  // Handle file selection
  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file size
    if (file.size > maxSize) {
      alert(`File too large. Maximum size is ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
      return;
    }

    // Validate file type
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    const acceptedTypes = accept.split(',').map(type => type.trim());
    if (!acceptedTypes.includes(extension)) {
      alert(`File type not supported. Accepted types: ${accept}`);
      return;
    }

    try {
      // Create initial file info
      const initialFileInfo = {
        name: file.name,
        size: file.size,
        type: file.type,
        hash: null,
        file: file
      };

      // Call callback with initial info
      onFileSelect(initialFileInfo);

      // Calculate hash
      const hash = await calculateFileHash(file);
      
      // Update with hash
      const finalFileInfo = {
        ...initialFileInfo,
        hash: hash
      };
      
      onFileSelect(finalFileInfo);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  // Handle click
  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`mb-6 ${className}`}>
      <label className="block font-semibold text-gray-700 mb-3 text-lg">
        Contract Document
      </label>
      
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer file-upload-drag
          ${dragOver ? 'border-blue-500 bg-blue-50 scale-105 dragover' : 'border-gray-300 bg-gray-50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500 hover:bg-blue-50'}
          ${calculating ? 'pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {calculating ? (
          <div className="animate-pulse">
            <div className="text-6xl mb-4">⚙️</div>
            <p className="text-lg font-medium mb-2 text-blue-600">
              Calculating file hash...
            </p>
            <div className="flex justify-center">
              <div className="spinner border-blue-500 border-t-transparent"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="text-6xl mb-4">📄</div>
            <p className="text-lg font-medium mb-2">
              <strong>Click to upload</strong> or drag and drop
            </p>
            <p className="text-gray-600 mb-4">
              {accept.replace(/\./g, '').toUpperCase()} files (Max {(maxSize / 1024 / 1024).toFixed(1)}MB)
            </p>
            {dragOver && (
              <p className="text-blue-600 font-medium animate-bounce">
                Drop your file here!
              </p>
            )}
          </>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
          disabled={disabled || calculating}
        />
      </div>

      {/* File Info Display */}
      {fileInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4 animate-slideInRight">
          <div className="space-y-3">
            {/* File Details */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📎</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 truncate">
                    {fileInfo.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatFileSize(fileInfo.size)}
                    {fileInfo.type && ` • ${fileInfo.type}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Hash Display */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-gray-700 text-sm">SHA256 Hash:</span>
                {fileInfo.hash ? (
                  <span className="text-green-600 text-sm">✅ Generated</span>
                ) : (
                  <span className="text-blue-600 text-sm">🔄 Calculating...</span>
                )}
              </div>
              
              {fileInfo.hash ? (
                <div className="relative">
                  <code className="block bg-white px-3 py-2 rounded-lg border text-xs font-mono break-all leading-relaxed">
                    {fileInfo.hash}
                  </code>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(fileInfo.hash);
                      // You could add a toast notification here
                    }}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy hash to clipboard"
                  >
                    📋
                  </button>
                </div>
              ) : (
                <div className="bg-white px-3 py-2 rounded-lg border text-xs text-gray-500 italic">
                  Hash will appear here once calculated...
                </div>
              )}
            </div>

            {/* Security Note */}
            <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded-lg">
              💡 This hash uniquely identifies your document and ensures its integrity on the blockchain.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;