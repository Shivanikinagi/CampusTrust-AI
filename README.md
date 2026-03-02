CampusTrust AI
Decentralized Campus Governance Platform on Algorand
A full-stack platform combining AI automation and blockchain-based verification for campus governance — covering elections, credentials, feedback, and attendance management.

Overview
CampusTrust AI addresses fundamental trust and transparency challenges in campus administration. By combining Algorand's blockchain infrastructure with machine learning models, the platform provides tamper-proof records, privacy-preserving feedback, and automated governance workflows without centralized administration.
Network: Algorand TestNet (Pure Proof-of-Stake)
Finality: 3.3 seconds
Transaction Cost: ~$0.001

Deployed Contracts (Algorand TestNet)
ContractApp IDExplorerVoting755505084ViewCredentials755505108ViewFeedback755505141ViewAttendance755505165View
Deployer: DM3C5EZCEA6JFB7BCBTECUQ7JU7UQ3WQA4PEVUU4ERUVLDWNGO6GTR7GNU

Platform Modules
ModuleBlockchain RoleAI RoleDecentralized VotingOne-address-one-vote, tamper-proof tallies, time-bounded electionsProposal quality scoring (completeness, clarity, feasibility)Verifiable CredentialsOn-chain certificate records, instant verificationAuthenticity scoring and credential analysisAnonymous FeedbackSHA-256 hashes stored on-chain; no raw textSentiment analysis, emotion detection, category classificationSmart AttendanceBlockchain-verified check-ins with session time windowsZ-score anomaly detection for proxy preventionSmart PermissionsMulti-signature event approvals (HOD → Faculty → Dean)Conflict detection, budget analysis, venue checksSkill BadgesARC-3 Soulbound NFTs, non-transferableGitHub repo and PDF project analysisCompute MarketplaceP2P resource rental with on-chain paymentsJob matching and resource optimizationResearch CertificationPDF hash timestamping, proof of authorshipNLP peer review, plagiarism detection, quality scoringGovernance DAO3-of-5 multi-sig treasury managementProposal impact analysis and risk assessmentAI AssistantWallet interaction guidanceNatural language query handling

Architecture
┌─────────────────────────────────────────────────────────────┐
│                  React Frontend (16 Components)             │
│        (Vite + TailwindCSS + algosdk + Pera Wallet)         │
├──────────────────────────────────────────────────────────────┤
│  Services Layer                                              │
│  algorandService.js · contractService.js                    │
│  aiService.js · gaslessService.js                           │
├─────────────────┬──────────────────┬────────────────────────┤
│  Algorand       │  Node.js Backend │  Flask AI Engine       │
│  TestNet        │  (Port 3000)     │  (Port 5000)           │
│                 │                  │                        │
│  4 PyTeal       │  Gasless txn     │  Sentiment · Anomaly   │
│  Contracts      │  sponsorship     │  NLP · Automation      │
└─────────────────┴──────────────────┴────────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  Expo React Native │
                    │  iOS & Android     │
                    └────────────────────┘

Tech Stack
LayerTechnologyBlockchainAlgorand TestNet via AlgoNode APISmart ContractsPyTeal → TEAL v8FrontendReact 19 + Vite 7 + TailwindCSS 3Blockchain SDKalgosdk v3.5.2WalletPera Wallet Connect v1.5.0AI / MLTextBlob, scikit-learn, numpyAI BackendPython 3.10+ · Flask 3.0 + Flask-CORS + Flask-SocketIOBackend ServerNode.js · ExpressMobileExpo 54 + React NativePDF ProcessingPyPDF2 3.0ChartsRecharts 2.12

Smart Contracts
Voting Contract — Manages elections with up to 10 proposals, time-bounded voting windows, and double-vote prevention via on-chain local state. Operations: opt_in (register), vote, finalize.
Credential Contract — Issues and revokes verifiable credentials as on-chain records. Stores credential hash and AI authenticity score. Only the admin account can issue or revoke; all actions produce an immutable audit trail.
Feedback Contract — Stores only SHA-256 hashes of submitted feedback — no raw text is ever written on-chain. Tracks aggregate sentiment statistics and allows sessions to be opened and closed.
Attendance Contract — Manages timed check-in windows per course session. Tracks attendance streaks and supports on-chain anomaly flags triggered by the AI engine.

AI Engine
Sentiment Analyzer — TextBlob polarity mapped to a 0–100 score with emotion detection and automatic category classification across six domains.
Anomaly Detector — Z-score analysis on check-in timestamps combined with gap detection and frequency analysis to produce a composite proxy-attendance risk score.
NLP Processor — TF-based key phrase extraction, proposal quality scoring, cosine similarity for duplicate detection, and structure analysis for research papers.
GitHub Analyzer — Fetches repository data via the GitHub API and analyzes language distribution, file structure, and activity metrics to verify skill badge eligibility.
PDF Extractor — Extracts and validates text from uploaded PDFs using PyPDF2, then feeds content into downstream analysis pipelines.
Research Reviewer — NLP-powered peer review covering writing quality, plagiarism detection, technical accuracy (45+ domain terms), and context-aware feedback generation.
Automation Engine — Six pre-built rules with event, threshold, and time-based triggers covering election finalization, feedback management, anomaly flagging, credential issuance, and session management.

