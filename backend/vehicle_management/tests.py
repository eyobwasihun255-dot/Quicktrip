from django.test import TestCase
from .models import vehicle
# Create your tests here.
vehicle.objects.all().delete()