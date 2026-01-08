#!/bin/bash
# Startup script for Render deployment
# This script runs migrations and creates superuser if needed

set -e

echo "Running database migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

# Create superuser if it doesn't exist and environment variables are set
if [ -n "$SUPERUSER_PHONE_NUMBER" ] && [ -n "$SUPERUSER_PASSWORD" ]; then
    echo "Checking if superuser exists..."
    python manage.py createsuperuser_custom --no-input || echo "Superuser may already exist or creation failed"
else
    echo "SUPERUSER_PHONE_NUMBER and SUPERUSER_PASSWORD not set. Skipping superuser creation."
    echo "To create superuser, set these environment variables in Render dashboard."
fi

echo "Starting server..."
exec gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT

