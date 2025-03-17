# tests/test_admin_registration.py
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from bson import ObjectId
from django.contrib.auth.hashers import make_password

class AdminRegistrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_admin_success(self):
        request_data = {
            'first_name': 'Alice',
            'last_name': 'Smith',
            'email': 'alice@example.com',
            'password': 'password123'
        }

        response = self.client.post('/api/admin/register/', request_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['first_name'], 'Alice')
        self.assertEqual(response.data['last_name'], 'Smith')
        self.assertEqual(response.data['email'], 'alice@example.com')
        self.assertEqual(response.data['role'], 'admin')

    def test_register_admin_missing_fields(self):
        request_data = {
            'first_name': 'Alice',
            'email': 'alice@example.com',
            'password': 'password123'
        }

        response = self.client.post('/api/admin/register/', request_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('last_name', response.data)
    
    def test_register_admin_duplicate_email(self):
        # First registration
        request_data = {
            'first_name': 'Alice',
            'last_name': 'Smith',
            'email': 'alice@example.com',
            'password': 'password123'
        }
        self.client.post('/api/admin/register/', request_data, format='json')

        # Second registration with same email
        request_data_duplicate = {
            'first_name': 'Bob',
            'last_name': 'Johnson',
            'email': 'alice@example.com',
            'password': 'password456'
        }
        response = self.client.post('/api/admin/register/', request_data_duplicate, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)


# tests/test_login.py



# Mock DB (In actual, use MongoDB)
mock_db = {}

class LoginTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Insert a user in mock db to simulate MongoDB
        self.user = {
            "_id": ObjectId(),
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@example.com",
            "password": make_password("password123"),  # hashed password
            "role": "user"
        }
        mock_db[self.user['email']] = self.user  # Mock insert

    def test_login_success(self):
        request_data = {
            "email": "john@example.com",
            "password": "password123"
        }

        response = self.client.post('/api/login/', request_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', response.data)
        self.assertIn('refresh_token', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['email'], "john@example.com")

