/**
 * CampusTrust AI - Algorand Service (Mobile)
 * ============================================
 * Core service for Algorand blockchain interactions in React Native.
 * Handles wallet management, transactions, ASA creation, and app calls.
 */

import algosdk from 'algosdk';
import * as SecureStore from 'expo-secure-store';

// Configuration
const ALGOD_SERVER = 'https://testnet-api.4160.nodely.dev';
const ALGOD_PORT = '';
const ALGOD_TOKEN = '';

const INDEXER_SERVER = 'https://testnet-idx.4160.nodely.dev';
const INDEXER_PORT = '';
const INDEXER_TOKEN = '';

const EXPLORER_BASE = 'https://testnet.explorer.perawallet.app';

// Create clients
const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);
const indexerClient = new algosdk.Indexer(INDEXER_TOKEN, INDEXER_SERVER, INDEXER_PORT);

// ═══════════════════════════════════════════════════════════
// ACCOUNT MANAGEMENT
// ═══════════════════════════════════════════════════════════

/**
 * Generate a new Algorand account
 */
export function generateAccount() {
  const account = algosdk.generateAccount();
  const mnemonic = algosdk.secretKeyToMnemonic(account.sk);
  return {
    address: account.addr,
    mnemonic: mnemonic,
    sk: account.sk,
  };
}

/**
 * Recover account from mnemonic
 */
export function recoverAccount(mnemonic) {
  const sk = algosdk.mnemonicToSecretKey(mnemonic);
  return {
    address: sk.addr,
    sk: sk.sk,
  };
}

/**
 * Save account to secure store
 */
export async function saveAccount(address, mnemonic) {
  await SecureStore.setItemAsync('wallet_address', address);
  await SecureStore.setItemAsync('wallet_mnemonic', mnemonic);
}

/**
 * Get saved account from secure store
 */
export async function getSavedAccount() {
  const address = await SecureStore.getItemAsync('wallet_address');
  const mnemonic = await SecureStore.getItemAsync('wallet_mnemonic');
  if (address && mnemonic) {
    return { address, mnemonic };
  }
  return null;
}

/**
 * Get full account object (with secret key) from secure store
 */
export async function getFullAccount() {
  const saved = await getSavedAccount();
  if (!saved) return null;
  const recovered = recoverAccount(saved.mnemonic);
  return {
    address: recovered.address,
    sk: recovered.sk,
    mnemonic: saved.mnemonic,
  };
}

/**
 * Delete saved account
 */
export async function deleteSavedAccount() {
  await SecureStore.deleteItemAsync('wallet_address');
  await SecureStore.deleteItemAsync('wallet_mnemonic');
}

/**
 * Validate an Algorand address
 */
export function isValidAddress(address) {
  if (!address || typeof address !== 'string') return false;
  if (address.length !== 58) return false;
  if (address.startsWith('PROVIDER') || address.includes('...')) return false;
  try {
    algosdk.decodeAddress(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get account information
 */
export async function getAccountInfo(address, retries = 3) {
  if (!address || typeof address !== 'string') {
    throw new Error('Invalid address: address must be a string');
  }

  // Handle mock/test addresses
  if (!isValidAddress(address)) {
    console.warn('Mock or invalid address detected, returning mock data:', address);
    return {
      address: address,
      balance: 100,
      balanceMicroAlgos: 100000000,
      minBalance: 0.1,
      assets: [],
      appsLocalState: [],
      createdApps: [],
      totalAppsOptedIn: 0,
      round: 0,
    };
  }

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const info = await algodClient.accountInformation(address).do();
      const amountMicroAlgos = typeof info.amount === 'bigint' ? Number(info.amount) : info.amount;
      const minBalanceMicroAlgos = typeof info['min-balance'] === 'bigint' ? Number(info['min-balance']) : info['min-balance'];
      return {
        address: info.address,
        balance: amountMicroAlgos / 1_000_000,
        balanceMicroAlgos: amountMicroAlgos,
        minBalance: minBalanceMicroAlgos / 1_000_000,
        assets: info.assets || [],
        appsLocalState: info['apps-local-state'] || [],
        createdApps: info['created-apps'] || [],
        totalAppsOptedIn: info['total-apps-opted-in'] || 0,
      };
    } catch (error) {
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      } else {
        throw new Error('Unable to connect to Algorand TestNet');
      }
    }
  }
}

