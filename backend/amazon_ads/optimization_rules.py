# =========================================================
# VIEWS
# =========================================================

# FILE:
# amazon_ads/optimization_rules.py


from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from amazon_ads.models import AmazonAdsAccount
from amazon_ads.services.optimization_rules import (
    AmazonOptimizationRuleService
)
from amazon_ads.utils import refresh_ads_access_token


# =========================================================
# CREATE
# =========================================================

class CreateOptimizationRuleAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        try:

            amazon_account = AmazonAdsAccount.objects.get(
                user=request.user,
                is_primary=True
            )

            access_token = refresh_ads_access_token(
                amazon_account
            )

            result = (
                AmazonOptimizationRuleService
                .create_optimization_rule(
                    amazon_account=amazon_account,
                    access_token=access_token,
                    profile_id=amazon_account.profile_id,
                    client_id=amazon_account.client_id,
                    payload=request.data,
                    region=amazon_account.region.lower()
                )
            )

            return Response({
                "status": True,
                "message": "Optimization rule created",
                "data": result
            })

        except Exception as e:

            return Response(
                {
                    "status": False,
                    "message": str(e)
                },
                status=400
            )


# =========================================================
# UPDATE
# =========================================================

class UpdateOptimizationRuleAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def put(self, request):

        try:

            amazon_account = AmazonAdsAccount.objects.get(
                user=request.user,
                is_primary=True
            )

            access_token = refresh_ads_access_token(
                amazon_account
            )

            result = (
                AmazonOptimizationRuleService
                .update_optimization_rule(
                    amazon_account=amazon_account,
                    access_token=access_token,
                    profile_id=amazon_account.profile_id,
                    client_id=amazon_account.client_id,
                    payload=request.data,
                    region=amazon_account.region.lower()
                )
            )

            return Response({
                "status": True,
                "message": "Optimization rule updated",
                "data": result
            })

        except Exception as e:

            return Response(
                {
                    "status": False,
                    "message": str(e)
                },
                status=400
            )


# =========================================================
# DELETE
# =========================================================

class DeleteOptimizationRuleAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request):

        try:

            optimization_rule_id = request.data.get(
                "optimization_rule_id"
            )

            amazon_account = AmazonAdsAccount.objects.get(
                user=request.user,
                is_primary=True
            )

            access_token = refresh_ads_access_token(
                amazon_account
            )

            result = (
                AmazonOptimizationRuleService
                .delete_optimization_rule(
                    amazon_account=amazon_account,
                    access_token=access_token,
                    profile_id=amazon_account.profile_id,
                    client_id=amazon_account.client_id,
                    optimization_rule_id=optimization_rule_id,
                    region=amazon_account.region.lower()
                )
            )

            return Response({
                "status": True,
                "message": "Optimization rule deleted",
                "data": result
            })

        except Exception as e:

            return Response(
                {
                    "status": False,
                    "message": str(e)
                },
                status=400
            )


# =========================================================
# SEARCH
# =========================================================

class SearchOptimizationRuleAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        try:

            amazon_account = AmazonAdsAccount.objects.get(
                user=request.user,
                is_primary=True
            )

            access_token = refresh_ads_access_token(
                amazon_account
            )

            result = (
                AmazonOptimizationRuleService
                .search_optimization_rules(
                    access_token=access_token,
                    profile_id=amazon_account.profile_id,
                    client_id=amazon_account.client_id,
                    payload=request.data,
                    region=amazon_account.region.lower()
                )
            )

            return Response({
                "status": True,
                "message": "Optimization rules fetched",
                "data": result
            })

        except Exception as e:

            return Response(
                {
                    "status": False,
                    "message": str(e)
                },
                status=400
            )


# =========================================================
# ASSOCIATE
# =========================================================

class AssociateOptimizationRuleAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        try:

            campaign_id = request.data.get(
                "campaign_id"
            )

            optimization_rule_ids = request.data.get(
                "optimization_rule_ids",
                []
            )

            amazon_account = AmazonAdsAccount.objects.get(
                user=request.user,
                is_primary=True
            )

            access_token = refresh_ads_access_token(
                amazon_account
            )

            result = (
                AmazonOptimizationRuleService
                .associate_optimization_rule(
                    access_token=access_token,
                    profile_id=amazon_account.profile_id,
                    client_id=amazon_account.client_id,
                    campaign_id=campaign_id,
                    optimization_rule_ids=optimization_rule_ids,
                    region=amazon_account.region.lower()
                )
            )

            return Response({
                "status": True,
                "message": "Optimization rule associated",
                "data": result
            })

        except Exception as e:

            return Response(
                {
                    "status": False,
                    "message": str(e)
                },
                status=400
            )
        

# =========================================================
# SYNC RULES
# =========================================================

class SyncOptimizationRuleAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        try:

            amazon_account = AmazonAdsAccount.objects.get(
                user=request.user,
                is_primary=True
            )

            access_token = refresh_ads_access_token(
                amazon_account
            )

            result = (
                AmazonOptimizationRuleService
                .sync_optimization_rules(
                    amazon_account=amazon_account,
                    access_token=access_token,
                    profile_id=amazon_account.profile_id,
                    client_id=amazon_account.client_id,
                    region=amazon_account.region.lower()
                )
            )

            return Response({
                "status": True,
                "message": "Optimization rules synced successfully",
                "data": result
            })

        except Exception as e:

            return Response(
                {
                    "status": False,
                    "message": str(e)
                },
                status=400
            )


# =========================================================
# LIST RULES
# =========================================================

class ListOptimizationRuleAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        try:

            page = int(
                request.GET.get("page", 1)
            )

            page_size = int(
                request.GET.get("page_size", 20)
            )

            search = request.GET.get(
                "search"
            )

            amazon_account = AmazonAdsAccount.objects.get(
                user=request.user,
                is_primary=True
            )

            result = (
                AmazonOptimizationRuleService
                .get_optimization_rules_list(
                    amazon_account=amazon_account,
                    page=page,
                    page_size=page_size,
                    search=search
                )
            )

            return Response({
                "status": True,
                "message": "Optimization rules fetched successfully",
                "data": result
            })

        except Exception as e:

            return Response(
                {
                    "status": False,
                    "message": str(e)
                },
                status=400
            )

