from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from user_auth.models import SupportTicket, UserProfile

class SupportTicketAPITests(APITestCase):
    def setUp(self):
        # Create user 1
        self.user1 = User.objects.create_user(
            username="user1@example.com",
            email="user1@example.com",
            password="password123"
        )
        self.profile1 = UserProfile.objects.create(
            user=self.user1,
            name="User One",
            business_name="Business One",
            mobile_number="1234567890",
            address="Address One",
            city="City One",
            state="State One",
            pin_code="110001",
            accepted_terms=True
        )

        # Create user 2
        self.user2 = User.objects.create_user(
            username="user2@example.com",
            email="user2@example.com",
            password="password123"
        )
        self.profile2 = UserProfile.objects.create(
            user=self.user2,
            name="User Two",
            business_name="Business Two",
            mobile_number="0987654321",
            address="Address Two",
            city="City Two",
            state="State Two",
            pin_code="110002",
            accepted_terms=True
        )

        # Create staff user (admin)
        self.admin = User.objects.create_user(
            username="admin@example.com",
            email="admin@example.com",
            password="password123",
            is_staff=True
        )

    def test_unauthenticated_requests_are_blocked(self):
        # User ticket list
        response = self.client.get("/api/user/tickets/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Admin ticket list
        response = self.client.get("/api/user/admin/tickets/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_can_create_and_list_own_tickets(self):
        # Authenticate user 1
        self.client.force_authenticate(user=self.user1)

        # Create ticket
        data = {
            "title": "Need help with integration",
            "description": "I cannot sync my Amazon credentials.",
            "priority": "high"
        }
        response = self.client.post("/api/user/tickets/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["status"])
        self.assertEqual(response.data["data"]["title"], "Need help with integration")
        self.assertEqual(response.data["data"]["priority"], "high")
        self.assertEqual(response.data["data"]["status"], "open")
        self.assertIsNotNone(response.data["data"]["ticket_id"])

        # List tickets
        response = self.client.get("/api/user/tickets/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check that we received paginated response
        self.assertIn("results", response.data)
        results = response.data["results"]
        self.assertEqual(results["statusCode"], 200)
        self.assertEqual(len(results["data"]), 1)
        self.assertEqual(results["data"][0]["title"], "Need help with integration")

    def test_user_can_list_own_tickets_via_list_only_endpoint(self):
        # Authenticate user 1
        self.client.force_authenticate(user=self.user1)

        # Create ticket
        SupportTicket.objects.create(
            user=self.user1,
            title="Ticket via list endpoint",
            description="Details",
            priority="low"
        )

        # List tickets via the new list API
        response = self.client.get("/api/user/tickets/list/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)
        results = response.data["results"]
        self.assertEqual(results["statusCode"], 200)
        self.assertEqual(len(results["data"]), 1)
        self.assertEqual(results["data"][0]["title"], "Ticket via list endpoint")

    def test_user_cannot_access_other_users_tickets(self):
        # Create ticket for user 1
        ticket = SupportTicket.objects.create(
            user=self.user1,
            title="User 1 Ticket",
            description="Details"
        )

        # Authenticate user 2
        self.client.force_authenticate(user=self.user2)

        # Try to view details of user 1's ticket
        response = self.client.get(f"/api/user/tickets/{ticket.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_cannot_access_admin_endpoints(self):
        # Authenticate regular user 1
        self.client.force_authenticate(user=self.user1)

        # Try listing all tickets
        response = self.client.get("/api/user/admin/tickets/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Try updating a ticket
        ticket = SupportTicket.objects.create(
            user=self.user1,
            title="Ticket to update",
            description="Details"
        )
        response = self.client.put(f"/api/user/admin/tickets/{ticket.id}/update/", {"status": "in_progress"})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_list_all_tickets_and_update_them(self):
        # Create tickets
        ticket1 = SupportTicket.objects.create(
            user=self.user1,
            title="Ticket 1",
            description="Details 1"
        )
        ticket2 = SupportTicket.objects.create(
            user=self.user2,
            title="Ticket 2",
            description="Details 2"
        )

        # Authenticate admin
        self.client.force_authenticate(user=self.admin)

        # List all tickets
        response = self.client.get("/api/user/admin/support-tickets/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["results"]
        self.assertEqual(len(results["data"]), 2)

        # Update ticket 1 status and add admin note
        update_data = {
            "status": "in_progress",
            "admin_note": "We are investigating this issue."
        }
        response = self.client.put(f"/api/user/admin/tickets/{ticket1.id}/update/", update_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["status"], "in_progress")
        self.assertEqual(response.data["data"]["admin_note"], "We are investigating this issue.")

        # Verify change is saved in db
        ticket1.refresh_from_db()
        self.assertEqual(ticket1.status, "in_progress")
        self.assertEqual(ticket1.admin_note, "We are investigating this issue.")


from user_auth.models import SubUser, Module, SubModule, UserModulePermission

class SubUserAPITests(APITestCase):
    def setUp(self):
        # Create parent user (admin/merchant)
        self.parent = User.objects.create_user(
            username="merchant@example.com",
            email="merchant@example.com",
            password="password123"
        )
        self.parent_profile = UserProfile.objects.create(
            user=self.parent,
            name="Merchant Admin",
            business_name="Acme Corp",
            mobile_number="1234567890",
            address="123 Main St",
            city="Metropolis",
            state="NY",
            pin_code="10001",
            accepted_terms=True
        )

        # Create some Modules and SubModules
        self.module1 = Module.objects.create(name="Orders", slug="orders")
        self.submodule1 = SubModule.objects.create(module=self.module1, name="Pending Orders", slug="pending-orders")

        # Create a sub-user to test update/delete operations
        self.subuser_user = User.objects.create_user(
            username="employee@example.com",
            email="employee@example.com",
            password="password123"
        )
        self.subuser_profile = UserProfile.objects.create(
            user=self.subuser_user,
            name="Employee One",
            mobile_number="9999999999",
            business_name=self.parent_profile.business_name,
            address=self.parent_profile.address,
            city=self.parent_profile.city,
            state=self.parent_profile.state,
            pin_code=self.parent_profile.pin_code,
            accepted_terms=True
        )
        self.subuser_obj = SubUser.objects.create(
            user=self.subuser_user,
            parent=self.parent,
            name="Employee One",
            mobile_number="9999999999"
        )

    def test_unauthenticated_requests_are_blocked(self):
        response = self.client.get("/api/user/sub-users/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_parent_user_can_create_subuser_with_permissions(self):
        self.client.force_authenticate(user=self.parent)

        data = {
            "email": "new_employee@example.com",
            "password": "securepassword123",
            "name": "New Hire",
            "mobile_number": "8888888888",
            "permissions": [
                {
                    "module": self.module1.id,
                    "submodule": self.submodule1.id,
                    "can_view": True,
                    "can_create": True,
                    "can_update": False,
                    "can_delete": False
                }
            ]
        }
        response = self.client.post("/api/user/sub-users/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["status"])
        self.assertEqual(response.data["data"]["name"], "New Hire")
        self.assertEqual(response.data["data"]["email"], "new_employee@example.com")

        # Verify linked User, SubUser, and UserProfile exist
        new_employee_user = User.objects.get(email="new_employee@example.com")
        self.assertTrue(SubUser.objects.filter(user=new_employee_user, parent=self.parent).exists())
        
        # Verify inherited business details
        profile = new_employee_user.profile
        self.assertEqual(profile.business_name, "Acme Corp")
        self.assertEqual(profile.city, "Metropolis")

        # Verify permissions
        self.assertTrue(UserModulePermission.objects.filter(
            user=new_employee_user,
            module=self.module1,
            submodule=self.submodule1,
            can_view=True,
            can_create=True
        ).exists())

    def test_subuser_cannot_manage_subusers(self):
        # Authenticate using the sub-user
        self.client.force_authenticate(user=self.subuser_user)

        # Attempt to create another sub-user
        data = {
            "email": "another@example.com",
            "password": "password123",
            "name": "Unauthorized",
            "mobile_number": "7777777777"
        }
        response = self.client.post("/api/user/sub-users/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Attempt to list sub-users
        response = self.client.get("/api/user/sub-users/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_parent_user_can_list_and_update_subuser(self):
        self.client.force_authenticate(user=self.parent)

        # List sub-users
        response = self.client.get("/api/user/sub-users/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["results"]
        self.assertEqual(len(results["data"]), 1)

        # Update sub-user details and permissions
        update_data = {
            "name": "Employee One Updated",
            "mobile_number": "5555555555",
            "permissions": [
                {
                    "module": self.module1.id,
                    "submodule": self.submodule1.id,
                    "can_view": True,
                    "can_create": True,
                    "can_update": True,
                    "can_delete": True
                }
            ]
        }
        response = self.client.put(
            f"/api/user/sub-users/{self.subuser_obj.id}/",
            update_data,
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["name"], "Employee One Updated")

        # Verify DB updates
        self.subuser_obj.refresh_from_db()
        self.assertEqual(self.subuser_obj.name, "Employee One Updated")
        self.assertEqual(self.subuser_obj.mobile_number, "5555555555")
        
        # Verify Profile updates
        self.subuser_user.refresh_from_db()
        self.assertEqual(self.subuser_user.profile.name, "Employee One Updated")
        
        # Verify permissions update
        self.assertTrue(UserModulePermission.objects.filter(
            user=self.subuser_user,
            can_update=True,
            can_delete=True
        ).exists())

    def test_parent_user_can_delete_subuser(self):
        self.client.force_authenticate(user=self.parent)

        response = self.client.delete(f"/api/user/sub-users/{self.subuser_obj.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify cascade deletes User, SubUser, and UserProfile
        self.assertFalse(User.objects.filter(id=self.subuser_user.id).exists())
        self.assertFalse(SubUser.objects.filter(id=self.subuser_obj.id).exists())
        self.assertFalse(UserProfile.objects.filter(user_id=self.subuser_user.id).exists())


class AdminUserUpdateAPITests(APITestCase):
    def setUp(self):
        # Create normal user
        self.user = User.objects.create_user(
            username="normal@example.com",
            email="normal@example.com",
            password="password123"
        )
        self.profile = UserProfile.objects.create(
            user=self.user,
            name="Normal User",
            business_name="Normal Biz",
            mobile_number="1234567890",
            address="123 Road",
            city="Normal City",
            state="Normal State",
            pin_code="123456",
            accepted_terms=True
        )

        # Create admin user
        self.admin = User.objects.create_user(
            username="admin_user@example.com",
            email="admin_user@example.com",
            password="password123",
            is_staff=True
        )

        # Create modules & submodules
        self.module = Module.objects.create(name="Inventory", slug="inventory")
        self.submodule = SubModule.objects.create(module=self.module, name="Stock Count", slug="stock-count")

    def test_unauthenticated_requests_blocked(self):
        response = self.client.get(f"/api/user/admin/users/{self.user.id}/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_non_admin_requests_blocked(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(f"/api/user/admin/users/{self.user.id}/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response = self.client.put(f"/api/user/admin/users/{self.user.id}/", {"name": "New Name"})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_retrieve_user_details(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(f"/api/user/admin/users/{self.user.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["status"])
        self.assertEqual(response.data["data"]["email"], "normal@example.com")
        self.assertEqual(response.data["data"]["name"], "Normal User")
        self.assertEqual(len(response.data["data"]["permissions"]), 0)

    def test_admin_can_update_user_info_and_permissions(self):
        self.client.force_authenticate(user=self.admin)
        update_data = {
            "name": "Updated Name",
            "business_name": "Updated Biz",
            "email": "updated_normal@example.com",
            "is_active": False,
            "permissions": [
                {
                    "module": self.module.id,
                    "submodule": self.submodule.id,
                    "can_view": True,
                    "can_create": True,
                    "can_update": False,
                    "can_delete": False
                }
            ]
        }
        response = self.client.put(f"/api/user/admin/users/{self.user.id}/", update_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["status"])
        self.assertEqual(response.data["data"]["name"], "Updated Name")
        self.assertEqual(response.data["data"]["email"], "updated_normal@example.com")
        self.assertFalse(response.data["data"]["is_active"])
        self.assertEqual(len(response.data["data"]["permissions"]), 1)
        self.assertEqual(response.data["data"]["permissions"][0]["module"], self.module.id)
        self.assertEqual(response.data["data"]["permissions"][0]["submodule"], self.submodule.id)
        self.assertTrue(response.data["data"]["permissions"][0]["can_create"])

        # Check DB
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, "updated_normal@example.com")
        self.assertEqual(self.user.username, "updated_normal@example.com")
        self.assertFalse(self.user.is_active)
        self.assertEqual(self.user.profile.name, "Updated Name")
        self.assertTrue(UserModulePermission.objects.filter(user=self.user, module=self.module, submodule=self.submodule).exists())

    def test_admin_cannot_assign_invalid_permissions(self):
        self.client.force_authenticate(user=self.admin)
        
        # Duplicate permission check
        update_data = {
            "permissions": [
                {
                    "module": self.module.id,
                    "submodule": self.submodule.id
                },
                {
                    "module": self.module.id,
                    "submodule": self.submodule.id
                }
            ]
        }
        response = self.client.put(f"/api/user/admin/users/{self.user.id}/", update_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Invalid module check
        update_data = {
            "permissions": [
                {
                    "module": 99999
                }
            ]
        }
        response = self.client.put(f"/api/user/admin/users/{self.user.id}/", update_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


