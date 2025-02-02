# urls.py
from django.urls import path
from .views import RegisterUserView,LoginView,ForgotPasswordView,ResetPasswordView

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register_user'),
    path('login/', LoginView.as_view(), name='login_user'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
]
