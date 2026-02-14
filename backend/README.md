# CampusTrust AI - Gasless Transactions Setup

## 🎯 Overview

This backend enables **completely FREE transactions** for users on Algorand blockchain using atomic transfers. The sponsor account pays all transaction fees automatically.

## ⚡ How It Works

1. **User** creates and signs their transaction (vote, credential, etc.)
2. **Sponsor** (backend) creates a fee payment transaction
3. Both transactions are grouped **atomically** - either both succeed or both fail
4. Users experience **zero-cost blockchain interactions**

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Generate Sponsor Account

```bash
npm run generate-sponsor
```

This creates a new Algorand account that will pay all user fees.

### 3. Fund the Sponsor Account

1. Copy the generated address
2. Get TestNet ALGO from: https://bank.testnet.algorand.network/
3. Send **10-50 ALGO** to the sponsor address

### 4. Update .env File

Add the sponsor mnemonic to your `.env` file:

```env
SPONSOR_MNEMONIC="your twenty five word mnemonic phrase here"
SPONSOR_ADDRESS="YOUR_SPONSOR_ADDRESS_HERE"
```

### 5. Start the Backend

```bash
npm start
```

The server will run on `http://localhost:5001`

## 📊 Checking Sponsor Balance

Visit: http://localhost:5001/api/sponsor/info

Response:
```json
{
  "configured": true,
  "address": "SPONSOR_ADDRESS...",
  "balance": 45.5,
  "minBalance": 0.1,
  "availableForFees": 45.4
}
```

## 💡 Usage in Frontend

The frontend automatically detects gasless availability:

```javascript
import { voting, isGaslessEnabled } from './services/contractService.js';

// Check if gasless is available
const gasless = await isGaslessEnabled();

// Vote (automatically uses gasless if available)
await voting.vote(address, proposalIndex, signCallback, appId);
```

## 🔐 Security Notes

1. **Never commit** the `.env` file with sponsor mnemonic
2. Monitor sponsor account balance regularly
3. Implement rate limiting in production
4. Consider multi-sig for sponsor account
5. Use separate sponsor accounts for prod/dev

## 📈 Cost Estimation

Typical TestNet fees:
- Vote: 0.001 ALGO per transaction
- Credential: 0.001 ALGO per issuance
- Attendance: 0.001 ALGO per check-in

With 10 ALGO, sponsor can handle ~10,000 transactions.

## 🛠️ Troubleshooting

### "Sponsor account not configured"
- Run `npm run generate-sponsor`
- Add mnemonic to `.env`
- Restart backend server

### "Sponsor has insufficient balance"
- Check balance: http://localhost:5001/api/sponsor/info
- Fund account from dispenser
- Ensure minimum balance met

### "Gasless backend not available"
- Verify backend is running: `npm start`
- Check VITE_BACKEND_URL in `.env`
- Ensure port 5001 is not in use

## 🌟 Features

✅ **Zero transaction fees** for end users
✅ **Automatic fallback** to regular transactions
✅ **Real-time balance monitoring**
✅ **Atomic transaction groups** (all-or-nothing)
✅ **Production-ready** error handling

---

**Made with ⚡ by CampusTrust AI**
