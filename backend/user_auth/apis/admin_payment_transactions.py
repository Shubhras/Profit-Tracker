from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.authentication import JWTAuthentication

from subscription.utils.custom_response import success_response, error_response
from subscription.models import UserSubscription


class AdminPaymentTransactionsAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        try:
            queryset = UserSubscription.objects.select_related('user', 'user__profile', 'plan').all().order_by('-created_at')

            total_transactions = queryset.count()
            successful_qs = queryset.filter(is_paid=True) | queryset.filter(status='active')
            successful_count = successful_qs.distinct().count()
            pending_count = queryset.filter(status__in=['created', 'inactive', 'pending']).count()

            # Calculate total revenue from paid or active subscriptions
            paid_sum = queryset.filter(is_paid=True).aggregate(total=Sum('amount'))['total'] or 0.0
            total_revenue = float(paid_sum)

            transactions_list = []
            for sub in queryset:
                user_obj = sub.user
                profile = getattr(user_obj, 'profile', None) if user_obj else None
                user_name = profile.name if profile and profile.name else (user_obj.email if user_obj else "N/A")
                company = profile.business_name if profile and profile.business_name else user_name

                plan_name = sub.plan.plan_name if sub.plan else "Custom / Free Plan"

                transactions_list.append({
                    "id": sub.id,
                    "transaction_code": f"TXN-{1000 + sub.id}",
                    "user_id": user_obj.id if user_obj else None,
                    "user_email": user_obj.email if user_obj else "-",
                    "user": user_name,
                    "company": company,
                    "plan_name": plan_name,
                    "billing_cycle": sub.billing_cycle.capitalize() if sub.billing_cycle else "Monthly",
                    "amount": float(sub.amount),
                    "is_paid": sub.is_paid,
                    "status": sub.status,
                    "razorpay_payment_id": sub.razorpay_payment_id or "-",
                    "razorpay_order_id": sub.razorpay_order_id or "-",
                    "razorpay_subscription_id": sub.razorpay_subscription_id or "-",
                    "created_at": sub.created_at.strftime("%d %b %Y %I:%M %p") if sub.created_at else "-",
                    "start_date": sub.start_date.strftime("%d %b %Y") if sub.start_date else "-",
                    "end_date": sub.end_date.strftime("%d %b %Y") if sub.end_date else "-",
                })

            summary = {
                "total_transactions": total_transactions,
                "total_revenue": total_revenue,
                "successful_payments": successful_count,
                "pending_payments": pending_count
            }

            return success_response(
                message="Admin payment transactions retrieved successfully.",
                data={
                    "summary": summary,
                    "transactions": transactions_list
                }
            )

        except Exception as e:
            return error_response(f"Failed to fetch payment transactions: {str(e)}", 500)
