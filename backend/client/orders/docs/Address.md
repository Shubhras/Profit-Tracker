# Address

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **str** | The name. | [optional] 
**company_name** | **str** | The company name of the recipient.  **Note**: This attribute is only available for shipping address. | [optional] 
**address_line1** | **str** | The street address. | [optional] 
**address_line2** | **str** | Additional street address information, if required. | [optional] 
**address_line3** | **str** | Additional street address information, if required. | [optional] 
**city** | **str** | The city. | [optional] 
**county** | **str** | The county. | [optional] 
**district** | **str** | The district. | [optional] 
**state_or_region** | **str** | The state or region. | [optional] 
**municipality** | **str** | The municipality. | [optional] 
**postal_code** | **str** | The postal code. | [optional] 
**country_code** | **str** | The country code. A two-character country code, in ISO 3166-1 alpha-2 format. | [optional] 
**phone** | **str** | The phone number of the buyer.  **Note**:  1. This attribute is only available for shipping address. 2. In some cases, the buyer phone number is suppressed:  a. Phone is suppressed for all &#x60;AFN&#x60; (fulfilled by Amazon) orders. b. Phone is suppressed for the shipped &#x60;MFN&#x60; (fulfilled by seller) order when the current date is past the Latest Delivery Date. | [optional] 
**extended_fields** | [**AddressExtendedFields**](AddressExtendedFields.md) | The container for address extended fields. For example, street name or street number.   **Note**: This attribute is currently only available with Brazil shipping addresses. | [optional] 
**address_type** | **str** | The address type of the shipping address. | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


