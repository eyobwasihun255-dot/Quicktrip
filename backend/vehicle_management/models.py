from django.db import models
from django.apps import apps
from user.models import User, Branch, locations
from django.utils import timezone
import sys
sys.path.append("..")

class route(models.Model):
    name = models.CharField(max_length=50)
    first_destination = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='origin', null=True)
    last_destination = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='destination', null=True)
    distance = models.IntegerField(default=0)
    route_prize = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name

class LongBus(models.Model):
    name = models.CharField(max_length=100)
    date_joined = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.name

class LongBusPrice(models.Model):
    longbus = models.ForeignKey(LongBus, on_delete=models.CASCADE, related_name="prices")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default="ETB")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    route = models.ForeignKey(route, on_delete=models.CASCADE, related_name="longbus_prices", null=True, blank=True)
    def __str__(self):
        return f"{self.longbus.name} - {self.price} {self.currency}"

class type(models.Model):
    class level_type(models.TextChoices):
        LEVEL_ONE = 'one', ('level_one')
        LEVEL_TWO = 'two', ('level_two')
        LEVEL_THREE = 'three', ('level_three')
        OTHER = 'other', ('other')

    level = models.CharField(max_length=12, choices=level_type.choices, default=level_type.LEVEL_ONE)
    detail = models.TextField()
    prize = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        # e.g. "level_one - 120.00"
        return f"{self.get_level_display()} - {self.prize}"

class location(models.Model):
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.latitude}, {self.longitude} @ {self.timestamp:%Y-%m-%d %H:%M:%S}"

class vehicle(models.Model):
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null = True)
    name = models.CharField(max_length=100)
    plate_number = models.CharField(max_length=10 ,unique= True)
    color = models.CharField(max_length=50)
    year = models.CharField(max_length=10,null=True)
    Model = models.CharField(max_length=100)
    sit_number = models.IntegerField(default=0)
    picture = models.ImageField(upload_to='vehicle_management/vehicle_image')
    is_active =models.BooleanField(default=False)
    user = models.ForeignKey(User,on_delete=models.SET_NULL , null=True, related_name="driver")
    types = models.ForeignKey(type, on_delete=models.SET_NULL, null=True)
    location = models.ForeignKey(locations, on_delete=models.SET_NULL , null=True)
    tracking = models.BooleanField(default= False)
    last_updated = models.DateTimeField(auto_now=True)
    route = models.ForeignKey(route ,on_delete=models.SET_NULL , null= True )
    insurance_doc = models.ImageField(upload_to='vehicle_management/insurance_doc',null=True)
    insurance_date = models.DateField(null=True)
    long = models.BooleanField(default= False)
    longbus = models.ForeignKey(LongBus, on_delete=models.SET_NULL, null=True, blank=True)
    detail = models.CharField(max_length=200 , null = True)
    payment_rate = models.DecimalField(max_digits=9 , decimal_places=2 , default=1)
    
    def __str__(self):
        return f'{self.plate_number} and ID : {self.id}'
class documentation (models.Model):
    doc = models.FileField(upload_to='vehicle_management/doc')
    did = models.CharField(max_length=100, unique=True)
    vehicle = models.ForeignKey(vehicle , on_delete=models.CASCADE,related_name='vehicle_doc')

    def __str__(self):
        return self.did

class Fee(models.Model):
    service_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"Service: {self.service_fee}% | Tax: {self.tax_fee}%"


