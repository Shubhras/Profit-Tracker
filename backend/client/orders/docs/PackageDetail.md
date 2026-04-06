# PackageDetail

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**package_reference_id** | [**PackageReferenceId**](PackageReferenceId.md) |  | 
**carrier_code** | **str** | Identifies the carrier that will deliver the package. This field is required for all marketplaces. For more information, refer to the [&#x60;CarrierCode&#x60; announcement](https://developer-docs.amazon.com/sp-api/changelog/carriercode-value-required-in-shipment-confirmations-for-br-mx-ca-sg-au-in-jp-marketplaces). | 
**carrier_name** | **str** | Carrier name that will deliver the package. Required when &#x60;carrierCode&#x60; is \&quot;Other\&quot;  | [optional] 
**shipping_method** | **str** | Ship method to be used for shipping the order. | [optional] 
**tracking_number** | **str** | The tracking number used to obtain tracking and delivery information. | 
**ship_date** | **datetime** | The shipping date for the package. Must be in &lt;a href&#x3D;&#39;https://developer-docs.amazon.com/sp-api/docs/iso-8601&#39;&gt;ISO 8601&lt;/a&gt; date/time format. | 
**ship_from_supply_source_id** | **str** | The unique identifier for the supply source. | [optional] 
**order_items** | [**ConfirmShipmentOrderItemsList**](ConfirmShipmentOrderItemsList.md) | The list of order items and quantities to be updated. | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


