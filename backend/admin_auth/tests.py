from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from user_auth.models import SubUser, UserProfile

class AdminSubUserLoginTests(APITestCase):
    def setUp(self):
        # Create staff user (admin parent)
        self.admin_parent = User.objects.create_user(
            username="admin_parent@example.com",
            email="admin_parent@example.com",
            password="password123",
            is_staff=True
        )

        # Create admin subuser
        self.admin_subuser_user = User.objects.create_user(
            username="admin_subuser@example.com",
            email="admin_subuser@example.com",
            password="password123"
        )
        self.admin_subuser = SubUser.objects.create(
            user=self.admin_subuser_user,
            parent=self.admin_parent,
            name="Admin Sub",
            mobile_number="1234567890"
        )

        # Create normal user parent (merchant parent)
        self.merchant_parent = User.objects.create_user(
            username="merchant_parent@example.com",
            email="merchant_parent@example.com",
            password="password123"
        )

        # Create merchant subuser
        self.merchant_subuser_user = User.objects.create_user(
            username="merchant_subuser@example.com",
            email="merchant_subuser@example.com",
            password="password123"
        )
        self.merchant_subuser = SubUser.objects.create(
            user=self.merchant_subuser_user,
            parent=self.merchant_parent,
            name="Merchant Sub",
            mobile_number="0987654321"
        )

        # Create normal standalone user
        self.normal_user = User.objects.create_user(
            username="normal@example.com",
            email="normal@example.com",
            password="password123"
        )

    def test_admin_subuser_login_success(self):
        data = {
            "username": "admin_subuser@example.com",
            "password": "password123"
        }
        response = self.client.post("/api/admin/subuser-login/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["status"])
        self.assertIn("access", response.data["data"])
        self.assertIn("refresh", response.data["data"])
        self.assertEqual(response.data["data"]["email"], "admin_subuser@example.com")
        self.assertEqual(response.data["data"]["name"], "Admin Sub")
        self.assertEqual(response.data["data"]["parent_email"], "admin_parent@example.com")

    def test_login_invalid_credentials(self):
        data = {
            "username": "admin_subuser@example.com",
            "password": "wrongpassword"
        }
        response = self.client.post("/api/admin/subuser-login/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(response.data["status"])

    def test_merchant_subuser_login_denied(self):
        # A subuser of a normal merchant parent should not be allowed to use admin subuser login
        data = {
            "username": "merchant_subuser@example.com",
            "password": "password123"
        }
        response = self.client.post("/api/admin/subuser-login/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["status"])
        self.assertIn("Parent account is not an administrator", response.data["error"])

    def test_standalone_user_login_denied(self):
        # A normal user who is not a subuser at all should be denied
        data = {
            "username": "normal@example.com",
            "password": "password123"
        }
        response = self.client.post("/api/admin/subuser-login/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["status"])
        self.assertIn("Not an admin subuser", response.data["error"])
