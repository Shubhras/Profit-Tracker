from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import AmazonConnection, AmazonOrder
from .services import *


# 🔹 OAuth Callback
@api_view(['GET'])
def amazon_callback(request):

    auth_code = request.GET.get("spapi_oauth_code")
    seller_id = request.GET.get("selling_partner_id")   

    if not auth_code:
        return Response({"error": "Authorization code missing"}, status=400)

    token_data = generate_refresh_token(auth_code)
    refresh_token = token_data.get("refresh_token")

    user = User.objects.first()  # later use request.user

    AmazonConnection.objects.update_or_create(
        user=user,
        defaults={
            "seller_id": seller_id,
            "refresh_token": refresh_token
        }
    )
    return Response({
        "message": "Amazon connected successfully",
        "seller_id": seller_id
    })


@api_view(["GET"])
def test_amazon_connection(request):
    access_token = get_access_token()
    if not access_token:
        return Response({"error": "Token not generated"}, status=400)
    return Response({
        "access_token": access_token
    })


@api_view(["GET"])
def fetch_orders(request):
    data = get_amazon_orders()
    orders = data.get("payload", {}).get("Orders", [])
    for order in orders:
        amount = float(order["OrderTotal"]["Amount"])
        profit = amount * 0.7   # 30% fee assumption
        AmazonOrder.objects.update_or_create(
            order_id=order["AmazonOrderId"],
            defaults={
                "user": User.objects.first(),
                "purchase_date": order["PurchaseDate"],
                "status": order["OrderStatus"],
                "amount": amount,
                "currency": order["OrderTotal"]["CurrencyCode"],
                "profit": profit  
            }
        )

    return Response({"message": "Orders saved successfully"})


@api_view(["GET"])
def get_saved_orders(request):
    user = User.objects.first()
    orders = AmazonOrder.objects.filter(user=user).values()
    return Response(list(orders))


@api_view(["GET"])
def dashboard(request):
    orders = AmazonOrder.objects.all()
    total_orders = orders.count()
    total_revenue = sum(o.amount for o in orders)
    total_profit = sum(o.profit for o in orders)

    return Response({
        "orders": total_orders,
        "revenue": total_revenue,
        "profit": total_profit
    })


@api_view(["GET"])
def fetch_finances(request):
    try:
        data = get_financial_events()
        return Response(data)
    except Exception as e:
        return Response({
            "error": str(e)
        }, status=500)