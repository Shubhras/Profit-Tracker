
# views.py

from datetime import timedelta

from django.db.models import Q
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from amazon_ads.models import (
    AmazonAdsAccount,
    AdsReportLog
)

from amazon_ads.utils import (
    create_report,
    REPORT_CONFIGS
)


class CreateMissingAdsReportsAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        try:

            total_created = 0
            total_skipped = 0
            created_reports = []

            # =====================================================
            # GET PRIMARY ACCOUNTS
            # =====================================================

            accounts = AmazonAdsAccount.objects.filter(
                user=request.user,
                is_primary=True
            )

            if not accounts.exists():

                return Response(
                    {
                        "status": False,
                        "message": "No primary amazon ads account found"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # =====================================================
            # LOOP ACCOUNTS
            # =====================================================

            for account in accounts:

                print("\n" + "=" * 80)
                print(f"ACCOUNT: {account.profile_id}")

                # =================================================
                # LOOP REPORT TYPES
                # =================================================

                for config in REPORT_CONFIGS:

                    report_type = config["report_type"]

                    print(f"\nREPORT TYPE: {report_type}")

                    # =============================================
                    # GET LAST REPORT
                    # =============================================

                    last_report = (
                        AdsReportLog.objects
                        .filter(
                            amazon_account=account,
                            report_type=report_type
                        )
                        .order_by("-end_date")
                        .first()
                    )

                    # =============================================
                    # START DATE
                    # =============================================

                    if last_report:

                        start_date = (
                            last_report.end_date +
                            timedelta(days=1)
                        )

                        print(
                            f"LAST REPORT END DATE: "
                            f"{last_report.end_date}"
                        )

                    else:

                        # first time sync
                        start_date = (
                            timezone.now().date() -
                            timedelta(days=7)
                        )

                        print(
                            "NO PREVIOUS REPORT FOUND"
                        )

                    # =============================================
                    # END DATE
                    # one day before today
                    # =============================================

                    end_date = (
                        timezone.now().date() -
                        timedelta(days=1)
                    )

                    print(f"START DATE: {start_date}")
                    print(f"END DATE: {end_date}")

                    # =============================================
                    # SKIP INVALID RANGE
                    # =============================================

                    if start_date > end_date:

                        print(
                            "SKIPPED - ALREADY UP TO DATE"
                        )

                        total_skipped += 1

                        continue

                    # =============================================
                    # CHECK EXISTING PENDING REPORT
                    # =============================================

                    existing_report = (
                        AdsReportLog.objects
                        .filter(
                            amazon_account=account,
                            report_type=report_type,
                            start_date=start_date,
                            end_date=end_date
                        )
                        .filter(
                            Q(status__iexact="PENDING") |
                            Q(status__iexact="PROCESSING") |
                            Q(status__iexact="IN_PROGRESS") |
                            Q(status__iexact="QUEUED") |
                            Q(status__iexact="COMPLETED")
                        )
                        .first()
                    )

                    if existing_report:

                        print(
                            f"REPORT ALREADY EXISTS: "
                            f"{existing_report.report_id}"
                        )

                        total_skipped += 1

                        continue

                    # =============================================
                    # CREATE REPORT
                    # =============================================

                    try:

                        response = create_report(

                            account=account,

                            report_type=report_type,

                            start_date=start_date,

                            end_date=end_date,

                            columns=config["columns"],

                            group_by=config["group_by"]
                        )

                        print(
                            f"STATUS CODE: "
                            f"{response.status_code}"
                        )

                        print(
                            f"RESPONSE: "
                            f"{response.text}"
                        )

                        if response.status_code not in [200, 202]:

                            print(
                                f"FAILED TO CREATE: "
                                f"{report_type}"
                            )

                            continue

                        data = response.json()

                        report_log = AdsReportLog.objects.create(

                            amazon_account=account,

                            report_id=data.get(
                                "reportId"
                            ),

                            report_type=report_type,

                            start_date=start_date,

                            end_date=end_date,

                            status=data.get(
                                "status",
                                "PENDING"
                            ),

                            raw_response=data
                        )

                        total_created += 1

                        created_reports.append({

                            "report_id":
                            report_log.report_id,

                            "report_type":
                            report_type,

                            "start_date":
                            str(start_date),

                            "end_date":
                            str(end_date),

                            "status":
                            report_log.status
                        })

                        print(
                            f"REPORT CREATED: "
                            f"{report_log.report_id}"
                        )

                    except Exception as e:

                        print(
                            f"ERROR CREATING REPORT: "
                            f"{report_type}"
                        )

                        print(str(e))

            return Response(

                {
                    "status": True,

                    "message":
                    "Ads reports sync completed",

                    "total_created":
                    total_created,

                    "total_skipped":
                    total_skipped,

                    "reports":
                    created_reports
                },

                status=status.HTTP_200_OK
            )

        except Exception as e:

            return Response(

                {
                    "status": False,
                    "message": str(e)
                },

                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        


class CreateDailyAdsReportsAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        try:

            total_created = 0
            total_skipped = 0

            created_reports = []

            # =====================================================
            # GET PRIMARY ACCOUNTS
            # =====================================================

            accounts = AmazonAdsAccount.objects.filter(
                user=request.user,
                is_primary=True
            )

            if not accounts.exists():

                return Response(
                    {
                        "status": False,
                        "message": "No primary account found"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # =====================================================
            # LOOP ACCOUNTS
            # =====================================================

            for account in accounts:

                print("\n" + "=" * 100)
                print(f"ACCOUNT: {account.profile_id}")

                # =================================================
                # LOOP REPORT TYPES
                # =================================================

                for config in REPORT_CONFIGS:

                    report_type = config["report_type"]

                    print("\n" + "-" * 80)
                    print(f"REPORT TYPE: {report_type}")

                    # =============================================
                    # GET LAST REPORT
                    # =============================================

                    last_report = (
                        AdsReportLog.objects
                        .filter(
                            amazon_account=account,
                            report_type=report_type
                        )
                        .order_by("-end_date")
                        .first()
                    )

                    # =============================================
                    # START DATE
                    # =============================================

                    if last_report:

                        start_date = (
                            last_report.end_date +
                            timedelta(days=1)
                        )

                        print(
                            f"LAST REPORT DATE: "
                            f"{last_report.end_date}"
                        )

                    else:

                        # first sync
                        start_date = (
                            timezone.now().date() -
                            timedelta(days=7)
                        )

                        print(
                            "NO PREVIOUS REPORT FOUND"
                        )

                    # =============================================
                    # END DATE
                    # yesterday
                    # =============================================

                    final_end_date = (
                        timezone.now().date() -
                        timedelta(days=1)
                    )

                    print(
                        f"SYNC FROM {start_date} "
                        f"TO {final_end_date}"
                    )

                    # =============================================
                    # LOOP DAY BY DAY
                    # =============================================

                    current_date = start_date

                    while current_date <= final_end_date:

                        print("\n" + "*" * 60)
                        print(
                            f"CREATING DATE REPORT: "
                            f"{current_date}"
                        )

                        # =========================================
                        # SAME DAY REPORT
                        # =========================================

                        report_start_date = current_date
                        report_end_date = current_date

                        # =========================================
                        # CHECK EXISTING REPORT
                        # =========================================

                        existing_report = (
                            AdsReportLog.objects
                            .filter(
                                amazon_account=account,
                                report_type=report_type,
                                start_date=report_start_date,
                                end_date=report_end_date
                            )
                            .filter(
                                Q(status__iexact="PENDING") |
                                Q(status__iexact="PROCESSING") |
                                Q(status__iexact="IN_PROGRESS") |
                                Q(status__iexact="QUEUED") |
                                Q(status__iexact="COMPLETED") |
                                Q(status__iexact="IMPORTED")
                            )
                            .first()
                        )

                        if existing_report:

                            print(
                                f"ALREADY EXISTS: "
                                f"{existing_report.report_id}"
                            )

                            total_skipped += 1

                            current_date += timedelta(days=1)

                            continue

                        # =========================================
                        # CREATE REPORT
                        # =========================================

                        try:

                            response = create_report(

                                account=account,

                                report_type=report_type,

                                start_date=report_start_date,

                                end_date=report_end_date,

                                columns=config["columns"],

                                group_by=config["group_by"]
                            )

                            print(
                                f"STATUS CODE: "
                                f"{response.status_code}"
                            )

                            print(
                                f"BODY: "
                                f"{response.text}"
                            )

                            if response.status_code not in [200, 202]:

                                print(
                                    f"FAILED: "
                                    f"{report_type}"
                                )

                                current_date += timedelta(days=1)

                                continue

                            data = response.json()

                            AdsReportLog.objects.create(

                                amazon_account=account,

                                report_id=data.get(
                                    "reportId"
                                ),

                                report_type=report_type,

                                start_date=report_start_date,

                                end_date=report_end_date,

                                status=data.get(
                                    "status",
                                    "PENDING"
                                ),

                                raw_response=data
                            )

                            total_created += 1

                            created_reports.append({

                                "account":
                                str(account.profile_id),

                                "report_type":
                                report_type,

                                "date":
                                str(current_date),

                                "report_id":
                                data.get("reportId"),

                                "status":
                                data.get(
                                    "status",
                                    "PENDING"
                                )
                            })

                            print(
                                f"CREATED REPORT: "
                                f"{data.get('reportId')}"
                            )

                        except Exception as e:

                            print(
                                f"ERROR CREATING REPORT: "
                                f"{report_type}"
                            )

                            print(str(e))

                        current_date += timedelta(days=1)

            return Response(

                {
                    "status": True,

                    "message":
                    "Daily ads reports created successfully",

                    "total_created":
                    total_created,

                    "total_skipped":
                    total_skipped,

                    "reports":
                    created_reports
                },

                status=status.HTTP_200_OK
            )

        except Exception as e:

            return Response(

                {
                    "status": False,
                    "message": str(e)
                },

                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
                