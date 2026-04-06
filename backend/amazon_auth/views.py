import os
import secrets
import requests
import json
from django.shortcuts import redirect   
from django.http import JsonResponse, HttpResponseRedirect, HttpResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from .models import AmazonAccount
from django.shortcuts import redirect, render
# Credentials from .env
AMAZON_APP_CLIENT_ID = os.getenv("AMAZON_APP_CLIENT_ID")
AMAZON_APP_CLIENT_SECRET = os.getenv("AMAZON_APP_CLIENT_SECRET")
AMAZON_APP_ID = os.getenv("AMAZON_APP_ID")
# REDIRECT_URI = os.getenv("AMAZON_REDIRECT_URI")
REDIRECT_URI = "https://trackmyprofit.com/api/amazon/callback"

# @login_required
def amazon_connect(request):
    state = secrets.token_hex(16)
    request.session['amazon_state'] = state

    auth_url = (
        "https://sellercentral.amazon.com/apps/authorize/consent"
        f"?application_id={AMAZON_APP_ID}"
        f"&state={state}"
        f"&redirect_uri={REDIRECT_URI}"
        f"&version=beta"

    )
    # print("Redirecting to Amazon Auth URL:", auth_url)

    return redirect(auth_url)


def amazon_auth_login(request):
    callback_uri = request.GET.get("amazon_callback_uri")
    state = request.GET.get("amazon_state")
    seller_id = request.GET.get("selling_partner_id")

    if not all([callback_uri, state, seller_id]):
        return HttpResponse("Auth login endpoint working")

    # Save seller ID
    request.session['selling_partner_id'] = seller_id

    # Generate FINAL state
    final_state = secrets.token_hex(16)
    request.session['final_state'] = final_state

    # Redirect back to Amazon
    redirect_url = f"{callback_uri}?amazon_state={state}&state={final_state}"

    return redirect(redirect_url)

# @login_required
def amazon_callback(request):
    """
    Step 3: Amazon redirects to your final Redirect URI
    """
    print("FULL URL:", request.get_full_path())
    print("GET DATA:", request.GET)


    state = request.GET.get("state")
    code = request.GET.get("spapi_oauth_code")
    merchant_id = request.GET.get("selling_partner_id")

    print("CODE:", code)
    print("STATE:", state) 

    # VALIDATE the final state
    # final_state = request.session.get("amazon_state")
    final_state = request.session.get("final_state")
    print("SESSION STATE:", request.session.get("final_state"))
    print("RECEIVED STATE:", state)
    if not final_state or state != final_state:
        return JsonResponse({"error": "Invalid state parameter. Possible CSRF attack."}, status=400)

    if not code:
        return JsonResponse({"error": "Authorization code (spapi_oauth_code) is missing."}, status=400)

    # EXCHANGE Authorization Code ➔ Refresh Token 🔑
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
        
        refresh_token = data.get('refresh_token')
        seller_id = request.session.get('selling_partner_id', merchant_id)

        # ✅ STORE IN DB (Linked to your Django User)
        account, created = AmazonAccount.objects.update_or_create(
            user=request.user,
            defaults={
                "seller_central_id": seller_id,
                "app_client_id": AMAZON_APP_CLIENT_ID,
                "app_client_secret": AMAZON_APP_CLIENT_SECRET,
                "region": "EU",
                "marketplace_id": "A21TJRUUN4KGV"
            }
        )
        # Store the encrypted refresh token using the model's method
        account.set_refresh_token(refresh_token)
        account.save()
        
        return JsonResponse({
            "status": "success",
            "message": "Amazon connected successfully",
            "seller_id": seller_id,
            "refresh_token": data.get('refresh_token'),
            "access_token": data.get('access_token'),
            "expires_in": data.get('expires_in')
        })
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

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
