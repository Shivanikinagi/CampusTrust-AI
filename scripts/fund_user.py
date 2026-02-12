
import os
from dotenv import load_dotenv
from algosdk import account, mnemonic
from algosdk.v2client import algod
from algosdk.transaction import PaymentTxn, wait_for_confirmation

# Load environment variables
load_dotenv()

def fund_account(receiver_address, amount_algo=1.0):
    # Setup Algorand client
    algod_address = "https://testnet-api.algonode.cloud"
    algod_token = ""
    algod_client = algod.AlgodClient(algod_token, algod_address)
    
    # Get funding account (Deployer)
    sender_mnemonic = os.getenv("ALGORAND_MNEMONIC")
    if not sender_mnemonic:
        print("Error: ALGORAND_MNEMONIC not found in .env")
        return
        
    sender_private_key = mnemonic.to_private_key(sender_mnemonic)
    sender_address = account.address_from_private_key(sender_private_key)
    
    print(f"Funding from Deployer: {sender_address}")
    print(f"Receiver: {receiver_address}")
    print(f"Amount: {amount_algo} ALGO")
    
    # Get suggested params
    params = algod_client.suggested_params()
    
    # Create transaction
    txn = PaymentTxn(
        sender=sender_address,
        sp=params,
        receiver=receiver_address,
        amt=int(amount_algo * 1_000_000)  # Convert to microAlgos
    )
    
    # Sign transaction
    signed_txn = txn.sign(sender_private_key)
    
    # Send transaction
    try:
        tx_id = algod_client.send_transaction(signed_txn)
        print(f"Transaction sent with ID: {tx_id}")
        
        # Wait for confirmation
        results = wait_for_confirmation(algod_client, tx_id, 4)
        print(f"Confirmed in round {results['confirmed-round']}")
        print("Success! Account funded.")
        
    except Exception as e:
        print(f"Error funding account: {e}")

if __name__ == "__main__":
    # The address from the user's error message
    user_address = "TE5N3PBGY3ILOPTROUPPC2HWWHVRGRKGUXTBFRYA7P4KOQAZFVZQI6FCAQ"
    fund_account(user_address)
