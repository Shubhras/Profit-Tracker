# views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from amazon_auth.spapi_manager import SPAPIManager


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def amazon_returns_list(request):

    try:

        user = request.user

        data = request.data

        manager = SPAPIManager(user=user)

        response = manager.list_returns(

            returnLocationId=data.get("returnLocationId"),
            rmaId=data.get("rmaId"),
            status=data.get("status"),
            reverseTrackingId=data.get("reverseTrackingId"),

            createdSince=data.get("createdSince"),
            createdUntil=data.get("createdUntil"),

            lastUpdatedSince=data.get("lastUpdatedSince"),
            lastUpdatedUntil=data.get("lastUpdatedUntil"),

            maxResults=data.get("maxResults", 50),
            nextToken=data.get("nextToken"),

        )

        return Response(
            {
                "success": True,
                "response": response
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:

        return Response(
            {
                "success": False,
                "message": str(e)
            },
            status=status.HTTP_400_BAD_REQUEST
        )