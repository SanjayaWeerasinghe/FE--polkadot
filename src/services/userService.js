// services/userService.js - User management service
const API_BASE_URL = 'http://localhost:3000/api';

class UserService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to make API calls with auth
  async apiCall(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('accessToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('User API call failed:', error);
      throw error;
    }
  }

  // Get all registered users (for dropdown selection)
  async getAllUsers() {
    try {
      console.log('📋 Fetching all verified users with public keys...');
      
      const response = await this.apiCall('/users/all', {
        method: 'GET'
      });
      
      if (response.success) {
        console.log(`✅ Loaded ${response.data.users.length} users`);
        return response.data.users;
      }
      
      console.warn('⚠️ Failed to get users:', response.message);
      return [];
    } catch (error) {
      console.error('❌ Failed to get all users:', error);
      // Return empty array on error to gracefully handle API failures
      return [];
    }
  }

  // Get user by public key (for finding user info by wallet address)
  async getUserByPublicKey(publicKey) {
    try {
      console.log('🔍 Getting user by public key:', publicKey);
      
      const response = await this.apiCall(`/users/by-address/${encodeURIComponent(publicKey)}`, {
        method: 'GET'
      });
      
      if (response.success) {
        console.log('✅ Found user:', response.data.user.name);
        return response.data.user;
      }
      
      console.log('ℹ️ No user found for this public key');
      return null;
    } catch (error) {
      console.error('❌ Failed to get user by public key:', error);
      return null;
    }
  }

  // Get current user's recent contacts (users they've created contracts with)
  async getUserContacts() {
    try {
      console.log('📇 Getting user contacts (recent contract parties)');
      
      const response = await this.apiCall('/users/contacts', {
        method: 'GET'
      });
      
      if (response.success) {
        console.log(`✅ Loaded ${response.data.contacts.length} recent contacts`);
        return response.data.contacts;
      }
      
      console.warn('⚠️ Failed to get contacts:', response.message);
      return [];
    } catch (error) {
      console.error('❌ Failed to get user contacts:', error);
      // Fallback to all users if contacts API fails
      try {
        const allUsers = await this.getAllUsers();
        return allUsers.slice(0, 5); // Return first 5 as fallback
      } catch {
        return [];
      }
    }
  }

  // Format user data for consistent display
  formatUserForDisplay(user) {
    if (!user) return null;
    
    return {
      id: user.id || user._id,
      email: user.email,
      name: user.name || user.email.split('@')[0],
      primaryAddress: user.primaryAddress || (user.publicKeys && user.publicKeys[0]),
      publicKeys: user.publicKeys || [],
      isOnline: user.isOnline !== undefined ? user.isOnline : true,
      createdAt: user.createdAt
    };
  }
  
  // Get formatted address display
  formatAddressDisplay(address) {
    if (!address || address.length < 12) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  }
  
  // Check if address is valid Substrate format
  isValidSubstrateAddress(address) {
    return typeof address === 'string' && 
           address.startsWith('5') && 
           address.length >= 47 && 
           address.length <= 48;
  }
}

// Create singleton instance
const userService = new UserService();
export default userService;