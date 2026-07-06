from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from rest_framework.response import Response
from amazon_auth.models import AmazonAccount
from .serializers import *
from .models import Module ,SubModule
from rest_framework import status


class CreateModuleAPIView(APIView):

    permission_classes = [IsAdminUser]

    def post(self, request):

        try:
            name = request.data.get("name")

            if Module.objects.filter(
                name__iexact=name,
                is_active=True
            ).exists():

                return Response({
                    "statusCode": 400,
                    "status": False,
                    "message": "Module with this name already exists."
                }, status=status.HTTP_400_BAD_REQUEST)

            serializer = ModuleSerializer(data=request.data)

            if serializer.is_valid():

                serializer.save()

                return Response({
                    "statusCode": 201,
                    "status": True,
                    "message": "Module created successfully.",
                    "data": serializer.data
                }, status=status.HTTP_201_CREATED)

            return Response({
                "statusCode": 400,
                "status": False,
                "message": "Validation failed.",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:

            return Response({
                "statusCode": 500,
                "status": False,
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ModuleListAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        try:

            modules = Module.objects.filter(
                is_active=True
            ).order_by("-id")

            serializer = ModuleSerializer(
                modules,
                many=True
            )

            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Modules fetched successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:

            return Response({
                "statusCode": 500,
                "status": False,
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ModuleDetailAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):

        try:

            module = Module.objects.get(
                pk=pk,
                is_active=True
            )

            serializer = ModuleDetailSerializer(module)

            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Module details fetched successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except Module.DoesNotExist:

            return Response({
                "statusCode": 404,
                "status": False,
                "message": "Module not found."
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:

            return Response({
                "statusCode": 500,
                "status": False,
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UpdateModuleAPIView(APIView):

    permission_classes = [IsAdminUser]

    def put(self, request, pk):

        try:

            module = Module.objects.get(pk=pk)

            name = request.data.get("name")

            if name:

                duplicate = Module.objects.filter(
                    name__iexact=name
                ).exclude(id=pk)

                if duplicate.exists():

                    return Response({
                        "statusCode": 400,
                        "status": False,
                        "message": "Module with this name already exists."
                    }, status=status.HTTP_400_BAD_REQUEST)

            serializer = ModuleSerializer(
                module,
                data=request.data,
                partial=True
            )

            if serializer.is_valid():

                serializer.save()

                return Response({
                    "statusCode": 200,
                    "status": True,
                    "message": "Module updated successfully.",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)

            return Response({
                "statusCode": 400,
                "status": False,
                "message": "Validation failed.",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except Module.DoesNotExist:

            return Response({
                "statusCode": 404,
                "status": False,
                "message": "Module not found."
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:

            return Response({
                "statusCode": 500,
                "status": False,
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DeleteModuleAPIView(APIView):

    permission_classes = [IsAdminUser]

    def delete(self, request, pk):

        try:

            module = Module.objects.get(pk=pk)

            # Soft delete module
            module.is_active = False
            module.save()

            # Soft delete related submodules
            SubModule.objects.filter(
                module=module
            ).update(
                is_active=False
            )

            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Module and related submodules deleted successfully."
            }, status=status.HTTP_200_OK)

        except Module.DoesNotExist:

            return Response({
                "statusCode": 404,
                "status": False,
                "message": "Module not found."
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:

            return Response({
                "statusCode": 500,
                "status": False,
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                                            
     
class CreateSubModuleAPIView(APIView):

    permission_classes = [IsAdminUser]

    def post(self, request):

        try:

            name = request.data.get("name")
            module_id = request.data.get("module")

            if not module_id:
                return Response({
                    "statusCode": 400,
                    "status": False,
                    "message": "module is required."
                }, status=status.HTTP_400_BAD_REQUEST)

            duplicate = SubModule.objects.filter(
                name__iexact=name,
                module_id=module_id,
                is_active=True
            )

            if duplicate.exists():
                return Response({
                    "statusCode": 400,
                    "status": False,
                    "message": "SubModule with this name already exists in this module."
                }, status=status.HTTP_400_BAD_REQUEST)

            serializer = SubModuleSerializer(
                data=request.data
            )

            if serializer.is_valid():

                serializer.save()

                return Response({
                    "statusCode": 201,
                    "status": True,
                    "message": "SubModule created successfully.",
                    "data": serializer.data
                }, status=status.HTTP_201_CREATED)

            return Response({
                "statusCode": 400,
                "status": False,
                "message": "Validation failed.",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:

            return Response({
                "statusCode": 500,
                "status": False,
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
 
class SubModuleListAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        try:

            queryset = SubModule.objects.filter(
                is_active=True
            ).select_related("module")

            serializer = SubModuleSerializer(
                queryset,
                many=True
            )

            return Response({
                "statusCode": 200,
                "status": True,
                "message": "SubModules fetched successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:

            return Response({
                "statusCode": 500,
                "status": False,
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
             

class UpdateSubModuleAPIView(APIView):

    permission_classes = [IsAdminUser]

    def put(self, request, pk):

        try:

            submodule = SubModule.objects.get(pk=pk)

            name = request.data.get("name")
            module_id = request.data.get("module")

            if name:

                duplicate = SubModule.objects.filter(
                    name__iexact=name,
                    module_id=module_id if module_id else submodule.module_id
                ).exclude(id=pk)

                if duplicate.exists():

                    return Response({
                        "statusCode": 400,
                        "status": False,
                        "message": "SubModule with this name already exists in this module."
                    }, status=status.HTTP_400_BAD_REQUEST)

            serializer = SubModuleSerializer(
                submodule,
                data=request.data,
                partial=True
            )

            if serializer.is_valid():

                serializer.save()

                return Response({
                    "statusCode": 200,
                    "status": True,
                    "message": "SubModule updated successfully.",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)

            return Response({
                "statusCode": 400,
                "status": False,
                "message": "Validation failed.",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except SubModule.DoesNotExist:

            return Response({
                "statusCode": 404,
                "status": False,
                "message": "SubModule not found."
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:

            return Response({
                "statusCode": 500,
                "status": False,
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
              
class DeleteSubModuleAPIView(APIView):

    permission_classes = [IsAdminUser]

    def delete(self, request, pk):

        try:

            submodule = SubModule.objects.get(pk=pk)

            submodule.is_active = False
            submodule.save()

            return Response({
                "statusCode": 200,
                "status": True,
                "message": "SubModule deleted successfully."
            }, status=status.HTTP_200_OK)

        except SubModule.DoesNotExist:

            return Response({
                "statusCode": 404,
                "status": False,
                "message": "SubModule not found."
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:

            return Response({
                "statusCode": 500,
                "status": False,
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                   
               
     
class AssignPermissionAPIView(APIView):

    permission_classes = [IsAdminUser]

    def post(self, request):

        serializer = UserModulePermissionSerializer(
            data=request.data
        )

        if serializer.is_valid():
            serializer.save()

            return Response({
                "status": True,
                "message": "Permission assigned",
                "data": serializer.data
            })

        return Response(serializer.errors, status=400)                
    
    
class ModuleWithSubModulesAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        modules = Module.objects.filter(
            is_active=True
        ).prefetch_related("submodules")

        serializer = ModuleWithSubModulesSerializer(
            modules,
            many=True
        )

        return Response({
            "status": True,
            "message": "Modules fetched successfully",
            "data": serializer.data
        })    
        
class PermissionListAPIView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request):

        permissions = UserModulePermission.objects.select_related(
            "user",
            "module",
            "submodule"
        )

        serializer = UserModulePermissionSerializer(
            permissions,
            many=True
        )

        return Response({
            "status": True,
            "data": serializer.data
        })    
        
        
class UpdatePermissionAPIView(APIView):

    permission_classes = [IsAdminUser]

    def put(self, request, pk):

        try:
            permission = UserModulePermission.objects.get(pk=pk)

        except UserModulePermission.DoesNotExist:
            return Response({
                "status": False,
                "message": "Permission not found"
            }, status=404)

        serializer = UserModulePermissionSerializer(
            permission,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()

            return Response({
                "status": True,
                "message": "Permission updated successfully",
                "data": serializer.data
            })

        return Response(serializer.errors, status=400)
    
class DeletePermissionAPIView(APIView):

    permission_classes = [IsAdminUser]

    def delete(self, request, pk):

        try:
            permission = UserModulePermission.objects.get(pk=pk)

            permission.delete()

            return Response({
                "status": True,
                "message": "Permission deleted successfully"
            })

        except UserModulePermission.DoesNotExist:
            return Response({
                "status": False,
                "message": "Permission not found"
            }, status=404)                
            

class MyModulesAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        permissions = UserModulePermission.objects.filter(
            user=request.user,
            can_view=True
        ).select_related(
            "module",
            "submodule"
        )

        data = []

        for permission in permissions:

            data.append({
                "module_id": permission.module.id if permission.module else None,
                "module_name": permission.module.name if permission.module else None,
                "submodule_id": permission.submodule.id if permission.submodule else None,
                "submodule_name": permission.submodule.name if permission.submodule else None,
                "can_view": permission.can_view,
                "can_create": permission.can_create,
                "can_update": permission.can_update,
                "can_delete": permission.can_delete,
            })

        return Response({
            "status": True,
            "message": "User modules fetched successfully",
            "data": data
        })
                    
            
            
class ModuleWithSubModulesAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        try:

            modules = Module.objects.filter(
                is_active=True
            ).prefetch_related("submodules")

            serializer = ModuleWithSubModulesSerializer(
                modules,
                many=True
            )

            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Modules fetched successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:

            return Response({
                "statusCode": 500,
                "status": False,
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            
class PermissionListAPIView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request):

        try:

            permissions = UserModulePermission.objects.select_related(
                "user",
                "module",
                "submodule"
            )

            serializer = UserModulePermissionSerializer(
                permissions,
                many=True
            )

            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Permissions fetched successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:

            return Response({
                "statusCode": 500,
                "status": False,
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
              
        
class UpdatePermissionAPIView(APIView):

    permission_classes = [IsAdminUser]

    def put(self, request, pk):

        try:

            permission = UserModulePermission.objects.get(pk=pk)

            user = request.data.get(
                "user",
                permission.user_id
            )

            module = request.data.get(
                "module",
                permission.module_id
            )

            submodule = request.data.get(
                "submodule",
                permission.submodule_id
            )

            duplicate = UserModulePermission.objects.filter(
                user_id=user,
                module_id=module,
                submodule_id=submodule
            ).exclude(
                id=pk
            )

            if duplicate.exists():

                return Response({
                    "statusCode": 400,
                    "status": False,
                    "message": "Permission already exists."
                }, status=status.HTTP_400_BAD_REQUEST)

            serializer = UserModulePermissionSerializer(
                permission,
                data=request.data,
                partial=True
            )

            if serializer.is_valid():

                serializer.save()

                return Response({
                    "statusCode": 200,
                    "status": True,
                    "message": "Permission updated successfully.",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)

            return Response({
                "statusCode": 400,
                "status": False,
                "message": "Validation failed.",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except UserModulePermission.DoesNotExist:

            return Response({
                "statusCode": 404,
                "status": False,
                "message": "Permission not found."
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:

            return Response({
                "statusCode": 500,
                "status": False,
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            
class DeletePermissionAPIView(APIView):

    permission_classes = [IsAdminUser]

    def delete(self, request, pk):

        try:

            permission = UserModulePermission.objects.get(pk=pk)

            permission.delete()

            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Permission deleted successfully."
            }, status=status.HTTP_200_OK)

        except UserModulePermission.DoesNotExist:

            return Response({
                "statusCode": 404,
                "status": False,
                "message": "Permission not found."
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:

            return Response({
                "statusCode": 500,
                "status": False,
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
                 

class MyModulesAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        try:

            permissions = UserModulePermission.objects.filter(
                user=request.user,
                can_view=True,
                module__is_active=True
            ).select_related(
                "module",
                "submodule"
            )

            data = []

            for permission in permissions:

                data.append({
                    "permission_id": permission.id,

                    "module_id": (
                        permission.module.id
                        if permission.module else None
                    ),

                    "module_name": (
                        permission.module.name
                        if permission.module else None
                    ),

                    "submodule_id": (
                        permission.submodule.id
                        if permission.submodule else None
                    ),

                    "submodule_name": (
                        permission.submodule.name
                        if permission.submodule else None
                    ),

                    "can_view": permission.can_view,
                    "can_create": permission.can_create,
                    "can_update": permission.can_update,
                    "can_delete": permission.can_delete,
                })

            return Response({
                "statusCode": 200,
                "status": True,
                "message": "User modules fetched successfully.",
                "data": data
            }, status=status.HTTP_200_OK)

        except Exception as e:

            return Response({
                "statusCode": 500,
                "status": False,
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            