import logging
import math
import random
import re
import threading
import time

logger = logging.getLogger("amazon_auth.rate_limiter")


class SPAPIRateLimiter:
    """
    Thread-safe, dynamic token-bucket rate limiter for Amazon Selling Partner API (SP-API).

    Amazon SP-API specifies rate limits per (Application + Account) and per Operation.
    Reference: https://developer-docs.amazon.com/sp-api/docs/usage-plans-and-rate-limits

    Key capabilities:
    1. Dynamic rate tracking via the 'x-amzn-RateLimit-Limit' response header.
    2. Proactive request pacing (sleep before call if interval has not elapsed) to prevent depleting token bursts.
    3. Intelligent 429 QuotaExceeded backoff respecting 'Retry-After' and dynamic exponential backoff with jitter.
    4. Sync time estimation based on order volume and live rate limits.
    """

    # Amazon SP-API default fallback rates (Requests Per Second) and burst limits
    DEFAULT_RATES = {
        "orders_list": 0.5,      # GET /orders/v0/orders (Burst: 30, Rate: 0.5 req/s -> 2.0s interval)
        "order_items": 0.5,      # GET /orders/v0/orders/{id}/orderItems (Burst: 30, Rate: 0.5 req/s -> 2.0s interval)
        "order_detail": 1.0,     # GET /orders/v0/orders/{id} (Burst: 30, Rate: 1.0 req/s -> 1.0s interval)
        "finances": 0.5,         # GET /finances/v0/... (Burst: 30, Rate: 0.5 req/s -> 2.0s interval)
        "reports": 0.0222,       # GET /reports/2021-06-30/... (Burst: 10, Rate: 0.0222 req/s -> 45.0s interval)
        "catalog": 2.0,          # GET /catalog/2022-04-01/... (Burst: 5, Rate: 2.0 req/s -> 0.5s interval)
        "default": 1.0,          # Default fallback (1.0 req/s -> 1.0s interval)
    }

    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(SPAPIRateLimiter, cls).__new__(cls)
                cls._instance._init_tracker()
            return cls._instance

    def _init_tracker(self):
        # Key: (account_key, endpoint_group) -> {
        #   "rate": float,
        #   "min_interval": float,
        #   "last_request_time": float,
        #   "total_calls": int,
        #   "total_429s": int
        # }
        self._registry = {}
        self._registry_lock = threading.Lock()

    def get_endpoint_group(self, path: str) -> str:
        """Classify SP-API path into an operation group with defined rate limits."""
        if not path:
            return "default"

        p = str(path).lower().strip()

        if re.search(r"/orders/v0/orders/[^/]+/orderitems", p):
            return "order_items"
        elif re.search(r"/orders/v0/orders/[^/]+$", p):
            return "order_detail"
        elif "/orders/v0/orders" in p or "/orders/2026-" in p:
            return "orders_list"
        elif "/finances/v0/" in p or "/finances/" in p:
            return "finances"
        elif "/reports/" in p:
            return "reports"
        elif "/catalog/" in p:
            return "catalog"

        return "default"

    def _get_entry(self, account_key: str, group: str):
        key = (str(account_key or "global"), group)
        if key not in self._registry:
            default_rate = self.DEFAULT_RATES.get(group, self.DEFAULT_RATES["default"])
            self._registry[key] = {
                "rate": default_rate,
                "min_interval": 1.0 / max(default_rate, 0.001),
                "last_request_time": 0.0,
                "total_calls": 0,
                "total_429s": 0,
            }
        return self._registry[key]

    def wait_before_request(self, account_key: str, path: str) -> float:
        """
        Proactively paces requests to avoid hitting rate limits.
        Sleeps if necessary to maintain the rate limit interval.
        Returns the number of seconds waited.
        """
        group = self.get_endpoint_group(path)
        with self._registry_lock:
            entry = self._get_entry(account_key, group)
            now = time.monotonic()
            elapsed = now - entry["last_request_time"]
            min_interval = entry["min_interval"]

            wait_time = 0.0
            if elapsed < min_interval:
                wait_time = min_interval - elapsed

        if wait_time > 0:
            logger.debug(
                f"[RateLimiter] Pacing request for {account_key}:{group}. "
                f"Sleeping {wait_time:.2f}s to respect rate {entry['rate']} req/s."
            )
            time.sleep(wait_time)

        with self._registry_lock:
            entry["last_request_time"] = time.monotonic()
            entry["total_calls"] += 1

        return wait_time

    def update_from_response(self, account_key: str, path: str, response):
        """
        Reads 'x-amzn-RateLimit-Limit' from response headers and updates the rate limit.
        """
        if response is None:
            return

        headers = getattr(response, "headers", {})
        group = self.get_endpoint_group(path)

        # 1. Search for x-amzn-RateLimit-Limit (case-insensitive)
        rate_header = None
        for k, v in headers.items():
            if k.lower() == "x-amzn-ratelimit-limit":
                rate_header = v
                break

        if rate_header is not None:
            try:
                new_rate = float(rate_header)
                if new_rate > 0:
                    with self._registry_lock:
                        entry = self._get_entry(account_key, group)
                        old_rate = entry["rate"]
                        if abs(old_rate - new_rate) > 0.0001:
                            entry["rate"] = new_rate
                            entry["min_interval"] = 1.0 / max(new_rate, 0.001)
                            logger.info(
                                f"[RateLimiter] Dynamic rate limit updated for {account_key}:{group}: "
                                f"{old_rate} -> {new_rate} req/s (interval: {entry['min_interval']:.2f}s)"
                            )
            except (ValueError, TypeError) as e:
                logger.debug(f"[RateLimiter] Could not parse x-amzn-RateLimit-Limit: {rate_header} ({e})")

        # 2. Track 429 status
        if getattr(response, "status_code", None) == 429:
            with self._registry_lock:
                entry = self._get_entry(account_key, group)
                entry["total_429s"] += 1

    def get_backoff_delay(self, account_key: str, path: str, response, attempt: int) -> float:
        """
        Calculates dynamic backoff delay when receiving HTTP 429 QuotaExceeded.
        Respects 'Retry-After' header if present, otherwise uses dynamic exponential backoff with jitter.
        """
        group = self.get_endpoint_group(path)
        with self._registry_lock:
            entry = self._get_entry(account_key, group)
            rate = entry["rate"]
            min_interval = entry["min_interval"]

        # Check for Retry-After header
        retry_after = 0.0
        if response is not None and hasattr(response, "headers"):
            for k, v in response.headers.items():
                if k.lower() == "retry-after":
                    try:
                        retry_after = float(v)
                        break
                    except (ValueError, TypeError):
                        pass

        # Exponential backoff based on rate limit interval
        base_delay = min_interval * (2 ** attempt)
        jitter = random.uniform(0.5, 2.0)
        delay = max(retry_after, base_delay) + jitter

        # Cap delay at 120 seconds
        delay = min(delay, 120.0)

        logger.warning(
            f"[RateLimiter] 429 QuotaExceeded on {path} for account {account_key}. "
            f"Attempt {attempt + 1}. Current rate: {rate} req/s. Backing off for {delay:.2f}s."
        )
        return delay

    def get_rate_limit(self, account_key: str, path: str) -> float:
        """Returns the current known rate limit (req/s) for this account and endpoint."""
        group = self.get_endpoint_group(path)
        with self._registry_lock:
            entry = self._get_entry(account_key, group)
            return entry["rate"]

    def calculate_sync_estimate(
        self,
        total_orders: int,
        sync_items: bool = True,
        account_key: str = None,
    ) -> dict:
        """
        Estimates the total time required to sync orders based on token limits.

        For N orders:
        - Orders API: ceil(N / 100) pages (MaxResultsPerPage=100)
        - Order Items API: N individual requests (1 request per order)
        - Total Estimated Time = (Order Pages / Orders RPS) + (Items Requests / Items RPS)
        """
        if total_orders <= 0:
            return {
                "total_orders": 0,
                "order_api_calls": 0,
                "item_api_calls": 0,
                "total_api_calls": 0,
                "orders_rate_limit_rps": self.DEFAULT_RATES["orders_list"],
                "items_rate_limit_rps": self.DEFAULT_RATES["order_items"],
                "estimated_seconds": 0,
                "estimated_duration_formatted": "0 seconds",
            }

        orders_rps = self.get_rate_limit(account_key, "/orders/v0/orders")
        items_rps = self.get_rate_limit(account_key, "/orders/v0/orders/123/orderItems")

        # Each order page fetches up to 100 orders
        order_pages = math.ceil(total_orders / 100.0)
        orders_seconds = order_pages / max(orders_rps, 0.01)

        # If syncing items, 1 API call per order
        item_calls = total_orders if sync_items else 0
        items_seconds = item_calls / max(items_rps, 0.01)

        total_seconds = int(math.ceil(orders_seconds + items_seconds))

        return {
            "total_orders": total_orders,
            "order_api_calls": order_pages,
            "item_api_calls": item_calls,
            "total_api_calls": order_pages + item_calls,
            "orders_rate_limit_rps": orders_rps,
            "items_rate_limit_rps": items_rps,
            "estimated_seconds": total_seconds,
            "estimated_duration_formatted": self.format_duration(total_seconds),
        }

    @staticmethod
    def format_duration(seconds: int) -> str:
        """Formats seconds into human-readable hours, minutes, seconds."""
        if seconds <= 0:
            return "0 seconds"

        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        secs = seconds % 60

        parts = []
        if hours > 0:
            parts.append(f"{hours} hour{'s' if hours != 1 else ''}")
        if minutes > 0:
            parts.append(f"{minutes} minute{'s' if minutes != 1 else ''}")
        if secs > 0 or not parts:
            parts.append(f"{secs} second{'s' if secs != 1 else ''}")

        return ", ".join(parts)


# Global singleton instance for easy import across modules
spapi_rate_limiter = SPAPIRateLimiter()
