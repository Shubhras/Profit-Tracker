import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Q

from user_auth.models import ContactMessage
from user_auth.serializers import ContactMessageSerializer
from user_auth.subscription import CustomPagination, IsAdministrator

logger = logging.getLogger(__name__)


from core.email_utils import get_email_logo_header_html, send_email_with_logo

def send_contact_notification_email(contact_obj):
    """
    Sends an automated email notification to the site administrator when a new contact message is received.
    """
    subject = f"TrackMyProfit - New Contact Inquiry from {contact_obj.name}"
    plain_message = f"""
New Contact Inquiry Received:

Name: {contact_obj.name}
Company: {contact_obj.company or 'N/A'}
Email: {contact_obj.email}
Phone: {contact_obj.phone}
Designation: {contact_obj.designation or 'N/A'}

Message:
{contact_obj.message}

Submitted At: {contact_obj.created_at.strftime('%Y-%m-%d %H:%M:%S')}
"""

    logo_header = get_email_logo_header_html("TrackMyProfit")

    html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; }}
        .container {{ max-width: 580px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }}
        .header {{ text-align: center; padding-bottom: 20px; border-bottom: 2px solid #eef2f5; }}
        .content {{ padding: 20px 0; color: #334155; line-height: 1.6; }}
        .info-box {{ background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0; }}
        .message-box {{ background-color: #f8fafc; border-left: 4px solid #0d9488; padding: 16px; margin: 16px 0; font-style: italic; }}
        .footer {{ text-align: center; margin-top: 25px; color: #94a3b8; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        {logo_header}
        <div class="content">
            <p>You have received a new contact message from <strong>{contact_obj.name}</strong>:</p>

            <div class="info-box">
                <p style="margin: 4px 0;"><strong>Name:</strong> {contact_obj.name}</p>
                <p style="margin: 4px 0;"><strong>Company:</strong> {contact_obj.company or 'N/A'}</p>
                <p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:{contact_obj.email}">{contact_obj.email}</a></p>
                <p style="margin: 4px 0;"><strong>Phone:</strong> {contact_obj.phone}</p>
                <p style="margin: 4px 0;"><strong>Designation:</strong> {contact_obj.designation or 'N/A'}</p>
            </div>

            <div class="message-box">
                <strong>Message:</strong><br />
                {contact_obj.message}
            </div>
        </div>
        <div class="footer">
            <p>This is an automated alert from TrackMyProfit Contact Us System.</p>
        </div>
    </div>
</body>
</html>
"""

    try:
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@trackmyprofit.com')
        admin_emails = ['letstalk@trackmyprofit.com']
        send_email_with_logo(
            subject=subject,
            plain_message=plain_message,
            from_email=from_email,
            recipient_list=admin_emails,
            html_message=html_message,
            fail_silently=True
        )
        logger.info(f"Contact notification email sent for message ID {contact_obj.id}")
    except Exception as e:
        logger.error(f"Failed to send contact notification email: {str(e)}")


class PublicContactMessageAPIView(APIView):
    """
    Public API for submitting contact inquiry messages from website visitors.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            contact_obj = serializer.save()
            send_contact_notification_email(contact_obj)

            return Response({
                "statusCode": 201,
                "status": True,
                "message": "Thank you! Your message has been received successfully.",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)

        return Response({
            "statusCode": 400,
            "status": False,
            "message": "Failed to submit message. Please check the fields and try again.",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class AdminContactMessageListAPIView(APIView):
    """
    Admin API to list, search, filter, and view website contact inquiries.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdministrator]

    def get(self, request):
        try:
            queryset = ContactMessage.objects.all().order_by("-created_at")

            search_query = request.GET.get("search", "").strip()
            if search_query:
                queryset = queryset.filter(
                    Q(name__icontains=search_query) |
                    Q(email__icontains=search_query) |
                    Q(phone__icontains=search_query) |
                    Q(company__icontains=search_query) |
                    Q(message__icontains=search_query)
                )

            status_filter = request.GET.get("status")
            if status_filter:
                queryset = queryset.filter(status=status_filter)

            paginator = CustomPagination()
            paginated_qs = paginator.paginate_queryset(queryset, request, view=self)
            serializer = ContactMessageSerializer(paginated_qs, many=True)

            return paginator.get_paginated_response({
                "statusCode": 200,
                "status": True,
                "message": "Contact messages fetched successfully.",
                "data": serializer.data
            })
        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Internal server error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminContactMessageDetailAPIView(APIView):
    """
    Admin API to update contact message status or mark as read.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdministrator]

    def put(self, request, pk):
        try:
            contact_obj = ContactMessage.objects.get(pk=pk)

            status_val = request.data.get("status")
            is_read_val = request.data.get("is_read")

            if status_val:
                if status_val not in dict(ContactMessage.STATUS_CHOICES):
                    return Response({
                        "statusCode": 400,
                        "status": False,
                        "message": f"Invalid status choices. Must be one of: {list(dict(ContactMessage.STATUS_CHOICES).keys())}"
                    }, status=status.HTTP_400_BAD_REQUEST)
                contact_obj.status = status_val

            if is_read_val is not None:
                contact_obj.is_read = bool(is_read_val)

            contact_obj.save()
            serializer = ContactMessageSerializer(contact_obj)

            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Contact message updated successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except ContactMessage.DoesNotExist:
            return Response({
                "statusCode": 404,
                "status": False,
                "message": "Contact message not found."
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Internal server error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
