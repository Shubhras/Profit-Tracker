from django.core.management.base import BaseCommand
from subscription.models import UserSubscription

from amazon_auth.models import AmazonAccount
from amazon_auth.services.initial_amazon_sync import (
    run_initial_amazon_sync,
)

class Command(BaseCommand):
    help = "Sync newly connected Amazon accounts"

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

        accounts = AmazonAccount.objects.filter(
            initial_sync_required=True,
            initial_sync_completed=False,
        )

        if not accounts.exists():
            self.stdout.write("No Amazon accounts require initial sync.")

            return

        self.stdout.write(f"FOUND {accounts.count()} ACCOUNT(S) REQUIRING INITIAL SYNC")

        for account in accounts:
            self.stdout.write(f"STARTING INITIAL SYNC: {account.seller_central_id}")

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
                # INITIAL SYNC
                # -----------------------------------------

                run_initial_amazon_sync(
                    account=account,
                    days=days,
                )

                # -----------------------------------------
                # MARK COMPLETED
                # -----------------------------------------

                # account.initial_sync_required = False
                # account.initial_sync_completed = True

                account.save(
                    update_fields=[
                        "initial_sync_required",
                        "initial_sync_completed",
                    ]
                )

                self.stdout.write(
                    self.style.SUCCESS(
                        f"INITIAL SYNC COMPLETED: {account.seller_central_id}"
                    )
                )

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f"INITIAL SYNC FAILED: {account.seller_central_id} - {e}"
                    )
                )

                # Keep flags unchanged so the account
                # can be retried later.
                continue
