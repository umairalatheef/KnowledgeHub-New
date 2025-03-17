from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from .models import Profile, User
import boto3
from django.conf import settings
from django.core.validators import FileExtensionValidator
from core.s3_signed_url import generate_signed_url


# Registration Serializer
class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)  # Password field is write-only

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name','user_type')

    def create(self, validated_data):
        # Create the user instance
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name'),
            last_name=validated_data.get('last_name'),
            user_type=validated_data['user_type']
        )
        return user

# Login Serializer
class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if not username or not password:
            raise serializers.ValidationError("Both username and password are required.")

        user = authenticate(username=username, password=password)

        if not user:
            raise serializers.ValidationError("Invalid credentials.")
        if not user.is_active:
            raise serializers.ValidationError("Account does not exist.")

        attrs['user'] = user
        return attrs
    
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'user_type']

    def validate_first_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("First name is mandatory.")
        return value
    
    def validate_last_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Last name is mandatory.")
        return value
    

class AdminProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', required=True)
    email = serializers.EmailField(source='user.email', required=True)
    password = serializers.CharField(source='user.password', write_only=True, required=False)

    class Meta:
        model = Profile
        fields = ['username', 'email', 'password']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user

        if 'username' in user_data:
            user.username = user_data['username']
        if 'email' in user_data:
            user.email = user_data['email']
        if 'password' in user_data:
            user.set_password(user_data['password'])
        user.save()

        return instance

class StudentProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name',required= True)
    last_name = serializers.CharField(source='user.last_name', required = True)
    email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    password = serializers.CharField(write_only=True, required=False)
    image = serializers.ImageField(
        validators=[
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png'])
        ],
        help_text="Allowed formats: jpg, jpeg, png",
        required=False,
    )
    signed_url = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['id', 'username', 'email', 'first_name', 'last_name','password', 'image','signed_url', 'country', 'about', 'date']

    def get_signed_url(self, obj):
        if obj.image and obj.image.name and "default-user.jpg" not in obj.image.name:
            return generate_signed_url(obj.image.name)
        return None #Instead of S3 default image, return None (handled by frontend with an icon)

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})

        # Debugging Logs
        print(f"Updating Profile for: {instance.user.username}")

        new_password = validated_data.pop('password', None)
        if new_password:
            instance.user.set_password(new_password)  # Hash password
            instance.user.save()

        user = instance.user

        # Update user fields
        user.first_name = user_data.get('first_name', user.first_name)
        user.last_name = user_data.get('last_name', user.last_name)
        user.save()
        new_image = validated_data.get('image', None)
        # Update profile fields, including the image
        if new_image:
            #Only delete old image if new image is successfully assigned
            if instance.image and "default-user.jpg" not in instance.image.name:
                print(f" Deleting old image: {instance.image.name}") 
                instance.image.delete(save=False)  # Delete from S3
                
            instance.image = new_image # Assign new image

        #Update remaining fields
        instance.country = validated_data.get('country', instance.country)
        instance.about = validated_data.get('about', instance.about)
        instance.save()

        signed_url = self.get_signed_url(instance)
        print(f" New Signed URL after update: {signed_url}")  # Debugging Log
        return instance
        #return super().update(instance, validated_data)

#Change Password Serializer (Authenticated Users)
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8, max_length=128)

    def validate_new_password(self, value):
        #Ensure the new password meets security requirements.
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("New password must contain at least one number.")
        return value

#Forgot Password Serializer (Request OTP)
class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        #Check if the provided email exists in the system.
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email does not exist.")
        return value

#Reset Password Serializer (Verify OTP & Reset Password)
class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(min_length=6, max_length=6)
    new_password = serializers.CharField(write_only=True, min_length=8, max_length=128)

    def validate_new_password(self, value):
        #Ensure the new password meets security requirements.
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("New password must contain at least one number.")
        return value



User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff']
