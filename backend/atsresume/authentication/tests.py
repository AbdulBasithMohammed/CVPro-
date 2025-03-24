from datetime import datetime, timedelta
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
from .views import AdminRegisterView, AdminLoginView,LoginView,RegisterUserView,ForgotPasswordView,VerifyTokenView,ResetPasswordView,ContactUsView,AdminUserListView,AdminAllResumesView,AdminDeleteUserView # Import the actual view
from bson import ObjectId
from django.contrib.auth.hashers import make_password
import json


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
            'password': 'Password123'  # Ensure the password meets validation requirements
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
            'password': 'Password123'
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
            'password': 'Password123'
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

    def test_verify_token_missing_fields(self):
        request_data = {
            'email': 'john@example.com'
        }

        response = self.client.post('/auth/verify-otp/', request_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('token', response.data)
        
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


class AdminUserListViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = '/auth/admin/users/'

    @patch('authentication.views.user_collection.find')
    @patch('authentication.views.resume_collection.count_documents')
    def test_get_user_list_success(self, mock_count, mock_find):
        """Test successful retrieval of non-admin users with resume counts"""
        mock_user = {
            '_id': ObjectId(),
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john@example.com',
            'role': 'user'
        }
        mock_find.return_value = [mock_user]
        mock_count.return_value = 3

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['users']), 1)
        self.assertEqual(response.data['users'][0]['email'], 'john@example.com')
        self.assertEqual(response.data['users'][0]['total_resumes'], 3)

    @patch('authentication.views.user_collection.find')
    def test_get_empty_user_list(self, mock_find):
        """Test empty user list response"""
        mock_find.return_value = []

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['users']), 0)

    @patch('authentication.views.user_collection.find')
    def test_database_error(self, mock_find):
        """Test database exception handling"""
        mock_find.side_effect = Exception("Database connection failed")

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn('error', response.data)
class AdminAllResumesViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = '/auth/admin/resumes/'

    @patch('authentication.views.resume_collection.find')
    def test_get_all_resumes_success(self, mock_find):
        """Test successful retrieval of all resumes with complete data"""
        test_resume = {
            '_id': ObjectId(),
            'user_id': '67c2ddd26ad3bf101453a3c1',
            'title': 'Software Engineer',
            'email': 'test@example.com',
            'image_id': '67d7b53a81a62c5d5fa0dcfc',
            'resume_details': {
                'personal': {
                    'name': 'John Doe',
                    'email': 'john@example.com',
                    'phone': '1234567890',
                    'address': '123 Main St'
                },
                'education': [{
                    'institution': 'University',
                    'graduationDate': '2023',
                    'course': 'Computer Science'
                }],
                'skills': ['Python', 'Django']
            }
        }
        mock_find.return_value = [test_resume]

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['resumes']), 1)
        
        # Test top-level fields
        resume_data = response.data['resumes'][0]
        self.assertEqual(resume_data['user_id'], '67c2ddd26ad3bf101453a3c1')
        self.assertEqual(resume_data['title'], 'Software Engineer')
        
        # Test nested personal info
        personal_info = resume_data['personal_info']
        self.assertEqual(personal_info['name'], 'John Doe')
        self.assertEqual(personal_info['email'], 'john@example.com')
        
        # Test education array
        self.assertEqual(len(resume_data['education']), 1)
        self.assertEqual(resume_data['education'][0]['institution'], 'University')
        
        # Test skills array
        self.assertEqual(len(resume_data['skills']), 2)
        self.assertIn('Python', resume_data['skills'])

    @patch('authentication.views.resume_collection.find')
    def test_get_empty_resume_list(self, mock_find):
        """Test empty resume list response"""
        mock_find.return_value = []

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['resumes']), 0)

    @patch('authentication.views.resume_collection.find')
    def test_partial_resume_data(self, mock_find):
        """Test handling of resumes with missing fields"""
        test_resume = {
            '_id': ObjectId(),
            'user_id': '67c2ddd26ad3bf101453a3c1',
            # Missing title and email
            'resume_details': {
                'personal': {
                    'name': 'Jane Doe'
                    # Missing other personal info
                }
                # Missing education, skills, etc.
            }
        }
        mock_find.return_value = [test_resume]

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        resume_data = response.data['resumes'][0]
        self.assertEqual(resume_data['title'], "")  # Default empty string
        self.assertEqual(resume_data['personal_info']['name'], 'Jane Doe')
        self.assertEqual(resume_data['personal_info']['phone'], "")  # Default empty
        self.assertEqual(resume_data['education'], [])  # Default empty list

    @patch('authentication.views.resume_collection.find')
    def test_database_error(self, mock_find):
        """Test database exception handling"""
        mock_find.side_effect = Exception("Database connection failed")

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn('error', response.data)
        self.assertIn('Failed to fetch resumes', response.data['error'])

class AdminDeleteUserViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.valid_id = '507f1f77bcf86cd799439011'
        self.invalid_id = 'invalid-id'
        self.nonexistent_id = '000000000000000000000000'

    @patch('authentication.views.resume_collection.delete_many')
    @patch('authentication.views.user_collection.delete_one')
    @patch('authentication.views.user_collection.find_one')
    def test_delete_user_success(self, mock_find, mock_user_delete, mock_resume_delete):
        mock_find.return_value = {'_id': ObjectId(self.valid_id)}
        mock_user_delete.return_value = MagicMock(deleted_count=1)
        mock_resume_delete.return_value = MagicMock(deleted_count=2)

        response = self.client.delete(
            f'/auth/admin/deleteusers/{self.valid_id}/',
            HTTP_ACCEPT='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['content-type'], 'application/json')
        self.assertIn('message', response.data)

    @patch('authentication.views.user_collection.find_one')
    def test_delete_nonexistent_user(self, mock_find):
        mock_find.return_value = None

        response = self.client.delete(
            f'/auth/admin/deleteusers/{self.nonexistent_id}/',
            HTTP_ACCEPT='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response['content-type'], 'application/json')
        self.assertIn('error', response.data)

    def test_delete_invalid_user_id(self):
        response = self.client.delete(
            f'/auth/admin/deleteusers/{self.invalid_id}/',
            HTTP_ACCEPT='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response['content-type'], 'application/json')
        self.assertIn('error', response.data)

    @patch('authentication.views.user_collection.find_one')
    @patch('authentication.views.user_collection.delete_one')
    def test_database_error_on_delete(self, mock_delete, mock_find):
        mock_find.return_value = {'_id': ObjectId(self.valid_id)}
        mock_delete.side_effect = Exception("Deletion failed")

        response = self.client.delete(
            f'/auth/admin/deleteusers/{self.valid_id}/',
            HTTP_ACCEPT='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertEqual(response['content-type'], 'application/json')
        self.assertIn('error', response.data)