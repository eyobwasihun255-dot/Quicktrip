from django.db import models
from django.apps import apps
from vehicle_management.models import vehicle
from user.models import *
import sys
sys.path.append("..")
class payment(models.Model):
    class type(models.TextChoices):
        INCOME = 'i',('income')
        EXPENSE = 'e',('expense')
        TAX = 't',('tax')
    class status_type(models.TextChoices):
        PENDING = 'p',('pending')
        COMPLETED = 'c',('completed')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    vehicle = models.ForeignKey(vehicle, on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=10 , choices=status_type.choices, default=status_type.PENDING)
    branch = models.ForeignKey(Branch , on_delete=models.SET_NULL, null=True)
    date = models.DateField(auto_now_add=True)
    time = models.DateField(auto_now_add=True)
    amount = models.DecimalField(max_digits=10 , decimal_places=4)
    transaction_id = models.CharField(max_length=50)
    types = models.CharField(max_length=10,choices=type.choices, default= type.INCOME)
    remark = models.CharField(max_length=100)
    tickets = models.ForeignKey( 'booking.ticket',on_delete= models.SET_NULL , null=True )