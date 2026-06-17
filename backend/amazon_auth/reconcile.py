# views.py

from decimal import Decimal
from django.db.models import Sum
from django.db.models.functions import TruncWeek
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from amazon_auth.models import (
    AmazonTransaction,AmazonAccount,
    AmazonTransactionBreakdown
)
from datetime import timedelta
from django.db.models.functions import TruncDate
from collections import defaultdict
from django.core.paginator import Paginator
from django.db.models import Q
from django.utils.timezone import now

from amazon_auth.serializers import (
    AmazonTransactionListSerializer
)


# class AmazonSettlementSummaryAPIView(APIView):

#     def get(self, request):

#         user = request.user

#         # =========================================
#         # Pagination
#         # =========================================

#         page = int(
#             request.query_params.get("page", 1)
#         )

#         page_size = int(
#             request.query_params.get("page_size", 10)
#         )

#         # =========================================
#         # Filters
#         # =========================================

#         settlement_date = request.query_params.get(
#             "settlement_date"
#         )

#         start_date = request.query_params.get(
#             "start_date"
#         )

#         end_date = request.query_params.get(
#             "end_date"
#         )

#         from_date = request.query_params.get(
#             "from_date"
#         )

#         transaction_type = request.query_params.get(
#             "transaction_type"
#         )

#         transaction_status = request.query_params.get(
#             "transaction_status"
#         )

#         amazon_account_id = request.query_params.get(
#             "amazon_account_id"
#         )

#         # =========================================
#         # Get Amazon Account
#         # =========================================

#         try:

#             if amazon_account_id:

#                 amazon_account = AmazonAccount.objects.get(
#                     id=amazon_account_id,
#                     user=user
#                 )

#             else:

#                 amazon_account = AmazonAccount.objects.get(
#                     user=user
#                 )

#         except AmazonAccount.DoesNotExist:

#             return Response(
#                 {
#                     "success": False,
#                     "message": "Amazon account not found"
#                 },
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         # =========================================
#         # Base Queryset
#         # =========================================

#         queryset = (
#             AmazonTransaction.objects
#             .filter(
#                 amazon_account=amazon_account,
#                 related_identifiers__identifier_name__iexact="SETTLEMENT_ID"
#             )
#             .exclude(
#                 posted_date__isnull=True
#             )
#             .prefetch_related(
#                 "related_identifiers",
#                 "breakdowns__children",
#                 "contexts"
#             )
#             .distinct()
#             .order_by("-posted_date")
#         )

#         # =========================================
#         # Optional Filters
#         # =========================================

#         if start_date:

#             queryset = queryset.filter(
#                 posted_date__date__gte=start_date
#             )

#         if end_date:

#             queryset = queryset.filter(
#                 posted_date__date__lte=end_date
#             )

#         if from_date:

#             queryset = queryset.filter(
#                 posted_date__date__gte=from_date
#             )

#         if transaction_type:

#             queryset = queryset.filter(
#                 transaction_type__iexact=transaction_type
#             )

#         if transaction_status:

#             queryset = queryset.filter(
#                 transaction_status__iexact=transaction_status
#             )

#         # =========================================
#         # EMPTY RESPONSE
#         # =========================================

#         if not queryset.exists():

#             return Response(
#                 {
#                     "success": True,
#                     "count": 0,
#                     "results": []
#                 },
#                 status=status.HTTP_200_OK
#             )

#         # =====================================================
#         # DETAILS MODE
#         # settlement_date=2026-06-04
#         # =====================================================

#         if settlement_date:

#             queryset = queryset.filter(
#                 posted_date__date=settlement_date
#             )

#             paginator = Paginator(
#                 queryset,
#                 page_size
#             )

#             page_obj = paginator.get_page(page)

#             serializer = (
#                 AmazonTransactionListSerializer(
#                     page_obj.object_list,
#                     many=True
#                 )
#             )

#             return Response(
#                 {
#                     "success": True,
#                     "type": "details",

#                     "count": paginator.count,

#                     "total_pages": paginator.num_pages,

