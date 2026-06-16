from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import LegalDocument
from rest_framework import status, permissions
from django.utils.text import slugify

from .serializers import LegalDocumentSerializer


class LegalDocumentCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        data = request.data.copy()
        # Auto-generate slug if not provided
        if not data.get('slug'):
            data['slug'] = slugify(data.get('title', ''))

        serializer = LegalDocumentSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Legal document created successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        return Response({
            "statusCode": 400,
            "status": False,
            "message": "Validation failed.",
            "errors": serializer.errors
        }, status=status.HTTP_200_OK)


class LegalDocumentListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        """
        Optional query params:
        ?title=privacy_policy
        ?language=en
        ?active=true
        """
        filters = {'is_deleted': False}

        #  Filter by title (e.g., privacy_policy, terms, cookies)
        if request.GET.get('title'):
            filters['title'] = request.GET.get('title')

        # Filter by language
        if request.GET.get('language'):
            filters['language'] = request.GET.get('language')

        #  Filter only active documents
        if request.GET.get('active') == 'true':
            filters['is_active'] = True

        documents = LegalDocument.objects.filter(**filters).order_by('-updated_at')
        serializer = LegalDocumentSerializer(documents, many=True)

        return Response({
            "statusCode": 200,
            "status": True,
            "message": "Legal documents retrieved successfully.",
            "data": serializer.data
        }, status=status.HTTP_200_OK)



class LegalDocumentDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        try:
            document = LegalDocument.objects.get(slug=slug, is_deleted=False)
            serializer = LegalDocumentSerializer(document)
            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Legal document retrieved successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except LegalDocument.DoesNotExist:
            return Response({
                "statusCode": 404,
                "status": False,
                "message": "Document not found.",
                "data": None
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": "An unexpected error occurred.",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LegalDocumentUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, id):
        try:
            document = LegalDocument.objects.get(id=id, is_deleted=False)
        except LegalDocument.DoesNotExist:
            return Response({
                "statusCode": 404,
                "status": False,
                "message": "Document not found."
            }, status=status.HTTP_200_OK)

        serializer = LegalDocumentSerializer(document, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Document updated successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                "statusCode": 400,
                "status": False,
                "message": "Validation failed.",
                "errors": serializer.errors
            }, status=status.HTTP_200_OK)


class LegalDocumentDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, id):
        try:
            document = LegalDocument.objects.get(id=id, is_deleted=False)
        except LegalDocument.DoesNotExist:
            return Response({
                "statusCode": 404,
                "status": False,
                "message": "Document not found."
            }, status=status.HTTP_200_OK)

        document.delete()

        return Response({
            "statusCode": 200,
            "status": True,
            "message": "Document deleted successfully."
        }, status=status.HTTP_200_OK)

    
class LegalDocumentTitleChoicesView(APIView):
    def get(self, request):
        choices = [{"title": key, "label": label} for key, label in LegalDocument.TITLE_CHOICES]
        return Response({
            "status": True,
            "message": "Title choices retrieved successfully.",
            "data": choices
        }, status=status.HTTP_200_OK)    


