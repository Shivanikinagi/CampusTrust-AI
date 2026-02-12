# CampusTrust AI

**AI-Powered Decentralized Campus Governance & Verification Platform on Algorand**

> Hackspiration'26 — Track 2: AI and Automation in Blockchain  
> Team: VIT Pune

---

## Problem Statement

Campus institutions face persistent issues with **trust, transparency, and verification** in everyday activities — from elections prone to manipulation, to paper certificates that are easily forged, unactionable feedback, and proxy attendance. Existing systems are centralized, opaque, and lack any intelligent automation.

## Our Solution

**CampusTrust AI** is a full-stack decentralized platform that brings **AI intelligence** and **Algorand blockchain immutability** to campus governance. We built four interconnected modules:

| Module | Blockchain Role | AI Role |
|--------|----------------|---------|
| **Decentralized Voting** | One-student-one-vote enforced on-chain, tamper-proof tallies | AI scores proposal quality (completeness, clarity, feasibility) |
| **Verifiable Credentials** | Certificates as on-chain records, instant verification | AI authenticity scoring and credential analysis |
| **Anonymous Feedback** | SHA-256 hashes on-chain (text never stored) | Real-time sentiment analysis, emotion detection, category classification |
| **Smart Attendance** | Blockchain-verified check-ins with time windows | AI anomaly detection for proxy prevention (Z-score, pattern analysis) |

All four modules share a **Smart Automation Engine** that triggers contract actions based on AI-evaluated conditions — no centralized admin needed.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  React Frontend                  │
│        (Vite + TailwindCSS + algosdk)           │
├─────────────────┬───────────────────────────────┤
│  Services Layer │   Components (8 modules)       │
│  - algorandService.js (SDK wrapper)             │
│  - contractService.js (contract interactions)    │
│  - aiService.js (AI backend client)             │
├─────────────────┴───────────────────────────────┤
│                                                  │
│  ┌──────────────┐       ┌────────────────────┐  │
│  │   Algorand   │       │   AI Engine (Flask) │  │
│  │   TestNet    │       │   - Sentiment       │  │
│  │              │       │   - Anomaly Det.    │  │
│  │  4 PyTeal    │◄─────►│   - NLP Processing  │  │
│  │  Contracts   │       │   - Automation      │  │
│  └──────────────┘       └────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Blockchain** | Algorand TestNet (AlgoNode) |
| **Smart Contracts** | PyTeal → TEAL v8 |
| **Frontend** | React 19 + Vite + TailwindCSS |
| **Blockchain SDK** | algosdk (JavaScript) |
| **Wallet** | Pera Wallet Connect + Demo mode |
| **AI/ML** | TextBlob (NLP), scikit-learn (anomaly), numpy |
| **AI Backend** | Python Flask + Flask-CORS |
| **Automation** | Rule-based engine with event/threshold/time triggers |

---

## Smart Contracts (PyTeal)

### 1. Voting Contract
- **State**: Election name, proposals (up to 10), vote counts, time bounds
- **Logic**: `opt_in` → register voter, `"vote"` → cast (one-student-one-vote), `"finalize"` → lock results
- **Guarantee**: Double-voting prevention via local state, time-bound enforcement

### 2. Credential Contract
- **State**: Admin, institution, total issued/revoked, per-student credential records
- **Logic**: `"issue"` → record credential hash + AI score, `"revoke"` → invalidate, `"update_score"` → refresh AI score
- **Guarantee**: Only admin can issue/revoke, immutable audit trail

### 3. Feedback Contract
- **State**: Topic, aggregate sentiment stats, positive/negative/neutral counts
- **Logic**: `"submit"` → store feedback hash + AI sentiment (0-100), `"close"`/`"reopen"` → manage sessions
- **Guarantee**: One submission per address, only hashes stored (privacy-preserving)

### 4. Attendance Contract
- **State**: Course, session tracking, total sessions/check-ins
- **Logic**: `"start_session"` → begin timed window, `"checkin"` → verify within window, `"flag_anomaly"` → AI-triggered on-chain flag
- **Guarantee**: Time-window enforcement, streak tracking, anomaly records on-chain

---

## AI Engine

### Sentiment Analyzer
- TextBlob polarity → 0-100 score
- Emotion detection (satisfaction, frustration, praise, etc.)
- Auto-category classification (teaching, infrastructure, curriculum, administration, campus_life, examination)

