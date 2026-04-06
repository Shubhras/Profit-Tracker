# swagger_client.ShipmentApi

All URIs are relative to *https://sellingpartnerapi-na.amazon.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**update_shipment_status**](ShipmentApi.md#update_shipment_status) | **POST** /orders/v0/orders/{orderId}/shipment | 


# **update_shipment_status**
> update_shipment_status(order_id, payload)



Update the shipment status for an order that you specify.  **Usage Plan:**  | Rate (requests per second) | Burst | | ---- | ---- | | 5 | 15 |  The `x-amzn-RateLimit-Limit` response header contains the usage plan rate limits for the operation, when available. The preceding table contains the default rate and burst values for this operation. Selling partners whose business demands require higher throughput might have higher rate and burst values than those shown here. For more information, refer to [Usage Plans and Rate Limits](https://developer-docs.amazon.com/sp-api/docs/usage-plans-and-rate-limits-in-the-sp-api).

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ShipmentApi()
order_id = 'order_id_example' # str | An Amazon-defined order identifier, in 3-7-7 format.
payload = swagger_client.UpdateShipmentStatusRequest() # UpdateShipmentStatusRequest | The request body for the `updateShipmentStatus` operation.

try:
    api_instance.update_shipment_status(order_id, payload)
except ApiException as e:
    print("Exception when calling ShipmentApi->update_shipment_status: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **order_id** | **str**| An Amazon-defined order identifier, in 3-7-7 format. | 
 **payload** | [**UpdateShipmentStatusRequest**](UpdateShipmentStatusRequest.md)| The request body for the &#x60;updateShipmentStatus&#x60; operation. | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

