from django.db import models
from user.models import *
from vehicle_management.models import *

import sys
sys.path.append("..")


class notification(models.Model):
    class Type(models.TextChoices):
        REQUEST = 'r', ('Request')
        RESPONSE = 's', ('Response')
        ALERT = 'a', ('Alert')      
        PAYMENT = 'p', ('Payment')
    title = models.CharField(max_length=100, null=True)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    vehicle = models.ForeignKey(vehicle, on_delete=models.SET_NULL, null=True, blank=True)  
    message = models.CharField(max_length=300)
    time = models.TimeField(auto_now_add=True)
    date = models.DateField(auto_now_add=True)
    read = models.BooleanField(default=False)
    notification_type = models.CharField(
        max_length=10, 
        choices=Type.choices, 
        default=Type.ALERT  
    )

    class Meta:
        ordering = ['-date', '-time']

    def __str__(self):
        return f"Alert to {self.branch.name} at {self.time}"
    
class message(models.Model):
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_messages'  # Unique related_name for sender
    )
    receiver = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='received_messages'  # Unique related_name for receiver
    )
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-timestamp']   #newest messages first

    def __str__(self):
        return f"From {self.sender} to {self.receiver} at {self.timestamp}"