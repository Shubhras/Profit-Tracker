import csv
from decimal import Decimal

from django.http import HttpResponse

from myntra.services.profit.order_summary import OrderSummary
from myntra.services.profit.sku_summary import SKUSummary
from myntra.services.profit.style_summary import StyleSummary


class MyntraProfitHierarchyCSVExporter:
    """
    Internal validation CSV.

    Hierarchy:

        STYLE
            SKU
                ORDER
                ORDER
            SKU
                ORDER

    IMPORTANT:

    This exporter performs NO financial calculations.

    All values come from:

        StyleSummary
        SKUSummary
        OrderSummary

    Therefore this CSV validates the same calculation
    path used by the Profit APIs.
    """

    def __init__(self, calculator):
        self.calculator = calculator

    # =====================================================
    # EXPORT
    # =====================================================

    def export(
        self,
        filename="myntra_profit_hierarchy.csv",
    ):
        response = HttpResponse(content_type="text/csv; charset=utf-8")

        response["Content-Disposition"] = f'attachment; filename="{filename}"'

        # Excel UTF-8 BOM
        response.write("\ufeff")

        rows = self._build_rows()

        if not rows:
            return response

        fieldnames = self._build_headers(rows)

        writer = csv.DictWriter(
            response,
            fieldnames=fieldnames,
            extrasaction="ignore",
        )

        writer.writeheader()

        for row in rows:
            writer.writerow(
                {key: self._serialize_value(row.get(key)) for key in fieldnames}
            )

        return response

    # =====================================================
    # BUILD HIERARCHY
    # =====================================================

    def _build_rows(self):

        rows = []

        # ==========================================
        # STYLE LEVEL
        # ==========================================

        styles = StyleSummary(self.calculator).execute()

        for style in styles:
            style_id = style.get("style_id")

            # --------------------------------------
            # STYLE ROW
            # --------------------------------------

            rows.append(
                self._prepare_row(
                    level="STYLE",
                    row=style,
                )
            )

            # ======================================
            # SKU LEVEL
            # ======================================

            skus = SKUSummary(self.calculator).execute(style_id=style_id)

            for sku in skus:
                seller_sku = sku.get("seller_sku")

                # ----------------------------------
                # SKU ROW
                # ----------------------------------

                rows.append(
                    self._prepare_row(
                        level="SKU",
                        row=sku,
                    )
                )

                # ==================================
                # ORDER LEVEL
                # ==================================

                orders = OrderSummary(self.calculator).execute(seller_sku=seller_sku)

                for order in orders:
                    # Extra safety:
                    # OrderSummary is SKU filtered,
                    # but make sure it also belongs
                    # to the current Style.
                    if str(order.get("style_id")) != str(style_id):
                        continue

                    rows.append(
                        self._prepare_row(
                            level="ORDER",
                            row=order,
                        )
                    )

        return rows

    # =====================================================
    # ROW PREPARATION
    # =====================================================

    def _prepare_row(
        self,
        level,
        row,
    ):
        """
        Add hierarchy metadata without changing
        any calculated values.
        """

        result = {
            "level": level,
        }

        result.update(row)

        return result

    # =====================================================
    # HEADERS
    # =====================================================

    def _build_headers(self, rows):
        """
        Build union of fields from Style, SKU and Order.

        This is necessary because Order rows contain
        fields that Style/SKU rows may not contain.
        """

        headers = [
            "level",
        ]

        seen = {
            "level",
        }

        for row in rows:
            for key in row.keys():
                if key in seen:
                    continue

                seen.add(key)
                headers.append(key)

        return headers

    # =====================================================
    # SERIALIZATION
    # =====================================================

    @staticmethod
    def _serialize_value(value):

        if value is None:
            return ""

        if isinstance(value, bool):
            return "Yes" if value else "No"

        if isinstance(value, Decimal):
            return float(value)

        return value
