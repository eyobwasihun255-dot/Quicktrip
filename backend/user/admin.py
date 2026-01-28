from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django import forms
from .models import *


from django.contrib.auth.forms import ReadOnlyPasswordHashField

class CustomUserCreationForm(forms.ModelForm):
    password1 = forms.CharField(label="Password", widget=forms.PasswordInput)
    password2 = forms.CharField(label="Confirm Password", widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ('phone_number', 'user_type')

    def clean_password2(self):
        p1 = self.cleaned_data.get("password1")
        p2 = self.cleaned_data.get("password2")
        if p1 and p2 and p1 != p2:
            raise forms.ValidationError("Passwords don't match")
        return p2

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user


class CustomUserChangeForm(forms.ModelForm):
    password = ReadOnlyPasswordHashField()

    class Meta:
        model = User
        fields = (
            'phone_number',
            'password',
            'user_type',
            'is_active',
            'is_staff',
            'is_superuser',
            'is_admin',
        )


class CustomUserChangeForm(UserChangeForm):
    """Custom form for changing users with phone_number."""
    phone_number = forms.IntegerField(required=True, help_text="Enter numeric phone number only")
    
    class Meta:
        model = User
        fields = "__all__"


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm

    list_display = ('phone_number', 'user_type', 'is_staff', 'is_superuser', 'is_active')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'user_type')
    search_fields = ('phone_number',)
    ordering = ('phone_number',)

    readonly_fields = ('date_joined', 'last_login')

    fieldsets = (
        (None, {'fields': ('phone_number', 'password')}),
        ('Permissions', {'fields': ('is_staff', 'is_superuser', 'is_active', 'user_type', 'is_admin', 'groups', 'user_permissions')}),
        ('Relations', {'fields': ('employee', 'nid', 'branch', 'credentials')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone_number', 'user_type', 'password1', 'password2'),
        }),
    )

admin.site.register(Branch)
admin.site.register(employeeDetail)
admin.site.register(locations)
admin.site.register(credentials)
admin.site.register(OTP)
# Register your models here.
