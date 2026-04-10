from .models import AmazonAccount
from auth.credentials import SPAPIConfig
from spapi.spapiclient import SPAPIClient

def get_orders_for_user(user):
    """
    This method loads the user's refresh_token from the database,
    initializes the SP-API client, and returns a list of orders.
    """
    try:
        # Retrieve the user's stored account
        account = AmazonAccount.objects.get(user=user)
        
        # Build the configuration using stored credentials
        config = SPAPIConfig(
            client_id="YOUR_APP_CLIENT_ID", # Usually fetched from settings or .env
            client_secret="YOUR_APP_CLIENT_SECRET", 
            refresh_token=account.refresh_token, # Uses new field name
            region="EU", # Replace with account.region if you add it later
        )
        
        # Initialize the API client
        api_client = SPAPIClient(config)
        
        # Get the Orders API client
        orders_api = api_client.get_api_client("OrdersV0Api")
        
        # Execute the call using the new seller_id field
        response = orders_api.get_orders(
            marketplace_ids=["ATVPDKIKX0DER"], # Default US; build dynamically if needed
            created_after="2024-01-01T00:00:00",
        )
        
        return response
        
    except AmazonAccount.DoesNotExist:
        return {"error": "No Amazon account connected for this user."}
    except Exception as e:
        return {"error": str(e)}
