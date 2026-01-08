"""
Script to automatically create a superuser if one doesn't exist.
This runs during deployment and uses environment variables.
Safe to run multiple times - won't create duplicate superusers.
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from user.models import User


def create_superuser_if_needed():
    """Create superuser if it doesn't exist and environment variables are set."""
    
    # Get environment variables
    phone_number = os.getenv('SUPERUSER_PHONE_NUMBER', '').strip()
    password = os.getenv('SUPERUSER_PASSWORD', '').strip()
    
    # Check if environment variables are set
    if not phone_number or not password:
        print("INFO: SUPERUSER_PHONE_NUMBER and SUPERUSER_PASSWORD not set. Skipping superuser creation.")
        print("INFO: To create a superuser, set these environment variables in Render.")
        return False
    
    # Validate phone number (must be numeric)
    try:
        phone_number_int = int(phone_number)
    except ValueError:
        print(f"ERROR: Phone number must be numeric. Got: {phone_number}")
        return False
    
    # Check if superuser already exists
    if User.objects.filter(phone_number=phone_number_int, is_superuser=True).exists():
        print(f"INFO: Superuser with phone number {phone_number} already exists. Skipping creation.")
        return True
    
    # Check if user with this phone number exists (but not superuser)
    if User.objects.filter(phone_number=phone_number_int).exists():
        print(f"WARNING: User with phone number {phone_number} exists but is not a superuser.")
        print(f"WARNING: Updating existing user to superuser...")
        try:
            user = User.objects.get(phone_number=phone_number_int)
            user.is_superuser = True
            user.is_staff = True
            user.is_admin = True
            user.user_type = User.type.ADMIN
            user.set_password(password)
            user.save()
            print(f"SUCCESS: Updated user {phone_number} to superuser.")
            return True
        except Exception as e:
            print(f"ERROR: Failed to update user: {str(e)}")
            return False
    
    # Create new superuser
    try:
        user = User.objects.create_superuser(
            phone_number=phone_number_int,
            password=password,
            user_type=User.type.ADMIN
        )
        print(f"SUCCESS: Superuser created successfully with phone number: {phone_number}")
        return True
    except Exception as e:
        print(f"ERROR: Failed to create superuser: {str(e)}")
        return False


if __name__ == '__main__':
    success = create_superuser_if_needed()
    sys.exit(0 if success else 1)

