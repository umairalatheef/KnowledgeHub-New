from pathlib import Path
import os
from datetime import timedelta
import environ

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

#Load environment variables
env = environ.Env()
environ.Env.read_env(os.path.join(BASE_DIR, ".env"))

# Quick-start development settings - unsuitable for production
SECRET_KEY = env('SECRET_KEY')
DEBUG = env.bool('DEBUG', default = False)
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=[])

DATABASES = {
    "default": env.db("DATABASE_URL", default="sqlite:///db.sqlite3")  # Uses DATABASE_URL
}


# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'corsheaders',
    'storages',
    'rest_framework',
    'rest_framework_simplejwt',
    'drf_yasg', #swagger

    # Your custom apps
    'core',
    'userauths',
    'courses',
    'notes',
    'student_dashboard',
    'notifications',
    'admin_dashboard'
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', #Add this before CommonMiddleware
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

DATABASE_ENGINE = env("DATABASE_ENGINE", default="django.db.backends.sqlite3")  # Default to SQLite

if DATABASE_ENGINE == "django.db.backends.sqlite3":
    DATABASES = {
        'default': {
            'ENGINE': env('DATABASE_ENGINE'),
            'NAME': BASE_DIR / env('DATABASE_NAME', default='db.sqlite3'),
            'OPTIONS': {
                'timeout': 30, #Timeout in seconds
            },
        }
    }
elif "postgresql" in DATABASE_ENGINE or "mysql" in DATABASE_ENGINE:  #Switch to MySQL/PostgreSQL later
    DATABASES = {
        'default': {
            'ENGINE': DATABASE_ENGINE,
            'NAME': env("DATABASE_NAME"),
            'USER': env("DATABASE_USER"),
            'PASSWORD': env("DATABASE_PASSWORD"),
            'HOST': env("DATABASE_HOST", default="db"),
            'PORT': env("DATABASE_PORT", default="5432" if "postgresql" in DATABASE_ENGINE else "3306"),
        }
    }
else:
    raise ValueError(f"Unsupported database engine: {DATABASE_ENGINE}")

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

AUTH_USER_MODEL = 'userauths.User'

# AWS Configuration
AWS_ACCESS_KEY_ID = env('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = env('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = env('AWS_STORAGE_BUCKET_NAME')
AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
AWS_S3_REGION_NAME = env('AWS_S3_REGION_NAME')

# Storage Configuration
STORAGES = {
    # Private Media File Storage
    "default": {
        "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
        "OPTIONS": {
            "location": "media",
        },
    },
    # Public Static File Storage
    "staticfiles": {
        "BACKEND": "storages.backends.s3boto3.S3StaticStorage",
        "OPTIONS": {
            "location": "static",
        },
    },
}

# Media Files (AWS S3 - Private)
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
MEDIA_URL = f"https://{AWS_STORAGE_BUCKET_NAME}.s3.{AWS_S3_REGION_NAME}.amazonaws.com/media/"  # URL for accessing media files
AWS_QUERYSTRING_AUTH = True  #For signed URLs for media files

# Static Files (AWS S3 - Public)
AWS_QUERYSTRING_AUTH_STATIC = False  # Public access for static files
STATICFILES_STORAGE = 'storages.backends.s3boto3.S3StaticStorage'
STATIC_URL = f"https://{AWS_S3_CUSTOM_DOMAIN}/static/"  #URL for accessing static files

# Temporary STATIC_ROOT
STATIC_ROOT = BASE_DIR / 'staticfiles'


# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Django REST Framework and JWT
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",  # Allow all requests by default
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=env.int('ACCESS_TOKEN_LIFETIME', default=12)),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=env.int('REFRESH_TOKEN_LIFETIME', default=90)),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = env('EMAIL_HOST')
EMAIL_PORT = env.int('EMAIL_PORT')
EMAIL_USE_TLS = env.bool('EMAIL_USE_TLS')
EMAIL_HOST_USER = env('EMAIL_HOST_USER')

EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD')      # Replace with your email password
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL')

EMAIL_FILE_PATH = '/tmp/app-emails'  # Replace with your desired directory

SWAGGER_SETTINGS = {
    "USE_SESSION_AUTH": False,  # Disable login requirement for Swagger UI
    "DEFAULT_MODEL_RENDERING": "example",
    "DOC_EXPANSION": "none",  # Keep endpoints collapsed by default
    "SHOW_REQUEST_HEADERS": True,
    "SECURITY_DEFINITIONS": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "Enter token as: Bearer <your_token>",
        }
    },
    "PERSIST_AUTH": True,  # Remember authentication token in Swagger UI
}

CORS_ALLOW_CREDENTIALS = True  #Required for authentication
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  #Frontend React app
    "http://127.0.0.1:5173",
]

CORS_ALLOW_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]

# ALLOW HEADERS
# CORS_ALLOW_HEADERS = [
#     "accept",
#     "accept-encoding",
#     "authorization",
#     "content-type",
#     "dnt",
#     "origin",
#     "user-agent",
#     "x-csrftoken",
#     "x-requested-with",
# ]

CORS_ALLOW_HEADERS = [
    "content-type",
    "authorization",
    "Access-Control-Allow-Origin",
    "Access-Control-Allow-Credentials",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",  #CSRF_TRUSTED_ORIGINS for React
    "http://127.0.0.1:5173",
]




