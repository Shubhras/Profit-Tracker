from unittest.mock import patch
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from myntra.models import MyntraConnection, MyntraOrderNew, MyntraOrderItemNew, MyntraReturnItemNew, MyntraPaymentNew


class MyntraSyncTestCase(APITestCase):

    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(username="testuser", password="testpassword")
        self.client.force_authenticate(user=self.user)

        # Create connection
        self.connection = MyntraConnection.objects.create(
            user=self.user,
            merchant_id="merchant123",
            secret_key="secret456",
            warehouse_code="W243",
            access_token="token789"
        )

        self.sync_url = reverse("myntra-sync-details")

    @patch("myntra.services.myntra_client_v4.requests.get")
    @patch("myntra.services.myntra_client_v4.requests.post")
    def test_sync_myntra_details(self, mock_post, mock_get):
        # 1. Mock getOrderList response
        mock_order_list_res = {
            "statusCode": 1005,
            "statusType": "SUCCESS",
            "data": ["d3212063-854d-4403-bed3-2d31a799b605"]
        }

        # 2. Mock getOrderDetails response
        mock_order_details_res = {
            "statusCode": 1005,
            "statusMessage": "Order retrieved successfully",
            "statusType": "SUCCESS",
            "orderLineEntries": [
                {
                    "sku": "JJ01-M",
                    "mrp": 1099.00,
                    "orderLineId": "88212033358",
                    "sellerOrderId": "d3212063-854d-4403-bed3-2d31a799b605",
                    "gift": False,
                    "lineFinalAmount": 1099.00,
                    "chargeEntries": [
                        {
                            "chargeType": "CHARGE",
                            "paidAmount": 1099.00,
                            "activeAmount": 1099.00
                        }
                    ],
                    "packByTime": "07-05-2020 21:55:00",
                    "acceptByTime": "07-05-2020 19:55:00",
                    "customerPromiseTime": "09-05-2020 00:00:00",
                    "shipByTime": "07-05-2020 18:55:00",
                    "unitOtherChargesWithoutTax": 0.00,
                    "status_code": "AP"
                }
            ],
            "uidx": "6d4d9170.adbb.4308.b5ac.c2a92194bc14NmsRlN7SPM",
            "receiverName": "Automation Test User One",
            "address": "Myntra Design Pvt Ltd One 1231",
            "city": "Bangalore",
            "locality": "Bommanahalli (Bangalore)",
            "state": "KA",
            "zipcode": "560068",
            "country": "India",
            "mobile": "9999999999",
            "onHold": False,
            "courierCode": "ML",
            "receiverEmail": "foo@myntra.com",
            "warehouse": "fynd4"
        }

        # 3. Mock returnRecon response (returns list)
        mock_returns_list_res = {
            "statusCode": 1007,
            "statusMessage": "Returns retrieved successfully",
            "statusType": "SUCCESS",
            "data": [
                {
                    "id": "4120887807",
                    "type": "CUSTOMER_RETURN",
                    "createdOn": "2021-10-04 17:42:34",
                    "isReturnConfirmed": True,
                    "status": "DELIVERED"
                }
            ]
        }

        # 4. Mock returnRecon detail response (returns detail)
        mock_return_detail_res = {
            "statusCode": 1007,
            "statusMessage": "Returns retrieved successfully",
            "statusType": "SUCCESS",
            "totalCount": 1,
            "data": [
                {
                    "id": "4120887807",
                    "orderId": "6710392597",
                    "type": "CUSTOMER_RETURN",
                    "isReturnConfirmed": True,
                    "status": "DELIVERED",
                    "createdOn": "2021-10-04 17:42:34",
                    "deliveredTime": "2021-10-06 12:00:00",
                    "confirmedTime": "2021-10-06 12:30:00",
                    "readyForPickupTime": None,
                    "sellerOrderId": "d3212063-854d-4403-bed3-2d31a799b605",
                    "trackingNumber": "ML0815984890",
                    "reason": "Size issue",
                    "reasonId": "102",
                    "orderLineId": "88212033358",
                    "returnWarehouseCode": "W243",
                    "sku": "JJ01-M",
                    "quantity": 1
                }
            ]
        }

        # 5. Mock paymentHistory response
        mock_payment_history_res = {
            "statusCode": 1007,
            "statusMessage": "Payment history fetched successfully",
            "data": {
                "payments": [
                    {
                        "paymentMethod": "prepaid",
                        "utrNumber": "NFT-300600960GN00047XXXXXXX",
                        "paymentDate": "2023-01-06",
                        "yearMonth": 202301,
                        "amount": 1495.26,
                        "utrDetailsLink": "Sample Link 1",
                        "adviceId": None
                    }
                ]
            }
        }

        # Define mock behavior
        class MockResponse:
            def __init__(self, json_data, status_code=200):
                self.json_data = json_data
                self.status_code = status_code
                self.text = str(json_data)

            def json(self):
                return self.json_data

        # Configure mock get requests
        def side_effect_get(url, *args, **kwargs):
            if "getOrderList" in url:
                return MockResponse(mock_order_list_res)
            elif "payment-history" in url or "payments/history" in url:
                return MockResponse(mock_payment_history_res)
            elif "order/" in url:
                # Get Order by ID
                return MockResponse(mock_order_details_res)
            return MockResponse({"error": "not found"}, status_code=404)

        mock_get.side_effect = side_effect_get

        # Configure mock post requests
        def side_effect_post(url, *args, **kwargs):
            if "returns/returnRecon" in url:
                # If json has ID, return detail, else return list
                json_data = kwargs.get("json") or {}
                if "id" in json_data:
                    return MockResponse(mock_return_detail_res)
                else:
                    return MockResponse(mock_returns_list_res)
            return MockResponse({"error": "not found"}, status_code=404)

        mock_post.side_effect = side_effect_post

        # Perform the request
        payload = {
            "fromDate": "2021-05-14",
            "toDate": "2021-05-17"
        }
        response = self.client.post(self.sync_url, data=payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "SUCCESS")
        self.assertEqual(response.data["details"]["orders_synced"], 1)
        self.assertEqual(response.data["details"]["returns_synced"], 1)
        # Note: Prepaid and Postpaid payment fetches both return mock_payment_history_res
        self.assertEqual(response.data["details"]["payments_synced"], 2)

        # Assert database state
        order = MyntraOrderNew.objects.get(seller_order_id="d3212063-854d-4403-bed3-2d31a799b605")
        self.assertEqual(order.receiver_name, "Automation Test User One")
        self.assertEqual(order.user, self.user)

        item = MyntraOrderItemNew.objects.get(order=order)
        self.assertEqual(item.sku, "JJ01-M")
        self.assertEqual(float(item.mrp), 1099.00)

        ret = MyntraReturnItemNew.objects.get(return_id="4120887807")
        self.assertEqual(ret.reason, "Size issue")
        self.assertEqual(ret.sku, "JJ01-M")

        pay = MyntraPaymentNew.objects.filter(utr_number="NFT-300600960GN00047XXXXXXX").first()
        self.assertIsNotNone(pay)
        self.assertEqual(float(pay.amount), 1495.26)