class ExitSlip(models.Model):
    class Status(models.TextChoices):
        PENDING = 'p', 'Pending'
        APPROVED = 'a', 'Approved'
        REJECTED = 'r', 'Rejected'
        COMPLETED = 'c', 'Completed'

    vehicle = models.ForeignKey(vehicle, on_delete=models.CASCADE)
    driver = models.ForeignKey(User, on_delete=models.CASCADE)
    from_location = models.ForeignKey(Branch, related_name='exit_from', on_delete=models.CASCADE)
    to_location = models.ForeignKey(Branch, related_name='exit_to', on_delete=models.CASCADE)
    departure_time = models.DateTimeField()
    passenger_count = models.IntegerField()
    status = models.CharField(max_length=1, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    qr_code = models.CharField(max_length=255, blank=True)
    def __str__(self):
        return f"Exit Slip #{self.id} - {self.vehicle.plate_number}"

    def save(self, *args, **kwargs):
        if not self.qr_code:
            self.qr_code = f"EXIT-{self.id}-{self.vehicle.plate_number}"
        super().save(*args, **kwargs)
class Queues(models.Model):
    vehicle = models.ForeignKey(vehicle, on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    time = models.TimeField(auto_now_add=True)
    long = models.BooleanField(default= False)
    takeoff_time = models.TimeField(null=True, blank=True)

    # Use unique related_name values to avoid reverse accessor conflicts
    dest= models.ForeignKey(
        Branch, related_name='queue_destinations', on_delete=models.CASCADE, null=True
    )
    branch = models.ForeignKey(
        Branch, related_name='queue_branches', on_delete=models.CASCADE, null=True
    )

    level = models.ForeignKey(type, on_delete=models.CASCADE)
    position = models.IntegerField(default=0)
    current_passengers = models.PositiveIntegerField(default=0)

    STATUS_CHOICES = [
        ('WAITING', 'Waiting'),
        ('BOARDING', 'Boarding'),
        ('FULL', 'Full'),
        ('DEPARTED', 'Departed')
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='WAITING')

    class Meta:
        
        ordering = ['position']

    def __str__(self):
        return f'{self.vehicle} - {self.status}'

    @classmethod
    def add_to_queue(cls, driver_user, branch_id):
        today = timezone.now().date()
        try:
            v = vehicle.objects.get(user=driver_user)
        except vehicle.DoesNotExist:
            return None, "Driver has no assigned vehicle"

        try:
            branch = Branch.objects.get(id=branch_id)
        except Branch.DoesNotExist:
            return None, "Invalid branch ID"

        if cls.objects.filter(vehicle=v, date=today, status__in=['WAITING', 'BOARDING']).exists():
            return None, "Already in queue"

        if not v.route:
            return None, "Vehicle has no route assigned"

        dest_1 = v.route.first_destination
        dest_2 = v.route.last_destination

        if dest_1 and dest_1 != branch:
            destinations = dest_1
        elif dest_2 and dest_2 != branch:
            destinations = dest_2
        else:
            return None, "No valid destination different from branch"

        max_pos = cls.objects.filter(
            date=today, branch=branch, dest=destinations, level=v.types
        ).aggregate(models.Max('position'))['position__max'] or 0

        position = max_pos + 1
        status = 'WAITING'
        if position == 1:
            status = 'BOARDING'

        queue = cls.objects.create(
            vehicle=v,
            branch=branch,
            level=v.types,
            dest=destinations,
            position=position,
            status=status
        )

        # Create seats for the vehicle
        for seat_num in range(1, v.sit_number + 1):
            Seat.objects.create(queue=queue, seat_numbers=seat_num)

        return queue, "Added to queue"


    @classmethod
    def get_status(cls, driver_user):
        today = timezone.now().date()
        try:
            q = cls.objects.get(
                vehicle__id=driver_user,
                date=today,
                status__in=['WAITING', 'BOARDING']
            )
            return {
                "position": q.position,
                "status": q.status,
                "passengers": q.current_passengers
            }
        except cls.DoesNotExist:
            return "Not in queue"

    @classmethod
    def leave_queue(cls, driver_user):
        today = timezone.now().date()
        try:
            current = cls.objects.get(vehicle__id=driver_user, date=today)
            current.status = 'DEPARTED'
            current.save()

            queue_set = cls.objects.filter(
                date=today,
                branch=current.branch,
                dest=current.dest,
                level=current.level,
                status__in=['WAITING', 'BOARDING']
            ).order_by('position')

            for idx, queue in enumerate(queue_set):
                queue.position = idx + 1
                queue.save()

            if queue_set.exists():
                first = queue_set.first()
                first.status = 'BOARDING'
                first.save()

            return "Removed from queue and updated others"
        except cls.DoesNotExist:
            return "Not in queue"
    @classmethod
    def board_passenger(self):
        if self.status == 'DEPARTED':
            return "Already departed"
        self.current_passengers += 1
        if self.current_passengers >= self.vehicle.sit_number:
            self.status = 'FULL'
            self.save()
                   
            self.status = 'DEPARTED'
            self.save()
            next_queue = Queues.objects.filter(
                            date=self.date,
                            branch=self.branch,
                            dest=self.dest,
                            level=self.level,
                            position__gt=self.position,
                            status__in=['WAITING']).order_by('position').first()

            if next_queue:
                next_queue.status = 'BOARDING'
                next_queue.save()
                return "Queue full. Moved to DEPARTED. Next vehicle is now BOARDING."

        else:
            self.status = 'BOARDING'
            self.save()
            return {
            "status": self.status,
            "passengers": self.current_passengers
        }

from django.core.exceptions import ValidationError

class Seat(models.Model):
    queue = models.ForeignKey(
        Queues,
        on_delete=models.CASCADE,
        related_name='seats'
    )
    seat_numbers = models.PositiveIntegerField()
    occupied = models.BooleanField(default=False)

    def __str__(self):
        return f"Queue #{self.queue_id} - Seat {self.seat_numbers} ({'taken' if self.occupied else 'free'})"
