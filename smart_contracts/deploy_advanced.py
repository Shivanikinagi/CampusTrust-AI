"""
CampusTrust AI - Deploy Token & NFT Contracts
==============================================
Deploys Campus Governance Token (ASA) and Achievement Badge NFTs to Algorand TestNet.

Features:
- Deploy Campus Token contract (rewards system)
- Deploy NFT Badge contract (8 achievement types)
- Save contract App IDs to deployment manifest
- Verify on AlgoExplorer TestNet

Run: python deploy_advanced.py
"""

from algosdk import account, mnemonic, transaction
from algosdk.v2client import algod
from pyteal import compileTeal, Mode
import json
import os
import base64
import time
from pathlib import Path
from dotenv import load_dotenv
from token_contract import approval_program as token_approval, clear_program as token_clear
from nft_badge_contract import approval_program as badge_approval, clear_program as badge_clear

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

# ═══════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════

ALGOD_ADDRESS = "https://testnet-api.algonode.cloud"
ALGOD_TOKEN = ""

# Load deployer account from mnemonic
DEPLOYER_MNEMONIC = os.getenv("ALGORAND_MNEMONIC", "")

# ═══════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════

def get_algod_client():
    """Initialize Algod client for TestNet."""
    return algod.AlgodClient(ALGOD_TOKEN, ALGOD_ADDRESS)

def retry_api_call(func, max_retries=3, delay=2):
    """Retry API calls with exponential backoff."""
    for attempt in range(max_retries):
        try:
            return func()
        except Exception as e:
            if attempt < max_retries - 1:
                wait_time = delay * (attempt + 1)
                print(f"⚠️  API call failed (attempt {attempt + 1}/{max_retries}): {str(e)}")
                print(f"   Retrying in {wait_time}s...")
                time.sleep(wait_time)
            else:
                print(f"❌ API call failed after {max_retries} attempts")
                raise

def wait_for_confirmation(client, txid):
    """Wait for transaction confirmation on blockchain."""
    last_round = client.status().get('last-round')
    txinfo = client.pending_transaction_info(txid)
    
    while not (txinfo.get('confirmed-round') and txinfo.get('confirmed-round') > 0):
        print("⏳ Waiting for confirmation...")
        last_round += 1
        client.status_after_block(last_round)
        txinfo = client.pending_transaction_info(txid)
    
    print(f"✅ Transaction confirmed in round {txinfo.get('confirmed-round')}")
    return txinfo

# ═══════════════════════════════════════════════════════════
# DEPLOYMENT FUNCTIONS
# ═══════════════════════════════════════════════════════════

def deploy_token_contract(client, deployer_address, deployer_private_key):
    """
    Deploy Campus Governance Token contract.
    
    Returns:
        int: App ID of deployed contract
    """
    print("\n" + "=" * 60)
    print("DEPLOYING CAMPUS GOVERNANCE TOKEN CONTRACT")
    print("=" * 60)
    
    # Generate TEAL code from PyTeal
    print("📝 Compiling PyTeal to TEAL...")
    approval_teal = compileTeal(token_approval(), mode=Mode.Application, version=8)
    clear_teal = compileTeal(token_clear(), mode=Mode.Application, version=8)
    
    # Compile TEAL to bytecode with retry
    print("📝 Compiling TEAL to bytecode...")
    approval_result = base64.b64decode(retry_api_call(lambda: client.compile(approval_teal))['result'])
    clear_result = base64.b64decode(retry_api_call(lambda: client.compile(clear_teal))['result'])
    
    # Transaction parameters with retry
    params = retry_api_call(lambda: client.suggested_params())
    
    # Global and local state schema
    global_schema = transaction.StateSchema(num_uints=7, num_byte_slices=1)
    local_schema = transaction.StateSchema(num_uints=3, num_byte_slices=0)
    
    # Create application transaction
    txn = transaction.ApplicationCreateTxn(
        sender=deployer_address,
        sp=params,
        on_complete=transaction.OnComplete.NoOpOC,
        approval_program=approval_result,
        clear_program=clear_result,
        global_schema=global_schema,
        local_schema=local_schema,
    )
    
    # Sign and send
    print("🔐 Signing transaction...")
    signed_txn = txn.sign(deployer_private_key)
    
    print("📡 Sending to Algorand TestNet...")
    tx_id = client.send_transaction(signed_txn)
    
    # Wait for confirmation
    txn_result = wait_for_confirmation(client, tx_id)
    
    # Extract app ID
    app_id = txn_result['application-index']
    
    print(f"\n🎉 Campus Token Contract Deployed!")
    print(f"   App ID: {app_id}")
    print(f"   Tx ID: {tx_id}")
    print(f"   Explorer: https://testnet.algoexplorer.io/application/{app_id}")
    
    return app_id

