# urls.py
from django.urls import path
from .views import AdminLoginLogsView, RegisterUserView,LoginView,ForgotPasswordView,ResetPasswordView,ContactUsView,VerifyTokenView,GoogleLoginView,AdminLoginView,AdminRegisterView,AdminUserListView,AdminAllResumesView,AdminDeleteUserView
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# urlpatterns = [
#     ...
#     path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
#     path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
#     ...
# ]

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register_user'),
    path('login/', LoginView.as_view(), name='login_user'),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    # path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('verify-otp/', VerifyTokenView.as_view(), name='verify-token'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('contact-us/', ContactUsView.as_view(), name='contact-us'),
    path('google-login/', GoogleLoginView.as_view(), name="google-login"),
    path('admin/login/',AdminLoginView.as_view(), name='login_user'),
    path('admin/register/',AdminRegisterView.as_view(), name='login_user'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-users'),
    path('admin/resumes/', AdminAllResumesView.as_view(), name='admin-resumes'),
    path('admin/login-logs/', AdminLoginLogsView.as_view(), name='admin-login-logs'),
    path('admin/deleteusers/<str:user_id>/', AdminDeleteUserView.as_view(), name='admin-delete-user'),
]