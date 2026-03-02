🎓 CampusTrust AI
AI-Powered Decentralized Campus Governance Platform

CampusTrust AI is a full-stack platform that combines Blockchain (Algorand) and Artificial Intelligence to bring transparency, trust, and automation to campus management systems.

It enables secure handling of elections, credentials, feedback, and attendance without relying on centralized authorities.

🚀 Overview

Campus institutions often face issues like:

❌ Lack of transparency in elections

❌ Fake certificates

❌ Biased or ignored feedback

❌ Proxy attendance

👉 CampusTrust AI solves these using:

🔗 Blockchain → Immutable, tamper-proof records

🤖 AI Models → Automation & insights

⚡ Fast, low-cost transactions

⚡ Key Highlights

🔗 Blockchain: Algorand TestNet (Pure Proof-of-Stake)

⏱️ Finality: ~3.3 seconds

💰 Cost: ~$0.001 per transaction

🧠 AI Accuracy: 92%

📱 Platforms: Web + Mobile (React Native)

📜 Deployed Smart Contracts
Module	App ID
🗳️ Voting	755505084
🎓 Credentials	755505108
💭 Feedback	755505141
📅 Attendance	755505165

📍 Deployer Address:
DM3C5EZCEA6JFB7BCBTECUQ7JU7UQ3WQA4PEVUU4ERUVLDWNGO6GTR7GNU

🧩 Platform Modules
🗳️ Decentralized Voting

One-user-one-vote system

Tamper-proof election results

Time-bound voting

👉 AI evaluates proposal quality

🎓 Verifiable Credentials

Certificates stored on blockchain

Instant verification

Immutable audit trail

👉 AI checks authenticity

💭 Anonymous Feedback

Only SHA-256 hashes stored on-chain

No raw data stored

👉 AI performs sentiment & emotion analysis

📅 Smart Attendance

Time-based attendance tracking

Blockchain-verified check-ins

👉 AI detects proxy attendance

📋 Smart Permissions

Multi-signature approvals (HOD → Faculty → Dean)

👉 AI checks conflicts & feasibility

💻 Compute Marketplace

Peer-to-peer GPU/CPU sharing

Blockchain payments

👉 AI optimizes resource matching

📄 Research Certification

PDF hash stored on blockchain

Proof of authorship

👉 AI performs peer review & plagiarism detection

🏛️ Governance DAO

Multi-signature decision making (3/5 approvals)

👉 AI analyzes proposal impact

🤖 AI Assistant

Helps users interact with the platform

Natural language queries

🏗️ Architecture
Frontend (React + TailwindCSS)
        │
        ▼
Services Layer (API Integration)
        │
 ┌───────────────┬───────────────┬───────────────┐
 │               │               │               │
 ▼               ▼               ▼               ▼
Blockchain     Backend        AI Engine       Mobile
(Algorand)     (Node.js)      (Flask)         (React Native)

Smart Contracts  Gasless Txn   NLP, ML Models   iOS + Android
(PyTeal)
🛠️ Tech Stack
Layer	Technology
💻 Frontend	React, Vite, TailwindCSS
🔙 Backend	Node.js, Express
🤖 AI	Python, Flask, TextBlob, scikit-learn
🔗 Blockchain	Algorand
📜 Contracts	PyTeal
📱 Mobile	React Native (Expo)
🧠 AI Capabilities

😊 Sentiment Analysis

⚠️ Anomaly Detection

🧾 NLP Processing

📊 Automation Engine

📄 PDF Analysis & Research Review

🐙 GitHub Repository Analysis

📂 Project Structure
CampusTrust-AI/
├── smart_contracts/   # Blockchain contracts
├── ai_engine/         # AI backend (Flask)
├── backend/           # Node.js server
├── components/        # React UI
├── services/          # API services
├── mobile/            # React Native app
├── scripts/           # Utility scripts
└── test/              # Testing
⚙️ Setup & Installation
1️⃣ Clone the Repository
git clone https://github.com/your-username/CampusTrust-AI.git
cd CampusTrust-AI
2️⃣ Install Frontend
npm install
3️⃣ Setup AI Backend
cd ai_engine
python -m venv venv

# Activate
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
python -m textblob.download_corpora
4️⃣ Setup Backend
cd backend
npm install
5️⃣ Configure Environment Variables

Create .env file:

VITE_ALGORAND_NETWORK=testnet
VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
VITE_INDEXER_SERVER=https://testnet-idx.algonode.cloud

VITE_VOTING_APP_ID=755505084
VITE_CREDENTIAL_APP_ID=755505108
VITE_FEEDBACK_APP_ID=755505141
VITE_ATTENDANCE_APP_ID=755505165
6️⃣ Run Application
npm run dev           # Frontend
npm run dev:full      # Frontend + AI
npm run dev:gasless   # Full stack
🔐 Security & Privacy

🔒 No sensitive data stored on-chain

🔑 Feedback stored as hashes

📜 Immutable blockchain records

🧾 Fully auditable system

📈 Future Scope

🚀 Mainnet deployment

🤖 Advanced AI models (Transformers)

🪪 Decentralized Identity (DID)

📱 Native mobile apps

🔮 Predictive analytics

🤝 Contributing

Fork the repository

Create a branch

Commit changes

Open a Pull Request

📄 License

MIT License
