"""
CampusTrust AI - Algorand Contract Deployment
================================================
Deploy all smart contracts to Algorand TestNet.

Usage:
    python deploy.py [--network testnet|mainnet]
    
Environment:
    ALGORAND_MNEMONIC - 25-word mnemonic for the deployer account
"""

import os
import sys
import json
import base64
import time
import socket
from algosdk import mnemonic, account, transaction
from algosdk.v2client import algod
from dotenv import load_dotenv

# Set global timeout to 120 seconds to prevent read timeouts
socket.setdefaulttimeout(120)

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

# Algorand TestNet configuration
# Using Nodely as primary (more stable than AlgoNode recently)
ALGOD_NODES = [
    "https://testnet-api.4160.nodely.dev",
    "https://testnet-api.algonode.cloud",
    "https://xna-testnet-api.algonode.cloud"
]
ALGOD_ADDRESS = ALGOD_NODES[0] # Default
ALGOD_TOKEN = ""

COMPILED_DIR = os.path.join(os.path.dirname(__file__), "..", "compiled_contracts")
DEPLOYMENT_DIR = os.path.join(os.path.dirname(__file__), "..", "deployments")


def get_algod_client():
    """Create Algorand client."""
    return algod.AlgodClient(ALGOD_TOKEN, ALGOD_ADDRESS)


def compile_teal(client, teal_source, max_retries=3):
    """Compile TEAL source to binary with retry logic."""
    for attempt in range(max_retries):
        try:
            response = client.compile(teal_source)
            return base64.b64decode(response["result"])
        except Exception as e:
            if attempt < max_retries - 1:
                wait_time = (attempt + 1) * 3
                print(f"  ⚠️ Compilation timeout, retrying in {wait_time}s...")
                time.sleep(wait_time)
            else:
                raise Exception(f"TEAL compilation failed after {max_retries} attempts: {e}")


def deploy_contract(client, sender_address, sender_private_key,
                    approval_teal, clear_teal,
                    global_schema, local_schema,
                    app_args=None):
    """Deploy a smart contract to Algorand."""
    # Compile TEAL with retries
    print("  📝 Compiling approval program...")
    approval_program = compile_teal(client, approval_teal)
    print("  📝 Compiling clear state program...")
    clear_program = compile_teal(client, clear_teal)

    # Get suggested params with retry
    print("  🔧 Getting network parameters...")
    for attempt in range(3):
        try:
            params = client.suggested_params()
            break
        except Exception as e:
            if attempt < 2:
                print(f"  ⚠️ Failed to get params, retrying...")
                time.sleep(3)
            else:
                raise Exception(f"Failed to get network params: {e}")

    # Create application transaction
    txn = transaction.ApplicationCreateTxn(
        sender=sender_address,
        sp=params,
        on_complete=transaction.OnComplete.NoOpOC,
        approval_program=approval_program,
        clear_program=clear_program,
        global_schema=global_schema,
        local_schema=local_schema,
        app_args=app_args or [],
    )

    # Sign and send with retry
    signed_txn = txn.sign(sender_private_key)
    
    print("  📤 Sending transaction...")
    for attempt in range(3):
        try:
            tx_id = client.send_transaction(signed_txn)
            print(f"  ✅ Transaction sent: {tx_id}")
            break
        except Exception as e:
            if attempt < 2:
                print(f"  ⚠️ Send failed, retrying...")
                time.sleep(3)
            else:
                raise Exception(f"Failed to send transaction: {e}")

    # Wait for confirmation with retry logic
    max_retries = 5
    for attempt in range(max_retries):
        try:
            print(f"  ⏳ Waiting for confirmation (attempt {attempt + 1}/{max_retries})...")
            result = transaction.wait_for_confirmation(client, tx_id, 10)
            app_id = result["application-index"]
            print(f"  ✅ App ID: {app_id}")
            return app_id, tx_id
        except Exception as e:
            if attempt < max_retries - 1:
                wait_time = (attempt + 1) * 5
                print(f"  ⚠️  Timeout, retrying in {wait_time}s...")
                time.sleep(wait_time)
            else:
                print(f"  ❌ Failed after {max_retries} attempts: {e}")
                raise

    return None, tx_id


