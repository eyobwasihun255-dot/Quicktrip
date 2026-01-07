from user.models import *
from booking.models import *
from rest_framework import serializers
from django.db import transaction
from alert.models import notification ,message
from payment.models import payment
from vehicle_management.models import *
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import nidUser
import sys
import json
sys.path.append("..")

User = get_user_model()

class PasswordChangeSerializer(serializers.ModelSerializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    
    class Meta:
        model = User
        fields = ['old_password', 'new_password']
        extra_kwargs = {
            'old_password': {'write_only': True},
            'new_password': {'write_only': True}
        }
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value
    
    def validate_new_password(self, value):
        validate_password(value)
        return value
    
    def update(self, instance, validated_data):
        instance.set_password(validated_data['new_password'])
        instance.save()
        return instance
    

class nidSerializer(serializers.ModelSerializer):
    class Meta :
        model = nidUser
        fields = "__all__"


class employeSerializer(serializers.ModelSerializer):
    class Meta:
        model = employeeDetail
        fields = "__all__"


class levelSerializer(serializers.ModelSerializer):
    class Meta:
        model = type
        fields = "__all__"

class addtraveller(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','user_type','phone_number','date_joined','branch','nid']

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = locations
        fields = ['latitude', 'longitude']

class branchSerializer(serializers.ModelSerializer):
    location = LocationSerializer(required=False)
    
    class Meta:
        model = Branch
        fields = ['id', 'location', 'address', 'type', 'name', 'status']
    
    def create(self, validated_data):
        # Safely extract location data (returns None if not provided)
        location_data = validated_data.pop('location', None)
        
        # Create branch instance without location first
        branch = Branch.objects.create(**validated_data)
        
        # Handle location if provided
        if location_data:
            # Check if we're referencing an existing location
            if 'id' in location_data:
                try:
                    location = locations.objects.get(id=location_data['id'])
                    branch.location = location
                    
                except locations.DoesNotExist:
                    raise serializers.ValidationError(
                        {'location': 'Referenced location does not exist'}
                    )
            else:
                # Create new location instance
                location = locations.objects.create(**location_data)
                branch.location = location
            
            branch.save()
            notifications = notification.objects.create( title = "Branch Created",branch = branch ,message = f"Branch {branch.name} has been created", notification_type = "a")
            notifications.save()
        return branch

    def update(self, instance, validated_data):
        location_data = validated_data.pop('location', None)
        
        # Update regular fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Handle location update
        if location_data is not None:
            if instance.location:
                # Update existing location
                if 'id' in location_data:
                    # Verify the ID matches if provided
                    if location_data['id'] != instance.location.id:
                        raise serializers.ValidationError(
                            {'location': 'Cannot change location ID'}
                        )
                    # Update other fields
                    for attr, value in location_data.items():
                        if attr != 'id':
                            setattr(instance.location, attr, value)
                    instance.location.save()
                else:
                    # Update fields without changing ID
                    for attr, value in location_data.items():
                        setattr(instance.location, attr, value)
                    instance.location.save()
            else:
                # Create new location if none exists
                if 'id' in location_data:
                    try:
                        instance.location = locations.objects.get(id=location_data['id'])
                    except locations.DoesNotExist:
                        raise serializers.ValidationError(
                            {'location': 'Referenced location does not exist'}
                        )
                else:
                    instance.location = locations.objects.create(**location_data)
        
        instance.save()
        return instance

class credSerializer(serializers.ModelSerializer):

    class Meta :
        model = credentials
        fields = ['expiry_date','type','did','doc']
        
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        cred = credentials.objects.create(**validated_data)
   
        if user_data:
             users = User.objects.create(**user_data)
             cred.user = users  # Assign via the OneToOneField
             cred.save()
    
        return cred
class adddriverSerializer(serializers.ModelSerializer):
    employee = employeSerializer(required=False)
    location = LocationSerializer(required=False)
    credentials = credSerializer(required=False)
    
    branch = serializers.CharField(write_only=True, required=False)  # Accept JSON string here
    
    class Meta:
        model = User
        fields = [
            'id', 'user_type', 'is_active', 'nid', 'location',
            'phone_number', 'date_joined', 'branch', 'employee', 'credentials', 'password'
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
        }

    def validate_branch(self, value):
        """Parse JSON string and validate branch dict"""
        if not value:
            return None
        
        try:
            branch_data = json.loads(value)
        except json.JSONDecodeError:
            raise serializers.ValidationError("Branch must be a valid JSON string")
        
        if not isinstance(branch_data, dict):
            raise serializers.ValidationError("Branch must be a JSON object")
        
        branch_id = branch_data.get('id')
        if not branch_id:
            raise serializers.ValidationError("Branch ID is required inside the branch object")
        
        if not Branch.objects.filter(id=branch_id).exists():
            raise serializers.ValidationError("Branch with this ID does not exist")
        
        return branch_data

    def create(self, validated_data):
        employee_data = validated_data.pop('employee', None)
        credentials_data = validated_data.pop('credentials', None)
        location_data = validated_data.pop('location', None)
        branch_data = validated_data.pop('branch', None)
        password = validated_data.pop('password', None)
        
        # branch_data here is a dict, from validate_branch
        try:
            user = User.objects.create(**validated_data)
            if password:
                user.set_password(password)

            if branch_data and branch_data.get('id'):
                user.branch_id = branch_data['id']

            if employee_data:
                user.employee = employeeDetail.objects.create(**employee_data)
            if credentials_data:
                user.credentials = credentials.objects.create(**credentials_data)
            if location_data:
                user.location = locations.objects.create(**location_data)

            user.save()
            return user

        except Exception as e:
            if 'user' in locals():
                user.delete()
            raise serializers.ValidationError(f"Failed to create user: {str(e)}")

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if instance.branch:
            rep['branch'] = branchSerializer(instance.branch).data
        return rep
class userSerializer(serializers.ModelSerializer):
    employee = employeSerializer(required=False)
    location = LocationSerializer(required=False)
    credentials = credSerializer(required=False)
    
    
    branch = serializers.DictField(required=False, write_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'user_type', 'is_active', 'nid', 'location',
            'phone_number', 'date_joined', 'branch', 'employee', 'credentials'
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
        }

    def validate_branch(self, value):
        """Custom validation for branch field"""
        if value is None:
            return None
            
        if not isinstance(value, dict):
            raise serializers.ValidationError("Branch must be an object")
            
        branch_id = value.get('id')
        if not branch_id:
            raise serializers.ValidationError("Branch ID is required")
            
        try:
            Branch.objects.get(id=branch_id)
        except Branch.DoesNotExist:
            raise serializers.ValidationError("Branch with this ID does not exist")
            
        return value

    def create(self, validated_data):
        # Extract nested data
        employee_data = validated_data.pop('employee', None)
        credentials_data = validated_data.pop('credentials', None)
        location_data = validated_data.pop('location', None)
        branch_data = validated_data.pop('branch', None)
        password = validated_data.pop('password', None)
        
        try:
            user = User.objects.create(**validated_data)
            
            if password:
                user.set_password(password)

            if branch_data and branch_data.get('id'):
                user.branch_id = branch_data['id']

           
            if employee_data:
                user.employee = employeeDetail.objects.create(**employee_data)
            if credentials_data:
                user.credentials = credentials.objects.create(**credentials_data)
            if location_data:
                user.location = locations.objects.create(**location_data)

            user.save()
            return user

        except Exception as e:
            if 'user' in locals():
                user.delete()
            raise serializers.ValidationError(f"Failed to create user: {str(e)}")

    def to_representation(self, instance):
        """Convert branch ID to full branch object in response"""
        representation = super().to_representation(instance)
        if instance.branch:
            representation['branch'] = branchSerializer(instance.branch).data
        return representation
class EmployeeDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = employeeDetail
        fields = ['id', 'Fname', 'Lname', 'position']
class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = ['id', 'name', 'address']      

class OTPSerializer(serializers.ModelSerializer):
    class Meta :
        model = OTP
        fields = ['id', 'phone_number']

class QueueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Queues
        fields = '__all__'
        read_only_fields = ['date', 'time', 'position', 'status']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = notification
        fields = '__all__'
        read_only_fields = ('time', 'date', 'read')

class VehicleLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = vehicle
        fields = ['id', 'plate_number', 'location']
class RouteSerializer(serializers.ModelSerializer):
    first_destination = branchSerializer()
    last_destination = branchSerializer()

    class Meta:
        model = route
        fields = ['id', 'first_destination', 'last_destination', 'distance']
class LongBusPriceSerializer(serializers.ModelSerializer):
    route_name = serializers.CharField(source='route.name', read_only=True)  # include route name
    longbus_name = serializers.CharField(source='longbus.name', read_only=True)  # optional, for clarity

    class Meta:
        model = LongBusPrice
        fields = ['id', 'longbus', 'longbus_name', 'route', 'route_name', 'price', 'currency', 'is_active', 'created_at']
class LongBusPriceSerializers(serializers.ModelSerializer):
    route_name = serializers.CharField(source="route.name", read_only=True)

    class Meta:
        model = LongBusPrice
        fields = ["id", "route", "route_name", "price"]


class VehicleInLongBusSerializer(serializers.ModelSerializer):
    driver_name = serializers.SerializerMethodField()
    driver_phone = serializers.SerializerMethodField()
    route_name = serializers.CharField(source="route.name", read_only=True)
    queue = serializers.SerializerMethodField()

    class Meta:
        model = vehicle
        fields = [
            "id",
            "plate_number",
            "route_name",
            "driver_name",
            "driver_phone",
            "queue"
        ]

    def get_driver_name(self, obj):
        if obj.user and obj.user.employee:
            return f"{obj.user.employee.Fname} {obj.user.employee.Lname}"
        return None

    def get_driver_phone(self, obj):
        return obj.user.phone_number if obj.user else None

    def get_queue(self, obj):
        today = timezone.now().date()
        q = Queues.objects.filter(
            vehicle=obj,
            date=today,
            status__in=["WAITING", "BOARDING"]
        ).first()

        if not q:
            return None

        return {
            "id": q.id,
            "branch": q.branch.name if q.branch else None,
            "dest": q.dest.name if q.dest else None,
            "takeoff_time": q.takeoff_time,
            "status": q.status,
            "position": q.position
        }
class LongBusSerializer(serializers.ModelSerializer):
    prices = LongBusPriceSerializer(many=True)

    class Meta:
        model = LongBus
        fields = ['id', 'name', 'date_joined', 'prices']

class FeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fee
        fields = ['service_fee', 'tax_fee']
class VehicleSerializer(serializers.ModelSerializer):
    route = RouteSerializer()
    rate = serializers.SerializerMethodField()
    longbus = serializers.SerializerMethodField()
    queue_id = serializers.IntegerField(source='queues.id', read_only=True)
    current_passengers = serializers.IntegerField(source='queues.current_passengers', read_only=True)

    class Meta:
        model = vehicle
        fields = [
            'id',
            'plate_number',
            'Model',
            'name',
            'color',
            'sit_number',
            'rate',
            'route',
            'long',
            'longbus',
            'queue_id',             # queue id
            'current_passengers',   # how many passengers already boarded
        ]

    def get_rate(self, obj):
        return str(obj.payment_rate)

    def get_longbus(self, obj):
        if not obj.long:
            return None

        try:
            longbus = obj.longbus  # OneToOneField
        except LongBus.DoesNotExist:
            return None

        prices = longbus.prices.filter(route=obj.route)
        return {
            "id": longbus.id,
            "name": longbus.name,
            "date_joined": longbus.date_joined,
            "price": prices.first().price if prices.exists() else None
        }
    
class LongBusSerializer(serializers.ModelSerializer):
    class Meta:
        model = LongBus
        fields = ['id', 'name', 'date_joined']
class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = ['id', 'seat_number', 'queue']
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'phone_number', 'password', 'user_type']
        extra_kwargs = {
            'password': {'write_only': True},
            'user_type': {'default': 'u'}
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            phone_number=validated_data['phone_number'],
            password=validated_data['password'],
            user_type=validated_data.get('user_type', 'u'),
          
        )
        return user
class UserSerializers(serializers.ModelSerializer):
    employee = EmployeeDetailSerializer()
    
    class Meta:
        model = User
        fields = ['id', 'user_type', 'phone_number', 'branch', 'employee']
        
    def update(self, instance, validated_data):
        # Update branch
        instance.branch = validated_data.get('branch', instance.branch)
        instance.save()
        
        # Update employee position if provided
        employee_data = validated_data.pop('employee', {})
        if employee_data and hasattr(instance, 'employee'):
            employee = instance.employee
            employee.position = employee_data.get('position', employee.position)
            employee.save()
            
        return instance   
class usersSerializer(serializers.ModelSerializer):
    employee = employeSerializer(required=False)
    location = LocationSerializer(required=False)
    credentials = credSerializer(required=False)

    # Override nid to avoid DRF's automatic UniqueValidator on the OneToOneField.
    # We intentionally allow an existing NID-linked *regular* user to be promoted
    # to staff roles in create().
    nid = serializers.PrimaryKeyRelatedField(
        queryset=nidUser.objects.all(),
        required=False,
        allow_null=True,
    )

    branch = serializers.DictField(required=False, write_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'user_type', 'is_active', 'nid', 'location',
            'phone_number', 'date_joined', 'branch', 'employee', 'credentials','password'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def validate_branch(self, value):
        """Custom validation for branch field"""
        if value is None:
            return None
            
        if not isinstance(value, dict):
            raise serializers.ValidationError("Branch must be an object")
            
        branch_id = value.get('id')
        if not branch_id:
            raise serializers.ValidationError("Branch ID is required")
            
        try:
            Branch.objects.get(id=branch_id)
        except Branch.DoesNotExist:
            raise serializers.ValidationError("Branch with this ID does not exist")
            
        return value

    def create(self, validated_data):
        # Extract nested data
        employee_data = validated_data.pop('employee', None)
        credentials_data = validated_data.pop('credentials', None)
        location_data = validated_data.pop('location', None)
        branch_data = validated_data.pop('branch', None)
        password = validated_data.pop('password', None)
        nid_obj = validated_data.pop('nid', None)

        # Normalize and validate phone number
        phone_number = validated_data.get('phone_number')
        if phone_number is None:
            raise serializers.ValidationError({'phone_number': 'Phone number is required'})
        if isinstance(phone_number, str):
            cleaned = ''.join(ch for ch in phone_number if ch.isdigit())
            if not cleaned:
                raise serializers.ValidationError({'phone_number': 'Invalid phone number'})
            validated_data['phone_number'] = int(cleaned)

        # If NID is already linked to an existing *regular* user, promote/update
        # that user instead of rejecting.
        existing_by_nid = None
        if nid_obj is not None:
            existing_by_nid = User.objects.filter(nid=nid_obj).first()

        if existing_by_nid is not None:
            # Allow any existing NID-linked account (admin/subadmin/driver/user).
            # The flow updates that same user instead of creating a new one.
            pass

        # Uniqueness checks (clearer errors than DB integrity errors)
        phone_exists = User.objects.filter(phone_number=validated_data['phone_number']).exists()
        if phone_exists:
            # Allow if the phone belongs to the same user we are promoting.
            if existing_by_nid is None or existing_by_nid.phone_number != validated_data['phone_number']:
                raise serializers.ValidationError({'phone_number': 'A user with this phone number already exists'})

        # Validate branch assignment
        if branch_data and not branch_data.get('id'):
            raise serializers.ValidationError({'branch': 'Branch ID is required'})

        try:
            with transaction.atomic():
                # Promote/update existing regular user if present.
                user = existing_by_nid
                if user is None:
                    user = User.objects.create(**validated_data)
                else:
                    # Update scalar fields provided by request.
                    for k, v in validated_data.items():
                        setattr(user, k, v)

                if password:
                    user.set_password(password)

                if nid_obj is not None:
                    user.nid = nid_obj

                if branch_data and branch_data.get('id'):
                    user.branch_id = branch_data['id']

                if employee_data:
                    if getattr(user, 'employee', None):
                        for k, v in employee_data.items():
                            setattr(user.employee, k, v)
                        user.employee.save()
                    else:
                        user.employee = employeeDetail.objects.create(**employee_data)
                if credentials_data:
                    if getattr(user, 'credentials', None):
                        # credentials is a FK; keep existing unless explicitly replaced
                        pass
                    else:
                        user.credentials = credentials.objects.create(**credentials_data)
                if location_data:
                    if getattr(user, 'location', None):
                        for k, v in location_data.items():
                            setattr(user.location, k, v)
                        user.location.save()
                    else:
                        user.location = locations.objects.create(**location_data)

                # Attempt to create a notification; never fail user creation due to this
                try:
                    emp_fname = (employee_data or {}).get('Fname', '')
                    emp_lname = (employee_data or {}).get('Lname', '')
                    emp_pos = (employee_data or {}).get('position', '')
                    notification.objects.create(
                        title="Subadmin Registered",
                        branch=user.branch,
                        user=user,
                        message=f"Sub admin {emp_fname} {emp_lname} has been Registered as {emp_pos}",
                        notification_type="a",
                    )
                except Exception:
                    pass

                user.save()

                
                try:
                    account_sid = 'AC01fa514281e583e66f9d1fb293d6010f'
                    auth_token = '1fa05952205a1e544adefef74e7c3a53'
                    client = Client(account_sid, auth_token)

                    to_number = str(user.phone_number)
                    if not to_number.startswith('+'):
                        to_number = f'+{to_number}'

                    message = client.messages.create(
                        body=f"""
                        QUICKTRIP OTP

                        Hello,

                        Your Current Password is: {password}

                        Please Change Password after Login
                        """,
                        from_='+12674122273',
                        to=to_number,
                    )

                    print(f"OTP sent to {user.phone_number}, SID: {message.sid}")
                except Exception as e:
                    print(f"Error sending Message: {e}")

                return user

        except serializers.ValidationError:
            raise
        except Exception as e:
            # Surface a clean non_field_errors message
            raise serializers.ValidationError({'non_field_errors': [f'Failed to create user: {str(e)}']})

    def to_representation(self, instance):
        """Convert branch ID to full branch object in response"""
        representation = super().to_representation(instance)
        if instance.branch:
            representation['branch'] = branchSerializer(instance.branch).data
        return representation
    

class QueueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Queues
        fields = '__all__'
class VehicleExitSlipSerializer(serializers.ModelSerializer):
    class Meta:
        model = vehicle
        fields = ['plate_number', 'Model', 'color', 'sit_number']
class ExitSlipSerializer(serializers.ModelSerializer):
    from_location = serializers.CharField(source='from_location.name')
    to_location = serializers.CharField(source='to_location.name')
    vehicle = VehicleExitSlipSerializer(required = False)
    class Meta:
        model = ExitSlip
        fields = '__all__'
class LocationUpdateSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    
class UserSerializer(serializers.ModelSerializer):
    employee = employeSerializer(required=False)
    branch = branchSerializer(required=False)
    nid = nidSerializer(read_only=True)
    location = LocationSerializer(read_only=True)
   
    
    class Meta:
        model = User
        fields = ['id', 'user_type', 'phone_number', 'date_joined', 'branch', 'employee', 'nid', 'location']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
        }
    
    def update(self, instance, validated_data):
        # Handle nested employee updates
        employee_data = validated_data.pop('employee', None)
        if employee_data is not None:
            employee_serializer = self.fields['employee']
            employee_instance = instance.employee
            employee_serializer.update(employee_instance, employee_data)
        
        
        branch_data = validated_data.pop('branch', None)
        if branch_data is not None:
            branch_serializer = self.fields['branch']
            branch_instance = instance.branch
            branch_serializer.update(branch_instance, branch_data)
        
        
        return super().update(instance, validated_data)

    
class MessageSerializer(serializers.ModelSerializer):
    sender = userSerializer()
    receiver = userSerializer()

    class Meta:
        model = message
        fields = ['id', 'sender', 'receiver', 'content', 'timestamp', 'read']

    def get_sender(self, obj):
        return {
            'id': obj.sender.id,
            'name': f"{obj.sender.employee.Fname} {obj.sender.employee.Lname}",
          
        }

    def get_receiver(self, obj):
        return {
            'id': obj.receiver.id,
            'name': f"{obj.receiver.employee.Fname} {obj.receiver.employee.Lname}",
            
        }
class MessageaddSerializer(serializers.ModelSerializer):
    class Meta:
        model = message
        fields = ['id', 'sender', 'receiver', 'content', 'timestamp', 'read']

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = message
        fields = ['id', 'sender', 'receiver', 'content', 'timestamp', 'read']
        read_only_fields = ['id', 'sender', 'receiver', 'content', 'timestamp']
    
    
  

class routeSerializer(serializers.ModelSerializer):
    first_destination = branchSerializer()
    last_destination = branchSerializer()
    class Meta:
        model = route
        fields = ['id','name','first_destination','last_destination','route_prize','distance']
class routeSerializers(serializers.ModelSerializer):
    class Meta:
        model = route
        fields = ['id','name','first_destination','last_destination','route_prize','distance']

    def validate(self, attrs):
        # Ensure destinations are different
        if attrs.get('first_destination') == attrs.get('last_destination'):
            raise serializers.ValidationError({
                'last_destination': 'Destinations must be different'
            })
        # Positive price
        prize = attrs.get('route_prize')
        if prize is not None and prize <= 0:
            raise serializers.ValidationError({
                'route_prize': 'Must be a positive number'
            })
        # Positive distance
        distance = attrs.get('distance')
        if distance is not None and int(distance) <= 0:
            raise serializers.ValidationError({
                'distance': 'Must be a positive number'
            })
        return attrs

    def create(self, validated_data):
        routes = route.objects.create(**validated_data)
        # Create a notification referencing the created route safely
        try:
            notification.objects.create(
                title="Route Created",
                user=self.context['request'].user if 'request' in self.context else None,
                branch=routes.first_destination,
                message=f"Route {routes.name} has been created",
                notification_type="a",
            )
        except Exception:
            # Avoid breaking route creation due to notification issues
            pass
        return routes


class vehicleSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = vehicle
        fields =  ['id','route','branch','year','insurance_doc','insurance_date','name','plate_number','color','Model','sit_number','picture','is_active','user','types','last_updated','long','longbus','detail','payment_rate','tracking']

class vehiclesSerializer(serializers.ModelSerializer):
    user = userSerializer(read_only=True)
    branch = branchSerializer(read_only=True)
    types = levelSerializer(read_only=True)
    location = LocationSerializer(read_only=True)
    route = serializers.PrimaryKeyRelatedField(queryset=route.objects.all())  # <-- writable

    class Meta:
        model = vehicle
        fields = ['payment_rate','long','detail','id','route','branch','year',
                  'insurance_doc','insurance_date','name','plate_number','color',
                  'Model','sit_number','picture','is_active','user','types',
                  'location','last_updated','tracking']


class DriverVehicleSerializer(serializers.ModelSerializer):
    user = userSerializer(read_only=True)
    branch = branchSerializer(read_only=True)
    types = levelSerializer(read_only=True)
    location = LocationSerializer(read_only=True)
    route = routeSerializer(read_only=True)

    class Meta:
        model = vehicle
        fields = [
            'payment_rate',
            'long',
            'detail',
            'id',
            'route',
            'branch',
            'year',
            'insurance_doc',
            'insurance_date',
            'name',
            'plate_number',
            'color',
            'Model',
            'sit_number',
            'picture',
            'is_active',
            'user',
            'types',
            'location',
            'last_updated',
            'tracking',
        ]
class TokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user) 
        token['role'] = user.user_type  
        token['user_id'] = user.id
        if hasattr(user, 'branch') and user.branch:
            token['branch'] = user.branch.id
        else:
            token['branch'] = None
        return token

class ticketSerializer(serializers.ModelSerializer):
    route = routeSerializer()
    level = levelSerializer()
    user = userSerializer()
    class Meta :
        model = ticket
        fields =  ['id','bought_date','route','level','Quantity','takeoff_time','takeoff_date','total_prize','user','ticket_type']
class buyticketSerializer(serializers.ModelSerializer):
    seats = serializers.ListField(
        child=serializers.IntegerField(), write_only=True
    )
    queue = serializers.IntegerField(write_only=True)

    class Meta:
        model = ticket
        fields = [
            'user',
            'Quantity',
            'total_prize',
            'takeoff_date',
            'route',
            'vehicle',
            'queue',
            'seats',
        ]

    def create(self, validated_data):
        seats = validated_data.pop('seats')
        queue_id = validated_data.pop('queue')

        # 👇 get the queue instance
        try:
            queue_obj = Queues.objects.get(id=queue_id)
        except Queues.DoesNotExist:
            raise serializers.ValidationError("Invalid queue ID")

        # 👇 force LONG ticket
        validated_data['ticket_type'] = ticket.tickettype.LONG_DISTANCE

        # 👇 take takeoff_time from queue
        validated_data['takeoff_time'] = queue_obj.takeoff_time

        ticket_obj = ticket.objects.create(
            **validated_data,
            queue=queue_obj
        )

        # 👇 create seats
        seat_objs = [
            Seat(queue=queue_obj, seat_numbers=seat_num, occupied=True)
            for seat_num in seats
        ]
        Seat.objects.bulk_create(seat_objs)

        return ticket_obj

