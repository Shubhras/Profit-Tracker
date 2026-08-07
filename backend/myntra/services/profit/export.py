import csv
from decimal import Decimal

from django.http import HttpResponse


class MyntraProfitCSVExporter:
    """
    Generic CSV exporter for Myntra Profit summaries.

    IMPORTANT:
    This class does NOT perform any Profit calculations.

    Calculation flow:

        MyntraProfitCalculator
                ↓
        StyleSummary / SKUSummary / OrderSummary
                ↓
        MyntraProfitCSVExporter

    Therefore CSV values should always match the API response.
    """

    @staticmethod
    def export(
        data,
        filename="myntra_profit_validation.csv",
    ):
        response = HttpResponse(content_type="text/csv; charset=utf-8")

        response["Content-Disposition"] = f'attachment; filename="{filename}"'

        # Helps Excel correctly detect UTF-8.
        response.write("\ufeff")

        if not data:
            return response

        # -------------------------------------------------
        # Collect headers
        # -------------------------------------------------
        # Don't depend only on data[0].
        #
        # This makes the exporter safe if later rows contain
        # additional optional fields.
        # -------------------------------------------------

        fieldnames = []

        seen = set()

        for row in data:
            for key in row.keys():
                if key not in seen:
                    seen.add(key)
                    fieldnames.append(key)

        writer = csv.DictWriter(
            response,
            fieldnames=fieldnames,
            extrasaction="ignore",
        )

        writer.writeheader()

        # -------------------------------------------------
        # Rows
        # -------------------------------------------------

        for row in data:
            writer.writerow(
                {
                    key: MyntraProfitCSVExporter._serialize_value(row.get(key))
                    for key in fieldnames
                }
            )

        return response

    @staticmethod
    def _serialize_value(value):
        """
        Convert API/Python values into CSV-friendly values.

        Keep the underlying financial value unchanged.
        """

        if value is None:
            return ""

        if isinstance(value, bool):
            return "Yes" if value else "No"

        if isinstance(value, Decimal):
            return float(value)

        return value
