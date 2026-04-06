class SPAPIConfig:
    def __init__(self, client_id, client_secret, refresh_token, region, scope=None):
        self.client_id = client_id
        self.client_secret = client_secret
        self.refresh_token = refresh_token
        self.region = region  # "NA", "EU", "FE", or "SANDBOX"
        self.scope = scope    # None for seller APIs