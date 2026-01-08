from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django import forms
from .models import *


class CustomUserCreationForm(UserCreationForm):
    """Custom form for creating users with phone_number."""
    phone_number = forms.IntegerField(required=True, help_text="Enter numeric phone number only")
    
    class Meta:
        model = User
        fields = ("phone_number",)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if 'phone_number' in self.fields:
            self.fields['phone_number'].required = True


class CustomUserChangeForm(UserChangeForm):
    """Custom form for changing users with phone_number."""
    phone_number = forms.IntegerField(required=True, help_text="Enter numeric phone number only")
    
    class Meta:
        model = User
        fields = "__all__"


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom admin for User model using phone_number."""
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm
    
    list_display = ('phone_number', 'user_type', 'is_staff', 'is_superuser', 'is_active')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'user_type')
    fieldsets = (
        (None, {'fields': ('phone_number', 'password')}),
        ('Permissions', {'fields': ('is_staff', 'is_superuser', 'is_active', 'user_type', 'is_admin')}),
        ('Relations', {'fields': ('employee', 'nid', 'branch', 'credentials')}),
        ('Important dates', {'fields': ('date_joined',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone_number', 'password1', 'password2', 'user_type'),
        }),
    )
    search_fields = ('phone_number',)
    ordering = ('phone_number',)
    filter_horizontal = ()


admin.site.register(Branch)
admin.site.register(employeeDetail)
admin.site.register(locations)
admin.site.register(credentials)
admin.site.register(OTP)
# Register your models here.
