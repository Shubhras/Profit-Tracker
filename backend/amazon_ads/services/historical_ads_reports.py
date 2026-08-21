from datetime import timedelta

from django.utils import timezone

from amazon_ads.models import AdsReportLog
from amazon_ads.utils import REPORT_CONFIGS, create_report

COVERED_STATUSES = {
    "PENDING",
    "PROCESSING",
    "IN_PROGRESS",
    "QUEUED",
    "COMPLETED",
    "IMPORTED",
}


def create_historical_ads_reports(account, days=90):

    if days <= 0:
        raise ValueError("days must be greater than 0")

    if days > 95:
        raise ValueError("days cannot be greater than 95")

    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=days - 1)

    total_created = 0
    total_skipped = 0
    total_failed = 0

    print("\n" + "=" * 80)
    print(f"HISTORICAL ADS REPORT SYNC: {account.profile_id}")
    print(f"REQUESTED RANGE: {start_date} -> {end_date}")
    print("=" * 80)

    for config in REPORT_CONFIGS:
        report_type = config["report_type"]

        print("\n" + "-" * 80)
        print(f"CHECKING HISTORICAL COVERAGE: {report_type}")
        print("-" * 80)

        existing_reports = AdsReportLog.objects.filter(
            amazon_account=account,
            report_type=report_type,
            start_date__lte=end_date,
            end_date__gte=start_date,
        ).order_by("start_date")

        covered_ranges = []

        for report in existing_reports:
            status = str(report.status or "").strip().upper()

            if status not in COVERED_STATUSES:
                continue

            covered_start = max(
                report.start_date,
                start_date,
            )

            covered_end = min(
                report.end_date,
                end_date,
            )

            if covered_start <= covered_end:
                covered_ranges.append(
                    (
                        covered_start,
                        covered_end,
                    )
                )

                print(f"COVERED: {report.start_date} -> {report.end_date} [{status}]")

        # -------------------------------------------------
        # MERGE OVERLAPPING COVERAGE
        # -------------------------------------------------

        covered_ranges.sort(key=lambda x: x[0])

        merged_ranges = []

        for range_start, range_end in covered_ranges:
            if not merged_ranges:
                merged_ranges.append(
                    [
                        range_start,
                        range_end,
                    ]
                )

                continue

            previous_start, previous_end = merged_ranges[-1]

            if range_start <= (previous_end + timedelta(days=1)):
                if range_end > previous_end:
                    merged_ranges[-1][1] = range_end

            else:
                merged_ranges.append(
                    [
                        range_start,
                        range_end,
                    ]
                )

        # -------------------------------------------------
        # FIND MISSING DATE RANGES
        # -------------------------------------------------

        missing_ranges = []

        current_date = start_date

        for covered_start, covered_end in merged_ranges:
            if current_date < covered_start:
                missing_ranges.append(
                    (
                        current_date,
                        covered_start - timedelta(days=1),
                    )
                )

            if covered_end >= current_date:
                current_date = covered_end + timedelta(days=1)

            if current_date > end_date:
                break

        if current_date <= end_date:
            missing_ranges.append(
                (
                    current_date,
                    end_date,
                )
            )

        # -------------------------------------------------
        # NOTHING MISSING
        # -------------------------------------------------

        if not missing_ranges:
            print(f"FULLY COVERED: {start_date} -> {end_date}")

            total_skipped += 1

            continue

        print(f"MISSING RANGES: {len(missing_ranges)}")

        # -------------------------------------------------
        # SPLIT MISSING RANGES INTO <= 30-DAY CHUNKS
        # -------------------------------------------------

        report_ranges = []

        for missing_start, missing_end in missing_ranges:
            current_start = missing_start

            while current_start <= missing_end:
                current_end = min(
                    current_start + timedelta(days=29),
                    missing_end,
                )

                report_ranges.append(
                    (
                        current_start,
                        current_end,
                    )
                )

                current_start = current_end + timedelta(days=1)

        # -------------------------------------------------
        # CREATE REPORTS
        # -------------------------------------------------

        for range_start, range_end in report_ranges:
            print("\n" + "-" * 60)

            print(f"CREATING HISTORICAL REPORT: {report_type}")

            print(f"RANGE: {range_start} -> {range_end}")

            try:
                response = create_report(
                    account=account,
                    report_type=report_type,
                    start_date=range_start,
                    end_date=range_end,
                    columns=config["columns"],
                    group_by=config["group_by"],
                )

                print(f"API STATUS: {response.status_code}")

                print(f"API BODY: {response.text}")

                if response.status_code not in [
                    200,
                    202,
                ]:
                    print(f"FAILED: {report_type}")

                    total_failed += 1

                    continue

                data = response.json()

                report_id = data.get("reportId")

                if not report_id:
                    print("REPORT ID NOT FOUND")

                    total_failed += 1

                    continue

                AdsReportLog.objects.create(
                    amazon_account=account,
                    report_id=report_id,
                    report_type=report_type,
                    start_date=range_start,
                    end_date=range_end,
                    status=data.get(
                        "status",
                        "PENDING",
                    ),
                    raw_response=data,
                )

                total_created += 1

                print(f"CREATED: {report_id}")

            except Exception as e:
                print(f"ERROR CREATING {report_type}: {e}")

                total_failed += 1

                continue

    print("\n" + "=" * 80)
    print("HISTORICAL ADS REPORT SYNC COMPLETED")
    print("=" * 80)

    print(f"TOTAL REPORTS CREATED : {total_created}")

    print(f"TOTAL REPORT TYPES SKIPPED : {total_skipped}")

    print(f"TOTAL REPORTS FAILED : {total_failed}")

    print("=" * 80)

    return {
        "total_created": total_created,
        "total_skipped": total_skipped,
        "total_failed": total_failed,
    }
