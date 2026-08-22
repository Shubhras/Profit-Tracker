from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.authentication import JWTAuthentication

from subscription.utils.custom_response import success_response, error_response
from amazon_auth.models import AmazonAccount
from amazon_ads.models import AmazonAdsAccount
from myntra.models import MyntraConnection


class AdminMarketplaceIntegrationsAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        try:
            total_client_users = User.objects.filter(is_superuser=False, is_staff=False).count()

            amz_qs = AmazonAccount.objects.select_related("user", "user__profile").all()
            ads_qs = AmazonAdsAccount.objects.filter(is_primary=True).select_related("user", "user__profile")
            myntra_qs = MyntraConnection.objects.select_related("user", "user__profile").all()

            try:
                from blinkit.models import BlinkitAccount
                blinkit_qs = BlinkitAccount.objects.select_related("user", "user__profile").all()
            except Exception:
                blinkit_qs = []

            amz_count = amz_qs.count()
            ads_count = ads_qs.count()
            myntra_count = myntra_qs.count()
            blinkit_count = len(blinkit_qs) if hasattr(blinkit_qs, "count") else 0

            total_connections = amz_count + ads_count + myntra_count + blinkit_count

            amz_user_ids = set(amz_qs.values_list("user_id", flat=True))
            ads_user_ids = set(ads_qs.values_list("user_id", flat=True))
            myntra_user_ids = set(myntra_qs.values_list("user_id", flat=True))
            blinkit_user_ids = set(blinkit_qs.values_list("user_id", flat=True)) if hasattr(blinkit_qs, "values_list") else set()

            connected_user_ids = amz_user_ids | ads_user_ids | myntra_user_ids | blinkit_user_ids
            connected_users_count = len(connected_user_ids)

            connection_rate = round((connected_users_count / total_client_users * 100), 1) if total_client_users > 0 else 0.0

            # Determine top marketplace
            marketplaces = [
                {"name": "Amazon SP-API", "count": amz_count},
                {"name": "Amazon Ads", "count": ads_count},
                {"name": "Myntra", "count": myntra_count},
                {"name": "Blinkit", "count": blinkit_count},
            ]
            top_mp = max(marketplaces, key=lambda x: x["count"])

            connections_list = []
            req_counter = 1001

            # Amazon SP-API Connections
            for acc in amz_qs:
                user_obj = acc.user
                profile = getattr(user_obj, "profile", None)
                user_name = profile.name if profile and profile.name else user_obj.email
                company = profile.business_name if profile and profile.business_name else (user_name or "N/A")
                is_active = bool(acc.refresh_token_encrypted or acc.amazon_refresh_token)

                connections_list.append({
                    "id": f"amz_{acc.id}",
                    "request_id": f"INT-{req_counter}",
                    "user_id": user_obj.id,
                    "user_email": user_obj.email,
                    "user": user_name,
                    "company": company,
                    "marketplace": "Amazon SP-API",
                    "integration_type": "Seller API",
                    "identifier": acc.seller_central_id or acc.store_name or f"Seller #{acc.id}",
                    "requested_date": acc.created_at.strftime("%d %b %Y") if acc.created_at else "-",
                    "assigned_to": "System Auto-Sync",
                    "status": "Completed" if is_active else "Pending",
                    "completion_date": acc.created_at.strftime("%d %b %Y") if (is_active and acc.created_at) else "-",
                    "created_at": acc.created_at.isoformat() if acc.created_at else None
                })
                req_counter += 1

            # Amazon Ads Connections
            for acc in ads_qs:
                user_obj = acc.user
                profile = getattr(user_obj, "profile", None)
                user_name = profile.name if profile and profile.name else user_obj.email
                company = profile.business_name if profile and profile.business_name else (user_name or "N/A")
                is_active = bool(acc.access_token or acc.refresh_token)

                connections_list.append({
                    "id": f"ads_{acc.id}",
                    "request_id": f"INT-{req_counter}",
                    "user_id": user_obj.id,
                    "user_email": user_obj.email,
                    "user": user_name,
                    "company": company,
                    "marketplace": "Amazon Ads",
                    "integration_type": "Ads API",
                    "identifier": str(acc.profile_id or f"Profile #{acc.id}"),
                    "requested_date": acc.created_at.strftime("%d %b %Y") if acc.created_at else "-",
                    "assigned_to": "System Auto-Sync",
                    "status": "Completed" if is_active else "Pending",
                    "completion_date": acc.created_at.strftime("%d %b %Y") if (is_active and acc.created_at) else "-",
                    "created_at": acc.created_at.isoformat() if acc.created_at else None
                })
                req_counter += 1

            # Myntra Connections
            for conn in myntra_qs:
                user_obj = conn.user
                profile = getattr(user_obj, "profile", None)
                user_name = profile.name if profile and profile.name else user_obj.email
                company = profile.business_name if profile and profile.business_name else (user_name or "N/A")
                is_active = bool(conn.access_token or conn.secret_key)

                connections_list.append({
                    "id": f"myntra_{conn.id}",
                    "request_id": f"INT-{req_counter}",
                    "user_id": user_obj.id,
                    "user_email": user_obj.email,
                    "user": user_name,
                    "company": company,
                    "marketplace": "Myntra",
                    "integration_type": "Store Sync",
                    "identifier": conn.merchant_id or f"Merchant #{conn.id}",
                    "requested_date": conn.created_at.strftime("%d %b %Y") if conn.created_at else "-",
                    "assigned_to": "System Auto-Sync",
                    "status": "Completed" if is_active else "Pending",
                    "completion_date": conn.created_at.strftime("%d %b %Y") if (is_active and conn.created_at) else "-",
                    "created_at": conn.created_at.isoformat() if conn.created_at else None
                })
                req_counter += 1

            # Blinkit Connections
            if hasattr(blinkit_qs, "__iter__"):
                for acc in blinkit_qs:
                    user_obj = acc.user
                    profile = getattr(user_obj, "profile", None)
                    user_name = profile.name if profile and profile.name else user_obj.email
                    company = profile.business_name if profile and profile.business_name else (user_name or "N/A")
                    created_at = getattr(acc, "created_at", None)

                    connections_list.append({
                        "id": f"blinkit_{acc.id}",
                        "request_id": f"INT-{req_counter}",
                        "user_id": user_obj.id,
                        "user_email": user_obj.email,
                        "user": user_name,
                        "company": company,
                        "marketplace": "Blinkit",
                        "integration_type": "Store Sync",
                        "identifier": getattr(acc, "store_name", None) or f"Account #{acc.id}",
                        "requested_date": created_at.strftime("%d %b %Y") if created_at else "-",
                        "assigned_to": "System Auto-Sync",
                        "status": "Completed",
                        "completion_date": created_at.strftime("%d %b %Y") if created_at else "-",
                        "created_at": created_at.isoformat() if created_at else None
                    })
                    req_counter += 1

            # Sort connections by created_at descending
            connections_list.sort(key=lambda x: x["created_at"] or "", reverse=True)

            summary = {
                "total_requests": total_connections,
                "pending": max(0, total_client_users - connected_users_count),
                "in_progress": 0,
                "completed": total_connections,
                "connection_rate": connection_rate,
                "total_client_users": total_client_users,
                "connected_users_count": connected_users_count
            }

            channel_activity = [
                {"marketplace": "Amazon SP-API", "week": str(amz_count), "today": f"+{amz_count}"},
                {"marketplace": "Amazon Ads", "week": str(ads_count), "today": f"+{ads_count}"},
                {"marketplace": "Myntra", "week": str(myntra_count), "today": f"+{myntra_count}"},
                {"marketplace": "Blinkit", "week": str(blinkit_count), "today": f"+{blinkit_count}"},
            ]

            insights = {
                "top_marketplace": top_mp["name"] if top_mp["count"] > 0 else "None",
                "success_rate": f"{connection_rate}%",
                "avg_setup_time": "1.0 Days",
            }

            return success_response(
                message="Marketplace integration stats retrieved successfully.",
                data={
                    "summary": summary,
                    "channel_activity": channel_activity,
                    "insights": insights,
                    "connections": connections_list
                }
            )

        except Exception as e:
            return error_response(f"Failed to fetch marketplace integrations stats: {str(e)}", 500)
