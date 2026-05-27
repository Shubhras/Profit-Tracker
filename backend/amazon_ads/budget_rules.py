# amazon_ads/services/budget_rules.py

from .models import *
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
from django.db.models import Q
from amazon_ads.services.buged_rules import *
# pagination.py

from rest_framework.pagination import PageNumberPagination
from .serializers import *
from rest_framework.permissions import IsAuthenticated
from .utils import refresh_ads_access_token

class AdsBudgetRulePagination(PageNumberPagination):
    page_size = 10

    page_size_query_param = "page_size"

    max_page_size = 100

    
class SyncBudgetRulesAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        ad_type = request.data.get("ad_type", "sp")

        try:

            amazon_account = AmazonAdsAccount.objects.get(
                user=request.user,
                is_primary=True
            )

            result = AmazonBudgetRuleService.sync_budget_rules(
                amazon_account=amazon_account,
                access_token=amazon_account.access_token,
                profile_id=amazon_account.profile_id,
                client_id=amazon_account.client_id,
                region=amazon_account.region.lower(),
                ad_type=ad_type
            )

            return Response(
                {
                    "status": True,
                    "message": "Budget rules synced successfully",
                    "data": result
                },
                status=status.HTTP_200_OK
            )

        except AmazonAdsAccount.DoesNotExist:

            return Response(
                {
                    "status": False,
                    "message": "Amazon ads account not found for this user."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:

            return Response(
                {
                    "status": False,
                    "message": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        

class AdsBudgetRuleListAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        try:

            rule_type = request.GET.get(
                "rule_type",
                "sp"
            )

            # ---------------------------------
            # GET AMAZON ACCOUNT
            # ---------------------------------

            amazon_account = AmazonAdsAccount.objects.get(
                user=request.user,
                is_primary=True
            )

            access_token = refresh_ads_access_token(amazon_account)

            # ---------------------------------
            # AUTO SYNC BEFORE LISTING
            # ---------------------------------

            AmazonBudgetRuleService.sync_budget_rules(
                amazon_account=amazon_account,
                access_token= access_token,
                profile_id=amazon_account.profile_id,
                client_id=amazon_account.client_id,
                region=amazon_account.region.lower(),
                ad_type=rule_type
            )

            # ---------------------------------
            # QUERYSET
            # ---------------------------------

            queryset = AdsBudgetRule.objects.filter(
                amazon_account__user=request.user,
                rule_type=rule_type
            ).order_by("-id")

            # ---------------------------------
            # FILTERS
            # ---------------------------------

            rule_state = request.GET.get("rule_state")

            rule_status = request.GET.get("rule_status")

            amazon_account_id = request.GET.get(
                "amazon_account_id"
            )

            search = request.GET.get("search")

            # ---------------------------------
            # STATE FILTER
            # ---------------------------------

            if rule_state:

                queryset = queryset.filter(
                    rule_state__iexact=rule_state
                )

            # ---------------------------------
            # STATUS FILTER
            # ---------------------------------

            if rule_status:

                queryset = queryset.filter(
                    rule_status__iexact=rule_status
                )

            # ---------------------------------
            # ACCOUNT FILTER
            # ---------------------------------

            if amazon_account_id:

                queryset = queryset.filter(
                    amazon_account_id=amazon_account_id
                )

            # ---------------------------------
            # SEARCH
            # ---------------------------------

            if search:

                queryset = queryset.filter(
                    Q(name__icontains=search)
                    |
                    Q(budget_rule_id__icontains=search)
                    |
                    Q(profile_id__icontains=search)
                )

            # ---------------------------------
            # PAGINATION
            # ---------------------------------

            paginator = AdsBudgetRulePagination()

            paginated_queryset = paginator.paginate_queryset(
                queryset,
                request
            )

            serializer = AdsBudgetRuleSerializer(
                paginated_queryset,
                many=True
            )

            return paginator.get_paginated_response(
                {
                    "status": True,
                    "message": "Budget rule list fetched successfully",
                    "data": serializer.data
                }
            )

        except AmazonAdsAccount.DoesNotExist:

            return Response(
                {
                    "status": False,
                    "message": "Amazon ads account not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:

            return Response(
                {
                    "status": False,
                    "message": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )

class CreateBudgetRuleAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        try:

            ad_type = request.data.get("ad_type", "sp")

            payload = request.data

            amazon_account = AmazonAdsAccount.objects.get(
                user=request.user,
                is_primary=True
            )

            access_token = refresh_ads_access_token(amazon_account)

            result = AmazonBudgetRuleService.create_budget_rule(
                amazon_account=amazon_account,
                access_token= access_token,
                profile_id=amazon_account.profile_id,
                client_id=amazon_account.client_id,
                payload=payload,
                region=amazon_account.region.lower(),
                ad_type=ad_type
            )

            responses = (
                result.get("amazon_response", {})
                .get("responses", [])
            )

            has_error = any(
                item.get("code") not in ["SUCCESS", "Ok"]
                for item in responses
            )

            if has_error:

                return Response(
                    {
                        "status": False,
                        "message": "Amazon validation failed",
                        "data": result
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            return Response(
                {
                    "status": True,
                    "message": "Budget rule created successfully",
                    "data": result
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:

            return Response(
                {
                    "status": False,
                    "message": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )


class UpdateBudgetRuleAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def put(self, request):

        try:

            ad_type = request.data.get("ad_type", "sp")

            amazon_account = AmazonAdsAccount.objects.get(
                user=request.user,
                is_primary=True
            )

            access_token = refresh_ads_access_token(amazon_account)

            result = AmazonBudgetRuleService.update_budget_rule(
                amazon_account=amazon_account,
                access_token= access_token,
                profile_id=amazon_account.profile_id,
                client_id=amazon_account.client_id,
                payload=request.data,
                region=amazon_account.region.lower(),
                ad_type=ad_type
            )

            return Response(
                {
                    "status": True,
                    "message": "Budget rule updated successfully",
                    "data": result
                }
            )

        except Exception as e:

            return Response(
                {
                    "status": False,
                    "message": str(e)
                },
                status=400
            )

# class DeleteBudgetRuleAPIView(APIView):

#     permission_classes = [IsAuthenticated]

#     def delete(self, request, budget_rule_id):

#         try:

#             ad_type = request.GET.get("ad_type", "sp")

#             amazon_account = AmazonAdsAccount.objects.get(
#                 user=request.user,
#                 is_primary=True
#             )

#             result = AmazonBudgetRuleService.delete_budget_rule(
#                 amazon_account=amazon_account,
#                 access_token=amazon_account.access_token,
#                 profile_id=amazon_account.profile_id,
#                 client_id=amazon_account.client_id,
#                 budget_rule_id=budget_rule_id,
#                 region=amazon_account.region.lower(),
#                 ad_type=ad_type
#             )

#             return Response(
#                 {
#                     "status": True,
#                     "message": "Budget rule deleted successfully",
#                     "data": result
#                 }
#             )

#         except Exception as e:

#             return Response(
#                 {
#                     "status": False,
#                     "message": str(e)
#                 },
#                 status=400
#             )


class DeleteBudgetRuleAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, budget_rule_id):

        try:

            ad_type = request.GET.get("ad_type", "sp")

            campaign_id = request.GET.get("campaign_id")

            if not campaign_id:
                return Response(
                    {
                        "status": False,
                        "message": "campaign_id is required"
                    },
                    status=400
                )

            amazon_account = AmazonAdsAccount.objects.get(
                user=request.user,
                is_primary=True
            )

            access_token = refresh_ads_access_token(amazon_account)

            result = AmazonBudgetRuleService.delete_budget_rule(
                amazon_account=amazon_account,
                access_token= access_token,
                profile_id=amazon_account.profile_id,
                client_id=amazon_account.client_id,
                budget_rule_id=budget_rule_id,
                campaign_id=campaign_id,
                region=amazon_account.region.lower(),
                ad_type=ad_type
            )

            return Response(
                {
                    "status": True,
                    "message": "Budget rule deleted successfully",
                    "data": result
                }
            )

        except Exception as e:

            return Response(
                {
                    "status": False,
                    "message": str(e)
                },
                status=400
            )
        


class CampaignIdNameListView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        try:

            user = request.user
            data = request.data

            search = data.get("search")
            state = data.get("state")

            campaign_type = data.get("campaign_type")
            targeting_type = data.get("targeting_type")

            ordering = data.get(
                "ordering",
                "-start_date"
            )

            queryset = AdsCampaign.objects.filter(
                amazon_account__user=user,
                amazon_account__is_primary=True
            )

            # =========================
            # SEARCH
            # =========================

            if search:

                queryset = queryset.filter(

                    Q(name__icontains=search) |
                    Q(campaign_id__icontains=search)

                )

            # =========================
            # FILTERS
            # =========================

            if state:

                queryset = queryset.filter(
                    state=state
                )

            if campaign_type:

                queryset = queryset.filter(
                    campaign_type=campaign_type
                )

            if targeting_type:

                queryset = queryset.filter(
                    targeting_type=targeting_type
                )

            queryset = queryset.order_by(
                ordering
            )

            # =========================
            # RESPONSE DATA
            # =========================

            response_data = list(

                queryset.values(
                    "campaign_id",
                    "name",
                    "state"
                )

            )

            return Response({

                "status": True,
                "message": "Campaign list fetched successfully",
                "count": len(response_data),
                "data": response_data

            })

        except Exception as e:

            return Response({

                "status": False,
                "message": str(e),
                "data": []

            }, status=status.HTTP_400_BAD_REQUEST)
        
        