#                     "current_page": page_obj.number,

#                     "next": (
#                         page_obj.next_page_number()
#                         if page_obj.has_next()
#                         else None
#                     ),

#                     "previous": (
#                         page_obj.previous_page_number()
#                         if page_obj.has_previous()
#                         else None
#                     ),

#                     "results": serializer.data
#                 },
#                 status=status.HTTP_200_OK
#             )

#         # =====================================================
#         # SUMMARY MODE
#         # Combine settlement data by date
#         # =====================================================

#         grouped_data = defaultdict(lambda: {

#             "sales": Decimal("0.00"),
#             "refunds": Decimal("0.00"),
#             "expenses": Decimal("0.00"),
#             "others": Decimal("0.00"),
#             "transactions": 0,
#         })

#         # =========================================
#         # LOOP TRANSACTIONS
#         # =========================================

#         for txn in queryset:

#             txn_date = txn.posted_date.date()

#             grouped_data[txn_date]["transactions"] += 1

#             breakdowns = txn.breakdowns.filter(
#                 parent__isnull=True
#             )

#             for breakdown in breakdowns:

#                 amount = (
#                     breakdown.amount
#                     or Decimal("0.00")
#                 )

#                 breakdown_type = (
#                     breakdown.breakdown_type or ""
#                 ).lower()

#                 # =====================================
#                 # SALES
#                 # =====================================

#                 if (
#                     "sale" in breakdown_type
#                     or "sales" in breakdown_type
#                 ):

#                     grouped_data[txn_date]["sales"] += amount

#                 # =====================================
#                 # REFUNDS
#                 # =====================================

#                 elif "refund" in breakdown_type:

#                     grouped_data[txn_date]["refunds"] += amount

#                 # =====================================
#                 # EXPENSES
#                 # =====================================

#                 elif (
#                     "expense" in breakdown_type
#                     or "fee" in breakdown_type
#                     or "charge" in breakdown_type
#                     or "tax" in breakdown_type
#                     or "shipping" in breakdown_type
#                 ):

#                     grouped_data[txn_date]["expenses"] += amount

#                 # =====================================
#                 # OTHERS
#                 # =====================================

#                 else:

#                     grouped_data[txn_date]["others"] += amount

#         # =========================================
#         # FINAL RESULTS
#         # =========================================

#         results = []

#         for txn_date, data in sorted(
#             grouped_data.items(),
#             reverse=True
#         ):

#             payout_amount = (
#                 data["sales"]
#                 + data["refunds"]
#                 + data["expenses"]
#                 + data["others"]
#             )

#             results.append({

#                 "settlement_date": txn_date,

#                 "sales": round(
#                     data["sales"],
#                     2
#                 ),

#                 "refunds": round(
#                     data["refunds"],
#                     2
#                 ),

#                 "expenses": round(
#                     data["expenses"],
#                     2
#                 ),

#                 "others": round(
#                     data["others"],
#                     2
#                 ),

#                 "payout_amount": round(
#                     payout_amount,
#                     2
#                 ),

#                 "total_transactions": (
#                     data["transactions"]
#                 )
#             })

#         # =========================================
#         # Pagination
#         # =========================================

#         paginator = Paginator(
#             results,
#             page_size
#         )

#         page_obj = paginator.get_page(page)

#         # =========================================
#         # FINAL RESPONSE
#         # =========================================

#         return Response(
#             {
#                 "success": True,
#                 "type": "summary",

#                 "count": paginator.count,

#                 "total_pages": paginator.num_pages,

#                 "current_page": page_obj.number,

#                 "next": (
#                     page_obj.next_page_number()
#                     if page_obj.has_next()
#                     else None
#                 ),

#                 "previous": (
#                     page_obj.previous_page_number()
#                     if page_obj.has_previous()
#                     else None
#                 ),

#                 "results": list(
#                     page_obj.object_list
#                 )
#             },
#             status=status.HTTP_200_OK
#         )
 


