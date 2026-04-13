import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from amazon_auth.spapi_manager import SPAPIManager
from datetime import datetime, timedelta

def test_connection():
    print("--- Testing Amazon SP-API Connection ---")
    try:
        manager = SPAPIManager()
        print(f"Using Marketplace: {manager.marketplace_id}")
        print(f"Using Host: {manager.host}")
        print(f"Using Region: {manager.aws_region}")
        
        print("\nFetching orders from last 30 days...")
        # Get orders
        res = manager.get_orders()
        
        if 'errors' in res:
            print("\n❌ API Error received:")
            print(res)
        elif 'payload' in res:
            orders = res.get('payload', {}).get('Orders', [])
            print(f"\n✅ Success! Found {len(orders)} orders.")
            if orders:
                print(f"Example Order ID: {orders[0].get('AmazonOrderId')}")
            else:
                print("No orders found in this period, but the connection is working.")
        else:
            print("\n❓ Unexpected response:")
            print(res)
            
    except Exception as e:
        print(f"\n❌ Error during test: {str(e)}")

if __name__ == "__main__":
    test_connection()
