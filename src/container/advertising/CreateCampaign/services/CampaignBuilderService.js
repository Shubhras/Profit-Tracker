import {
  createSPCampaign,
  createAdGroup,
  createProductAd,
  createKeyword,
  createTarget,
  createCampaignNegativeKeyword,
  createCampaignNegativeTarget,
} from '../../../../redux/advertising/actionCreator';

class CampaignBuilderService {
  static async createCampaign(wizardData, dispatch) {
    try {
      // ===========================================================================
      // STEP 1 - CREATE CAMPAIGN
      // ===========================================================================

      const placementBidding = [];

      if (wizardData.campaign.placements.topOfSearch > 0) {
        placementBidding.push({
          placement: 'PLACEMENT_TOP',
          percentage: Number(wizardData.campaign.placements.topOfSearch),
        });
      }

      if (wizardData.campaign.placements.productPages > 0) {
        placementBidding.push({
          placement: 'PLACEMENT_PRODUCT_PAGE',
          percentage: Number(wizardData.campaign.placements.productPages),
        });
      }

      if (wizardData.campaign.placements.restOfSearch > 0) {
        placementBidding.push({
          placement: 'PLACEMENT_REST_OF_SEARCH',
          percentage: Number(wizardData.campaign.placements.restOfSearch),
        });
      }

      const campaignPayload = {
        campaigns: [
          {
            name: wizardData.campaign.name,

            ...(wizardData.campaign.portfolioId && {
              portfolioId: wizardData.campaign.portfolioId,
            }),

            campaignType: 'SPONSORED_PRODUCTS',

            targetingType: wizardData.campaign.targetingType,

            state: wizardData.campaign.state,

            startDate: wizardData.campaign.startDate,

            endDate: wizardData.campaign.endDate,

            budget: {
              budget: Number(wizardData.campaign.budget),

              budgetType: wizardData.campaign.budgetType,
            },

            dynamicBidding: {
              strategy: wizardData.campaign.biddingStrategy,
              placementBidding,
            },
          },
        ],
      };

      const campaignResponse = await dispatch(createSPCampaign(campaignPayload));

      if (!campaignResponse?.status) {
        return campaignResponse;
      }

      const campaignId = campaignResponse.data?.[0]?.campaign_id;

      // ===========================================================================
      // STEP 2 - CREATE AD GROUP
      // ===========================================================================

      const adGroupPayload = {
        ad_groups: [
          {
            campaignId,

            name: wizardData.adGroup.name,

            defaultBid: Number(wizardData.adGroup.defaultBid),

            state: wizardData.adGroup.state,
          },
        ],
      };

      const adGroupResponse = await dispatch(createAdGroup(adGroupPayload));

      if (!adGroupResponse?.status) {
        return adGroupResponse;
      }

      const adGroupId = adGroupResponse.data?.[0]?.ad_group_id;

      // ===========================================================================
      // STEP 3 - CREATE PRODUCT ADS
      // ===========================================================================

      const productAdsPayload = {
        product_ads: wizardData.products.map((product) => ({
          campaignId,
          adGroupId,

          asin: product.asin,
          sku: product.sku,

          state: 'ENABLED',
        })),
      };

      const productAdsResponse = await dispatch(createProductAd(productAdsPayload));

      if (!productAdsResponse?.status) {
        return productAdsResponse;
      }

      // ===========================================================================
      // STEP 4 - TARGETING
      // ===========================================================================

      if (wizardData.campaign.targetingType === 'MANUAL') {
        if (wizardData.targeting?.method === 'KEYWORD') {
          const keywordsPayload = {
            keywords: wizardData.targeting.keywords.map((keyword) => ({
              campaignId,
              adGroupId,

              keywordText: keyword.keywordText,
              matchType: keyword.matchType,

              bid: Number(keyword.bid),

              state: keyword.state,
            })),
          };

          const keywordsResponse = await dispatch(createKeyword(keywordsPayload));

          if (!keywordsResponse?.status) {
            return keywordsResponse;
          }
        }

        if (wizardData.targeting?.method === 'PRODUCT') {
          const targetsPayload = {
            targets: wizardData.targeting.targets.map((target) => ({
              campaignId,
              adGroupId,

              bid: Number(target.bid),

              expressionType: target.expressionType,

              expression: target.expression,

              state: target.state,
            })),
          };

          const targetsResponse = await dispatch(createTarget(targetsPayload));

          if (!targetsResponse?.status) {
            return targetsResponse;
          }
        }
      }

      // ===========================================================================
      // STEP 5 - CAMPAIGN NEGATIVE KEYWORDS
      // ===========================================================================

      if (wizardData.negatives?.campaignNegativeKeywords?.length > 0) {
        const negativeKeywordsPayload = {
          negative_keywords: wizardData.negatives.campaignNegativeKeywords.map((keyword) => ({
            campaignId,

            keywordText: keyword.keywordText,

            matchType: keyword.matchType,

            state: keyword.state,
          })),
        };

        const negativeKeywordsResponse = await dispatch(createCampaignNegativeKeyword(negativeKeywordsPayload));

        if (!negativeKeywordsResponse?.status) {
          return negativeKeywordsResponse;
        }
      }

      // ===========================================================================
      // STEP 6 - CAMPAIGN NEGATIVE TARGETS
      // ===========================================================================

      if (wizardData.negatives?.campaignNegativeTargets?.length > 0) {
        const negativeTargetsPayload = {
          negative_targets: wizardData.negatives.campaignNegativeTargets.map((target) => ({
            campaignId,

            expression: target.expression,

            state: target.state,
          })),
        };

        const negativeTargetsResponse = await dispatch(createCampaignNegativeTarget(negativeTargetsPayload));

        if (!negativeTargetsResponse?.status) {
          return negativeTargetsResponse;
        }
      }

      return {
        status: true,
        message: 'Campaign created successfully',
      };
    } catch (error) {
      console.error('Campaign Creation Error', error);

      return {
        status: false,
        message: error?.message || 'Campaign creation failed',
        errors: [],
      };
    }
  }
}

export default CampaignBuilderService;
