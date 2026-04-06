# OrderBuyerInfo

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**amazon_order_id** | **str** | An Amazon-defined order identifier, in 3-7-7 format. | 
**buyer_name** | **str** | The buyer name or the recipient name. | [optional] 
**buyer_county** | **str** | The county of the buyer.  **Note**: This attribute is only available in the Brazil marketplace. | [optional] 
**buyer_tax_info** | [**BuyerTaxInfo**](BuyerTaxInfo.md) | Tax information about the buyer. Sellers can use this data to issue electronic invoices for business orders.  **Note**: This attribute is only available for business orders in the Brazil, Mexico and India marketplaces. | [optional] 
**purchase_order_number** | **str** | The purchase order (PO) number entered by the buyer at checkout. Only returned for orders where the buyer entered a PO number at checkout. | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


