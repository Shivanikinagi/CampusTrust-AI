/**
 * CampusTrust AI - Token & Asset Service
 * ========================================
 * Manages Algorand Standard Assets (ASA) for campus tokens and NFT badges.
 * 
 * Features:
 * - Create campus governance tokens (ASA)
 * - Create NFT achievement badges (ARC-3/ARC-19)
 * - Distribute token rewards
 * - Atomic transfers for complex operations
 * - Asset opt-in management
 * 
 * Showcases Algorand's native ASA capabilities
 */

import algosdk from 'algosdk';
import { algodClient, waitForConfirmation } from './algorandService.js';

// ═══════════════════════════════════════════════════════════
// CAMPUS TOKEN (ASA) OPERATIONS
// ═══════════════════════════════════════════════════════════

/**
 * Create Campus Governance Token (ASA)
 * 
 * @param {Object} creatorAccount - Creator account with address and sk
 * @param {string} tokenName - Name of the token (e.g., "Campus Governance Token")
 * @param {string} unitName - Unit name (e.g., "CGT")
 * @param {number} totalSupply - Total supply of tokens
 * @param {number} decimals - Number of decimals (0 for whole tokens)
 * @returns {Promise<Object>} Created asset details
 */
export async function createCampusToken(creatorAccount, tokenName, unitName, totalSupply, decimals = 0) {
  try {
    const params = await algodClient.getTransactionParams().do();
    
    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      from: creatorAccount.address,
      total: totalSupply * Math.pow(10, decimals),
      decimals: decimals,
      assetName: tokenName,
      unitName: unitName,
      assetURL: 'https://campustrust.ai/token',
      assetMetadataHash: undefined,
      defaultFrozen: false,
      freeze: creatorAccount.address,
      manager: creatorAccount.address,
      clawback: creatorAccount.address, // For policy violations
      reserve: creatorAccount.address,
      suggestedParams: params,
      note: new Uint8Array(Buffer.from('CampusTrust Governance Token')),
    });
    
    const signedTxn = txn.signTxn(creatorAccount.sk);
    const txId = await algodClient.sendRawTransaction(signedTxn).do();
    
    await waitForConfirmation(txId);
    
    const ptx = await algodClient.pendingTransactionInformation(txId).do();
    const assetId = ptx['asset-index'];
    
    console.log(`✅ Campus Token created! Asset ID: ${assetId}`);
    
    return {
      assetId,
      txId,
      name: tokenName,
      unitName,
      totalSupply,
      decimals,
    };
  } catch (error) {
    console.error('Failed to create campus token:', error);
    throw error;
  }
}

/**
 * Create NFT Achievement Badge (ARC-3 compliant)
 * 
 * @param {Object} creatorAccount - Creator account
 * @param {string} badgeName - Badge name (e.g., "Perfect Attendance")
 * @param {string} ipfsHash - IPFS hash of badge metadata
 * @returns {Promise<Object>} Created NFT details
 */
export async function createAchievementBadge(creatorAccount, badgeName, ipfsHash) {
  try {
    const params = await algodClient.getTransactionParams().do();
    
    // ARC-3 compliant URL with IPFS hash
    const assetURL = `ipfs://${ipfsHash}`;
    
    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      from: creatorAccount.address,
      total: 1, // NFT = total supply of 1
      decimals: 0,
      assetName: badgeName,
      unitName: 'BADGE',
      assetURL: assetURL,
      assetMetadataHash: undefined,
      defaultFrozen: true, // Non-transferable badge
      freeze: creatorAccount.address,
      manager: creatorAccount.address,
      clawback: undefined, // Cannot be clawed back
      reserve: undefined,
      suggestedParams: params,
      note: new Uint8Array(Buffer.from(`CampusTrust Badge: ${badgeName}`)),
    });
    
    const signedTxn = txn.signTxn(creatorAccount.sk);
    const txId = await algodClient.sendRawTransaction(signedTxn).do();
    
    await waitForConfirmation(txId);
    
    const ptx = await algodClient.pendingTransactionInformation(txId).do();
    const assetId = ptx['asset-index'];
    
    console.log(`🏆 Achievement Badge created! Asset ID: ${assetId}`);
    
    return {
      assetId,
      txId,
      name: badgeName,
      ipfsHash,
      url: assetURL,
    };
  } catch (error) {
    console.error('Failed to create achievement badge:', error);
    throw error;
  }
}

