"""
URL configuration for institute_system project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse, Http404
import os

def serve_react_app(request):
    """
    Serve the React app's index.html directly.
    This bypasses Django's template system entirely.
    """
    # Try multiple locations for index.html
    possible_paths = [
        os.path.join(settings.STATIC_ROOT, 'index.html'),
        os.path.join(settings.BASE_DIR, 'staticfiles', 'index.html'),
        os.path.join(settings.BASE_DIR.parent, 'frontend', 'dist', 'index.html'),
    ]
    
    for index_path in possible_paths:
        if os.path.exists(index_path):
            with open(index_path, 'r', encoding='utf-8') as f:
                return HttpResponse(f.read(), content_type='text/html')
    
    # If we can't find it, return an error with debugging info
    return HttpResponse(
        f"index.html not found. Searched paths:<br>" +
        "<br>".join(possible_paths) +
        f"<br><br>STATIC_ROOT: {settings.STATIC_ROOT}<br>" +
        f"BASE_DIR: {settings.BASE_DIR}",
        status=500
    )

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
    re_path(r'^(?!static|media|admin|api).*$', serve_react_app),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
