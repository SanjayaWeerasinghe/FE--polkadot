// hooks/useFileUpload.js - Custom hook for file upload management

import { useState, useCallback } from 'react';
import fileUploadService from '../services/fileUploadService';

export const useFileUpload = () => {
  const [uploadState, setUploadState] = useState({
    uploading: false,
    uploadProgress: 0,
    uploadComplete: false,
    uploadResult: null,
    uploadError: null
  });

  // Reset upload state
  const resetUploadState = useCallback(() => {
    setUploadState({
      uploading: false,
      uploadProgress: 0,
      uploadComplete: false,
      uploadResult: null,
      uploadError: null
    });
  }, []);

  // Upload single file
  const uploadFile = useCallback(async (file, metadata = {}, onStatusUpdate = null) => {
    try {
      // Reset state
      setUploadState({
        uploading: true,
        uploadProgress: 0,
        uploadComplete: false,
        uploadResult: null,
        uploadError: null
      });

      // Validate file before upload
      const validation = fileUploadService.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      if (onStatusUpdate) {
        onStatusUpdate('📤 Starting file upload...', 'info');
      }

      // Upload with progress tracking
      const result = await fileUploadService.uploadFile(
        file,
        metadata,
        (progress) => {
          setUploadState(prev => ({ ...prev, uploadProgress: progress }));
          if (onStatusUpdate) {
            onStatusUpdate(
              `📤 Uploading... ${fileUploadService.formatProgress(progress)}`, 
              'info'
            );
          }
        }
      );

      // Update state on success
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        uploadComplete: true,
        uploadResult: result
      }));

      if (onStatusUpdate) {
        onStatusUpdate('✅ File uploaded successfully!', 'success');
      }

      return result;

    } catch (error) {
      console.error('❌ Upload hook error:', error);
      
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        uploadError: error.message
      }));

      if (onStatusUpdate) {
        onStatusUpdate(`❌ Upload failed: ${error.message}`, 'error');
      }

      throw error;
    }
  }, []);

  // Upload multiple files
  const uploadMultipleFiles = useCallback(async (files, metadata = {}, onStatusUpdate = null) => {
    try {
      setUploadState({
        uploading: true,
        uploadProgress: 0,
        uploadComplete: false,
        uploadResult: null,
        uploadError: null
      });

      // Validate all files
      for (const file of files) {
        const validation = fileUploadService.validateFile(file);
        if (!validation.isValid) {
          throw new Error(`${file.name}: ${validation.errors.join(', ')}`);
        }
      }

      if (onStatusUpdate) {
        onStatusUpdate(`📤 Starting upload of ${files.length} files...`, 'info');
      }

      const result = await fileUploadService.uploadMultipleFiles(
        files,
        metadata,
        (progress) => {
          setUploadState(prev => ({ ...prev, uploadProgress: progress }));
          if (onStatusUpdate) {
            onStatusUpdate(
              `📤 Uploading... ${fileUploadService.formatProgress(progress)}`, 
              'info'
            );
          }
        }
      );

      setUploadState(prev => ({
        ...prev,
        uploading: false,
        uploadComplete: true,
        uploadResult: result
      }));

      if (onStatusUpdate) {
        onStatusUpdate(`✅ ${files.length} files uploaded successfully!`, 'success');
      }

      return result;

    } catch (error) {
      console.error('❌ Multiple upload hook error:', error);
      
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        uploadError: error.message
      }));

      if (onStatusUpdate) {
        onStatusUpdate(`❌ Upload failed: ${error.message}`, 'error');
      }

      throw error;
    }
  }, []);

  // Check service health
  const checkServiceHealth = useCallback(async () => {
    try {
      const health = await fileUploadService.checkHealth();
      console.log('✅ Upload service health:', health);
      return health;
    } catch (error) {
      console.error('❌ Upload service health check failed:', error);
      throw error;
    }
  }, []);

  // Get upload service configuration
  const getServiceConfig = useCallback(() => {
    return fileUploadService.getConfig();
  }, []);

  // Clear upload error
  const clearUploadError = useCallback(() => {
    setUploadState(prev => ({ ...prev, uploadError: null }));
  }, []);

  // Retry upload (useful for network failures)
  const retryUpload = useCallback(async (file, metadata = {}, onStatusUpdate = null) => {
    console.log('🔄 Retrying file upload...');
    return uploadFile(file, metadata, onStatusUpdate);
  }, [uploadFile]);

  return {
    // State
    uploadState,
    isUploading: uploadState.uploading,
    uploadProgress: uploadState.uploadProgress,
    uploadComplete: uploadState.uploadComplete,
    uploadResult: uploadState.uploadResult,
    uploadError: uploadState.uploadError,

    // Actions
    uploadFile,
    uploadMultipleFiles,
    resetUploadState,
    clearUploadError,
    retryUpload,

    // Utilities
    checkServiceHealth,
    getServiceConfig,
    
    // Helper functions from service
    validateFile: fileUploadService.validateFile.bind(fileUploadService),
    formatFileSize: fileUploadService.formatFileSize.bind(fileUploadService),
    formatProgress: fileUploadService.formatProgress.bind(fileUploadService)
  };
};