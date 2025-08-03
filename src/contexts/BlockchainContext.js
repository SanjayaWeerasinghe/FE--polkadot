import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';

const BlockchainContext = createContext();

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};

export const BlockchainProvider = ({ children }) => {
  const [api, setApi] = useState(null);
  const [connecting, setConnecting] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [currentEndpoint, setCurrentEndpoint] = useState(null);

  // Blockchain connection configuration
  const getBlockchainEndpoints = () => {
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

  const BLOCKCHAIN_ENDPOINTS = getBlockchainEndpoints();

  const connectToBlockchain = async () => {
    setConnecting(true);
    setError(null);

    for (const endpoint of BLOCKCHAIN_ENDPOINTS) {
      try {
        console.log(`Attempting to connect to ${endpoint}...`);
        
        const provider = new WsProvider(endpoint, false); // false = don't auto-connect
        
        // Set up provider event listeners before connecting
        provider.on('connected', () => {
          console.log(`Connected to ${endpoint}`);
          setCurrentEndpoint(endpoint);
        });
        
        provider.on('disconnected', () => {
          console.log(`Disconnected from ${endpoint}`);
          setConnected(false);
          setApi(null);
          setCurrentEndpoint(null);
          // Attempt to reconnect after a delay
          setTimeout(() => connectToBlockchain(), 5000);
        });

        provider.on('error', (error) => {
          console.error(`Provider error for ${endpoint}:`, error);
        });

        // Connect the provider
        await provider.connect();
        
        const apiInstance = await ApiPromise.create({ 
          provider,
          throwOnConnect: true 
        });

        // Test the connection
        await apiInstance.isReady;
        
        console.log(`Successfully connected to ${endpoint}`);
        console.log('Chain info:', {
          chain: (await apiInstance.rpc.system.chain()).toString(),
          version: (await apiInstance.rpc.system.version()).toString(),
          nodeType: (await apiInstance.rpc.system.nodeType()).toString()
        });
        
        setApi(apiInstance);
        setConnected(true);
        setConnecting(false);
        setCurrentEndpoint(endpoint);
        
        return; // Success, exit the loop
        
      } catch (error) {
        console.warn(`Failed to connect to ${endpoint}:`, error.message);
        continue; // Try next endpoint
      }
    }

    // If we get here, all endpoints failed
    const errorMessage = `Failed to connect to blockchain. Tried endpoints: ${BLOCKCHAIN_ENDPOINTS.join(', ')}`;
    console.error(errorMessage);
    setError(errorMessage);
    setConnecting(false);
  };

  // Initialize blockchain connection
  useEffect(() => {
    connectToBlockchain();

    // Cleanup on unmount
    return () => {
      if (api) {
        api.disconnect();
      }
    };
  }, []);

  // Retry connection function
  const retryConnection = () => {
    connectToBlockchain();
  };

  // Check if pallet exists
  const hasPallet = (palletName) => {
    return api && api.tx[palletName] !== undefined;
  };

  // Get chain info
  const getChainInfo = async () => {
    if (!api) return null;
    
    try {
      const [chain, version, properties, nodeType] = await Promise.all([
        api.rpc.system.chain(),
        api.rpc.system.version(),
        api.rpc.system.properties(),
        api.rpc.system.nodeType()
      ]);

      return {
        chain: chain.toString(),
        version: version.toString(),
        nodeType: nodeType.toString(),
        properties: properties.toHuman(),
        endpoint: currentEndpoint,
      };
    } catch (error) {
      console.error('Error getting chain info:', error);
      return null;
    }
  };

  // Get connection status info
  const getConnectionInfo = () => {
    return {
      connected,
      connecting,
      error,
      endpoint: currentEndpoint,
      availableEndpoints: BLOCKCHAIN_ENDPOINTS,
    };
  };

  const value = {
    api,
    connecting,
    connected,
    error,
    currentEndpoint,
    retryConnection,
    hasPallet,
    getChainInfo,
    getConnectionInfo,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};