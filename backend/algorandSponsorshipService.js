const algosdk = require('algosdk');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Sponsor Wallet Configuration (Using environment variables)
// In production, use a secure key management system
const SPONSOR_MNEMONIC = process.env.ALGORAND_SPONSOR_MNEMONIC;

class AlgorandSponsorshipService {
  constructor() {
    this.algodClient = new algosdk.Algodv2(
      process.env.ALGOD_TOKEN || '', 
      process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud', 
      process.env.ALGOD_PORT || ''
    );
    
    // Recover sponsor account
    try {
      if (!SPONSOR_MNEMONIC) {
        throw new Error('ALGORAND_SPONSOR_MNEMONIC not set in .env file');
      }
      this.sponsorAccount = algosdk.mnemonicToSecretKey(SPONSOR_MNEMONIC);
      console.log(`✅ Algorand Sponsor Service initialized`);
      console.log(`   Sponsor Address: ${this.sponsorAccount.addr}`);
    } catch (e) {
      console.error('❌ Failed to initialize sponsor wallet:', e.message);
      console.log('   Gasless Algorand transactions will not be available');
      this.sponsorAccount = null;
    }
  }

  /**
   * Sponsor a user transaction (Fee Pooling)
   * The user sends their signed transaction (with fee=0).
   * The sponsor creates a payment to itself with fee=2*minFee.
   * Both are grouped and submitted.
   * 
   * @param {Uint8Array} userTxnBytes - The encoded signed transaction from the user (or base64 string)
   */
  async sponsorTransaction(userTxnBlob) {
    try {
      // 1. Decode the user transaction
      // Expecting a base64 string or buffer
      const txnBytes = typeof userTxnBlob === 'string' 
        ? Buffer.from(userTxnBlob, 'base64') 
        : userTxnBlob;
        
      const userTxnObj = algosdk.decodeSignedTransaction(txnBytes);
      const userTxn = userTxnObj.txn;

      // Validate: Ensure user fee is 0 (or low) if they claim gasless
      if (userTxn.fee > 0) {
        console.warn("⚠️ User transaction has a fee, but requested sponsorship.");
      }

      // 2. Get suggested params
      const params = await this.algodClient.getTransactionParams().do();

      // 3. Create Sponsor Transaction (Tx2)
      // Pay 0 ALGO to self, but pay 2x Fee (0.002 ALGO) to cover both
      const sponsorTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: this.sponsorAccount.addr,
        to: this.sponsorAccount.addr, // Self-payment
        amount: 0,
        suggestedParams: {
          ...params,
          fee: 2000, // Cover 2 transactions (1000 * 2)
          flatFee: true
        }
      });

      // 4. Assign Group ID
      // We need to re-assign group ID because the user signed a specific group ID?
      // Actually, standard flow: user requests params/address -> builds group -> signs.
      // 
      // Simplified Flow for "Relayer" style:
      // If user sends a raw/unsigned txn logic, we group here.
      // But user must sign the GroupID.
      //
      // CORRECT ATOMIC TRANSFER FLOW:
      // 1. User requests "Sponsor Address" from API.
      // 2. User constructs [Tx1(User), Tx2(Sponsor)].
      // 3. User signs Tx1.
      // 4. User sends [Tx1_Signed, Tx2_Unsigned] to backend.
      // 5. Backend checks Tx2 (verifies it pays fee), valid txn.
      // 6. Backend signs Tx2.
      // 7. Backend submits.

      // For this function, let's assume we receive the fully constructed group, 
      // where Tx1 is signed by user, and Tx2 is unsigned (or we reconstruct Tx2).
      
      throw new Error("For Atomic Transfers, usage of /api/algo/execute-group is required.");

    } catch (error) {
      console.error('Sponsorship failed:', error);
      throw error;
    }
  }

  /**
   * Execute a Pre-Grouped Sponsored Transaction
   * @param {Array} signedUserTxns - Array of base64 encoded signed user txns
   * @param {string} unsignedSponsorTxnBase64 - Base64 encoded unsigned sponsor txn
   */
  async executeGroupTransaction(signedUserTxns, unsignedSponsorTxnBase64) {
    try {
      // Decode user txns
      const signedTxns = signedUserTxns.map(t => 
        Buffer.from(t, 'base64')
      );

      // Decode sponsor txn
      const sponsorTxnBytes = Buffer.from(unsignedSponsorTxnBase64, 'base64');
      const sponsorTxn = algosdk.decodeUnsignedTransaction(sponsorTxnBytes);

      // Verify Sponsor Txn
      if (sponsorTxn.sender.toString() !== this.sponsorAccount.addr) {
        throw new Error("Sponsor transaction sender does not match server wallet");
      }

      // Sign Sponsor Txn
      const signedSponsorTxn = sponsorTxn.signTxn(this.sponsorAccount.sk);

      // Assemble Group
      // The group ID is already embedded in the transactions by the frontend
      // We just need to order them correctly.
      // Assuming layout: [UserTx... , SponsorTx]
      
      const txnsToSubmit = [...signedTxns, signedSponsorTxn];

      // Submit
      const { txId } = await this.algodClient.sendRawTransaction(txnsToSubmit).do();
      console.log(`🚀 Sponsored Group Transaction submitted: ${txId}`);

      // Wait for confirmation
      await algosdk.waitForConfirmation(this.algodClient, txId, 4);

      return {
        success: true,
        txId: txId,
        explorerUrl: `https://testnet.explorer.perawallet.app/tx/${txId}`
      };

    } catch (error) {
      console.error("❌ Error executing sponsored group:", error);
      return { success: false, error: error.message };
    }
  }

  getSponsorAddress() {
    return this.sponsorAccount.addr;
  }
}

module.exports = new AlgorandSponsorshipService();
