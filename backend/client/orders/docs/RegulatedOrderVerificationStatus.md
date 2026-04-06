# RegulatedOrderVerificationStatus

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | [**VerificationStatus**](VerificationStatus.md) | The verification status of the order. | 
**requires_merchant_action** | **bool** | When true, the regulated information provided in the order requires a review by the merchant. | 
**valid_rejection_reasons** | [**list[RejectionReason]**](RejectionReason.md) | A list of valid rejection reasons that may be used to reject the order&#39;s regulated information. | 
**rejection_reason** | [**RejectionReason**](RejectionReason.md) | The reason for rejecting the order&#39;s regulated information. Not present if the order isn&#39;t rejected. | [optional] 
**review_date** | **str** | The date the order was reviewed. In [ISO 8601](https://developer-docs.amazon.com/sp-api/docs/iso-8601) date time format. | [optional] 
**external_reviewer_id** | **str** | The identifier for the order&#39;s regulated information reviewer. | [optional] 
**valid_verification_details** | [**list[ValidVerificationDetail]**](ValidVerificationDetail.md) | A list of valid verification details that may be provided and the criteria required for when the verification detail can be provided. | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


