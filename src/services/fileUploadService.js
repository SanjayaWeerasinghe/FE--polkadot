// services/fileUploadService.js - Service for handling file uploads to Storj

class FileUploadService {
  constructor() {
    this.baseUrl = process.env.REACT_APP_UPLOAD_API_URL || 'http://localhost:3000/api';
    this.uploadTimeout = 120000; // 2 minutes timeout for large files
  }

  /**
   * Upload a single file to Storj storage
   * @param {File} file - The file object to upload
   * @param {Object} metadata - Additional metadata to include
   * @param {Function} onProgress - Progress callback function
   * @returns {Promise<Object>} Upload result
   */
  async uploadFile(file, metadata = {}, onProgress = null) {
    try {
      console.log('📤 Starting file upload to Storj:', file.name);
      console.log('📤 File details:', { 
        name: file.name, 
        size: file.size, 
        type: file.type,
        lastModified: file.lastModified 
      });
      console.log('📤 Upload URL:', `${this.baseUrl}/upload`);
      console.log('📤 Metadata:', metadata);

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);

      // Add metadata if provided
      if (metadata.contractId) {
        formData.append('contractId', metadata.contractId);
      }
      if (metadata.contractHash) {
        formData.append('contractHash', metadata.contractHash);
      }
      if (metadata.contractName) {
        formData.append('contractName', metadata.contractName);
      }

      // Create XMLHttpRequest for progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Set up progress tracking
        if (onProgress) {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percentComplete = (event.loaded / event.total) * 100;
              onProgress(percentComplete);
            }
          });
        }

        // Set up response handlers
        xhr.addEventListener('load', () => {
          try {
            if (xhr.status >= 200 && xhr.status < 300) {
              const response = JSON.parse(xhr.responseText);
              console.log('✅ File uploaded successfully:', response);
              
              // Handle new API format that wraps response in {success: true, data: {...}}
              if (response.success && response.data) {
                resolve(response.data);
              } else {
                // Fallback for old format
                resolve(response);
              }
            } else {
              const errorResponse = JSON.parse(xhr.responseText);
              console.error('❌ Upload failed:', errorResponse);
              reject(new Error(errorResponse.message || `Upload failed with status ${xhr.status}`));
            }
          } catch (parseError) {
            console.error('❌ Response parse error:', parseError);
            reject(new Error('Invalid response from server'));
          }
        });

        xhr.addEventListener('error', () => {
          console.error('❌ Network error during upload');
          reject(new Error('Network error during file upload'));
        });

        xhr.addEventListener('timeout', () => {
          console.error('❌ Upload timeout');
          reject(new Error('Upload timeout - please try again'));
        });

        // Configure and send request
        xhr.timeout = this.uploadTimeout;
        xhr.open('POST', `${this.baseUrl}/upload`);
        xhr.send(formData);
      });

    } catch (error) {
      console.error('❌ File upload service error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Upload multiple files to Storj storage
   * @param {File[]} files - Array of file objects
   * @param {Object} metadata - Additional metadata
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Upload result
   */
  async uploadMultipleFiles(files, metadata = {}, onProgress = null) {
    try {
      console.log('📤 Starting multiple file upload to Storj:', files.length, 'files');

      const formData = new FormData();
      
      // Add all files
      files.forEach(file => {
        formData.append('files', file);
      });

      // Add metadata
      if (metadata.contractId) {
        formData.append('contractId', metadata.contractId);
      }
      if (metadata.contractHash) {
        formData.append('contractHash', metadata.contractHash);
      }
      if (metadata.contractName) {
        formData.append('contractName', metadata.contractName);
      }

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        if (onProgress) {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percentComplete = (event.loaded / event.total) * 100;
              onProgress(percentComplete);
            }
          });
        }

        xhr.addEventListener('load', () => {
          try {
            if (xhr.status >= 200 && xhr.status < 300) {
              const response = JSON.parse(xhr.responseText);
              console.log('✅ Multiple files uploaded successfully:', response);
              
              // Handle new API format that wraps response in {success: true, data: {...}}
              if (response.success && response.data) {
                resolve(response.data);
              } else {
                // Fallback for old format
                resolve(response);
              }
            } else {
              const errorResponse = JSON.parse(xhr.responseText);
              reject(new Error(errorResponse.message || `Upload failed with status ${xhr.status}`));
            }
          } catch (parseError) {
            reject(new Error('Invalid response from server'));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during file upload'));
        });

        xhr.addEventListener('timeout', () => {
          reject(new Error('Upload timeout - please try again'));
        });

        xhr.timeout = this.uploadTimeout;
        xhr.open('POST', `${this.baseUrl}/upload-multiple`);
        xhr.send(formData);
      });

    } catch (error) {
      console.error('❌ Multiple file upload error:', error);
      throw new Error(`Multiple upload failed: ${error.message}`);
    }
  }

  /**
   * Check service health
   * @returns {Promise<Object>} Health status
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Health check failed:', error);
      throw new Error(`Service health check failed: ${error.message}`);
    }
  }

  /**
   * Validate file before upload
   * @param {File} file - File to validate
   * @returns {Object} Validation result
   */
  validateFile(file) {
    const maxSize = 100 * 1024 * 1024; // 100MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const errors = [];

    if (!file) {
      errors.push('No file provided');
    } else {
      if (file.size > maxSize) {
        errors.push(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
      }

      if (!allowedTypes.includes(file.type)) {
        errors.push('File type not supported. Only images, PDFs, and documents are allowed');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format upload progress for display
   * @param {number} percentComplete - Progress percentage
   * @returns {string} Formatted progress
   */
  formatProgress(percentComplete) {
    return `${Math.round(percentComplete)}%`;
  }

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get upload service configuration
   * @returns {Object} Service config
   */
  getConfig() {
    return {
      baseUrl: this.baseUrl,
      uploadTimeout: this.uploadTimeout,
      maxFileSize: 100 * 1024 * 1024, // 100MB
      maxFiles: 10,
      allowedTypes: [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
    };
  }
}

// Create and export singleton instance
const fileUploadService = new FileUploadService();

export default fileUploadService;