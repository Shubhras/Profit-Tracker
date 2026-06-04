from amazon_auth.models import *
from amazon_auth.spapi_manager import SPAPIManager

import requests


def save_breakdowns(transaction, breakdowns, parent=None):

    # Safety check
    if not isinstance(breakdowns, list):
        return

    for item in breakdowns:

        # Skip invalid breakdown objects
        if not isinstance(item, dict):
            continue

        amount_data = item.get("breakdownAmount") or {}

        breakdown_obj = AmazonTransactionBreakdown.objects.create(
            transaction=transaction,
            parent=parent,
            breakdown_type=item.get("breakdownType"),
            amount=amount_data.get("currencyAmount"),
            currency_code=amount_data.get("currencyCode"),
        )

        children = item.get("breakdowns") or []

        if children:
            save_breakdowns(
                transaction=transaction,
                breakdowns=children,
                parent=breakdown_obj
            )


def sync_transactions_for_account(
    amazon_account,
    posted_after,
    posted_before=None
):

    # -----------------------------------
    # Generate Access Token
    # -----------------------------------

    sp_api = SPAPIManager(account=amazon_account)

    access_token = sp_api.get_access_token()

    # -----------------------------------
    # Endpoint
    # -----------------------------------

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

    # -----------------------------------
    # Pagination Loop
    # -----------------------------------

    while True:

        if next_token:
            params["nextToken"] = next_token

        response = requests.get(
            url,
            headers=headers,
            params=params,
            timeout=60
        )

        # -----------------------------------
        # Safe JSON Parse
        # -----------------------------------

        try:
            data = response.json()

        except Exception:
            raise Exception(
                f"Invalid JSON response: {response.text}"
            )

        # -----------------------------------
        # API Error Handling
        # -----------------------------------

        if response.status_code != 200:

            raise Exception(
                f"Amazon API Error {response.status_code}: {data}"
            )

        payload = data.get("payload") or {}

        transactions = payload.get("transactions") or []

        # Safety check
        if not isinstance(transactions, list):
            transactions = []

        # -----------------------------------
        # Transactions Loop
        # -----------------------------------

        for txn in transactions:

            # Skip invalid transaction objects
            if not isinstance(txn, dict):
                continue

            amount_data = txn.get("totalAmount") or {}

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

            # ===================================
            # Related Identifiers
            # ===================================

            transaction_obj.related_identifiers.all().delete()

            related_identifiers = txn.get("relatedIdentifiers") or []

            if not isinstance(related_identifiers, list):
                related_identifiers = []

            for rel in related_identifiers:

                if not isinstance(rel, dict):
                    continue

                AmazonTransactionRelatedIdentifier.objects.create(
                    transaction=transaction_obj,
                    identifier_name=rel.get("relatedIdentifierName"),
                    identifier_value=rel.get("relatedIdentifierValue")
                )

            # ===================================
            # Contexts
            # ===================================

            transaction_obj.contexts.all().delete()


            def save_contexts(contexts_list):

                if not isinstance(contexts_list, list):
                    return

                for ctx in contexts_list:

                    if not isinstance(ctx, dict):
                        continue

                    AmazonTransactionContext.objects.create(
                        transaction=transaction_obj,
                        context_type=ctx.get("contextType"),

                        # Product Context
                        asin=ctx.get("asin"),
                        sku=ctx.get("sku"),
                        quantity_shipped=ctx.get("quantityShipped"),
                        fulfillment_network=ctx.get("fulfillmentNetwork"),

                        # Deferred Context
                        deferral_reason=ctx.get("deferralReason"),
                        maturity_date=ctx.get("maturityDate"),

                        # Amazon Pay Context
                        store_name=ctx.get("storeName"),
                        order_type=ctx.get("orderType"),
                        channel=ctx.get("channel"),

                        raw_context=ctx
                    )


            # -----------------------------------
            # Transaction Level Contexts
            # -----------------------------------

            transaction_contexts = txn.get("contexts") or []

            save_contexts(transaction_contexts)


            # -----------------------------------
            # Item Level Contexts
            # -----------------------------------

            items = txn.get("items") or []

            if isinstance(items, list):

                for item in items:

                    if not isinstance(item, dict):
                        continue

                    item_contexts = item.get("contexts") or []

                    save_contexts(item_contexts)

            # ===================================
            # Breakdowns
            # ===================================

            transaction_obj.breakdowns.all().delete()

            breakdowns_data = txn.get("breakdowns") or []

            # Amazon may return:
            # "breakdowns": []
            # OR
            # "breakdowns": {"breakdowns": []}

            if isinstance(breakdowns_data, dict):

                breakdowns = breakdowns_data.get("breakdowns") or []

            elif isinstance(breakdowns_data, list):

                breakdowns = breakdowns_data

            else:

                breakdowns = []

            save_breakdowns(
                transaction=transaction_obj,
                breakdowns=breakdowns
            )

        # -----------------------------------
        # Pagination
        # -----------------------------------

        next_token = payload.get("nextToken")

        if not next_token:
            break

    return True

