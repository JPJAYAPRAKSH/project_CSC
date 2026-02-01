import logging
from django.core.mail import send_mail
from django.conf import settings
from twilio.rest import Client

logger = logging.getLogger(__name__)

def send_professional_email(subject, message, recipient_list, fail_silently=False):
    """
    Helper function to send professional emails using Django's send_mail.
    
    Args:
        subject (str): The subject line of the email.
        message (str): The body of the email.
        recipient_list (list): List of recipient email addresses.
        fail_silently (bool): Whether to suppress errors.
        
    Returns:
        int: Number of successfully sent emails.
    """
    try:
        from_email = settings.EMAIL_HOST_USER or 'admin@csc.college'
        # You could extend this to use HTML templates for a more professional look
        return send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=recipient_list,
            fail_silently=fail_silently
        )
    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        if not fail_silently:
            raise
        return 0

def send_whatsapp_message(to_number, body_text):
    """
    Send a WhatsApp message using Twilio.
    
    Args:
        to_number (str): The recipient's phone number (must verify format, usually +91...)
        body_text (str): The message content.
        
    Returns:
        str: Message SID if successful, None otherwise.
    """
    try:
        # These should be in settings.py
        account_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', '')
        auth_token = getattr(settings, 'TWILIO_AUTH_TOKEN', '')
        from_whatsapp_number = getattr(settings, 'TWILIO_WHATSAPP_NUMBER', 'whatsapp:+14155238886')

        if not account_sid or not auth_token:
            logger.warning("Twilio credentials not configured.")
            return None

        client = Client(account_sid, auth_token)

        # Ensure number has whatsapp: prefix
        if not to_number.startswith('whatsapp:'):
            # Assumes number is explicitly formatted like +919876543210
            # If not, you might need to clean/format it.
            to_number = f"whatsapp:{to_number}"

        message = client.messages.create(
            body=body_text,
            from_=from_whatsapp_number,
            to=to_number
        )
        return message.sid
    except Exception as e:
        logger.error(f"Error sending WhatsApp to {to_number}: {str(e)}")
        return None
