from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save, pre_save
from django.core.exceptions import ValidationError
from django.dispatch import receiver
from django.utils.timezone import now, timedelta


class User(AbstractUser):
    USER_TYPES = (
        ('admin', 'Admin'),
        ('student', 'Student'),
    )
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(max_length=100, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    user_type = models.CharField(max_length=10, choices=USER_TYPES, default='admin')
    otp = models.CharField(max_length=6, blank=True, null=True)  # Store OTP
    otp_expiry = models.DateTimeField(blank=True, null=True)  # Store OTP expiry time

    def set_otp(self, otp):
        #Set OTP and expiry time (valid for 15 minutes)
        self.otp = otp
        self.otp_expiry = now() + timedelta(minutes=15)
        self.save()

    def verify_otp(self, otp):
        #Check if OTP is correct and not expired
        return self.otp == otp and self.otp_expiry > now()

    def clean(self):
        super().clean()
        if not self.username.strip():
            raise ValidationError({"username": "User name is mandatory."})
        if not self.email.strip():
            raise ValidationError({"email": "Email is mandatory."})
        if not self.first_name.strip():
            raise ValidationError({"first_name": "First name is mandatory."})
        if not self.last_name.strip():
            raise ValidationError({"last_name": "Last name is mandatory."})
        if not self.user_type.strip():
            raise ValidationError({"user_type": "User type is mandatory."})

    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def save(self, *args, **kwargs):
        if not self.username and self.email:
            self.username = self.email.split('@')[0]
        super(User, self).save(*args, **kwargs)

def profile_image_upload_path(instance, filename):
    #Define the path for storing profile images
    return f"user_folder/{filename}"

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image = models.ImageField(upload_to= profile_image_upload_path, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    about = models.TextField(null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.full_name
    
    
def delete(self, *args, **kwargs):
    #Delete the image file from S3 if it exists
    if self.image and self.image.name != 'default_profImg.png':
        self.image.delete(save=False)

    #Store the associated user before deleting the profile
    user = self.user

    #Call the parent class's delete method to delete the Profile
    super(Profile, self).delete(*args, **kwargs)

    # Delete the associated User after the Profile is deleted
    user.delete()


@receiver(pre_save, sender=Profile)
def delete_old_image(sender, instance, **kwargs):
    
    #Delete the old image from S3 when the Profile image is updated.
    if instance.pk:
        try:
            old_profile = Profile.objects.get(pk=instance.pk)
            old_image = old_profile.image
            # old_image = Profile.objects.get(pk=instance.pk).image
            if (old_image and old_image.name != 'user_folder/default_profImg.png' and old_image.name != instance.image.name):
                print(f"Deleting old image: {old_image.name}")
                old_image.delete(save=False)
        except Profile.DoesNotExist:
            pass

@receiver(post_save, sender=User)
def create_or_save_user_profile(sender, instance, created, **kwargs): 
    #Automatically create or save the Profile whenever a User is created or updated.
    if created:
        Profile.objects.create(user=instance)
    else:
        instance.profile.save()
