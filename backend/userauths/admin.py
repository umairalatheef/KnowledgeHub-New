from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Profile
from django.contrib.admin import TabularInline

# Inline configuration for Profile model
class ProfileInline(TabularInline):
    model = Profile
    extra = 0  # Do not show extra empty forms by default


# Customizing the UserAdmin to display relevant fields for the User model
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active')  # You can add more fields as needed
    search_fields = ('username', 'email','first_name','last_name','user_type')
    ordering = ('-date_joined',)  # Order by the date the user joined
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name','user_type')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2','first_name','last_name','user_type', 'is_active', 'is_staff'),
        }),
    )

    # Add the ProfileInline to allow editing profile data on the User admin page
    inlines = [ProfileInline]

# Register the User model with the customized UserAdmin
admin.site.register(User, CustomUserAdmin)

# Custom admin for the Profile model
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'country', 'about', 'date')
    search_fields = ('user__username', 'user__email','country')
    list_filter = ('country',)
    ordering = ('-date',)  # Order profiles by the creation date  