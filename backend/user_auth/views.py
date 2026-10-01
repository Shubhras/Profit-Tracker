from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from amazon_ads.models import AmazonAdsAccount
from amazon_auth.models import AmazonAccount
from blinkit.models import BlinkitAccount
from myntra.models import MyntraConnection


class ConnectedMarketplacesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Fetch connected accounts for user
        amazon_qs = AmazonAccount.objects.filter(user=user).order_by('-created_at')
        amazon_ads_qs = AmazonAdsAccount.objects.filter(user=user)
        myntra_qs = MyntraConnection.objects.filter(user=user).order_by('-created_at')
        blinkit_qs = BlinkitAccount.objects.filter(user=user).order_by('-created_at')

        # Default marketplaces list
        marketplaces = [
            {"id": "amazon", "name": "Amazon", "domain": "amazon.com", "img": None, "status": "disconnected", "connectedCount": 0, "connected_on": None, "store_name": None, "storename": None},
            {"id": "amazon_ads", "name": "Amazon (Ads)", "domain": "amazon.com", "img": None, "status": "disconnected", "connectedCount": 0, "connected_on": None, "store_name": None, "storename": None},
            {"id": "flipkart", "name": "Flipkart", "domain": "flipkart.com", "img": None, "status": "disconnected", "connectedCount": 0, "connected_on": None, "store_name": None, "storename": None},
            {"id": "myntra", "name": "Myntra", "domain": "myntra.com", "img": None, "status": "disconnected", "connectedCount": 0, "connected_on": None, "store_name": None, "storename": None},
            {"id": "meesho", "name": "Meesho", "domain": "meesho.com", "img": None, "status": "disconnected", "connectedCount": 0, "connected_on": None, "store_name": None, "storename": None},
            {"id": "ajio", "name": "Ajio", "domain": "ajio.com", "img": None, "status": "disconnected", "connectedCount": 0, "connected_on": None, "store_name": None, "storename": None},
            {"id": "nykaa", "name": "Nykaa", "domain": "nykaa.com", "img": None, "status": "disconnected", "connectedCount": 0, "connected_on": None, "store_name": None, "storename": None},
            {"id": "shopify", "name": "Shopify", "domain": "shopify.com", "img": None, "status": "disconnected", "connectedCount": 0, "connected_on": None, "store_name": None, "storename": None},
            {"id": "woocommerce", "name": "WooCommerce", "domain": "woocommerce.com", "img": None, "status": "disconnected", "connectedCount": 0, "connected_on": None, "store_name": None, "storename": None},
            {"id": "magento", "name": "Magento", "domain": "magento.com", "img": None, "status": "disconnected", "connectedCount": 0, "connected_on": None, "store_name": None, "storename": None},
            {"id": "blinkit", "name": "Blinkit", "domain": "blinkit.com", "img": None, "status": "disconnected", "connectedCount": 0, "connected_on": None, "store_name": None, "storename": None},
            {"id": "zepto", "name": "Zepto", "domain": "zeptonow.com", "img": None, "status": "disconnected", "connectedCount": 0, "connected_on": None, "store_name": None, "storename": None},
            {"id": "swiggy", "name": "Swiggy Instamart", "domain": "swiggy.com", "img": None, "status": "disconnected", "connectedCount": 0, "connected_on": None, "store_name": None, "storename": None},
            {"id": "tally", "name": "Tally", "domain": "tallysolutions.com", "img": None, "status": "disconnected", "connectedCount": 0, "connected_on": None, "store_name": None, "storename": None},
            {"id": "zoho", "name": "Zoho Books", "domain": "zoho.com", "img": None, "status": "disconnected", "connectedCount": 0, "connected_on": None, "store_name": None, "storename": None},
        ]

        # Update Amazon dynamically
        if amazon_qs.exists():
            latest_amz = amazon_qs.first()
            store_name = latest_amz.store_name or latest_amz.seller_central_id or "Amazon Store"
            connected_on = latest_amz.created_at.strftime("%d %b %Y") if latest_amz.created_at else None
            for marketplace in marketplaces:
                if marketplace["id"] == "amazon":
                    marketplace["status"] = "connected"
                    marketplace["connectedCount"] = amazon_qs.count()
                    marketplace["store_name"] = store_name
                    marketplace["storename"] = store_name
                    marketplace["connected_on"] = connected_on
                    marketplace["connectedDate"] = connected_on
                    marketplace["accounts"] = [
                        {
                            "id": acc.id,
                            "store_name": acc.store_name or acc.seller_central_id or f"Store #{acc.id}",
                            "storename": acc.store_name or acc.seller_central_id or f"Store #{acc.id}",
                            "seller_central_id": acc.seller_central_id,
                            "connected_on": acc.created_at.strftime("%d %b %Y") if acc.created_at else None,
                        }
                        for acc in amazon_qs
                    ]

        # Update Amazon Ads dynamically
        if amazon_ads_qs.exists():
            primary_ads = amazon_ads_qs.filter(is_primary=True).first() or amazon_ads_qs.order_by('-created_at').first()
            store_name = primary_ads.account_name or (str(primary_ads.profile_id) if primary_ads.profile_id else "Amazon Ads")
            connected_on = primary_ads.created_at.strftime("%d %b %Y") if primary_ads.created_at else None
            for marketplace in marketplaces:
                if marketplace["id"] == "amazon_ads":
                    marketplace["status"] = "connected"
                    marketplace["connectedCount"] = amazon_ads_qs.count()
                    marketplace["store_name"] = store_name
                    marketplace["storename"] = store_name
                    marketplace["connected_on"] = connected_on
                    marketplace["connectedDate"] = connected_on
                    marketplace["accounts"] = [
                        {
                            "id": acc.id,
                            "store_name": acc.account_name or str(acc.profile_id),
                            "storename": acc.account_name or str(acc.profile_id),
                            "profile_id": acc.profile_id,
                            "is_primary": acc.is_primary,
                            "connected_on": acc.created_at.strftime("%d %b %Y") if acc.created_at else None,
                        }
                        for acc in amazon_ads_qs
                    ]

        # Update Myntra dynamically
        if myntra_qs.exists():
            myntra_conn = myntra_qs.first()
            store_name = (
                getattr(myntra_conn, "store_name", None)
                or getattr(myntra_conn, "account_name", None)
                or myntra_conn.merchant_id
                or "Myntra Store"
            )
            connected_on = myntra_conn.created_at.strftime("%d %b %Y") if myntra_conn.created_at else None
            for marketplace in marketplaces:
                if marketplace["id"] == "myntra":
                    marketplace["status"] = "connected"
                    marketplace["connectedCount"] = myntra_qs.count()
                    marketplace["store_name"] = store_name
                    marketplace["storename"] = store_name
                    marketplace["connected_on"] = connected_on
                    marketplace["connectedDate"] = connected_on

        # Update Blinkit dynamically
        if blinkit_qs.exists():
            blinkit_acc = blinkit_qs.first()
            store_name = getattr(blinkit_acc, "store_name", None) or getattr(blinkit_acc, "name", None) or "Blinkit Store"
            connected_on = blinkit_acc.created_at.strftime("%d %b %Y") if blinkit_acc.created_at else None
            for marketplace in marketplaces:
                if marketplace["id"] == "blinkit":
                    marketplace["status"] = "connected"
                    marketplace["connectedCount"] = blinkit_qs.count()
                    marketplace["store_name"] = store_name
                    marketplace["storename"] = store_name
                    marketplace["connected_on"] = connected_on
                    marketplace["connectedDate"] = connected_on

        return Response({
            "status": "success",
            "data": marketplaces
        })