"""
Custom management command to create a superuser for the custom User model.
Usage: python manage.py createsuperuser_custom
"""
from django.core.management.base import BaseCommand
from user.models import User


class Command(BaseCommand):
    help = 'Create a superuser with phone number and password'

    def add_arguments(self, parser):
        parser.add_argument(
            '--phone-number',
            type=str,
            help='Phone number (required)',
        )
        parser.add_argument(
            '--password',
            type=str,
            help='Password (required)',
        )
        parser.add_argument(
            '--no-input',
            action='store_true',
            help='Use environment variables for phone number and password',
        )

    def handle(self, *args, **options):
        import os
        
        if options['no_input']:
            # Use environment variables
            phone_number = os.getenv('SUPERUSER_PHONE_NUMBER')
            password = os.getenv('SUPERUSER_PASSWORD')
            
            if not phone_number or not password:
                self.stdout.write(
                    self.style.ERROR(
                        'Error: SUPERUSER_PHONE_NUMBER and SUPERUSER_PASSWORD environment variables must be set when using --no-input'
                    )
                )
                return
        else:
            # Interactive mode
            phone_number = options.get('phone_number')
            password = options.get('password')
            
            if not phone_number:
                phone_number = input('Phone number: ')
            if not password:
                password = input('Password: ')
                password_confirm = input('Password (again): ')
                if password != password_confirm:
                    self.stdout.write(self.style.ERROR('Error: Passwords do not match'))
                    return
        
        # Validate phone number (should be numeric)
        try:
            phone_number_int = int(phone_number)
        except ValueError:
            self.stdout.write(self.style.ERROR('Error: Phone number must be numeric'))
            return
        
        # Check if user already exists
        if User.objects.filter(phone_number=phone_number_int).exists():
            self.stdout.write(
                self.style.WARNING(f'User with phone number {phone_number} already exists')
            )
            return
        
        # Create superuser
        try:
            user = User.objects.create_superuser(
                phone_number=phone_number_int,
                password=password,
                user_type=User.type.ADMIN
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f'Superuser created successfully with phone number: {phone_number}'
                )
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating superuser: {str(e)}')
            )

