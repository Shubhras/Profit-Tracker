# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db.models import Q
from .models import AdminNotification
from .serializers import AdminNotificationSerializer
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone


class AdminNotificationListAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # Fetch notifications for this admin
        notifications = AdminNotification.objects.filter(
            receiver=user,
            is_deleted=False
        ).order_by("-created_at")

        # Mark all unread notifications as read immediately
        notifications.filter(is_read=False).update(is_read=True, read_at=timezone.now())

        # Optional filtering
        notif_type = request.query_params.get("type")
        search = request.query_params.get("search")

        if notif_type:
            notifications = notifications.filter(notification_type=notif_type)
        if search:
            notifications = notifications.filter(
                Q(title__icontains=search) | Q(message__icontains=search)
            )

        # Pagination
        paginator = PageNumberPagination()
        paginator.page_size = int(request.query_params.get("page_size", 10000))
        paginated_qs = paginator.paginate_queryset(notifications, request)

        serializer = AdminNotificationSerializer(paginated_qs, many=True)

        # Return response
        return paginator.get_paginated_response({
            "status": True,
            "statusCode": 200,
            "message": "Notifications fetched and marked as read.",
            "data": serializer.data,
        })



class AdminNotificationUnreadCountAPIView(APIView):
    """
    Returns total unread notifications count for the authenticated admin.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        count = AdminNotification.objects.filter(
            receiver=user, is_read=False, is_deleted=False
        ).count()

        return Response({
            "status": True,
            "statusCode": 200,
            "message": "Unread notifications count fetched.",
            "unread_count": count
        }, status=status.HTTP_200_OK)

