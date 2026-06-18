from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Promocode
from .serializers import PromocodeSerializer
from django.db import IntegrityError, DatabaseError
from django.core.exceptions import ValidationError
from django.http import Http404

class PromocodeCreateAPIView(APIView):
    """
    Only admin users (is_staff=True or is_superuser=True) can create promocodes.
    """
    def post(self, request):
        try:
            user = request.user
            if not user or not user.is_authenticated:
                return Response({
                    "status": False,
                    "statusCode": 401,
                    "message": "Admin Authentication required."
                }, status=status.HTTP_200_OK)

            if not (user.is_staff or user.is_superuser):
                return Response({
                    "status": False,
                    "statusCode": 403,
                    "message": "You do not have permission to perform this action. Admin access required."
                }, status=status.HTTP_403_FORBIDDEN)

            serializer = PromocodeSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": True,
                    "statusCode": 201,
                    "message": "Promocode created successfully",
                    "data": serializer.data
                }, status=status.HTTP_201_CREATED)

            return Response({
                "status": False,
                "statusCode": 400,
                "message": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except IntegrityError as e:
            return Response({
                "status": False,
                "statusCode": 400,
                "message": f"Integrity error: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)

        except ValidationError as e:
            return Response({
                "status": False,
                "statusCode": 400,
                "message": f"Validation error: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)

        except DatabaseError as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": f"Database error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": f"Unexpected error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# List all promocodes
class PromocodeListAPIView(APIView):
    def get(self, request):
        try:
            promocodes = Promocode.objects.filter(is_deleted=False).order_by('-created_at')
            serializer = PromocodeSerializer(promocodes, many=True)
            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Promocodes retrieved successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except DatabaseError as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": f"Database error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": f"Unexpected error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Retrieve single promocode
class PromocodeDetailAPIView(APIView):
    def get(self, request, pk):
        try:
            promocode = get_object_or_404(Promocode, pk=pk, is_deleted=False)
            serializer = PromocodeSerializer(promocode)
            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Promocode retrieved successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": f"Unexpected error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Update a promocode


class PromocodeUpdateAPIView(APIView):
    def put(self, request, pk):
        try:
            user = request.user
            if not user or not user.is_authenticated:
                return Response({
                    "status": False,
                    "statusCode": 401,
                    "message": "Admin Authentication required."
                }, status=status.HTTP_200_OK)

            if not (user.is_staff or user.is_superuser):
                return Response({
                    "status": False,
                    "statusCode": 403,
                    "message": "You do not have permission to perform this action. Admin access required."
                }, status=status.HTTP_403_FORBIDDEN)
            
            promocode = get_object_or_404(Promocode, pk=pk, is_deleted=False)
            serializer = PromocodeSerializer(promocode, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": True,
                    "statusCode": 200,
                    "message": "Promocode updated successfully",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)

            return Response({
                "status": False,
                "statusCode": 400,
                "message": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except Http404:
            return Response({
                "status": False,
                "statusCode": 404,
                "message": "Promocode not found"
            }, status=status.HTTP_200_OK)

        except IntegrityError as e:
            return Response({
                "status": False,
                "statusCode": 400,
                "message": f"Integrity error: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)

        except ValidationError as e:
            return Response({
                "status": False,
                "statusCode": 400,
                "message": f"Validation error: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)

        except DatabaseError as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": f"Database error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": f"Unexpected error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Soft delete a promocode
class PromocodeDeleteAPIView(APIView):
    def delete(self, request, pk):
        try:
            user = request.user
            if not user or not user.is_authenticated:
                return Response({
                    "status": False,
                    "statusCode": 401,
                    "message": "Admin Authentication required."
                }, status=status.HTTP_401_UNAUTHORIZED)

            promocode = get_object_or_404(Promocode, pk=pk, is_deleted=False)
            promocode.is_deleted = True
            promocode.save()

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Promocode deleted successfully"
            }, status=status.HTTP_200_OK)

        except Http404:
            return Response({
                "status": False,
                "statusCode": 404,
                "message": "Promocode not found"
            }, status=status.HTTP_200_OK)

        except DatabaseError as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": f"Database error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": f"Unexpected error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
        