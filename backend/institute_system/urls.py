"""
URL configuration for institute_system project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
import os
import sys

def serve_react_app(request):
    """
    Serve the React app's index.html directly with robust debugging.
    """
    try:
        base_dir = settings.BASE_DIR
        static_root = settings.STATIC_ROOT
        cwd = os.getcwd()
        
        # Convert Path objects to string for manipulation
        base_dir_str = str(base_dir)
        
        possible_paths = [
            os.path.join(str(static_root), 'index.html'),
            os.path.join(base_dir_str, 'staticfiles', 'index.html'),
            # Try to guess frontend path relative to backend
            os.path.join(os.path.dirname(base_dir_str), 'frontend', 'dist', 'index.html'),
            # Explicit Render path
            '/opt/render/project/src/backend/staticfiles/index.html'
        ]
        
        print(f"DEBUG: serve_react_app called. CWD: {cwd}", file=sys.stderr)
        
        for index_path in possible_paths:
            if os.path.exists(index_path):
                print(f"DEBUG: Found index.html at {index_path}", file=sys.stderr)
                with open(index_path, 'r', encoding='utf-8') as f:
                    return HttpResponse(f.read(), content_type='text/html')
        
        # If we get here, file was not found. Gather debug info.
        print(f"DEBUG: index.html NOT FOUND. Checked: {possible_paths}", file=sys.stderr)
        
        try:
            static_contents = os.listdir(static_root) if os.path.exists(static_root) else "Dir not found"
        except Exception as e:
            static_contents = str(e)
            
        debug_info = (
            f"<h1>Debug Error: index.html not found</h1>"
            f"<p><strong>CWD:</strong> {cwd}</p>"
            f"<p><strong>BASE_DIR:</strong> {base_dir}</p>"
            f"<p><strong>STATIC_ROOT:</strong> {static_root}</p>"
            f"<p><strong>Contents of STATIC_ROOT:</strong> {static_contents}</p>"
            f"<p><strong>Searched Paths:</strong><br>{'<br>'.join(possible_paths)}</p>"
        )
        
        # Return 200 so the browser/Django doesn't hide the message
        return HttpResponse(debug_info, status=200)
        
    except Exception as e:
        import traceback
        return HttpResponse(f"<h1>Critical View Error</h1><pre>{traceback.format_exc()}</pre>", status=200)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
    # Catch-all for React
    re_path(r'^(?!static|media|admin|api).*$', serve_react_app),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
