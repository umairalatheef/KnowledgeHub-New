import boto3
import mimetypes  # Detects file MIME type
from botocore.exceptions import NoCredentialsError, PartialCredentialsError
from django.conf import settings

def generate_signed_url(file_path, expiration=604800):  # 7 days expiration
    """
    Generate a signed URL for an object stored in S3.
    Ensures correct 'media/' path for private storage.
    """
    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME,
        )

        # ✅ Ensure correct file path (S3 expects "media/" prefix for media files)
        if not file_path.startswith("media/"):
            file_path = f"media/{file_path}"

        # ✅ Detect Content Type
        content_type, _ = mimetypes.guess_type(file_path)  # Get proper MIME type
        
        # ✅ Explicitly handle `.mkv` as `video/mp4`
        if file_path.endswith(".mkv") or file_path.endswith(".mp4"):
            content_type = "video/mp4"  # Ensure proper video format
        
        if not content_type:  # Default to binary stream if unknown
            content_type = "application/octet-stream"

        params = {
            'Bucket': settings.AWS_STORAGE_BUCKET_NAME,
            'Key': file_path,
            'ResponseContentType': content_type,  # Set proper content type
        }

        # ✅ Generate Signed URL
        signed_url = s3_client.generate_presigned_url(
            'get_object',
            Params=params,
            ExpiresIn=expiration,
        )

        print(f"🔹 Generated Signed URL for {file_path}: {signed_url}")  # Debugging Log
        return signed_url

    except NoCredentialsError:
        raise Exception("AWS credentials not found. Check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.")
    except PartialCredentialsError:
        raise Exception("Incomplete AWS credentials. Check your settings.")
    except Exception as e:
        raise Exception(f"Error generating signed URL: {str(e)}")
