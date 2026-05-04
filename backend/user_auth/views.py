from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from amazon_auth.models import AmazonAccount


class ConnectedMarketplacesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        #  Count Amazon accounts
        amazon_count = AmazonAccount.objects.filter(user=user).count()

        #  Default marketplaces list
        marketplaces = [
            {"id": "amazon", "name": "Amazon", "domain": "amazon.com", "img": None, "status": "disconnected"},
            {"id": "flipkart", "name": "Flipkart", "domain": "flipkart.com", "img": None, "status": "disconnected"},
            {"id": "myntra", "name": "Myntra", "domain": "myntra.com", "img": None, "status": "disconnected"},
            {"id": "meesho", "name": "Meesho", "domain": "meesho.com", "img": None, "status": "disconnected"},
            {"id": "ajio", "name": "Ajio", "domain": "ajio.com", "img": None, "status": "disconnected"},
            {"id": "nykaa", "name": "Nykaa", "domain": "nykaa.com", "img": None, "status": "disconnected"},
            {"id": "shopify", "name": "Shopify", "domain": "shopify.com", "img": None, "status": "disconnected"},
            {"id": "woocommerce", "name": "WooCommerce", "domain": "woocommerce.com", "img": None, "status": "disconnected"},
            {"id": "magento", "name": "Magento", "domain": "magento.com", "img": None, "status": "disconnected"},
            {"id": "blinkit", "name": "Blinkit", "domain": "blinkit.com", "img": None, "status": "disconnected"},
            {"id": "zepto", "name": "Zepto", "domain": "zeptonow.com", "img": None, "status": "disconnected"},
            {"id": "swiggy", "name": "Swiggy Instamart", "domain": "swiggy.com", "img": None, "status": "disconnected"},
            {"id": "tally", "name": "Tally", "domain": "tallysolutions.com", "img": None, "status": "disconnected"},
            {"id": "zoho", "name": "Zoho Books", "domain": "zoho.com", "img": None, "status": "disconnected"},
        ]

        #  Update Amazon dynamically
        for marketplace in marketplaces:
            if marketplace["id"] == "amazon":
                if amazon_count > 0:
                    marketplace["status"] = "connected"
                    marketplace["connectedCount"] = amazon_count

        return Response({
            "status": "success",
            "data": marketplaces
        })