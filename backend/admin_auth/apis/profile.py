from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from admin_auth.serializers import AdminProfileSerializer


class AdminProfileAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = AdminProfileSerializer(request.user)
        return Response({
            "statusCode": 200,
            "status": True,
            "data": serializer.data
        })

    def put(self, request):
        serializer = AdminProfileSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            "statusCode": 200,
            "status": True,
            "message": "Profile updated successfully"
        })
