from rest_framework import serializers


class PaymentHistoryRequestSerializer(serializers.Serializer):
    payment_method = serializers.ChoiceField(
        choices=["PREPAID", "POSTPAID"]
    )
    from_date = serializers.DateField()
    to_date = serializers.DateField()
    page = serializers.IntegerField(required=False, default=0)
    page_size = serializers.IntegerField(required=False, default=20)