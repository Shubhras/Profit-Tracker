import requests

class LwaAccessTokenRequest:
    def __init__(self, config):
        self.config = config

    def get_access_token(self):
        url = "https://api.amazon.com/auth/o2/token"

        payload = {
            "grant_type": "refresh_token",
            "refresh_token": self.config.refresh_token,
            "client_id": self.config.client_id,
            "client_secret": self.config.client_secret,
        }

        # For grantless operations (notifications, migration)
        if self.config.scope:
            payload = {
                "grant_type": "client_credentials", 
                "scope": self.config.scope,
                "client_id": self.config.client_id,
                "client_secret": self.config.client_secret,
            }

        response = requests.post(url, data=payload)
        response.raise_for_status()
        return response.json()["access_token"]