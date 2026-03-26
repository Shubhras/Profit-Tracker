import requests
from django.conf import settings
from sp_api.api import Orders, Finances
from sp_api.base import Marketplaces
from django.conf import settings
from .models import *

TOKEN_URL = "https://api.amazon.com/auth/o2/token"


def generate_refresh_token(auth_code):
    payload = {
        "grant_type": "authorization_code",
        "code": auth_code,
        "client_id": settings.LWA_APP_ID,
        "client_secret": settings.LWA_CLIENT_SECRET,    
        "redirect_uri": settings.LWA_REDIRECT_URI
    }
    response = requests.post(TOKEN_URL, data=payload)
    return response.json()

def get_access_token():

    payload = {
        "grant_type": "refresh_token",
        "refresh_token": settings.SP_API_REFRESH_TOKEN,
        "client_id": settings.LWA_APP_ID,
        "client_secret": settings.LWA_CLIENT_SECRET
    }

    response = requests.post(TOKEN_URL, data=payload)
    data = response.json()

    return data["access_token"]


def get_amazon_orders():
    access_token = get_access_token()
    headers = {
        "x-amz-access-token": access_token
    }
    response = requests.get(
        "https://sandbox.sellingpartnerapi-fe.amazon.com/orders/v0/orders",
        params={
            "MarketplaceIds": "ATVPDKIKX0DER",
            "CreatedAfter": "TEST_CASE_200"
        },
        headers=headers
    )
    return response.json()

def save_orders(order_data):
    user = User.objects.first()  # replace later with logged-in user
    orders = order_data["payload"]["Orders"]
    for order in orders:
        AmazonOrder.objects.update_or_create(
            order_id=order["AmazonOrderId"],
            defaults={
                "user": user,
                "purchase_date": order["PurchaseDate"],
                "status": order["OrderStatus"],
                "amount": float(order["OrderTotal"]["Amount"]),
                "currency": order["OrderTotal"]["CurrencyCode"]
            }
        )

def calculate_profit(order):
    selling_price = order.amount
    amazon_fee = order.amazon_fee
    product_cost = order.product_cost
    profit = selling_price - amazon_fee - product_cost
    order.profit = profit
    order.save()

def get_financial_events():
    finances = Finances(
        refresh_token=settings.SP_API_REFRESH_TOKEN,
        marketplace=Marketplaces.US,
        credentials={
            "lwa_app_id": settings.LWA_APP_ID,
            "lwa_client_secret": settings.LWA_CLIENT_SECRET,
            "aws_access_key": settings.AWS_ACCESS_KEY_ID,
            "aws_secret_key": settings.AWS_SECRET_ACCESS_KEY,
            "role_arn": settings.AWS_ROLE_ARN
        }
    )
    response = finances.list_financial_events(
        PostedAfter="2024-01-01T00:00:00Z"
    )
    return response.payload