/**
 * Opt-in to Asset (required before receiving)
 * 
 * @param {string} address - Account address
 * @param {Uint8Array} secretKey - Account secret key
 * @param {number} assetId - Asset ID to opt into
 * @returns {Promise<string>} Transaction ID
 */
export async function optInToAsset(address, secretKey, assetId) {
  try {
    const params = await algodClient.getTransactionParams().do();
    
    const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: address,
      to: address,
      assetIndex: assetId,
      amount: 0,
      suggestedParams: params,
      note: new Uint8Array(Buffer.from('Opt-in to asset')),
    });
    
    const signedTxn = txn.signTxn(secretKey);
    const txId = await algodClient.sendRawTransaction(signedTxn).do();
    
    await waitForConfirmation(txId);
    
    console.log(`✅ Opted into asset ${assetId}`);
    return txId;
  } catch (error) {
    console.error('Failed to opt-in to asset:', error);
    throw error;
  }
}

/**
 * Transfer Asset (tokens or NFT badges)
 * 
 * @param {Object} fromAccount - Sender account
 * @param {string} toAddress - Recipient address
 * @param {number} assetId - Asset ID
 * @param {number} amount - Amount to send
 * @returns {Promise<string>} Transaction ID
 */
export async function transferAsset(fromAccount, toAddress, assetId, amount) {
  try {
    const params = await algodClient.getTransactionParams().do();
    
    const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: fromAccount.address,
      to: toAddress,
      assetIndex: assetId,
      amount: amount,
      suggestedParams: params,
      note: new Uint8Array(Buffer.from('Asset transfer')),
    });
    
    const signedTxn = txn.signTxn(fromAccount.sk);
    const txId = await algodClient.sendRawTransaction(signedTxn).do();
    
    await waitForConfirmation(txId);
    
    console.log(`✅ Transferred ${amount} of asset ${assetId} to ${toAddress}`);
    return txId;
  } catch (error) {
    console.error('Failed to transfer asset:', error);
    throw error;
  }
}

/**
 * Get Asset Balance for an account
 * 
 * @param {string} address - Account address
 * @param {number} assetId - Asset ID
 * @returns {Promise<number>} Asset balance
 */
export async function getAssetBalance(address, assetId) {
  try {
    const accountInfo = await algodClient.accountInformation(address).do();
    
    const asset = accountInfo.assets.find(a => a['asset-id'] === assetId);
    
    return asset ? asset.amount : 0;
  } catch (error) {
    console.error('Failed to get asset balance:', error);
    return 0;
  }
}

/**
 * Get all assets owned by an account
 * 
 * @param {string} address - Account address
 * @returns {Promise<Array>} Array of owned assets
 */
