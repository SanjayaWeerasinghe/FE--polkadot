// src/components/QuickInitiate.js - Final version with debugging and fixed transaction encoding

import React, { useEffect, useState } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Enable, web3Accounts, web3FromAddress } from '@polkadot/extension-dapp';
import blockchainService from '../services/blockchainService';

export default function QuickInitiate() {
  const [status, setStatus] = useState('Ready to start...');
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  // Convert string to Vec<u8> format expected by pallet
  const stringToU8Array = (str) => {
    if (!str) return [];
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    return Array.from(bytes);
  };

  // Test transaction creation first (debugging)
  const testTransactionFormat = async () => {
    try {
      setStatus('🧪 Testing transaction format...');
      
      const testParams = {
        fileHash: '0x5abd5406a9918c6f86d351005421a12a0b5928266da739089fa9a4404fbdc081',
        firstParty: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        secondParty: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
        thirdParty: '5HpG9w8EBLe5XCrbczpwq5TSXvedjrBGCwqxK1iQ7qUsSWFc',
        contractName: 'Sanjaya',
        metadata: 'Sanjaya'
      };

      const debugResult = await blockchainService.testTransactionCreation(
        testParams.fileHash,
        testParams.firstParty,
        testParams.secondParty,
        testParams.thirdParty,
        testParams.contractName,
        testParams.metadata
      );

      setDebugInfo(debugResult);
      
      if (debugResult.success && debugResult.perfectMatch) {
        setStatus('✅ Transaction format matches Polkadot Apps perfectly!');
      } else if (debugResult.success && debugResult.isCorrectFormat) {
        setStatus('✅ Transaction format is correct, but differs slightly from test case');
      } else {
        setStatus('⚠️ Transaction format needs adjustment');
      }

      console.log('🔍 Debug result:', debugResult);
      
    } catch (error) {
      setStatus(`❌ Debug test failed: ${error.message}`);
      console.error('Debug test error:', error);
    }
  };

  // Main contract initiation using service
  const initiateContractWithService = async () => {
    try {
      setStatus('🔌 Connecting to blockchain via service...');
      
      // Enable extension
      const extensions = await web3Enable('Digital Notarized Contracts');
      if (extensions.length === 0) {
        throw new Error('No extension found');
      }

      setStatus('👛 Getting accounts...');
      const allAccounts = await web3Accounts();
      if (allAccounts.length === 0) {
        throw new Error('No accounts in extension');
      }
      const account = allAccounts[0];

      setStatus('🖋 Getting injector...');
      const injector = await web3FromAddress(account.address);

      // Contract parameters
      const contractParams = {
        fileHash: '0x5abd5406a9918c6f86d351005421a12a0b5928266da739089fa9a4404fbdc081',
        firstParty: account.address,
        secondParty: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
        thirdParty: '5HpG9w8EBLe5XCrbczpwq5TSXvedjrBGCwqxK1iQ7qUsSWFc',
        contractName: 'Sanjaya Test Contract',
        metadata: 'This is a test contract created using the fixed blockchain service with proper transaction encoding.'
      };

      setStatus('📝 Creating contract via service...');
      console.log('📝 Using blockchain service with parameters:', contractParams);

      // Use the blockchain service
      const result = await blockchainService.initiateContract(
        injector,
        account.address,
        contractParams.fileHash,
        contractParams.firstParty,
        contractParams.secondParty,
        contractParams.thirdParty,
        contractParams.contractName,
        contractParams.metadata
      );

      if (result.success) {
        setStatus(`🎉 Contract "${contractParams.contractName}" created successfully! ID: ${result.contractId}`);
        console.log('✅ Service result:', result);
      } else {
        setStatus('❌ Contract creation failed via service');
      }

    } catch (error) {
      console.error('Service initiation error:', error);
      setStatus(`❌ Service error: ${error.message}`);
    }
  };

  // Direct API approach (for comparison)
  const initiateContractDirect = async () => {
    try {
      setStatus('🔌 Connecting directly to node...');
      const ws = new WsProvider('wss://144.91.67.54:9946');
      const api = await ApiPromise.create({ provider: ws });
      await api.isReady;

      setStatus('🔑 Enabling extension...');
      const extensions = await web3Enable('My DApp');
      if (extensions.length === 0) {
        throw new Error('No extension found');
      }

      setStatus('👛 Fetching accounts...');
      const allAccounts = await web3Accounts();
      if (allAccounts.length === 0) {
        throw new Error('No accounts in extension');
      }
      const account = allAccounts[0];

      setStatus(`🖋 Getting injector for ${account.address.slice(0,8)}...`);
      const injector = await web3FromAddress(account.address);

      // Contract parameters - matching working format exactly
      const fileHash = '0x5abd5406a9918c6f86d351005421a12a0b5928266da739089fa9a4404fbdc081';
      const firstParty = account.address;
      const secondParty = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty';
      const thirdParty = '5HpG9w8EBLe5XCrbczpwq5TSXvedjrBGCwqxK1iQ7qUsSWFc';
      const contractName = 'Sanjaya Direct';
      const metadata = 'Direct API test';
      
      // Convert strings to Vec<u8> format
      const contractNameBytes = stringToU8Array(contractName);
      const metadataBytes = stringToU8Array(metadata);

      setStatus('✏️ Creating transaction directly...');
      console.log('📝 Direct API parameters:', {
        fileHash,
        firstParty,
        secondParty,
        thirdParty,
        contractName,
        contractNameLength: contractNameBytes.length,
        metadata,
        metadataLength: metadataBytes.length
      });

      const tx = api.tx.digitalNotarizedContract.initiateContract(
        fileHash,
        firstParty,
        secondParty,
        thirdParty,
        contractNameBytes,
        metadataBytes
      );

      console.log('🔧 Direct transaction call hex:', tx.method.toHex());
      console.log('🔧 Direct transaction full hex:', tx.toHex());

      setStatus('📤 Signing & sending directly...');
      const unsub = await tx.signAndSend(
        account.address,
        { signer: injector.signer },
        ({ status, dispatchError, events }) => {
          setStatus(`⏳ Direct Status: ${status.type}`);

          if (dispatchError) {
            if (dispatchError.isModule) {
              const decoded = api.registry.findMetaError(dispatchError.asModule);
              setStatus(`❌ Direct Module error: ${decoded.section}.${decoded.name}: ${decoded.docs.join(' ')}`);
            } else {
              setStatus(`❌ Direct Dispatch error: ${dispatchError.toString()}`);
            }
            unsub();
            return;
          }

          if (events) {
            events.forEach(({ event }) => {
              if (event.section === 'digitalNotarizedContract' && event.method === 'ContractInitiated') {
                const eventData = event.data.toHuman();
                console.log('🎉 Direct contract created!', eventData);
                setStatus(`🎉 Direct: Contract "${contractName}" created! ID: ${eventData.contract_id}`);
              }
            });
          }

          if (status.isFinalized) {
            setStatus(`🎉 Direct: Finalized in block ${status.asFinalized.toHex()}`);
            unsub();
          }
        }
      );
    } catch (err) {
      console.error('Direct API error:', err);
      setStatus(`❗️ Direct error: ${err.message}`);
    }
  };

  return (
    <div style={{ 
      padding: 20, 
      fontFamily: 'sans-serif', 
      border: '2px solid #059669', 
      borderRadius: 12, 
      margin: '20px 0', 
      backgroundColor: '#f0fdf4' 
    }}>
      <h2 style={{ color: '#059669', marginBottom: 15 }}>
        🚀 QuickInitiate - Fixed Transaction Encoding
      </h2>
      
      <div style={{ marginBottom: 20 }}>
        <p style={{ 
          fontSize: '16px', 
          marginBottom: 10, 
          color: status.includes('❌') ? '#dc2626' : status.includes('🎉') ? '#059669' : '#4b5563',
          fontWeight: 'bold'
        }}>
          <strong>Status:</strong> {status}
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: 10, 
        marginBottom: 20, 
        flexWrap: 'wrap' 
      }}>
        <button
          onClick={testTransactionFormat}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🧪 Test Transaction Format
        </button>
        
        <button
          onClick={initiateContractWithService}
          style={{
            padding: '10px 20px',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🛠️ Initiate via Service
        </button>
        
        <button
          onClick={initiateContractDirect}
          style={{
            padding: '10px 20px',
            backgroundColor: '#7c3aed',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🔧 Initiate Direct API
        </button>

        <button
          onClick={() => setShowDebug(!showDebug)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {showDebug ? '🙈 Hide' : '👁️ Show'} Debug Info
        </button>
      </div>

      {/* Debug Information */}
      {showDebug && debugInfo && (
        <div style={{ 
          backgroundColor: '#fff', 
          padding: 15, 
          borderRadius: 8, 
          border: '1px solid #e5e7eb',
          marginBottom: 20
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#374151' }}>
            🔍 Transaction Debug Information
          </h3>
          
          <div style={{ fontSize: '14px', color: '#4b5563' }}>
            <div style={{ marginBottom: 10 }}>
              <strong>Perfect Match:</strong> {debugInfo.perfectMatch ? '✅ YES' : '❌ NO'}
            </div>
            <div style={{ marginBottom: 10 }}>
              <strong>Correct Format:</strong> {debugInfo.isCorrectFormat ? '✅ YES' : '❌ NO'}
            </div>
            <div style={{ marginBottom: 10 }}>
              <strong>Pallet Index:</strong> {debugInfo.palletIndex} | <strong>Call Index:</strong> {debugInfo.callIndex}
            </div>
            
            {debugInfo.comparison && (
              <div style={{ marginBottom: 15 }}>
                <strong>Comparison:</strong>
                <ul style={{ margin: '5px 0', paddingLeft: 20 }}>
                  <li>Length Match: {debugInfo.comparison.lengthMatch ? '✅' : '❌'}</li>
                  <li>Format Match: {debugInfo.comparison.formatMatch ? '✅' : '❌'}</li>
                  <li>Exact Match: {debugInfo.comparison.exactMatch ? '✅' : '❌'}</li>
                  <li>Status: {debugInfo.comparison.differences}</li>
                </ul>
              </div>
            )}

            <div style={{ marginBottom: 15 }}>
              <strong>Our Transaction Call:</strong>
              <code style={{ 
                display: 'block', 
                backgroundColor: '#f3f4f6', 
                padding: 8, 
                borderRadius: 4, 
                fontSize: '11px', 
                wordBreak: 'break-all',
                marginTop: 5
              }}>
                {debugInfo.callHex}
              </code>
            </div>

            <div style={{ marginBottom: 15 }}>
              <strong>Expected Working Call:</strong>
              <code style={{ 
                display: 'block', 
                backgroundColor: '#f3f4f6', 
                padding: 8, 
                borderRadius: 4, 
                fontSize: '11px', 
                wordBreak: 'break-all',
                marginTop: 5
              }}>
                {debugInfo.workingCallHex}
              </code>
            </div>

            {debugInfo.parameterAnalysis && (
              <div>
                <strong>Parameter Analysis:</strong>
                <ul style={{ margin: '5px 0', paddingLeft: 20 }}>
                  <li>File Hash Included: {debugInfo.parameterAnalysis.fileHashIncluded ? '✅' : '❌'}</li>
                  <li>Contract Name Included: {debugInfo.parameterAnalysis.contractNameInCall ? '✅' : '❌'}</li>
                  <li>Metadata Included: {debugInfo.parameterAnalysis.metadataInCall ? '✅' : '❌'}</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Information Panel */}
      <div style={{ 
        backgroundColor: '#eff6ff', 
        padding: 15, 
        borderRadius: 8, 
        border: '1px solid #dbeafe',
        fontSize: '0.9em', 
        color: '#1e40af' 
      }}>
        <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>
          🎯 What this component tests:
        </p>
        <ul style={{ paddingLeft: 20, margin: '5px 0', lineHeight: '1.6' }}>
          <li><strong>Transaction Format Testing:</strong> Compare our encoding with working Polkadot Apps format</li>
          <li><strong>Service Integration:</strong> Test the blockchain service with proper error handling</li>
          <li><strong>Direct API:</strong> Bypass service layer to test raw API calls</li>
          <li><strong>Parameter Encoding:</strong> Verify string → Vec&lt;u8&gt; conversion</li>
          <li><strong>Error Debugging:</strong> Detailed logging and comparison tools</li>
        </ul>
        
        <div style={{ 
          marginTop: 15, 
          padding: 10, 
          backgroundColor: '#fef3c7', 
          borderRadius: 6, 
          border: '1px solid #fcd34d',
          color: '#92400e'
        }}>
          <p style={{ margin: 0, fontSize: '0.85em' }}>
            <strong>💡 Debug Strategy:</strong> First run "Test Transaction Format" to ensure our encoding 
            matches the working Polkadot Apps transaction. If it matches, the WASM panic should be resolved. 
            Then test both service and direct API approaches to verify functionality.
          </p>
        </div>
      </div>
    </div>
  );
}