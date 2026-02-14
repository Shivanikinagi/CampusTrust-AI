/**
 * CampusTrust AI - Algorand Service
 * ====================================
 * Core service for Algorand blockchain interactions.
 * Handles wallet connection, transactions, and smart contract calls.
 * 
 * Uses: algosdk, @perawallet/connect
 * Network: Algorand TestNet (AlgoNode public API)
 */

import algosdk from 'algosdk';

// ═══════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════

// Use environment variables or reliable defaults
const ALGOD_SERVER = import.meta.env?.VITE_ALGOD_SERVER || 'https://testnet-api.4160.nodely.dev';
const ALGOD_PORT = '';
const ALGOD_TOKEN = '';

const INDEXER_SERVER = import.meta.env?.VITE_INDEXER_SERVER || 'https://testnet-idx.4160.nodely.dev';
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
 * Generate a new Algorand account (for demo purposes)
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
 * Get account information (balance, assets, etc.)
 */
export async function getAccountInfo(address) {
  try {
    const info = await algodClient.accountInformation(address).do();
    return {
      address: info.address,
      balance: info.amount / 1_000_000, // Convert from microAlgos
      balanceMicroAlgos: info.amount,
      minBalance: info['min-balance'] / 1_000_000,
      assets: info.assets || [],
      appsLocalState: info['apps-local-state'] || [],
      createdApps: info['created-apps'] || [],
      totalAppsOptedIn: info['total-apps-opted-in'] || 0,
    };
  } catch (error) {
    console.error('Failed to get account info:', error);
    throw error;
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
      catchupTime: status['catchup-time'],
    };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════
// SMART CONTRACT INTERACTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Create (deploy) a new application
 */
export async function createApplication(
  senderAddress,
  approvalProgram,
  clearProgram,
  globalSchema,
  localSchema,
  appArgs = [],
  signCallback
) {
  const params = await algodClient.getTransactionParams().do();

  const txn = algosdk.makeApplicationCreateTxnFromObject({
    sender: senderAddress,
    suggestedParams: params,
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
    approvalProgram: new Uint8Array(Buffer.from(approvalProgram, 'base64')),
    clearProgram: new Uint8Array(Buffer.from(clearProgram, 'base64')),
    numGlobalInts: globalSchema.numUints || 0,
    numGlobalByteSlices: globalSchema.numByteSlices || 0,
    numLocalInts: localSchema.numUints || 0,
    numLocalByteSlices: localSchema.numByteSlices || 0,
    appArgs: appArgs.map(arg =>
      typeof arg === 'string' ? new TextEncoder().encode(arg) : arg
    ),
  });

  const signedTxn = await signCallback(txn);
  const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
  const result = await algosdk.waitForConfirmation(algodClient, txId, 10);

  return {
    txId,
    appId: result['application-index'],
    confirmedRound: result['confirmed-round'],
    explorerUrl: `${EXPLORER_BASE}/tx/${txId}`,
  };
}

/**
 * Opt in to an application
 */
export async function optInToApp(senderAddress, appId, signCallback) {
  const params = await algodClient.getTransactionParams().do();

  const txn = algosdk.makeApplicationOptInTxnFromObject({
    sender: senderAddress,
    suggestedParams: params,
    appIndex: appId,
  });

  const signedTxn = await signCallback(txn);
  const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
  
  let confirmedRound = 0;
  try {
      const result = await algosdk.waitForConfirmation(algodClient, txId, 20);
      confirmedRound = result['confirmed-round'];
  } catch (e) {
      console.warn("Transaction sent but waiting timed out. It may still confirm.", txId);
  }

  return {
    txId,
    confirmedRound,
    explorerUrl: `${EXPLORER_BASE}/tx/${txId}`,
  };
}

/**
 * Call an application (NoOp)
 */
export async function callApp(senderAddress, appId, appArgs, accounts, signCallback) {
  const params = await algodClient.getTransactionParams().do();

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
  const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
  
  let confirmedRound = 0;
  try {
      const result = await algosdk.waitForConfirmation(algodClient, txId, 20);
      confirmedRound = result['confirmed-round'];
  } catch (e) {
      console.warn("Transaction sent but waiting timed out.", txId);
  }

  return {
    txId,
    confirmedRound,
    explorerUrl: `${EXPLORER_BASE}/tx/${txId}`,
  };
}

/**
 * Read application global state
 */
export async function readGlobalState(appId) {
  try {
    const app = await algodClient.getApplicationByID(appId).do();
    const state = {};

    if (app.params && app.params['global-state']) {
      for (const item of app.params['global-state']) {
        const key = Buffer.from(item.key, 'base64').toString();
        if (item.value.type === 1) {
          // bytes
          state[key] = Buffer.from(item.value.bytes, 'base64').toString();
        } else {
          // uint
          state[key] = item.value.uint;
        }
      }
    }

    return state;
  } catch (error) {
    console.error('Failed to read global state:', error);
    throw error;
  }
}

/**
 * Read application local state for an account
 */
export async function readLocalState(address, appId) {
  try {
    const info = await algodClient.accountInformation(address).do();
    const state = {};

    const appState = (info['apps-local-state'] || []).find(
      app => app.id === appId
    );

    if (appState && appState['key-value']) {
      for (const item of appState['key-value']) {
        const key = Buffer.from(item.key, 'base64').toString();
        if (item.value.type === 1) {
          state[key] = Buffer.from(item.value.bytes, 'base64').toString();
        } else {
          state[key] = item.value.uint;
        }
      }
    }

    return state;
  } catch (error) {
    console.error('Failed to read local state:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════
// ASA (Algorand Standard Assets) - For Credentials
// ═══════════════════════════════════════════════════════════

/**
 * Create a new ASA (for credential/certificate)
 */
export async function createASA(senderAddress, assetParams, signCallback) {
  const params = await algodClient.getTransactionParams().do();

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
  const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
  const result = await algosdk.waitForConfirmation(algodClient, txId, 10);

  return {
    txId,
    assetId: result['asset-index'],
    confirmedRound: result['confirmed-round'],
    explorerUrl: `${EXPLORER_BASE}/tx/${txId}`,
  };
}

/**
 * Transfer ASA to another account
 */
export async function transferASA(senderAddress, receiverAddress, assetId, amount, signCallback) {
  const params = await algodClient.getTransactionParams().do();

  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    sender: senderAddress,
    receiver: receiverAddress,
    suggestedParams: params,
    assetIndex: assetId,
    amount: amount,
  });

  const signedTxn = await signCallback(txn);
  const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
  const result = await algosdk.waitForConfirmation(algodClient, txId, 10);

  return {
    txId,
    confirmedRound: result['confirmed-round'],
    explorerUrl: `${EXPLORER_BASE}/tx/${txId}`,
  };
}

// ═══════════════════════════════════════════════════════════
// PAYMENT TRANSACTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Send ALGO payment
 */
export async function sendPayment(senderAddress, receiverAddress, amountAlgo, note, signCallback) {
  const params = await algodClient.getTransactionParams().do();
  const amountMicroAlgos = Math.floor(amountAlgo * 1_000_000);

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: senderAddress,
    receiver: receiverAddress,
    amount: amountMicroAlgos,
    suggestedParams: params,
    note: note ? new TextEncoder().encode(note) : undefined,
  });

  const signedTxn = await signCallback(txn);
  const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
  const result = await algosdk.waitForConfirmation(algodClient, txId, 10);

  return {
    txId,
    confirmedRound: result['confirmed-round'],
    explorerUrl: `${EXPLORER_BASE}/tx/${txId}`,
  };
}

// ═══════════════════════════════════════════════════════════
// UTILITY
// ═══════════════════════════════════════════════════════════

/**
 * Generate SHA256 hash (for storing feedback hash on-chain)
 */
export async function sha256Hash(data) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(typeof data === 'string' ? data : JSON.stringify(data));
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Format ALGO amount with proper decimals
 */
export function formatAlgo(microAlgos) {
  return (microAlgos / 1_000_000).toFixed(6);
}

/**
 * Wait for transaction confirmation
 */
export async function waitForConfirmation(txId, timeout = 10) {
  return await algosdk.waitForConfirmation(algodClient, txId, timeout);
}

/**
 * Get explorer URL for transaction
 */
export function getExplorerUrl(type, id) {
  return `${EXPLORER_BASE}/${type}/${id}`;
}

export { algodClient, indexerClient, EXPLORER_BASE };
