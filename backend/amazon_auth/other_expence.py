import json
from decimal import Decimal
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers, status

from .models import OtherExpense

User = get_user_model()


# ==========================================
# SERIALIZER
# ==========================================
class OtherExpenseSerializer(serializers.ModelSerializer):
    applied_to_count = serializers.SerializerMethodField()
    effective_rate = serializers.SerializerMethodField()

    class Meta:
        model = OtherExpense
        fields = [
            'id',
            'user',
            'expense_name',
            'marketplace',
            'cost_value',
            'start_date',
            'end_date',
            'cost_type',
            'split_lump_sum_by',
            'repeat_monthly',
            'status',
            'applied_to_count',
            'effective_rate',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'applied_to_count', 'effective_rate']

    def get_applied_to_count(self, obj):
        # Fallback metric display
        if obj.cost_type == 'per_order':
            return "0 orders"
        return "0 SKUs"

    def get_effective_rate(self, obj):
        if obj.cost_type == 'per_order':
            return f"₹{obj.cost_value} / order"
        if obj.split_lump_sum_by == 'net_sales':
            return "By net sales"
        if obj.split_lump_sum_by == 'units_sold':
            return "By units sold"
        return f"₹{obj.cost_value} / SKU"


# ==========================================
# API VIEWS
# ==========================================
class OtherExpenseListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        marketplace = request.query_params.get('marketplace')
        status_filter = request.query_params.get('status')
        month = request.query_params.get('month') # e.g. '2026-07'

        qs = OtherExpense.objects.filter(user=user)

        if marketplace and marketplace.lower() != 'all':
            qs = qs.filter(marketplace__iexact=marketplace)

        if status_filter:
            qs = qs.filter(status=status_filter)

        if month:
            try:
                year, m = map(int, month.split('-'))
                qs = qs.filter(start_date__year=year, start_date__month=m)
            except Exception:
                pass

        serializer = OtherExpenseSerializer(qs, many=True)
        return Response({
            'success': True,
            'count': qs.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user
        serializer = OtherExpenseSerializer(data=request.data)
        if serializer.is_valid():
            expense = serializer.save(user=user)
            return Response({
                'success': True,
                'message': 'Business expense created successfully',
                'data': OtherExpenseSerializer(expense).data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class OtherExpenseDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return OtherExpense.objects.get(pk=pk, user=user)
        except OtherExpense.DoesNotExist:
            return None

    def get(self, request, pk):
        expense = self.get_object(pk, request.user)
        if not expense:
            return Response({'success': False, 'message': 'Expense not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = OtherExpenseSerializer(expense)
        return Response({'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)

    def put(self, request, pk):
        expense = self.get_object(pk, request.user)
        if not expense:
            return Response({'success': False, 'message': 'Expense not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = OtherExpenseSerializer(expense, data=request.data, partial=True)
        if serializer.is_valid():
            updated_expense = serializer.save()
            return Response({'success': True, 'message': 'Expense updated successfully', 'data': OtherExpenseSerializer(updated_expense).data}, status=status.HTTP_200_OK)
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        expense = self.get_object(pk, request.user)
        if not expense:
            return Response({'success': False, 'message': 'Expense not found'}, status=status.HTTP_404_NOT_FOUND)
        expense.delete()
        return Response({'success': True, 'message': 'Expense deleted successfully'}, status=status.HTTP_200_OK)


class OtherExpensePreviewAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            cost_value = Decimal(str(request.data.get('cost_value', '0')))
        except Exception:
            cost_value = Decimal('0.00')

        cost_type = request.data.get('cost_type', 'per_sku')
        split_lump_sum_by = request.data.get('split_lump_sum_by', 'equally')

        # Sample preview data
        sku1_units = 120
        sku2_units = 180
        total_units = sku1_units + sku2_units

        if cost_type == 'per_order':
            # Fixed rate per order (cost_value charged per order/unit)
            sku1_expense = cost_value * Decimal(sku1_units)
            sku1_per_unit = cost_value
            sku2_expense = cost_value * Decimal(sku2_units)
            sku2_per_unit = cost_value

            preview_items = [
                {
                    'sku': 'SAMPLE-SKU-001',
                    'units_sold': sku1_units,
                    'share': 'Fixed / Order',
                    'expense': float(sku1_expense),
                    'per_unit': float(sku1_per_unit)
                },
                {
                    'sku': 'SAMPLE-SKU-002',
                    'units_sold': sku2_units,
                    'share': 'Fixed / Order',
                    'expense': float(sku2_expense),
                    'per_unit': float(sku2_per_unit)
                }
            ]
        else:
            # Per SKU lump-sum split
            if split_lump_sum_by == 'equally':
                sku1_share_pct = 50.0
                sku2_share_pct = 50.0
                sku1_expense = cost_value * Decimal('0.50')
                sku2_expense = cost_value * Decimal('0.50')
            elif split_lump_sum_by == 'net_sales':
                sku1_share_pct = 45.0
                sku2_share_pct = 55.0
                sku1_expense = cost_value * Decimal('0.45')
                sku2_expense = cost_value * Decimal('0.55')
            else:  # units_sold
                sku1_share_pct = round((sku1_units / total_units) * 100, 1)
                sku2_share_pct = round((sku2_units / total_units) * 100, 1)
                sku1_expense = cost_value * (Decimal(sku1_units) / Decimal(total_units))
                sku2_expense = cost_value * (Decimal(sku2_units) / Decimal(total_units))

            sku1_per_unit = (sku1_expense / Decimal(sku1_units)) if sku1_units > 0 else Decimal(0)
            sku2_per_unit = (sku2_expense / Decimal(sku2_units)) if sku2_units > 0 else Decimal(0)

            preview_items = [
                {
                    'sku': 'SAMPLE-SKU-001',
                    'units_sold': sku1_units,
                    'share': f"{sku1_share_pct}%",
                    'expense': float(sku1_expense),
                    'per_unit': float(sku1_per_unit)
                },
                {
                    'sku': 'SAMPLE-SKU-002',
                    'units_sold': sku2_units,
                    'share': f"{sku2_share_pct}%",
                    'expense': float(sku2_expense),
                    'per_unit': float(sku2_per_unit)
                }
            ]

        return Response({
            'success': True,
            'cost_value': float(cost_value),
            'cost_type': cost_type,
            'split_lump_sum_by': split_lump_sum_by,
            'preview': preview_items
        }, status=status.HTTP_200_OK)

