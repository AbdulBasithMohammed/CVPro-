from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.renderers import JSONRenderer
from rest_framework_simplejwt.tokens import RefreshToken
from bson import ObjectId
from types import SimpleNamespace
from django.contrib.auth.hashers import make_password, check_password
from datetime import datetime, timedelta, timezone
from .serializers import AdminRegisterSerializer
from .models import admin_collection, user_collection, resume_collection, login_log_collection
import random, string


def generate_unique_username(first_name, last_name):
    base_username = f"{first_name.lower()}{last_name.lower()}"
    username = base_username

    for _ in range(10):
        random_suffix = ''.join(random.choices(string.digits, k=4))
        username = f"{base_username}{random_suffix}"

        if not user_collection.find_one({'username': username}):
            return username

    username = f"{base_username}{random.randint(10000, 99999)}"
    return username

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
                    "total_resumes": num_resumes,
                    "location": user.get("location"),
                    "created_at": user.get("created_at"),

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
class AdminLoginLogsView(APIView):
    def get(self, request):
        logs = []
        for log in login_log_collection.find():
            logs.append({
                "id": str(log['_id']),
                "user_id": log.get("user_id"),
                "timestamp": log.get("timestamp"),
                "ip_address": log.get("ip_address"),
                "login_successful": log.get("login_successful"),
            })
        return Response({"login_logs": logs}, status=status.HTTP_200_OK)

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