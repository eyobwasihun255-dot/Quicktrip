"""
Script to automatically create default system users.
Safe to run multiple times.
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from user.models import User


DEFAULT_PASSWORD = "admin@123"

USERS_TO_CREATE = [
    {
        "phone": 911111111,
        "user_type": User.type.ADMIN,
        "is_superuser": True,
        "is_staff": True,
        "is_admin": True,
    },
    {
        "phone": 922222222,
        "user_type": User.type.SUB_ADMIN,
        "is_superuser": False,
        "is_staff": True,
        "is_admin": False,
    },
    {
        "phone": 933333333,
        "user_type": User.type.USER,
        "is_superuser": False,
        "is_staff": False,
        "is_admin": False,
    },
    {
        "phone": 944444444,
        "user_type": User.type.DRIVER,
        "is_superuser": False,
        "is_staff": False,
        "is_admin": False,
    },
]


def create_or_update_users():
    success = True

    for user_data in USERS_TO_CREATE:
        phone = user_data["phone"]

        try:
            user, created = User.objects.get_or_create(
                phone_number=phone,
                defaults={
                    "user_type": user_data["user_type"],
                    "is_superuser": user_data["is_superuser"],
                    "is_staff": user_data["is_staff"],
                    "is_admin": user_data["is_admin"],
                    "is_active": True,  # Ensure user is active
                }
            )

            # If user already exists, update fields
            user.user_type = user_data["user_type"]
            user.is_superuser = user_data["is_superuser"]
            user.is_staff = user_data["is_staff"]
            user.is_admin = user_data["is_admin"]
            user.is_active = True  # Ensure user is active
            user.set_password(DEFAULT_PASSWORD)
            user.save()

            if created:
                print(f"SUCCESS: Created {user.user_type} with phone {phone}")
            else:
                print(f"UPDATED: {user.user_type} with phone {phone}")

        except Exception as e:
            print(f"ERROR: Failed for phone {phone}: {e}")
            success = False

    return success


if __name__ == "__main__":
    result = create_or_update_users()
    sys.exit(0 if result else 1)
