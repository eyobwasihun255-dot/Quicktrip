from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin ,BaseUserManager
from django.contrib.auth.hashers import make_password
from api.models import *
import math
import sys
from twilio.rest import Client
import random

import string
sys.path.append("..")


class locations(models.Model):
    latitude = models.FloatField()
    longitude = models.FloatField()
    tracking = models.BooleanField(default= False)
    @staticmethod
    def calculate_distance(lat1, lon1, lat2, lon2):
        R = 6371  # Earth radius in km
        dLat = math.radians(lat2 - lat1)
        dLon = math.radians(lon2 - lon1)
        a = (math.sin(dLat/2) * math.sin(dLat/2) +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dLon/2) * math.sin(dLon/2))
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        return R * c
    
class employeeDetail(models.Model):
    Fname = models.CharField(max_length=100,null=True)
    Lname = models.CharField(max_length=100,null=True)
    address = models.CharField(max_length=100, null=True)
    position = models.CharField(max_length=100, default='')
    picture = models.ImageField(upload_to='user/employee_doc/profile', null=True)
    Emergency_contact_name = models.CharField(max_length=100,null=True)
    Emergency_contact = models.CharField(max_length=100,null=True)
    Work_experience = models.CharField(max_length=100,null=True)
class Branch(models.Model):
    class b_type(models.TextChoices):
        MAIN = 'm',('main')
        BRANCH = 'b',('branch')

    class stat(models.TextChoices):
        ACTIVE = 'a',('Active')
        MAINTENANCE = 'm',('Maintenance')
        INACTIVE = 'i',('Inactive')
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=100)
    type = models.CharField(max_length=15,default=b_type.BRANCH,choices=b_type.choices)
    location = models.OneToOneField(locations, on_delete=models.CASCADE ,  null= True)
    status = models.CharField(max_length=10 ,choices=stat.choices, default=stat.ACTIVE)
    def __str__(self):
        return f'{self.id}'

class accountmanagerBase(BaseUserManager):
    def create_user(self, phone_number=None, password=None, **extra_fields):
        user = self.model(phone_number = phone_number, **extra_fields)
        if (password):
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self,phone_number=None, password=None, **extra_fields):
        extra_fields.setdefault("is_admin", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_staff", True)
        return self.create_user(phone_number, password, **extra_fields)

class credentials(models.Model):
    
    class credit_type(models.TextChoices):
            DRIVING_LICENSE = 'd',('driving_license')
            PASSPORT = 'p',('passport')
            INSTITUTE_ID = 'i',('institute_id')
            GOVERMENT_ID = 'g',('goverment id')
            OTHER = 'o',('other')
    expiry_date = models.DateField(null = True)
    type = models.CharField(max_length=12,choices=credit_type.choices , default=credit_type.OTHER)
    did = models.CharField(max_length=100, unique=True)
    doc = models.FileField(upload_to="user/employee_doc/credentials")


    
class User(AbstractBaseUser,PermissionsMixin):
    class type(models.TextChoices):
        ADMIN = 'a' , ('admin')
        SUB_ADMIN = 's',('sub_admin')
        USER = 'u',('user')
        DRIVER = 'd',('driver')
    
    user_type = models.CharField(max_length=12 , choices=type.choices, default=type.USER)
    is_admin = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    date_joined = models.DateField(auto_now_add=True , null=True)
    phone_number = models.BigIntegerField(null=False,default=0,unique=True)
    employee = models.OneToOneField(employeeDetail,on_delete=models.SET_NULL ,null = True)
    nid = models.OneToOneField(nidUser,on_delete= models.SET_NULL , null=True)
    branch = models.ForeignKey(Branch,on_delete=models.SET_NULL,null=True)
    objects = accountmanagerBase()
    credentials = models.ForeignKey(credentials , on_delete=models.SET_NULL, null=True)

    USERNAME_FIELD = "phone_number"
    REQUIRED_FIELDS = ['user_type']  
    

    def __str__(self):
        return f'{self.user_type}'
    

def format_phone_number(phone_number):
    cleaned = ''.join(filter(str.isdigit, phone_number))
    
    last_9 = cleaned[-9:]
    
    # If the number starts with '0' (local format), remove it
    if last_9.startswith('0'):
        last_9 = last_9[1:]
    
    # Ensure it's exactly 9 digits (for Ethiopian numbers)
    if len(last_9) != 9:
        raise ValueError("Invalid phone number length after formatting")
    
    return f"+251{last_9}"

def generate_random_password():
        """Generate a random 8-character password with letters and digits"""
        characters = string.ascii_letters + string.digits
        return ''.join(random.choice(characters) for _ in range(8))
class OTP(models.Model):
        phone_number = models.CharField(max_length=15)
        code = models.CharField(max_length=6, blank=True)
        created_at = models.DateTimeField(auto_now_add=True)

        def __str__(self):
            return f'{self.phone_number} - {self.code}'

        def save(self, *args, **kwargs):
          
            if not self.code:
                self.code = str(random.randint(100000, 999999))

            try:
                # Send SMS via Twilio
                account_sid = 'AC01fa514281e583e66f9d1fb293d6010f'
                auth_token = '1fa05952205a1e544adefef74e7c3a53'
                client = Client(account_sid, auth_token)

                message = client.messages.create(
                    body=f"""
                    QUICKTRIP OTP

                    Hello,

                    Your OTP is: {self.code}

                    It is valid for 15 minutes.
                    """,
                    from_='+12674122273',
                    to=format_phone_number(self.phone_number)
                )

                print(f"OTP sent to {self.phone_number}, SID: {message.sid}")
            except Exception as e:
                print(f"Error sending OTP: {e}")

            return super().save(*args, **kwargs)
