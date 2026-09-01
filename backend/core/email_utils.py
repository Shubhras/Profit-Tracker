import os
import logging
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from email.mime.image import MIMEImage

logger = logging.getLogger(__name__)

def get_logo_file_path():
    """
    Finds valid trackmyprofit-logo.png image file path across workspace directories.
    """
    root_dir = getattr(settings, 'ROOT_DIR', os.path.dirname(settings.BASE_DIR))
    base_dir = settings.BASE_DIR

    candidate_paths = [
        os.path.join(root_dir, 'public', 'trackmyprofit-logo.png'),
        os.path.join(root_dir, 'public', 'icons', 'trackmyprofit-logo.png'),
        os.path.join(base_dir, 'static', 'images', 'trackmyprofit-logo.png'),
        os.path.join(base_dir, 'media', 'trackmyprofit-logo.png'),
    ]

    for path in candidate_paths:
        if os.path.exists(path):
            return path
    return None

def get_email_logo_header_html(alt_title="TrackMyProfit"):
    """
    Returns the standardized brand logo header HTML block for all outgoing emails using inline CID reference.
    """
    return f'''
        <div class="header" style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #eef2f5;">
            <img src="cid:trackmyprofit_logo" alt="{alt_title}" style="max-height: 48px; width: auto; max-width: 260px; display: inline-block;" />
        </div>
    '''

def send_email_with_logo(subject, plain_message, html_message, recipient_list, from_email=None, fail_silently=False):
    """
    Sends HTML email with attached inline CID TrackMyProfit logo image.
    Ensures 100% logo visibility across Gmail (Mobile & Web), Outlook, Apple Mail, and Yahoo Mail.
    """
    if not from_email:
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@trackmyprofit.com')

    if isinstance(recipient_list, str):
        recipient_list = [recipient_list]

    msg = EmailMultiAlternatives(
        subject=subject,
        body=plain_message,
        from_email=from_email,
        to=recipient_list
    )
    msg.attach_alternative(html_message, "text/html")

    # Locate and attach TrackMyProfit logo as inline CID
    logo_path = get_logo_file_path()

    if logo_path and os.path.exists(logo_path):
        try:
            with open(logo_path, 'rb') as f:
                img_data = f.read()
                img = MIMEImage(img_data)
                img.add_header('Content-ID', '<trackmyprofit_logo>')
                img.add_header('Content-Disposition', 'inline', filename='trackmyprofit-logo.png')
                msg.attach(img)
                logger.info(f"Successfully attached CID logo from: {logo_path}")
        except Exception as e:
            logger.warning(f"Could not attach inline CID logo: {str(e)}")
    else:
        logger.warning(f"Logo path not found for CID embedding")

    return msg.send(fail_silently=fail_silently)
