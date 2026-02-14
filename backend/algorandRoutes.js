const express = require('express');
const router = express.Router();
const algorandSponsorshipService = require('./algorandSponsorshipService');

/**
 * GET /api/algo/sponsor/address
 * Returns the sponsor wallet address so the frontend can construct the group transaction.
 */
router.get('/sponsor/address', (req, res) => {
  try {
    const address = algorandSponsorshipService.getSponsorAddress();
    res.json({ address });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/algo/sponsor/sign-and-submit
 * Accepts signed user transactions and an unsigned sponsor transaction.
 * Signs the sponsor transaction and submits the group to the network.
 */
router.post('/sponsor/sign-and-submit', async (req, res) => {
  try {
    const { signedUserTxns, unsignedSponsorTxn } = req.body;

    if (!signedUserTxns || !Array.isArray(signedUserTxns) || !unsignedSponsorTxn) {
      return res.status(400).json({ 
        error: "Missing signedUserTxns (array) or unsignedSponsorTxn (string)" 
      });
    }

    console.log(`📥 Received sponsorship request for ${signedUserTxns.length} user txns`);

    const result = await algorandSponsorshipService.executeGroupTransaction(
      signedUserTxns, 
      unsignedSponsorTxn
    );

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Sponsorship error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