export async function getOwnedAssets(address) {
  try {
    const accountInfo = await algodClient.accountInformation(address).do();
    return accountInfo.assets || [];
  } catch (error) {
    console.error('Failed to get owned assets:', error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════
// ATOMIC TRANSFERS (Grouped Transactions)
// ═══════════════════════════════════════════════════════════

/**
 * Atomic Transfer: Vote + Earn Tokens
 * Demonstrates Algorand's atomic transaction groups
 * 
 * @param {Object} voterAccount - Voter account
 * @param {number} votingAppId - Voting app ID
 * @param {number} tokenAppId - Token app ID
 * @param {number} proposalId - Proposal to vote for
 * @returns {Promise<Object>} Transaction IDs
 */
export async function atomicVoteAndEarnTokens(voterAccount, votingAppId, tokenAppId, proposalId) {
  try {
    const params = await algodClient.getTransactionParams().do();
    
    // Transaction 1: Cast vote
    const voteTxn = algosdk.makeApplicationNoOpTxnFromObject({
      from: voterAccount.address,
      appIndex: votingAppId,
      appArgs: [
        new Uint8Array(Buffer.from('vote')),
        algosdk.encodeUint64(proposalId),
      ],
      suggestedParams: params,
    });
    
    // Transaction 2: Earn tokens for voting
    const rewardTxn = algosdk.makeApplicationNoOpTxnFromObject({
      from: voterAccount.address,
      appIndex: tokenAppId,
      appArgs: [
        new Uint8Array(Buffer.from('distribute')),
        algosdk.encodeUint64(0), // 0 = voting reward
        algosdk.decodeAddress(voterAccount.address).publicKey,
      ],
      accounts: [voterAccount.address],
      suggestedParams: params,
    });
    
    // Group transactions atomically
    const txns = [voteTxn, rewardTxn];
    const groupedTxns = algosdk.assignGroupID(txns);
    
    // Sign all transactions
    const signedTxns = groupedTxns.map(txn => txn.signTxn(voterAccount.sk));
    
    // Send as atomic group
    const { txId } = await algodClient.sendRawTransaction(signedTxns).do();
    
    await waitForConfirmation(txId);
    
    console.log(`✅ Atomic vote + reward completed! Group ID: ${txId}`);
    
    return {
      groupId: txId,
      voteTxId: voteTxn.txID(),
      rewardTxId: rewardTxn.txID(),
    };
  } catch (error) {
    console.error('Atomic transaction failed:', error);
    throw error;
  }
}

/**
 * Atomic Transfer: Issue Badge + Send Tokens
 * Award badge and bonus tokens in one atomic operation
 * 
 * @param {Object} adminAccount - Admin account
 * @param {string} studentAddress - Student to reward
 * @param {number} badgeAssetId - NFT badge asset ID
 * @param {number} tokenAssetId - Token asset ID
 * @param {number} bonusAmount - Bonus tokens to send
 * @returns {Promise<Object>} Transaction IDs
 */
export async function atomicBadgeAndBonus(adminAccount, studentAddress, badgeAssetId, tokenAssetId, bonusAmount) {
  try {
    const params = await algodClient.getTransactionParams().do();
    
    // Transaction 1: Transfer NFT badge
    const badgeTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: adminAccount.address,
      to: studentAddress,
      assetIndex: badgeAssetId,
      amount: 1,
      suggestedParams: params,
    });
    
    // Transaction 2: Transfer bonus tokens
    const tokenTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: adminAccount.address,
      to: studentAddress,
      assetIndex: tokenAssetId,
      amount: bonusAmount,
      suggestedParams: params,
    });
    
    // Group atomically
    const txns = [badgeTxn, tokenTxn];
    const groupedTxns = algosdk.assignGroupID(txns);
    
    const signedTxns = groupedTxns.map(txn => txn.signTxn(adminAccount.sk));
    
    const { txId } = await algodClient.sendRawTransaction(signedTxns).do();
    await waitForConfirmation(txId);
    
    console.log(`🏆 Atomic badge + bonus awarded! Group ID: ${txId}`);
    
    return {
      groupId: txId,
      badgeTxId: badgeTxn.txID(),
      tokenTxId: tokenTxn.txID(),
    };
  } catch (error) {
    console.error('Atomic badge award failed:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════
// ASSET INFORMATION
// ═══════════════════════════════════════════════════════════

/**
 * Get detailed asset information
 * 
 * @param {number} assetId - Asset ID
 * @returns {Promise<Object>} Asset details
 */
export async function getAssetInfo(assetId) {
  try {
    const assetInfo = await algodClient.getAssetByID(assetId).do();
    
    return {
      id: assetId,
      name: assetInfo.params.name,
      unitName: assetInfo.params['unit-name'],
      total: assetInfo.params.total,
      decimals: assetInfo.params.decimals,
      creator: assetInfo.params.creator,
      manager: assetInfo.params.manager,
      freeze: assetInfo.params.freeze,
      clawback: assetInfo.params.clawback,
      url: assetInfo.params.url,
      defaultFrozen: assetInfo.params['default-frozen'],
    };
  } catch (error) {
    console.error('Failed to get asset info:', error);
    throw error;
  }
}

export default {
  createCampusToken,
  createAchievementBadge,
  optInToAsset,
  transferAsset,
  getAssetBalance,
  getOwnedAssets,
  atomicVoteAndEarnTokens,
  atomicBadgeAndBonus,
  getAssetInfo,
};
