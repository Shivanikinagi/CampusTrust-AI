# 🚀 Gasless Transaction Setup Guide

## Quick Start (3 Steps)

### Step 1: Install Backend Dependencies

```powershell
cd backend
npm install
```

### Step 2: Generate & Fund Sponsor Account

```powershell
# Generate sponsor account
npm run generate-sponsor
```

Copy the **mnemonic** and **address** from the output.

Visit https://bank.testnet.algorand.network/ and:
1. Paste the sponsor address
2. Click "Dispense" to get 10 ALGO (free TestNet tokens)

### Step 3: Configure .env

Open `.env` in the root folder and add your sponsor details:

```env
SPONSOR_MNEMONIC="your twenty five word mnemonic phrase here"
SPONSOR_ADDRESS="YOUR_SPONSOR_ADDRESS_HERE"
```

### Step 4: Start Backend Server

```powershell
cd backend
npm start
```

You should see:
```
✅ Sponsor account initialized: YOUR_ADDRESS
💰 Please ensure sponsor account has sufficient ALGO balance
```

### Step 5: Start Frontend

In a new terminal:

```powershell
npm run dev
```

## Testing Gasless Transactions

1. Open the app at http://localhost:5173
2. Connect your Pera wallet
3. Navigate to **Decentralized Voting**
4. Look for the green badge: **⚡ GASLESS ENABLED**
5. Cast a vote - you'll pay ZERO fees!

## Verification

Check the transaction fee status in the election dashboard:
- **With Gasless**: Shows "⚡ FREE"
- **Without Gasless**: Shows "0.001 ALGO"

Check sponsor balance:
Visit http://localhost:5001/api/sponsor/info

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Sponsor account not configured" | Add SPONSOR_MNEMONIC to .env |
| Backend won't start | Run `npm install` in backend folder |
| Port 5001 in use | Change PORT in backend/server.js |
| Gasless not showing | Ensure backend is running |

## How It Works

```
┌─────────────┐     1. User signs      ┌──────────────┐
│             │    their transaction    │              │
│  Frontend   │────────────────────────>│   Backend    │
│             │                         │   (Sponsor)  │
└─────────────┘                         └──────────────┘
                                              │
                                              │ 2. Sponsor adds
                                              │    fee payment
                                              │
                                              v
                                        ┌──────────────┐
                                        │   Algorand   │
                                        │  Blockchain  │
                                        │              │
                                        │ Atomic Group:│
                                        │ • User Txn   │
                                        │ • Fee Txn ✅ │
                                        └──────────────┘
```

---

**Made with ⚡ by CampusTrust AI**
