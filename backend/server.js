/**
 * CampusTrust AI - Backend Server
 * ===================================
 * Provides gasless transaction support via atomic transfers
 * Sponsor account pays all transaction fees for users
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import algosdk from 'algosdk';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ═══════════════════════════════════════════════════════════
// ALGORAND CLIENT SETUP
// ═══════════════════════════════════════════════════════════

const ALGOD_SERVER = process.env.VITE_ALGOD_SERVER || 'https://testnet-api.4160.nodely.dev';
const ALGOD_TOKEN = '';
const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, '');

// ═══════════════════════════════════════════════════════════
// SPONSOR ACCOUNT (Pays fees for all users)
// ═══════════════════════════════════════════════════════════

let sponsorAccount = null;

function initializeSponsor() {
  const sponsorMnemonic = process.env.SPONSOR_MNEMONIC;
  
  if (!sponsorMnemonic) {
    console.warn('⚠️  No SPONSOR_MNEMONIC found in .env');
    console.warn('⚠️  Generate one by running: node backend/generateSponsor.js');
    return null;
  }

  try {
    sponsorAccount = algosdk.mnemonicToSecretKey(sponsorMnemonic);
    console.log('✅ Sponsor account initialized:', sponsorAccount.addr);
    console.log('💰 Please ensure sponsor account has sufficient ALGO balance');
    return sponsorAccount;
  } catch (err) {
    console.error('❌ Failed to initialize sponsor account:', err.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════
// FACE VERIFICATION ENDPOINT
// ═══════════════════════════════════════════════════════════

/**
 * Face verification endpoint - handles face recognition and liveness detection
 */
