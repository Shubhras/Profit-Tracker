import os
import secrets
import requests
import json
from django.shortcuts import redirect   
from django.http import JsonResponse, HttpResponseRedirect, HttpResponse
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from .models import AmazonAccount
from django.shortcuts import redirect, render
from dotenv import load_dotenv

# Load .env file
load_dotenv()

AMAZON_APP_CLIENT_ID = os.getenv("AMAZON_APP_CLIENT_ID")
AMAZON_APP_CLIENT_SECRET = os.getenv("AMAZON_APP_CLIENT_SECRET")
AMAZON_APP_ID = os.getenv("AMAZON_APP_ID")
REDIRECT_URI = os.getenv("REDIRECT_URI")
 
 
# =========================================
# 1. CONNECT → Redirect to Amazon
# =========================================

def amazon_connect(request):
    state = secrets.token_hex(16)
 
    # Store state in session
    request.session["amazon_state"] = state
 
    auth_url = (
        "https://sellercentral.amazon.in/apps/authorize/consent"
        f"?application_id={AMAZON_APP_ID}"
        f"&state={state}"
        f"&redirect_uri={REDIRECT_URI}"
        f"&version=beta"
    )
 
    print("Redirecting to:", auth_url)
 
    return redirect(auth_url)
 
 
# =========================================
# 2. CALLBACK → Handle Amazon response
# =========================================

def amazon_callback(request):
    print("FULL URL:", request.get_full_path())
    print("GET DATA:", request.GET)
 
    state = request.GET.get("state")
    code = request.GET.get("spapi_oauth_code")
    seller_id = request.GET.get("selling_partner_id")
 
    print("STATE:", state)
    print("CODE:", code)
    print("SELLER:", seller_id)
 
    # ✅ Validate state
    session_state = request.session.get("amazon_state")
 
    if not session_state or state != session_state:
        return JsonResponse({
            "error": "Invalid state parameter. Possible CSRF attack."
        }, status=400)
 
    # ✅ Validate code
    if not code:
        return JsonResponse({
            "error": "Authorization code missing"
        }, status=400)
 
    # =========================================
    # Exchange code → refresh token
    # =========================================
    lwa_token_url = "https://api.amazon.com/auth/o2/token"
 
    payload = {
        "grant_type": "authorization_code",
        "code": code,
        "client_id": AMAZON_APP_CLIENT_ID,
        "client_secret": AMAZON_APP_CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
    }
 
    try:
        response = requests.post(lwa_token_url, data=payload)
        response.raise_for_status()
 
        data = response.json()
 
        refresh_token = data.get("refresh_token")
        access_token = data.get("access_token")
 
        if not refresh_token:
            return JsonResponse({
                "error": "Failed to get refresh token",
                "amazon_response": data
            }, status=400)
 
        # =========================================
        # SAVE IN DATABASE
        # =========================================
        # Check if user already has an Amazon account
        if hasattr(request.user, 'amazon_account'):
            account = request.user.amazon_account
            # Update existing account with new seller info
            account.seller_central_id = seller_id
            account.app_client_id = AMAZON_APP_CLIENT_ID
            account.app_client_secret = AMAZON_APP_CLIENT_SECRET
            account.region = "FE"
            account.marketplace_id = "A21TJRUUN4KGV"
        else:
            # Create new account for user
            account = AmazonAccount(
                user=request.user,
                seller_central_id=seller_id,
                app_client_id=AMAZON_APP_CLIENT_ID,
                app_client_secret=AMAZON_APP_CLIENT_SECRET,
                region="FE",
                marketplace_id="A21TJRUUN4KGV"
            )

        account.set_refresh_token(refresh_token)
        account.save()
 
        return JsonResponse({
            "status": "success",
            "message": "Amazon connected successfully",
            "seller_id": seller_id,
            "refresh_token": refresh_token,
            "access_token": access_token,
            "expires_in": data.get("expires_in")
        })
 
    except Exception as e:
        return JsonResponse({
            "error": str(e)
        }, status=500)
 

def home(request):
    """
    Home view - shows available endpoints
    """
    content = """
    <h1>Amazon SP-API SaaS Application</h1>
    <p>Available endpoints:</p>
    <ul>
        <li><a href="/admin/">Admin Panel</a></li>
        <li><a href="/amazon/connect/">Connect Amazon Account</a> (requires login)</li>
        <li><a href="/amazon/login/">Amazon Login Callback</a> (called by Amazon)</li>
        <li><a href="/amazon/callback/">Amazon Callback</a> (called by Amazon)</li>
    </ul>
    """
    return JsonResponse({
        "message": "Welcome to Amazon SP-API SaaS",
        "endpoints": {
            "admin": "/admin/",
            "connect": "/amazon/connect/",
            "login": "/amazon/login/",
            "callback": "/amazon/callback/"
        }
})
