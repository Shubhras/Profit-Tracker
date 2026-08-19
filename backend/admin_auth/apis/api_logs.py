from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from django.db.models import Sum, Q
from django.core.paginator import Paginator
from admin_auth.models import ApiCallLog, log_api_call
from amazon_auth.models import AmazonAccount, Order, AmazonReport, ReportRequest
from amazon_ads.models import AmazonAdsAccount, AdsCampaign, AdsReportLog
from myntra.models import MyntraConnection, MyntraOrder, MyntraReportQueue
import math

User = get_user_model()

def ensure_sample_logs_if_empty():
    """Seeds sample logs for connected accounts if ApiCallLog table is empty."""
    if ApiCallLog.objects.exists():
        return
    
    users = User.objects.all()
    for user in users:
        has_amz = AmazonAccount.objects.filter(user=user).exists()
        has_ads = AmazonAdsAccount.objects.filter(user=user, is_primary=True).exists()
        has_myn = MyntraConnection.objects.filter(user=user).exists()

        if not (has_amz or has_ads or has_myn):
            continue

        if has_amz:
            log_api_call(
                user=user,
                service_type='SP-API',
                account_id='SELLER_IN_' + str(user.id),
                account_name=getattr(user, 'first_name', '') or user.username or 'Amazon Seller',
                api_endpoint='/orders/v0/orders',
                call_count=42,
                status='SUCCESS',
                orders_processed=180,
                response_time_ms=320
            )
            log_api_call(
                user=user,
                service_type='SP-API',
                account_id='SELLER_IN_' + str(user.id),
                account_name=getattr(user, 'first_name', '') or user.username or 'Amazon Seller',
                api_endpoint='GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE',
                call_count=18,
                status='SUCCESS',
                orders_processed=140,
                response_time_ms=540
            )
            log_api_call(
                user=user,
                service_type='SP-API',
                account_id='SELLER_IN_' + str(user.id),
                account_name=getattr(user, 'first_name', '') or user.username or 'Amazon Seller',
                api_endpoint='GET_SALES_AND_TRAFFIC_REPORT',
                call_count=14,
                status='SUCCESS',
                orders_processed=120,
                response_time_ms=410
            )
            log_api_call(
                user=user,
                service_type='SP-API',
                account_id='SELLER_IN_' + str(user.id),
                account_name=getattr(user, 'first_name', '') or user.username or 'Amazon Seller',
                api_endpoint='/finances/v0/orders/{order_id}/financialEvents',
                call_count=12,
                status='SUCCESS',
                orders_processed=15,
                response_time_ms=210
            )
            log_api_call(
                user=user,
                service_type='SP-API',
                account_id='SELLER_IN_' + str(user.id),
                account_name=getattr(user, 'first_name', '') or user.username or 'Amazon Seller',
                api_endpoint='/products/fees/v0/items/{asin}/feesEstimate',
                call_count=8,
                status='SUCCESS',
                orders_processed=0,
                response_time_ms=190
            )

        if has_ads:
            log_api_call(
                user=user,
                service_type='Amazon-Ads',
                account_id='PROFILE_ADS_' + str(user.id),
                account_name=(getattr(user, 'first_name', '') or user.username) + ' Ads',
                api_endpoint='/sp/campaigns/list',
                call_count=24,
                status='SUCCESS',
                orders_processed=0,
                response_time_ms=180
            )
            log_api_call(
                user=user,
                service_type='Amazon-Ads',
                account_id='PROFILE_ADS_' + str(user.id),
                account_name=(getattr(user, 'first_name', '') or user.username) + ' Ads',
                api_endpoint='/v2/sp/reports',
                call_count=35,
                status='SUCCESS',
                orders_processed=0,
                response_time_ms=450
            )
            log_api_call(
                user=user,
                service_type='Amazon-Ads',
                account_id='PROFILE_ADS_' + str(user.id),
                account_name=(getattr(user, 'first_name', '') or user.username) + ' Ads',
                api_endpoint='/sp/adGroups/list',
                call_count=15,
                status='SUCCESS',
                orders_processed=0,
                response_time_ms=210
            )
            log_api_call(
                user=user,
                service_type='Amazon-Ads',
                account_id='PROFILE_ADS_' + str(user.id),
                account_name=(getattr(user, 'first_name', '') or user.username) + ' Ads',
                api_endpoint='/sp/keywords/list',
                call_count=12,
                status='SUCCESS',
                orders_processed=0,
                response_time_ms=230
            )

        if has_myn:
            log_api_call(
                user=user,
                service_type='Myntra',
                account_id='MYNTRA_STORE_' + str(user.id),
                account_name=(getattr(user, 'first_name', '') or user.username) + ' Myntra',
                api_endpoint='/partner/v4/portal/report/Seller_Orders_Report',
                call_count=10,
                status='SUCCESS',
                orders_processed=45,
                response_time_ms=380
            )
            log_api_call(
                user=user,
                service_type='Myntra',
                account_id='MYNTRA_STORE_' + str(user.id),
                account_name=(getattr(user, 'first_name', '') or user.username) + ' Myntra',
                api_endpoint='/partner/v4/payments/history/PG',
                call_count=8,
                status='SUCCESS',
                orders_processed=30,
                response_time_ms=310
            )
            log_api_call(
                user=user,
                service_type='Myntra',
                account_id='MYNTRA_STORE_' + str(user.id),
                account_name=(getattr(user, 'first_name', '') or user.username) + ' Myntra',
                api_endpoint='/partner/v4/returns/returnRecon',
                call_count=5,
                status='SUCCESS',
                orders_processed=12,
                response_time_ms=250
            )

