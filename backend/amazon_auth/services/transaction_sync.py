from amazon_auth.models import *
from amazon_auth.spapi_manager import SPAPIManager
import requests

def save_breakdowns(transaction, breakdowns, parent=None):

    for item in breakdowns:

        amount_data = item.get("breakdownAmount", {})

        breakdown_obj = AmazonTransactionBreakdown.objects.create(
            transaction=transaction,
            parent=parent,
            breakdown_type=item.get("breakdownType"),
            amount=amount_data.get("currencyAmount"),
            currency_code=amount_data.get("currencyCode"),
        )

        children = item.get("breakdowns", [])

        if children:
            save_breakdowns(
                transaction,
                children,
                breakdown_obj
            )

def sync_transactions_for_account(
    amazon_account,
    posted_after,
    posted_before=None
):

    sp_api = SPAPIManager(account=amazon_account)

    access_token = sp_api.get_access_token()

    endpoint = f"https://sellingpartnerapi-{amazon_account.region.lower()}.amazon.com"

    url = f"{endpoint}/finances/2024-06-19/transactions"

    headers = {
        "x-amz-access-token": access_token,
        "accept": "application/json"
    }

    params = {
        "postedAfter": posted_after,
        "marketplaceId": amazon_account.marketplace_id
    }

    if posted_before:
        params["postedBefore"] = posted_before

    next_token = None

    while True:

        if next_token:
            params["nextToken"] = next_token

        response = requests.get(
            url,
            headers=headers,
            params=params,
            timeout=60
        )

        data = response.json()

        payload = data.get("payload", {})

        transactions = payload.get("transactions", [])

        for txn in transactions:

            amount_data = txn.get("totalAmount", {})

            transaction_obj, created = AmazonTransaction.objects.update_or_create(
                transaction_id=txn.get("transactionId"),
                defaults={
                    "amazon_account": amazon_account,
                    "transaction_type": txn.get("transactionType"),
                    "transaction_status": txn.get("transactionStatus"),
                    "description": txn.get("description"),
                    "posted_date": txn.get("postedDate"),
                    "total_amount": amount_data.get("currencyAmount"),
                    "currency_code": amount_data.get("currencyCode"),
                    "raw_payload": txn
                }
            )

            transaction_obj.related_identifiers.all().delete()

            for rel in txn.get("relatedIdentifiers", []):

                AmazonTransactionRelatedIdentifier.objects.create(
                    transaction=transaction_obj,
                    identifier_name=rel.get("relatedIdentifierName"),
                    identifier_value=rel.get("relatedIdentifierValue")
                )

            transaction_obj.contexts.all().delete()

            for ctx in txn.get("contexts", []):

                AmazonTransactionContext.objects.create(
                    transaction=transaction_obj,
                    context_type=ctx.get("contextType"),
                    asin=ctx.get("asin"),
                    sku=ctx.get("sku"),
                    quantity_shipped=ctx.get("quantityShipped"),
                    fulfillment_network=ctx.get("fulfillmentNetwork"),
                    raw_context=ctx
                )

            transaction_obj.breakdowns.all().delete()

            breakdowns = txn.get("breakdowns", {}).get("breakdowns", [])

            save_breakdowns(
                transaction_obj,
                breakdowns
            )

        next_token = payload.get("nextToken")

        if not next_token:
            break
        
        