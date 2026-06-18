# subscription/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated,BasePermission
from django.db import IntegrityError, DatabaseError
from .models import *
from .serializers import *
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import Q
from django.core.paginator import Paginator

import calendar
from django.db.models import Count
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
from rest_framework.permissions import IsAuthenticated, IsAdminUser



class IsAdministrator(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_staff
    

class CustomPagination(PageNumberPagination):
    """Custom Pagination for Professional Users"""
    page_size = 10  # Number of results per page
    page_size_query_param = "page_size"
    max_page_size = 100  # Set a reasonable limit


# SubscriptionPlan CRUD with duplicate prevention

class SubscriptionPlanCreateView(APIView):
    """
    Create a new SubscriptionPlan with duplicate prevention
    """
    def post(self, request):
        try:
            subscription_type = request.data.get("subscription_type")

            # Prevent duplicates only by subscription_type
            if SubscriptionPlan.objects.filter(subscription_type=subscription_type).exists():
                return Response({
                    "statusCode": 400,
                    "status": False,
                    "message": "A SubscriptionPlan with this type already exists."
                }, status=status.HTTP_400_BAD_REQUEST)

            serializer = SubscriptionPlanSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "statusCode": 201,
                    "status": True,
                    "message": "SubscriptionPlan created successfully",
                    "data": serializer.data
                }, status=status.HTTP_201_CREATED)

            return Response({
                "statusCode": 400,
                "status": False,
                "message": "Error creating SubscriptionPlan",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Internal server error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SubscriptionPlanListView(APIView):
    """
    List subscription plans with search & pagination
    """
    def get(self, request):
        try:
            queryset = SubscriptionPlan.objects.filter(is_deleted=False)

            is_active = request.GET.get("is_active")   # true/false
            subscription_type = request.GET.get("subscription_type")  # Monthly / Annual
            status_param = request.GET.get("status")   # active / inactive

            if is_active is not None:
                queryset = queryset.filter(is_active=is_active.lower() in ["true", "1"])

            if subscription_type:
                queryset = queryset.filter(subscription_type__iexact=subscription_type)

            if status_param:
                queryset = queryset.filter(status__iexact=status_param)

            search_query = request.GET.get('search', '').strip()
            if search_query:
                queryset = queryset.filter(
                    Q(subscription__name__icontains=search_query) |
                    Q(subscription_type__icontains=search_query) |
                    Q(status__icontains=search_query)
                )

            ordering = request.GET.get('ordering', '-created_at')
            valid_ordering_fields = ['price', 'created_at', '-price', '-created_at']
            queryset = queryset.order_by(ordering if ordering in valid_ordering_fields else '-created_at')

            paginator = CustomPagination()
            paginated_queryset = paginator.paginate_queryset(queryset, request, view=self)
            serializer = SubscriptionPlanSerializer(paginated_queryset, many=True)

            # Add per_month key dynamically
            data_with_per_month = []
            for item in serializer.data:
                price = float(item.get('price', 0))
                sub_type = item.get('subscription_type', '').lower()
                if sub_type == 'annual':
                    per_month = round(price / 12, 2)
                else:
                    per_month = price
                item['per_month'] = per_month
                data_with_per_month.append(item)

            return paginator.get_paginated_response({
                "statusCode": 200,
                "status": True,
                "message": "Subscription plans fetched successfully",
                "data": data_with_per_month,
            })

        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Internal server error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UpdateSubscriptionPlanAPI(APIView):
    """
    Update SubscriptionPlan
    """
    def put(self, request, pk):
        try:
            subscription_plan = SubscriptionPlan.objects.get(pk=pk)
        except SubscriptionPlan.DoesNotExist:
            return Response({
                "statusCode": 404,
                "status": False,
                "message": "SubscriptionPlan not found"
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = SubscriptionPlanSerializer(subscription_plan, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "statusCode": 200,
                "status": True,
                "message": "SubscriptionPlan updated successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        return Response({
            "statusCode": 400,
            "status": False,
            "message": "Error updating SubscriptionPlan",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class DeleteSubscriptionPlanAPI(APIView):
    """
    Soft delete SubscriptionPlan
    """
    def delete(self, request, pk):
        try:
            subscription_plan = SubscriptionPlan.objects.get(pk=pk)
        except SubscriptionPlan.DoesNotExist:
            return Response({
                "statusCode": 404,
                "status": False,
                "message": "SubscriptionPlan not found"
            }, status=status.HTTP_404_NOT_FOUND)

        subscription_plan.is_deleted = True
        subscription_plan.is_active = False
        subscription_plan.save()

        return Response({
            "statusCode": 200,
            "status": True,
            "message": "SubscriptionPlan deleted successfully"
        }, status=status.HTTP_200_OK)



class AdminDashboardAPI(APIView):
    """
    Admin dashboard stats:
    - Overview cards (total/new users, subscription breakdown)
    - Monthly user growth graph
    Example: GET /api/admin/dashboard/?month=6&year=2026
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        try:
            now = timezone.now()
            month = int(request.GET.get('month', now.month))
            year = int(request.GET.get('year', now.year))

            if month < 1 or month > 12:
                return Response({
                    "statusCode": 400,
                    "status": False,
                    "message": "Invalid month. Must be between 1 and 12."
                }, status=status.HTTP_400_BAD_REQUEST)

            all_users = UserProfile.objects.all()

            # ---------- Overview Cards ----------
            total_users = all_users.count()

            today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            week_start = today_start - timedelta(days=today_start.weekday())  # Monday
            month_start = today_start.replace(day=1)

            new_today = all_users.filter(created_at__gte=today_start).count()
            new_this_week = all_users.filter(created_at__gte=week_start).count()
            new_this_month = all_users.filter(created_at__gte=month_start).count()

            # Subscription status breakdown
            status_counts = (
                all_users
                .values('subscription_status')
                .annotate(count=Count('id'))
            )
            status_breakdown = {item['subscription_status']: item['count'] for item in status_counts}

            trial_count = status_breakdown.get('trial', 0)
            paid_count = status_breakdown.get('paid', 0)
            inactive_count = status_breakdown.get('inactive', 0)

            active_trial_now = all_users.filter(
                subscription_status='trial',
                trial_end_date__gte=now
            ).count()

            # Active subscriptions by plan type (e.g. Monthly / Annual)
            plan_breakdown = (
                all_users
                .filter(subscription_active=True, subscriptiontype__isnull=False)
                .values('subscriptiontype__subscription_type')
                .annotate(count=Count('id'))
            )
            plan_breakdown = {
                item['subscriptiontype__subscription_type']: item['count']
                for item in plan_breakdown
            }

            # ---------- Monthly Signup Graph ----------
            month_queryset = all_users.filter(created_at__year=year, created_at__month=month)

            daily_counts = (
                month_queryset
                .annotate(date=TruncDate('created_at'))
                .values('date')
                .annotate(count=Count('id'))
                .order_by('date')
            )
            counts_dict = {item['date'].day: item['count'] for item in daily_counts}

            days_in_month = calendar.monthrange(year, month)[1]
            graph_data = [
                {
                    "day": day,
                    "date": f"{year}-{month:02d}-{day:02d}",
                    "count": counts_dict.get(day, 0)
                }
                for day in range(1, days_in_month + 1)
            ]

            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Dashboard data fetched successfully",
                "data": {
                    "overview": {
                        "total_users": total_users,
                        "new_today": new_today,
                        "new_this_week": new_this_week,
                        "new_this_month": new_this_month,
                    },
                    "subscription_summary": {
                        "inactive": inactive_count,
                        "trial": trial_count,
                        "active_trial_now": active_trial_now,
                        "paid": paid_count,
                        "plan_breakdown": plan_breakdown,
                    },
                    "monthly_signups": {
                        "month": month,
                        "year": year,
                        "total": month_queryset.count(),
                        "graph": graph_data
                    }
                }
            }, status=status.HTTP_200_OK)

        except ValueError:
            return Response({
                "statusCode": 400,
                "status": False,
                "message": "Invalid month or year format. Use integers."
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Internal server error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            


class UserListAPIView(APIView):

    def get(self, request):

        try:

            search = request.GET.get("search", "").strip()
            page = int(request.GET.get("page", 1))
            limit = int(request.GET.get("limit", 10))

            queryset = UserProfile.objects.select_related(
                "user",
                "subscriptiontype"
            ).order_by("-created_at")

            # ==========================================
            # SEARCH
            # ==========================================

            if search:

                queryset = queryset.filter(
                    Q(name__icontains=search) |
                    Q(business_name__icontains=search) |
                    Q(mobile_number__icontains=search) |
                    Q(city__icontains=search) |
                    Q(state__icontains=search) |
                    Q(user__email__icontains=search)
                )

            # ==========================================
            # PAGINATION
            # ==========================================

            paginator = Paginator(queryset, limit)
            page_obj = paginator.get_page(page)

            data = []

            for profile in page_obj:

                data.append({
                    "id": profile.id,
                    "user_id": profile.user.id,
                    "name": profile.name,
                    "email": profile.user.email,
                    "business_name": profile.business_name,
                    "mobile_number": profile.mobile_number,
                    "address": profile.address,
                    "city": profile.city,
                    "state": profile.state,
                    "pin_code": profile.pin_code,

                    "subscription_active": profile.subscription_active,
                    "is_paid_subscription_active": profile.is_paid_subscription_active,
                    "subscription_status": profile.subscription_status,

                    "subscription_plan":
                        profile.subscriptiontype.name
                        if profile.subscriptiontype
                        else None,

                    "trial_start_date": profile.trial_start_date,
                    "trial_end_date": profile.trial_end_date,

                    "created_at": profile.created_at
                })

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Users fetched successfully",
                "data": data,

                "pagination": {
                    "current_page": page,
                    "total_pages": paginator.num_pages,
                    "total_records": paginator.count,
                    "limit": limit,
                    "has_next": page_obj.has_next(),
                    "has_previous": page_obj.has_previous()
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:

            return Response({
                "status": False,
                "statusCode": 500,
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
                        