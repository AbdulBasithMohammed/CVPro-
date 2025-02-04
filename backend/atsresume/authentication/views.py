# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserRegisterSerializer,LoginSerializer,ForgotPasswordSerializer,ResetPasswordSerializer,ContactSerializer
from .models import user_collection,contact_collection
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
import jwt, datetime
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from types import SimpleNamespace 
import random
import string

def generate_unique_username(first_name, last_name):
    """Generate a unique username by combining first name, last name, and a random 4-digit number."""
    base_username = f"{first_name.lower()}{last_name.lower()}"
    username = base_username

    for _ in range(10):  # Limit attempts to avoid infinite loop
        random_suffix = ''.join(random.choices(string.digits, k=4))  # Generate a 4-digit suffix
        username = f"{base_username}{random_suffix}"

        # Check if username already exists in MongoDB
        if not user_collection.find_one({'username': username}):
            return username  # Return if it's unique

    # Fallback: If somehow all 10 attempts failed, append a very unique random string
    username = f"{base_username}{random.randint(10000, 99999)}"
    return username

class RegisterUserView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            first_name = serializer.validated_data['first_name']
            last_name = serializer.validated_data['last_name']
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            # Generate a unique username
            username = generate_unique_username(first_name, last_name)
            
            # Hash the password before storing it
            hashed_password = make_password(password)
            
            # Insert the user into MongoDB
            user_data = {
                'first_name': first_name,
                'last_name': last_name,
                'username': username,  # Auto-generated username
                'email': email,
                'password': hashed_password
            }
            user_collection.insert_one(user_data)
            
            return Response({"message": "User registered successfully.", "username": username}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            # Find user in MongoDB
            user_data = user_collection.find_one({'email': email})
            if not user_data:
                return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Check password
            if not check_password(password, user_data['password']):
                return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)

            # Convert MongoDB dict to an object with an 'id' attribute
            user_obj = SimpleNamespace(id=str(user_data['_id']))  # SimpleNamespace allows attribute access
            
            # Generate JWT tokens using Simple JWT
            refresh = RefreshToken.for_user(user_obj)  # Now `user_obj` has an `id`
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            # Remove sensitive data before returning
            user_data.pop('_id')
            user_data.pop('password')

            return Response({
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user": user_data
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ForgotPasswordView(APIView):
    """
    Step 1: User enters email to request a password reset.
    """
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = user_collection.find_one({'email': email})

            if not user:
                return Response({"error": "Invalid email. No user found."}, status=status.HTTP_404_NOT_FOUND)

            return Response({"message": "Password reset request received. Check your email for reset instructions."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ResetPasswordView(APIView):
    """
    Step 2: User resets password by providing email & new password.
    Authenticates user immediately after resetting password.
    """
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            new_password = serializer.validated_data['new_password']

            user = user_collection.find_one({'email': email})
            if not user:
                return Response({"error": "Invalid email. No user found."}, status=status.HTTP_404_NOT_FOUND)

            # Hash the new password
            hashed_password = make_password(new_password)

            # Update password in MongoDB
            user_collection.update_one({'email': email}, {"$set": {'password': hashed_password}})

            # Authenticate user with the new password
            if check_password(new_password, hashed_password):
                return Response({"message": "Password reset successfully. Authentication successful."}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Password reset successful but authentication failed."}, status=status.HTTP_401_UNAUTHORIZED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ContactUsView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = ContactSerializer(data=request.data)
        
        if serializer.is_valid():
            contact_data = serializer.validated_data

            # Insert message into MongoDB
            contact_collection.insert_one(contact_data)

            return Response({"message": "Your message has been sent successfully!"}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)