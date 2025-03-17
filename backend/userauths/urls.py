from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path
from .views import ForgotPasswordAPIView, ChangePasswordAPIView,ResetPasswordAPIView 


urlpatterns = [
    path('register/', views.RegisterAPIView.as_view(), name='register'),  # Use .as_view() for class-based views
    path('login/', views.LoginAPIView.as_view(), name='login'),
    path('logout/', views.LogoutAPIView.as_view(), name='logout'),
    # Admin profile management
    path('admin/profile/', views.AdminProfileAPIView.as_view(), name='admin_profile'),
    # Student profile management
    path('student/profile/', views.StudentProfileAPIView.as_view(), name='student_profile'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('forgot-password/', ForgotPasswordAPIView.as_view(), name='forgot-password'),
    path('change-password/', ChangePasswordAPIView.as_view(), name='change-password'),
    path('reset-password/', ResetPasswordAPIView.as_view(), name='reset-password'),
]



