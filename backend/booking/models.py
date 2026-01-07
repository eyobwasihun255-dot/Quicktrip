from django.db import models
from user.models import User, Branch
from vehicle_management.models import vehicle, type ,route , Queues
from payment.models import payment
import sys
sys.path.append("..")



class ticket(models.Model):
    class tickettype(models.TextChoices):
        LONG_DISTANCE = "L", "LONG"
        SHORT_DISTANCE = "S", "SHORT"

    bought_date = models.DateTimeField(auto_now_add=True)
    ticket_type = models.CharField(
        max_length=10,
        default=tickettype.SHORT_DISTANCE,
        choices=tickettype.choices
    )
    route = models.ForeignKey(route, on_delete=models.SET_NULL, null=True, related_name='route')
    level = models.ForeignKey(type, on_delete=models.DO_NOTHING, null=True)  
    vehicle = models.ForeignKey(vehicle, on_delete=models.SET_NULL, null=True)  # optional
    queue = models.ForeignKey(Queues, on_delete=models.SET_NULL, null=True)     # 👈 new FK
    Quantity = models.IntegerField(default=1)
    takeoff_time = models.TimeField(null=True)
    takeoff_date = models.DateField(null=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    total_prize = models.DecimalField(max_digits=10, decimal_places=4, default=0)
    used = models.BooleanField(default=False)
class travelhistory(models.Model):
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True)
    payment = models.ForeignKey(payment, on_delete=models.SET_NULL , null= True)
    ticket = models.ForeignKey(ticket, on_delete=models.CASCADE)
    time = models.DateTimeField(auto_now_add=True)
    vehicle = models.ForeignKey(vehicle, on_delete=models.SET_NULL, null=True)
    used = models.BooleanField(default=False)
    user = models.ForeignKey(User, null=True, on_delete=models.CASCADE, related_name='travel_history'  )
    
    