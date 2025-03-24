# serializers.py
from rest_framework import serializers
import re
from .models import user_collection

class AdminRegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=255)
    last_name = serializers.CharField(max_length=255)  # Required field
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    
class UserRegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150, required=True)
    last_name = serializers.CharField(max_length=150, required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate_first_name(self, value):
        """Ensure first name contains only letters and spaces."""
        if not re.match(r'^[a-zA-Z\s]+$', value):
            raise serializers.ValidationError("First name should only contain letters and spaces.")
        
        return value

    def validate_last_name(self, value):
        """Ensure last name contains only letters and spaces."""
        if not re.match(r'^[a-zA-Z\s]+$', value):
            raise serializers.ValidationError("Last name should only contain letters and spaces.")
        
        return value

    def validate_email(self, value):
        """Check if the email is already registered."""
        if user_collection.find_one({'email': value}):
            raise serializers.ValidationError("Email is already registered.")
        return value

    def validate_password(self, value):
        """Ensure password meets security requirements."""
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least one digit.")
        
        if not re.search(r'[@$!%*?&]', value):
            raise serializers.ValidationError("Password must contain at least one special character (@$!%*?&).")
        
        return value

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

class VerifyTokenSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    token = serializers.CharField(min_length=6, max_length=6, required=True)

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    token = serializers.CharField(min_length=6, max_length=6, required=True)
    new_password = serializers.CharField(min_length=6, required=True)
    
    def validate_new_password(self, value):
        """
        Validate password strength:
        - At least 8 characters
        - Contains at least one number
        - Contains at least one uppercase letter
        """
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least one digit.")
        
        if not re.search(r'[@$!%*?&]', value):
            raise serializers.ValidationError("Password must contain at least one special character (@$!%*?&).")
        
        return value

class ContactSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150, required=True, allow_blank=True)
    email = serializers.EmailField(required=True, allow_blank=True)
    subject = serializers.CharField(max_length=255, required=True, allow_blank=True)
    message = serializers.CharField(required=True, allow_blank=True)
 
    def validate_name(self, value):
        """Ensure the name contains only letters and spaces."""
        if not value.strip():
            raise serializers.ValidationError("Name cannot be empty.")
        if not re.match(r'^[a-zA-Z\s]+$', value):
            raise serializers.ValidationError("Name should only contain letters and spaces.")
        return value
 
    def validate_email(self, value):
        if not value.strip():
            raise serializers.ValidationError("Email cannot be empty.")
        return value
 
    def validate_subject(self, value):
        """Ensure subject is not empty or just spaces."""
        if not value.strip():
            raise serializers.ValidationError("Subject cannot be empty.")
        return value
 
    def validate_message(self, value):
        """Ensure message is not empty or just spaces."""
        if not value.strip():
            raise serializers.ValidationError("Message cannot be empty.")
        return value