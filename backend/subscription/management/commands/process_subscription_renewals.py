import logging
from datetime import timedelta
from dateutil.relativedelta import relativedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from subscription.models import UserSubscription
from subscription.services.email_notifications import (
    send_3day_expiry_reminder,
    send_1day_expiry_reminder,
    send_subscription_expired_notice,
    send_auto_renewal_success_notice,
)
from subscription.utils.razorpay_client import client

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Process subscription reminder emails (3-day, 1-day before expiry) and auto-payment renewals on expiry."

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Simulate checking and email processing without modifying the database or dispatching emails.',
        )

    def handle(self, *args, **options):
        dry_run = options.get('dry_run', False)
        now = timezone.now()

        self.stdout.write(self.style.SUCCESS(f"[Subscription Renewal Job] Started at {now.isoformat()} (dry_run={dry_run})"))

        # ==========================================
        # 1. 3-DAY EXPIRY REMINDERS
        # ==========================================
        three_days_from_now = now + timedelta(days=3)
        subscriptions_3day = UserSubscription.objects.filter(
            status='active',
            end_date__isnull=False,
            end_date__gte=now + timedelta(days=2),
            end_date__lte=three_days_from_now,
            reminder_3day_sent=False,
        )

        self.stdout.write(f"Found {subscriptions_3day.count()} subscriptions due for 3-day reminder.")

        for sub in subscriptions_3day:
            user_email = getattr(sub.user, 'email', sub.user.username)
            self.stdout.write(f"Processing 3-day reminder for {user_email} (ends {sub.end_date})")
            if not dry_run:
                sent = send_3day_expiry_reminder(sub)
                if sent:
                    sub.reminder_3day_sent = True
                    sub.save(update_fields=['reminder_3day_sent'])

        # ==========================================
        # 2. 1-DAY EXPIRY REMINDERS
        # ==========================================
        one_day_from_now = now + timedelta(days=1)
        subscriptions_1day = UserSubscription.objects.filter(
            status__in=['active', 'trial'],
            end_date__isnull=False,
            end_date__gte=now,
            end_date__lte=one_day_from_now,
            reminder_1day_sent=False,
        )

        self.stdout.write(f"Found {subscriptions_1day.count()} subscriptions due for 1-day reminder.")

        for sub in subscriptions_1day:
            user_email = getattr(sub.user, 'email', sub.user.username)
            self.stdout.write(f"Processing 1-day reminder for {user_email} (ends {sub.end_date})")
            if not dry_run:
                sent = send_1day_expiry_reminder(sub)
                if sent:
                    sub.reminder_1day_sent = True
                    sub.save(update_fields=['reminder_1day_sent'])

        # ==========================================
        # 3. EXPIRED SUBSCRIPTIONS & AUTO-RENEWAL
        # ==========================================
        expired_subscriptions = UserSubscription.objects.filter(
            status__in=['active', 'cancelled', 'trial'],
            end_date__isnull=False,
            end_date__lte=now,
        )

        self.stdout.write(f"Found {expired_subscriptions.count()} expired active subscriptions.")

        for sub in expired_subscriptions:
            user_email = getattr(sub.user, 'email', sub.user.username)
            self.stdout.write(f"Processing expiration for {user_email} (expired on {sub.end_date})")

            if dry_run:
                continue

            from subscription.services.renewal_service import handle_subscription_expiry_and_renewal
            updated_sub, renewed_successfully = handle_subscription_expiry_and_renewal(sub, check_razorpay=True)

            if renewed_successfully:
                self.stdout.write(self.style.SUCCESS(f"Auto-renewed subscription for {user_email} via Razorpay (New Sub ID: {updated_sub.id}, Plan: {updated_sub.plan})."))
            else:
                self.stdout.write(self.style.WARNING(f"Marked subscription as expired for {user_email}."))

        self.stdout.write(self.style.SUCCESS("[Subscription Renewal Job] Completed successfully."))
