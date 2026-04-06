# OrderItemBuyerInfo

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**order_item_id** | **str** | An Amazon-defined order item identifier. | 
**buyer_customized_info** | [**BuyerCustomizedInfoDetail**](BuyerCustomizedInfoDetail.md) | Buyer information for custom orders from the Amazon Custom program.  **Note**: This attribute is only available for MFN (fulfilled by seller) orders. | [optional] 
**gift_wrap_price** | [**Money**](Money.md) | The gift wrap price of the item. | [optional] 
**gift_wrap_tax** | [**Money**](Money.md) | The tax on the gift wrap price. | [optional] 
**gift_message_text** | **str** | A gift message provided by the buyer.  **Note**: This attribute is only available for MFN (fulfilled by seller) orders. | [optional] 
**gift_wrap_level** | **str** | The gift wrap level specified by the buyer. | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


