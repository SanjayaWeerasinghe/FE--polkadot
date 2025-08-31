// services/authService.js
const API_BASE_URL = 'http://localhost:3000/api/auth';

class AuthService {
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

    // Add authorization header if token exists
    const token = this.getAccessToken();
    if (token && !options.skipAuth) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Token management
  getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  setTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // User management
  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Register new user
  async register(email, password) {
    const response = await this.apiCall('/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });
    return response;
  }

  // Verify email with OTP
  async verifyEmail(email, otp) {
    const response = await this.apiCall('/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
      skipAuth: true,
    });

    if (response.success && response.data.tokens) {
      this.setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
      this.setUser(response.data.user);
    }

    return response;
  }

  // Resend verification OTP
  async resendVerificationOTP(email) {
    const response = await this.apiCall('/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
      skipAuth: true,
    });
    return response;
  }

  // Login user
  async login(email, password) {
    const response = await this.apiCall('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });

    if (response.success && response.data.tokens) {
      this.setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
      this.setUser(response.data.user);
    }

    return response;
  }

  // Request password reset
  async requestPasswordReset(email) {
    const response = await this.apiCall('/request-password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
      skipAuth: true,
    });
    return response;
  }

  // Reset password with OTP
  async resetPassword(email, otp, newPassword) {
    const response = await this.apiCall('/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
      skipAuth: true,
    });
    return response;
  }

  // Refresh access token
  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.apiCall('/refresh-token', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
        skipAuth: true,
      });

      if (response.success && response.data.tokens) {
        this.setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
        return response.data.tokens.accessToken;
      }

      throw new Error('Token refresh failed');
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  // Get user profile
  async getProfile() {
    const response = await this.apiCall('/profile', {
      method: 'GET',
    });

    if (response.success) {
      this.setUser(response.data.user);
    }

    return response;
  }

  // Logout user
  logout() {
    this.clearTokens();
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getAccessToken();
  }

  // Check if user is verified
  isVerified() {
    const user = this.getUser();
    return user?.isVerified || false;
  }

  // Auto-refresh token if needed
  async ensureValidToken() {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      // Try to decode token and check expiry
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // If token expires in less than 5 minutes, refresh it
      if (payload.exp - currentTime < 300) {
        await this.refreshToken();
      }
      
      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      try {
        await this.refreshToken();
        return true;
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        this.clearTokens();
        return false;
      }
    }
  }
}

// Create singleton instance
const authService = new AuthService();
export default authService;