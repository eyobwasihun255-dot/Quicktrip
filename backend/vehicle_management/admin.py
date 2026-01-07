from django.contrib import admin
from .models import *


admin.site.register(type)
admin.site.register(documentation)
admin.site.register(ExitSlip)
admin.site.register(location)
admin.site.register(Queues)
admin.site.register(LongBus)
admin.site.register(LongBusPrice)
admin.site.register(Fee)
admin.site.register(Seat)
# Register your models here.
