from rest_framework.response import Response
from rest_framework.views import APIView

from myntra.services.profit.calculator import MyntraProfitCalculator
from myntra.services.profit.order_summary import OrderSummary
from myntra.services.profit.sku_summary import SKUSummary
from myntra.services.profit.style_summary import StyleSummary


class MyntraStyleSummaryAPIView(APIView):
    def post(self, request):

        calculator = MyntraProfitCalculator(
            user=request.user,
            filters=request.data,
        )

        summary = StyleSummary(calculator)

        return Response(summary.execute())


class MyntraSKUSummaryAPIView(APIView):
    def post(self, request, style_id):

        calculator = MyntraProfitCalculator(
            user=request.user,
            filters=request.data,
        )

        summary = SKUSummary(calculator)

        return Response(summary.execute(style_id))


class MyntraOrderSummaryAPIView(APIView):
    def post(self, request, seller_sku):

        calculator = MyntraProfitCalculator(
            user=request.user,
            filters=request.data,
        )

        summary = OrderSummary(calculator)

        return Response(summary.execute(seller_sku))
