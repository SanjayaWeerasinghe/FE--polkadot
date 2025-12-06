// transactionDebugService.js - Updated for Polkadot.js API v16.4.3 with TxExtension support

import { ApiPromise, WsProvider } from '@polkadot/api';

class TransactionDebugService {
  constructor() {
    this.api = null;
  }

  // Connect to blockchain with v16 compatibility
  async connect(endpoint = 'wss://blockchain1.projectfreedom.online:9946') {
    if (this.api && this.api.isConnected) {
      return this.api;
    }

    const provider = new WsProvider(endpoint);
    this.api = await ApiPromise.create({ 
      provider,
      // v16 automatically handles TxExtension format
      noInitWarn: true, // Suppress warnings about unknown extensions
    });
    await this.api.isReady;
    return this.api;
  }

  // Convert string to Vec<u8> format
  _stringToU8Array(str) {
    if (!str) return [];
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    return Array.from(bytes);
  }

  // Create unsigned transaction for analysis
  async createUnsignedTransaction(
    fileHash,
    firstParty,
    secondParty,
    thirdParty,
    contractName,
    metadata
  ) {
    await this.connect();

    const contractNameBytes = this._stringToU8Array(contractName);
    const metadataBytes = this._stringToU8Array(metadata);

    // Create the transaction
    const tx = this.api.tx.digitalNotarizedContract.initiateContract(
      fileHash,
      firstParty,
      secondParty,
      thirdParty,
      contractNameBytes,
      metadataBytes
    );

    return {
      transaction: tx,
      callData: tx.method.toHex(),
      callDataLength: tx.method.toHex().length,
      parameters: {
        fileHash,
        firstParty,
        secondParty,
        thirdParty,
        contractName,
        contractNameLength: contractNameBytes.length,
        metadata,
        metadataLength: metadataBytes.length
      }
    };
  }

