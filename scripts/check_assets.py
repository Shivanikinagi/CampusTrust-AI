from algosdk.v2client import algod

def check_assets(address):
    # Setup Algorand client
    algod_address = "https://testnet-api.algonode.cloud"
    algod_token = ""
    algod_client = algod.AlgodClient(algod_token, algod_address)
    
    try:
        account_info = algod_client.account_info(address)
        assets = account_info.get('assets', [])
        print(f"Account has {len(assets)} assets:")
        for asset in assets:
            print(f"  Asset ID: {asset['asset-id']}")
            print(f"  Amount: {asset['amount']}")
            print(f"  Frozen: {asset['is-frozen']}")
            print(f"  Creator: {asset.get('creator', 'Unknown')}")
            print("---")
            
    except Exception as e:
        print(f"Error checking assets: {e}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python check_assets.py <address>")
        sys.exit(1)
    
    address = sys.argv[1]
    check_assets(address)