Project Structure
CampusTrust-AI/
├── smart_contracts/       # PyTeal contracts and deployment scripts
├── ai_engine/             # Flask AI backend
│   ├── app.py
│   ├── sentiment_analyzer.py
│   ├── anomaly_detector.py
│   ├── nlp_processor.py
│   └── ai_automation.py
├── backend/               # Node.js gasless transaction server
├── services/              # Frontend service layer
├── components/            # 16 React components
├── mobile/                # Expo React Native app
├── compiled_contracts/    # Compiled TEAL output
├── deployments/           # Deployment records and proofs
├── scripts/               # Deployment and verification scripts
└── test/                  # AI accuracy tests

Setup
Prerequisites

Node.js 18+
Python 3.10+
Algorand TestNet account (faucet)
Pera Wallet mobile app (optional)

1. Install frontend dependencies
bashnpm install
2. Set up the AI backend
bashcd ai_engine
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m textblob.download_corpora
3. Set up the gasless transaction backend
bashcd backend
npm install
npm run generate-sponsor
# Fund the generated sponsor address at https://bank.testnet.algorand.network/
4. Configure environment variables
Create a .env file in the project root:
envVITE_ALGORAND_NETWORK=testnet
VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
VITE_INDEXER_SERVER=https://testnet-idx.algonode.cloud

VITE_VOTING_APP_ID=755505084
VITE_CREDENTIAL_APP_ID=755505108
VITE_FEEDBACK_APP_ID=755505141
VITE_ATTENDANCE_APP_ID=755505165

# Optional — gasless transactions
SPONSOR_MNEMONIC="your twenty five word sponsor mnemonic phrase here"
SPONSOR_ADDRESS="YOUR_SPONSOR_ADDRESS"
5. Run the stack
bashnpm run dev           # Frontend only
npm run dev:full      # Frontend + AI backend
npm run dev:gasless   # Frontend + AI backend + gasless server
ServiceURLFrontendhttp://localhost:5173AI Backendhttp://localhost:5000Gasless Serverhttp://localhost:3000
6. Compile and deploy contracts (optional)
bashcd smart_contracts
pip install -r requirements.txt
python compile_contracts.py
python deploy.py
Update .env with the new App IDs after deployment.
7. Mobile app (optional)
bashcd mobile && npm install && npx expo start

API Reference
AI Backend (localhost:5000)
MethodEndpointDescriptionPOST/api/ai/sentimentAnalyze feedback sentimentPOST/api/ai/anomalyDetect attendance anomaliesPOST/api/ai/nlp/keyphrasesExtract key phrasesPOST/api/ai/proposal/scoreScore voting proposalsPOST/api/ai/credential/analyzeAnalyze credential authenticityPOST/api/ai/github/analyzeAnalyze a GitHub repositoryPOST/api/ai/pdf/extractExtract and analyze PDF contentPOST/api/ai/research/reviewAI peer review for research papersGET/api/ai/automation/dashboardAutomation engine statsGET/api/ai/healthHealth check
Gasless Backend (localhost:3000)
MethodEndpointDescriptionPOST/api/sponsor/transactionSubmit a transaction for sponsorshipGET/api/sponsor/statusCheck sponsor account status

Design Decisions
Why Algorand? Pure Proof-of-Stake consensus provides 3.3-second finality, sub-cent transaction fees, and native support for atomic transfers, multi-signature accounts, and custom assets — removing the need for workarounds common on other chains.
Privacy-first feedback. Raw text is never written on-chain. Only SHA-256 hashes are stored, while AI processes text server-side and publishes aggregate statistics. This provides a tamper-evident audit trail without exposing personally identifiable information.
Hybrid AI + blockchain. Inference runs off-chain to avoid gas costs and latency, but every AI decision is recorded on-chain. This keeps computation efficient while maintaining a fully auditable record of automated actions.
Graceful degradation. The frontend operates in demo mode without a connected wallet, running AI backend, or deployed contracts, allowing independent evaluation of each layer.

Testing
bash# AI accuracy tests (open in browser)
open test/ai-accuracy-test.html

# Smart contract unit tests
cd smart_contracts && python -m pytest test/

# System diagnostics
node scripts/verifySetup.js

Troubleshooting
AI backend not connecting — Ensure the virtual environment is active and Flask is running on port 5000. Run pip install -r ai_engine/requirements.txt if dependencies are missing.
Gasless transactions failing — Verify the sponsor account has sufficient ALGO and that SPONSOR_MNEMONIC and SPONSOR_ADDRESS are correctly set in .env.
Pera Wallet not connecting — Confirm the mobile device and computer are on the same network. Use Demo Mode for wallet-free testing.
Transactions rejected — Check that the account holds at least 0.1 ALGO and has opted into the application before interacting.
Frontend not starting — Verify Node.js 18+, clear node_modules with rm -rf node_modules && npm install, and ensure port 5173 is available.
Contract deployment failing — The deployer account needs at least 1 ALGO. Verify the mnemonic in .env and network connectivity to Algorand TestNet.

Roadmap
Q2 2026 — Mainnet deployment; fine-tuned transformer models; biometric attendance via TensorFlow.js.
Q3 2026 — Enterprise API integrations (Banner, PeopleSoft); multi-institution credential validation; GDPR/FERPA compliance frameworks.
Q4 2026 — Predictive analytics for student sentiment; AI-generated governance proposals; campus payment integration.
2027 — W3C DID implementation; self-sovereign academic credentials; zero-knowledge proof verification.

Contributing

Fork the repository
Create a feature branch: git checkout -b feature/your-feature
Commit with a clear message: git commit -m 'Add your feature'
Push and open a pull request

Follow existing code conventions, include tests for new functionality, and update documentation accordingly.

License
MIT — see LICENSE for details.