class buyShortTicketSerializer(serializers.ModelSerializer):

    class Meta:
        model = ticket
        fields = [
            'user',
            'Quantity',
            'total_prize',
            'takeoff_date',
            'takeoff_time',
            'route',
            'vehicle',
        ]

    def create(self, validated_data):
        # 👇 force ticket type to SHORT
        validated_data['ticket_type'] = ticket.tickettype.SHORT_DISTANCE

        # 👇 explicitly set queue to NULL
        validated_data['queue'] = None

        ticket_obj = ticket.objects.create(**validated_data)

        return ticket_obj

class paymentSerializer(serializers.ModelSerializer):
    user = userSerializer()
    vehicle = vehicleSerializer(required = False)
    class Meta :
        model = payment
        fields =['id','user','status','branch','date','time','amount','transaction_id','types','remark','vehicle']
  
class addpaymentSerializer(serializers.ModelSerializer):
    class Meta :
        model = payment
        fields =['id','user','status','branch','date','time','amount','transaction_id','types','remark','vehicle','tickets',]
        extra_kwargs = {
            'vehicle': {'required': False},
            'amount' :{'required': False},
            'remark' :{'required': False},
            'transaction_id' :{'required': False},
             'user' : {'required': False},
                     }
class travelhistorySerializer(serializers.ModelSerializer):
    ticket = ticketSerializer()
    vehicle = vehiclesSerializer()
    payment = paymentSerializer()
 
    class Meta :
        model = travelhistory
        fields = ['id','branch','time','used','ticket','vehicle','payment','user']