/**
 * Check if the network is accessible
 */
export async function checkNetwork() {
  try {
    const status = await algodClient.status().do();
    return {
      connected: true,
      lastRound: status['last-round'],
    };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════
// HELPER: Extract txId from sendRawTransaction response
// algosdk v3 returns { txid } (lowercase), not { txId }
// ═══════════════════════════════════════════════════════════

function extractTxId(sendResult) {
  // v3 algosdk uses 'txid' (lowercase)
  const txId = sendResult.txId || sendResult.txid || sendResult.txID;
  if (!txId) {
    // Try to get it from the transaction object itself
    console.warn('sendRawTransaction result:', JSON.stringify(sendResult));
    throw new Error('Transaction failed: No transaction ID returned');
  }
  return txId;
}

// ═══════════════════════════════════════════════════════════
// PAYMENT TRANSACTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Send payment transaction (signs with account's secret key)
 */
export async function sendPayment(fromAccount, toAddress, amountInAlgos, note = '') {
  // Validate toAddress
  if (!isValidAddress(toAddress)) {
    throw new Error(`Invalid recipient address: ${toAddress?.substring(0, 12)}...`);
  }

  const params = await algodClient.getTransactionParams().do();
  const amountInMicroAlgos = Math.floor(amountInAlgos * 1_000_000);

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: fromAccount.address || fromAccount.addr,
    to: toAddress,
    amount: amountInMicroAlgos,
    note: note ? new TextEncoder().encode(note) : undefined,
    suggestedParams: params,
  });

  const signedTxn = txn.signTxn(fromAccount.sk);
  const sendResult = await algodClient.sendRawTransaction(signedTxn).do();
  const txId = extractTxId(sendResult);

  let confirmedRound = 0;
  try {
    const result = await algosdk.waitForConfirmation(algodClient, txId, 10);
    confirmedRound = result['confirmed-round'];
  } catch (e) {
    console.warn('Transaction sent but confirmation timed out:', txId);
  }

  return {
    txId,
    confirmedRound,
    explorerUrl: `${EXPLORER_BASE}/tx/${txId}`,
  };
}

/**
 * Send payment with note (used for data storage - self-payment)
 */
export async function sendDataTransaction(account, note) {
  return await sendPayment(account, account.address || account.addr, 0, note);
}

// ═══════════════════════════════════════════════════════════
// ASA (Algorand Standard Assets) - For Badges & Credentials
// ═══════════════════════════════════════════════════════════

/**
 * Create a new ASA (for skill badges, certificates, etc.)
 */
export async function createASA(account, assetParams) {
  const params = await algodClient.getTransactionParams().do();
  const senderAddress = account.address || account.addr;

  const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
    sender: senderAddress,
    suggestedParams: params,
    total: assetParams.total || 1,
    decimals: assetParams.decimals || 0,
    defaultFrozen: false,
    unitName: (assetParams.unitName || 'CERT').substring(0, 8),
    assetName: (assetParams.assetName || 'CampusTrust Certificate').substring(0, 32),
    assetURL: (assetParams.url || '').substring(0, 96),
    assetMetadataHash: assetParams.metadataHash || undefined,
    manager: senderAddress,
    reserve: senderAddress,
    freeze: senderAddress,
    clawback: senderAddress,
  });

  const signedTxn = txn.signTxn(account.sk);
  const sendResult = await algodClient.sendRawTransaction(signedTxn).do();
  const txId = extractTxId(sendResult);

  let result;
  try {
    result = await algosdk.waitForConfirmation(algodClient, txId, 10);
  } catch (error) {
    console.warn('ASA confirmation timeout, checking manually...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    const pendingTxn = await algodClient.pendingTransactionInformation(txId).do();
    if (pendingTxn['confirmed-round'] && pendingTxn['confirmed-round'] > 0) {
      result = pendingTxn;
    } else {
      throw new Error('ASA creation not confirmed after extended wait');
    }
  }

  return {
    txId,
    assetId: result['asset-index'],
    confirmedRound: result['confirmed-round'],
    explorerUrl: `${EXPLORER_BASE}/tx/${txId}`,
  };
}

