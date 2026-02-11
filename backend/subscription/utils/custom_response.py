from rest_framework.response import Response


def success_response(message="Success", data=None, statusCode=200):
    return Response({
        "statusCode": statusCode,
        "status": True,
        "message": message,
        "data": data if data is not None else {}
    }, status=statusCode)


def error_response(error="Something went wrong", statusCode=400):
    return Response({
        "statusCode": statusCode,
        "status": False,
        "error": error
    }, status=statusCode)