app.post('/api/ai/face-verify', async (req, res) => {
  try {
    const { image, student_id, location_verified, coordinates } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Missing image data' });
    }

    // Simulate face verification process
    // In a real implementation, this would integrate with face-api.js or similar
    
    // For demo purposes, we'll simulate the verification
    // In production, this would:
    // 1. Convert base64 image to buffer
    // 2. Use face-api.js to detect faces and extract descriptors
    // 3. Compare with stored face descriptors
    // 4. Perform liveness detection
    // 5. Return verification result
    
    // Simulate face detection and verification
    const faceDetected = true; // Simulate face detection
    
    // Simulate liveness detection and anti-spoofing
    // In a real implementation, we would:
    // 1. Prompt user for random head movements (left/right/up/down)
    // 2. Analyze frames to detect movement patterns
    // 3. Check for blink detection
    // 4. Analyze depth map from 3D camera if available
    // 5. Perform anti-spoofing checks (detect photo/video replay attacks)
    const livenessPassed = true; // Simulate liveness check
    
    // Anti-spoofing check
    // In a real implementation, we would analyze depth maps and texture patterns
    // to differentiate between real faces and fake representations
    const antiSpoofingPassed = true; // Simulate anti-spoofing check
    const confidence = 0.92; // Simulate confidence score
    
    // Verify location if provided
    const locationOk = location_verified || false;
    
    // In a real implementation, we would:
    // 1. Store face descriptors on Algorand blockchain as hashes
    // 2. Compare incoming face descriptor with stored one
    // 3. Perform liveness checks (random head movements, etc.)
    
    const result = {
      verified: faceDetected && livenessPassed && antiSpoofingPassed && locationOk,
      confidence: confidence,
      face_detected: faceDetected,
      liveness_passed: livenessPassed,
      anti_spoofing_passed: antiSpoofingPassed,
      location_verified: locationOk,
      student_id: student_id,
      timestamp: Date.now(),
      message: faceDetected && livenessPassed && antiSpoofingPassed && locationOk 
        ? 'Face verification successful' 
        : 'Face verification failed'
    };

    return res.json(result);

  } catch (err) {
    console.error('Face verification error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// ATOMIC TRANSFER - GASLESS TRANSACTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Accept a user-signed transaction and combine it with sponsor fee payment
 * Returns a combined atomic transaction group
 */
app.post('/api/gasless/submit', async (req, res) => {
  try {
    const { userSignedTxn } = req.body;

    if (!userSignedTxn) {
      return res.status(400).json({ error: 'Missing userSignedTxn' });
    }

    if (!sponsorAccount) {
      return res.status(503).json({ 
        error: 'Sponsor account not configured. Please set SPONSOR_MNEMONIC in .env' 
      });
    }

    // Decode user's signed transaction
    const userTxnDecoded = algosdk.decodeSignedTransaction(
      new Uint8Array(Buffer.from(userSignedTxn, 'base64'))
    );

    // Get suggested params for sponsor's fee payment
    const params = await algodClient.getTransactionParams().do();

    // Create sponsor's fee payment transaction (0.001 ALGO to cover user's fee)
    const sponsorFeeTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: sponsorAccount.addr,
      to: userTxnDecoded.txn.from,
      amount: 1000, // 0.001 ALGO to cover the user's transaction fee
      suggestedParams: params,
    });

    // Group transactions atomically
    const txnGroup = [sponsorFeeTxn, userTxnDecoded.txn];
    const groupID = algosdk.computeGroupID(txnGroup);
    
    txnGroup[0].group = groupID;
    txnGroup[1].group = groupID;

    // Sponsor signs their fee payment
    const signedSponsorTxn = algosdk.signTransaction(txnGroup[0], sponsorAccount.sk);

    // Re-sign user's transaction with group ID
    // Note: User must re-sign their transaction with the group ID
    // For now, we'll return the group for the frontend to handle
    
    // Alternative: Use atomic transfer where both transactions are independent
    // Let's use a simpler approach: sponsor just pays extra to user's account beforehand
    
    return res.status(501).json({ 
      error: 'Atomic grouping requires frontend cooperation. Use /api/gasless/sponsor-fee instead.' 
    });

  } catch (err) {
    console.error('Gasless submit error:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * Simpler approach: Rekey user's transactions to sponsor
 * Or: Sponsor co-signs application calls
 */
app.post('/api/gasless/sponsor-transaction', async (req, res) => {
  try {
    const { txnData } = req.body;

    if (!sponsorAccount) {
      return res.status(503).json({ 
        error: 'Sponsor account not configured',
        setup: 'Run: node backend/generateSponsor.js'
      });
    }

    // This endpoint will construct the full transaction with sponsor as fee payer
    const { userAddress, appId, appArgs, accounts = [] } = txnData;

    const params = await algodClient.getTransactionParams().do();
    
    // Override fee to 0 for user, sponsor pays all fees
    params.fee = 0;
    params.flatFee = true;

    // Create user's application call transaction (fee = 0)
    const userTxn = algosdk.makeApplicationNoOpTxnFromObject({
      from: userAddress,
      suggestedParams: params,
      appIndex: appId,
      appArgs: appArgs.map(arg => {
        if (typeof arg === 'string') return new TextEncoder().encode(arg);
        if (typeof arg === 'number') return algosdk.encodeUint64(arg);
        return new Uint8Array(Buffer.from(arg, 'base64'));
      }),
      accounts: accounts || [],
    });

    // Create sponsor's fee payment (covers user's transaction)
    const sponsorParams = await algodClient.getTransactionParams().do();
    sponsorParams.fee = 2000; // 0.002 ALGO (covers both transactions)
    sponsorParams.flatFee = true;

    const sponsorFeeTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: sponsorAccount.addr,
      to: sponsorAccount.addr, // Pay to self, just to add fee to pool
      amount: 0,
      suggestedParams: sponsorParams,
    });

    // Group transactions atomically
    const txnGroup = algosdk.assignGroupID([sponsorFeeTxn, userTxn]);

    // Sponsor signs their transaction
    const signedSponsorTxn = sponsorFeeTxn.signTxn(sponsorAccount.sk);

    // Return unsigned user transaction for user to sign
    return res.json({
      success: true,
      userTxn: Buffer.from(algosdk.encodeUnsignedTransaction(txnGroup[1])).toString('base64'),
      sponsorTxn: Buffer.from(signedSponsorTxn).toString('base64'),
      groupID: Buffer.from(txnGroup[0].group).toString('base64'),
    });

  } catch (err) {
    console.error('Sponsor transaction error:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * Complete atomic transaction submission
 */
app.post('/api/gasless/submit-group', async (req, res) => {
  try {
    const { signedUserTxn, sponsorTxn } = req.body;

    if (!signedUserTxn || !sponsorTxn) {
      return res.status(400).json({ error: 'Missing transaction data' });
    }

    // Decode transactions
    const userTxn = new Uint8Array(Buffer.from(signedUserTxn, 'base64'));
    const sponsorTxnBytes = new Uint8Array(Buffer.from(sponsorTxn, 'base64'));

    // Submit atomic group
    const txGroup = [sponsorTxnBytes, userTxn];
    const { txId } = await algodClient.sendRawTransaction(txGroup).do();

    // Wait for confirmation
    const result = await algosdk.waitForConfirmation(algodClient, txId, 10);

    return res.json({
      success: true,
      txId,
      confirmedRound: result['confirmed-round'],
      message: '✅ Gasless transaction confirmed!',
    });

  } catch (err) {
    console.error('Submit group error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// SPONSOR ACCOUNT INFO
// ═══════════════════════════════════════════════════════════

app.get('/api/sponsor/info', async (req, res) => {
  try {
    if (!sponsorAccount) {
      return res.json({
        configured: false,
        message: 'Sponsor account not configured. Run: node backend/generateSponsor.js',
      });
    }

    const accountInfo = await algodClient.accountInformation(sponsorAccount.addr).do();

    return res.json({
      configured: true,
      address: sponsorAccount.addr,
      balance: accountInfo.amount / 1_000_000,
      minBalance: accountInfo['min-balance'] / 1_000_000,
      availableForFees: (accountInfo.amount - accountInfo['min-balance']) / 1_000_000,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// AI ANOMALY DETECTION
// ═══════════════════════════════════════════════════════════

app.post('/api/ai/anomaly', async (req, res) => {
  try {
    // Forward request to AI backend
    const aiResponse = await fetch('http://localhost:8080/api/ai/anomaly', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });
    
    if (!aiResponse.ok) {
      throw new Error(`AI backend error: ${aiResponse.status}`);
    }
    
    const result = await aiResponse.json();
    res.json(result);
  } catch (err) {
    console.error('AI anomaly detection error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/anomaly/class', async (req, res) => {
  try {
    // Forward request to AI backend
    const aiResponse = await fetch('http://localhost:8080/api/ai/anomaly/class', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });
    
    if (!aiResponse.ok) {
      throw new Error(`AI backend error: ${aiResponse.status}`);
    }
    
    const result = await aiResponse.json();
    res.json(result);
  } catch (err) {
    console.error('AI class anomaly detection error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    gaslessEnabled: !!sponsorAccount,
    sponsorAddress: sponsorAccount?.addr || null,
  });
});

// ═══════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════

app.listen(PORT, () => {
  console.log('\n🚀 CampusTrust AI Backend Server');
  console.log('================================');
  console.log(`📡 Listening on http://localhost:${PORT}`);
  console.log(`🌐 Network: Algorand TestNet`);
  console.log(`🔗 Node: ${ALGOD_SERVER}\n`);
  
  initializeSponsor();
});