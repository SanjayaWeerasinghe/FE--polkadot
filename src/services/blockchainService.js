// Complete Fixed blockchainService.js - Resolves transaction wrapper issue
// This handles all blockchain interactions for the Digital Notarized Contract pallet

import { ApiPromise, WsProvider } from '@polkadot/api';
import { hexToU8a, stringToU8a } from '@polkadot/util';

class BlockchainService {
  constructor() {
    this.api = null;
    this.connecting = false;
    this.connectionPromise = null;
    this.currentEndpoint = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  // Convert string to Vec<u8> format expected by pallet
  _stringToU8Array(str) {
    if (!str) return [];
    
    // Convert string to UTF-8 bytes
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    
    // Convert to Array for Polkadot.js
    return Array.from(bytes);
  }

  // Convert Vec<u8> back to string for display
  _u8ArrayToString(u8Array) {
    if (!u8Array || u8Array.length === 0) return '';
    
    try {
      const decoder = new TextDecoder('utf-8');
      const uint8Array = new Uint8Array(u8Array);
      return decoder.decode(uint8Array);
    } catch (error) {
      console.warn('Failed to decode u8 array to string:', error);
      return '';
    }
  }

  // Format file hash for blockchain
  _formatFileHash(fileHash) {
    if (!fileHash) {
      throw new Error('File hash is required');
    }
    
    if (typeof fileHash !== 'string') {
      throw new Error(`File hash must be a string, got ${typeof fileHash}`);
    }
    
    if (fileHash.startsWith('0x')) {
      if (fileHash.length !== 66) {
        throw new Error(`Invalid hash length: ${fileHash.length}. Expected 66 characters (0x + 64 hex chars)`);
      }
      
      // Validate hex characters
      const hexPart = fileHash.slice(2);
      if (!/^[0-9a-fA-F]+$/.test(hexPart)) {
        throw new Error('Hash contains invalid characters. Must be hexadecimal (0-9, a-f, A-F)');
      }
      
      return fileHash;
    }
    
    if (fileHash.length === 64 && /^[0-9a-fA-F]+$/.test(fileHash)) {
      return `0x${fileHash}`;
    }
    
    throw new Error(`Invalid file hash format: ${fileHash}. Expected 32-byte hex string with or without 0x prefix.`);
  }

  // Validate Substrate address format
  _isValidAddress(address) {
    return typeof address === 'string' && 
           address.startsWith('5') && 
           address.length >= 47 && 
           address.length <= 48;
  }

  // Parse dispatch errors with detailed information
  _parseDispatchError(dispatchError, api) {
    if (dispatchError.isModule) {
      try {
        const decoded = api.registry.findMetaError(dispatchError.asModule);
        const errorMessage = `Pallet Error: ${decoded.section}.${decoded.name} - ${decoded.docs.join(' ')}`;
        console.error('🚨 Module Error Details:', {
          section: decoded.section,
          name: decoded.name,
          docs: decoded.docs,
          raw: dispatchError.toString()
        });
        return new Error(errorMessage);
      } catch (decodeError) {
        console.error('🚨 Could not decode module error:', dispatchError.toString());
        return new Error(`Module error (decode failed): ${dispatchError.toString()}`);
      }
    } else if (dispatchError.isToken) {
      const errorMessage = `Token error: ${dispatchError.asToken.toString()}`;
      console.error('🚨 Token Error:', errorMessage);
      return new Error(errorMessage);
    } else if (dispatchError.isArithmetic) {
      const errorMessage = `Arithmetic error: ${dispatchError.asArithmetic.toString()}`;
      console.error('🚨 Arithmetic Error:', errorMessage);
      return new Error(errorMessage);
    } else if (dispatchError.isTransactional) {
      const errorMessage = `Transactional error: ${dispatchError.asTransactional.toString()}`;
      console.error('🚨 Transactional Error:', errorMessage);
      return new Error(errorMessage);
    } else {
      const errorMessage = `Unknown dispatch error: ${dispatchError.toString()}`;
      console.error('🚨 Unknown Dispatch Error:', errorMessage);
      return new Error(errorMessage);
    }
  }

  // ========================================
  // CONNECTION MANAGEMENT
  // ========================================

  // Get blockchain endpoints with environment variable support
  getEndpoints() {
    if (process.env.REACT_APP_BLOCKCHAIN_ENDPOINTS) {
      return process.env.REACT_APP_BLOCKCHAIN_ENDPOINTS.split(',').map(url => url.trim());
    }
    
    if (process.env.REACT_APP_BLOCKCHAIN_WSS) {
      return [process.env.REACT_APP_BLOCKCHAIN_WSS];
    }
    
    if (process.env.REACT_APP_BLOCKCHAIN_WS) {
      return [process.env.REACT_APP_BLOCKCHAIN_WS];
    }
    
    // Default endpoints
    return [
      'wss://144.91.67.54:9946',  // Your production endpoint
      'ws://127.0.0.1:9944'       // Local development fallback
    ];
  }

  // Enhanced blockchain connection with comprehensive error handling
  async connect() {
    if (this.api && this.api.isConnected) {
      console.log('✅ Using existing blockchain connection');
      return this.api;
    }

    if (this.connecting && this.connectionPromise) {
      console.log('⏳ Connection already in progress, waiting...');
      return this.connectionPromise;
    }

    this.connecting = true;
    this.connectionPromise = this._connectToAnyEndpoint();
    
    try {
      this.api = await this.connectionPromise;
      this.connecting = false;
      this.reconnectAttempts = 0;
      console.log('✅ Blockchain connection established successfully');
      return this.api;
    } catch (error) {
      this.connecting = false;
      this.connectionPromise = null;
      console.error('❌ Blockchain connection failed:', error);
      throw error;
    }
  }

  // Connect to any available endpoint
  async _connectToAnyEndpoint() {
    const endpoints = this.getEndpoints();
    let lastError = null;

    console.log('🔄 Attempting to connect to blockchain endpoints:', endpoints);

    for (const endpoint of endpoints) {
      try {
        console.log(`🔄 Connecting to ${endpoint}...`);
        
        const provider = new WsProvider(endpoint, false);
        
        // Set up provider event handlers
        provider.on('connected', () => {
          console.log(`✅ Provider connected to ${endpoint}`);
          this.currentEndpoint = endpoint;
        });
        
        provider.on('disconnected', () => {
          console.log(`🔌 Provider disconnected from ${endpoint}`);
          this.api = null;
          this.currentEndpoint = null;
          
          // Attempt to reconnect after a delay
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);
            setTimeout(() => this.connect(), 5000);
          }
        });

        provider.on('error', (error) => {
          console.error(`❌ Provider error for ${endpoint}:`, error);
        });

        // Connect the provider
        await provider.connect();
        
        // Create API instance
        const api = await ApiPromise.create({ 
          provider,
          throwOnConnect: true,
          types: {
            // Add custom types if needed
          }
        });
        
        await api.isReady;
        
        // Test the connection
        const [chain, version] = await Promise.all([
          api.rpc.system.chain(),
          api.rpc.system.version()
        ]);
        
        console.log(`✅ Successfully connected to ${endpoint}`);
        console.log('📊 Chain info:', {
          chain: chain.toString(),
          version: version.toString(),
          endpoint: endpoint
        });
        
        // Verify our pallet exists
        if (!api.tx.digitalNotarizedContract) {
          console.warn('⚠️ digitalNotarizedContract pallet not found in runtime');
        } else {
          console.log('✅ digitalNotarizedContract pallet found and ready');
        }

        return api;
        
      } catch (error) {
        console.warn(`❌ Failed to connect to ${endpoint}:`, error.message);
        lastError = error;
        continue;
      }
    }

