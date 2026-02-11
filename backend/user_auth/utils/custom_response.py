from rest_framework.response import Response


def success_response(message="Success", data=None, sourceCode=200):
    return Response({
        "sourceCode": sourceCode,
        "status": True,
        "message": message,
        "data": data if data is not None else {}
    }, status=sourceCode)


def error_response(error="Something went wrong", sourceCode=400):
    return Response({
        "sourceCode": sourceCode,
        "status": False,
        "error": error
    }, status=sourceCode)
