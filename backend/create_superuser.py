"""
Script to automatically create default system users.
Safe to run multiple times.
"""

import os
import sys
import django
import traceback

print("=" * 60)
print("STARTING: create_superuser.py script")
print("=" * 60)

# Setup Django
try:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    django.setup()
    print("✓ Django setup successful")
except Exception as e:
    print(f"✗ ERROR: Django setup failed: {e}")
    traceback.print_exc()
    sys.exit(1)

try:
    from django.db import connection
    from user.models import User
    
    # Test database connection
    try:
        connection.ensure_connection()
        print("✓ Database connection successful")
    except Exception as e:
        print(f"✗ ERROR: Database connection failed: {e}")
        traceback.print_exc()
        sys.exit(1)
    
    # Check if User table exists
    try:
        User.objects.first()
        print("✓ User model accessible")
    except Exception as e:
        print(f"✗ ERROR: Cannot access User model: {e}")
        print("NOTE: Make sure migrations have run: python manage.py migrate")
        traceback.print_exc()
        sys.exit(1)

except ImportError as e:
    print(f"✗ ERROR: Import failed: {e}")
    traceback.print_exc()
    sys.exit(1)


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
    print("\n" + "=" * 60)
    print("CREATING/USING DEFAULT USERS")
    print("=" * 60)
    
    success = True
    created_count = 0
    updated_count = 0
    error_count = 0

    for user_data in USERS_TO_CREATE:
        phone = user_data["phone"]
        user_type_display = user_data["user_type"]
        
        print(f"\nProcessing phone: {phone} (type: {user_type_display})")

        try:
            user, created = User.objects.get_or_create(
                phone_number=phone,
                defaults={
                    "user_type": user_data["user_type"],
                    "is_superuser": user_data["is_superuser"],
                    "is_staff": user_data["is_staff"],
                    "is_admin": user_data["is_admin"],
                    "is_active": True,
                }
            )

            # If user already exists, update fields
            user.user_type = user_data["user_type"]
            user.is_superuser = user_data["is_superuser"]
            user.is_staff = user_data["is_staff"]
            user.is_admin = user_data["is_admin"]
            user.is_active = True
            user.set_password(DEFAULT_PASSWORD)
            user.save()

            if created:
                print(f"  ✓ SUCCESS: Created {user_type_display} user with phone {phone}")
                created_count += 1
            else:
                print(f"  ✓ UPDATED: Updated {user_type_display} user with phone {phone}")
                updated_count += 1

        except Exception as e:
            print(f"  ✗ ERROR: Failed for phone {phone}: {e}")
            traceback.print_exc()
            error_count += 1
            success = False

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Created: {created_count} users")
    print(f"Updated: {updated_count} users")
    print(f"Errors: {error_count} users")
    print("=" * 60)
    
    if success:
        print("\n✓ All users processed successfully!")
    else:
        print("\n✗ Some errors occurred. Check output above.")
    
    return success


if __name__ == "__main__":
    try:
        result = create_or_update_users()
        if result:
            print("\n✓ Script completed successfully!")
            sys.exit(0)
        else:
            print("\n✗ Script completed with errors!")
            sys.exit(1)
    except Exception as e:
        print(f"\n✗ FATAL ERROR: {e}")
        traceback.print_exc()
        sys.exit(1)