  // Create signed transaction using v16 signAsync (RECOMMENDED)
  async createSignedTransactionV2(
    accountAddress,
    injector,
    fileHash,
    firstParty,
    secondParty,
    thirdParty,
    contractName,
    metadata,
    options = {}
  ) {
    await this.connect();

    try {
      console.log('🔍 Creating signed transaction using v16 signAsync...');

      const contractNameBytes = this._stringToU8Array(contractName);
      const metadataBytes = this._stringToU8Array(metadata);

      // Create the transaction
      const tx = this.api.tx.digitalNotarizedContract.initiateContract(
        fileHash,
        firstParty,
        secondParty,
        thirdParty,
        contractNameBytes,
        metadataBytes
      );

      // Get blockchain context
      const [currentNonce, currentBlock, runtimeVersion] = await Promise.all([
        this.api.rpc.system.accountNextIndex(accountAddress),
        this.api.rpc.chain.getHeader(),
        this.api.rpc.state.getRuntimeVersion()
      ]);

      console.log('📊 Transaction context:', {
        nonce: currentNonce.toString(),
        blockNumber: currentBlock.number.toString(),
        blockHash: currentBlock.hash.toHex(),
        specVersion: runtimeVersion.specVersion.toString(),
        transactionVersion: runtimeVersion.transactionVersion.toString()
      });

      // V16: signAsync automatically handles all TxExtension parameters
      const signedTx = await tx.signAsync(accountAddress, { 
        signer: injector.signer,
        // V16 automatically includes all required TxExtension parameters:
        // CheckNonZeroSender, CheckSpecVersion, CheckTxVersion, CheckGenesis,
        // CheckEra, CheckNonce, CheckWeight, ChargeTransactionPayment,
        // CheckMetadataHash, WeightReclaim
        nonce: options.nonce || currentNonce,
        blockHash: options.blockHash || currentBlock.hash,
        era: options.era || this.api.createType('ExtrinsicEra', { 
          current: currentBlock.number, 
          period: 64 
        })
      });

      const signedHex = signedTx.toHex();
      
      console.log('✅ V16 signed transaction created successfully:', signedHex.slice(0, 50) + '...');

      // Analyze the signed transaction
      const analysis = this._analyzeSignedTransaction(signedHex, null, tx.method.toHex());

      return {
        success: true,
        signedTransaction: signedHex,
        unsignedCallData: tx.method.toHex(),
        signature: signedTx.signature.toHex(),
        signingOptions: {
          nonce: currentNonce.toString(),
          blockHash: currentBlock.hash.toHex(),
          era: options.era ? 'custom' : 'mortal(64)'
        },
        analysis,
        context: {
          nonce: currentNonce.toString(),
          blockNumber: currentBlock.number.toString(),
          blockHash: currentBlock.hash.toHex(),
          accountAddress,
          specVersion: runtimeVersion.specVersion.toString(),
          transactionVersion: runtimeVersion.transactionVersion.toString()
        }
      };

    } catch (error) {
      console.error('❌ V16 signAsync failed:', error);
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }

  // Direct sign and send transaction with v16 compatibility
  async directSignAndSend(
    accountAddress,
    injector,
    fileHash,
    firstParty,
    secondParty,
    thirdParty,
    contractName,
    metadata,
    options = {}
  ) {
    await this.connect();

    try {
      console.log('🚀 Creating and sending transaction directly using v16...');

      const contractNameBytes = this._stringToU8Array(contractName);
      const metadataBytes = this._stringToU8Array(metadata);

      // Create the transaction
      const tx = this.api.tx.digitalNotarizedContract.initiateContract(
        fileHash,
        firstParty,
        secondParty,
        thirdParty,
        contractNameBytes,
        metadataBytes
      );

      // Get payment info before sending
      let paymentInfo = null;
      try {
        paymentInfo = await tx.paymentInfo(accountAddress);
        console.log('💰 Transaction fee:', paymentInfo.partialFee.toHuman());
      } catch (feeError) {
        console.warn('⚠️ Could not get fee estimate:', feeError.message);
      }

      // V16: Direct sign and send with automatic TxExtension handling
      return new Promise((resolve, reject) => {
        let unsubscribe = null;
        
        const timeout = setTimeout(() => {
          if (unsubscribe) unsubscribe();
          reject(new Error('Transaction timeout after 3 minutes'));
        }, 180000);

        tx.signAndSend(
          accountAddress,
          { 
            signer: injector.signer,
            // V16 automatically handles all TxExtension parameters
            nonce: options.nonce,
            era: options.era,
            tip: options.tip || 0
          },
          (result) => {
            console.log(`📊 Transaction status: ${result.status.type}`);

            if (result.txHash) {
              console.log('📋 Transaction hash:', result.txHash.toHex());
            }

            if (result.status.isReady) {
              console.log('📋 Transaction ready and submitted to network');
            }

            if (result.status.isBroadcast) {
              console.log('📡 Transaction broadcast to network peers');
            }

            if (result.status.isInBlock) {
              console.log('📦 Transaction included in block:', result.status.asInBlock.toHex());
              
              if (result.events && result.events.length > 0) {
                console.log('📋 Block events:');
                result.events.forEach(({ event, phase }) => {
                  console.log(`  ${event.section}.${event.method}:`, event.data.toHuman());
                });
              }
            }

            // Handle finalization
            if (result.status.isFinalized) {
              clearTimeout(timeout);
              if (unsubscribe) unsubscribe();
              
              console.log('🎉 Transaction finalized in block:', result.status.asFinalized.toHex());

              if (result.dispatchError) {
                console.error('💥 Transaction failed with dispatch error');
                const error = this._parseDispatchError(result.dispatchError, this.api);
                reject(error);
                return;
              }

              // Extract contract creation events
              const contractEvents = result.events.filter(({ event }) =>
                event.section === 'digitalNotarizedContract' && 
                event.method === 'ContractInitiated'
              );

              let contractId = null;
              let eventData = null;
              if (contractEvents.length > 0) {
                eventData = contractEvents[0].event.data.toHuman();
                contractId = eventData.contract_id || eventData.contractId || eventData[0];
                console.log('📋 Contract successfully created with ID:', contractId);
                console.log('📋 Contract event data:', eventData);
              } else {
                console.warn('⚠️ No ContractInitiated event found, but transaction succeeded');
              }

              resolve({
                success: true,
                blockHash: result.status.asFinalized.toHex(),
                txHash: result.txHash.toHex(),
                contractId,
                eventData,
                paymentInfo: paymentInfo ? {
                  partialFee: paymentInfo.partialFee.toString(),
                  weight: paymentInfo.weight.toString()
                } : null,
                allEvents: result.events.map(({ event, phase }) => ({
                  phase: phase.toString(),
                  section: event.section,
                  method: event.method,
                  data: event.data.toHuman()
                }))
              });
            }

            // Handle errors during processing
            if (result.dispatchError) {
              clearTimeout(timeout);
              if (unsubscribe) unsubscribe();
              
              console.error('💥 Transaction dispatch error');
              const error = this._parseDispatchError(result.dispatchError, this.api);
              reject(error);
            }
          }
        )
        .then(unsub => {
          unsubscribe = unsub;
          console.log('📡 V16 transaction submitted successfully, waiting for confirmation...');
        })
        .catch(error => {
          clearTimeout(timeout);
          console.error('💥 V16 transaction submission failed:', error);
          
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
      console.error('💥 V16 direct sign and send failed:', error);
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }

  // Send pre-signed transaction manually with v16 compatibility
  async sendManualTransaction(signedTransactionHex) {
    await this.connect();
    
    try {
      console.log('📤 Sending pre-signed transaction manually using v16...');
      console.log('📋 Transaction hex:', signedTransactionHex);
      
      // Validate hex format
      if (!signedTransactionHex.startsWith('0x')) {
        throw new Error('Transaction hex must start with 0x');
      }
      
      if (signedTransactionHex.length < 100) {
        throw new Error('Transaction hex seems too short to be valid');
      }
      
      // Create extrinsic from hex
      const extrinsic = this.api.createType('Extrinsic', signedTransactionHex);
      
      console.log('✅ V16 extrinsic created from hex successfully');
      console.log('📊 Extrinsic info:', {
        length: signedTransactionHex.length,
        method: extrinsic.method.section + '.' + extrinsic.method.method,
        isSigned: extrinsic.isSigned,
        version: extrinsic.version
      });
      
      // Submit the signed transaction with full monitoring
      return new Promise((resolve, reject) => {
        let unsubscribe = null;
        
        const timeout = setTimeout(() => {
          if (unsubscribe) unsubscribe();
          reject(new Error('Manual transaction timeout after 3 minutes'));
        }, 180000);

        this.api.rpc.author.submitAndWatchExtrinsic(extrinsic, (result) => {
          console.log(`📊 Manual transaction status: ${result.status.type}`);

          if (result.txHash) {
            console.log('📋 Manual transaction hash:', result.txHash.toHex());
          }

          if (result.status.isReady) {
            console.log('📋 Manual transaction ready and submitted to network');
          }

          if (result.status.isBroadcast) {
            console.log('📡 Manual transaction broadcast to network peers');
          }

          if (result.status.isInBlock) {
            console.log('📦 Manual transaction included in block:', result.status.asInBlock.toHex());
            
            if (result.events && result.events.length > 0) {
              console.log('📋 Manual transaction block events:');
              result.events.forEach(({ event, phase }) => {
                console.log(`  ${event.section}.${event.method}:`, event.data.toHuman());
              });
            }
          }

          // Handle finalization
          if (result.status.isFinalized) {
            clearTimeout(timeout);
            if (unsubscribe) unsubscribe();
            
            console.log('🎉 Manual transaction finalized in block:', result.status.asFinalized.toHex());

            if (result.dispatchError) {
              console.error('💥 Manual transaction failed with dispatch error');
              const error = this._parseDispatchError(result.dispatchError, this.api);
              reject(error);
              return;
            }

            // Extract contract creation events
            const contractEvents = result.events.filter(({ event }) =>
              event.section === 'digitalNotarizedContract' && 
              event.method === 'ContractInitiated'
            );

            let contractId = null;
            let eventData = null;
            if (contractEvents.length > 0) {
              eventData = contractEvents[0].event.data.toHuman();
              contractId = eventData.contract_id || eventData.contractId || eventData[0];
              console.log('📋 Manual transaction: Contract successfully created with ID:', contractId);
              console.log('📋 Manual transaction: Contract event data:', eventData);
            } else {
              console.warn('⚠️ Manual transaction: No ContractInitiated event found, but transaction succeeded');
            }

            resolve({
              success: true,
              blockHash: result.status.asFinalized.toHex(),
              txHash: result.txHash.toHex(),
              contractId,
              eventData,
              originalHex: signedTransactionHex,
              allEvents: result.events.map(({ event, phase }) => ({
                phase: phase.toString(),
                section: event.section,
                method: event.method,
                data: event.data.toHuman()
              }))
            });
          }

          // Handle errors during processing
          if (result.dispatchError) {
            clearTimeout(timeout);
            if (unsubscribe) unsubscribe();
            
            console.error('💥 Manual transaction dispatch error');
            const error = this._parseDispatchError(result.dispatchError, this.api);
            reject(error);
          }
        })
        .then(unsub => {
          unsubscribe = unsub;
          console.log('📡 V16 manual transaction submitted successfully, waiting for confirmation...');
        })
        .catch(error => {
          clearTimeout(timeout);
          console.error('💥 V16 manual transaction submission failed:', error);
          
          if (error.message.includes('1002') && error.message.includes('WASM')) {
            reject(new Error('WASM execution failed - likely transaction format incompatibility'));
          } else if (error.message.includes('1010')) {
            reject(new Error('Invalid transaction - check transaction encoding'));
          } else if (error.message.includes('1014')) {
            reject(new Error('Transaction priority too low - network may be congested'));
          } else {
            reject(new Error(`Manual transaction submission failed: ${error.message}`));
          }
        });
      });
      
    } catch (error) {
      console.error('💥 V16 manual transaction send failed:', error);
      return {
        success: false,
        error: error.message,
        originalHex: signedTransactionHex
      };
    }
  }

  // Test with exact parameters using v16 signAsync method
  async testWithWorkingParameters(accountAddress, injector) {
    console.log('🧪 Testing with exact working parameters using v16 signAsync...');
    
    const workingParams = {
      fileHash: '0x075ad2e301245c13c580ed83c9c6b6b07b25c8bd33895d2f43b275c48fa2f4e1',
      firstParty: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      secondParty: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
      thirdParty: '5HpG9w8EBLe5XCrbczpwq5TSXvedjrBGCwqxK1iQ7qUsSWFc',
      contractName: 'Sanjaya',
      metadata: 'Sanjaya'
    };

    // Create unsigned transaction first
    const unsignedResult = await this.createUnsignedTransaction(
      workingParams.fileHash,
      workingParams.firstParty,
      workingParams.secondParty,
      workingParams.thirdParty,
      workingParams.contractName,
      workingParams.metadata
    );

    console.log('📝 V16 unsigned transaction created:', unsignedResult.callData);

    // Create signed transaction using v16 signAsync method
    const signedResult = await this.createSignedTransactionV2(
      accountAddress,
      injector,
      workingParams.fileHash,
      workingParams.firstParty,
      workingParams.secondParty,
      workingParams.thirdParty,
      workingParams.contractName,
      workingParams.metadata
    );

    // Compare with your working call data from Polkadot Apps
    const workingCallData = '0x070065f61c36aa4608d0d7c4b46afcf8c57edc92210dddd533a7e42a6788cd06edead43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a4890b5ab205c6974c9ea841be688864633dc9ca8a357843eeacf2314649965fe221c53616e6a6179611c53616e6a617961';

    const callDataComparison = {
      match: unsignedResult.callData === workingCallData,
      ourCallData: unsignedResult.callData,
      workingCallData: workingCallData,
      lengthMatch: unsignedResult.callData.length === workingCallData.length
    };

    return {
      unsignedResult,
      signedResult,
      callDataComparison,
      workingParams,
      summary: {
        callDataMatches: callDataComparison.match,
        signedTransactionCreated: signedResult.success,
        readyForTesting: callDataComparison.match && signedResult.success
      }
    };
  }

  // Get payment info for transaction
  async getPaymentInfo(accountAddress, fileHash, firstParty, secondParty, thirdParty, contractName, metadata) {
    await this.connect();

    const contractNameBytes = this._stringToU8Array(contractName);
    const metadataBytes = this._stringToU8Array(metadata);

    const tx = this.api.tx.digitalNotarizedContract.initiateContract(
      fileHash,
      firstParty,
      secondParty,
      thirdParty,
      contractNameBytes,
      metadataBytes
    );

    try {
      const paymentInfo = await tx.paymentInfo(accountAddress);
      
      return {
        success: true,
        partialFee: paymentInfo.partialFee.toString(),
        weight: paymentInfo.weight.toString(),
        lengthFee: paymentInfo.lengthFee?.toString() || '0',
        adjustedWeightFee: paymentInfo.adjustedWeightFee?.toString() || '0'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Analyze signed transaction structure
  _analyzeSignedTransaction(signedHex, payloadHex, callDataHex) {
    console.log('🔍 Analyzing v16 transaction structure...');
    
    const analysis = {
      signedTransactionLength: signedHex.length,
      payloadLength: payloadHex ? payloadHex.length : 'N/A',
      callDataLength: callDataHex.length,
      structure: {},
      comparison: {}
    };

    // Check if call data is contained in signed transaction
    analysis.comparison.callDataInSigned = signedHex.includes(callDataHex.slice(2)); // Remove 0x
    if (payloadHex) {
      analysis.comparison.payloadInSigned = signedHex.includes(payloadHex.slice(2));
    }

    // Analyze structure
    if (signedHex.startsWith('0x')) {
      const hex = signedHex.slice(2);
      
      // First bytes are transaction format and version
      analysis.structure.version = '0x' + hex.slice(0, 8);
      
      // Check if this is the new TxExtension format
      const versionByte = hex.slice(2, 4);
      analysis.structure.isTxExtensionFormat = versionByte === 'e9' || versionByte === 'e5';
      analysis.structure.formatType = versionByte === 'e9' ? 'TxExtension (0xe9)' : 
                                     versionByte === 'e5' ? 'Legacy (0xe5)' : 'Unknown';
      
      analysis.structure.hasSignatureWrapper = hex.length > callDataHex.slice(2).length;
      analysis.structure.signatureOverhead = hex.length - callDataHex.slice(2).length;
    }

    console.log('📊 V16 transaction analysis:', analysis);
    return analysis;
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

  // Disconnect
  async disconnect() {
    if (this.api) {
      await this.api.disconnect();
      this.api = null;
    }
  }
}

const transactionDebugService = new TransactionDebugService();
export default transactionDebugService;