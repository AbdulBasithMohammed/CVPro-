from datetime import datetime, timedelta
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
from .views import LoginView,RegisterUserView,ForgotPasswordView,VerifyTokenView,ResetPasswordView,ContactUsView # Import the actual view
from bson import ObjectId
from django.contrib.auth.hashers import make_password
import json
from authentication.serializers import ContactSerializer,VerifyTokenSerializer
from django.utils import timezone
from django.conf import settings
import jwt
from datetime import datetime, timedelta


class RegisterUserViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    @patch('authentication.views.user_collection')
    def test_register_user_success(self, mock_user_collection):
        # Mock the MongoDB `find_one` and `insert_one` methods
        mock_user_collection.find_one.return_value = None  # Simulate no existing user
        mock_user_collection.insert_one.return_value = MagicMock(inserted_id=ObjectId())

        # Use a password that meets validation requirements
        request_data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john@example.com',
            'password': 'Password123!'  # Meets all validation requirements
        }

        response = self.client.post('/auth/register/', request_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('username', response.data)

    @patch('authentication.views.user_collection')
    def test_register_user_duplicate_email(self, mock_user_collection):
        # Mock the MongoDB `find_one` method to simulate an existing user
        mock_user_collection.find_one.return_value = {'email': 'john@example.com'}

        # Use a password that meets validation requirements
        request_data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john@example.com',
            'password': 'Password123!'  # Meets all validation requirements
        }

        response = self.client.post('/auth/register/', request_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)  # Ensure the error is about email duplication

    def test_register_user_missing_fields(self):
        # Test missing required fields
        request_data = {
            'first_name': 'John',
            'email': 'john@example.com',
            'password': 'Password123!'  # Meets all validation requirements
        }

        response = self.client.post('/auth/register/', request_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('last_name', response.data)  # Ensure the error is about missing last_name

    @patch('authentication.views.user_collection')
    def test_register_user_invalid_password(self, mock_user_collection):
        # Mock the MongoDB `find_one` method to simulate no existing user
        mock_user_collection.find_one.return_value = None

        # Use an invalid password that does not meet validation requirements
        request_data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john@example.com',
            'password': 'password'  # Invalid password (no uppercase, digit, or special character)
        }

        response = self.client.post('/auth/register/', request_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)  # Ensure the error is about invalid password

class LoginViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    @patch('authentication.views.user_collection')
    def test_login_success(self, mock_user_collection):
        mock_user_collection.find_one.return_value = {
            '_id': ObjectId(),
            'email': 'john@example.com',
            'password': make_password('password123')
        }

        request_data = {
            'email': 'john@example.com',
            'password': 'password123'
        }

        response = self.client.post('/auth/login/', request_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', response.data)

    @patch('authentication.views.user_collection')
    def test_login_invalid_password(self, mock_user_collection):
        mock_user_collection.find_one.return_value = {
            '_id': ObjectId(),
            'email': 'john@example.com',
            'password': make_password('password123')
        }

        request_data = {
            'email': 'john@example.com',
            'password': 'wrongpassword'
        }

        response = self.client.post('/auth/login/', request_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)

    def test_login_missing_fields(self):
        request_data = {
            'email': 'john@example.com'
        }

        response = self.client.post('/auth/login/', request_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)

class ForgotPasswordViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    @patch('authentication.views.user_collection')
    def test_forgot_password_success(self, mock_user_collection):
        mock_user_collection.find_one.return_value = {'email': 'john@example.com'}

        request_data = {
            'email': 'john@example.com'
        }

        response = self.client.post('/auth/forgot-password/', request_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)

    @patch('authentication.views.user_collection')
    def test_forgot_password_invalid_email(self, mock_user_collection):
        mock_user_collection.find_one.return_value = None

        request_data = {
            'email': 'nonexistent@example.com'
        }

        response = self.client.post('/auth/forgot-password/', request_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)

    def test_forgot_password_missing_email(self):
        request_data = {}

        response = self.client.post('/auth/forgot-password/', request_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

class VerifyTokenViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = '/auth/verify-otp/'  # Make sure this matches your URL config
        self.valid_data = {
            'email': 'user@example.com',
            'token': '123456'
        }
        self.expired_time = datetime.now(timezone.utc) - timedelta(minutes=10)
        self.future_time = datetime.now(timezone.utc) + timedelta(minutes=10)

    @patch('authentication.views.user_collection.find_one')
    def test_verify_token_success(self, mock_find):
        """Test successful token verification"""
        mock_find.return_value = {
            'email': 'user@example.com',
            'reset_token': '123456',
            'token_expiry': self.future_time
        }

        response = self.client.post(self.url, self.valid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch('authentication.views.user_collection.find_one')
    def test_user_not_found(self, mock_find):
        """Test with non-existent user"""
        mock_find.return_value = None
        response = self.client.post(self.url, self.valid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


    @patch('authentication.views.user_collection.find_one')
    def test_invalid_token(self, mock_find):
        """Test with incorrect token"""
        mock_find.return_value = {
            'email': 'user@example.com',
            'reset_token': '654321',
            'token_expiry': self.future_time
        }
        response = self.client.post(self.url, self.valid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('authentication.views.user_collection.update_one')
    @patch('authentication.views.user_collection.find_one')
    def test_expired_token(self, mock_find, mock_update):
        """Test with expired token"""
        mock_find.return_value = {
            'email': 'user@example.com',
            'reset_token': '123456',
            'token_expiry': self.expired_time
        }
        mock_update.return_value = MagicMock()
        response = self.client.post(self.url, self.valid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
class ResetPasswordViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    @patch('authentication.views.user_collection')
    def test_reset_password_success(self, mock_user_collection):
        """
        Test successful password reset with valid token and new password.
        """
        # Mock the user in the database
        mock_user_collection.find_one.return_value = {
            'email': 'john@example.com',
            'reset_token': '123456',
            'token_expiry': datetime.utcnow() + timedelta(minutes=5)
        }

        # Valid request data (meets all password requirements)
        request_data = {
            'email': 'john@example.com',
            'token': '123456',
            'new_password': 'Newpassword123!'
        }

        response = self.client.post('/auth/reset-password/', request_data, format='json')

        # Assertions
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'Password reset successfully.')

    @patch('authentication.views.user_collection')
    def test_reset_password_expired_token(self, mock_user_collection):
        """
        Test password reset with an expired token.
        """
        # Mock the user in the database with an expired token
        mock_user_collection.find_one.return_value = {
            'email': 'john@example.com',
            'reset_token': '123456',
            'token_expiry': datetime.utcnow() - timedelta(minutes=5)
        }

        # Valid request data but expired token
        request_data = {
            'email': 'john@example.com',
            'token': '123456',
            'new_password': 'Newpassword123!'
        }

        response = self.client.post('/auth/reset-password/', request_data, format='json')

        # Assertions
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Token has expired. Please request a new one.')

    @patch('authentication.views.user_collection')
    def test_reset_password_user_not_found(self, mock_user_collection):
        """
        Test password reset for a non-existent user.
        """
        # Mock no user found in the database
        mock_user_collection.find_one.return_value = None

        # Valid request data but user does not exist
        request_data = {
            'email': 'nonexistent@example.com',
            'token': '123456',
            'new_password': 'Newpassword123!'
        }

        response = self.client.post('/auth/reset-password/', request_data, format='json')

        # Assertions
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'User not found.')

    def test_reset_password_missing_fields(self):
        """
        Test password reset with missing required fields.
        """
        # Missing 'new_password' field
        request_data = {
            'email': 'john@example.com',
            'token': '123456'
        }

        response = self.client.post('/auth/reset-password/', request_data, format='json')

        # Assertions
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('new_password', response.data)
class ContactUsViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = '/auth/contact-us/'  # Make sure this matches your URL config
        self.valid_data = {
            'name': 'John Doe',
            'email': 'john@example.com',
            'message': 'Test message',
            'subject':'Test subject'
        }

    @patch('authentication.views.contact_collection.insert_one')
    def test_successful_contact_submission(self, mock_insert):
        mock_insert.return_value = MagicMock()
        response = self.client.post(self.url, self.valid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


    def test_missing_required_fields(self):
        test_cases = [
            {'email': 'john@example.com', 'message': 'Hello'},  # Missing name
            {'name': 'John Doe', 'message': 'Hello'},           # Missing email
            {'name': 'John Doe', 'email': 'john@example.com'}   # Missing message
        ]

        for payload in test_cases:
            with self.subTest(payload=payload):
                response = self.client.post(self.url, payload, format='json')
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class GoogleLoginViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = '/auth/google-login/'  # Make sure this matches your URL config
        self.valid_data = {
            'token': 'valid_google_token',
            'location': {'city': 'New York'}
        }
        self.google_data = {
            'email': 'user@example.com',
            'given_name': 'John',
            'family_name': 'Doe'
        }

    @patch('authentication.views.login_log_collection.insert_one')
    @patch('authentication.views.user_collection.find_one')
    @patch('authentication.views.id_token.verify_oauth2_token')
    def test_successful_login(self, mock_verify, mock_find, mock_log):
        mock_verify.return_value = self.google_data
        mock_find.return_value = None  # New user
        mock_insert = MagicMock(inserted_id='507f1f77bcf86cd799439011')
        
        with patch('authentication.views.user_collection.insert_one', return_value=mock_insert):
            with patch('authentication.views.jwt.encode', return_value='jwt_token'):
                response = self.client.post(self.url, self.valid_data, format='json')
                self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_missing_token(self):
        response = self.client.post(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('authentication.views.id_token.verify_oauth2_token')
    def test_invalid_token(self, mock_verify):
        mock_verify.side_effect = ValueError("Invalid token")
        response = self.client.post(self.url, self.valid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('authentication.views.id_token.verify_oauth2_token')
    def test_missing_email(self, mock_verify):
        mock_data = self.google_data.copy()
        mock_data.pop('email')
        mock_verify.return_value = mock_data
        response = self.client.post(self.url, self.valid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)