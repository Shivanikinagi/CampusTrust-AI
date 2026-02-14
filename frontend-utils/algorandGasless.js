import algosdk from 'algosdk';

const API_BASE_URL = 'http://localhost:3001/api/algo'; // Update with your backend URL

/**
 * Execute a Gasless Transaction on Algorand using Atomic Transfers (Fee Pooling)
 * 
 * @param {string} senderAddress - User's wallet address
 * @param {string} receiverAddress - Recipient address
 * @param {number} amountMicroAlgos - Amount to send (in microAlgos)
 * @param {string} note - Optional note (transaction note)
 * @param {Object} algodClient - Initialized Algodv2 client
 * @param {Function} signCallback - Async function that signs the user transaction. 
 *                                  Should accept an array of transaction objects and return array of signed bytes.
 *                                  Example format: signCallback([{ txn: userTxn, signers: [addr] }, ...])
 */
export async function sendGaslessPayment(senderAddress, receiverAddress, amountMicroAlgos, note, algodClient, signCallback) {
  try {
    // 1. Get Sponsor Address from Backend
    const response = await fetch(`${API_BASE_URL}/sponsor/address`);
    const { address: sponsorAddress } = await response.json();

    if (!sponsorAddress) throw new Error("Failed to get sponsor address from backend");

    // 2. Get Network Params
    const params = await algodClient.getTransactionParams().do();

    // 3. Create User Transaction (Fee = 0)
    // We force fee to 0 because the sponsor will pay for it via Fee Pooling
    const userTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: senderAddress,
      receiver: receiverAddress,
      amount: amountMicroAlgos,
      note: note ? new Uint8Array(Buffer.from(note)) : undefined,
      suggestedParams: {
        ...params,
        fee: 0,
        flatFee: true
      }
    });

    // 4. Create Sponsor Transaction (Fee = 2 * MinFee = 2000 microAlgo)
    // This covers both transactions: 1000 for user + 1000 for sponsor
    const sponsorTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: sponsorAddress,
      receiver: sponsorAddress, // Self-payment 
      amount: 0,
      suggestedParams: {
        ...params,
        fee: 2000,
        flatFee: true
      }
    });

    // 5. Group Transactions (Atomic Transfer)
    const txns = [userTxn, sponsorTxn];
    algosdk.assignGroupID(txns);

    // 6. Sign User Transaction
    // Protocol: We prepare the group but only ask user to sign THEIR transaction (index 0).
    // The sponsor transaction (index 1) is left unsigned for the backend.
    
    // Format for wallet connectors (Pera/Defly/WalletConnect)
    const txnsToSign = [
      { txn: userTxn, signers: [senderAddress] }, // User signs this
      { txn: sponsorTxn, signers: [] }            // User does NOT sign this
    ];

    console.log("Requesting signature for gasless transaction...");
    const signedTxns = await signCallback(txnsToSign); 
    
    // Expecting array of signed bytes. Index 0 is user's signed txn.
    const signedUserTxnBytes = signedTxns[0]; 

    if (!signedUserTxnBytes) {
        throw new Error("User declined transaction or signing failed");
    }

    // 7. Send to Backend for Sponsorship & Submission
    // We send:
    // - User's signed transaction (base64)
    // - Sponsor's unsigned transaction (base64) - backend will verify & sign it
    
    const signedUserTxnBase64 = Buffer.from(signedUserTxnBytes).toString('base64');
    const unsignedSponsorTxnBase64 = Buffer.from(algosdk.encodeUnsignedTransaction(sponsorTxn)).toString('base64');

    console.log("Submitting to backend relayer...");
    const submitResponse = await fetch(`${API_BASE_URL}/sponsor/sign-and-submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        signedUserTxns: [signedUserTxnBase64],
        unsignedSponsorTxn: unsignedSponsorTxnBase64
      })
    });

    const result = await submitResponse.json();
    
    if (!result.success) {
        throw new Error(result.error || "Sponsorship failed");
    }

    return result;

  } catch (error) {
    console.error("Gasless transaction error:", error);
    throw error;
  }
}