def deploy_badge_contract(client, deployer_address, deployer_private_key):
    """
    Deploy NFT Achievement Badge contract.
    
    Returns:
        int: App ID of deployed contract
    """
    print("\n" + "=" * 60)
    print("DEPLOYING NFT ACHIEVEMENT BADGE CONTRACT")
    print("=" * 60)
    
    # Generate TEAL code from PyTeal
    print("📝 Compiling PyTeal to TEAL...")
    approval_teal = compileTeal(badge_approval(), mode=Mode.Application, version=8)
    clear_teal = compileTeal(badge_clear(), mode=Mode.Application, version=8)
    
    # Compile TEAL to bytecode with retry
    print("📝 Compiling TEAL to bytecode...")
    approval_result = base64.b64decode(retry_api_call(lambda: client.compile(approval_teal))['result'])
    clear_result = base64.b64decode(retry_api_call(lambda: client.compile(clear_teal))['result'])
    
    # Transaction parameters with retry
    params = retry_api_call(lambda: client.suggested_params())
    
    # Global and local state schema
    # Global: admin (bytes), total_badges_issued (uint), badge_types (uint)
    # Local: badges_earned (uint), perfect_attendance_count (uint), governance_contributor (uint), last_badge_time (uint)
    global_schema = transaction.StateSchema(num_uints=2, num_byte_slices=1)
    local_schema = transaction.StateSchema(num_uints=4, num_byte_slices=0)
    
    # Create application transaction
    txn = transaction.ApplicationCreateTxn(
        sender=deployer_address,
        sp=params,
        on_complete=transaction.OnComplete.NoOpOC,
        approval_program=approval_result,
        clear_program=clear_result,
        global_schema=global_schema,
        local_schema=local_schema,
    )
    
    # Sign and send
    print("🔐 Signing transaction...")
    signed_txn = txn.sign(deployer_private_key)
    
    print("📡 Sending to Algorand TestNet...")
    tx_id = client.send_transaction(signed_txn)
    
    # Wait for confirmation
    txn_result = wait_for_confirmation(client, tx_id)
    
    # Extract app ID
    app_id = txn_result['application-index']
    
    print(f"\n🎉 NFT Badge Contract Deployed!")
    print(f"   App ID: {app_id}")
    print(f"   Tx ID: {tx_id}")
    print(f"   Explorer: https://testnet.algoexplorer.io/application/{app_id}")
    
    return app_id

def save_deployment_info(token_app_id, badge_app_id, deployer_address):
    """Save deployment information to manifest file."""
    
    deployment_data = {
        "network": "algorand-testnet",
        "deployer": deployer_address,
        "timestamp": "2024-01-15T12:00:00Z",
        "contracts": {
            "token": {
                "app_id": token_app_id,
                "name": "Campus Governance Token",
                "type": "ASA Management",
                "explorer": f"https://testnet.algoexplorer.io/application/{token_app_id}"
            },
            "badge": {
                "app_id": badge_app_id,
                "name": "Achievement Badge NFT",
                "type": "NFT Management (ARC-3/ARC-19)",
                "explorer": f"https://testnet.algoexplorer.io/application/{badge_app_id}"
            }
        }
    }
    
    # Save to deployments folder
    deployments_dir = Path("deployments")
    deployments_dir.mkdir(exist_ok=True)
    
    file_path = deployments_dir / "advanced-features-deployment.json"
    
    with open(file_path, "w") as f:
        json.dump(deployment_data, f, indent=2)
    
    print(f"\n💾 Deployment info saved to: {file_path}")
    
    # Print .env updates
    print("\n" + "=" * 60)
    print("ADD TO YOUR .ENV FILE:")
    print("=" * 60)
    print(f"VITE_TOKEN_APP_ID={token_app_id}")
    print(f"VITE_BADGE_APP_ID={badge_app_id}")
    print("=" * 60)

# ═══════════════════════════════════════════════════════════
# MAIN DEPLOYMENT
# ═══════════════════════════════════════════════════════════

def main():
    """Main deployment orchestrator."""
    
    print("\n" + "🚀" * 30)
    print("CAMPUSTRUST AI - ADVANCED FEATURES DEPLOYMENT")
    print("Algorand TestNet | ASA + NFT Contracts")
    print("🚀" * 30)
    
    # Initialize client
    algod_client = get_algod_client()
    
    # Get deployer account
    if not DEPLOYER_MNEMONIC:
        print("❌ ERROR: ALGORAND_MNEMONIC not found in environment")
        print("   Set your mnemonic in .env file")
        return
    
    deployer_private_key = mnemonic.to_private_key(DEPLOYER_MNEMONIC)
    deployer_address = account.address_from_private_key(deployer_private_key)
    
    print(f"\n📍 Deployer Address: {deployer_address}")
    
    # Check balance with retry logic
    print("📡 Checking account balance...")
    account_info = retry_api_call(lambda: algod_client.account_info(deployer_address))
    balance = account_info.get('amount') / 1_000_000  # Convert microAlgos
    print(f"💰 Balance: {balance:.2f} ALGO")
    
    if balance < 0.5:
        print("⚠️  WARNING: Low balance. You need at least 0.5 ALGO for deployment.")
        print("   Get TestNet ALGO from: https://testnet.algoexplorer.io/dispenser")
        return
    
    # Deploy contracts
    try:
        token_app_id = deploy_token_contract(algod_client, deployer_address, deployer_private_key)
        badge_app_id = deploy_badge_contract(algod_client, deployer_address, deployer_private_key)
        
        # Save deployment info
        save_deployment_info(token_app_id, badge_app_id, deployer_address)
        
        print("\n" + "✅" * 30)
        print("DEPLOYMENT SUCCESSFUL!")
        print("✅" * 30)
        print("\n🎊 All advanced features deployed to Algorand TestNet!")
        print("   Update your .env file with the new App IDs")
        print("   Run npm run dev to see the new features in action!")
        
    except Exception as e:
        print(f"\n❌ DEPLOYMENT FAILED: {str(e)}")
        
        # Check if it's a network error
        if "timeout" in str(e).lower() or "connection" in str(e).lower():
            print("\n💡 TROUBLESHOOTING NETWORK ISSUES:")
            print("   1. Check your internet connection")
            print("   2. Try again in a few minutes (API may be temporarily unavailable)")
            print("   3. Make sure no firewall is blocking the connection")
            print(f"   4. Current endpoint: {ALGOD_ADDRESS}")
        
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
