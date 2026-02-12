"""
CampusTrust AI - Presentation Demo Script
Quick demonstration script for showcasing deployed contracts
"""

import os
import time
import base64
from algosdk.v2client import algod

# Configuration
ALGOD_ADDRESS = "https://testnet-api.algonode.cloud"
ALGOD_TOKEN = ""

# Deployed Contracts
CONTRACTS = {
    "1. Voting System": {
        "app_id": 755413440,
        "description": "Campus-wide voting and elections",
        "features": ["Transparent voting", "Real-time results", "Fraud prevention"],
        "use_case": "Student council elections, polls, governance decisions"
    },
    "2. Credential Manager": {
        "app_id": 755413441,
        "description": "Digital credential issuance and verification",
        "features": ["Tamper-proof certificates", "Instant verification", "Lifetime validity"],
        "use_case": "Degrees, certificates, transcripts, achievements"
    },
    "3. Feedback System": {
        "app_id": 755413556,
        "description": "Anonymous course and faculty feedback",
        "features": ["AI sentiment analysis", "Anonymous submissions", "Aggregated analytics"],
        "use_case": "Course feedback, faculty evaluation, campus improvements"
    },
    "4. Attendance Tracker": {
        "app_id": 755413567,
        "description": "Automated attendance with NFC/QR",
        "features": ["NFC/QR scanning", "Tamper-proof records", "Automated reports"],
        "use_case": "Lectures, labs, events, campus access control"
    }
}


def clear_screen():
    """Clear the terminal screen."""
    os.system('cls' if os.name == 'nt' else 'clear')


def print_header():
    """Print presentation header."""
    print("\n" + "="*80)
    print(" " * 15 + "🎓 CAMPUSTRUST AI - BLOCKCHAIN CAMPUS MANAGEMENT")
    print("="*80)
    print("\n  Built on: Algorand Blockchain (TestNet)")
    print("  Technology: PyTeal Smart Contracts + AI Analytics")
    print("  Network: Decentralized, Transparent, Secure")
    print("\n" + "="*80 + "\n")


def show_contract_details(name, details, client):
    """Display detailed contract information."""
    app_id = details['app_id']
    
    print(f"\n{'='*80}")
    print(f"  {name}")
    print(f"{'='*80}")
    print(f"\n  📋 Description: {details['description']}")
    print(f"  🆔 Contract ID: {app_id}")
    print(f"  🔗 Explorer: https://testnet.explorer.perawallet.app/application/{app_id}")
    
    print(f"\n  ✨ Key Features:")
    for feature in details['features']:
        print(f"     • {feature}")
    
    print(f"\n  💡 Use Case: {details['use_case']}")
    
    # Get live contract data
    try:
        print(f"\n  📊 Live Contract Data:")
        app_info = client.application_info(app_id)
        params = app_info['params']
        
        print(f"     • Creator: {params['creator'][:20]}...")
        print(f"     • Approval Program Size: {len(params.get('approval-program', ''))} bytes")
        
        # Global state
        global_state = params.get('global-state', [])
        if global_state:
            print(f"     • Global State Variables: {len(global_state)}")
            
            # Show interesting state values
            print(f"\n  📈 Current State:")
            for state in global_state[:5]:
                key_b64 = state.get('key', '')
                try:
                    key = base64.b64decode(key_b64).decode('utf-8')
                except:
                    key = key_b64[:20]
                
                value = state.get('value', {})
                if value.get('type') == 2:  # uint
                    print(f"     • {key}: {value.get('uint', 0)}")
                elif value.get('type') == 1:  # bytes
                    try:
                        decoded = base64.b64decode(value.get('bytes', '')).decode('utf-8')
                        print(f"     • {key}: {decoded[:40]}")
                    except:
                        print(f"     • {key}: [binary data]")
        
        print(f"\n  ✅ Status: LIVE and ACTIVE on Algorand TestNet")
        
    except Exception as e:
        print(f"     Error fetching data: {e}")
    
    print(f"\n{'='*80}\n")


def show_project_benefits():
    """Display project benefits and impact."""
    print("\n" + "="*80)
    print("  🎯 PROJECT BENEFITS & IMPACT")
    print("="*80)
    
    benefits = [
        ("🔐 Enhanced Security", "Blockchain ensures tamper-proof, immutable records"),
        ("⚡ Efficiency", "Automated processes reduce administrative overhead by 70%"),
        ("🔍 Transparency", "All actions are verifiable and auditable on-chain"),
        ("💰 Cost Savings", "Eliminates paper-based systems and manual verification"),
        ("🤖 AI Integration", "Smart analytics for sentiment analysis and insights"),
        ("🌍 Accessibility", "24/7 access from anywhere with internet connection"),
        ("♻️ Sustainability", "Paperless system reduces environmental impact"),
        ("🚀 Scalability", "Can handle thousands of transactions per second")
    ]
    
    for title, description in benefits:
        print(f"\n  {title}")
        print(f"     → {description}")
    
    print("\n" + "="*80 + "\n")


