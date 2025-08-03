// transactionDebugService.js - Create and analyze signed transactions without sending

import { ApiPromise, WsProvider } from '@polkadot/api';

class TransactionDebugService {
  constructor() {
    this.api = null;
  }

  // Connect to blockchain
  async connect(endpoint = 'wss://144.91.67.54:9946') {
    if (this.api && this.api.isConnected) {
      return this.api;
    }

    const provider = new WsProvider(endpoint);
    this.api = await ApiPromise.create({ provider });
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

  // Create signed transaction WITHOUT sending
  async createSignedTransaction(
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
      console.log('🔍 Creating signed transaction for analysis...');

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

      // Get current nonce
      const currentNonce = await this.api.rpc.system.accountNextIndex(accountAddress);
      
      // Get current block info
      const currentBlock = await this.api.rpc.chain.getHeader();
      const blockHash = currentBlock.hash;
      const blockNumber = currentBlock.number;

      // Get runtime version
      const runtimeVersion = await this.api.rpc.state.getRuntimeVersion();

      console.log('📊 Transaction context:', {
        nonce: currentNonce.toString(),
        blockNumber: blockNumber.toString(),
        blockHash: blockHash.toHex(),
        specVersion: runtimeVersion.specVersion.toString(),
        transactionVersion: runtimeVersion.transactionVersion.toString()
      });

      // Create signing options
      const signingOptions = {
        blockHash: blockHash,
        era: this.api.createType('ExtrinsicEra', { current: blockNumber, period: 64 }),
        nonce: currentNonce,
        tip: 0,
        ...options
      };

      console.log('📝 Signing options:', signingOptions);

      // Create the payload to sign
      const payload = this.api.createType('ExtrinsicPayload', {
        method: tx.method,
        era: signingOptions.era,
        nonce: signingOptions.nonce,
        tip: signingOptions.tip,
        specVersion: runtimeVersion.specVersion,
        transactionVersion: runtimeVersion.transactionVersion,
        genesisHash: this.api.genesisHash,
        blockHash: signingOptions.blockHash
      });

      console.log('📋 Payload to sign:', payload.toHex());

      // Sign the payload
      const signatureResult = await injector.signer.signPayload(payload);
      console.log('✍️ Signature result:', signatureResult);

      // Create the signed extrinsic
      const extrinsic = this.api.createType('Extrinsic', {
        method: tx.method,
        era: signingOptions.era,
        nonce: signingOptions.nonce,
        tip: signingOptions.tip,
        signature: signatureResult.signature,
        signer: accountAddress
      });

      const signedHex = extrinsic.toHex();
      
      console.log('🎯 Final signed transaction:', signedHex);

      // Analyze the signed transaction
      const analysis = this._analyzeSignedTransaction(signedHex, payload.toHex(), tx.method.toHex());

      return {
        success: true,
        signedTransaction: signedHex,
        unsignedCallData: tx.method.toHex(),
        payloadHex: payload.toHex(),
        signature: signatureResult.signature,
        signingOptions,
        analysis,
        context: {
          nonce: currentNonce.toString(),
          blockNumber: blockNumber.toString(),
          blockHash: blockHash.toHex(),
          accountAddress
        }
      };

    } catch (error) {
      console.error('❌ Signed transaction creation failed:', error);
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }

  // Analyze signed transaction structure
  _analyzeSignedTransaction(signedHex, payloadHex, callDataHex) {
    console.log('🔍 Analyzing transaction structure...');
    
    const analysis = {
      signedTransactionLength: signedHex.length,
      payloadLength: payloadHex.length,
      callDataLength: callDataHex.length,
      structure: {},
      comparison: {}
    };

    // Check if call data is contained in signed transaction
    analysis.comparison.callDataInSigned = signedHex.includes(callDataHex.slice(2)); // Remove 0x
    analysis.comparison.payloadInSigned = signedHex.includes(payloadHex.slice(2));

    // Analyze structure
    if (signedHex.startsWith('0x')) {
      const hex = signedHex.slice(2);
      
      // First 4 bytes are usually the version and transaction type
      analysis.structure.version = '0x' + hex.slice(0, 8);
      
      // Next part is usually the signature and account info
      analysis.structure.hasSignatureWrapper = hex.length > callDataHex.slice(2).length;
      
      // Calculate overhead (signature wrapper size)
      analysis.structure.signatureOverhead = hex.length - callDataHex.slice(2).length;
    }

    console.log('📊 Transaction analysis:', analysis);
    return analysis;
  }

  // Compare with known working transaction from Polkadot Apps
  compareWithWorkingTransaction(ourSignedHex, workingSignedHex) {
    console.log('🔄 Comparing transactions...');
    
    const comparison = {
      lengthMatch: ourSignedHex.length === workingSignedHex.length,
      exactMatch: ourSignedHex === workingSignedHex,
      ourLength: ourSignedHex.length,
      workingLength: workingSignedHex.length,
      differences: []
    };

    if (!comparison.exactMatch) {
      // Find where they differ
      const ourHex = ourSignedHex.slice(2);
      const workingHex = workingSignedHex.slice(2);
      
      const minLength = Math.min(ourHex.length, workingHex.length);
      
      for (let i = 0; i < minLength; i += 2) {
        const ourByte = ourHex.slice(i, i + 2);
        const workingByte = workingHex.slice(i, i + 2);
        
        if (ourByte !== workingByte) {
          comparison.differences.push({
            position: i,
            ours: ourByte,
            working: workingByte,
            description: this._describeBytePosition(i)
          });
          
          // Only show first 10 differences to avoid spam
          if (comparison.differences.length >= 10) {
            comparison.differences.push({ description: '... and more differences' });
            break;
          }
        }
      }
    }

    console.log('📋 Comparison result:', comparison);
    return comparison;
  }

  // Helper to describe what different byte positions might represent
  _describeBytePosition(position) {
    if (position < 8) return 'Transaction version/type';
    if (position < 40) return 'Account address';
    if (position < 104) return 'Signature data';
    if (position < 120) return 'Transaction metadata';
    return 'Call data';
  }

  // Test with exact parameters from your working Polkadot Apps transaction
  async testWithWorkingParameters(accountAddress, injector) {
    console.log('🧪 Testing with exact working parameters...');
    
    const workingParams = {
      fileHash: '0x65f61c36aa4608d0d7c4b46afcf8c57edc92210dddd533a7e42a6788cd06edea',
      firstParty: 'd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d',
      secondParty: '8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48',
      thirdParty: '90b5ab205c6974c9ea841be688864633dc9ca8a357843eeacf2314649965fe22',
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

    console.log('📝 Unsigned transaction created:', unsignedResult.callData);

    // Now create signed transaction
    const signedResult = await this.createSignedTransaction(
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