### Anomaly Detector
- Z-score analysis on check-in timestamps
- Gap detection (irregular patterns)
- Frequency analysis (proxy detection)
- Composite risk scoring (0-100) → low/medium/high risk flags

### NLP Processor
- TF-based key phrase extraction with bigram/trigram support
- Proposal quality scoring (completeness, clarity, specificity, feasibility → /100)
- Cosine similarity for duplicate detection
- Extractive summarization

### Automation Engine
- 6 pre-built rules: auto-finalize elections, auto-close feedback, auto-flag anomalies, auto-issue credentials, negative sentiment alerts, auto-end sessions
- Event, threshold, and time-based triggers
- Execution logging and dashboard

---

## Project Structure

```
CampusTrust-AI/
├── smart_contracts/           # PyTeal smart contracts
│   ├── voting_contract.py
│   ├── credential_contract.py
│   ├── feedback_contract.py
│   ├── attendance_contract.py
│   ├── compile_contracts.py   # Compiles PyTeal → TEAL
│   ├── deploy.py              # Deploys to Algorand TestNet
│   └── requirements.txt
├── ai_engine/                 # Python AI backend
│   ├── app.py                 # Flask API server (port 5001)
│   ├── sentiment_analyzer.py
│   ├── anomaly_detector.py
│   ├── nlp_processor.py
│   ├── ai_automation.py
│   └── requirements.txt
├── services/                  # Frontend service layer
│   ├── algorandService.js     # Algorand SDK wrapper
│   ├── contractService.js     # Contract interaction layer
│   └── aiService.js           # AI backend client
├── components/                # React UI components
│   ├── Navbar.jsx
│   ├── Dashboard.jsx
│   ├── WalletConnect.jsx
│   ├── VotingSystem.jsx
│   ├── CredentialManager.jsx
│   ├── FeedbackSystem.jsx
│   ├── AttendanceTracker.jsx
│   └── AIAnalytics.jsx
├── App.jsx                    # Root component
├── main.jsx                   # React entry point
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── .env.example
```

---

## Setup & Run

### Prerequisites
- Node.js 18+
- Python 3.10+
- Algorand TestNet account (get free ALGO from [TestNet Faucet](https://bank.testnet.algorand.network/))

### 1. Install Frontend Dependencies
```bash
npm install
```

### 2. Setup AI Backend
```bash
cd ai_engine
pip install -r requirements.txt
python -m textblob.download_corpora
python app.py
```
AI backend runs on `http://localhost:5001`

### 3. (Optional) Compile & Deploy Smart Contracts
```bash
cd smart_contracts
pip install -r requirements.txt
python compile_contracts.py
# Set ALGORAND_MNEMONIC in .env, then:
python deploy.py
```

### 4. Start Frontend
```bash
npm run dev
```
Opens at `http://localhost:5173`

### 5. Full Stack (concurrent)
```bash
npm run dev:full
```

---

## Key Design Decisions

1. **Privacy-First Feedback**: Text is never stored on-chain — only SHA-256 hashes. AI processes text server-side and publishes only aggregate statistics.

2. **Hybrid AI + Blockchain**: AI runs off-chain for efficiency, but all AI decisions (sentiment scores, anomaly flags, quality scores) are recorded on-chain for transparency and auditability.

3. **Algorand Advantages**: ~3.5s finality, ~0.001 ALGO fees, carbon-negative — ideal for high-frequency campus operations.

4. **Demo Mode**: Users can explore all features without a wallet — makes hackathon judging frictionless.

5. **Graceful Degradation**: Frontend works in demo mode even without AI backend or deployed contracts.

---

## Track 2 Alignment

> "AI and Automation in Blockchain: Build solutions for campus activity coordination, voting systems, anonymous feedback mechanisms, or certification issuance — focusing on trust, verification, and privacy-preserving systems with simple automation."

| Requirement | Our Implementation |
|------------|-------------------|
| Campus voting | Decentralized elections with one-student-one-vote on Algorand |
| Anonymous feedback | SHA-256 hashed feedback with AI sentiment on-chain |
| Certification issuance | Verifiable credentials with AI authenticity scoring |
| Trust & verification | Immutable blockchain records, cryptographic verification |
| Privacy-preserving | Zero PII on-chain, hash-only feedback storage |
| Simple automation | 6-rule automation engine with event/threshold triggers |
| AI integration | Sentiment analysis, anomaly detection, NLP scoring, automation |
| Algorand blockchain | All 4 contracts deployed on Algorand TestNet |

---

## License

MIT