class AmazonSettlementSummaryAPIView(APIView):

    def get(self, request):

        user = request.user

        # =========================================
        # Pagination
        # =========================================

        page = int(
            request.query_params.get(
                "page",
                1
            )
        )

        page_size = int(
            request.query_params.get(
                "page_size",
                10
            )
        )

        # =========================================
        # Filters
        # =========================================

        settlement_date = request.query_params.get(
            "settlement_date"
        )

        transaction_status = request.query_params.get(
            "transaction_status"
        )

        transaction_type = request.query_params.get(
            "transaction_type"
        )

        start_date = request.query_params.get(
            "start_date"
        )

        end_date = request.query_params.get(
            "end_date"
        )

        from_date = request.query_params.get(
            "from_date"
        )

        search = request.query_params.get(
            "search"
        )

        amazon_account_id = request.query_params.get(
            "amazon_account_id"
        )

        # =========================================
        # Get Amazon Account
        # =========================================

        try:

            if amazon_account_id:

                amazon_account = AmazonAccount.objects.get(
                    id=amazon_account_id,
                    user=user
                )

            else:

                amazon_account = AmazonAccount.objects.get(
                    user=user
                )

        except AmazonAccount.DoesNotExist:

            return Response(
                {
                    "success": False,
                    "message": "Amazon account not found"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # =========================================
        # Base Queryset
        # =========================================

        queryset = (
            AmazonTransaction.objects
            .filter(
                amazon_account=amazon_account,

                related_identifiers__identifier_name__iexact="SETTLEMENT_ID"
            )
            .exclude(
                posted_date__isnull=True
            )
            .prefetch_related(
                "related_identifiers",
                "contexts",
                "breakdowns__children"
            )
            .distinct()
            .order_by("-posted_date")
        )

        # =========================================
        # Optional Filters
        # =========================================

        if transaction_status:

            queryset = queryset.filter(
                transaction_status__iexact=transaction_status
            )

        if transaction_type:

            queryset = queryset.filter(
                transaction_type__iexact=transaction_type
            )

        if start_date:

            queryset = queryset.filter(
                posted_date__date__gte=start_date
            )

        if end_date:

            queryset = queryset.filter(
                posted_date__date__lte=end_date
            )

        if from_date:

            queryset = queryset.filter(
                posted_date__date__gte=from_date
            )

        if search:

            queryset = queryset.filter(

                Q(transaction_id__icontains=search)

                |

                Q(description__icontains=search)

                |

                Q(
                    related_identifiers__identifier_value__icontains=search
                )
            ).distinct()

        # =========================================
        # Empty Response
        # =========================================

        if not queryset.exists():

            return Response(
                {
                    "success": True,
                    "count": 0,
                    "results": []
                },
                status=status.HTTP_200_OK
            )

        # =====================================================
        # DETAILS MODE
        # settlement_date=2026-06-04
        # =====================================================

        if settlement_date:

            queryset = queryset.filter(
                posted_date__date=settlement_date
            )

            paginator = Paginator(
                queryset,
                page_size
            )

            page_obj = paginator.get_page(page)

            serializer = (
                AmazonTransactionListSerializer(
                    page_obj.object_list,
                    many=True
                )
            )

            return Response(
                {
                    "success": True,

                    "type": "details",

                    "count": paginator.count,

                    "total_pages": paginator.num_pages,

                    "current_page": page_obj.number,

                    "next": (
                        page_obj.next_page_number()
                        if page_obj.has_next()
                        else None
                    ),

                    "previous": (
                        page_obj.previous_page_number()
                        if page_obj.has_previous()
                        else None
                    ),

                    "results": serializer.data
                },
                status=status.HTTP_200_OK
            )

        # =====================================================
        # SUMMARY MODE
        # Group settlement by each date
        # =====================================================

        grouped_data = defaultdict(
            lambda: {
                "sales": Decimal("0.00"),
                "refunds": Decimal("0.00"),
                "expenses": Decimal("0.00"),
                "others": Decimal("0.00"),
                "transactions": []
            }
        )

        # =========================================
        # Loop Transactions
        # =========================================

        for transaction in queryset:

            txn_date = (
                transaction.posted_date.date()
            )

            # =====================================
            # Breakdown Calculation
            # =====================================

            transaction_breakdowns = (
                transaction.breakdowns.filter(
                    parent__isnull=True
                )
            )

            for breakdown in transaction_breakdowns:

                amount = (
                    breakdown.amount
                    or Decimal("0.00")
                )

                breakdown_type = (
                    breakdown.breakdown_type or ""
                ).lower()

                # =================================
                # SALES
                # =================================

                if (
                    "sale" in breakdown_type
                    or "sales" in breakdown_type
                ):

                    grouped_data[txn_date]["sales"] += amount

                # =================================
                # REFUNDS
                # =================================

                elif "refund" in breakdown_type:

                    grouped_data[txn_date]["refunds"] += amount

                # =================================
                # EXPENSES
                # =================================

                elif (
                    "expense" in breakdown_type
                    or "fee" in breakdown_type
                    or "charge" in breakdown_type
                    or "tax" in breakdown_type
                    or "shipping" in breakdown_type
                ):

                    grouped_data[txn_date]["expenses"] += amount

                # =================================
                # OTHERS
                # =================================

                else:

                    grouped_data[txn_date]["others"] += amount

            # =====================================
            # Settlement Id
            # =====================================

            settlement_identifier = (
                transaction.related_identifiers
                .filter(
                    identifier_name__iexact="SETTLEMENT_ID"
                )
                .first()
            )

            # =====================================
            # Add Transaction
            # =====================================

            grouped_data[txn_date]["transactions"].append({

                "id": transaction.id,

                "transaction_id": (
                    transaction.transaction_id
                ),

                "transaction_type": (
                    transaction.transaction_type
                ),

                "transaction_status": (
                    transaction.transaction_status
                ),

                "description": (
                    transaction.description
                ),

                "posted_date": (
                    transaction.posted_date
                ),

                "total_amount": (
                    transaction.total_amount
                ),

                "currency_code": (
                    transaction.currency_code
                ),

                "settlement_id": (
                    settlement_identifier.identifier_value
                    if settlement_identifier
                    else None
                )
            })

        # =========================================
        # Final Results
        # =========================================

        response_data = []

        for txn_date, data in sorted(
            grouped_data.items(),
            reverse=True
        ):

            payout_amount = (

                data["sales"]

                +

                data["refunds"]

                +

                data["expenses"]

                +

                data["others"]
            )

            response_data.append({

                "settlement_date": txn_date,

                "sales": round(
                    data["sales"],
                    2
                ),

                "refunds": round(
                    data["refunds"],
                    2
                ),

                "expenses": round(
                    data["expenses"],
                    2
                ),

                "others": round(
                    data["others"],
                    2
                ),

                "payout_amount": round(
                    payout_amount,
                    2
                ),

                "total_transactions": len(
                    data["transactions"]
                ),

                "transactions": (
                    data["transactions"]
                )
            })

        # =========================================
        # Pagination
        # =========================================

        paginator = Paginator(
            response_data,
            page_size
        )

        page_obj = paginator.get_page(page)

        # =========================================
        # Final Response
        # =========================================

        return Response(
            {
                "success": True,

                "type": "summary",

                "count": paginator.count,

                "total_pages": paginator.num_pages,

                "current_page": page_obj.number,

                "next": (
                    page_obj.next_page_number()
                    if page_obj.has_next()
                    else None
                ),

                "previous": (
                    page_obj.previous_page_number()
                    if page_obj.has_previous()
                    else None
                ),

                "results": list(
                    page_obj.object_list
                )
            },
            status=status.HTTP_200_OK
        )
                
    


class AmazonTransactionsGroupedAPIView(APIView):

    def get(self, request):

        user = request.user

        # =====================================
        # Pagination
        # =====================================

        page = int(
            request.query_params.get("page", 1)
        )

        page_size = int(
            request.query_params.get("page_size", 10)
        )

        # =====================================
        # Filters
        # =====================================

        transaction_status = request.query_params.get(
            "transaction_status"
        )

        transaction_type = request.query_params.get(
            "transaction_type"
        )

        start_date = request.query_params.get(
            "start_date"
        )

        end_date = request.query_params.get(
            "end_date"
        )

        search = request.query_params.get(
            "search"
        )

        details = request.query_params.get(
            "details"
        )

        amazon_account_id = request.query_params.get(
            "amazon_account_id"
        )

        # =====================================
        # Amazon Account
        # =====================================

        try:

            if amazon_account_id:

                amazon_account = AmazonAccount.objects.get(
                    id=amazon_account_id,
                    user=user
                )

            else:

                amazon_account = AmazonAccount.objects.get(
                    user=user
                )

        except AmazonAccount.DoesNotExist:

            return Response(
                {
                    "success": False,
                    "message": "Amazon account not found"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # =====================================
        # Base Queryset
        # =====================================

        queryset = (
            AmazonTransaction.objects
            .filter(
                amazon_account=amazon_account
            )
            .exclude(
                posted_date__isnull=True
            )
            .prefetch_related(
                "related_identifiers",
                "contexts",
                "breakdowns__children"
            )
            .order_by("-posted_date")
            .distinct()
        )

        # =====================================
        # Filters
        # =====================================

        if transaction_status:

            queryset = queryset.filter(
                transaction_status__iexact=transaction_status
            )

        if transaction_type:

            queryset = queryset.filter(
                transaction_type__iexact=transaction_type
            )

        if start_date:

            queryset = queryset.filter(
                posted_date__date__gte=start_date
            )

        if end_date:

            queryset = queryset.filter(
                posted_date__date__lte=end_date
            )

        if search:

            queryset = queryset.filter(

                Q(transaction_id__icontains=search)

                |

                Q(description__icontains=search)

                |

                Q(transaction_type__icontains=search)

                |

                Q(transaction_status__icontains=search)

                |

                Q(
                    related_identifiers__identifier_name__icontains=search
                )

                |

                Q(
                    related_identifiers__identifier_value__icontains=search
                )

                |

                Q(
                    contexts__asin__icontains=search
                )

                |

                Q(
                    contexts__sku__icontains=search
                )
            ).distinct()

        # =====================================
        # Empty Response
        # =====================================

        if not queryset.exists():

            return Response(
                {
                    "success": True,
                    "count": 0,
                    "results": []
                },
                status=status.HTTP_200_OK
            )

        # =====================================
        # Group By Date
        # =====================================

        grouped_data = defaultdict(list)

        for transaction in queryset:

            transaction_date = (
                transaction.posted_date.date()
            )

            grouped_data[transaction_date].append(
                transaction
            )

        response_data = []

        # =====================================
        # Date Wise Loop
        # =====================================

        for transaction_date in sorted(
            grouped_data.keys(),
            reverse=True
        ):

            transactions = grouped_data[
                transaction_date
            ]

            sales = Decimal("0.00")
            refunds = Decimal("0.00")
            expenses = Decimal("0.00")
            others = Decimal("0.00")

            transaction_ids = [
                txn.id for txn in transactions
            ]

            breakdowns_queryset = (
                AmazonTransactionBreakdown.objects
                .filter(
                    transaction_id__in=transaction_ids,
                    parent__isnull=True
                )
            )

            for breakdown in breakdowns_queryset:

                amount = (
                    breakdown.amount
                    or Decimal("0.00")
                )

                breakdown_type = (
                    breakdown.breakdown_type or ""
                ).lower()

                if "sale" in breakdown_type:

                    sales += amount

                elif "refund" in breakdown_type:

                    refunds += amount

                elif (
                    "expense" in breakdown_type
                    or "fee" in breakdown_type
                    or "charge" in breakdown_type
                    or "shipping" in breakdown_type
                    or "tax" in breakdown_type
                ):

                    expenses += amount

                else:

                    others += amount

            payout_amount = (
                sales +
                refunds +
                expenses +
                others
            )

            transactions_data = []

            # =====================================
            # Details Response
            # =====================================

            if details == "true":

                for transaction in transactions:

                    related_identifiers = [
                        {
                            "id": identifier.id,
                            "identifier_name": identifier.identifier_name,
                            "identifier_value": identifier.identifier_value
                        }
                        for identifier in transaction.related_identifiers.all()
                    ]

                    contexts = [
                        {
                            "id": context.id,
                            "context_type": context.context_type,
                            "asin": context.asin,
                            "sku": context.sku,
                            "quantity_shipped": context.quantity_shipped,
                            "fulfillment_network": context.fulfillment_network,
                            "store_name": context.store_name,
                            "channel": context.channel
                        }
                        for context in transaction.contexts.all()
                    ]

                    breakdowns = []

                    for breakdown in transaction.breakdowns.filter(
                        parent__isnull=True
                    ):

                        children = [
                            {
                                "id": child.id,
                                "breakdown_type": child.breakdown_type,
                                "amount": child.amount,
                                "currency_code": child.currency_code
                            }
                            for child in breakdown.children.all()
                        ]

                        breakdowns.append({
                            "id": breakdown.id,
                            "breakdown_type": breakdown.breakdown_type,
                            "amount": breakdown.amount,
                            "currency_code": breakdown.currency_code,
                            "children": children
                        })

                    transactions_data.append({

                        "id": transaction.id,

                        "transaction_id": transaction.transaction_id,

                        "transaction_type": transaction.transaction_type,

                        "transaction_status": transaction.transaction_status,

                        "description": transaction.description,

                        "posted_date": transaction.posted_date,

                        "total_amount": transaction.total_amount,

                        "currency_code": transaction.currency_code,

                        "related_identifiers": related_identifiers,

                        "contexts": contexts,

                        "breakdowns": breakdowns,

                        "created_at": transaction.created_at,

                        "updated_at": transaction.updated_at
                    })

            response_data.append({

                "statement_period": transaction_date.strftime(
                    "%d/%m/%Y"
                ),

                "date": transaction_date,

                "beginning_balance": 0.00,

                "sales": round(sales, 2),

                "refunds": round(refunds, 2),

                "expenses": round(expenses, 2),

                "others": round(others, 2),

                "payout_amount": round(
                    payout_amount,
                    2
                ),

                "total_transactions": len(
                    transactions
                ),

                "transactions": (
                    transactions_data
                    if details == "true"
                    else []
                )
            })

        # =====================================
        # Pagination
        # =====================================

        paginator = Paginator(
            response_data,
            page_size
        )

        page_obj = paginator.get_page(page)

        # =====================================
        # Count Logic
        # =====================================

        if details == "true":

            total_count = queryset.count()

        else:

            total_count = paginator.count

        # =====================================
        # Final Response
        # =====================================

        return Response(
            {
                "success": True,

                "count": total_count,

                "total_pages": paginator.num_pages,

                "current_page": page_obj.number,

                "next": (
                    page_obj.next_page_number()
                    if page_obj.has_next()
                    else None
                ),

                "previous": (
                    page_obj.previous_page_number()
                    if page_obj.has_previous()
                    else None
                ),

                "results": list(
                    page_obj.object_list
                )
            },
            status=status.HTTP_200_OK
        )
                
class AmazonOrderRelatedTransactionsAPIView(APIView):

    def get(self, request):

        user = request.user

        # =====================================
        # Pagination
        # =====================================

        page = int(
            request.query_params.get(
                "page",
                1
            )
        )

        page_size = int(
            request.query_params.get(
                "page_size",
                10
            )
        )

        # =====================================
        # Filters
        # =====================================

        order_id = request.query_params.get(
            "order_id"
        )

        transaction_type = request.query_params.get(
            "transaction_type"
        )

        transaction_status = request.query_params.get(
            "transaction_status"
        )

        search = request.query_params.get(
            "search"
        )

        start_date = request.query_params.get(
            "start_date"
        )

        end_date = request.query_params.get(
            "end_date"
        )

        amazon_account_id = request.query_params.get(
            "amazon_account_id"
        )

        # =====================================
        # Get Amazon Account
        # =====================================

        try:

            if amazon_account_id:

                amazon_account = (
                    AmazonAccount.objects.get(
                        id=amazon_account_id,
                        user=user
                    )
                )

            else:

                amazon_account = (
                    AmazonAccount.objects.get(
                        user=user
                    )
                )

        except AmazonAccount.DoesNotExist:

            return Response(
                {
                    "success": False,
                    "message": (
                        "Amazon account not found"
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # =====================================
        # Base Queryset
        # =====================================

        queryset = (
            AmazonTransaction.objects
            .filter(
                amazon_account=amazon_account
            )
            .prefetch_related(
                "related_identifiers",
                "breakdowns__children",
                "contexts"
            )
            .order_by("-posted_date")
            .distinct()
        )

        # =====================================
        # Filter By Order Id
        # =====================================

        if order_id:

            queryset = queryset.filter(
                related_identifiers__identifier_value=order_id
            )
            
            
        queryset = (
            AmazonTransaction.objects
            .filter(
                amazon_account=amazon_account,

                related_identifiers__identifier_name__icontains="order"
            )
            .exclude(
                related_identifiers__identifier_value__isnull=True
            )
            .exclude(
                related_identifiers__identifier_value=""
            )
            .prefetch_related(
                "related_identifiers",
                "breakdowns__children",
                "contexts"
            )
            .order_by("-posted_date")
            .distinct()
        )    

        # =====================================
        # Transaction Type Filter
        # =====================================

        if transaction_type:

            queryset = queryset.filter(
                transaction_type__iexact=(
                    transaction_type
                )
            )

        # =====================================
        # Transaction Status Filter
        # =====================================

        if transaction_status:

            queryset = queryset.filter(
                transaction_status__iexact=(
                    transaction_status
                )
            )

        # =====================================
        # Date Range Filter
        # =====================================

        if start_date:

            queryset = queryset.filter(
                posted_date__date__gte=start_date
            )

        if end_date:

            queryset = queryset.filter(
                posted_date__date__lte=end_date
            )

        # =====================================
        # Search Filter
        # =====================================

        if search:

            queryset = queryset.filter(

                Q(transaction_id__icontains=search) 

                |
                
                Q(related_identifiers__identifier_value__icontains=search)

                |

                Q(description__icontains=search)

                |

                Q(transaction_type__icontains=search)

                |

                Q(transaction_status__icontains=search)

                |

                Q(
                    related_identifiers__identifier_value__icontains=search
                )

                |

                Q(
                    related_identifiers__identifier_name__icontains=search
                )

                |

                Q(
                    contexts__asin__icontains=search
                )

                |

                Q(
                    contexts__sku__icontains=search
                )
            ).distinct()

        # =====================================
        # Pagination
        # =====================================

        paginator = Paginator(
            queryset,
            page_size
        )

        page_obj = paginator.get_page(page)

        serializer = (
            AmazonTransactionListSerializer(
                page_obj.object_list,
                many=True
            )
        )

        # =====================================
        # Response
        # =====================================

        return Response(
            {
                "success": True,

                "count": paginator.count,

                "total_pages": (
                    paginator.num_pages
                ),

                "current_page": (
                    page_obj.number
                ),

                "next": (
                    page_obj.next_page_number()
                    if page_obj.has_next()
                    else None
                ),

                "previous": (
                    page_obj.previous_page_number()
                    if page_obj.has_previous()
                    else None
                ),

                "results": serializer.data
            },
            status=status.HTTP_200_OK
        )
        

class AmazonRefundTransactionsAPIView(APIView):

    def get(self, request):

        user = request.user

        # =====================================
        # Pagination
        # =====================================

        page = int(
            request.query_params.get(
                "page",
                1
            )
        )

        page_size = int(
            request.query_params.get(
                "page_size",
                10
            )
        )

        # =====================================
        # Filters
        # =====================================

        search = request.query_params.get(
            "search"
        )

        transaction_id = request.query_params.get(
            "transaction_id"
        )

        transaction_status = request.query_params.get(
            "transaction_status"
        )

        start_date = request.query_params.get(
            "start_date"
        )

        end_date = request.query_params.get(
            "end_date"
        )

        amazon_account_id = request.query_params.get(
            "amazon_account_id"
        )

        # =====================================
        # Get Amazon Account
        # =====================================

        try:

            if amazon_account_id:

                amazon_account = (
                    AmazonAccount.objects.get(
                        id=amazon_account_id,
                        user=user
                    )
                )

            else:

                amazon_account = (
                    AmazonAccount.objects.get(
                        user=user
                    )
                )

        except AmazonAccount.DoesNotExist:

            return Response(
                {
                    "success": False,
                    "message": (
                        "Amazon account not found"
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # =====================================
        # Base Queryset
        # =====================================

        queryset = (
            AmazonTransaction.objects
            .filter(
                amazon_account=amazon_account,
                transaction_type__icontains="refund"
            )
            .prefetch_related(
                "related_identifiers",
                "breakdowns__children",
                "contexts"
            )
            .order_by("-posted_date")
            .distinct()
        )

        # =====================================
        # Transaction Id Filter
        # =====================================

        if transaction_id:

            queryset = queryset.filter(
                transaction_id__icontains=transaction_id
            )

        # =====================================
        # Status Filter
        # =====================================

        if transaction_status:

            queryset = queryset.filter(
                transaction_status__iexact=(
                    transaction_status
                )
            )

        # =====================================
        # Date Range Filter
        # =====================================

        if start_date:

            queryset = queryset.filter(
                posted_date__date__gte=start_date
            )

        if end_date:

            queryset = queryset.filter(
                posted_date__date__lte=end_date
            )

        # =====================================
        # Search Filter
        # =====================================

        if search:

            queryset = queryset.filter(

                Q(
                    transaction_id__icontains=search
                )

                |

                Q(
                    description__icontains=search
                )

                |

                Q(
                    transaction_status__icontains=search
                )

                |

                Q(
                    related_identifiers__identifier_value__icontains=search
                )

                |

                Q(
                    contexts__asin__icontains=search
                )

                |

                Q(
                    contexts__sku__icontains=search
                )

            ).distinct()

        # =====================================
        # Total Refund Amount
        # =====================================

        total_refund_amount = (
            queryset.aggregate(
                total=Sum("total_amount")
            )["total"]
            or Decimal("0.00")
        )

        # =====================================
        # Refund Graph Data
        # =====================================

        refund_graph = (
            queryset
            .annotate(
                refund_date=TruncDate(
                    "posted_date"
                )
            )
            .values("refund_date")
            .annotate(
                refund_amount=Sum(
                    "total_amount"
                )
            )
            .order_by("refund_date")
        )

        graph_data = []

        for item in refund_graph:

            graph_data.append({

                "date": item["refund_date"],

                "refund_amount": round(
                    item["refund_amount"]
                    or Decimal("0.00"),
                    2
                )
            })

        # =====================================
        # Pagination
        # =====================================

        paginator = Paginator(
            queryset,
            page_size
        )

        page_obj = paginator.get_page(page)

        serializer = (
            AmazonTransactionListSerializer(
                page_obj.object_list,
                many=True
            )
        )

        # =====================================
        # Response
        # =====================================

        return Response(
            {
                "success": True,

                "count": paginator.count,

                "total_pages": (
                    paginator.num_pages
                ),

                "current_page": (
                    page_obj.number
                ),

                "next": (
                    page_obj.next_page_number()
                    if page_obj.has_next()
                    else None
                ),

                "previous": (
                    page_obj.previous_page_number()
                    if page_obj.has_previous()
                    else None
                ),

                "total_refund_amount": round(
                    total_refund_amount,
                    2
                ),

                "refund_graph": graph_data,

                "results": serializer.data
            },
            status=status.HTTP_200_OK
        )
                       