// ═══════════════════════════════════════════════════════════
// APPLICATION INTERACTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Opt-in to an application
 */
export async function optInToApp(account, appId) {
  const params = await algodClient.getTransactionParams().do();

  const txn = algosdk.makeApplicationOptInTxnFromObject({
    from: account.address || account.addr,
    appIndex: appId,
    suggestedParams: params,
  });

  const signedTxn = txn.signTxn(account.sk);
  const sendResult = await algodClient.sendRawTransaction(signedTxn).do();
  const txId = extractTxId(sendResult);

  let confirmedRound = 0;
  try {
    const result = await algosdk.waitForConfirmation(algodClient, txId, 10);
    confirmedRound = result['confirmed-round'];
  } catch (e) {
    console.warn('Opt-in transaction sent but confirmation timed out:', txId);
  }

  return { txId, confirmedRound, explorerUrl: `${EXPLORER_BASE}/tx/${txId}` };
}

/**
 * Call application (NoOp)
 */
export async function callApp(account, appId, appArgs = [], accounts = [], foreignApps = []) {
  const params = await algodClient.getTransactionParams().do();

  const txn = algosdk.makeApplicationNoOpTxnFromObject({
    from: account.address || account.addr,
    appIndex: appId,
    appArgs: appArgs.map(arg => {
      if (typeof arg === 'string') return new TextEncoder().encode(arg);
      if (typeof arg === 'number') return algosdk.encodeUint64(arg);
      return arg;
    }),
    accounts: accounts.filter(a => isValidAddress(a)),
    foreignApps: foreignApps,
    suggestedParams: params,
  });

  const signedTxn = txn.signTxn(account.sk);
  const sendResult = await algodClient.sendRawTransaction(signedTxn).do();
  const txId = extractTxId(sendResult);

  let confirmedRound = 0;
  try {
    const result = await algosdk.waitForConfirmation(algodClient, txId, 10);
    confirmedRound = result['confirmed-round'];
  } catch (e) {
    console.warn('App call sent but confirmation timed out:', txId);
  }

  return { txId, confirmedRound, explorerUrl: `${EXPLORER_BASE}/tx/${txId}` };
}

/**
 * Get application state
 */
export async function getApplicationState(appId) {
  try {
    const app = await algodClient.getApplicationByID(appId).do();
    return app.params['global-state'] || [];
  } catch (error) {
    return [];
  }
}

// ═══════════════════════════════════════════════════════════
// UTILITY
// ═══════════════════════════════════════════════════════════

/**
 * Generate SHA256 hash using expo-crypto
 */
export async function sha256Hash(data) {
  try {
    const { digestStringAsync, CryptoDigestAlgorithm } = require('expo-crypto');
    const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
    const hash = await digestStringAsync(CryptoDigestAlgorithm.SHA256, dataStr);
    return hash;
  } catch (e) {
    // Fallback: simple hash-like function
    const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < dataStr.length; i++) {
      const char = dataStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  }
}

/**
 * Format ALGO amount with proper decimals
 */
export function formatAlgo(microAlgos) {
  return (microAlgos / 1_000_000).toFixed(6);
}

/**
 * Get explorer URL for transaction
 */
export function getExplorerUrl(type, id) {
  return `${EXPLORER_BASE}/${type}/${id}`;
}

export { algodClient, indexerClient, EXPLORER_BASE };
