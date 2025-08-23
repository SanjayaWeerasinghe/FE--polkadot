// services/fileDownloadService.js - Service for downloading files from Storj backend

class FileDownloadService {
  constructor() {
    this.baseUrl = process.env.REACT_APP_UPLOAD_API_URL || 'http://localhost:3000/api';
    this.downloadTimeout = 120000; // 2 minutes timeout for large files
  }

  /**
   * Download file by tracking ID
   * @param {string} trackingId - The tracking ID from MongoDB
   * @param {Function} onProgress - Progress callback function (optional)
   * @returns {Promise<void>} Triggers browser download
   */
  async downloadFileByTrackingId(trackingId, onProgress = null) {
    try {
      console.log('📥 Starting file download by tracking ID:', trackingId);

      // First get file info to show user what's being downloaded
      const fileInfo = await this.getFileInfo(trackingId);
      console.log('📄 File info:', fileInfo);

      const downloadUrl = `${this.baseUrl}/download/${trackingId}`;

      // Use XMLHttpRequest for progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Set up progress tracking
        if (onProgress) {
          xhr.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percentComplete = (event.loaded / event.total) * 100;
              onProgress(percentComplete, event.loaded, event.total);
            }
          });
        }

        // Set up response handlers
        xhr.addEventListener('load', () => {
          try {
            if (xhr.status >= 200 && xhr.status < 300) {
              // Get filename from headers or use default
              const contentDisposition = xhr.getResponseHeader('Content-Disposition');
              let filename = fileInfo.frontendName || fileInfo.originalName || 'download';
              
              if (contentDisposition) {
                const matches = /filename="([^"]*)"/.exec(contentDisposition);
                if (matches && matches[1]) {
                  filename = matches[1];
                }
              }

              // Create blob and trigger download
              const blob = new Blob([xhr.response], { 
                type: xhr.getResponseHeader('Content-Type') || 'application/octet-stream' 
              });
              
              this.triggerBrowserDownload(blob, filename);
              
              console.log('✅ File downloaded successfully:', filename);
              resolve({ filename, size: blob.size });
            } else {
              // Try to parse error response
              try {
                const errorResponse = JSON.parse(xhr.responseText);
                reject(new Error(errorResponse.message || `Download failed with status ${xhr.status}`));
              } catch {
                reject(new Error(`Download failed with status ${xhr.status}`));
              }
            }
          } catch (error) {
            console.error('❌ Download processing error:', error);
            reject(new Error('Failed to process downloaded file'));
          }
        });

        xhr.addEventListener('error', () => {
          console.error('❌ Network error during download');
          reject(new Error('Network error during file download'));
        });

        xhr.addEventListener('timeout', () => {
          console.error('❌ Download timeout');
          reject(new Error('Download timeout - please try again'));
        });

        // Configure and send request
        xhr.responseType = 'arraybuffer';
        xhr.timeout = this.downloadTimeout;
        xhr.open('GET', downloadUrl);
        xhr.send();
      });

    } catch (error) {
      console.error('❌ Download service error:', error);
      throw new Error(`Download failed: ${error.message}`);
    }
  }

  /**
   * Download file by contract ID
   * @param {string} contractId - The contract ID
   * @param {Function} onProgress - Progress callback function (optional)
   * @returns {Promise<void>} Triggers browser download
   */
  async downloadFileByContractId(contractId, onProgress = null) {
    try {
      console.log('📥 Starting file download by contract ID:', contractId);

      const downloadUrl = `${this.baseUrl}/download/contract/${contractId}`;

      // Use XMLHttpRequest for progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Set up progress tracking
        if (onProgress) {
          xhr.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percentComplete = (event.loaded / event.total) * 100;
              onProgress(percentComplete, event.loaded, event.total);
            }
          });
        }

        // Set up response handlers
        xhr.addEventListener('load', () => {
          try {
            if (xhr.status >= 200 && xhr.status < 300) {
              // Get filename from headers
              const contentDisposition = xhr.getResponseHeader('Content-Disposition');
              let filename = `contract-${contractId}`;
              
              if (contentDisposition) {
                const matches = /filename="([^"]*)"/.exec(contentDisposition);
                if (matches && matches[1]) {
                  filename = matches[1];
                }
              }

              // Create blob and trigger download
              const blob = new Blob([xhr.response], { 
                type: xhr.getResponseHeader('Content-Type') || 'application/octet-stream' 
              });
              
              this.triggerBrowserDownload(blob, filename);
              
              console.log('✅ Contract file downloaded successfully:', filename);
              resolve({ filename, size: blob.size });
            } else {
              // Try to parse error response
              try {
                const errorText = new TextDecoder().decode(xhr.response);
                const errorResponse = JSON.parse(errorText);
                reject(new Error(errorResponse.message || `Download failed with status ${xhr.status}`));
              } catch {
                reject(new Error(`Download failed with status ${xhr.status}`));
              }
            }
          } catch (error) {
            console.error('❌ Download processing error:', error);
            reject(new Error('Failed to process downloaded file'));
          }
        });

        xhr.addEventListener('error', () => {
          console.error('❌ Network error during download');
          reject(new Error('Network error during file download'));
        });

        xhr.addEventListener('timeout', () => {
          console.error('❌ Download timeout');
          reject(new Error('Download timeout - please try again'));
        });

        // Configure and send request
        xhr.responseType = 'arraybuffer';
        xhr.timeout = this.downloadTimeout;
        xhr.open('GET', downloadUrl);
        xhr.send();
      });

    } catch (error) {
      console.error('❌ Download service error:', error);
      throw new Error(`Download failed: ${error.message}`);
    }
  }

  /**
   * Get file information without downloading
   * @param {string} trackingId - The tracking ID
   * @returns {Promise<Object>} File information
   */
  async getFileInfo(trackingId) {
    try {
      const response = await fetch(`${this.baseUrl}/download/info/${trackingId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to get file info: ${response.status}`);
      }

      const result = await response.json();
      
      // Handle new API format
      if (result.success && result.data) {
        return result.data;
      } else {
        return result;
      }
    } catch (error) {
      console.error('❌ Get file info failed:', error);
      throw new Error(`Failed to get file information: ${error.message}`);
    }
  }

  /**
   * Trigger browser download using blob
   * @private
   * @param {Blob} blob - File blob
   * @param {string} filename - Filename for download
   */
  triggerBrowserDownload(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the object URL
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
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
   * Format download progress for display
   * @param {number} percentComplete - Progress percentage
   * @param {number} loaded - Bytes loaded
   * @param {number} total - Total bytes
   * @returns {string} Formatted progress
   */
  formatDownloadProgress(percentComplete, loaded, total) {
    const percent = Math.round(percentComplete);
    const loadedSize = this.formatFileSize(loaded);
    const totalSize = this.formatFileSize(total);
    return `${percent}% (${loadedSize} / ${totalSize})`;
  }
}

// Create and export singleton instance
const fileDownloadService = new FileDownloadService();

export default fileDownloadService;