from amazon_auth.spapi_manager import SPAPIManager


def sync_amazon_store_name(account):
    """
    Fetch the Amazon seller's store name using the Sellers API
    and save it to AmazonAccount.

    This is intentionally separate from the main initial sync so
    it can later be called from a Celery task independently.
    """

    print(f"FETCHING AMAZON STORE NAME => {account.seller_central_id}")

    try:
        manager = SPAPIManager(user=account.user)

        response = manager.get_marketplace_participations()

        # print(f"SELLERS API RESPONSE => {response}")

        payload = response.get("payload", [])

        if not payload:
            print(f"NO MARKETPLACE PARTICIPATIONS => {account.seller_central_id}")
            return None

        # Find the marketplace belonging to this account.
        marketplace_data = next(
            (
                item
                for item in payload
                if item.get("marketplace", {}).get("id") == account.marketplace_id
            ),
            None,
        )

        if not marketplace_data:
            print(f"MARKETPLACE NOT FOUND => {account.marketplace_id}")
            return None

        store_name = marketplace_data.get("storeName")

        if not store_name:
            print(f"STORE NAME NOT RETURNED => {account.seller_central_id}")
            return None

        account.store_name = store_name

        account.save(update_fields=["store_name"])

        print(f"STORE NAME SAVED => {account.seller_central_id} => {store_name}")

        return store_name

    except Exception as e:
        print(f"STORE NAME SYNC FAILED => {account.seller_central_id} => {e}")

        return None
