import logging
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from amazon_auth.models import AmazonAccount
from amazon_ads.models import AmazonAdsAccount
from amazon_ads.utils import get_ads_region_by_country

logger = logging.getLogger(__name__)


def match_ads_profile_to_amazon_account(ad, amazon_accounts):
    """
    Tries to find the matching AmazonAccount for a given AmazonAdsAccount.
    Matches by:
    1. seller_central_id == ad.amazon_id (or account_info.accountInfo.id)
    2. store_name == ad.account_name (or account_info.accountInfo.name)
    """
    info = ad.account_info.get("accountInfo", {}) if isinstance(ad.account_info, dict) else {}
    ad_seller_id = str(ad.amazon_id or info.get("id") or "").strip()
    ad_mkt_id = str(ad.marketplace_string_id or info.get("marketplaceStringId") or "").strip()
    ad_name = str(ad.account_name or info.get("name") or "").strip().lower()

    if not amazon_accounts:
        return None, "no_amazon_accounts"

    # 1. Match by seller_central_id AND marketplace_id
    if ad_seller_id and ad_mkt_id:
        for amz in amazon_accounts:
            if amz.seller_central_id and amz.seller_central_id.strip() == ad_seller_id:
                if amz.marketplace_id and amz.marketplace_id.strip() == ad_mkt_id:
                    return amz, f"seller_central_id + marketplace ({ad_seller_id}, {ad_mkt_id})"

    # 2. Match by seller_central_id alone
    if ad_seller_id:
        for amz in amazon_accounts:
            if amz.seller_central_id and amz.seller_central_id.strip() == ad_seller_id:
                return amz, f"seller_central_id ({ad_seller_id})"

    # 3. Match by store_name AND marketplace_id
    if ad_name and ad_mkt_id:
        for amz in amazon_accounts:
            if amz.store_name and amz.store_name.strip().lower() == ad_name:
                if amz.marketplace_id and amz.marketplace_id.strip() == ad_mkt_id:
                    return amz, f"store_name + marketplace ({ad_name}, {ad_mkt_id})"

    # 4. Match by store_name alone
    if ad_name:
        for amz in amazon_accounts:
            if amz.store_name and amz.store_name.strip().lower() == ad_name:
                return amz, f"store_name ({ad_name})"

    # 5. If user has only 1 AmazonAccount and only 1 AdsAccount
    if len(amazon_accounts) == 1 and AmazonAdsAccount.objects.filter(user=ad.user).count() == 1:
        return amazon_accounts[0], "single_account_fallback"

    return None, "no_match"


class Command(BaseCommand):
    help = (
        "Ensures only ONE AmazonAdsAccount is primary (is_primary=True) per user, "
        "specifically matching the user's AmazonAccount (Seller Central store). "
        "All other non-matching Ads accounts are set to is_primary=False."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--email",
            type=str,
            help="Filter by specific user email (e.g. sales@aprostore.in)",
        )
        parser.add_argument(
            "--user-id",
            type=int,
            help="Filter by specific user ID",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would be changed without actually saving",
        )

    def handle(self, *args, **options):
        email = options.get("email")
        user_id = options.get("user_id")
        dry_run = options.get("dry_run", False)

        users = User.objects.all()
        if email:
            users = users.filter(email__iexact=email)
        elif user_id:
            users = users.filter(id=user_id)
        else:
            users = users.filter(amazonadsaccount__isnull=False).distinct()

        if not users.exists():
            self.stdout.write(self.style.WARNING("No matching users found."))
            return

        self.stdout.write(self.style.MIGRATE_HEADING(f"Checking {users.count()} user(s)..."))

        for user in users:
            self.stdout.write("=" * 80)
            self.stdout.write(self.style.HTTP_INFO(f"User: {user.email} (ID: {user.id})"))

            amz_accounts = list(AmazonAccount.objects.filter(user=user))
            self.stdout.write(f"  Amazon Seller Central Stores: {len(amz_accounts)}")
            for amz in amz_accounts:
                self.stdout.write(
                    f"    - ID: {amz.id}, Seller ID: {amz.seller_central_id}, "
                    f"Marketplace: {amz.marketplace_id}, Store: {amz.store_name}"
                )

            ads_accounts = list(AmazonAdsAccount.objects.filter(user=user))
            self.stdout.write(f"  Amazon Ads Accounts: {len(ads_accounts)}")

            if not ads_accounts:
                self.stdout.write("  No Ads accounts for this user.")
                continue

            matched_primary = None
            match_reason = None
            matched_amz_account = None

            # Find matching account
            for ad in ads_accounts:
                matched_amz, reason = match_ads_profile_to_amazon_account(ad, amz_accounts)
                if matched_amz:
                    matched_primary = ad
                    match_reason = reason
                    matched_amz_account = matched_amz
                    break

            if not matched_primary:
                self.stdout.write(
                    self.style.WARNING(
                        f"  WARNING: None of the {len(ads_accounts)} Ads accounts matched any AmazonAccount for {user.email}!"
                    )
                )
                # Show summary of all ads accounts for diagnosis
                for ad in ads_accounts:
                    info = ad.account_info.get("accountInfo", {}) if isinstance(ad.account_info, dict) else {}
                    self.stdout.write(
                        f"    - Ads ID={ad.id}, Profile={ad.profile_id}, Country={ad.country_code}, "
                        f"AmazonId={ad.amazon_id or info.get('id')}, Name={ad.account_name or info.get('name')}, "
                        f"is_primary={ad.is_primary}"
                    )
                continue

            self.stdout.write(
                self.style.SUCCESS(
                    f"  MATCH FOUND: Ads Profile ID {matched_primary.profile_id} (Country: {matched_primary.country_code}) "
                    f"matches AmazonAccount ID {matched_amz_account.id} ({matched_amz_account.seller_central_id}) "
                    f"via {match_reason}"
                )
            )

            # Update primary account
            if not dry_run:
                # Set correct region on primary account
                primary_region = get_ads_region_by_country(
                    matched_primary.country_code,
                    default=(matched_amz_account.region if matched_amz_account and matched_amz_account.region else "EU")
                )
                matched_primary.is_primary = True
                matched_primary.amazon_account = matched_amz_account
                matched_primary.region = primary_region
                matched_primary.save(update_fields=["is_primary", "amazon_account", "region"])

                # Update all other ads accounts for this user to is_primary=False and set their proper regions
                other_accounts = AmazonAdsAccount.objects.filter(user=user).exclude(id=matched_primary.id)
                for other_ad in other_accounts:
                    other_region = get_ads_region_by_country(other_ad.country_code, default="EU")
                    other_ad.is_primary = False
                    other_ad.initial_sync_required = False
                    other_ad.region = other_region
                    other_ad.save(update_fields=["is_primary", "initial_sync_required", "region"])

                self.stdout.write(
                    self.style.SUCCESS(
                        f"  Updated: Profile {matched_primary.profile_id} set to is_primary=True (region={primary_region}). "
                        f"{other_accounts.count()} other accounts set to is_primary=False with dynamic regions."
                    )
                )
            else:
                primary_region = get_ads_region_by_country(
                    matched_primary.country_code,
                    default=(matched_amz_account.region if matched_amz_account and matched_amz_account.region else "EU")
                )
                self.stdout.write(
                    self.style.NOTICE(
                        f"  [DRY-RUN] Would set Profile {matched_primary.profile_id} to is_primary=True (region={primary_region}) "
                        f"and {len(ads_accounts) - 1} other accounts to is_primary=False with dynamic regions."
                    )
                )

        self.stdout.write("=" * 80)
        self.stdout.write(self.style.SUCCESS("Finished processing."))
