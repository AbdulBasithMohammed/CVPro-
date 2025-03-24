from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
from .views import AdminRegisterView,AdminLoginView  # Import the actual view
from bson import ObjectId
from django.contrib.auth.hashers import make_password


class AdminRegistrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    @patch('authentication.views.admin_collection')  # Patch the actual MongoDB collection used in the view
    def test_register_admin_success(self, mock_admin_collection):
        # Mock the MongoDB `find_one` and `insert_one` methods
        mock_admin_collection.find_one.return_value = None  # Simulate no existing admin
        mock_admin_collection.insert_one.return_value = MagicMock(inserted_id=ObjectId())

        request_data = {
            'first_name': 'Alice',
            'last_name': 'Smith',
            'email': 'alice@example.com',
            'password': 'password123'
        }

        response = self.client.post('/auth/admin/register/', request_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['first_name'], 'Alice')
        self.assertEqual(response.data['last_name'], 'Smith')
        self.assertEqual(response.data['email'], 'alice@example.com')
        self.assertEqual(response.data['role'], 'admin')

    @patch('authentication.views.admin_collection')  # Patch the actual MongoDB collection used in the view
    def test_register_admin_missing_fields(self, mock_admin_collection):
        request_data = {
            'first_name': 'Alice',
            'email': 'alice@example.com',
            'password': 'password123'
        }

        response = self.client.post('/auth/admin/register/', request_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('last_name', response.data)

    @patch('authentication.views.admin_collection')  # Patch the actual MongoDB collection used in the view
    def test_register_admin_duplicate_email(self, mock_admin_collection):
        # Mock the MongoDB `find_one` method to simulate an existing admin
        mock_admin_collection.find_one.return_value = {
            'email': 'alice@example.com'
        }

        request_data = {
            'first_name': 'Alice',
            'last_name': 'Smith',
            'email': 'alice@example.com',
            'password': 'password123'
        }

        response = self.client.post('/auth/admin/register/', request_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)


class AdminLoginTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    @patch('authentication.views.admin_collection')  # Patch the actual MongoDB collection used in the view
    def test_admin_login_success(self, mock_admin_collection):
        # Mock the MongoDB `find_one` method to simulate an existing admin
        mock_admin_collection.find_one.return_value = {
            '_id': ObjectId(),
            'first_name': 'Admin',
            'last_name': 'User',
            'email': 'admin@example.com',
            'password': make_password('adminpass'),
            'role': 'admin'
        }

        data = {
            "email": "admin@example.com",
            "password": "adminpass"
        }

        response = self.client.post('/auth/admin/login/', data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', response.data)
        self.assertIn('refresh_token', response.data)
        self.assertEqual(response.data['user']['role'], 'admin')

    @patch('authentication.views.admin_collection')  # Patch the actual MongoDB collection used in the view
    def test_non_admin_login_should_fail(self, mock_admin_collection):
        # Mock the MongoDB `find_one` method to simulate a non-admin user
        mock_admin_collection.find_one.return_value = {
            '_id': ObjectId(),
            'first_name': 'Normal',
            'last_name': 'User',
            'email': 'user@example.com',
            'password': make_password('userpass'),
            'role': 'user'
        }

        data = {
            "email": "user@example.com",
            "password": "userpass"
        }

        response = self.client.post('/auth/admin/login/', data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['error'], 'Unauthorized. Only admin are allowed to log in.')