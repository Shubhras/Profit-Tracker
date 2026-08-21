from collections import defaultdict
from decimal import Decimal

from blinkit.models import (
    BlinkitOrder,
    BlinkitOrderItem,
    BlinkitStorageCharge,
)

from .calculator import BlinkitProfitCalculator

ZERO = Decimal("0")


class BlinkitOrderSummary:
    """
    Blinkit Order-level profitability summary.

    Logical hierarchy:

        Item ID
            ↓
        Order ID

    Database records may contain multiple rows for the same
    order_id:

        order_id + FORWARD
        order_id + RETURN
        order_id + CANCELLED

    The final summary exposes ONE logical row per order_id.
    """

    def __init__(self, user, filters=None):
        self.user = user
        self.filters = filters or {}

        self.calculator = BlinkitProfitCalculator(
            user=user,
            filters=filters,
        )

    # ============================================================
    # ORDERS
    # ============================================================

    def get_orders(self):
        """
        Get Blinkit orders for the authenticated user.
        """

        orders = BlinkitOrder.objects.filter(
            account__user=self.user,
        )

        start_date = self.filters.get("fromDate")
        end_date = self.filters.get("toDate")

        if start_date:
            orders = orders.filter(
                order_date__date__gte=start_date,
            )

        if end_date:
            orders = orders.filter(
                order_date__date__lte=end_date,
            )

        return orders.select_related(
            "account",
            "payout",
        ).order_by("-order_date")

    # ============================================================
    # ORDER ITEMS
    # ============================================================

    def get_order_items(self, orders):
        """
        Get all OrderItems belonging to the selected orders.
        """

        order_ids = orders.values_list(
            "id",
            flat=True,
        )

        return BlinkitOrderItem.objects.filter(
            order_id__in=order_ids,
        ).select_related(
            "order",
            "product",
        )

    # ============================================================
    # STORAGE
    # ============================================================

    def get_storage_charges(self):
        """
        Load storage charges for the user's Blinkit account.
        """

        return BlinkitStorageCharge.objects.filter(
            account__user=self.user,
        )

    def build_storage_allocation_map(
        self,
        storage_charges,
        items,
    ):
        """
        Allocate DAILY_AGEING storage across matching FORWARD
        OrderItems.

        Daily storage is stored inside raw_data.

        Example:

            {
                "2026-06-01": 1,
                "2026-06-02": 0,
                "2026-06-03": 1,
            }

        Daily charge:

            inventory_units * per_day_charge

        The daily charge is divided across matching FORWARD
        OrderItems having the same:

            item_id + order_date

        Final result:

            OrderItem.id -> allocated storage

        UPFRONT_STORAGE is handled separately below.
        """

        item_date_map = defaultdict(list)

        # --------------------------------------------------------
        # Build:
        #
        # (item_id, order_date) -> FORWARD OrderItems
        # --------------------------------------------------------

        for item in items:
            if not item.item_id:
                continue

            if not item.order:
                continue

            if not item.order.order_date:
                continue

            if item.order.order_kind != "FORWARD":
                continue

            item_id = str(item.item_id)

            order_date = item.order.order_date.date()

            item_date_map[(item_id, order_date)].append(item)

        allocation_map = defaultdict(lambda: ZERO)

        # --------------------------------------------------------
        # DAILY AGEING
        # --------------------------------------------------------

        for charge in storage_charges:
            if charge.charge_type != "DAILY_AGEING":
                continue

            if not charge.item_id:
                continue

            item_id = str(charge.item_id)

            raw_data = charge.raw_data or {}

            per_day_charge = self.calculator._decimal(charge.per_day_charge)

            if per_day_charge == ZERO:
                continue

            for date_key, inventory_units in raw_data.items():
                if not (
                    isinstance(
                        date_key,
                        str,
                    )
                    and len(date_key) == 10
                    and date_key[4] == "-"
                    and date_key[7] == "-"
                ):
                    continue

                try:
                    from datetime import date

                    charge_date = date.fromisoformat(date_key)

                except ValueError:
                    continue

                inventory_units = self.calculator._decimal(inventory_units)

                if inventory_units <= ZERO:
                    continue

                daily_storage = inventory_units * per_day_charge

                matching_items = item_date_map.get(
                    (
                        item_id,
                        charge_date,
                    ),
                    [],
                )

                if not matching_items:
                    continue

                allocation = daily_storage / Decimal(len(matching_items))

                for item in matching_items:
                    allocation_map[item.id] += allocation

        # --------------------------------------------------------
        # UPFRONT STORAGE
        # --------------------------------------------------------
        #
        # Upfront storage has no daily date.
        #
        # Allocate it across FORWARD orders for the same item
        # in the selected reporting period.
        # --------------------------------------------------------

        forward_items_by_item = defaultdict(list)

        for item in items:
            if not item.item_id:
                continue

            if not item.order:
                continue

            if item.order.order_kind != "FORWARD":
                continue

            forward_items_by_item[str(item.item_id)].append(item)

        for charge in storage_charges:
            if charge.charge_type != "UPFRONT_STORAGE":
                continue

            if not charge.item_id:
                continue

            item_id = str(charge.item_id)

            matching_items = forward_items_by_item.get(
                item_id,
                [],
            )

            if not matching_items:
                continue

            amount = self.calculator._decimal(charge.total_charge)

            if amount == ZERO:
                continue

            allocation = amount / Decimal(len(matching_items))

            for item in matching_items:
                allocation_map[item.id] += allocation

        return allocation_map

    # ============================================================
    # ITEM MAP
    # ============================================================

    def build_items_map(self, items):
        """
        Build:

            database BlinkitOrder.id
                ->
            OrderItems
        """

        items_map = defaultdict(list)

        for item in items:
            if not item.order_id:
                continue

            items_map[item.order_id].append(item)

        return items_map

    # ============================================================
    # ORDER ID MAP
    # ============================================================

    def build_logical_order_map(self, orders):
        """
        Group database Order records by logical order_id.

        Example:

            2161811387
                ├── FORWARD
                └── CANCELLED

        becomes:

            {
                "2161811387": [
                    forward_order,
                    cancelled_order,
                ]
            }
        """

        order_map = defaultdict(list)

        for order in orders:
            order_map[order.order_id].append(order)

        return order_map

    # ============================================================
    # ORDER CLASSIFICATION
    # ============================================================

    @staticmethod
    def classify_order(order):
        """
        Normalize Blinkit order kind.
        """

        order_kind = (order.order_kind or "").strip().upper()

        if order_kind in {
            "FORWARD",
            "RETURN",
            "CANCELLED",
        }:
            return order_kind

        return order_kind or None

    # ============================================================
    # NUMERIC FIELDS
    # ============================================================

    @staticmethod
    def numeric_fields():
        """
        Financial fields that are aggregated into the final
        logical Order ID row.
        """

        return [
            "gross_qty",
            "return_qty",
            "cancelled_qty",
            "net_qty",
            "gross_sales",
            "net_sales",
            "promo_discount",
            "commission",
            "storage",
            "mp_fees",
            "shipping",
            "shipping_gst",
            "commission_gst",
            "mp_gst",
            "igst_amount",
            "cgst_amount",
            "sgst_amount",
            "cess_amount",
            "tcs",
            "tds_194o",
            "tds_194q",
            "tds",
            "taxable_value",
            "gst_to_pay",
            "claims",
            "product_cost",
            "profit",
        ]

    def empty_totals(self):
        return {field: ZERO for field in self.numeric_fields()}

    def aggregate_item_result(
        self,
        totals,
        item_result,
    ):
        """
        Add one calculator result to the logical order totals.
        """

        for field in self.numeric_fields():
            value = item_result.get(
                field,
                ZERO,
            )

            value = self.calculator._decimal(value)

            totals[field] += value

        return totals

    # ============================================================
    # GST PERCENTAGES
    # ============================================================

    @staticmethod
    def collect_gst_percentages(
        gst_percentages,
    ):
        result = {}

        for field in (
            "igst_percent",
            "cgst_percent",
            "sgst_percent",
            "cess_percent",
        ):
            values = sorted(
                {value for value in gst_percentages[field] if value is not None}
            )

            if len(values) == 1:
                result[field] = values[0]

            elif values:
                result[field] = values

            else:
                result[field] = ZERO

        return result

    # ============================================================
    # LOGICAL ORDER AGGREGATION
    # ============================================================

    def aggregate_logical_order(
        self,
        order_id,
        order_records,
        items_map,
        storage_allocation_map,
    ):
        """
        Aggregate FORWARD / RETURN / CANCELLED records into ONE
        logical order_id response.
        """

        totals = self.empty_totals()

        gst_percentages = {
            "igst_percent": set(),
            "cgst_percent": set(),
            "sgst_percent": set(),
            "cess_percent": set(),
        }

        metadata_order = None

        # --------------------------------------------------------
        # Process each database Order record.
        # --------------------------------------------------------

        for order in order_records:
            # Prefer FORWARD as the main metadata record.
            if order.order_kind == "FORWARD" and metadata_order is None:
                metadata_order = order

            elif metadata_order is None:
                metadata_order = order

            order_items = items_map.get(
                order.id,
                [],
            )

            # ----------------------------------------------------
            # Calculate every item.
            # ----------------------------------------------------

            for item in order_items:
                # ------------------------------------------------
                # Storage is only allocated to FORWARD records.
                #
                # CANCELLED / RETURN calculator behavior handles
                # their own financial treatment.
                # ------------------------------------------------

                if order.order_kind == "FORWARD":
                    storage_amount = storage_allocation_map.get(
                        item.id,
                        ZERO,
                    )

                else:
                    storage_amount = ZERO

                calculated = self.calculator.calculate_order_item(
                    item=item,
                    # storage_amount=(storage_amount),
                )

                self.aggregate_item_result(
                    totals=totals,
                    item_result=calculated,
                )

                for field in gst_percentages:
                    value = calculated.get(field)

                    if value is not None:
                        gst_percentages[field].add(value)

        # --------------------------------------------------------
        # If no database record exists, nothing to return.
        # --------------------------------------------------------

        if metadata_order is None:
            return None

        # --------------------------------------------------------
        # Order-level percentages
        # --------------------------------------------------------

        return_percentage = self.calculator.calculate_return_percentage(
            gross_qty=totals["gross_qty"],
            return_qty=totals["return_qty"],
        )

        profit_percentage = self.calculator.calculate_profit_percentage(
            profit=totals["profit"],
            net_sales=totals["net_sales"],
        )

        # --------------------------------------------------------
        # Determine final order status.
        #
        # If any record is cancelled, preserve CANCELLED.
        # Otherwise use the main order status.
        # --------------------------------------------------------

        order_status = metadata_order.order_status

        if any(self.classify_order(order) == "CANCELLED" for order in order_records):
            order_status = "CANCELLED"

        # --------------------------------------------------------
        # Return ONE logical order.
        # --------------------------------------------------------

        return {
            "order_id": order_id,
            "invoice_id": (metadata_order.invoice_id),
            "order_kind": (self.classify_order(metadata_order)),
            "order_type": (metadata_order.order_type),
            "order_status": order_status,
            "order_date": (metadata_order.order_date),
            "customer_name": (metadata_order.customer_name),
            "customer_city": (metadata_order.customer_city),
            "customer_state": (metadata_order.customer_state),
            "supply_state": (metadata_order.supply_state),
            "gst_percentages": (self.collect_gst_percentages(gst_percentages)),
            **totals,
            "return_percentage": (return_percentage),
            "profit_percentage": (profit_percentage),
        }

    # ============================================================
    # BUILD
    # ============================================================

    def build(self):
        """
        Build ONE response row per logical order_id.
        """

        orders = self.get_orders()

        items = self.get_order_items(orders)

        storage_charges = self.get_storage_charges()

        items_map = self.build_items_map(items)

        logical_order_map = self.build_logical_order_map(orders)

        storage_allocation_map = self.build_storage_allocation_map(
            storage_charges=storage_charges,
            items=items,
        )

        results = []

        for (
            order_id,
            order_records,
        ) in logical_order_map.items():
            result = self.aggregate_logical_order(
                order_id=order_id,
                order_records=order_records,
                items_map=items_map,
                storage_allocation_map=(storage_allocation_map),
            )

            if result:
                results.append(result)

        return {
            "results": results,
            "count": len(results),
        }

    # ============================================================
    # RAW ITEM RESULTS
    # ============================================================

    def get_item_rows(self):
        """
        Return calculator output for every OrderItem.

        This is kept for the future SKU/Item ID summary.

        Unlike build(), this does NOT collapse records by order_id.
        """

        orders = self.get_orders()

        items = self.get_order_items(orders)

        storage_charges = self.get_storage_charges()

        storage_allocation_map = self.build_storage_allocation_map(
            storage_charges=storage_charges,
            items=items,
        )

        rows = []

        for item in items:
            if item.order.order_kind == "FORWARD":
                storage_amount = storage_allocation_map.get(
                    item.id,
                    ZERO,
                )
            else:
                storage_amount = ZERO

            calculated = self.calculator.calculate_order_item(
                item=item,
                storage_amount=(storage_amount),
            )

            rows.append(
                {
                    "item_id": item.item_id,
                    "order_id": (item.order.order_id),
                    "invoice_id": (item.order.invoice_id),
                    "order_kind": (self.classify_order(item.order)),
                    "order_date": (item.order.order_date),
                    "product_name": (item.product_name),
                    **calculated,
                }
            )

        return rows
