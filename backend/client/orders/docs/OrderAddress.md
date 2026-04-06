# OrderAddress

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**amazon_order_id** | **str** | An Amazon-defined order identifier, in 3-7-7 format. | 
**buyer_company_name** | **str** | The company name of the contact buyer. For IBA orders, the buyer company must be Amazon entities. | [optional] 
**shipping_address** | [**Address**](Address.md) | The shipping address for the order.  **Note**: &#x60;ShippingAddress&#x60; is only available for orders with the following status values: &#x60;Unshipped&#x60;, &#x60;PartiallyShipped&#x60;, &#x60;Shipped&#x60;, and &#x60;InvoiceUnconfirmed&#x60;. | [optional] 
**delivery_preferences** | [**DeliveryPreferences**](DeliveryPreferences.md) |  | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


