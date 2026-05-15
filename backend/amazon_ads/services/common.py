from .auth import refresh_ads_access_token


def get_ads_headers(account):

    if (
        not account.access_token
        or not account.token_expires_at
    ):
        refresh_ads_access_token(account)

    return {
        "Authorization": f"Bearer {account.access_token}",
        "Amazon-Advertising-API-ClientId": account.client_id,
        "Amazon-Advertising-API-Scope": str(account.profile_id),
        "Content-Type": "application/json"
    }