# UpdateVerificationStatusRequestBody

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | [**VerificationStatus**](VerificationStatus.md) | The new verification status of the order. | [optional] 
**external_reviewer_id** | **str** | The identifier of the order&#39;s regulated information reviewer. | 
**rejection_reason_id** | **str** | The unique identifier of the rejection reason used for rejecting the order&#39;s regulated information. Only required if the new status is rejected. | [optional] 
**verification_details** | [**VerificationDetails**](VerificationDetails.md) | Additional information regarding the verification of the order. | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


