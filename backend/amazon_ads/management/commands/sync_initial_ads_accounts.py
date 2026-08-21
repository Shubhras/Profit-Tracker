from django.core.management.base import BaseCommand

from amazon_ads.models import AmazonAdsAccount
from amazon_ads.services.sync.initial_ads_sync import (
    run_initial_ads_sync,
)
from subscription.models import UserSubscription

# Change "subscriptions" to the actual app containing UserSubscription.


class Command(BaseCommand):
    help = "Sync newly connected Amazon Ads accounts"

    def add_arguments(self, parser):

        parser.add_argument(
            "--days",
            type=int,
            default=None,
            help=(
                "Number of historical days to sync. "
                "If not provided, the user's active subscription "
                "plan is used."
            ),
        )

    def handle(self, *args, **options):

        requested_days = options.get("days")

        accounts = AmazonAdsAccount.objects.filter(
            initial_sync_required=True,
            initial_sync_completed=False,
        )

        if not accounts.exists():
            self.stdout.write("No Amazon Ads accounts require initial sync.")

            return

        self.stdout.write(
            f"FOUND {accounts.count()} ADS ACCOUNT(S) REQUIRING INITIAL SYNC"
        )

        for account in accounts:
            self.stdout.write(f"STARTING INITIAL ADS SYNC: {account.profile_id}")

            try:
                # -----------------------------------------
                # DETERMINE SYNC DAYS
                # -----------------------------------------
                #
                # Explicit --days takes priority.
                #
                # Otherwise use the user's active,
                # paid subscription plan.
                # -----------------------------------------

                if requested_days is not None:
                    days = requested_days

                    self.stdout.write(f"SYNC DAYS: {days} (COMMAND ARGUMENT)")

                else:
                    subscription = (
                        UserSubscription.objects.filter(
                            user=account.user,
                            status="active",
                            is_paid=True,
                        )
                        .select_related("plan")
                        .first()
                    )

                    if not subscription or not subscription.plan:
                        raise Exception(
                            "No active paid subscription found for this user."
                        )

                    days = subscription.plan.initial_sync_duration

                    self.stdout.write(
                        f"SYNC DAYS: {days} "
                        f"(SUBSCRIPTION PLAN: "
                        f"{subscription.plan.plan_name})"
                    )

                # -----------------------------------------
                # INITIAL ADS SYNC
                # -----------------------------------------

                run_initial_ads_sync(
                    account=account,
                    days=days,
                )

                # -----------------------------------------
                # MARK COMPLETED
                # -----------------------------------------

                account.initial_sync_required = False
                account.initial_sync_completed = True

                account.save(
                    update_fields=[
                        "initial_sync_required",
                        "initial_sync_completed",
                    ]
                )

                self.stdout.write(
                    self.style.SUCCESS(
                        f"INITIAL ADS SYNC COMPLETED: {account.profile_id}"
                    )
                )

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f"INITIAL ADS SYNC FAILED: {account.profile_id} - {e}"
                    )
                )

                # Keep the flags unchanged.
                # A later run can retry the account.
                continue
