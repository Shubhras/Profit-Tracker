import requests
from datetime import timedelta
from django.utils import timezone


def refresh_ads_access_token(account):

    url = "https://api.amazon.com/auth/o2/token"

    payload = {
        "grant_type": "refresh_token",
        "refresh_token": account.refresh_token,
        "client_id": account.client_id,
        "client_secret": account.client_secret,
    }

    response = requests.post(url, data=payload)

    data = response.json()

    account.access_token = data["access_token"]

    account.token_expires_at = timezone.now() + timedelta(
        seconds=data["expires_in"]
    )

    account.save(update_fields=[
        "access_token",
        "token_expires_at"
    ])

    return account.access_token