class notificationSerilalizer(serializers.ModelSerializer):
    branch = branchSerializer(required = False)
    user = userSerializer(required = False)
    class Meta :
        model = notification
        fields =['id','title','branch','user','message','notification_type','read','time','date']
        extra_kwargs = {
            'message': {'required': False},
        }
 
class UsertravelSerializer(serializers.ModelSerializer):
    travel_history = travelhistorySerializer(
        many=True, 
        read_only=True,
        source='travel_history.all' 
    )
    employee = employeSerializer(required=False)
    nid = nidSerializer()
    employee_name = serializers.SerializerMethodField()
    nid_number = serializers.SerializerMethodField()
    
    class Meta :
        model = User
        fields = ['id','date_joined','employee','employee_name','phone_number','nid','nid_number','travel_history']

    def get_employee_name(self, obj):
        emp = getattr(obj, 'employee', None)
        # Prefer Fname + Lname if present, else try a generic name attr
        try:
            if emp:
                fname = getattr(emp, 'Fname', '') or ''
                lname = getattr(emp, 'Lname', '') or ''
                full = f"{fname} {lname}".strip()
                if full:
                    return full
                name = getattr(emp, 'name', None)
                if name:
                    return name
        except Exception:
            pass
        return ''

    def get_nid_number(self, obj):
        nid = getattr(obj, 'nid', None)
        try:
            if nid:
                value = getattr(nid, 'nid', None)
                if value is not None:
                    return value
        except Exception:
            pass
        return ''


