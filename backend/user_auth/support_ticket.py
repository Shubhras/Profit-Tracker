from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from user_auth.models import SupportTicket
from user_auth.serializers import SupportTicketSerializer
from user_auth.subscription import IsAdministrator, CustomPagination
from rest_framework.parsers import MultiPartParser, FormParser


class SupportTicketPagination(PageNumberPagination):
    """
    Custom Pagination for Support Tickets.
    Supports both 'limit' and 'page_size' query parameters.
    Default page_size = 10, max_page_size = 100.
    """
    page_size = 10
    page_size_query_param = "limit"
    max_page_size = 100

    def get_page_size(self, request):
        limit = request.query_params.get("limit") or request.query_params.get("page_size")
        if limit:
            try:
                val = int(limit)
                if val > 0:
                    return min(val, self.max_page_size)
            except (ValueError, TypeError):
                pass
        return self.page_size



class UserSupportTicketCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        try:
            serializer = SupportTicketSerializer(data=request.data, context={"request": request})

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
            
            # Search query
            search_query = (request.GET.get("search") or request.GET.get("q") or "").strip()
            if search_query:
                search_filter = (
                    Q(ticket_id__icontains=search_query) |
                    Q(title__icontains=search_query) |
                    Q(description__icontains=search_query)
                )
                cleaned_num = search_query.lstrip("#")
                if cleaned_num.upper().startswith("TK-"):
                    cleaned_num = cleaned_num[3:]
                elif cleaned_num.upper().startswith("TKT-"):
                    cleaned_num = cleaned_num[4:]

                if cleaned_num.isdigit():
                    search_filter |= Q(id=int(cleaned_num))

                queryset = queryset.filter(search_filter).distinct()

            # Status filtering
            ticket_status = (request.GET.get("status") or "").strip().lower()
            if ticket_status and ticket_status != "all":
                normalized_status = ticket_status.replace(" ", "_").replace("-", "_")
                queryset = queryset.filter(status=normalized_status)

            # Priority filtering
            ticket_priority = (request.GET.get("priority") or "").strip().lower()
            if ticket_priority and ticket_priority != "all":
                queryset = queryset.filter(priority=ticket_priority)

            paginator = SupportTicketPagination()
            paginated_queryset = paginator.paginate_queryset(queryset, request, view=self)
            serializer = SupportTicketSerializer(
                paginated_queryset,
                many=True,
                context={"request": request}
            )
            return paginator.get_paginated_response({
                "statusCode": 200,
                "status": True,
                "message": "Tickets fetched successfully",
                "data": serializer.data,
                "pagination": {
                    "total": paginator.page.paginator.count,
                    "page": paginator.page.number,
                    "limit": paginator.get_page_size(request),
                    "pageSize": paginator.get_page_size(request),
                    "totalPages": paginator.page.paginator.num_pages,
                }
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
            serializer = SupportTicketSerializer(ticket, context={"request": request})
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
            
            # 1. Search Query: Ticket (ticket_id, title, description, numeric id), User (profile name, username, first_name, last_name, business_name), Email ID
            search_query = (request.GET.get("search") or request.GET.get("q") or "").strip()
            if search_query:
                search_filter = (
                    # Ticket matches
                    Q(ticket_id__icontains=search_query) |
                    Q(title__icontains=search_query) |
                    Q(description__icontains=search_query) |
                    # User matches
                    Q(user__profile__name__icontains=search_query) |
                    Q(user__first_name__icontains=search_query) |
                    Q(user__last_name__icontains=search_query) |
                    Q(user__username__icontains=search_query) |
                    Q(user__profile__business_name__icontains=search_query) |
                    # Email ID matches
                    Q(user__email__icontains=search_query)
                )

                # Check if search matches direct numeric ID / TK-# / TKT-# ID
                cleaned_num = search_query.lstrip("#")
                if cleaned_num.upper().startswith("TK-"):
                    cleaned_num = cleaned_num[3:]
                elif cleaned_num.upper().startswith("TKT-"):
                    cleaned_num = cleaned_num[4:]

                if cleaned_num.isdigit():
                    search_filter |= Q(id=int(cleaned_num))

                queryset = queryset.filter(search_filter).distinct()

            # 2. Filter by Status (e.g. open, in_progress, resolved, closed)
            ticket_status = (request.GET.get("status") or "").strip().lower()
            if ticket_status and ticket_status != "all":
                normalized_status = ticket_status.replace(" ", "_").replace("-", "_")
                queryset = queryset.filter(status=normalized_status)

            # 3. Filter by Priority (e.g. low, medium, high)
            ticket_priority = (request.GET.get("priority") or "").strip().lower()
            if ticket_priority and ticket_priority != "all":
                queryset = queryset.filter(priority=ticket_priority)

            paginator = SupportTicketPagination()
            paginated_queryset = paginator.paginate_queryset(queryset, request, view=self)
            serializer = SupportTicketSerializer(paginated_queryset, many=True, context={"request": request})
            return paginator.get_paginated_response({
                "statusCode": 200,
                "status": True,
                "message": "All user tickets fetched successfully",
                "data": serializer.data,
                "pagination": {
                    "total": paginator.page.paginator.count,
                    "page": paginator.page.number,
                    "limit": paginator.get_page_size(request),
                    "pageSize": paginator.get_page_size(request),
                    "totalPages": paginator.page.paginator.num_pages,
                }
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
            # Admin can update status, priority, and admin_note
            status_val = request.data.get("status")
            priority_val = request.data.get("priority")
            admin_note_val = request.data.get("admin_note")

            if not status_val and priority_val is None and admin_note_val is None:
                return Response({
                    "statusCode": 400,
                    "status": False,
                    "message": "At least status, priority, or admin_note is required to update."
                }, status=status.HTTP_400_BAD_REQUEST)

            if status_val:
                normalized_status = str(status_val).strip().lower().replace(" ", "_").replace("-", "_")
                if normalized_status not in dict(SupportTicket.STATUS_CHOICES):
                    return Response({
                        "statusCode": 400,
                        "status": False,
                        "message": f"Invalid status. Must be one of: {list(dict(SupportTicket.STATUS_CHOICES).keys())}"
                    }, status=status.HTTP_400_BAD_REQUEST)
                ticket.status = normalized_status

            if priority_val:
                normalized_priority = str(priority_val).strip().lower()
                if normalized_priority not in dict(SupportTicket.PRIORITY_CHOICES):
                    return Response({
                        "statusCode": 400,
                        "status": False,
                        "message": f"Invalid priority. Must be one of: {list(dict(SupportTicket.PRIORITY_CHOICES).keys())}"
                    }, status=status.HTTP_400_BAD_REQUEST)
                ticket.priority = normalized_priority

            if admin_note_val is not None:
                ticket.admin_note = admin_note_val

            ticket.save()
            serializer = SupportTicketSerializer(ticket, context={"request": request})
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

