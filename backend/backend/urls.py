
from django.contrib import admin
from django.urls import path , include
from rest_framework_simplejwt.views import TokenObtainPairView ,TokenRefreshView
from api.views import TokenObtain

from django.conf import settings
from django.conf.urls.static import static
import sys
sys.path.append("..")
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/token',TokenObtain.as_view(), name = 'get_token'),
    path('api/token/refresh',TokenRefreshView.as_view(), name = 'refresh'),
    path('api-auth/',include('rest_framework.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)