class NotificationSerializer(serializers.ModelSerializer):
    date = serializers.DateField(format="%B %d, %Y")
    time = serializers.TimeField(format="%I:%M %p")
    branch = branchSerializer()
    
    class Meta:
        model = notification
        fields = ['id', 'title', 'message', 'date', 'time', 'read', 
                 'notification_type', 'branch', 'vehicle']


class leaveToQueueSerializer(serializers.Serializer):
    vehicle_id = serializers.IntegerField()
class AddToQueueSerializer(serializers.Serializer):
    branch_id = serializers.IntegerField(required=False)
    user_id = serializers.IntegerField(required=False)
    vehicle_id = serializers.IntegerField(required=False)

    def validate(self, attrs):
        if attrs.get('user_id') is None and attrs.get('vehicle_id') is None:
            raise serializers.ValidationError("user_id or vehicle_id is required")
        return attrs
class VehicleLocationSerializer(serializers.ModelSerializer):
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()

    class Meta:
        model = vehicle
        fields = ['id', 'name','tracking', 'plate_number', 'color', 'latitude', 'longitude', 'last_updated']

    def get_latitude(self, obj):
        loc = getattr(obj, 'location', None)
        val = getattr(loc, 'latitude', None)
        try:
            return None if val is None else float(val)
        except Exception:
            return None

    def get_longitude(self, obj):
        loc = getattr(obj, 'location', None)
        val = getattr(loc, 'longitude', None)
        try:
            return None if val is None else float(val)
        except Exception:
            return None

class BoardingSerializer(serializers.Serializer):
    ticket_id = serializers.IntegerField()

class RetrieveQueueSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source='branch.name', default="")
    destination_name = serializers.CharField(source='dest.name', default="")
    vehicle = serializers.CharField(source='vehicle.plate_number', default="")  
    level = serializers.CharField(source='level.name', default="")  


    class Meta:
        model = Queues
        fields = [
            'branch_name',
            'destination_name',
            'position',
            'level',
            'vehicle',
            'current_passengers',
            'status',
            'date',
            'time',
        ]
