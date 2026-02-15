/**
 * CampusTrust AI - Gasless Transaction Service
 * ==============================================
 * Wraps Algorand operations with automated fee sponsorship
 * All transactions are free for users - backend sponsors the fees
 */

import algosdk from 'algosdk';
import * as algorandService from './algorandService.js';

const BACKEND_URL = import.meta.env?.VITE_BACKEND_URL || 'http://localhost:5001';

/**
 * Check if gasless transactions are enabled
 */
export async function isGaslessEnabled() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/ai/health`);
    const data = await response.json();
    return data.gaslessEnabled === true;
  } catch {
    return false;
  }
}

/**
 * Get sponsor account info
 */
export async function getSponsorInfo() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/sponsor/info`);
    return await response.json();
  } catch (error) {
    console.error('Failed to get sponsor info:', error);
    return { configured: false };
  }
}

/**
 * Gasless Payment Transaction
 * User sends payment without paying any fees
 */
export async function sendGaslessPayment(senderAddress, receiverAddress, amountAlgo, note, signCallback) {
  const gaslessEnabled = await isGaslessEnabled();
  
  if (!gaslessEnabled) {
    // Fallback to regular payment
    return await algorandService.sendPayment(senderAddress, receiverAddress, amountAlgo, note, signCallback);
  }

  try {
    // Create transaction with zero fee
    const algodClient = new algosdk.Algodv2('', 'https://testnet-api.4160.nodely.dev', '');
    const params = await algodClient.getTransactionParams().do();
    params.fee = 0; // User pays NO fees
    params.flatFee = true;

    const amountMicroAlgos = Math.floor(amountAlgo * 1_000_000);
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: senderAddress,
      receiver: receiverAddress,
      amount: amountMicroAlgos,
      suggestedParams: params,
      note: note ? new TextEncoder().encode(note) : undefined,
    });

    // User signs transaction
    const signedTxn = await signCallback(txn);
    
    // Send to backend for sponsorship
    const response = await fetch(`${BACKEND_URL}/api/gasless/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userSignedTxn: Buffer.from(signedTxn).toString('base64'),
        transactionType: 'payment'
      })
    });

    if (!response.ok) {
      throw new Error('Gasless transaction failed');
    }

    const result = await response.json();
    return {
      txId: result.txId,
      confirmedRound: result.confirmedRound,
      explorerUrl: `https://testnet.explorer.perawallet.app/tx/${result.txId}`,
      gasless: true
    };
  } catch (error) {
    console.error('Gasless payment failed, falling back:', error);
    // Fallback to regular transaction
    return await algorandService.sendPayment(senderAddress, receiverAddress, amountAlgo, note, signCallback);
  }
}

/**
 * Gasless ASA Creation (Skill Badges, Credentials, etc.)
 * User creates assets without paying fees
 */
export async function createGaslessASA(senderAddress, assetParams, signCallback) {
  const gaslessEnabled = await isGaslessEnabled();
  
  if (!gaslessEnabled) {
    return await algorandService.createASA(senderAddress, assetParams, signCallback);
  }

  try {
    const algodClient = new algosdk.Algodv2('', 'https://testnet-api.4160.nodely.dev', '');
    const params = await algodClient.getTransactionParams().do();
    params.fee = 0;
    params.flatFee = true;

    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      sender: senderAddress,
      suggestedParams: params,
      total: assetParams.total || 1,
      decimals: assetParams.decimals || 0,
      defaultFrozen: false,
      unitName: assetParams.unitName || 'CERT',
      assetName: assetParams.assetName || 'CampusTrust Certificate',
      assetURL: assetParams.url || '',
      assetMetadataHash: assetParams.metadataHash || undefined,
      manager: senderAddress,
      reserve: senderAddress,
      freeze: senderAddress,
      clawback: senderAddress,
    });

    const signedTxn = await signCallback(txn);
    
    const response = await fetch(`${BACKEND_URL}/api/gasless/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userSignedTxn: Buffer.from(signedTxn).toString('base64'),
        transactionType: 'asset_create'
      })
    });

    if (!response.ok) {
      throw new Error('Gasless ASA creation failed');
    }

    const result = await response.json();
    return {
      txId: result.txId,
      assetId: result.assetId,
      confirmedRound: result.confirmedRound,
      explorerUrl: `https://testnet.explorer.perawallet.app/tx/${result.txId}`,
      gasless: true
    };
  } catch (error) {
    console.error('Gasless ASA creation failed, falling back:', error);
    return await algorandService.createASA(senderAddress, assetParams, signCallback);
  }
}

/**
 * Gasless Application Call
 * User interacts with smart contracts without paying fees
 */
export async function callGaslessApp(senderAddress, appId, appArgs, accounts, signCallback) {
  const gaslessEnabled = await isGaslessEnabled();
  
  if (!gaslessEnabled) {
    return await algorandService.callApp(senderAddress, appId, appArgs, accounts, signCallback);
  }

  try {
    const algodClient = new algosdk.Algodv2('', 'https://testnet-api.4160.nodely.dev', '');
    const params = await algodClient.getTransactionParams().do();
    params.fee = 0;
    params.flatFee = true;

    const txn = algosdk.makeApplicationNoOpTxnFromObject({
      sender: senderAddress,
      suggestedParams: params,
      appIndex: appId,
      appArgs: appArgs.map(arg => {
        if (typeof arg === 'string') return new TextEncoder().encode(arg);
        if (typeof arg === 'number') return algosdk.encodeUint64(arg);
        return arg;
      }),
      accounts: accounts || [],
    });

    const signedTxn = await signCallback(txn);
    
    const response = await fetch(`${BACKEND_URL}/api/gasless/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userSignedTxn: Buffer.from(signedTxn).toString('base64'),
        transactionType: 'app_call'
      })
    });

    if (!response.ok) {
      throw new Error('Gasless app call failed');
    }

    const result = await response.json();
    return {
      txId: result.txId,
      confirmedRound: result.confirmedRound,
      explorerUrl: `https://testnet.explorer.perawallet.app/tx/${result.txId}`,
      gasless: true
    };
  } catch (error) {
    console.error('Gasless app call failed, falling back:', error);
    return await algorandService.callApp(senderAddress, appId, appArgs, accounts, signCallback);
  }
}

/**
 * Create SHA256 hash for storing data references on-chain
 */
export async function createDataHash(data) {
  return await algorandService.sha256Hash(data);
}

/**
 * Wait for transaction confirmation
 */
export async function waitForConfirmation(txId, timeout = 10) {
  return await algorandService.waitForConfirmation(txId, timeout);
}

// Re-export commonly used algorandService functions
export {
  generateAccount,
  recoverAccount,
  getAccountInfo,
  checkNetwork,
  readGlobalState,
  readLocalState,
  formatAlgo
} from './algorandService.js';
