from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from user_auth.models import SupportTicket
from user_auth.serializers import SupportTicketSerializer
from user_auth.subscription import IsAdministrator, CustomPagination
from rest_framework.parsers import MultiPartParser, FormParser



class UserSupportTicketCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        try:
            serializer = SupportTicketSerializer(data=request.data)

            if serializer.is_valid():
                serializer.save(user=request.user)

                return Response(
                    {
                        "statusCode": 200,
                        "status": True,
                        "message": "Support ticket created successfully.",
                        "data": serializer.data,
                    },
                    status=status.HTTP_200_OK,
                )

            return Response(
                {
                    "statusCode": 400,
                    "status": False,
                    "message": "Invalid data.",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            return Response(
                {
                    "statusCode": 500,
                    "status": False,
                    "message": f"Internal server error: {str(e)}",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
            
class UserSupportTicketListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            queryset = SupportTicket.objects.filter(user=request.user).order_by("-created_at")
            
            # optional status filtering
            ticket_status = request.GET.get("status")
            if ticket_status:
                queryset = queryset.filter(status=ticket_status)

            paginator = CustomPagination()
            paginated_queryset = paginator.paginate_queryset(queryset, request, view=self)
            serializer = SupportTicketSerializer(paginated_queryset, many=True)
            return paginator.get_paginated_response({
                "statusCode": 200,
                "status": True,
                "message": "Tickets fetched successfully",
                "data": serializer.data
            })
        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Internal server error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserSupportTicketDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            ticket = SupportTicket.objects.get(pk=pk, user=request.user)
            serializer = SupportTicketSerializer(ticket)
            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Ticket details fetched successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except SupportTicket.DoesNotExist:
            return Response({
                "statusCode": 404,
                "status": False,
                "message": "Support ticket not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Internal server error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminSupportTicketListAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdministrator]

    def get(self, request):
        try:
            queryset = SupportTicket.objects.all().select_related("user", "user__profile").order_by("-created_at")
            
            search_query = request.GET.get("search", "").strip()
            if search_query:
                queryset = queryset.filter(
                    Q(ticket_id__icontains=search_query) |
                    Q(title__icontains=search_query) |
                    Q(description__icontains=search_query) |
                    Q(user__email__icontains=search_query)
                )

            ticket_status = request.GET.get("status")
            if ticket_status:
                queryset = queryset.filter(status=ticket_status)

            paginator = CustomPagination()
            paginated_queryset = paginator.paginate_queryset(queryset, request, view=self)
            serializer = SupportTicketSerializer(paginated_queryset, many=True)
            return paginator.get_paginated_response({
                "statusCode": 200,
                "status": True,
                "message": "All user tickets fetched successfully",
                "data": serializer.data
            })
        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Internal server error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminSupportTicketUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdministrator]

    def put(self, request, pk):
        try:
            ticket = SupportTicket.objects.get(pk=pk)
            # Admin can update status and admin_note
            status_val = request.data.get("status")
            admin_note_val = request.data.get("admin_note")

            if not status_val and admin_note_val is None:
                return Response({
                    "statusCode": 400,
                    "status": False,
                    "message": "At least status or admin_note is required to update."
                }, status=status.HTTP_400_BAD_REQUEST)

            if status_val:
                if status_val not in dict(SupportTicket.STATUS_CHOICES):
                    return Response({
                        "statusCode": 400,
                        "status": False,
                        "message": f"Invalid status. Must be one of: {list(dict(SupportTicket.STATUS_CHOICES).keys())}"
                    }, status=status.HTTP_400_BAD_REQUEST)
                ticket.status = status_val

            if admin_note_val is not None:
                ticket.admin_note = admin_note_val

            ticket.save()
            serializer = SupportTicketSerializer(ticket)
            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Support ticket updated successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except SupportTicket.DoesNotExist:
            return Response({
                "statusCode": 404,
                "status": False,
                "message": "Support ticket not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Internal server error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
