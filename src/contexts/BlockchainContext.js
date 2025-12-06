import React, { createContext, useContext } from 'react';

const BlockchainContext = createContext();

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};

export const BlockchainProvider = ({ children }) => {
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
    
    return ['wss://blockchain1.projectfreedom.online:9946'];
  };

  // Get connection status info (no persistent connection)
  const getConnectionInfo = () => {
    return {
      availableEndpoints: getBlockchainEndpoints(),
    };
  };

  const value = {
    getConnectionInfo,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};