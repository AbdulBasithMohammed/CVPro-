# views.py
from time import timezone
from requests import RequestException
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserRegisterSerializer,LoginSerializer,ForgotPasswordSerializer,ResetPasswordSerializer,ContactSerializer,VerifyTokenSerializer
from .models import user_collection,contact_collection,admin_collection,resume_collection,login_log_collection
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
import jwt, datetime
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from types import SimpleNamespace 
import random,string
from django.core.mail import send_mail
from google.auth.transport import requests
from google.oauth2 import id_token
from rest_framework.response import Response
from .serializers import AdminRegisterSerializer
from bson import ObjectId
from rest_framework.renderers import JSONRenderer



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

# views.py


class AdminRegisterView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = AdminRegisterSerializer(data=request.data)
        
        if serializer.is_valid():
            first_name = serializer.validated_data['first_name']
            last_name = serializer.validated_data['last_name']
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            if admin_collection.find_one({'email': email}):  # Simulate MongoDB query
                return Response({"email": "This email is already registered."}, status=status.HTTP_400_BAD_REQUEST)
            
            username = generate_unique_username(first_name, last_name)
            hashed_password = make_password(password)

            admin_data = {
                'first_name': first_name,
                'last_name': last_name,
                'email': email,
                'username': username,
                'password': hashed_password,
                'role': 'admin'
            }
            admin_collection.insert_one(admin_data)
            response_data = {
                'first_name': first_name,
                'last_name': last_name,
                'email': email,
                'admin_username': username,
                'role': 'admin'
            }
            # MongoDB insert mockup here
            return Response(response_data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminLoginView(APIView):
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        user_data = admin_collection.find_one({'email': email})

        if not user_data:
            return Response({"error": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)


        if user_data.get('role') != 'admin':
            return Response({"error": "Unauthorized. Only admin are allowed to log in."}, status=status.HTTP_403_FORBIDDEN)
        

        if not check_password(password, user_data['password']):
            return Response({"error": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)

        user_obj = SimpleNamespace(id=str(user_data['_id']))
        refresh = RefreshToken.for_user(user_obj)

        user_response = {
            "_id": str(user_data['_id']),
            "first_name": user_data.get('first_name'),
            "last_name": user_data.get('last_name'),
            "email": user_data.get('email'),
            "role": user_data.get('role')
        }

        return Response({
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),
            "user": user_response
        }, status=status.HTTP_200_OK)
    
class RegisterUserView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = UserRegisterSerializer(data=request.data)
        
        if serializer.is_valid():
            first_name = serializer.validated_data['first_name']
            last_name = serializer.validated_data['last_name']
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            location = request.data.get('location', {})  # Extract location from request data
            
            if user_collection.find_one({'email': email}):
                return Response(
                    {'email': 'A user with this email already exists.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Generate a unique username
            username = generate_unique_username(first_name, last_name)
            
            # Hash the password before storing it
            hashed_password = make_password(password)
            
            # Get current timestamp
            created_at = datetime.utcnow()  # UTC timestamp for consistency
            
            # Insert the user into MongoDB, including the location and created_at data
            user_data = {
                'first_name': first_name,
                'last_name': last_name,
                'username': username,  # Auto-generated username
                'email': email,
                'password': hashed_password,
                'location': location,  # Save the location data
                'created_at': created_at  # Store the current timestamp
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
                # Log the failed login attempt
                self.log_login_attempt(request, email, success=False)
                return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)

            # Check password
            if not check_password(password, user_data['password']):
                # Log the failed login attempt
                self.log_login_attempt(request, email, success=False)
                return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)

            # Convert MongoDB dict to an object with an 'id' attribute
            user_obj = SimpleNamespace(id=str(user_data['_id']))  # SimpleNamespace allows attribute access

            # Generate JWT tokens using Simple JWT
            refresh = RefreshToken.for_user(user_obj)  # Now `user_obj` has an `id`
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            # Remove sensitive data before returning
            user_data['_id'] = str(user_data['_id'])
            user_data.pop('password')

            # Log the successful login attempt
            self.log_login_attempt(request, email, success=True)

            return Response({
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user": user_data
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def log_login_attempt(self, request, email, success):
        """
        Logs the login attempt details to the MongoDB login log collection.
        """
        ip_address = request.META.get('REMOTE_ADDR', '')
        timestamp = timezone.now()

        log_entry = {
            "email": email,
            "ip_address": ip_address,
            "success": success,
            "timestamp": timestamp,
            "user_agent": request.META.get('HTTP_USER_AGENT', ''),
        }

        # Store the log entry in the login_logs collection
        login_log_collection.insert_one(log_entry)

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

            # Generate a 6-digit token
            reset_token = str(random.randint(100000, 999999))
            expiry_time = datetime.datetime.utcnow() + datetime.timedelta(minutes=5)  # Token expires in 5 min

            # Save token and expiry time in MongoDB
            user_collection.update_one({'email': email}, {'$set': {'reset_token': reset_token, 'token_expiry': expiry_time}})

            # Send email with the token
            self.send_reset_email(email, reset_token)

            return Response({"message": "Password reset token sent to your email."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def send_reset_email(self, email, token):
        subject = "Password Reset Request"
        message = f"Your password reset code is: {token}\nThis code is valid for 5 minutes."
        print("flag : ",settings.EMAIL_HOST_USER)
        from_email =  settings.EMAIL_HOST_USER  # Replace with your email
        recipient_list = [email]

        send_mail(subject, message, from_email, recipient_list, fail_silently=False)

class VerifyTokenView(APIView):
    """
    Step 2: User enters the 6-digit token to verify identity.
    """
    def post(self, request):
        serializer = VerifyTokenSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            token = serializer.validated_data['token']

            # Find user in MongoDB
            user = user_collection.find_one({'email': email})
            if not user:
                return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

            # Check if token exists
            stored_token = user.get('reset_token')
            token_expiry = user.get('token_expiry')

            if not stored_token or not token_expiry:
                return Response({"error": "No token found. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)

            # ✅ Fix: `token_expiry` is already a `datetime.datetime` object
            if token != stored_token:
                return Response({"error": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)

            if datetime.datetime.utcnow() > token_expiry:
                user_collection.update_one({'email': email}, {'$unset': {'reset_token': "", 'token_expiry': ""}})
                return Response({"error": "Token has expired. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)

            return Response({"message": "Token verified successfully. You can now reset your password."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ResetPasswordView(APIView):
    """
    Step 3: User resets the password after verifying the token.
    """
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']

            # Find user in MongoDB
            user = user_collection.find_one({'email': email})
            if not user:
                return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

            # Check if token matches and is not expired
            stored_token = user.get('reset_token')
            token_expiry = user.get('token_expiry')

            if not stored_token or not token_expiry:
                return Response({"error": "No valid reset token found. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)

            # ✅ Fix: `token_expiry` is already a `datetime.datetime` object
            if token != stored_token:
                return Response({"error": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)

            if datetime.datetime.utcnow() > token_expiry:
                return Response({"error": "Token has expired. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)

            # Hash the new password before saving
            hashed_password = make_password(new_password)

            # Update the password and remove the reset token
            user_collection.update_one({'email': email}, {'$set': {'password': hashed_password}, '$unset': {'reset_token': "", 'token_expiry': ""}})

            return Response({"message": "Password reset successfully."}, status=status.HTTP_200_OK)

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
class GoogleLoginView(APIView):
    def post(self, request):
        token = request.data.get("token")

        try:
            # Verify Google token
            google_data = id_token.verify_oauth2_token(token, requests.Request(), settings.GOOGLE_CLIENT_ID ,clock_skew_in_seconds=5)
            email = google_data.get("email")
            first_name = google_data.get("given_name", "")
            last_name = google_data.get("family_name", "")

            if not email:
                return Response({"error": "Email not provided by Google"}, status=status.HTTP_400_BAD_REQUEST)

            # Check if user exists
            user = user_collection.find_one({"email": email})

            if not user:
                username = (first_name + last_name).lower()
                user_data = {
                    "email": email,
                    "first_name": first_name,
                    "last_name": last_name,
                    "username": username,
                    "password": make_password(None),  # No password required for Google login
                }
                inserted_user = user_collection.insert_one(user_data)
                user_data["_id"] = str(inserted_user.inserted_id)  # Convert ObjectId to string
                user = user_data
            else:
                user["_id"] = str(user["_id"])  # Convert ObjectId to string

            # Generate JWT token
            payload = {
                "email": user["email"],
                "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1),
                "iat": datetime.datetime.utcnow(),
            }
            access_token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

            return Response({"token": access_token, "user": user}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": "Invalid Google token", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class AdminUserListView(APIView):
    def get(self, request):
        try:
            users = []
            for user in user_collection.find({"role": {"$ne": "admin"}}):
                user_id = str(user['_id'])
                num_resumes = resume_collection.count_documents({'user_id': user_id})
                users.append({
                    "id": user_id,
                    "first_name": user.get("first_name"),
                    "last_name": user.get("last_name"),
                    "email": user.get("email"),
                    "total_resumes": num_resumes
                })
            return Response({"users": users}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class AdminAllResumesView(APIView):
    renderer_classes = [JSONRenderer]
    
    def get(self, request):
        try:
            resumes = []
            for resume in resume_collection.find():
                resume_details = resume.get("resume_details", {})
                resumes.append({
                    "id": str(resume['_id']),
                    "user_id": resume.get("user_id"),
                    "title": resume.get("title", ""),
                    "email": resume.get("email", ""),
                    "image_id": resume.get("image_id", ""),
                    "personal_info": {
                        "name": resume_details.get("personal", {}).get("name", ""),
                        "email": resume_details.get("personal", {}).get("email", ""),
                        "phone": resume_details.get("personal", {}).get("phone", ""),
                        "address": resume_details.get("personal", {}).get("address", ""),
                        "linkedin": resume_details.get("personal", {}).get("linkedin", ""),
                        "summary": resume_details.get("personal", {}).get("summary", "")
                    },
                    "education": resume_details.get("education", []),
                    "experience": resume_details.get("experience", []),
                    "skills": resume_details.get("skills", []),
                    "projects": resume_details.get("projects", []),
                    "metadata": {
                        "created_at": resume.get("created_at", ""),  # Add if available
                        "updated_at": resume.get("updated_at", "")   # Add if available
                    }
                })
            return Response({"resumes": resumes}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"Failed to fetch resumes: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content_type='application/json'
            )

class AdminDeleteUserView(APIView):
    renderer_classes = [JSONRenderer]
    
    def delete(self, request, user_id):
        try:
            if not ObjectId.is_valid(user_id):
                return Response(
                    {"error": "Invalid user ID."},
                    status=status.HTTP_400_BAD_REQUEST,
                    content_type='application/json'
                )

            user = user_collection.find_one({'_id': ObjectId(user_id)})
            if not user:
                return Response(
                    {"error": "User not found."},
                    status=status.HTTP_404_NOT_FOUND,
                    content_type='application/json'
                )

            user_collection.delete_one({'_id': ObjectId(user_id)})
            resume_collection.delete_many({'user_id': user_id})
            
            return Response(
                {"message": "User and resumes deleted successfully."},
                status=status.HTTP_200_OK,
                content_type='application/json'
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content_type='application/json'
            )