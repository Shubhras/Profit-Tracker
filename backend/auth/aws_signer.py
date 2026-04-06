import datetime
import hashlib
import hmac
from urllib.parse import urlparse, quote

class AWSSigV4Signer:
    """
    Utility class to sign requests using AWS Signature Version 4.
    """
    def __init__(self, access_key, secret_key, region, service="execute-api", session_token=None):
        self.access_key = access_key
        self.secret_key = secret_key
        self.region = region
        self.service = service
        self.session_token = session_token

    def _sign(self, key, msg):
        return hmac.new(key, msg.encode('utf-8'), hashlib.sha256).digest()

    def _get_signature_key(self, key, date_stamp, region_name, service_name):
        k_date = self._sign(('AWS4' + key).encode('utf-8'), date_stamp)
        k_region = self._sign(k_date, region_name)
        k_service = self._sign(k_region, service_name)
        k_signing = self._sign(k_service, 'aws4_request')
        return k_signing

    def sign_headers(self, method, url, headers, body=None):
        """
        Signs the request and returns a dict of updated headers.
        """
        parsed_url = urlparse(url)
        host = parsed_url.hostname
        path = parsed_url.path or '/'
        query = parsed_url.query

        now = datetime.datetime.utcnow()
        amz_date = now.strftime('%Y%m%dT%H%M%SZ')
        datestamp = now.strftime('%Y%m%d')

        headers = headers.copy()
        headers['Host'] = host
        headers['X-Amz-Date'] = amz_date
        if self.session_token:
            headers['X-Amz-Security-Token'] = self.session_token

        # 1. Create Canonical Request
        # Note: headers for hashing MUST be sorted by key (lowercase)
        canonical_headers = ''
        signed_headers_list = []
        for key in sorted(headers.keys()):
            k_lower = key.lower()
            val = str(headers[key]).strip()
            canonical_headers += f"{k_lower}:{val}\n"
            signed_headers_list.append(k_lower)
        signed_headers = ';'.join(signed_headers_list)

        payload_hash = hashlib.sha256((body or '').encode('utf-8')).hexdigest()
        
        canonical_request = (
            f"{method.upper()}\n"
            f"{path}\n"
            f"{query}\n"
            f"{canonical_headers}\n"
            f"{signed_headers}\n"
            f"{payload_hash}"
        )

        # 2. String to Sign
        algorithm = 'AWS4-HMAC-SHA256'
        credential_scope = f"{datestamp}/{self.region}/{self.service}/aws4_request"
        string_to_sign = (
            f"{algorithm}\n"
            f"{amz_date}\n"
            f"{credential_scope}\n"
            f"{hashlib.sha256(canonical_request.encode('utf-8')).hexdigest()}"
        )

        # 3. Calculate Signature
        signing_key = self._get_signature_key(self.secret_key, datestamp, self.region, self.service)
        signature = hmac.new(signing_key, string_to_sign.encode('utf-8'), hashlib.sha256).hexdigest()

        # 4. Add Authorization Header
        authorization_header = (
            f"{algorithm} Credential={self.access_key}/{credential_scope}, "
            f"SignedHeaders={signed_headers}, Signature={signature}"
        )
        headers['Authorization'] = authorization_header
        
        return headers
