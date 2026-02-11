from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from user_auth.serializers import UserRegisterSerializer
from subscription.utils.custom_response import success_response, error_response

class UserRegisterAPI(APIView):
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)

        if not serializer.is_valid():
            # ✅ Get proper error message
            errors = serializer.errors

            if "non_field_errors" in errors:
                msg = errors["non_field_errors"][0]
            else:
                # pick first field error message
                first_key = list(errors.keys())[0]
                msg = errors[first_key][0]

            return error_response(str(msg), 400)

        serializer.save()

        return success_response(
            message="User registered successfully",
            data={},
            statusCode=201
        )