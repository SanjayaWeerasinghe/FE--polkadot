// services/publicKeyService.js
import authService from './authService';

const API_BASE_URL = `${process.env.REACT_APP_UPLOAD_API_URL}/public-keys`;

class PublicKeyService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to make API calls
  async apiCall(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle token expiry
        if (response.status === 401) {
          try {
            await authService.refreshToken();
            // Retry with new token
            config.headers.Authorization = `Bearer ${authService.getAccessToken()}`;
            const retryResponse = await fetch(url, config);
            const retryData = await retryResponse.json();
            
            if (!retryResponse.ok) {
              throw new Error(retryData.message || 'API request failed');
            }
            
            return retryData;
          } catch (refreshError) {
            authService.clearTokens();
            throw new Error('Authentication required');
          }
        }
        
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('Public Key API call failed:', error);
      throw error;
    }
  }

  // Get all public keys for user
  async getPublicKeys() {
    const response = await this.apiCall('', {
      method: 'GET',
    });
    return response.data?.publicKeys || [];
  }

  // Add public key to user account
  async addPublicKey(publicKey) {
    const response = await this.apiCall('', {
      method: 'POST',
      body: JSON.stringify({ publicKey }),
    });
    return response;
  }

  // Remove public key from user account
  async removePublicKey(publicKey) {
    const response = await this.apiCall('', {
      method: 'DELETE',
      body: JSON.stringify({ publicKey }),
    });
    return response;
  }

  // Validate if user owns a specific public key
  async validatePublicKey(publicKey) {
    const response = await this.apiCall(`/validate/${publicKey}`, {
      method: 'GET',
    });
    return response.data;
  }

  // Validate multiple public keys
  async validateMultiplePublicKeys(publicKeys) {
    const response = await this.apiCall('/validate-multiple', {
      method: 'POST',
      body: JSON.stringify({ publicKeys }),
    });
    return response.data?.validationResults || [];
  }

  // Find user by public key
  async findUserByPublicKey(publicKey) {
    const response = await this.apiCall(`/find-user/${publicKey}`, {
      method: 'GET',
    });
    return response.data;
  }

  // Check if a public key is valid Polkadot format
  isValidPolkadotAddress(address) {
    return /^[1-9A-HJ-NP-Za-km-z]{47,48}$/.test(address);
  }

  // Format address for display
  formatAddress(address) {
    if (!address) return '';
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  }
}

// Create singleton instance
const publicKeyService = new PublicKeyService();
export default publicKeyService;