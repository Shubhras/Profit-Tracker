# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db.models import Q
from .models import UserNotification,User,Notification
from .serializers import NotificationSerializer
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.db.models import Count, Q
from rest_framework.permissions import IsAuthenticated,IsAdminUser

class CreateNotificationAPIView(APIView):

    permission_classes = [IsAdminUser]

    def post(self, request):

        serializer = NotificationSerializer(data=request.data)

        if serializer.is_valid():

            notification = serializer.save(
                created_by=request.user
            )

            users = User.objects.filter(
                is_active=True
            )

            UserNotification.objects.bulk_create([
                UserNotification(
                    user=user,
                    notification=notification
                )
                for user in users
            ])

            return Response(
                {
                    "statusCode": status.HTTP_201_CREATED,
                    "status": True,
                    "message": "Notification sent successfully",
                    "data": {
                        "notification_id": notification.id,
                        "title": notification.title,
                    }
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            {
                "statusCode": status.HTTP_400_BAD_REQUEST,
                "status": False,
                "message": "Validation failed",
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )  
        


class AdminNotificationListAPIView(APIView):

    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):

        notifications = Notification.objects.filter(
            is_active=True
        ).order_by("-created_at")

        serializer = NotificationSerializer(
            notifications,
            many=True,
            context={"request": request}
        )

        counts = notifications.aggregate(

            total_notifications=Count("id"),

            general_count=Count(
                "id",
                filter=Q(notification_type="general")
            ),

            update_count=Count(
                "id",
                filter=Q(notification_type="update")
            ),

            maintenance_count=Count(
                "id",
                filter=Q(notification_type="maintenance")
            ),

            promotion_count=Count(
                "id",
                filter=Q(notification_type="promotion")
            ),

            subscription_count=Count(
                "id",
                filter=Q(notification_type="subscription")
            ),
        )

        return Response(
            {
                "statusCode": status.HTTP_200_OK,
                "status": True,
                "message": "Notifications fetched successfully",

                "counts": {
                    "total_notifications": counts["total_notifications"],
                    "general": counts["general_count"],
                    "update": counts["update_count"],
                    "maintenance": counts["maintenance_count"],
                    "promotion": counts["promotion_count"],
                    "subscription": counts["subscription_count"],
                },

                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )
        
class DeleteNotificationAPIView(APIView):

    permission_classes = [IsAuthenticated, IsAdminUser]

    def delete(self, request, pk):

        try:
            notification = Notification.objects.get(id=pk)

        except Notification.DoesNotExist:
            return Response(
                {
                    "statusCode": status.HTTP_404_NOT_FOUND,
                    "status": False,
                    "message": "Notification not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        notification.delete()

        return Response(
            {
                "statusCode": status.HTTP_200_OK,
                "status": True,
                "message": "Notification deleted successfully"
            },
            status=status.HTTP_200_OK
        )
# class UserNotificationListAPIView(APIView):

#     permission_classes = [IsAuthenticated]

#     def get(self, request):

#         notifications = Notification.objects.filter(
#             is_active=True
#         ).order_by("-created_at")

#         serializer = NotificationSerializer(
#             notifications,
#             many=True,
#             context={"request": request}
#         )

#         unread_count = UserNotification.objects.filter(
#             user=request.user,
#             is_read=False
#         ).count()

#         total_notifications = UserNotification.objects.filter(
#             user=request.user
#         ).count()

#         return Response(
#             {
#                 "statusCode": status.HTTP_200_OK,
#                 "status": True,
#                 "message": "Notifications fetched successfully",

#                 "counts": {
#                     "total_notifications": total_notifications,
#                     "unread_notifications": unread_count,
#                     "read_notifications": (
#                         total_notifications - unread_count
#                     )
#                 },

#                 "data": serializer.data
#             },
#             status=status.HTTP_200_OK
#         )

class UserNotificationListAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        # Mark all unread notifications as read
        UserNotification.objects.filter(
            user=request.user,
            is_read=False
        ).update(is_read=True)

        notifications = Notification.objects.filter(
            is_active=True
        ).order_by("-created_at")

        serializer = NotificationSerializer(
            notifications,
            many=True,
            context={"request": request}
        )

        total_notifications = UserNotification.objects.filter(
            user=request.user
        ).count()

        unread_count = UserNotification.objects.filter(
            user=request.user,
            is_read=False
        ).count()

        return Response(
            {
                "statusCode": status.HTTP_200_OK,
                "status": True,
                "message": "Notifications fetched successfully",

                "counts": {
                    "total_notifications": total_notifications,
                    "unread_notifications": unread_count,  # will be 0 after update
                    "read_notifications": (
                        total_notifications - unread_count
                    )
                },

                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )
                
class MarkNotificationReadAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        try:
            notification = UserNotification.objects.get(
                user=request.user,
                notification_id=pk
            )

            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save()

            return Response({
                "status": True,
                "message": "Notification marked as read"
            })

        except UserNotification.DoesNotExist:
            return Response({
                "status": False,
                "message": "Notification not found"
            }, status=404)
                    
# class AdminNotificationListAPIView(APIView):
#     permission_classes = [permissions.IsAuthenticated]

#     def get(self, request):
#         user = request.user

#         # Fetch notifications for this admin
#         notifications = AdminNotification.objects.filter(
#             receiver=user,
#             is_deleted=False
#         ).order_by("-created_at")

#         # Mark all unread notifications as read immediately
#         notifications.filter(is_read=False).update(is_read=True, read_at=timezone.now())

#         # Optional filtering
#         notif_type = request.query_params.get("type")
#         search = request.query_params.get("search")

#         if notif_type:
#             notifications = notifications.filter(notification_type=notif_type)
#         if search:
#             notifications = notifications.filter(
#                 Q(title__icontains=search) | Q(message__icontains=search)
#             )

#         # Pagination
#         paginator = PageNumberPagination()
#         paginator.page_size = int(request.query_params.get("page_size", 10000))
#         paginated_qs = paginator.paginate_queryset(notifications, request)

#         serializer = AdminNotificationSerializer(paginated_qs, many=True)

#         # Return response
#         return paginator.get_paginated_response({
#             "status": True,
#             "statusCode": 200,
#             "message": "Notifications fetched and marked as read.",
#             "data": serializer.data,
#         })



# class AdminNotificationUnreadCountAPIView(APIView):
#     """
#     Returns total unread notifications count for the authenticated admin.
#     """

#     permission_classes = [permissions.IsAuthenticated]

#     def get(self, request):
#         user = request.user
#         count = AdminNotification.objects.filter(
#             receiver=user, is_read=False, is_deleted=False
#         ).count()

#         return Response({
#             "status": True,
#             "statusCode": 200,
#             "message": "Unread notifications count fetched.",
#             "unread_count": count
#         }, status=status.HTTP_200_OK)

