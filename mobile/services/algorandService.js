/**
 * CampusTrust AI - Mobile Algorand Service
 * ==========================================
 * React Native compatible version of the Algorand service.
 * Handles wallet generation, blockchain queries, and transaction proof.
 * No import.meta.env — uses hardcoded TestNet endpoints.
 */

// Import polyfill FIRST to ensure crypto is available
import '../polyfills';

import algosdk from 'algosdk';
import * as SecureStore from 'expo-secure-store';

// ═══════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════

const ALGOD_SERVER = 'https://testnet-api.4160.nodely.dev';
const ALGOD_PORT = '';
const ALGOD_TOKEN = '';

const INDEXER_SERVER = 'https://testnet-idx.4160.nodely.dev';
const INDEXER_PORT = '';
const INDEXER_TOKEN = '';

export const EXPLORER_BASE = 'https://testnet.explorer.perawallet.app';

// Create clients
const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);
const indexerClient = new algosdk.Indexer(INDEXER_TOKEN, INDEXER_SERVER, INDEXER_PORT);

// ═══════════════════════════════════════════════════════════
// SECURE STORAGE KEYS
// ═══════════════════════════════════════════════════════════

const WALLET_ADDRESS_KEY = 'campustrust_wallet_address';
const WALLET_MNEMONIC_KEY = 'campustrust_wallet_mnemonic';

// ═══════════════════════════════════════════════════════════
// DEMO MODE — Simulated in-memory wallet for when blockchain is unavailable
// ═══════════════════════════════════════════════════════════

let DEMO_MODE = false;
let DEMO_WALLET = null;
let DEMO_TXN_COUNTER = 1000;

export function isDemoMode() {
  return DEMO_MODE;
}

export function enableDemoMode() {
  DEMO_MODE = true;
  DEMO_WALLET = {
    address: 'DEMO7CAMPUSTRUST' + 'A'.repeat(58 - 16),
    balance: 1247.35,
    mnemonic: 'this is a demo wallet mnemonic that does not actually exist on the blockchain it is only for testing the app ui',
  };
  console.log('🎮 Demo mode enabled');
  return DEMO_WALLET;
}

export function disableDemoMode() {
  DEMO_MODE = false;
  DEMO_WALLET = null;
}

function generateDemoTxId() {
  DEMO_TXN_COUNTER++;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let txId = '';
  for (let i = 0; i < 52; i++) {
    txId += chars[Math.floor(Math.random() * chars.length)];
  }
  return txId;
}

function generateDemoProof(action, details) {
  const txId = generateDemoTxId();
  const now = new Date();
  const round = 45000000 + DEMO_TXN_COUNTER;
  return {
    success: true,
    txId,
    confirmedRound: round,
    timestamp: now.toISOString(),
    blockTimestamp: now.toISOString(),
    explorerUrl: `${EXPLORER_BASE}/tx/${txId}`,
    action,
    details,
    network: 'Algorand TestNet (Demo)',
    fee: '0.001 ALGO',
  };
}

// ═══════════════════════════════════════════════════════════
// ACCOUNT MANAGEMENT
// ═══════════════════════════════════════════════════════════

export function generateAccount() {
  if (DEMO_MODE) {
    const demoAddr = 'DEMO' + Array.from({ length: 54 }, () =>
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[Math.floor(Math.random() * 32)]
    ).join('');
    return {
      address: demoAddr,
      mnemonic: 'demo wallet ' + Date.now(),
      sk: new Uint8Array(64),
    };
  }

  const account = algosdk.generateAccount();
  const mnemonic = algosdk.secretKeyToMnemonic(account.sk);
  return {
    address: account.addr,
    mnemonic,
    sk: account.sk,
  };
}

export function recoverAccount(mnemonic) {
  if (DEMO_MODE) {
    return {
      address: 'DEMO' + Array.from({ length: 54 }, () =>
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[Math.floor(Math.random() * 32)]
      ).join(''),
      sk: new Uint8Array(64),
    };
  }

  const sk = algosdk.mnemonicToSecretKey(mnemonic);
  return {
    address: sk.addr,
    sk: sk.sk,
  };
}

// ═══════════════════════════════════════════════════════════
// SECURE STORAGE
// ═══════════════════════════════════════════════════════════

export async function saveAccount(address, mnemonic) {
  try {
    await SecureStore.setItemAsync(WALLET_ADDRESS_KEY, address);
    await SecureStore.setItemAsync(WALLET_MNEMONIC_KEY, mnemonic);
  } catch (e) {
    console.warn('SecureStore save failed, falling back:', e);
    // Fallback for Expo Go (SecureStore may not work on all platforms)
  }
}

