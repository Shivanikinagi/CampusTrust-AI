/**
 * CampusTrust AI - Algorand Service (Mobile)
 * ============================================
 * Core service for Algorand blockchain interactions in React Native.
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

// Create clients
const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);
const indexerClient = new algosdk.Indexer(INDEXER_TOKEN, INDEXER_SERVER, INDEXER_PORT);

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
 * Delete saved account
 */
export async function deleteSavedAccount() {
  await SecureStore.deleteItemAsync('wallet_address');
  await SecureStore.deleteItemAsync('wallet_mnemonic');
}

/**
 * Get account information
 */
export async function getAccountInfo(address, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const info = await algodClient.accountInformation(address).do();
      return {
        address: info.address,
        balance: info.amount / 1_000_000,
        balanceMicroAlgos: info.amount,
        minBalance: info['min-balance'] / 1_000_000,
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
 * Send payment transaction
 */
export async function sendPayment(fromAccount, toAddress, amountInAlgos, note = '') {
  const params = await algodClient.getTransactionParams().do();
  const amountInMicroAlgos = Math.floor(amountInAlgos * 1_000_000);

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: fromAccount.address,
    to: toAddress,
    amount: amountInMicroAlgos,
    note: note ? new TextEncoder().encode(note) : undefined,
    suggestedParams: params,
  });

  const signedTxn = txn.signTxn(fromAccount.sk);
  const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
  await algosdk.waitForConfirmation(algodClient, txId, 4);

  return txId;
}

/**
 * Opt-in to an application
 */
export async function optInToApp(account, appId) {
  const params = await algodClient.getTransactionParams().do();

  const txn = algosdk.makeApplicationOptInTxnFromObject({
    from: account.address,
    appIndex: appId,
    suggestedParams: params,
  });

  const signedTxn = txn.signTxn(account.sk);
  const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
  await algosdk.waitForConfirmation(algodClient, txId, 4);

  return txId;
}

/**
 * Call application
 */
export async function callApp(account, appId, appArgs = [], accounts = [], foreignApps = []) {
  const params = await algodClient.getTransactionParams().do();

  const txn = algosdk.makeApplicationNoOpTxnFromObject({
    from: account.address,
    appIndex: appId,
    appArgs: appArgs.map(arg => new TextEncoder().encode(arg)),
    accounts: accounts,
    foreignApps: foreignApps,
    suggestedParams: params,
  });

  const signedTxn = txn.signTxn(account.sk);
  const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
  await algosdk.waitForConfirmation(algodClient, txId, 4);

  return txId;
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

export { algodClient, indexerClient };
