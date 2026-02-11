from django.urls import path
from subscription.views import CreateSubscriptionAPIView
from subscription.views import MySubscriptionAPIView,CancelSubscriptionAPIView,SubscriptionPlansAPIView
#from .views import RazorpayWebhookAPIView,
from subscription.views import VerifyPaymentAPIView


urlpatterns = [
    path("subscription-plans/", SubscriptionPlansAPIView.as_view()),
    path("create-subscription/", CreateSubscriptionAPIView.as_view()),
    #path("razorpay-webhook/", RazorpayWebhookAPIView.as_view()),
    path("my-subscription/", MySubscriptionAPIView.as_view()),
    path("cancel-subscription/", CancelSubscriptionAPIView.as_view()),
    path("verify-payment/", VerifyPaymentAPIView.as_view()),
]