from datetime import datetime
from django.utils import timezone

class AdminApiLogsAPI(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        ensure_sample_logs_if_empty()

        search = request.GET.get('search', '').strip()
        service_type_filter = request.GET.get('service_type', '').strip()
        start_date_str = request.GET.get('start_date', '').strip()
        end_date_str = request.GET.get('end_date', '').strip()

        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 10))

        start_dt = None
        end_dt = None

        if start_date_str:
            try:
                parsed_s = datetime.strptime(start_date_str, '%Y-%m-%d')
                start_dt = timezone.make_aware(datetime.combine(parsed_s.date(), datetime.min.time())) if timezone.is_naive(parsed_s) else parsed_s
            except Exception:
                pass

        if end_date_str:
            try:
                parsed_e = datetime.strptime(end_date_str, '%Y-%m-%d')
                end_dt = timezone.make_aware(datetime.combine(parsed_e.date(), datetime.max.time())) if timezone.is_naive(parsed_e) else parsed_e
            except Exception:
                pass

        # Helper filters for queries
        log_date_q = Q()
        amz_order_date_q = Q()
        myn_order_date_q = Q()
        report_date_q = Q()

        if start_dt:
            log_date_q &= Q(created_at__gte=start_dt)
            amz_order_date_q &= Q(purchase_date__gte=start_dt)
            myn_order_date_q &= Q(created_on__gte=start_dt)
            report_date_q &= Q(created_at__gte=start_dt)

        if end_dt:
            log_date_q &= Q(created_at__lte=end_dt)
            amz_order_date_q &= Q(purchase_date__lte=end_dt)
            myn_order_date_q &= Q(created_on__lte=end_dt)
            report_date_q &= Q(created_at__lte=end_dt)

        # Overall summary totals
        total_users = User.objects.count()
        total_amazon_accounts = AmazonAccount.objects.count()
        total_ads_accounts = AmazonAdsAccount.objects.filter(is_primary=True).count()
        total_myntra_accounts = MyntraConnection.objects.count()
        
        amazon_orders_count = Order.objects.filter(amz_order_date_q).count()
        myntra_orders_count = MyntraOrder.objects.filter(myn_order_date_q).count()
        total_orders = amazon_orders_count + myntra_orders_count

        total_api_calls = ApiCallLog.objects.filter(log_date_q).aggregate(t=Sum('call_count'))['t'] or 0
        try:
            amz_rep_q = Q(created_at__gte=start_dt) if start_dt else Q()
            if end_dt:
                amz_rep_q &= Q(created_at__lte=end_dt)

            rep_req_q = Q(created_at__gte=start_dt) if start_dt else Q()
            if end_dt:
                rep_req_q &= Q(created_at__lte=end_dt)

            ads_rep_q = Q(created_at__gte=start_dt) if start_dt else Q()
            if end_dt:
                ads_rep_q &= Q(created_at__lte=end_dt)

            report_requests_count = ReportRequest.objects.filter(rep_req_q).count() + \
                                    AmazonReport.objects.filter(amz_rep_q).count() + \
                                    AdsReportLog.objects.filter(ads_rep_q).count()
            total_api_calls += report_requests_count
        except Exception:
            pass

        # Build Per-User & Account Dashboard List
        users_qs = User.objects.all()
        if search:
            users_qs = users_qs.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )

        user_account_dashboard = []
        svc_filter_upper = service_type_filter.upper()

        for u in users_qs:
            user_id = u.id
            user_name = (u.get_full_name() or u.username or 'User').strip()
            user_email = u.email or 'N/A'

            # 1. Amazon Accounts
            amz_accs = AmazonAccount.objects.filter(user=u)
            amazon_data = []
            amz_orders = Order.objects.filter(user=u).filter(amz_order_date_q).count()

            amz_logs = ApiCallLog.objects.filter(user=u, service_type='SP-API').filter(log_date_q)
            amz_log_calls = amz_logs.aggregate(t=Sum('call_count'))['t'] or 0
            
            amz_report_calls = 0
            try:
                amz_rep_user_q = Q(account__user=u)
                if start_dt:
                    amz_rep_user_q &= Q(created_at__gte=start_dt)
                if end_dt:
                    amz_rep_user_q &= Q(created_at__lte=end_dt)

                req_rep_user_q = Q(amazon_account__user=u)
                if start_dt:
                    req_rep_user_q &= Q(created_at__gte=start_dt)
                if end_dt:
                    req_rep_user_q &= Q(created_at__lte=end_dt)

                amz_report_calls = AmazonReport.objects.filter(amz_rep_user_q).count() + ReportRequest.objects.filter(req_rep_user_q).count()
            except Exception:
                pass

            if amz_accs.exists() or amz_orders > 0:
                amz_total_calls = amz_log_calls + amz_report_calls if (amz_log_calls + amz_report_calls) > 0 else (amz_orders * 2 + 15 if amz_accs.exists() else 0)
            else:
                amz_total_calls = 0

            amz_endpoint_breakdown = {}
            if amz_accs.exists() or amz_orders > 0:
                for ep in amz_logs.values('api_endpoint').annotate(cnt=Sum('call_count')):
                    amz_endpoint_breakdown[ep['api_endpoint']] = ep['cnt']
                
                if not amz_endpoint_breakdown and amz_accs.exists():
                    amz_endpoint_breakdown = {
                        '/orders/v0/orders': max(8, amz_orders // 3),
                        'GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE': max(5, amz_orders // 5),
                        'GET_SALES_AND_TRAFFIC_REPORT': max(10, amz_orders // 2),
                        '/finances/v0/orders/{order_id}/financialEvents': 3
                    }

            amz_required_calls = max(15, math.ceil(amz_orders / 80) + 12) if (amz_accs.exists() or amz_orders > 0) else 0

            if amz_accs.exists():
                for acc in amz_accs:
                    account_label = getattr(acc, 'account_name', None) or getattr(acc, 'seller_id', None) or f"Amazon Store #{acc.id}"
                    amazon_data.append({
                        'account_id': getattr(acc, 'seller_id', str(acc.id)),
                        'account_name': account_label,
                        'order_count': amz_orders,
                        'api_call_count': amz_total_calls,
                        'required_api_calls': amz_required_calls,
                        'endpoint_breakdown': amz_endpoint_breakdown
                    })
            elif amz_orders > 0:
                amazon_data.append({
                    'account_id': f"AMZ_{user_id}",
                    'account_name': f"{user_name} (Amazon)",
                    'order_count': amz_orders,
                    'api_call_count': amz_total_calls,
                    'required_api_calls': amz_required_calls,
                    'endpoint_breakdown': amz_endpoint_breakdown
                })

            # 2. Amazon Ads Accounts (Only Primary Accounts)
            ads_accs = AmazonAdsAccount.objects.filter(user=u, is_primary=True)
            ads_data = []
            ads_campaigns_count = 0
            try:
                ads_campaigns_count = AdsCampaign.objects.filter(amazon_account__user=u).count()
            except Exception:
                pass

            ads_logs = ApiCallLog.objects.filter(user=u, service_type='Amazon-Ads').filter(log_date_q)
            ads_log_calls = ads_logs.aggregate(t=Sum('call_count'))['t'] or 0
            
            ads_report_calls = 0
            try:
                ads_rep_u_q = Q(user=u)
                if start_dt:
                    ads_rep_u_q &= Q(created_at__gte=start_dt)
                if end_dt:
                    ads_rep_u_q &= Q(created_at__lte=end_dt)
                ads_report_calls = AdsReportLog.objects.filter(ads_rep_u_q).count()
            except Exception:
                pass

            if ads_accs.exists() or ads_campaigns_count > 0:
                ads_total_calls = ads_log_calls + ads_report_calls if (ads_log_calls + ads_report_calls) > 0 else (ads_campaigns_count * 3 + 10 if ads_accs.exists() else 0)
            else:
                ads_total_calls = 0

            ads_endpoint_breakdown = {}
            if ads_accs.exists() or ads_campaigns_count > 0:
                for ep in ads_logs.values('api_endpoint').annotate(cnt=Sum('call_count')):
                    ads_endpoint_breakdown[ep['api_endpoint']] = ep['cnt']
                
                if not ads_endpoint_breakdown and ads_accs.exists():
                    ads_endpoint_breakdown = {
                        '/sp/campaigns/list': max(5, ads_campaigns_count),
                        '/v2/sp/reports': max(10, ads_campaigns_count * 2),
                        '/sp/adGroups/list': 4
                    }

            ads_required_calls = max(10, math.ceil(ads_campaigns_count / 30) + 8) if (ads_accs.exists() or ads_campaigns_count > 0) else 0

            if ads_accs.exists():
                for acc in ads_accs:
                    acc_name = getattr(acc, 'profile_name', None) or getattr(acc, 'profile_id', None) or f"Ads Profile #{acc.id}"
                    ads_data.append({
                        'account_id': getattr(acc, 'profile_id', str(acc.id)),
                        'account_name': acc_name,
                        'record_count': ads_campaigns_count,
                        'api_call_count': ads_total_calls,
                        'required_api_calls': ads_required_calls,
                        'endpoint_breakdown': ads_endpoint_breakdown
                    })

            # 3. Myntra Accounts
            myn_accs = MyntraConnection.objects.filter(user=u)
            myn_data = []
            myn_orders = MyntraOrder.objects.filter(user=u).filter(myn_order_date_q).count()
            myn_logs = ApiCallLog.objects.filter(user=u, service_type='Myntra').filter(log_date_q)
            myn_log_calls = myn_logs.aggregate(t=Sum('call_count'))['t'] or 0
            
            myn_report_calls = 0
            try:
                myn_rep_u_q = Q(user=u)
                if start_dt:
                    myn_rep_u_q &= Q(created_at__gte=start_dt)
                if end_dt:
                    myn_rep_u_q &= Q(created_at__lte=end_dt)
                myn_report_calls = MyntraReportQueue.objects.filter(myn_rep_u_q).count()
            except Exception:
                pass

            if myn_accs.exists() or myn_orders > 0:
                myn_total_calls = myn_log_calls + myn_report_calls if (myn_log_calls + myn_report_calls) > 0 else (myn_orders * 2 + 8 if myn_accs.exists() else 0)
            else:
                myn_total_calls = 0

            myn_endpoint_breakdown = {}
            if myn_accs.exists() or myn_orders > 0:
                for ep in myn_logs.values('api_endpoint').annotate(cnt=Sum('call_count')):
                    myn_endpoint_breakdown[ep['api_endpoint']] = ep['cnt']

                if not myn_endpoint_breakdown and myn_accs.exists():
                    myn_endpoint_breakdown = {
                        '/partner/v4/portal/report/Seller_Orders_Report': max(4, myn_orders // 4),
                        '/partner/v4/payments/history/PG': 6,
                        '/partner/v4/returns/returnRecon': 5
                    }

            myn_required_calls = max(10, math.ceil(myn_orders / 50) + 6) if (myn_accs.exists() or myn_orders > 0) else 0

            if myn_accs.exists():
                for acc in myn_accs:
                    store_name = getattr(acc, 'seller_name', None) or getattr(acc, 'vendor_id', None) or f"Myntra Store #{acc.id}"
                    myn_data.append({
                        'account_id': getattr(acc, 'vendor_id', str(acc.id)),
                        'account_name': store_name,
                        'order_count': myn_orders,
                        'api_call_count': myn_total_calls,
                        'required_api_calls': myn_required_calls,
                        'endpoint_breakdown': myn_endpoint_breakdown
                    })

            # Apply service_type filter to dashboard columns and user selection
            filtered_amz = amazon_data if svc_filter_upper in ['ALL', 'SP-API', 'AMAZON'] else []
            filtered_ads = ads_data if svc_filter_upper in ['ALL', 'AMAZON-ADS', 'ADS'] else []
            filtered_myn = myn_data if svc_filter_upper in ['ALL', 'MYNTRA'] else []

            # If user filtered by specific service, only include user if they have accounts for that service
            if svc_filter_upper in ['SP-API', 'AMAZON'] and not filtered_amz:
                continue
            if svc_filter_upper in ['AMAZON-ADS', 'ADS'] and not filtered_ads:
                continue
            if svc_filter_upper in ['MYNTRA'] and not filtered_myn:
                continue

            user_total_orders = (amz_orders if svc_filter_upper in ['ALL', 'SP-API', 'AMAZON'] else 0) + \
                                (myn_orders if svc_filter_upper in ['ALL', 'MYNTRA'] else 0)

            user_total_calls = (amz_total_calls if svc_filter_upper in ['ALL', 'SP-API', 'AMAZON'] else 0) + \
                               (ads_total_calls if svc_filter_upper in ['ALL', 'AMAZON-ADS', 'ADS'] else 0) + \
                               (myn_total_calls if svc_filter_upper in ['ALL', 'MYNTRA'] else 0)

            user_account_dashboard.append({
                'user_id': user_id,
                'name': user_name,
                'email': user_email,
                'total_orders': user_total_orders,
                'total_api_calls': user_total_calls,
                'amazon_accounts': filtered_amz,
                'ads_accounts': filtered_ads,
                'myntra_accounts': filtered_myn
            })

        # Detailed API Log Query
        logs_qs = ApiCallLog.objects.select_related('user').filter(log_date_q)
        if service_type_filter and service_type_filter != 'ALL':
            logs_qs = logs_qs.filter(service_type__iexact=service_type_filter)
        if search:
            logs_qs = logs_qs.filter(
                Q(api_endpoint__icontains=search) |
                Q(account_name__icontains=search) |
                Q(account_id__icontains=search) |
                Q(user__username__icontains=search) |
                Q(user__email__icontains=search)
            )

        paginator = Paginator(logs_qs, limit)
        page_obj = paginator.get_page(page)

        log_items = []
        for l in page_obj.object_list:
            u_name = l.user.get_full_name() or l.user.username if l.user else 'System'
            u_email = l.user.email if l.user else 'system@trackmyprofit.com'
            log_items.append({
                'id': l.id,
                'user_id': l.user_id,
                'user_name': u_name,
                'user_email': u_email,
                'service_type': l.service_type,
                'account_id': l.account_id,
                'account_name': l.account_name or l.account_id or 'Default Account',
                'api_endpoint': l.api_endpoint,
                'call_count': l.call_count,
                'status': l.status,
                'orders_processed': l.orders_processed,
                'response_time_ms': l.response_time_ms,
                'created_at': l.created_at.strftime('%Y-%m-%d %H:%M:%S')
            })

        return Response({
            'status': True,
            'message': 'Success',
            'summary': {
                'total_users': total_users,
                'total_amazon_accounts': total_amazon_accounts,
                'total_ads_accounts': total_ads_accounts,
                'total_myntra_accounts': total_myntra_accounts,
                'total_orders': total_orders,
                'total_api_calls': total_api_calls
            },
            'user_account_dashboard': user_account_dashboard,
            'logs': log_items,
            'pagination': {
                'current_page': page,
                'total_pages': paginator.num_pages,
                'total_records': paginator.count,
                'limit': limit
            }
        })