def main():
    print("🚀 CampusTrust AI - Algorand Contract Deployment\n")

    # Check for mnemonic
    deployer_mnemonic = os.getenv("ALGORAND_MNEMONIC")
    if not deployer_mnemonic:
        print("⚠️  ALGORAND_MNEMONIC not set in .env")
        print("   Generate an account and fund it with TestNet ALGO:")
        print("   https://bank.testnet.algorand.network/")
        print("\n   Example .env:")
        print('   ALGORAND_MNEMONIC="word1 word2 ... word25"')
        sys.exit(1)

    # Derive account
    private_key = mnemonic.to_private_key(deployer_mnemonic)
    sender_address = account.address_from_private_key(private_key)
    print(f"📋 Deployer: {sender_address}")

    # Create client with timeout logic or node switching
    client = None
    info = None
    
    for node in ALGOD_NODES:
        try:
            print(f"🔄 Connecting to Algorand TestNet node: {node}...")
            temp_client = algod.AlgodClient(ALGOD_TOKEN, node)
            temp_client.status() # Test connection
            
            # Check balance immediately to verify full connectivity
            print(f"   Verifying account access...")
            info = temp_client.account_info(sender_address)
            
            # If we get here, this node is good
            client = temp_client
            print("✅ Connected & Verified!")
            break
        except Exception as e:
            print(f"⚠️ Failed to connect/read from {node}: {e}")
            time.sleep(1) # Short pause before next node
    
    if not client or not info:
        print("❌ Could not connect to any Algorand TestNet node. Check internet connection.")
        sys.exit(1)

    # Balance check
    balance = info["amount"] / 1_000_000
    print(f"💰 Balance: {balance:.6f} ALGO\n")

    if balance < 1:
        print("⚠️  Insufficient balance. Fund your account:")
        print("   https://bank.testnet.algorand.network/")
        sys.exit(1)

    deployments = {}

    # ── Deploy Voting Contract ────────────────────────────
    print("📦 Deploying Voting Contract...")
    with open(os.path.join(COMPILED_DIR, "voting_approval.teal")) as f:
        voting_approval = f.read()
    with open(os.path.join(COMPILED_DIR, "voting_clear.teal")) as f:
        voting_clear = f.read()

    voting_app_id, voting_tx = deploy_contract(
        client, sender_address, private_key,
        voting_approval, voting_clear,
        global_schema=transaction.StateSchema(num_uints=16, num_byte_slices=16),
        local_schema=transaction.StateSchema(num_uints=4, num_byte_slices=2),
        app_args=[
            b"Campus Election 2026",     # election_name
            (2).to_bytes(8, "big"),       # num_proposals
            int(time.time()).to_bytes(8, "big"),  # start_time (now)
            int(time.time() + 86400).to_bytes(8, "big"),  # end_time (+24h)
            b"Proposal A",               # proposal_0_name
            b"Proposal B",               # proposal_1_name
        ],
    )
    deployments["voting"] = {
        "app_id": voting_app_id, 
        "tx_id": voting_tx,
        "name": "Campus Election 2026"
    }

    # ── Deploy Credential Contract ────────────────────────
    print("\n📦 Deploying Credential Contract...")
    with open(os.path.join(COMPILED_DIR, "credential_approval.teal")) as f:
        cred_approval = f.read()
    with open(os.path.join(COMPILED_DIR, "credential_clear.teal")) as f:
        cred_clear = f.read()

    cred_app_id, cred_tx = deploy_contract(
        client, sender_address, private_key,
        cred_approval, cred_clear,
        global_schema=transaction.StateSchema(num_uints=4, num_byte_slices=4),
        local_schema=transaction.StateSchema(num_uints=4, num_byte_slices=4),
        app_args=[b"Vishwakarma Institute of Technology"],
    )
    deployments["credential"] = {
        "app_id": cred_app_id, 
        "tx_id": cred_tx,
        "name": "Vishwakarma Institute of Technology"
    }

    # ── Deploy Feedback Contract ──────────────────────────
    print("\n📦 Deploying Feedback Contract...")
    with open(os.path.join(COMPILED_DIR, "feedback_approval.teal")) as f:
        fb_approval = f.read()
    with open(os.path.join(COMPILED_DIR, "feedback_clear.teal")) as f:
        fb_clear = f.read()

    fb_app_id, fb_tx = deploy_contract(
        client, sender_address, private_key,
        fb_approval, fb_clear,
        global_schema=transaction.StateSchema(num_uints=10, num_byte_slices=4),
        local_schema=transaction.StateSchema(num_uints=4, num_byte_slices=4),
        app_args=[b"Course Feedback - Blockchain 101"],
    )
    deployments["feedback"] = {
        "app_id": fb_app_id, 
        "tx_id": fb_tx,
        "name": "Course Feedback - Blockchain 101"
    }

    # ── Deploy Attendance Contract ────────────────────────
    print("\n📦 Deploying Attendance Contract...")
    with open(os.path.join(COMPILED_DIR, "attendance_approval.teal")) as f:
        att_approval = f.read()
    with open(os.path.join(COMPILED_DIR, "attendance_clear.teal")) as f:
        att_clear = f.read()

    att_app_id, att_tx = deploy_contract(
        client, sender_address, private_key,
        att_approval, att_clear,
        global_schema=transaction.StateSchema(num_uints=10, num_byte_slices=4),
        local_schema=transaction.StateSchema(num_uints=6, num_byte_slices=2),
        app_args=[b"Blockchain Development Lab"],
    )
    deployments["attendance"] = {
        "app_id": att_app_id, 
        "tx_id": att_tx,
        "name": "Blockchain Development Lab"
    }

    # ── Save deployment info ──────────────────────────────
    os.makedirs(DEPLOYMENT_DIR, exist_ok=True)
    deployment_file = os.path.join(DEPLOYMENT_DIR, "algorand-testnet-deployment.json")

    deployment_info = {
        "network": "algorand-testnet",
        "deployer": sender_address,
        "timestamp": int(time.time()),
        "contracts": deployments,
        "explorer_base": "https://testnet.explorer.perawallet.app/application/",
    }

    with open(deployment_file, "w") as f:
        json.dump(deployment_info, f, indent=2)

    # Also save to public/ for frontend access
    public_dir = os.path.join(os.path.dirname(__file__), "..", "public")
    os.makedirs(public_dir, exist_ok=True)
    public_file = os.path.join(public_dir, "algorand-testnet-deployment.json")
    with open(public_file, "w") as f:
        json.dump(deployment_info, f, indent=2)

    print(f"\n🎉 All contracts deployed successfully!")
    print(f"📄 Deployment info saved to: \n  1. {deployment_file}\n  2. {public_file}")

    for name, info in deployments.items():
        print(f"   {name}: App ID {info['app_id']} → "
              f"https://testnet.explorer.perawallet.app/application/{info['app_id']}")


if __name__ == "__main__":
    main()
