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

/**
 * Extract transaction ID from sendRawTransaction response.
 * algosdk v3 returns { txid } (lowercase), not { txId } (camelCase).
 */
function extractTxId(sendResult) {
  const txId = sendResult?.txId || sendResult?.txid || sendResult?.txID;
  if (!txId) {
    // Fallback: check if the sendResult itself is a string (some SDK versions)
    if (typeof sendResult === 'string') return sendResult;
    console.error('sendRawTransaction result:', JSON.stringify(sendResult));
    throw new Error('Transaction failed: No transaction ID returned');
  }
  return txId;
}

/**
 * Validate an Algorand address (must be 58 chars, not a mock).
 */
export function isValidAddress(addr) {
  if (!addr || typeof addr !== 'string') return false;
  if (addr.length !== 58) return false;
  if (addr.includes('...')) return false;
  try {
    algosdk.decodeAddress(addr);
    return true;
  } catch {
    return false;
  }
}

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
export async function getAccountInfo(address, retries = 3) {
  // Validate address format
  if (!address || typeof address !== 'string') {
    throw new Error('Invalid address: address must be a string');
  }

  // Check if it's a mock/test address
  if (address.startsWith('PROVIDER') || address.includes('...')) {
    console.warn('Mock address detected, returning mock data:', address);
    return {
      address: address,
      balance: 100, // Mock balance
      balanceMicroAlgos: 100000000,
      minBalance: 0.1,
      assets: [],
      appsLocalState: [],
      createdApps: [],
      totalAppsOptedIn: 0,
      round: 0
    };
  }

  // Validate real Algorand address format
  if (address.length !== 58) {
    throw new Error(`Malformed address: expected length 58, got ${address.length}: ${address.substring(0, 12)}...${address.substring(address.length - 3)}`);
  }

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const info = await algodClient.accountInformation(address).do();

      // Safe BigInt to Number conversion
      const amountMicroAlgos = typeof info.amount === 'bigint' ? Number(info.amount) : info.amount;
      const minBalanceMicroAlgos = typeof info['min-balance'] === 'bigint' ? Number(info['min-balance']) : info['min-balance'];

      return {
        address: info.address,
        balance: amountMicroAlgos / 1_000_000, // Convert from microAlgos
        balanceMicroAlgos: amountMicroAlgos,
        minBalance: minBalanceMicroAlgos / 1_000_000,
        assets: info.assets || [],
        appsLocalState: info['apps-local-state'] || [],
        createdApps: info['created-apps'] || [],
        totalAppsOptedIn: info['total-apps-opted-in'] || 0,
      };
    } catch (error) {
      console.error(`Failed to get account info (attempt ${attempt + 1}/${retries}):`, error);
      if (attempt < retries - 1) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      } else {
        throw new Error(`Network timeout: Unable to connect to Algorand TestNet after ${retries} attempts. Please check your internet connection or try again later.`);
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
  const sendResult = await algodClient.sendRawTransaction(signedTxn).do();
  const txId = extractTxId(sendResult);

  // Wait for confirmation with longer timeout and better error handling
  let result;
  try {
    result = await algosdk.waitForConfirmation(algodClient, txId, 20);
  } catch (error) {
    console.warn('Transaction confirmation timeout, checking manually...');
    // Manual check for transaction status
    await new Promise(resolve => setTimeout(resolve, 3000));
    const pendingTxn = await algodClient.pendingTransactionInformation(txId).do();
    if (pendingTxn['confirmed-round'] && pendingTxn['confirmed-round'] > 0) {
      result = pendingTxn;
    } else {
      throw new Error('Transaction not confirmed after extended wait');
    }
  }

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
  const sendResult = await algodClient.sendRawTransaction(signedTxn).do();
  const txId = extractTxId(sendResult);

  let confirmedRound = 0;
  try {
    // Wait for confirmation with longer timeout and better error handling
    let result;
    try {
      result = await algosdk.waitForConfirmation(algodClient, txId, 20);
    } catch (error) {
      console.warn('Transaction confirmation timeout, checking manually...');
      // Manual check for transaction status
      await new Promise(resolve => setTimeout(resolve, 3000));
      const pendingTxn = await algodClient.pendingTransactionInformation(txId).do();
      if (pendingTxn['confirmed-round'] && pendingTxn['confirmed-round'] > 0) {
        result = pendingTxn;
      } else {
        throw new Error('Transaction not confirmed after extended wait');
      }
    }
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
  const sendResult = await algodClient.sendRawTransaction(signedTxn).do();
  const txId = extractTxId(sendResult);

  let confirmedRound = 0;
  try {
    // Wait for confirmation with longer timeout and better error handling
    let result;
    try {
      result = await algosdk.waitForConfirmation(algodClient, txId, 20);
    } catch (error) {
      console.warn('Transaction confirmation timeout, checking manually...');
      // Manual check for transaction status
      await new Promise(resolve => setTimeout(resolve, 3000));
      const pendingTxn = await algodClient.pendingTransactionInformation(txId).do();
      if (pendingTxn['confirmed-round'] && pendingTxn['confirmed-round'] > 0) {
        result = pendingTxn;
      } else {
        throw new Error('Transaction not confirmed after extended wait');
      }
    }
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
  // Validate address
  if (!address || typeof address !== 'string') {
    throw new Error('Invalid address: address must be a string');
  }

  // Handle mock addresses
  if (address.startsWith('PROVIDER') || address.includes('...')) {
    console.warn('Mock address detected in readLocalState:', address);
    return {}; // Return empty state for mock addresses
  }

  // Validate real Algorand address
  if (address.length !== 58) {
    throw new Error(`Malformed address in readLocalState: expected length 58, got ${address.length}: ${address.substring(0, 12)}...${address.substring(address.length - 3)}`);
  }

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
  // Pre-flight balance check: creating an ASA requires 0.1 ALGO additional min balance + txn fee
  try {
    const accountInfo = await getAccountInfo(senderAddress);
    const currentBalance = accountInfo.balanceMicroAlgos / 1_000_000;
    const currentAssets = accountInfo.assets?.length || 0;
    const currentMinBalance = accountInfo.minBalance;
    
    // Calculate new minimum balance after creating the asset
    // Base: 0.1 ALGO, Each asset: 0.1 ALGO, Each app opt-in: 0.1 ALGO
    const newMinBalance = currentMinBalance + 0.1; // Adding 1 asset = +0.1 ALGO
    const txnFee = 0.001; // Transaction fee
    const totalRequired = newMinBalance + txnFee;
    
    if (currentBalance < totalRequired) {
      const shortfall = (totalRequired - currentBalance).toFixed(4);
      throw new Error(
        `⚠️ Insufficient Balance for Minting Badge\n\n` +
        `Current Balance: ${currentBalance.toFixed(4)} ALGO\n` +
        `Current Assets: ${currentAssets}\n` +
        `Required: ${totalRequired.toFixed(4)} ALGO (${newMinBalance.toFixed(1)} min balance + ${txnFee} fee)\n` +
        `Shortfall: ${shortfall} ALGO\n\n` +
        `💰 Fund your wallet here:\nhttps://bank.testnet.algorand.network/\n\n` +
        `Enter your address: ${senderAddress}\n` +
        `Request at least ${Math.ceil(parseFloat(shortfall) * 10) / 10} ALGO`
      );
    }
  } catch (balanceErr) {
    // If the error is our custom one, re-throw; otherwise just warn and proceed
    if (balanceErr.message.includes('Insufficient Balance')) throw balanceErr;
    console.warn('Balance pre-check failed, proceeding anyway:', balanceErr.message);
  }

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
  const sendResult = await algodClient.sendRawTransaction(signedTxn).do();
  const txId = extractTxId(sendResult);

  // Wait for confirmation with longer timeout and better error handling
  let result;
  try {
    result = await algosdk.waitForConfirmation(algodClient, txId, 20);
  } catch (error) {
    console.warn('Transaction confirmation timeout, checking manually...');
    // Manual check for transaction status
    await new Promise(resolve => setTimeout(resolve, 3000));
    const pendingTxn = await algodClient.pendingTransactionInformation(txId).do();
    if (pendingTxn['confirmed-round'] && pendingTxn['confirmed-round'] > 0) {
      result = pendingTxn;
    } else {
      throw new Error('Transaction not confirmed after extended wait');
    }
  }

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
  const sendResult = await algodClient.sendRawTransaction(signedTxn).do();
  const txId = extractTxId(sendResult);

  // Wait for confirmation with longer timeout and better error handling
  let result;
  try {
    result = await algosdk.waitForConfirmation(algodClient, txId, 20);
  } catch (error) {
    console.warn('Transaction confirmation timeout, checking manually...');
    // Manual check for transaction status
    await new Promise(resolve => setTimeout(resolve, 3000));
    const pendingTxn = await algodClient.pendingTransactionInformation(txId).do();
    if (pendingTxn['confirmed-round'] && pendingTxn['confirmed-round'] > 0) {
      result = pendingTxn;
    } else {
      throw new Error('Transaction not confirmed after extended wait');
    }
  }

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
  const sendResult = await algodClient.sendRawTransaction(signedTxn).do();
  const txId = extractTxId(sendResult);

  // Wait for confirmation with longer timeout and better error handling
  let result;
  try {
    result = await algosdk.waitForConfirmation(algodClient, txId, 20);
  } catch (error) {
    console.warn('Transaction confirmation timeout, checking manually...');
    // Manual check for transaction status
    await new Promise(resolve => setTimeout(resolve, 3000));
    const pendingTxn = await algodClient.pendingTransactionInformation(txId).do();
    if (pendingTxn['confirmed-round'] && pendingTxn['confirmed-round'] > 0) {
      result = pendingTxn;
    } else {
      throw new Error('Transaction not confirmed after extended wait');
    }
  }

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
  // Validate input
  if (!txId) {
    throw new Error('Cannot wait for confirmation: txId is undefined');
  }
  if (typeof txId !== 'string') {
    throw new Error('Cannot wait for confirmation: txId must be a string');
  }

  return await algosdk.waitForConfirmation(algodClient, txId, timeout);
}

/**
 * Get explorer URL for transaction
 */
export function getExplorerUrl(type, id) {
  return `${EXPLORER_BASE}/${type}/${id}`;
}

// ═══════════════════════════════════════════════════════════
// GASLESS TRANSACTIONS (Sponsored by Backend)
// ═══════════════════════════════════════════════════════════

const BACKEND_URL = import.meta.env?.VITE_BACKEND_URL || 'http://localhost:5001';

/**
 * Check if gasless transactions are enabled
 */
export async function isGaslessEnabled() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/ai/health`);
    const data = await response.json();
    return data.gaslessEnabled || false;
  } catch (err) {
    console.warn('Gasless backend not available:', err.message);
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
  } catch (err) {
    return { configured: false, error: err.message };
  }
}

/**
 * Call application with gasless transaction (sponsored fees)
 */
export async function callAppGasless(senderAddress, appId, appArgs, accounts, signCallback) {
  try {
    // Request atomic transaction group from backend
    const response = await fetch(`${BACKEND_URL}/api/gasless/sponsor-transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        txnData: {
          userAddress: senderAddress,
          appId,
          appArgs: appArgs.map(arg => {
            if (typeof arg === 'string') return arg;
            if (typeof arg === 'number') return arg;
            if (arg instanceof Uint8Array) return Buffer.from(arg).toString('base64');
            return arg;
          }),
          accounts: accounts || [],
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create gasless transaction');
    }

    const { userTxn, sponsorTxn, groupID } = await response.json();

    // Decode the user's transaction
    const userTxnDecoded = algosdk.decodeUnsignedTransaction(
      new Uint8Array(Buffer.from(userTxn, 'base64'))
    );

    // User signs their transaction
    const signedUserTxn = await signCallback(userTxnDecoded);

    // Submit the atomic group to backend
    const submitResponse = await fetch(`${BACKEND_URL}/api/gasless/submit-group`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        signedUserTxn: Buffer.from(signedUserTxn).toString('base64'),
        sponsorTxn,
      }),
    });

    if (!submitResponse.ok) {
      const error = await submitResponse.json();
      throw new Error(error.error || 'Failed to submit gasless transaction');
    }

    const result = await submitResponse.json();

    return {
      txId: result.txId,
      confirmedRound: result.confirmedRound,
      explorerUrl: `${EXPLORER_BASE}/tx/${result.txId}`,
      gasless: true,
    };
  } catch (err) {
    console.error('Gasless transaction failed:', err.message);
    throw err;
  }
}

