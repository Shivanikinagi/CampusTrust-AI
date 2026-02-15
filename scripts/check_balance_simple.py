from algosdk.v2client import algod

def check_balance(address):
    # Setup Algorand client
    algod_address = "https://testnet-api.algonode.cloud"
    algod_token = ""
    algod_client = algod.AlgodClient(algod_token, algod_address)
    
    try:
        account_info = algod_client.account_info(address)
        balance = account_info.get('amount', 0)
        print(f"Account: {address}")
        print(f"Balance: {balance} microAlgos ({balance / 1_000_000:.6f} ALGO)")
        print(f"Min balance required: {account_info.get('min-balance', 0)} microAlgos")
        
        # Check assets
        assets = account_info.get('assets', [])
        print(f"Number of assets: {len(assets)}")
        for asset in assets:
            print(f"  Asset ID: {asset['asset-id']}, Amount: {asset['amount']}")
            
    except Exception as e:
        print(f"Error checking balance: {e}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python check_balance_simple.py <address>")
        sys.exit(1)
    
    address = sys.argv[1]
    check_balance(address)