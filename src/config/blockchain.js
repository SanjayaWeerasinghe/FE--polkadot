// Blockchain configuration file

/**
 * Get blockchain endpoints based on environment
 */
export const getBlockchainEndpoints = () => {
  // Production/Staging endpoints
  if (process.env.REACT_APP_BLOCKCHAIN_WSS) {
      return [process.env.REACT_APP_BLOCKCHAIN_WSS];
    }
    
    if (process.env.REACT_APP_BLOCKCHAIN_WS) {
      return [process.env.REACT_APP_BLOCKCHAIN_WS];
    }
    
    if (process.env.REACT_APP_BLOCKCHAIN_ENDPOINTS) {
      return process.env.REACT_APP_BLOCKCHAIN_ENDPOINTS.split(',').map(url => url.trim());
    }
    
    return ['wss://144.91.67.54:9946'];
};

/**
 * Blockchain connection configuration
 */
export const blockchainConfig = {
  endpoints: getBlockchainEndpoints(),
  connectionTimeout: 10000, // 10 seconds
  reconnectDelay: 5000,      // 5 seconds
  maxReconnectAttempts: 5,
  enableDebugLogs: process.env.REACT_APP_DEBUG === 'true',
};

/**
 * Network-specific configurations
 */
export const networkConfigs = {
  development: {
    name: 'Development Network',
    prefix: 42,
    decimals: 12,
    symbol: 'DEV',
  },
  testnet: {
    name: 'Testnet Network', 
    prefix: 42,
    decimals: 12,
    symbol: 'TEST',
  },
  mainnet: {
    name: 'Production Network',
    prefix: 0,
    decimals: 12,
    symbol: 'PROD',
  }
};

/**
 * Get current network config
 */
export const getCurrentNetworkConfig = () => {
  const networkType = process.env.REACT_APP_NETWORK_TYPE || 'development';
  return networkConfigs[networkType] || networkConfigs.development;
};

/**
 * Validate WebSocket URL
 */
export const isValidWebSocketUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'ws:' || parsedUrl.protocol === 'wss:';
  } catch {
    return false;
  }
};

/**
 * Format endpoint for display
 */
export const formatEndpointForDisplay = (endpoint) => {
  try {
    const url = new URL(endpoint);
    return `${url.hostname}:${url.port}`;
  } catch {
    return endpoint;
  }
};

export default blockchainConfig;