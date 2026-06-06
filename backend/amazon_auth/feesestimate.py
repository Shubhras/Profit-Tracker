
import time
from decimal import Decimal

from amazon_auth.models import AmazonEstimatedFee
from amazon_auth.spapi_manager import SPAPIManager

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.core.paginator import Paginator
from .serializers import AmazonEstimatedFeeSerializer
from django.db.models import Q




def save_fee_estimate(order_item, user):

    # ==============================
    # SKIP IF ALREADY EXISTS
    # ==============================

    existing_fee = AmazonEstimatedFee.objects.filter(
        order_item=order_item
    ).first()

    if existing_fee:
        print(f"FEE ALREADY EXISTS => {order_item.seller_sku}")
        return existing_fee

    # ==============================
    # CREATE MANAGER
    # ==============================

    manager = SPAPIManager(user=user)

    # ==============================
    # PRICE PER UNIT
    # ==============================

    selling_price = (
        order_item.item_price / order_item.quantity_ordered
        if order_item.quantity_ordered
        else 0
    )

    # ==============================
    # RETRY LOGIC
    # ==============================

    max_retries = 3
    response = None
    result = {}

    for attempt in range(max_retries):

        print(
            f"TRY {attempt + 1}/{max_retries} => "
            f"{order_item.seller_sku}"
        )  

        # ==============================
        # DETECT FULFILLMENT CHANNEL
        # ==============================

        fulfillment_channel = (
            order_item.order.fulfillment_channel or ""
        ).upper()

        is_fba = fulfillment_channel == "AFN"

        print(
            f"FULFILLMENT => "
            f"{fulfillment_channel} => "
            f"{'FBA' if is_fba else 'FBM'}"
        ) 

        response = manager.get_my_fees_estimate_for_sku(
            seller_sku=order_item.seller_sku,
            amount=float(selling_price),
            currency="INR",
            shipping=0,
            is_fba=is_fba,
            identifier=f"fee-{order_item.id}"
        )

        print("SP API RESPONSE => ", response)

        payload = response.get("payload", {})
        result = payload.get("FeesEstimateResult", {})

        status_value = result.get("Status")

        error_data = result.get("Error", {})

        error_code = error_data.get("Code")
        error_message = error_data.get("Message")

        # ==============================
        # SUCCESS
        # ==============================

        if status_value == "Success":

            print(
                f"SUCCESS => "
                f"{order_item.seller_sku}"
            )

            break

        # ==============================
        # INVALID SKU / PERMANENT FAIL
        # ==============================

        elif error_code == "InvalidParameterValue":

            print(
                f"INVALID SKU => "
                f"{order_item.seller_sku} => "
                f"{error_message}"
            )

            return None

        # ==============================
        # AMAZON INTERNAL ERROR
        # ==============================

        elif error_code == "InternalError":

            print(
                f"INTERNAL ERROR => "
                f"{order_item.seller_sku} => "
                f"RETRYING..."
            )

            time.sleep(2)

            continue

        # ==============================
        # UNKNOWN FAILURE
        # ==============================

        else:

            print(
                f"UNKNOWN ERROR => "
                f"{order_item.seller_sku} => "
                f"{error_message}"
            )

            return None

    # ==============================
    # FINAL CHECK
    # ==============================

    if result.get("Status") != "Success":

        print(
            f"FAILED AFTER RETRIES => "
            f"{order_item.seller_sku}"
        )

        return None

    # ==============================
    # PARSE FEES
    # ==============================

    fees_estimate = result.get("FeesEstimate", {})

    total_fees = Decimal(
        str(
            fees_estimate
            .get("TotalFeesEstimate", {})
            .get("Amount", 0)
        )
    )

    fee_detail_list = fees_estimate.get(
        "FeeDetailList",
        []
    )

    referral_fee = Decimal("0")
    closing_fee = Decimal("0")
    per_item_fee = Decimal("0")
    fba_fee = Decimal("0")
    pick_pack_fee = Decimal("0")
    weight_handling_fee = Decimal("0")
    total_tax = Decimal("0")

    for fee in fee_detail_list:

        fee_type = fee.get("FeeType")

        final_fee = Decimal(
            str(
                fee.get("FinalFee", {})
                .get("Amount", 0)
            )
        )

        tax_amount = Decimal(
            str(
                fee.get("TaxAmount", {})
                .get("Amount", 0)
            )
        )

        total_tax += tax_amount

        # ==============================
        # MAIN FEES
        # ==============================

        if fee_type == "ReferralFee":
            referral_fee = final_fee

        elif fee_type == "VariableClosingFee":
            closing_fee = final_fee

        elif fee_type == "PerItemFee":
            per_item_fee = final_fee

        elif fee_type == "FBAFees":

            fba_fee = final_fee

            included_fees = fee.get(
                "IncludedFeeDetailList",
                []
            )

            for sub_fee in included_fees:

                sub_type = sub_fee.get("FeeType")

                sub_final_fee = Decimal(
                    str(
                        sub_fee.get("FinalFee", {})
                        .get("Amount", 0)
                    )
                )

                if sub_type == "FBAPickAndPack":
                    pick_pack_fee = sub_final_fee

                elif sub_type == "FBAWeightHandling":
                    weight_handling_fee = sub_final_fee

    # ==============================
    # ESTIMATION TIME
    # ==============================

    estimated_time = fees_estimate.get(
        "TimeOfFeesEstimation"
    )

    # ==============================
    # SAVE DB
    # ==============================

    fee_obj = AmazonEstimatedFee.objects.create(

        order_item=order_item,

        amazon_account=order_item.order.amazon_account,

        seller_sku=order_item.seller_sku,

        asin=order_item.asin,

        marketplace_id=manager.marketplace_id,

        currency="INR",

        selling_price=selling_price,

        total_fees=total_fees,

        referral_fee=referral_fee,

        closing_fee=closing_fee,

        per_item_fee=per_item_fee,

        fba_fee=fba_fee,

        fba_pick_pack_fee=pick_pack_fee,

        fba_weight_handling_fee=weight_handling_fee,

        tax_amount=total_tax,

        raw_response=response,
        fulfillment_channel=fulfillment_channel,

        estimated_at=estimated_time,
    )

    print(
        f"FEE SAVED => "
        f"{order_item.seller_sku} => "
        f"{total_fees}"
    )

    return fee_obj


