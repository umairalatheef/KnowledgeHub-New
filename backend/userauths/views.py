from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate, login, logout
from .models import Profile,User
from core.permissions import IsAdminOrStaff,IsRegularUser
from django.shortcuts import get_object_or_404
from rest_framework.parsers import MultiPartParser,FormParser
from rest_framework import status,permissions
from .serializers import UserRegisterSerializer, UserLoginSerializer,AdminProfileSerializer,StudentProfileSerializer,ForgotPasswordSerializer,ChangePasswordSerializer,ResetPasswordSerializer,UserSerializer
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import random
from rest_framework import generics, permissions


User = get_user_model()
# Registration View
class RegisterAPIView(APIView):
    @swagger_auto_schema(
        operation_description="Register a new user.",
        request_body=UserRegisterSerializer,
        responses={201: UserRegisterSerializer()}
    )
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "status": "success",
                "message": "User registered successfully!",
                "data": {
                    "username": user.username,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "user_type": user.user_type
                    
                }
            }, status=status.HTTP_201_CREATED)
        return Response({
            "status": "error",
            "message": "Validation failed",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

# Login View
class LoginAPIView(APIView):
    @swagger_auto_schema(
        operation_description="User login with email and password.",
        request_body=UserLoginSerializer,
        responses={200: openapi.Response("JWT token for authentication")}
    )
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)

            #Generate refresh and access tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "username": user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "user_type": user.user_type
                },
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Logout View
class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]
    @swagger_auto_schema(
        operation_description="User logout.",
        responses={200: openapi.Response("Logged out successfully")}
    )
    def post(self, request):
        logout(request)
        return Response({
            "status": "success",
            "message": "Logged out successfully"
        }, status=status.HTTP_200_OK) 
    
class AdminProfileAPIView(APIView):
    permission_classes = [IsAdminOrStaff]
    @swagger_auto_schema(
        operation_description="Retrieve the authenticated admin's profile.",
        responses={200: AdminProfileSerializer()}
    )
    def get(self, request, *args, **kwargs):
        profile = get_object_or_404(Profile, user=request.user)
        serializer = AdminProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_description="Update admin profile.",
        request_body=AdminProfileSerializer,
        responses={200: AdminProfileSerializer()}
    )
    def put(self, request, *args, **kwargs):
        profile = Profile.objects.get(user=request.user)
        serializer = AdminProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
       

class StudentProfileAPIView(APIView):
    permission_classes = [IsRegularUser]
    parser_classes = [MultiPartParser, FormParser]  #Enable handling file uploads

    @swagger_auto_schema(
        operation_description="Retrieve the authenticated student's profile.",
        responses={200: StudentProfileSerializer()}
    )

    def get(self, request, *args, **kwargs):
        profile = get_object_or_404(Profile, user=request.user)
        serializer = StudentProfileSerializer(profile)
        print(f"Fetched Profile for {request.user.username}: {serializer.data}")
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        operation_description="Update the authenticated student's profile.",
        request_body=StudentProfileSerializer,
        responses={200: StudentProfileSerializer()}
    )
    def put(self, request, *args, **kwargs):
        profile = get_object_or_404(Profile, user=request.user)
        #Check if the request is `multipart/form-data` and includes an image
        # Debugging logs for request data
        if 'image' in request.FILES:
            request.data['image'] = request.FILES['image']
            

        serializer = StudentProfileSerializer(profile, data=request.data, partial=True)

        if serializer.is_valid():
            updated_profile = serializer.save()

            #Extract `signed_url` from updated profile object
            signed_url = serializer.get_signed_url(updated_profile)

            #Send signed URL in response along with serialized profile
            response_data = serializer.data
            response_data["signed_url"] = signed_url

            #Return the updated profile data including the new signed URL
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        #     return Response(serializer.data, status=status.HTTP_200_OK)
        # return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Change user password.",
        request_body=ChangePasswordSerializer,
        responses={200: openapi.Response("Password updated successfully")}
    )
    def put(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            old_password = serializer.validated_data['old_password']
            new_password = serializer.validated_data['new_password']

            if not user.check_password(old_password):
                return Response({
                    "status": "error",
                    "message": "Old password is incorrect."
                }, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.save()

            return Response({
                "status": "success",
                "message": "Password updated successfully."
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ForgotPasswordAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_description="Request a password reset email.",
        request_body=ForgotPasswordSerializer,
        responses={200: openapi.Response("Password reset email sent successfully")}
    )
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({"status": "error", "message": "User with this email does not exist."}, status=status.HTTP_400_BAD_REQUEST)

            #Generate 6-digit OTP
            otp = str(random.randint(100000, 999999))
            user.set_otp(otp)

            #Send OTP via email
            subject = "Your Password Reset OTP"
            message = f"Hi {user.username},\n\nYour OTP for password reset is: {otp}\n\nThis OTP is valid for 15 minutes."
            from_email = settings.DEFAULT_FROM_EMAIL
            recipient_list = [email]

            try:
                send_mail(subject, message, from_email, recipient_list)
                return Response({"status": "success", "message": "OTP sent to email."}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"status": "error", "message": f"Failed to send OTP. {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ResetPasswordAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_description="Reset password using OTP.",
        request_body=ResetPasswordSerializer,
        responses={200: openapi.Response("Password has been reset successfully")}
    )

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']
            new_password = serializer.validated_data['new_password']

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({"status": "error", "message": "User not found."}, status=status.HTTP_404_NOT_FOUND)

            # Verify OTP
            if not user.verify_otp(otp):
                return Response({"status": "error", "message": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)

            # Reset password
            user.set_password(new_password)
            user.otp = None  # Clear OTP after successful reset
            user.otp_expiry = None
            user.save()

            return Response({"status": "success", "message": "Password has been reset successfully."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# User = get_user_model()

# class UserListCreateAPIView(generics.ListCreateAPIView):
#     """
#     List all users (GET) and create a new user (POST).
#     """
#     queryset = User.objects.all()
#     serializer_class = UserSerializer
#     permission_classes = [permissions.IsAdminUser]  # Only admins can access

# class UserRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
#     """
#     Retrieve (GET), update (PUT/PATCH), or delete (DELETE) a user.
#     """
#     queryset = User.objects.all()
#     serializer_class = UserSerializer
#     permission_classes = [permissions.IsAdminUser]  # Only admins can access