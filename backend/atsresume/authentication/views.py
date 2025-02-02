# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserRegisterSerializer,LoginSerializer,ForgotPasswordSerializer,ResetPasswordSerializer
from .models import user_collection
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
import jwt, datetime
from django.conf import settings

class LoginView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            # Check if user exists in MongoDB
            user = user_collection.find_one({'email': email})
            if not user:
                return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Check password
            if not check_password(password, user['password']):
                return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Generate JWT token
            payload = {
                'id': str(user['_id']),  # MongoDB stores _id as ObjectId
                'email': user['email'],
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),  # Token expires in 1 day
                'iat': datetime.datetime.utcnow()
            }
            token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

            # Remove sensitive fields before sending user data
            user.pop('_id')  # Remove MongoDB ObjectID
            user.pop('password')  # Remove password for security

            return Response({
                "token": token,
                "user": user  # Send all user data except password
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




def generate_unique_username(first_name, last_name):
    """Generate a unique username by combining first name, last name, and a random number."""
    base_username = f"{first_name.lower()}{last_name.lower()}"
    username = base_username
    counter = 1

    while user_collection.find_one({'username': username}):
        username = f"{base_username}{random.randint(1000, 9999)}"  # Append a random number

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