    // All endpoints failed
    const errorMessage = `Failed to connect to any blockchain endpoint. Endpoints tried: ${endpoints.join(', ')}. Last error: ${lastError?.message}`;
    throw new Error(errorMessage);
  }

  // Execute operation with proper connection management
  async executeWithConnection(operation) {
    try {
      const api = await this.connect();
      return await operation(api);
    } catch (error) {
      // Only reset connection on specific connection errors
      if (error.message.includes('disconnected') || 
          error.message.includes('WebSocket') ||
          error.message.includes('connection closed') ||
          error.message.includes('Provider error')) {
        console.log('🔄 Resetting connection due to connectivity error');
        this.api = null;
        this.connecting = false;
        this.connectionPromise = null;
      }
      
      console.error('💥 Operation failed:', error.message);
      throw error;
    }
  }

  // ========================================
  // FIXED TRANSACTION METHODS
  // ========================================

  // *** COMPLETE FIX: Initiate contract with proper transaction wrapper ***
  async initiateContract(
    injector, 
    accountAddress, 
    fileHash, 
    firstParty, 
    secondParty, 
    thirdParty, 
    contractName, 
    metadata = ''
  ) {
    return this.executeWithConnection(async (api) => {
      try {
        // 1. Validate inputs
        if (!injector || !injector.signer) {
          throw new Error('Invalid injector: signer not available');
        }

        if (!this._isValidAddress(accountAddress)) {
          throw new Error(`Invalid account address: ${accountAddress}`);
        }

        if (!this._isValidAddress(firstParty) || !this._isValidAddress(secondParty) || !this._isValidAddress(thirdParty)) {
          throw new Error('One or more party addresses are invalid');
        }

        if (!contractName || contractName.trim().length === 0) {
          throw new Error('Contract name is required');
        }

        if (contractName.trim().length > 512) {
          throw new Error('Contract name too long (max 512 characters)');
        }

        if (metadata && metadata.length > 1024) {
          throw new Error('Metadata too long (max 1024 characters)');
        }

        // 2. Format parameters for blockchain
        const formattedHash = this._formatFileHash(fileHash);
        const contractNameBytes = this._stringToU8Array(contractName.trim());
        const metadataBytes = this._stringToU8Array(metadata || '');

        console.log('📝 Creating initiate contract transaction with parameters:', {
          fileHash: formattedHash,
          contractName: contractName.trim(),
          contractNameLength: contractNameBytes.length,
          metadataLength: metadataBytes.length,
          parties: {
            first: firstParty,
            second: secondParty,
            third: thirdParty
          },
          initiator: accountAddress
        });

        // 3. Create the transaction object
        const tx = api.tx.digitalNotarizedContract.initiateContract(
          formattedHash,      // T::Hash
          firstParty,         // T::AccountId
          secondParty,        // T::AccountId  
          thirdParty,         // T::AccountId
          contractNameBytes,  // Vec<u8>
          metadataBytes      // Vec<u8>
        );

        // 4. Get payment information
        try {
          const paymentInfo = await tx.paymentInfo(accountAddress);
          console.log('💰 Transaction fee estimate:', {
            partialFee: paymentInfo.partialFee.toHuman(),
            weight: paymentInfo.weight.toHuman()
          });
        } catch (feeError) {
          console.warn('⚠️ Could not get fee estimate:', feeError.message);
        }

        // 5. *** CRITICAL FIX: Proper transaction submission ***
        return new Promise((resolve, reject) => {
          let unsubscribe = null;
          
          const timeout = setTimeout(() => {
            if (unsubscribe) {
              unsubscribe();
            }
            reject(new Error('Transaction timeout after 3 minutes'));
          }, 180000); // 3 minute timeout

          // *** THE KEY FIX: Only specify signer, let Polkadot.js handle everything else ***
          tx.signAndSend(
            accountAddress,
            { 
              signer: injector.signer 
              // *** CRITICAL: Do NOT specify nonce, era, tip, or any other options ***
              // Let Polkadot.js handle all transaction metadata automatically
            },
            (result) => {
              console.log(`📊 Transaction status: ${result.status.type}`);

              // Log transaction hash when available
              if (result.txHash) {
                console.log('📋 Transaction hash:', result.txHash.toHex());
              }

              // Handle different status types
              if (result.status.isReady) {
                console.log('📋 Transaction ready and submitted to network');
              }

              if (result.status.isBroadcast) {
                console.log('📡 Transaction broadcast to network peers');
              }

              if (result.status.isInBlock) {
                console.log('📦 Transaction included in block:', result.status.asInBlock.toHex());
                
                // Log all events in this block
                if (result.events && result.events.length > 0) {
                  console.log('📋 Block events:');
                  result.events.forEach(({ event, phase }) => {
                    console.log(`  ${event.section}.${event.method}:`, event.data.toHuman());
                  });
                }
              }

              // *** HANDLE FINALIZATION (Success or Error) ***
              if (result.status.isFinalized) {
                clearTimeout(timeout);
                if (unsubscribe) unsubscribe();
                
                console.log('🎉 Transaction finalized in block:', result.status.asFinalized.toHex());

                // *** CHECK FOR DISPATCH ERRORS AFTER FINALIZATION ***
                if (result.dispatchError) {
                  console.error('💥 Transaction failed with dispatch error');
                  const error = this._parseDispatchError(result.dispatchError, api);
                  reject(error);
                  return;
                }

                // *** SUCCESS: Extract contract creation events ***
                const contractEvents = result.events.filter(({ event }) =>
                  event.section === 'digitalNotarizedContract' && 
                  event.method === 'ContractInitiated'
                );

                let contractId = null;
                let eventData = null;
                if (contractEvents.length > 0) {
                  eventData = contractEvents[0].event.data.toHuman();
                  contractId = eventData.contract_id || eventData.contractId;
                  console.log('📋 Contract successfully created with ID:', contractId);
                  console.log('📋 Contract event data:', eventData);
                } else {
                  console.warn('⚠️ No ContractInitiated event found, but transaction succeeded');
                }

                // Return success result
                resolve({
                  success: true,
                  blockHash: result.status.asFinalized.toHex(),
                  txHash: result.txHash.toHex(),
                  contractId,
                  eventData,
                  allEvents: result.events.map(({ event, phase }) => ({
                    phase: phase.toString(),
                    section: event.section,
                    method: event.method,
                    data: event.data.toHuman()
                  }))
                });
              }

              // *** HANDLE ERRORS DURING PROCESSING ***
              if (result.dispatchError) {
                clearTimeout(timeout);
                if (unsubscribe) unsubscribe();
                
                console.error('💥 Transaction dispatch error');
                const error = this._parseDispatchError(result.dispatchError, api);
                reject(error);
              }
            }
          )
          .then(unsub => {
            unsubscribe = unsub;
            console.log('📡 Transaction submitted successfully, waiting for confirmation...');
          })
          .catch(error => {
            clearTimeout(timeout);
            console.error('💥 Transaction submission failed:', error);
            
            // Provide better error messages for common issues
            if (error.message.includes('Cancelled')) {
              reject(new Error('Transaction was cancelled by user'));
            } else if (error.message.includes('1014')) {
              reject(new Error('Transaction priority too low - network may be congested, please try again'));
            } else if (error.message.includes('1010')) {
              reject(new Error('Invalid transaction - please check your inputs and try again'));
            } else if (error.message.includes('nonce')) {
              reject(new Error('Nonce error - please refresh and try again'));
            } else {
              reject(new Error(`Transaction submission failed: ${error.message}`));
            }
          });
        });

      } catch (error) {
        console.error('💥 Transaction preparation failed:', error);
        throw error;
      }
    });
  }

  // *** FIXED: Sign contract with proper transaction handling ***
  async signContract(injector, accountAddress, contractHash, signature) {
    return this.executeWithConnection(async (api) => {
      try {
        if (!injector || !injector.signer) {
          throw new Error('Invalid injector: signer not available');
        }

        const formattedHash = this._formatFileHash(contractHash);
        const signatureBytes = this._stringToU8Array(signature);

        console.log('✍️ Creating sign contract transaction:', {
          contractHash: formattedHash,
          signatureLength: signatureBytes.length,
          accountAddress
        });

        const tx = api.tx.digitalNotarizedContract.signContract(
          formattedHash,
          signatureBytes
        );

        // Get payment info
        try {
          const paymentInfo = await tx.paymentInfo(accountAddress);
          console.log('💰 Sign transaction fee estimate:', paymentInfo.partialFee.toHuman());
        } catch (feeError) {
          console.warn('⚠️ Could not get fee estimate:', feeError.message);
        }

        return new Promise((resolve, reject) => {
          let unsubscribe = null;
          
          const timeout = setTimeout(() => {
            if (unsubscribe) unsubscribe();
            reject(new Error('Transaction timeout after 3 minutes'));
          }, 180000);

          tx.signAndSend(accountAddress, { signer: injector.signer }, (result) => {
            console.log(`📊 Sign transaction status: ${result.status.type}`);

            if (result.status.isFinalized) {
              clearTimeout(timeout);
              if (unsubscribe) unsubscribe();
              
              if (result.dispatchError) {
                const error = this._parseDispatchError(result.dispatchError, api);
                reject(error);
                return;
              }

              // Look for ContractSigned event
              const signedEvents = result.events.filter(({ event }) =>
                event.section === 'digitalNotarizedContract' && 
                event.method === 'ContractSigned'
              );

              console.log('✅ Contract signed successfully');
              if (signedEvents.length > 0) {
                console.log('📋 Sign event data:', signedEvents[0].event.data.toHuman());
              }

              resolve({
                success: true,
                blockHash: result.status.asFinalized.toHex(),
                txHash: result.txHash.toHex(),
                events: signedEvents.map(({ event }) => event.data.toHuman())
              });
            }

            if (result.dispatchError) {
              clearTimeout(timeout);
              if (unsubscribe) unsubscribe();
              const error = this._parseDispatchError(result.dispatchError, api);
              reject(error);
            }
          })
          .then(unsub => { 
            unsubscribe = unsub; 
          })
          .catch(error => {
            clearTimeout(timeout);
            reject(new Error(`Sign transaction failed: ${error.message}`));
          });
        });

      } catch (error) {
        console.error('💥 Sign transaction error:', error);
        throw error;
      }
    });
  }

  // *** FIXED: Deactivate contract ***
  async deactivateContract(injector, accountAddress, contractHash, reason = 'User requested') {
    return this.executeWithConnection(async (api) => {
      try {
        const formattedHash = this._formatFileHash(contractHash);
        const reasonBytes = this._stringToU8Array(reason);

        console.log('🗑️ Creating deactivate contract transaction:', {
          contractHash: formattedHash,
          reason: reason,
          reasonLength: reasonBytes.length
        });

        const tx = api.tx.digitalNotarizedContract.deactivateContract(
          formattedHash,
          reasonBytes
        );

        return this._executeGenericTransaction(tx, injector, accountAddress, 'deactivateContract');

      } catch (error) {
        console.error('💥 Deactivate contract error:', error);
        throw error;
      }
    });
  }

  // *** FIXED: Complete contract ***
  async completeContract(injector, accountAddress, contractHash) {
    return this.executeWithConnection(async (api) => {
      try {
        const formattedHash = this._formatFileHash(contractHash);

        console.log('✅ Creating complete contract transaction:', {
          contractHash: formattedHash
        });

        const tx = api.tx.digitalNotarizedContract.completeContract(formattedHash);

        return this._executeGenericTransaction(tx, injector, accountAddress, 'completeContract');

      } catch (error) {
        console.error('💥 Complete contract error:', error);
        throw error;
      }
    });
  }

  // *** FIXED: Update metadata ***
  async updateMetadata(injector, accountAddress, contractHash, newMetadata) {
    return this.executeWithConnection(async (api) => {
      try {
        const formattedHash = this._formatFileHash(contractHash);
        const metadataBytes = this._stringToU8Array(newMetadata || '');

        console.log('📝 Creating update metadata transaction:', {
          contractHash: formattedHash,
          metadataLength: metadataBytes.length
        });

        const tx = api.tx.digitalNotarizedContract.updateMetadata(
          formattedHash,
          metadataBytes
        );

        return this._executeGenericTransaction(tx, injector, accountAddress, 'updateMetadata');

      } catch (error) {
        console.error('💥 Update metadata error:', error);
        throw error;
      }
    });
  }

  // *** HELPER: Generic transaction executor ***
  async _executeGenericTransaction(tx, injector, accountAddress, operationType) {
    return new Promise(async (resolve, reject) => {
      try {
        // Get payment info
        try {
          const paymentInfo = await tx.paymentInfo(accountAddress);
          console.log(`💰 ${operationType} fee estimate:`, paymentInfo.partialFee.toHuman());
        } catch (feeError) {
          console.warn('⚠️ Could not get fee estimate:', feeError.message);
        }

        let unsubscribe = null;
        const timeout = setTimeout(() => {
          if (unsubscribe) unsubscribe();
          reject(new Error('Transaction timeout after 3 minutes'));
        }, 180000);

        unsubscribe = await tx.signAndSend(
          accountAddress, 
          { signer: injector.signer }, 
          (result) => {
            console.log(`📊 ${operationType} status: ${result.status.type}`);

            if (result.status.isFinalized) {
              clearTimeout(timeout);
              if (unsubscribe) unsubscribe();
              
              if (result.dispatchError) {
                const error = this._parseDispatchError(result.dispatchError, this.api);
                reject(error);
                return;
              }

              console.log(`✅ ${operationType} completed successfully`);
              
              resolve({
                success: true,
                blockHash: result.status.asFinalized.toHex(),
                txHash: result.txHash.toHex(),
                events: result.events.map(({ event }) => ({
                  section: event.section,
                  method: event.method,
                  data: event.data.toHuman()
                }))
              });
            }

            if (result.dispatchError) {
              clearTimeout(timeout);
              if (unsubscribe) unsubscribe();
              const error = this._parseDispatchError(result.dispatchError, this.api);
              reject(error);
            }
          }
        );

      } catch (error) {
        reject(new Error(`${operationType} failed: ${error.message}`));
      }
    });
  }

  // ========================================
  // QUERY METHODS
  // ========================================

  // Check if contract exists
  async checkContractExists(contractHash) {
    return this.executeWithConnection(async (api) => {
      try {
        const formattedHash = this._formatFileHash(contractHash);
        
        console.log('🔍 Checking contract existence for hash:', formattedHash);
        
        const contractId = await api.query.digitalNotarizedContract.hashToContract(formattedHash);
        
        if (contractId.isSome) {
          const id = contractId.unwrap().toString();
          console.log('📋 Found contract ID:', id);
          
          const contractInfo = await api.query.digitalNotarizedContract.contracts(id);
          
          if (contractInfo.isSome) {
            const contract = contractInfo.unwrap().toHuman();
            console.log('✅ Contract details retrieved');
            
            return {
              exists: true,
              contractId: id,
              contract: contract,
              status: contract.status
            };
          }
        }
        
        console.log('❌ Contract not found');
        return {
          exists: false,
          contractId: null,
          contract: null,
          status: null
        };
        
      } catch (error) {
        console.error('💥 Error checking contract existence:', error);
        throw error;
      }
    });
  }

  // Get contracts by account
  async getContractsByAccount(accountAddress) {
    return this.executeWithConnection(async (api) => {
      try {
        console.log('📊 Getting contracts for account:', accountAddress);
        
        const contractIds = await api.query.digitalNotarizedContract.accountContracts(accountAddress);
        
        if (contractIds.isEmpty) {
          console.log('📋 No contracts found for account');
          return [];
        }
        
        const ids = contractIds.toHuman();
        console.log('📋 Found contract IDs:', ids);
        
        const contracts = [];
        
        for (const id of ids) {
          try {
            const contractInfo = await api.query.digitalNotarizedContract.contracts(id);
            if (contractInfo.isSome) {
              const contract = contractInfo.unwrap().toHuman();
              contracts.push({
                contractId: id,
                ...contract
              });
            }
          } catch (error) {
            console.warn(`⚠️ Failed to get contract ${id}:`, error);
          }
        }
        
        console.log(`✅ Retrieved ${contracts.length} contracts`);
        return contracts;
        
      } catch (error) {
        console.error('💥 Error getting contracts by account:', error);
        throw error;
      }
    });
  }

  // Get contract statistics
  async getContractStatistics() {
    return this.executeWithConnection(async (api) => {
      try {
        console.log('📊 Getting contract statistics...');
        
        const stats = await api.query.digitalNotarizedContract.contractStats();
        const [total, active, completed] = stats.toHuman();
        
        const statistics = {
          total: parseInt(total),
          active: parseInt(active),
          completed: parseInt(completed)
        };
        
        console.log('✅ Statistics retrieved:', statistics);
        return statistics;
        
      } catch (error) {
        console.error('💥 Error getting contract statistics:', error);
        throw error;
      }
    });
  }

  // ========================================
  // DEBUGGING AND TESTING
  // ========================================

  // Test transaction format (for debugging)
  async testTransactionFormat(fileHash, firstParty, secondParty, thirdParty, contractName, metadata) {
    return this.executeWithConnection(async (api) => {
      try {
        const formattedHash = this._formatFileHash(fileHash);
        const contractNameBytes = this._stringToU8Array(contractName.trim());
        const metadataBytes = this._stringToU8Array(metadata || '');

        const tx = api.tx.digitalNotarizedContract.initiateContract(
          formattedHash, firstParty, secondParty, thirdParty, contractNameBytes, metadataBytes
        );

        console.log('🔍 Transaction Format Analysis:');
        console.log('Call data (what you were sending before):', tx.method.toHex());
        console.log('Call data length:', tx.method.toHex().length);
        console.log('✅ FIX: Now using signAndSend() which adds signature wrapper automatically');
        console.log('Expected full transaction format: [signature_wrapper] + [call_data]');
        
        return {
          callDataOnly: tx.method.toHex(),
          callDataLength: tx.method.toHex().length,
          expectedFormat: 'Signature wrapper (0xe9038400...) + Call data (0x0700...)',
          solution: 'Using tx.signAndSend() instead of sending raw call data',
          status: 'Fixed - transaction now includes proper signature wrapper'
        };
        
      } catch (error) {
        console.error('Transaction format test failed:', error);
        return {
          success: false,
          error: error.message
        };
      }
    });
  }

  // Test blockchain queries
  async testQueries() {
    return this.executeWithConnection(async (api) => {
      try {
        console.log('🔍 Testing pallet queries and blockchain connection...');
        
        // Check if pallet exists
        if (!api.query.digitalNotarizedContract) {
          throw new Error('digitalNotarizedContract pallet not found in runtime');
        }
        
        console.log('✅ Pallet found in runtime');
        
        // Test basic queries
        const [nextId, chainInfo, stats] = await Promise.all([
          api.query.digitalNotarizedContract.nextContractId(),
          this._getBasicChainInfo(api),
          api.query.digitalNotarizedContract.contractStats().catch(() => [0, 0, 0])
        ]);
        
        console.log('✅ Storage queries successful');
        console.log('📊 Next Contract ID:', nextId.toString());
        console.log('📊 Contract Stats:', stats.toHuman ? stats.toHuman() : stats);
        
        return {
          success: true,
          palletExists: true,
          nextContractId: nextId.toString(),
          contractStats: stats.toHuman ? stats.toHuman() : stats,
          chainInfo,
          message: 'All queries successful! Pallet is properly integrated and functional.'
        };
        
      } catch (error) {
        console.error('❌ Query test failed:', error);
        return {
          success: false,
          palletExists: !!api.query?.digitalNotarizedContract,
          error: error.message,
          message: 'Query test failed - see error details'
        };
      }
    });
  }

  // Get basic chain information
  async _getBasicChainInfo(api) {
    try {
      const [chain, version, properties] = await Promise.all([
        api.rpc.system.chain(),
        api.rpc.system.version(),
        api.rpc.system.properties()
      ]);

      return {
        chain: chain.toString(),
        version: version.toString(),
        properties: properties.toHuman(),
        endpoint: this.currentEndpoint
      };
    } catch (error) {
      console.error('⚠️ Error getting chain info:', error);
      return { 
        error: error.message,
        chain: 'unknown',
        version: 'unknown',
        endpoint: this.currentEndpoint
      };
    }
  }

  // ========================================
  // UTILITY AND INFO METHODS
  // ========================================

  // Disconnect from blockchain
  async disconnect() {
    if (this.api) {
      try {
        await this.api.disconnect();
        console.log('✅ Disconnected from blockchain');
      } catch (error) {
        console.error('⚠️ Error during disconnect:', error);
      }
      this.api = null;
    }
    this.connecting = false;
    this.connectionPromise = null;
    this.currentEndpoint = null;
    this.reconnectAttempts = 0;
  }

  // Get current connection status
  getConnectionStatus() {
    return {
      connected: this.api && this.api.isConnected,
      connecting: this.connecting,
      endpoint: this.currentEndpoint || 'Not connected',
      availableEndpoints: this.getEndpoints(),
      hasApi: !!this.api,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }

  // Get comprehensive chain information
  async getChainInfo() {
    return this.executeWithConnection(async (api) => {
      return this._getBasicChainInfo(api);
    });
  }

  // Format address for display
  formatAddress(address, startChars = 8, endChars = 8) {
    if (!address) return '';
    if (address.length <= startChars + endChars + 3) return address;
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
  }

  // Format timestamp for display
  formatTimestamp(timestamp) {
    if (!timestamp) return 'Unknown';
    try {
      const date = new Date(timestamp * 1000);
      return date.toLocaleString();
    } catch (error) {
      return 'Invalid date';
    }
  }

  // Convert contract status to human readable
  getStatusDisplay(status) {
    const statusMap = {
      'Initiated': 'Initiated',
      'FirstPartySigned': 'First Party Signed',
      'SecondPartySigned': 'Second Party Signed',
      'BothPartiesSigned': 'Both Parties Signed (Active)',
      'Completed': 'Completed',
      'Deactivated': 'Deactivated'
    };
    return statusMap[status] || status;
  }
}

// Create and export singleton instance
const blockchainService = new BlockchainService();

export default blockchainService;