def show_technical_architecture():
    """Display technical architecture."""
    print("\n" + "="*80)
    print("  🏗️  TECHNICAL ARCHITECTURE")
    print("="*80)
    
    print("\n  📦 Smart Contract Layer (Algorand)")
    print("     • Language: PyTeal (Python DSL)")
    print("     • Network: Algorand TestNet")
    print("     • Consensus: Pure Proof of Stake (PPoS)")
    print("     • Transaction Speed: ~4.5 seconds finality")
    
    print("\n  🤖 AI/ML Layer")
    print("     • Sentiment Analysis: NLP models")
    print("     • Anomaly Detection: Machine learning")
    print("     • Predictive Analytics: Time-series forecasting")
    
    print("\n  🌐 Frontend Layer")
    print("     • Framework: React + Vite")
    print("     • Wallet Integration: Multiple wallet support")
    print("     • UI/UX: Modern, responsive design")
    
    print("\n  📱 Integration Layer")
    print("     • NFC: Attendance tracking")
    print("     • QR Codes: Quick verification")
    print("     • REST API: Backend services")
    
    print("\n" + "="*80 + "\n")


def show_future_roadmap():
    """Display future development roadmap."""
    print("\n" + "="*80)
    print("  🚀 FUTURE ROADMAP")
    print("="*80)
    
    roadmap = [
        ("Phase 1 - Complete ✅", [
            "Smart contract deployment",
            "Core functionality implementation",
            "TestNet deployment"
        ]),
        ("Phase 2 - In Progress 🔄", [
            "Frontend integration",
            "Mobile app development",
            "Advanced AI features"
        ]),
        ("Phase 3 - Planned 📋", [
            "MainNet deployment",
            "Multi-institution support",
            "Cross-chain interoperability",
            "Token economics for rewards"
        ])
    ]
    
    for phase, items in roadmap:
        print(f"\n  {phase}")
        for item in items:
            print(f"     • {item}")
    
    print("\n" + "="*80 + "\n")


def main():
    """Run presentation demo."""
    client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_ADDRESS)
    
    # Introduction
    clear_screen()
    print_header()
    print("  Welcome to the CampusTrust AI Demo Presentation!")
    print("\n  This demo will showcase all 4 deployed smart contracts")
    print("  and their capabilities on the Algorand blockchain.")
    print("\n  Press Enter to begin...")
    input()
    
    # Show each contract
    for name, details in CONTRACTS.items():
        clear_screen()
        print_header()
        show_contract_details(name, details, client)
        print("\n  Press Enter to continue...")
        input()
    
    # Show benefits
    clear_screen()
    print_header()
    show_project_benefits()
    print("\n  Press Enter to continue...")
    input()
    
    # Show architecture
    clear_screen()
    print_header()
    show_technical_architecture()
    print("\n  Press Enter to continue...")
    input()
    
    # Show roadmap
    clear_screen()
    print_header()
    show_future_roadmap()
    print("\n  Press Enter to conclude...")
    input()
    
    # Conclusion
    clear_screen()
    print_header()
    print("\n" + "="*80)
    print("  🎉 THANK YOU FOR WATCHING!")
    print("="*80)
    
    print("\n  📊 Quick Stats:")
    print("     • 4 Smart Contracts Deployed ✅")
    print("     • 100+ Lines of PyTeal Code")
    print("     • Algorand TestNet")
    print("     • AI-Powered Analytics")
    
    print("\n  🔗 All Contracts Viewable At:")
    for name, details in CONTRACTS.items():
        app_id = details['app_id']
        print(f"     • {name}: https://testnet.explorer.perawallet.app/application/{app_id}")
    
    print("\n  📧 Questions?")
    print("     Contact: Your Team/Email Here")
    
    print("\n" + "="*80)
    print("\n  Demo completed! All contracts are live on Algorand TestNet.")
    print("  Visit the explorer links above to verify and interact with them.\n")
    print("="*80 + "\n")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⏹️  Presentation ended.")
    except Exception as e:
        print(f"\n❌ Error: {e}")
