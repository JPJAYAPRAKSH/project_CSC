
import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'institute_system.settings')
django.setup()

from core.models import SeasonalOffer

def add_offer():
    # clear existing if any to avoid clutter (optional, but good for test)
    # SeasonalOffer.objects.all().delete()
    
    offer, created = SeasonalOffer.objects.get_or_create(
        title="Welcome Offer",
        defaults={
            'message': "📢 Admissions Open for 2026! Join CSC Computer Education today. Early bird validation ends soon!",
            'is_active': True,
            'priority': 10
        }
    )
    
    if not created:
        offer.is_active = True
        offer.message = "📢 Admissions Open for 2026! Join CSC Computer Education today.  New Batches Starting Next Week! 🚀"
        offer.save()
        print("Updated existing offer.")
    else:
        print("Created new sample offer.")
        
    print(f"Active Offer: {offer.message}")

if __name__ == "__main__":
    add_offer()