export async function getFullAccount() {
  try {
    const address = await SecureStore.getItemAsync(WALLET_ADDRESS_KEY);
    const mnemonic = await SecureStore.getItemAsync(WALLET_MNEMONIC_KEY);
    if (address && mnemonic) {
      return { address, mnemonic };
    }
    return null;
  } catch (e) {
    console.warn('SecureStore read failed:', e);
    return null;
  }
}

export async function deleteSavedAccount() {
  try {
    await SecureStore.deleteItemAsync(WALLET_ADDRESS_KEY);
    await SecureStore.deleteItemAsync(WALLET_MNEMONIC_KEY);
  } catch (e) {
    console.warn('SecureStore delete failed:', e);
  }
}

// ═══════════════════════════════════════════════════════════
// ACCOUNT INFO
// ═══════════════════════════════════════════════════════════

export async function getAccountInfo(address, retries = 3) {
  if (DEMO_MODE) {
    return {
      address,
      balance: DEMO_WALLET?.balance || 1247.35,
      balanceMicroAlgos: (DEMO_WALLET?.balance || 1247.35) * 1_000_000,
      minBalance: 0.1,
      assets: [
        { 'asset-id': 10001, amount: 1 },
        { 'asset-id': 10002, amount: 1 },
      ],
      appsLocalState: [],
      createdApps: [],
      totalAppsOptedIn: 0,
      round: 45000000,
    };
  }

  if (!address || typeof address !== 'string') {
    throw new Error('Invalid address');
  }

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const info = await algodClient.accountInformation(address).do();
      const amountMicro = typeof info.amount === 'bigint' ? Number(info.amount) : info.amount;
      const minBalMicro = typeof info['min-balance'] === 'bigint' ? Number(info['min-balance']) : info['min-balance'];

      return {
        address: info.address,
        balance: amountMicro / 1_000_000,
        balanceMicroAlgos: amountMicro,
        minBalance: minBalMicro / 1_000_000,
        assets: info.assets || [],
        appsLocalState: info['apps-local-state'] || [],
        createdApps: info['created-apps'] || [],
        totalAppsOptedIn: info['total-apps-opted-in'] || 0,
      };
    } catch (error) {
      if (attempt < retries - 1) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
      } else {
        throw new Error(`Unable to connect to Algorand TestNet after ${retries} attempts.`);
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════
// NETWORK CHECK
// ═══════════════════════════════════════════════════════════

export async function checkNetwork() {
  if (DEMO_MODE) {
    return { connected: true, demo: true, lastRound: 45000000 };
  }
  try {
    const status = await algodClient.status().do();
    return { connected: true, lastRound: status['last-round'] };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════
// BLOCKCHAIN PROOF — Real or Demo
// ═══════════════════════════════════════════════════════════

/**
 * Record an attendance check-in on blockchain (or generate demo proof)
 */
export async function recordAttendanceOnChain(address, classId, location) {
  if (DEMO_MODE) {
    await new Promise(r => setTimeout(r, 1500)); // Simulate network delay
    return generateDemoProof('ATTENDANCE_CHECKIN', {
      studentAddress: address,
      classId,
      location: location || 'VIT Bibwewadi Campus, Pune',
      timestamp: new Date().toISOString(),
      gpsCoordinates: '18.4897° N, 73.8554° E',
      verificationMethod: 'Face Recognition + GPS',
    });
  }

  // Real implementation would call a smart contract
  const params = await algodClient.getTransactionParams().do();
  const note = new TextEncoder().encode(JSON.stringify({
    action: 'ATTENDANCE',
    classId,
    location,
    timestamp: Date.now(),
  }));

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: address,
    receiver: address, // self-txn as a record
    amount: 0,
    suggestedParams: params,
    note,
  });

  return { txn, note: 'Requires signing' };
}

/**
 * Verify a credential on blockchain
 */
export async function verifyCredentialOnChain(credentialId, issuerAddress) {
  if (DEMO_MODE) {
    await new Promise(r => setTimeout(r, 2000));
    const txId = generateDemoTxId();
    return {
      verified: true,
      txId,
      credentialId,
      issuer: issuerAddress || 'VIT University Certification Authority',
      issuedDate: '2025-06-15',
      expiryDate: '2029-06-15',
      blockchainRecord: {
        network: 'Algorand TestNet',
        assetId: 10000 + Math.floor(Math.random() * 1000),
        confirmedRound: 45000000 + Math.floor(Math.random() * 10000),
        txId,
        explorerUrl: `${EXPLORER_BASE}/tx/${txId}`,
      },
      hashVerification: {
        documentHash: Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join(''),
        onChainHash: 'MATCH ✅',
        algorithm: 'SHA-256',
      },
    };
  }

  // Real: query the indexer for the credential ASA
  throw new Error('Real credential verification requires app connection');
}

/**
 * Submit a permission request on-chain (or demo)
 */
export async function submitPermissionRequest(address, requestType, details) {
  if (DEMO_MODE) {
    await new Promise(r => setTimeout(r, 1800));
    const proof = generateDemoProof('PERMISSION_REQUEST', {
      type: requestType,
      ...details,
      submittedBy: address,
      status: 'PENDING_AI_AUDIT',
      estimatedProcessingTime: '2-4 hours',
    });
    proof.requestId = 'REQ-' + (1000 + DEMO_TXN_COUNTER);
    proof.stages = [
      { name: 'AI Pre-Audit', status: 'in_progress', eta: '5 minutes' },
      { name: 'HOD Review', status: 'pending', eta: '1-2 hours' },
      { name: 'Faculty Verification', status: 'pending', eta: '2-3 hours' },
      { name: 'Dean Sign-off', status: 'pending', eta: '3-4 hours' },
    ];
    return proof;
  }

  throw new Error('Real permission submission requires smart contract');
}

/**
 * Cast vote on a proposal (or demo)
 */
export async function castVote(address, proposalId, vote, proposalTitle) {
  if (DEMO_MODE) {
    await new Promise(r => setTimeout(r, 1800));
    return generateDemoProof('VOTE_CAST', {
      proposalId,
      proposalTitle,
      voterAddress: address,
      vote: vote.toUpperCase(),
      votingPower: '1.0',
      previousVoteCounts: { yes: 67, no: 8 },
      newVoteCounts: { yes: vote === 'yes' ? 68 : 67, no: vote === 'no' ? 9 : 8 },
    });
  }

  throw new Error('Real voting requires smart contract');
}

/**
 * Create new proposal (or demo)
 */
export async function createProposal(address, title, description) {
  if (DEMO_MODE) {
    await new Promise(r => setTimeout(r, 2200));
    const aiScore = Math.floor(Math.random() * 30) + 60;
    const proposalId = `#PROP-${1027 + Math.floor(Math.random() * 100)}`;
    const proof = generateDemoProof('PROPOSAL_CREATED', {
      proposalId,
      title,
      description,
      creatorAddress: address,
      aiAnalysis: {
        score: aiScore,
        clarity: Math.floor(Math.random() * 20) + 70,
        feasibility: Math.floor(Math.random() * 20) + 65,
        impact: Math.floor(Math.random() * 20) + 60,
      },
      votingPeriod: '7 days',
      status: 'ACTIVE',
    });
    proof.proposalId = proposalId;
    proof.aiScore = aiScore;
    return proof;
  }

  throw new Error('Real proposal creation requires smart contract');
}

/**
 * Sign/reject a governance proposal on-chain (or demo)
 */
export async function signGovernanceProposal(address, proposalId, action) {
  if (DEMO_MODE) {
    await new Promise(r => setTimeout(r, 1500));
    return generateDemoProof(`GOVERNANCE_${action.toUpperCase()}`, {
      proposalId,
      signerAddress: address,
      action,
      multisigStatus: action === 'sign' ? '3 of 5 signed' : 'Rejected by signer',
    });
  }

  throw new Error('Real governance signing requires multi-sig smart contract');
}

/**
 * Submit grant for AI evaluation on-chain (or demo)
 */
export async function submitGrantProposal(address, grantDetails) {
  if (DEMO_MODE) {
    await new Promise(r => setTimeout(r, 2500));
    const aiScore = Math.floor(Math.random() * 30) + 65;
    const proof = generateDemoProof('GRANT_SUBMISSION', {
      ...grantDetails,
      submittedBy: address,
      aiEvaluation: {
        score: aiScore,
        verdict: aiScore >= 70 ? 'AUTO_APPROVED' : 'MANUAL_REVIEW_REQUIRED',
        factors: {
          innovation: Math.floor(Math.random() * 20) + 70,
          feasibility: Math.floor(Math.random() * 20) + 60,
          impact: Math.floor(Math.random() * 20) + 65,
          budgetEfficiency: Math.floor(Math.random() * 20) + 55,
        },
      },
    });
    proof.aiScore = aiScore;
    return proof;
  }

  throw new Error('Real grant submission requires smart contract');
}

/**
 * Claim a grant milestone payment on-chain (or demo)
 */
export async function claimMilestonePayment(address, projectId, milestoneIndex, amount) {
  if (DEMO_MODE) {
    await new Promise(r => setTimeout(r, 2000));
    return generateDemoProof('MILESTONE_CLAIM', {
      projectId,
      milestoneIndex,
      amount: `${amount} ALGO`,
      recipientAddress: address,
      paymentStatus: 'DISBURSED',
    });
  }

  throw new Error('Real milestone claims require smart contract');
}

/**
 * Issue skill badge on-chain (or demo)
 */
export async function issueSkillBadge(address, badgeDetails) {
  if (DEMO_MODE) {
    await new Promise(r => setTimeout(r, 2100));
    const badgeId = `BADGE-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    return generateDemoProof('BADGE_ISSUED', {
      badgeId,
      ...badgeDetails,
      recipientAddress: address,
      nftAssetId: 10000 + Math.floor(Math.random() * 9000),
      aiVerification: {
        skillLevel: badgeDetails.level || 'Intermediate',
        confidence: Math.floor(Math.random() * 15) + 85,
        verified: true,
      },
    });
  }

  throw new Error('Real badge issuance requires NFT smart contract');
}

/**
 * Verify skill badge on-chain (or demo)
 */
export async function verifySkillBadge(badgeId, recipientAddress) {
  if (DEMO_MODE) {
    await new Promise(r => setTimeout(r, 1700));
    return generateDemoProof('BADGE_VERIFIED', {
      badgeId,
      recipientAddress,
      issuer: 'VIT Skill Certification Authority',
      issuedDate: '2025-12-10',
      expiryDate: '2027-12-10',
      skillCategory: 'Blockchain Development',
      verified: true,
      onChainMetadata: {
        assetId: 10000 + Math.floor(Math.random() * 9000),
        standard: 'ARC-69',
      },
    });
  }

  throw new Error('Real badge verification requires indexer query');
}

/**
 * List compute resource on marketplace (or demo)
 */
export async function listComputeResource(address, resourceDetails) {
  if (DEMO_MODE) {
    await new Promise(r => setTimeout(r, 1900));
    const listingId = `COMP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    return generateDemoProof('COMPUTE_LISTED', {
      listingId,
      ...resourceDetails,
      providerAddress: address,
      status: 'ACTIVE',
      escrowContract: 'ESC' + Array(52).fill(0).map(() => 
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[Math.floor(Math.random() * 32)]
      ).join(''),
    });
  }

  throw new Error('Real compute listing requires marketplace smart contract');
}

/**
 * Rent compute resource (or demo)
 */
export async function rentComputeResource(address, listingId, duration, cost) {
  if (DEMO_MODE) {
    await new Promise(r => setTimeout(r, 2000));
    return generateDemoProof('COMPUTE_RENTED', {
      listingId,
      renterAddress: address,
      duration: `${duration} hours`,
      cost: `${cost} ALGO`,
      sessionId: `SES-${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
      escrowReleased: false,
      expiresAt: new Date(Date.now() + duration * 3600000).toISOString(),
    });
  }

  throw new Error('Real compute rental requires marketplace smart contract');
}

/**
 * Submit research for certification (or demo)
 */
export async function submitResearchCertification(address, researchDetails) {
  if (DEMO_MODE) {
    await new Promise(r => setTimeout(r, 2400));
    const certId = `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const aiScore = Math.floor(Math.random() * 20) + 75;
    return generateDemoProof('RESEARCH_SUBMITTED', {
      certificationId: certId,
      ...researchDetails,
      submittedBy: address,
      aiEvaluation: {
        score: aiScore,
        originality: Math.floor(Math.random() * 15) + 80,
        methodology: Math.floor(Math.random() * 15) + 75,
        impact: Math.floor(Math.random() * 15) + 70,
        status: aiScore >= 80 ? 'AUTO_APPROVED' : 'PEER_REVIEW_REQUIRED',
      },
      ipfsHash: 'Qm' + Array(44).fill(0).map(() => 
        'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]
      ).join(''),
    });
  }

  throw new Error('Real research certification requires smart contract');
}

/**
 * Verify research certificate (or demo)
 */
export async function verifyResearchCertificate(certId) {
  if (DEMO_MODE) {
    await new Promise(r => setTimeout(r, 1600));
    return generateDemoProof('RESEARCH_VERIFIED', {
      certificationId: certId,
      title: 'Quantum Computing Applications in Cryptography',
      author: 'Dr. Sarah Chen',
      institution: 'VIT University',
      certifiedDate: '2025-11-20',
      verified: true,
      ipfsHash: 'Qm' + Array(44).fill(0).map(() => 
        'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]
      ).join(''),
      doi: '10.1000/xyz.123.456',
    });
  }

  throw new Error('Real certificate verification requires indexer query');
}

// ═══════════════════════════════════════════════════════════
// EXPLORER HELPERS
// ═══════════════════════════════════════════════════════════

export function getExplorerUrl(type, id) {
  return `${EXPLORER_BASE}/${type}/${id}`;
}

export function getTransactionUrl(txId) {
  return `${EXPLORER_BASE}/tx/${txId}`;
}

export function getAddressUrl(address) {
  return `${EXPLORER_BASE}/address/${address}`;
}

export { algodClient, indexerClient };