# class AmazonEstimatedFeeListView(APIView):

#     permission_classes = [IsAuthenticated]

#     def post(self, request):

#         data = request.data

#         filters = data.get("filters", {})
#         pagination = data.get("pagination", {})

#         page_no = int(pagination.get("pageNo", 1))
#         page_size = int(pagination.get("pageSize", 10))

#         queryset = AmazonEstimatedFee.objects.select_related(
#             "order_item",
#             "order_item__order"
#         ).all().order_by("-created_at")

#         # ---------------- FILTERS ----------------

#         seller_sku = filters.get("seller_sku")
#         asin = filters.get("asin")
#         marketplace_id = filters.get("marketplace_id")
#         fulfillment_channel = filters.get("fulfillment_channel")
#         amazon_account_id = filters.get("amazon_account_id")
#         order_item_id = filters.get("order_item_id")

#         # NEW
#         order_id = filters.get("order_id")

#         if seller_sku:
#             queryset = queryset.filter(
#                 seller_sku__icontains=seller_sku
#             )

#         if asin:
#             queryset = queryset.filter(
#                 asin__icontains=asin
#             )

#         if marketplace_id:
#             queryset = queryset.filter(
#                 marketplace_id=marketplace_id
#             )

#         if fulfillment_channel:
#             queryset = queryset.filter(
#                 fulfillment_channel=fulfillment_channel
#             )

#         if amazon_account_id:
#             queryset = queryset.filter(
#                 amazon_account_id=amazon_account_id
#             )

#         if order_item_id:
#             queryset = queryset.filter(
#                 order_item_id=order_item_id
#             )

#         # NEW FILTER
#         if order_id:
#             queryset = queryset.filter(
#                 order_item__order__amazon_order_id__icontains=order_id
#             )

#         # ---------------- PAGINATION ----------------

#         paginator = Paginator(queryset, page_size)

#         page_obj = paginator.get_page(page_no)

#         serializer = AmazonEstimatedFeeSerializer(
#             page_obj,
#             many=True
#         )

#         return Response(
#             {
#                 "status": True,
#                 "message": "Estimated fees fetched successfully",

#                 "data": serializer.data,

#                 "pagination": {
#                     "pageNo": page_no,
#                     "pageSize": page_size,
#                     "totalPages": paginator.num_pages,
#                     "totalRecords": paginator.count,
#                 }
#             },
#             status=status.HTTP_200_OK
#         )       

class AmazonEstimatedFeeListView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        data = request.data

        filters = data.get("filters", {})
        pagination = data.get("pagination", {})

        page_no = int(pagination.get("pageNo", 1))
        page_size = int(pagination.get("pageSize", 10))

        queryset = AmazonEstimatedFee.objects.select_related(
            "order_item",
            "order_item__order",
            "amazon_account"
        ).all().order_by("-created_at")

        # ---------------- FILTERS ----------------

        # Global Search
        search = filters.get("search")

        # Separate filter
        fulfillment_channel = filters.get("fulfillment_channel")

        # ---------------- SEARCH FILTER ----------------

        if search:

            queryset = queryset.filter(

                Q(seller_sku__icontains=search) |

                Q(asin__icontains=search) |

                Q(marketplace_id__icontains=search) |

                Q(order_item__order_item_id__icontains=search) |

                Q(order_item__order__amazon_order_id__icontains=search) |

                Q(amazon_account__id__icontains=search)

            )

        # ---------------- FULFILLMENT CHANNEL FILTER ----------------

        if fulfillment_channel:

            queryset = queryset.filter(
                fulfillment_channel__iexact=fulfillment_channel
            )

        # ---------------- PAGINATION ----------------

        paginator = Paginator(queryset, page_size)

        page_obj = paginator.get_page(page_no)

        serializer = AmazonEstimatedFeeSerializer(
            page_obj,
            many=True
        )

        return Response(
            {
                "status": True,
                "message": "Estimated fees fetched successfully",

                "data": serializer.data,

                "pagination": {
                    "pageNo": page_no,
                    "pageSize": page_size,
                    "totalPages": paginator.num_pages,
                    "totalRecords": paginator.count,
                }
            },
            status=status.HTTP_200_OK
        )
        
        