/**
 * Opt-in to application with gasless transaction
 */
export async function optInToAppGasless(senderAddress, appId, signCallback) {
  try {
    const params = await algodClient.getTransactionParams().do();
    params.fee = 0;
    params.flatFee = true;

    const txn = algosdk.makeApplicationOptInTxnFromObject({
      sender: senderAddress,
      suggestedParams: params,
      appIndex: appId,
    });

    // For now, use regular opt-in (can be enhanced later)
    // Opt-ins are cheap (0.001 ALGO) so less critical for gasless
    const signedTxn = await signCallback(txn);
    const sendResult = await algodClient.sendRawTransaction(signedTxn).do();
    const txId = extractTxId(sendResult);

    let confirmedRound = 0;
    try {
      // Wait for confirmation with longer timeout and better error handling
      let result;
      try {
        result = await algosdk.waitForConfirmation(algodClient, txId, 20);
      } catch (error) {
        console.warn('Transaction confirmation timeout, checking manually...');
        // Manual check for transaction status
        await new Promise(resolve => setTimeout(resolve, 3000));
        const pendingTxn = await algodClient.pendingTransactionInformation(txId).do();
        if (pendingTxn['confirmed-round'] && pendingTxn['confirmed-round'] > 0) {
          result = pendingTxn;
        } else {
          throw new Error('Transaction not confirmed after extended wait');
        }
      }
      confirmedRound = result['confirmed-round'];
    } catch (e) {
      console.warn("Transaction sent but waiting timed out.", txId);
    }

    return {
      txId,
      confirmedRound,
      explorerUrl: `${EXPLORER_BASE}/tx/${txId}`,
    };
  } catch (err) {
    throw err;
  }
}

/**
 * Smart transaction: Try gasless first, fallback to regular
 */
export async function callAppSmart(senderAddress, appId, appArgs, accounts, signCallback) {
  const gaslessAvailable = await isGaslessEnabled();

  if (gaslessAvailable) {
    try {
      console.log('⚡ Using gasless transaction...');
      return await callAppGasless(senderAddress, appId, appArgs, accounts, signCallback);
    } catch (err) {
      console.warn('Gasless failed, falling back to regular transaction:', err.message);
    }
  }

  // Fallback to regular transaction
  return await callApp(senderAddress, appId, appArgs, accounts, signCallback);
}

export { algodClient, indexerClient, EXPLORER_BASE };

