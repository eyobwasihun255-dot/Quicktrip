from django.db import models
import uuid ,random

class nidUser(models.Model):
    Fname = models.CharField(max_length=100)
    Lname = models.CharField(max_length=100)
    sex = models.CharField(max_length=100)
    FAN = models.CharField(max_length=12,unique=True)
    phone_number = models.IntegerField()
    Address = models.CharField(max_length=100, null = True)
    picture = models.ImageField(upload_to='api/image/profile', null=True)
    def __str__(self):
        return f"{self.Fname} {self.Lname}"


class Transaction(models.Model):
    transaction_id = models.CharField(max_length=255, unique=True)  
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.transaction_id