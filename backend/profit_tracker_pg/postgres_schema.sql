-- Postgres schema translated from the SQLite schema.
-- FKs are added after all tables so creation order doesn't matter.
-- Django's sqlite-only JSON_VALID checks are dropped; those columns become jsonb.
-- varchar(n) columns whose data already exceeds n in sqlite are widened to text.
-- PREFERRED alternative: `python manage.py migrate` on Postgres, then load postgres_data.sql.

SET TIME ZONE 'UTC';
BEGIN;

-- ===== tables =====
CREATE TABLE IF NOT EXISTS "django_migrations" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "app" varchar(255) NOT NULL,
    "name" varchar(255) NOT NULL,
    "applied" timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS "auth_group_permissions" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "group_id" integer NOT NULL,
    "permission_id" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "auth_user_groups" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "user_id" integer NOT NULL,
    "group_id" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "auth_user_user_permissions" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "user_id" integer NOT NULL,
    "permission_id" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "django_admin_log" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "object_id" text NULL,
    "object_repr" varchar(200) NOT NULL,
    "action_flag" smallint NOT NULL CHECK ("action_flag" >= 0),
    "change_message" text NOT NULL,
    "content_type_id" integer NULL,
    "user_id" integer NOT NULL,
    "action_time" timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS "django_content_type" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "app_label" varchar(100) NOT NULL,
    "model" varchar(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS "auth_permission" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "content_type_id" integer NOT NULL,
    "codename" varchar(100) NOT NULL,
    "name" varchar(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS "auth_group" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "name" varchar(150) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "auth_user" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "password" varchar(128) NOT NULL,
    "last_login" timestamptz NULL,
    "is_superuser" boolean NOT NULL,
    "username" varchar(150) NOT NULL UNIQUE,
    "last_name" varchar(150) NOT NULL,
    "email" varchar(254) NOT NULL,
    "is_staff" boolean NOT NULL,
    "is_active" boolean NOT NULL,
    "date_joined" timestamptz NOT NULL,
    "first_name" varchar(150) NOT NULL
);

CREATE TABLE IF NOT EXISTS "django_session" (
    "session_key" varchar(40) NOT NULL PRIMARY KEY,
    "session_data" text NOT NULL,
    "expire_date" timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_auth_userauthtoken" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "token" varchar(32) NOT NULL UNIQUE,
    "is_active" boolean NOT NULL,
    "created_at" timestamptz NOT NULL,
    "user_id" integer NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "user_auth_passwordresetrequest" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "token" varchar(255) NOT NULL UNIQUE,
    "is_used" boolean NOT NULL,
    "created_at" timestamptz NOT NULL,
    "user_id" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "amazon_auth_amazonaccount" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "app_client_id" varchar(255) NOT NULL,
    "app_client_secret" varchar(255) NOT NULL,
    "seller_central_id" varchar(255) NULL,
    "refresh_token_encrypted" text NOT NULL,
    "region" varchar(10) NOT NULL,
    "marketplace_id" varchar(50) NOT NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "user_id" integer NOT NULL,
    "ads_cookie" text NULL,
    "csrf_token" varchar(500) NULL,
    "csrf_data" text NULL,
    "amazon_refresh_token" text NULL
);

CREATE TABLE IF NOT EXISTS "amazon_auth_report" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "report_type" varchar(100) NOT NULL,
    "processing_status" varchar(50) NOT NULL,
    "created_time" timestamptz NOT NULL,
    "data_start_time" timestamptz NULL,
    "data_end_time" timestamptz NULL,
    "report_document_id" varchar(100) NULL,
    "raw_data" jsonb NULL,
    "created_at" timestamptz NOT NULL,
    "user_id" integer NOT NULL,
    "amazon_account_id" bigint NULL,
    "amazon_report_id" varchar(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS "amazon_auth_adreport" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "sku" varchar(100) NOT NULL,
    "date" date NOT NULL,
    "impressions" integer NOT NULL,
    "clicks" integer NOT NULL,
    "spend" numeric NOT NULL,
    "ad_sales" numeric NOT NULL,
    "ad_orders" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "amazon_auth_adcampaign" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "campaign_id" varchar(100) NOT NULL,
    "campaign_name" varchar(255) NOT NULL,
    "program_type" varchar(50) NULL,
    "campaign_type" varchar(50) NULL,
    "targeting_type" varchar(50) NULL,
    "state" varchar(50) NULL,
    "status_name" varchar(100) NULL,
    "portfolio_name" varchar(255) NULL,
    "budget_amount" numeric NULL,
    "budget_type" varchar(50) NULL,
    "start_date" date NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "amazon_account_id" bigint NOT NULL,
    "user_id" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "amazon_auth_adcampaignmetrics" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "date" date NOT NULL,
    "spend" numeric NOT NULL,
    "sales" numeric NOT NULL,
    "orders" integer NOT NULL,
    "cpc" numeric NULL,
    "acos" numeric NULL,
    "roas" numeric NULL,
    "impressions_share" numeric NULL,
    "created_at" timestamptz NOT NULL,
    "campaign_id" bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS "amazon_auth_amazonreport" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "report_id" varchar(100) NULL UNIQUE,
    "report_document_id" varchar(100) NULL,
    "report_type" varchar(100) NOT NULL,
    "marketplace_id" varchar(50) NOT NULL,
    "data_start_time" timestamptz NULL,
    "data_end_time" timestamptz NULL,
    "processing_status" varchar(20) NOT NULL,
    "download_status" varchar(20) NOT NULL,
    "created_time" timestamptz NULL,
    "processing_start_time" timestamptz NULL,
    "processing_end_time" timestamptz NULL,
    "error_message" text NULL,
    "retry_count" integer NOT NULL,
    "is_active" boolean NOT NULL,
    "last_synced_at" timestamptz NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "account_id" bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS "amazon_auth_settlementordersummary" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "amazon_order_id" varchar(50) NOT NULL,
    "data_start_time" timestamptz NOT NULL,
    "data_end_time" timestamptz NOT NULL,
    "sales" numeric NOT NULL,
    "fees" numeric NOT NULL,
    "refunds" numeric NOT NULL,
    "tax" numeric NOT NULL,
    "shipping" numeric NOT NULL,
    "net" numeric NOT NULL,
    "currency_code" varchar(10) NOT NULL,
    "report_id" varchar(100) NULL,
    "report_document_id" varchar(200) NULL,
    "created_at" timestamptz NOT NULL,
    "amazon_account_id" bigint NOT NULL,
    "user_id" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "amazon_auth_missingcatalogqueue" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "asin" varchar(50) NOT NULL,
    "marketplace_id" varchar(50) NOT NULL,
    "processed" boolean NOT NULL,
    "image_url" varchar(200) NULL,
    "account_id" bigint NULL,
    "seller_sku" varchar(255) NOT NULL,
    "parent_asin" varchar(50) NULL
);

CREATE TABLE IF NOT EXISTS "amazon_auth_productmapping" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "parent_sku" varchar(100) NOT NULL,
    "product_name" text NULL,
    "brand" varchar(100) NULL,
    "cost_price" numeric NOT NULL,
    "image_url" varchar(200) NULL,
    "asin" varchar(50) NULL,
    "account_id" bigint NULL,
    "seller_sku" varchar(100) NOT NULL,
    "parent_asin" varchar(50) NULL
);

CREATE TABLE IF NOT EXISTS "amazon_auth_returnitem" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "return_id" varchar(255) NOT NULL UNIQUE,
    "amazon_order_id" varchar(255) NOT NULL,
    "seller_sku" varchar(255) NOT NULL,
    "quantity" integer NOT NULL,
    "status" varchar(100) NOT NULL,
    "return_type" varchar(50) NOT NULL,
    "return_reason" varchar(255) NULL,
    "tracking_id" varchar(255) NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "raw_data" jsonb NULL,
    "created_db" timestamptz NOT NULL,
    "amazon_account_id" bigint NOT NULL,
    "user_id" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "amazon_auth_businessreport" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "date" date NOT NULL,
    "ordered_product_sales" numeric NOT NULL,
    "ordered_product_sales_b2b" numeric NOT NULL,
    "units_ordered" integer NOT NULL,
    "units_ordered_b2b" integer NOT NULL,
    "total_order_items" integer NOT NULL,
    "sessions_total" integer NOT NULL,
    "units_refunded" integer NOT NULL,
    "refund_rate" double precision NOT NULL,
    "created_at" timestamptz NOT NULL,
    "amazon_account_id" bigint NOT NULL,
    "user_id" integer NOT NULL,
    "buy_box_percentage" double precision NOT NULL,
    "buy_box_percentage_b2b" double precision NOT NULL,
    "child_asin" varchar(20) NULL,
    "orders_shipped" integer NOT NULL,
    "page_views_browser" integer NOT NULL,
    "page_views_mobile_app" integer NOT NULL,
    "page_views_percentage_total" double precision NOT NULL,
    "page_views_total" integer NOT NULL,
    "page_views_total_b2b" integer NOT NULL,
    "parent_asin" varchar(20) NULL,
    "session_percentage_total" double precision NOT NULL,
    "sessions_browser" integer NOT NULL,
    "sessions_mobile_app" integer NOT NULL,
    "sessions_total_b2b" integer NOT NULL,
    "shipped_product_sales" numeric NOT NULL,
    "title" text NULL,
    "total_order_items_b2b" integer NOT NULL,
    "unit_session_percentage" double precision NOT NULL,
    "unit_session_percentage_b2b" double precision NOT NULL,
    "units_shipped" integer NOT NULL,
    "report_datetime" timestamptz NULL,
    CONSTRAINT "unique_business_report" UNIQUE ("amazon_account_id", "date", "parent_asin", "child_asin")
);

CREATE TABLE IF NOT EXISTS "amazon_auth_financialevent" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "amazon_order_id" varchar(50) NULL,
    "event_type" varchar(100) NOT NULL,
    "posted_date" timestamptz NOT NULL,
    "total_amount" numeric NOT NULL,
    "currency_code" varchar(10) NULL,
    "raw_data" jsonb NULL,
    "created_at" timestamptz NOT NULL,
    "user_id" integer NOT NULL,
    "amazon_account_id" bigint NULL,
    "unique_hash" varchar(64) NULL UNIQUE,
    "commission_fee" numeric NOT NULL,
    "fulfillment_fee" numeric NOT NULL,
    "other_fee" numeric NOT NULL,
    "principal" numeric NOT NULL,
    "shipping_fee" numeric NOT NULL,
    "tax" numeric NOT NULL,
    "event_group" varchar(50) NULL,
    "quantity" integer NOT NULL,
    "shipping_income" numeric NOT NULL,
    "promotion_discount" numeric NOT NULL,
    "refund_amount" numeric NOT NULL
);

CREATE TABLE IF NOT EXISTS "amazon_auth_reportrequest" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "report_type" varchar(100) NOT NULL,
    "report_id" varchar(100) NULL,
    "start_date" timestamptz NOT NULL,
    "end_date" timestamptz NOT NULL,
    "status" varchar(50) NOT NULL,
    "created_at" timestamptz NOT NULL,
    "amazon_account_id" bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS "amazon_auth_amazonestimatedfee" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "seller_sku" varchar(255) NOT NULL,
    "asin" varchar(50) NULL,
    "marketplace_id" varchar(50) NOT NULL,
    "currency" varchar(10) NOT NULL,
    "selling_price" numeric NOT NULL,
    "total_fees" numeric NOT NULL,
    "referral_fee" numeric NOT NULL,
    "closing_fee" numeric NOT NULL,
    "per_item_fee" numeric NOT NULL,
    "fba_fee" numeric NOT NULL,
    "fba_pick_pack_fee" numeric NOT NULL,
    "fba_weight_handling_fee" numeric NOT NULL,
    "tax_amount" numeric NOT NULL,
    "raw_response" jsonb NOT NULL,
    "estimated_at" timestamptz NULL,
    "created_at" timestamptz NOT NULL,
    "order_item_id" bigint NOT NULL,
    "amazon_account_id" bigint NULL,
    "fulfillment_channel" varchar(10) NULL
);

CREATE TABLE IF NOT EXISTS "amazon_ads_amazonadsaccount" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "profile_id" bigint NOT NULL UNIQUE,
    "country_code" varchar(10) NULL,
    "currency_code" varchar(10) NULL,
    "region" varchar(10) NOT NULL,
    "access_token" text NULL,
    "refresh_token" text NOT NULL,
    "client_id" text NOT NULL,
    "client_secret" text NOT NULL,
    "account_info" jsonb NOT NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "user_id" integer NOT NULL,
    "amazon_account_id" bigint NULL,
    "is_primary" boolean NOT NULL
);

CREATE TABLE IF NOT EXISTS "amazon_ads_adscampaign" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "campaign_id" bigint NOT NULL UNIQUE,
    "name" varchar(255) NOT NULL,
    "state" varchar(50) NULL,
    "campaign_type" varchar(50) NULL,
    "targeting_type" varchar(50) NULL,
    "daily_budget" double precision NOT NULL,
    "start_date" date NULL,
    "raw_data" jsonb NOT NULL,
    "created_at" timestamptz NOT NULL,
    "amazon_account_id" bigint NOT NULL,
    "bidding_strategy" varchar(100) NULL,
    "budget_type" varchar(50) NULL,
    "marketplace_budget_allocation" varchar(100) NULL,
    "off_amazon_settings" jsonb NOT NULL,
    "placement_bidding" jsonb NOT NULL,
    "tags" jsonb NOT NULL,
    "end_date" date NULL
);

CREATE TABLE IF NOT EXISTS "amazon_ads_campaignmetric" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "report_date" date NOT NULL,
    "impressions" integer NOT NULL,
    "clicks" integer NOT NULL,
    "cost" double precision NOT NULL,
    "sales" double precision NOT NULL,
    "orders" integer NOT NULL,
    "units" integer NOT NULL,
    "acos" double precision NOT NULL,
    "roas" double precision NOT NULL,
    "raw_data" jsonb NOT NULL,
    "created_at" timestamptz NOT NULL,
    "campaign_id" bigint NOT NULL,
    "cpc" double precision NOT NULL,
    "ctr" double precision NOT NULL
);

CREATE TABLE IF NOT EXISTS "amazon_ads_adsadgroup" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "ad_group_id" bigint NOT NULL UNIQUE,
    "name" varchar(255) NOT NULL,
    "state" varchar(50) NULL,
    "default_bid" double precision NOT NULL,
    "raw_data" jsonb NOT NULL,
    "created_at" timestamptz NOT NULL,
    "amazon_account_id" bigint NOT NULL,
    "campaign_id" bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS "amazon_ads_adsreportlog" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "report_id" varchar(255) NOT NULL UNIQUE,
    "report_type" varchar(100) NOT NULL,
    "start_date" date NOT NULL,
    "end_date" date NOT NULL,
    "status" varchar(50) NOT NULL,
    "download_url" text NULL,
    "raw_response" jsonb NOT NULL,
    "created_at" timestamptz NOT NULL,
    "amazon_account_id" bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS "amazon_ads_adsproductad" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "ad_id" bigint NOT NULL UNIQUE,
    "asin" varchar(20) NOT NULL,
    "sku" varchar(255) NULL,
    "state" varchar(50) NULL,
    "raw_data" jsonb NOT NULL,
    "created_at" timestamptz NOT NULL,
    "ad_group_id" bigint NOT NULL,
    "amazon_account_id" bigint NOT NULL,
    "campaign_id" bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS "amazon_ads_targetmetric" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "report_date" date NOT NULL,
    "impressions" integer NOT NULL,
    "clicks" integer NOT NULL,
    "cost" double precision NOT NULL,
    "sales" double precision NOT NULL,
    "orders" integer NOT NULL,
    "raw_data" jsonb NOT NULL,
    "target_id" bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS "amazon_ads_searchtermmetric" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "search_term" text NOT NULL,
    "report_date" date NOT NULL,
    "impressions" integer NOT NULL,
    "clicks" integer NOT NULL,
    "cost" double precision NOT NULL,
    "sales" double precision NOT NULL,
    "orders" integer NOT NULL,
    "acos" double precision NOT NULL,
    "roas" double precision NOT NULL,
    "raw_data" jsonb NOT NULL,
    "campaign_id" bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS "amazon_ads_productadmetric" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "report_date" date NOT NULL,
    "impressions" integer NOT NULL,
    "clicks" integer NOT NULL,
    "cost" double precision NOT NULL,
    "sales" double precision NOT NULL,
    "orders" integer NOT NULL,
    "raw_data" jsonb NOT NULL,
    "product_ad_id" bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS "amazon_ads_keywordmetric" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "report_date" date NOT NULL,
    "impressions" integer NOT NULL,
    "clicks" integer NOT NULL,
    "cost" double precision NOT NULL,
    "sales" double precision NOT NULL,
    "orders" integer NOT NULL,
    "acos" double precision NOT NULL,
    "roas" double precision NOT NULL,
    "raw_data" jsonb NOT NULL,
    "keyword_id" bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS "amazon_auth_productpricing" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "asin" varchar(255) NOT NULL,
    "sku" varchar(255) NOT NULL,
    "marketplace_id" varchar(100) NOT NULL,
    "listing_price" numeric NOT NULL,
    "landed_price" numeric NOT NULL,
    "shipping_price" numeric NOT NULL,
    "regular_price" numeric NOT NULL,
    "currency" varchar(20) NOT NULL,
    "fulfillment_channel" varchar(100) NULL,
    "item_condition" varchar(100) NULL,
    "updated_at" timestamptz NOT NULL,
    "user_id" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "amazon_auth_amazoncatalogdetails" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "asin" varchar(50) NOT NULL,
    "parent_asin" varchar(50) NULL,
    "marketplace_id" varchar(50) NOT NULL,
    "brand" varchar(255) NULL,
    "item_name" text NULL,
    "model_name" varchar(255) NULL,
    "model_number" varchar(255) NULL,
    "image_url" varchar(200) NULL,
    "manufacturer" varchar(255) NULL,
    "color" varchar(255) NULL,
    "material" varchar(255) NULL,
    "size" varchar(255) NULL,
    "item_type_name" text NULL,
    "bullet_points" jsonb NOT NULL,
    "product_description" text NULL,
    "item_weight" double precision NULL,
    "item_weight_unit" varchar(50) NULL,
    "package_weight" double precision NULL,
    "package_weight_unit" varchar(50) NULL,
    "item_dimensions" jsonb NOT NULL,
    "package_dimensions" jsonb NOT NULL,
    "number_of_items" integer NULL,
    "batteries_required" boolean NULL,
    "care_instructions" text NULL,
    "special_features" jsonb NOT NULL,
    "recommended_uses" text NULL,
    "sales_rank" integer NULL,
    "sales_rank_category" varchar(255) NULL,
    "raw_response" jsonb NOT NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "user_id" integer NOT NULL,
    "display_group_rank" integer NULL,
    "display_group_rank_title" varchar(255) NULL
);

CREATE TABLE IF NOT EXISTS "amazon_auth_amazonlistingitem" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "sku" varchar(255) NOT NULL,
    "asin" varchar(50) NULL,
    "marketplace_id" varchar(50) NULL,
    "product_type" varchar(255) NULL,
    "condition_type" varchar(100) NULL,
    "status" jsonb NOT NULL,
    "fnsku" varchar(255) NULL,
    "item_name" text NULL,
    "image_url" varchar(200) NULL,
    "created_date" timestamptz NULL,
    "last_updated_date" timestamptz NULL,
    "attributes" jsonb NOT NULL,
    "issues" jsonb NOT NULL,
    "offers" jsonb NOT NULL,
    "fulfillment_availability" jsonb NOT NULL,
    "relationships" jsonb NOT NULL,
    "product_types" jsonb NOT NULL,
    "raw_response" jsonb NOT NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "amazon_account_id" bigint NOT NULL,
    "user_id" integer NOT NULL,
    "gst_rate" double precision NOT NULL,
    "region" text NULL,
    "shiping_estimate" double precision NOT NULL,
    "standard_cost" double precision NOT NULL,
    "step_level" text NULL,
    "tcs" double precision NOT NULL
);

CREATE TABLE IF NOT EXISTS "amazon_ads_adskeyword" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "keyword_text" text NOT NULL,
    "match_type" varchar(20) NOT NULL,
    "bid" double precision NOT NULL,
    "state" varchar(50) NULL,
    "raw_data" jsonb NOT NULL,
    "created_at" timestamptz NOT NULL,
    "ad_group_id" bigint NOT NULL,
    "amazon_account_id" bigint NOT NULL,
    "campaign_id" bigint NOT NULL,
    "keyword_id" varchar(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "amazon_ads_adstarget" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "expression_type" varchar(100) NULL,
    "expression" jsonb NOT NULL,
    "bid" double precision NOT NULL,
    "state" varchar(50) NULL,
    "raw_data" jsonb NOT NULL,
    "created_at" timestamptz NOT NULL,
    "ad_group_id" bigint NOT NULL,
    "amazon_account_id" bigint NOT NULL,
    "campaign_id" bigint NOT NULL,
    "target_id" varchar(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "amazon_ads_adsbudgetrule" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "name" varchar(500) NULL,
    "rule_type" varchar(10) NOT NULL,
    "raw_data" jsonb NOT NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "amazon_account_id" bigint NOT NULL,
    "rule_state" varchar(50) NULL,
    "budget_rule_id" varchar(255) NULL,
    "created_date" bigint NULL,
    "last_updated_date" bigint NULL,
    "profile_id" varchar(100) NULL,
    "rule_details" jsonb NOT NULL,
    "rule_status" varchar(100) NULL,
    "campaign_ids" jsonb NOT NULL,
    "error_details" jsonb NOT NULL,
    "is_deleted" boolean NOT NULL
);

CREATE TABLE IF NOT EXISTS "amazon_ads_adsnegativekeyword" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "negative_keyword_id" bigint NOT NULL UNIQUE,
    "keyword_text" text NOT NULL,
    "match_type" varchar(50) NULL,
    "state" varchar(50) NULL,
    "serving_status" varchar(100) NULL,
    "native_language_keyword" boolean NOT NULL,
    "raw_data" jsonb NOT NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "ad_group_id" bigint NULL,
    "amazon_account_id" bigint NOT NULL,
    "campaign_id" bigint NOT NULL,
    "creation_date_time" timestamptz NULL,
    "last_update_date_time" timestamptz NULL
);

CREATE TABLE IF NOT EXISTS "amazon_ads_adsoptimizationrule" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "profile_id" varchar(100) NULL,
    "optimization_rule_id" varchar(255) NOT NULL UNIQUE,
    "rule_name" varchar(500) NULL,
    "rule_category" varchar(100) NULL,
    "rule_sub_category" varchar(100) NULL,
    "status" varchar(100) NULL,
    "recurrence" jsonb NOT NULL,
    "conditions" jsonb NOT NULL,
    "action" jsonb NOT NULL,
    "raw_data" jsonb NOT NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "amazon_account_id" bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS "amazon_auth_amazontransaction" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "transaction_id" varchar(255) NOT NULL UNIQUE,
    "transaction_type" varchar(255) NULL,
    "transaction_status" varchar(100) NULL,
    "description" text NULL,
    "posted_date" timestamptz NULL,
    "total_amount" numeric NULL,
    "currency_code" varchar(20) NULL,
    "raw_payload" jsonb NOT NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "amazon_account_id" bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS "amazon_auth_amazontransactionrelatedidentifier" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "identifier_name" varchar(255) NOT NULL,
    "identifier_value" varchar(255) NOT NULL,
    "transaction_id" bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS "amazon_auth_amazontransactionbreakdown" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "breakdown_type" varchar(255) NOT NULL,
    "amount" numeric NULL,
    "currency_code" varchar(20) NULL,
    "parent_id" bigint NULL,
    "transaction_id" bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS "amazon_auth_amazontransactioncontext" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "context_type" varchar(255) NULL,
    "asin" varchar(255) NULL,
    "sku" varchar(255) NULL,
    "quantity_shipped" integer NULL,
    "fulfillment_network" varchar(100) NULL,
    "raw_context" jsonb NOT NULL,
    "transaction_id" bigint NOT NULL,
    "channel" varchar(255) NULL,
    "created_at" timestamptz NULL,
    "deferral_reason" varchar(255) NULL,
    "maturity_date" timestamptz NULL,
    "order_type" varchar(255) NULL,
    "store_name" varchar(255) NULL,
    "updated_at" timestamptz NULL
);

CREATE TABLE IF NOT EXISTS "user_auth_legaldocument" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "title" varchar(50) NOT NULL,
    "slug" varchar(50) NOT NULL UNIQUE,
    "content" text NOT NULL,
    "language" varchar(10) NOT NULL,
    "version" varchar(20) NULL,
    "is_active" boolean NOT NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "is_deleted" boolean NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_auth_promocode" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "promocode" varchar(255) NULL UNIQUE,
    "title" varchar(255) NULL,
    "description" varchar(255) NULL,
    "image" varchar(100) NULL,
    "promoType" varchar(20) NOT NULL,
    "specificAmount" numeric NULL,
    "percentage" numeric NULL,
    "startDateTime" timestamptz NULL,
    "endDateTime" timestamptz NULL,
    "is_active" boolean NOT NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "is_deleted" boolean NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_auth_userprofile" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "name" varchar(100) NOT NULL,
    "business_name" varchar(150) NOT NULL,
    "mobile_number" text NOT NULL,
    "address" text NOT NULL,
    "city" varchar(50) NOT NULL,
    "state" varchar(50) NOT NULL,
    "pin_code" varchar(10) NOT NULL,
    "accepted_terms" boolean NOT NULL,
    "created_at" timestamptz NOT NULL,
    "user_id" integer NOT NULL UNIQUE,
    "is_paid_subscription_active" boolean NULL,
    "subscription_active" boolean NULL,
    "subscription_status" varchar(50) NOT NULL,
    "trial_end_date" timestamptz NULL,
    "trial_start_date" timestamptz NULL,
    "subscriptiontype_id" bigint NULL
);

CREATE TABLE IF NOT EXISTS "user_auth_subscriptionplan" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "subcription_id" varchar(20) NULL UNIQUE,
    "status" varchar(10) NOT NULL,
    "features" jsonb NOT NULL,
    "is_active" boolean NOT NULL,
    "created_at" timestamptz NULL,
    "updated_at" timestamptz NULL,
    "annual_price" numeric NOT NULL,
    "description" text NULL,
    "monthly_price" numeric NOT NULL,
    "plan_name" varchar(100) NULL,
    "slug" varchar(50) NULL UNIQUE,
    "terms_and_conditions" jsonb NOT NULL,
    "is_deleted" boolean NOT NULL
);

CREATE TABLE IF NOT EXISTS "subscription_usersubscription" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "razorpay_subscription_id" varchar(100) NULL,
    "razorpay_plan_id" varchar(100) NULL,
    "status" varchar(30) NOT NULL,
    "created_at" timestamptz NOT NULL,
    "user_id" integer NOT NULL,
    "razorpay_payment_id" varchar(100) NULL,
    "updated_at" timestamptz NOT NULL,
    "is_paid" boolean NOT NULL,
    "amount" numeric NOT NULL,
    "billing_cycle" varchar(20) NOT NULL,
    "end_date" timestamptz NULL,
    "plan_id" bigint NULL,
    "start_date" timestamptz NULL,
    "razorpay_signature" varchar(255) NULL,
    "razorpay_order_id" varchar(100) NULL
);

CREATE TABLE IF NOT EXISTS "user_auth_module" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "name" varchar(100) NOT NULL UNIQUE,
    "slug" varchar(50) NOT NULL UNIQUE,
    "description" text NULL,
    "is_active" boolean NOT NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_auth_submodule" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "name" varchar(100) NOT NULL,
    "slug" varchar(50) NOT NULL,
    "description" text NULL,
    "is_active" boolean NOT NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "module_id" bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_auth_usermodulepermission" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "can_view" boolean NOT NULL,
    "can_create" boolean NOT NULL,
    "can_update" boolean NOT NULL,
    "can_delete" boolean NOT NULL,
    "created_at" timestamptz NOT NULL,
    "module_id" bigint NULL,
    "submodule_id" bigint NULL,
    "user_id" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_auth_notification" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "title" varchar(255) NOT NULL,
    "message" text NOT NULL,
    "notification_type" varchar(20) NOT NULL,
    "send_to_all" boolean NOT NULL,
    "is_active" boolean NOT NULL,
    "created_at" timestamptz NOT NULL,
    "created_by_id" integer NULL
);

CREATE TABLE IF NOT EXISTS "user_auth_usernotification" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "is_read" boolean NOT NULL,
    "read_at" timestamptz NULL,
    "created_at" timestamptz NOT NULL,
    "notification_id" bigint NOT NULL,
    "user_id" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "amazon_ads_adsnegativetarget" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "negative_target_id" bigint NOT NULL UNIQUE,
    "expression_type" varchar(100) NULL,
    "expression" jsonb NOT NULL,
    "resolved_expression" jsonb NOT NULL,
    "state" varchar(50) NULL,
    "serving_status" varchar(100) NULL,
    "raw_data" jsonb NOT NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "ad_group_id" bigint NULL,
    "amazon_account_id" bigint NOT NULL,
    "campaign_id" bigint NOT NULL,
    "creation_date_time" timestamptz NULL,
    "last_update_date_time" timestamptz NULL
);

CREATE TABLE IF NOT EXISTS "amazon_ads_adsportfolio" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "name" varchar(255) NOT NULL,
    "state" varchar(50) NOT NULL,
    "in_budget" boolean NOT NULL,
    "currency_code" varchar(10) NULL,
    "budget_policy" varchar(50) NULL,
    "raw_data" jsonb NOT NULL,
    "created_at" timestamptz NOT NULL,
    "amazon_account_id" bigint NOT NULL,
    "portfolio_id" varchar(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS "myntra_myntraconnection" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "merchant_id" varchar(200) NULL,
    "secret_key" text NULL,
    "partner_type" varchar(50) NULL,
    "warehouse_code" varchar(50) NULL,
    "access_token" text NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "user_id" integer NOT NULL UNIQUE,
    "access_token_expires_at" timestamptz NULL,
    "refresh_token" text NULL
);

CREATE TABLE IF NOT EXISTS "user_auth_supportticket" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "ticket_id" varchar(50) NOT NULL UNIQUE,
    "title" varchar(255) NOT NULL,
    "description" text NOT NULL,
    "status" varchar(20) NOT NULL,
    "priority" varchar(20) NOT NULL,
    "admin_note" text NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "user_id" integer NOT NULL,
    "document" varchar(100) NULL
);

CREATE TABLE IF NOT EXISTS "user_auth_subuser" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "name" varchar(100) NOT NULL,
    "mobile_number" varchar(15) NOT NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "parent_id" integer NOT NULL,
    "user_id" integer NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "user_auth_subscriptionplan_modules" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "subscriptionplan_id" bigint NOT NULL,
    "module_id" bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_auth_subscriptionplan_submodules" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "subscriptionplan_id" bigint NOT NULL,
    "submodule_id" bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS "amazon_auth_order" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "amazon_order_id" varchar(50) NOT NULL,
    "purchase_date" timestamptz NOT NULL,
    "last_update_date" timestamptz NOT NULL,
    "order_status" varchar(50) NOT NULL,
    "fulfillment_channel" varchar(20) NOT NULL,
    "items_shipped" integer NOT NULL,
    "items_unshipped" integer NOT NULL,
    "payment_method" varchar(50) NULL,
    "marketplace_id" varchar(50) NOT NULL,
    "buyer_name" varchar(255) NULL,
    "city" varchar(100) NULL,
    "state" varchar(100) NULL,
    "country" varchar(10) NULL,
    "created_at" timestamptz NOT NULL,
    "user_id" integer NOT NULL,
    "currency_code" varchar(10) NULL,
    "total_amount" numeric NULL,
    "amazon_account_id" bigint NULL,
    "channel" varchar(50) NOT NULL,
    "new_total_amount" numeric NULL,
    "raw_data" jsonb NULL
);

CREATE TABLE IF NOT EXISTS "amazon_auth_orderitem" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "order_item_id" varchar(50) NOT NULL,
    "seller_sku" varchar(100) NOT NULL,
    "title" varchar(500) NULL,
    "quantity_ordered" integer NOT NULL,
    "quantity_shipped" integer NULL,
    "item_price" numeric NOT NULL,
    "item_tax" numeric NOT NULL,
    "shipping_price" numeric NOT NULL,
    "created_at" timestamptz NOT NULL,
    "order_id" bigint NOT NULL,
    "asin" varchar(20) NULL,
    "image_url" varchar(200) NULL,
    "brand" varchar(100) NULL,
    "cost_price" numeric NOT NULL,
    "discount" numeric NOT NULL,
    "mrp" numeric NOT NULL,
    "net_sales" numeric NOT NULL,
    "parent_sku" varchar(100) NULL,
    "product_name" text NULL,
    "promotion_discount" numeric NOT NULL,
    "quantity_replaced" integer NOT NULL,
    "quantity_returned" integer NOT NULL,
    "selling_price" numeric NOT NULL,
    "total_amount" numeric NOT NULL,
    "claim_type" varchar(50) NULL,
    "commission_fee" numeric NOT NULL,
    "fulfillment_fee" numeric NOT NULL,
    "other_fee" numeric NOT NULL,
    "payout_amount" numeric NOT NULL,
    "quantity_claimed" integer NOT NULL,
    "refund_amount" numeric NOT NULL,
    "shipping_expense" numeric NOT NULL,
    "shipping_income" numeric NOT NULL,
    "total_claimed_amount" numeric NOT NULL,
    "parent_asin" varchar(50) NULL,
    "new_item_price" numeric NOT NULL,
    "raw_data" jsonb NULL
);

CREATE TABLE IF NOT EXISTS "myntra_myntrareturn" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "seller_id" varchar(50) NULL,
    "warehouse_id" varchar(50) NULL,
    "model" varchar(50) NULL,
    "myntra_sku_code" varchar(100) NULL,
    "seller_sku_code" varchar(100) NULL,
    "style_id" varchar(50) NULL,
    "sku_id" varchar(50) NULL,
    "brand" varchar(255) NULL,
    "order_created_date" date NULL,
    "inscanned_on" date NULL,
    "fmpu_date" date NULL,
    "order_delivered_date" date NULL,
    "return_created_date" date NULL,
    "refunded_date" date NULL,
    "order_rto_date" date NULL,
    "is_refunded" boolean NOT NULL,
    "exchange_id" varchar(100) NULL,
    "order_id" varchar(100) NULL,
    "order_group_id" varchar(100) NULL,
    "order_line_id" varchar(100) NOT NULL UNIQUE,
    "seller_order_id" varchar(100) NULL,
    "type" varchar(50) NULL,
    "status" varchar(100) NULL,
    "store_packet_id" varchar(100) NULL,
    "seller_packet_id_fk" varchar(100) NULL,
    "quantity" integer NOT NULL CHECK ("quantity" >= 0),
    "return_id" varchar(100) NULL,
    "return_mode" varchar(100) NULL,
    "return_reason" text NULL,
    "return_status" varchar(100) NULL,
    "forward_tracking_number" varchar(100) NULL,
    "return_tracking_number" varchar(100) NULL,
    "master_bag_id" varchar(100) NULL,
    "lmdo_status" varchar(100) NULL,
    "lmdo_last_modified_on" date NULL,
    "gatepass_id" varchar(100) NULL,
    "gatepass_status" varchar(100) NULL,
    "gatepass_type" varchar(100) NULL,
    "gatepass_lastmodified" date NULL,
    "raw_data" jsonb NOT NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "myntra_connection_id" bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS "myntra_myntrareportqueue" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "report_name" varchar(100) NOT NULL,
    "partner_type" varchar(50) NULL,
    "from_date" date NOT NULL,
    "to_date" date NOT NULL,
    "job_id" varchar(100) NULL,
    "download_url" text NULL,
    "status" varchar(20) NOT NULL,
    "error_message" text NULL,
    "scheduled_at" timestamptz NULL,
    "completed_at" timestamptz NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "myntra_connection_id" bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS "myntra_myntralisting" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "article_type" varchar(100) NULL,
    "brand" varchar(255) NULL,
    "style_status" varchar(20) NULL,
    "style_status_description" varchar(255) NULL,
    "style_id" varchar(50) NULL,
    "style_name" text NULL,
    "size" varchar(50) NULL,
    "seller_sku_code" varchar(255) NULL,
    "sku_id" varchar(50) NOT NULL UNIQUE,
    "sku_code" varchar(255) NULL,
    "van" varchar(255) NULL,
    "mrp" numeric NULL,
    "is_active" boolean NOT NULL,
    "listing_status" varchar(20) NULL,
    "listing_status_description" varchar(255) NULL,
    "seller_listing_comments" text NULL,
    "style_catalogued_date" date NULL,
    "lot_uploaded_date" date NULL,
    "style_onhold_date" date NULL,
    "onhold_reason" text NULL,
    "turn_around_time" varchar(100) NULL,
    "raw_data" jsonb NOT NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "myntra_connection_id" bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS "myntra_myntraorder" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "user_id" integer NULL,
    "article_type" varchar(255) NULL,
    "brand" varchar(255) NULL,
    "cancellation_reason" text NULL,
    "cancellation_reason_id" varchar(100) NULL,
    "cancelled_on" timestamptz NULL,
    "city" varchar(100) NULL,
    "coupon_discount" numeric NOT NULL,
    "courier_code" varchar(100) NULL,
    "created_on" timestamptz NULL,
    "delivered_on" timestamptz NULL,
    "discount" numeric NOT NULL,
    "final_amount" numeric NOT NULL,
    "fmpu_date" timestamptz NULL,
    "gift_charge" numeric NOT NULL,
    "imported_at" timestamptz NOT NULL,
    "inscanned_on" timestamptz NULL,
    "lost_date" timestamptz NULL,
    "myntra_connection_id" bigint NOT NULL,
    "myntra_sku_code" varchar(255) NULL,
    "order_id_fk" varchar(100) NULL,
    "order_line_id" varchar(100) NOT NULL UNIQUE,
    "order_release_id" varchar(100) NULL,
    "order_status" varchar(100) NULL,
    "order_tracking_number" varchar(255) NULL,
    "packed_on" timestamptz NULL,
    "packet_id" varchar(100) NULL,
    "po_type" varchar(100) NULL,
    "raw_data" jsonb NOT NULL,
    "return_creation_date" timestamptz NULL,
    "rto_creation_date" timestamptz NULL,
    "seller_id" varchar(100) NULL,
    "seller_order_id" varchar(100) NOT NULL,
    "seller_packet_id" varchar(100) NULL,
    "seller_price" numeric NOT NULL,
    "seller_warehouse_id" varchar(100) NULL,
    "shipped_on" timestamptz NULL,
    "shipping_charge" numeric NOT NULL,
    "size" varchar(50) NULL,
    "sku_id" varchar(100) NULL,
    "state" varchar(100) NULL,
    "store_order_id" varchar(100) NULL,
    "style_id" varchar(100) NULL,
    "style_name" varchar(255) NULL,
    "tax_recovery" numeric NOT NULL,
    "total_mrp" numeric NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "vendor_article_number" varchar(255) NULL,
    "warehouse_id" varchar(100) NULL,
    "zipcode" varchar(20) NULL,
    "seller_sku_code" varchar(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS "amazon_auth_exportedreport" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "report_type" varchar(255) NOT NULL,
    "file_name" varchar(255) NOT NULL,
    "file" varchar(100) NULL,
    "format" varchar(10) NOT NULL,
    "from_date" date NULL,
    "to_date" date NULL,
    "status" varchar(50) NOT NULL,
    "created_at" timestamptz NOT NULL,
    "user_id" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "myntra_myntrapaymenttransaction" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "neft_ref" varchar(100) NULL,
    "payment_date" date NULL,
    "order_line_id" varchar(100) NULL,
    "seller_order_id" varchar(100) NULL,
    "store_order_id" varchar(100) NULL,
    "return_id" varchar(100) NULL,
    "order_type" varchar(50) NULL,
    "customer_paid_amount" numeric NULL,
    "settled_amount" numeric NULL,
    "commission" numeric NULL,
    "shipping_fee" numeric NULL,
    "payment_method" varchar(50) NULL,
    "pick_and_pack_fee" numeric NULL,
    "fixed_fee" numeric NULL,
    "payment_gateway_fee" numeric NULL,
    "logistics_commission" numeric NULL,
    "igst" numeric NULL,
    "cgst" numeric NULL,
    "sgst" numeric NULL,
    "igst_tcs" numeric NULL,
    "cgst_tcs" numeric NULL,
    "sgst_tcs" numeric NULL,
    "tds" numeric NULL,
    "seller_discount" numeric NULL,
    "platform_discount" numeric NULL,
    "total_discount" numeric NULL,
    "comments" text NULL,
    "raw_data" jsonb NOT NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "myntra_connection_id" bigint NOT NULL,
    "nod_comment" text NULL,
    "transaction_key" varchar(64) NULL,
    CONSTRAINT "unique_myntra_payment_transaction_key" UNIQUE ("myntra_connection_id", "transaction_key")
);

CREATE TABLE IF NOT EXISTS "admin_auth_apicalllog" (
    "id" bigserial NOT NULL PRIMARY KEY,
    "service_type" varchar(50) NOT NULL,
    "account_id" varchar(255) NULL,
    "account_name" varchar(255) NULL,
    "api_endpoint" varchar(255) NOT NULL,
    "call_count" integer NOT NULL,
    "status" varchar(50) NOT NULL,
    "orders_processed" integer NOT NULL,
    "response_time_ms" integer NOT NULL,
    "created_at" timestamptz NOT NULL,
    "user_id" integer NULL
);

-- ===== foreign keys =====
ALTER TABLE "auth_group_permissions" ADD CONSTRAINT "auth_group_permissions_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "auth_group" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "auth_group_permissions" ADD CONSTRAINT "auth_group_permissions_permission_id_fk" FOREIGN KEY ("permission_id") REFERENCES "auth_permission" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "auth_user_groups" ADD CONSTRAINT "auth_user_groups_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "auth_user_groups" ADD CONSTRAINT "auth_user_groups_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "auth_group" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "auth_user_user_permissions" ADD CONSTRAINT "auth_user_user_permissions_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "auth_user_user_permissions" ADD CONSTRAINT "auth_user_user_permissions_permission_id_fk" FOREIGN KEY ("permission_id") REFERENCES "auth_permission" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "django_admin_log" ADD CONSTRAINT "django_admin_log_content_type_id_fk" FOREIGN KEY ("content_type_id") REFERENCES "django_content_type" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "django_admin_log" ADD CONSTRAINT "django_admin_log_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "auth_permission" ADD CONSTRAINT "auth_permission_content_type_id_fk" FOREIGN KEY ("content_type_id") REFERENCES "django_content_type" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "user_auth_userauthtoken" ADD CONSTRAINT "user_auth_userauthtoken_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "user_auth_passwordresetrequest" ADD CONSTRAINT "user_auth_passwordresetrequest_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_amazonaccount" ADD CONSTRAINT "amazon_auth_amazonaccount_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_report" ADD CONSTRAINT "amazon_auth_report_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_report" ADD CONSTRAINT "amazon_auth_report_amazon_account_id_fk" FOREIGN KEY ("amazon_account_id") REFERENCES "amazon_auth_amazonaccount" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_adcampaign" ADD CONSTRAINT "amazon_auth_adcampaign_amazon_account_id_fk" FOREIGN KEY ("amazon_account_id") REFERENCES "amazon_auth_amazonaccount" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_adcampaign" ADD CONSTRAINT "amazon_auth_adcampaign_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_adcampaignmetrics" ADD CONSTRAINT "amazon_auth_adcampaignmetrics_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "amazon_auth_adcampaign" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_amazonreport" ADD CONSTRAINT "amazon_auth_amazonreport_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "amazon_auth_amazonaccount" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_settlementordersummary" ADD CONSTRAINT "amazon_auth_settlementordersummary_amazon_account_id_fk" FOREIGN KEY ("amazon_account_id") REFERENCES "amazon_auth_amazonaccount" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_settlementordersummary" ADD CONSTRAINT "amazon_auth_settlementordersummary_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_missingcatalogqueue" ADD CONSTRAINT "amazon_auth_missingcatalogqueue_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "amazon_auth_amazonaccount" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_productmapping" ADD CONSTRAINT "amazon_auth_productmapping_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "amazon_auth_amazonaccount" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_returnitem" ADD CONSTRAINT "amazon_auth_returnitem_amazon_account_id_fk" FOREIGN KEY ("amazon_account_id") REFERENCES "amazon_auth_amazonaccount" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_returnitem" ADD CONSTRAINT "amazon_auth_returnitem_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_businessreport" ADD CONSTRAINT "amazon_auth_businessreport_amazon_account_id_fk" FOREIGN KEY ("amazon_account_id") REFERENCES "amazon_auth_amazonaccount" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_businessreport" ADD CONSTRAINT "amazon_auth_businessreport_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_financialevent" ADD CONSTRAINT "amazon_auth_financialevent_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_financialevent" ADD CONSTRAINT "amazon_auth_financialevent_amazon_account_id_fk" FOREIGN KEY ("amazon_account_id") REFERENCES "amazon_auth_amazonaccount" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_reportrequest" ADD CONSTRAINT "amazon_auth_reportrequest_amazon_account_id_fk" FOREIGN KEY ("amazon_account_id") REFERENCES "amazon_auth_amazonaccount" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_amazonestimatedfee" ADD CONSTRAINT "amazon_auth_amazonestimatedfee_order_item_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "amazon_auth_orderitem" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_amazonestimatedfee" ADD CONSTRAINT "amazon_auth_amazonestimatedfee_amazon_account_id_fk" FOREIGN KEY ("amazon_account_id") REFERENCES "amazon_auth_amazonaccount" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_ads_amazonadsaccount" ADD CONSTRAINT "amazon_ads_amazonadsaccount_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_ads_amazonadsaccount" ADD CONSTRAINT "amazon_ads_amazonadsaccount_amazon_account_id_fk" FOREIGN KEY ("amazon_account_id") REFERENCES "amazon_auth_amazonaccount" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_ads_adscampaign" ADD CONSTRAINT "amazon_ads_adscampaign_amazon_account_id_fk" FOREIGN KEY ("amazon_account_id") REFERENCES "amazon_ads_amazonadsaccount" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_ads_campaignmetric" ADD CONSTRAINT "amazon_ads_campaignmetric_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "amazon_ads_adscampaign" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_ads_adsadgroup" ADD CONSTRAINT "amazon_ads_adsadgroup_amazon_account_id_fk" FOREIGN KEY ("amazon_account_id") REFERENCES "amazon_ads_amazonadsaccount" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_ads_adsadgroup" ADD CONSTRAINT "amazon_ads_adsadgroup_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "amazon_ads_adscampaign" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_ads_adsreportlog" ADD CONSTRAINT "amazon_ads_adsreportlog_amazon_account_id_fk" FOREIGN KEY ("amazon_account_id") REFERENCES "amazon_ads_amazonadsaccount" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_ads_adsproductad" ADD CONSTRAINT "amazon_ads_adsproductad_ad_group_id_fk" FOREIGN KEY ("ad_group_id") REFERENCES "amazon_ads_adsadgroup" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_ads_adsproductad" ADD CONSTRAINT "amazon_ads_adsproductad_amazon_account_id_fk" FOREIGN KEY ("amazon_account_id") REFERENCES "amazon_ads_amazonadsaccount" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_ads_adsproductad" ADD CONSTRAINT "amazon_ads_adsproductad_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "amazon_ads_adscampaign" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_ads_targetmetric" ADD CONSTRAINT "amazon_ads_targetmetric_target_id_fk" FOREIGN KEY ("target_id") REFERENCES "amazon_ads_adstarget" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_ads_searchtermmetric" ADD CONSTRAINT "amazon_ads_searchtermmetric_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "amazon_ads_adscampaign" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_ads_productadmetric" ADD CONSTRAINT "amazon_ads_productadmetric_product_ad_id_fk" FOREIGN KEY ("product_ad_id") REFERENCES "amazon_ads_adsproductad" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_ads_keywordmetric" ADD CONSTRAINT "amazon_ads_keywordmetric_keyword_id_fk" FOREIGN KEY ("keyword_id") REFERENCES "amazon_ads_adskeyword" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_productpricing" ADD CONSTRAINT "amazon_auth_productpricing_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_amazoncatalogdetails" ADD CONSTRAINT "amazon_auth_amazoncatalogdetails_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_amazonlistingitem" ADD CONSTRAINT "amazon_auth_amazonlistingitem_amazon_account_id_fk" FOREIGN KEY ("amazon_account_id") REFERENCES "amazon_auth_amazonaccount" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_amazonlistingitem" ADD CONSTRAINT "amazon_auth_amazonlistingitem_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_ads_adskeyword" ADD CONSTRAINT "amazon_ads_adskeyword_ad_group_id_fk" FOREIGN KEY ("ad_group_id") REFERENCES "amazon_ads_adsadgroup" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_ads_adskeyword" ADD CONSTRAINT "amazon_ads_adskeyword_amazon_account_id_fk" FOREIGN KEY ("amazon_account_id") REFERENCES "amazon_ads_amazonadsaccount" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_ads_adskeyword" ADD CONSTRAINT "amazon_ads_adskeyword_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "amazon_ads_adscampaign" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_ads_adstarget" ADD CONSTRAINT "amazon_ads_adstarget_ad_group_id_fk" FOREIGN KEY ("ad_group_id") REFERENCES "amazon_ads_adsadgroup" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_ads_adstarget" ADD CONSTRAINT "amazon_ads_adstarget_amazon_account_id_fk" FOREIGN KEY ("amazon_account_id") REFERENCES "amazon_ads_amazonadsaccount" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_ads_adstarget" ADD CONSTRAINT "amazon_ads_adstarget_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "amazon_ads_adscampaign" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_ads_adsbudgetrule" ADD CONSTRAINT "amazon_ads_adsbudgetrule_amazon_account_id_fk" FOREIGN KEY ("amazon_account_id") REFERENCES "amazon_ads_amazonadsaccount" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_ads_adsnegativekeyword" ADD CONSTRAINT "amazon_ads_adsnegativekeyword_ad_group_id_fk" FOREIGN KEY ("ad_group_id") REFERENCES "amazon_ads_adsadgroup" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_ads_adsnegativekeyword" ADD CONSTRAINT "amazon_ads_adsnegativekeyword_amazon_account_id_fk" FOREIGN KEY ("amazon_account_id") REFERENCES "amazon_ads_amazonadsaccount" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_ads_adsnegativekeyword" ADD CONSTRAINT "amazon_ads_adsnegativekeyword_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "amazon_ads_adscampaign" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_ads_adsoptimizationrule" ADD CONSTRAINT "amazon_ads_adsoptimizationrule_amazon_account_id_fk" FOREIGN KEY ("amazon_account_id") REFERENCES "amazon_ads_amazonadsaccount" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_amazontransaction" ADD CONSTRAINT "amazon_auth_amazontransaction_amazon_account_id_fk" FOREIGN KEY ("amazon_account_id") REFERENCES "amazon_auth_amazonaccount" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_amazontransactionrelatedidentifier" ADD CONSTRAINT "amazon_auth_amazontransactionrelatedidentifier_transaction_id_f" FOREIGN KEY ("transaction_id") REFERENCES "amazon_auth_amazontransaction" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_amazontransactionbreakdown" ADD CONSTRAINT "amazon_auth_amazontransactionbreakdown_parent_id_fk" FOREIGN KEY ("parent_id") REFERENCES "amazon_auth_amazontransactionbreakdown" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_amazontransactionbreakdown" ADD CONSTRAINT "amazon_auth_amazontransactionbreakdown_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "amazon_auth_amazontransaction" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_amazontransactioncontext" ADD CONSTRAINT "amazon_auth_amazontransactioncontext_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "amazon_auth_amazontransaction" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "user_auth_userprofile" ADD CONSTRAINT "user_auth_userprofile_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "user_auth_userprofile" ADD CONSTRAINT "user_auth_userprofile_subscriptiontype_id_fk" FOREIGN KEY ("subscriptiontype_id") REFERENCES "user_auth_subscriptionplan" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "subscription_usersubscription" ADD CONSTRAINT "subscription_usersubscription_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "subscription_usersubscription" ADD CONSTRAINT "subscription_usersubscription_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "user_auth_subscriptionplan" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "user_auth_submodule" ADD CONSTRAINT "user_auth_submodule_module_id_fk" FOREIGN KEY ("module_id") REFERENCES "user_auth_module" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "user_auth_usermodulepermission" ADD CONSTRAINT "user_auth_usermodulepermission_module_id_fk" FOREIGN KEY ("module_id") REFERENCES "user_auth_module" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "user_auth_usermodulepermission" ADD CONSTRAINT "user_auth_usermodulepermission_submodule_id_fk" FOREIGN KEY ("submodule_id") REFERENCES "user_auth_submodule" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "user_auth_usermodulepermission" ADD CONSTRAINT "user_auth_usermodulepermission_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "user_auth_notification" ADD CONSTRAINT "user_auth_notification_created_by_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "user_auth_usernotification" ADD CONSTRAINT "user_auth_usernotification_notification_id_fk" FOREIGN KEY ("notification_id") REFERENCES "user_auth_notification" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "user_auth_usernotification" ADD CONSTRAINT "user_auth_usernotification_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_ads_adsnegativetarget" ADD CONSTRAINT "amazon_ads_adsnegativetarget_ad_group_id_fk" FOREIGN KEY ("ad_group_id") REFERENCES "amazon_ads_adsadgroup" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_ads_adsnegativetarget" ADD CONSTRAINT "amazon_ads_adsnegativetarget_amazon_account_id_fk" FOREIGN KEY ("amazon_account_id") REFERENCES "amazon_ads_amazonadsaccount" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_ads_adsnegativetarget" ADD CONSTRAINT "amazon_ads_adsnegativetarget_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "amazon_ads_adscampaign" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_ads_adsportfolio" ADD CONSTRAINT "amazon_ads_adsportfolio_amazon_account_id_fk" FOREIGN KEY ("amazon_account_id") REFERENCES "amazon_ads_amazonadsaccount" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "myntra_myntraconnection" ADD CONSTRAINT "myntra_myntraconnection_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "user_auth_supportticket" ADD CONSTRAINT "user_auth_supportticket_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "user_auth_subuser" ADD CONSTRAINT "user_auth_subuser_parent_id_fk" FOREIGN KEY ("parent_id") REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "user_auth_subuser" ADD CONSTRAINT "user_auth_subuser_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "user_auth_subscriptionplan_modules" ADD CONSTRAINT "user_auth_subscriptionplan_modules_subscriptionplan_id_fk" FOREIGN KEY ("subscriptionplan_id") REFERENCES "user_auth_subscriptionplan" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "user_auth_subscriptionplan_modules" ADD CONSTRAINT "user_auth_subscriptionplan_modules_module_id_fk" FOREIGN KEY ("module_id") REFERENCES "user_auth_module" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "user_auth_subscriptionplan_submodules" ADD CONSTRAINT "user_auth_subscriptionplan_submodules_subscriptionplan_id_fk" FOREIGN KEY ("subscriptionplan_id") REFERENCES "user_auth_subscriptionplan" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "user_auth_subscriptionplan_submodules" ADD CONSTRAINT "user_auth_subscriptionplan_submodules_submodule_id_fk" FOREIGN KEY ("submodule_id") REFERENCES "user_auth_submodule" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_order" ADD CONSTRAINT "amazon_auth_order_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_order" ADD CONSTRAINT "amazon_auth_order_amazon_account_id_fk" FOREIGN KEY ("amazon_account_id") REFERENCES "amazon_auth_amazonaccount" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_orderitem" ADD CONSTRAINT "amazon_auth_orderitem_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "amazon_auth_order" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "myntra_myntrareturn" ADD CONSTRAINT "myntra_myntrareturn_myntra_connection_id_fk" FOREIGN KEY ("myntra_connection_id") REFERENCES "myntra_myntraconnection" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "myntra_myntrareportqueue" ADD CONSTRAINT "myntra_myntrareportqueue_myntra_connection_id_fk" FOREIGN KEY ("myntra_connection_id") REFERENCES "myntra_myntraconnection" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "myntra_myntralisting" ADD CONSTRAINT "myntra_myntralisting_myntra_connection_id_fk" FOREIGN KEY ("myntra_connection_id") REFERENCES "myntra_myntraconnection" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "myntra_myntraorder" ADD CONSTRAINT "myntra_myntraorder_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "myntra_myntraorder" ADD CONSTRAINT "myntra_myntraorder_myntra_connection_id_fk" FOREIGN KEY ("myntra_connection_id") REFERENCES "myntra_myntraconnection" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "amazon_auth_exportedreport" ADD CONSTRAINT "amazon_auth_exportedreport_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "myntra_myntrapaymenttransaction" ADD CONSTRAINT "myntra_myntrapaymenttransaction_myntra_connection_id_fk" FOREIGN KEY ("myntra_connection_id") REFERENCES "myntra_myntraconnection" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "admin_auth_apicalllog" ADD CONSTRAINT "admin_auth_apicalllog_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED;

-- ===== indexes =====
CREATE UNIQUE INDEX "auth_group_permissions_group_id_permission_id_0cd325b0_uniq" ON "auth_group_permissions" ("group_id", "permission_id");
CREATE INDEX "auth_group_permissions_group_id_b120cbf9" ON "auth_group_permissions" ("group_id");
CREATE INDEX "auth_group_permissions_permission_id_84c5c92e" ON "auth_group_permissions" ("permission_id");
CREATE UNIQUE INDEX "auth_user_groups_user_id_group_id_94350c0c_uniq" ON "auth_user_groups" ("user_id", "group_id");
CREATE INDEX "auth_user_groups_user_id_6a12ed8b" ON "auth_user_groups" ("user_id");
CREATE INDEX "auth_user_groups_group_id_97559544" ON "auth_user_groups" ("group_id");
CREATE UNIQUE INDEX "auth_user_user_permissions_user_id_permission_id_14a6b632_uniq" ON "auth_user_user_permissions" ("user_id", "permission_id");
CREATE INDEX "auth_user_user_permissions_user_id_a95ead1b" ON "auth_user_user_permissions" ("user_id");
CREATE INDEX "auth_user_user_permissions_permission_id_1fbb5f2c" ON "auth_user_user_permissions" ("permission_id");
CREATE INDEX "django_admin_log_content_type_id_c4bce8eb" ON "django_admin_log" ("content_type_id");
CREATE INDEX "django_admin_log_user_id_c564eba6" ON "django_admin_log" ("user_id");
CREATE UNIQUE INDEX "django_content_type_app_label_model_76bd3d3b_uniq" ON "django_content_type" ("app_label", "model");
CREATE UNIQUE INDEX "auth_permission_content_type_id_codename_01ab375a_uniq" ON "auth_permission" ("content_type_id", "codename");
CREATE INDEX "auth_permission_content_type_id_2f476e4b" ON "auth_permission" ("content_type_id");
CREATE INDEX "django_session_expire_date_a5c62663" ON "django_session" ("expire_date");
CREATE INDEX "user_auth_passwordresetrequest_user_id_e835a0ce" ON "user_auth_passwordresetrequest" ("user_id");
CREATE INDEX "amazon_auth_amazonaccount_user_id_aea220fa" ON "amazon_auth_amazonaccount" ("user_id");
CREATE INDEX "amazon_auth_report_user_id_53fe17d3" ON "amazon_auth_report" ("user_id");
CREATE INDEX "amazon_auth_report_amazon_account_id_15e77523" ON "amazon_auth_report" ("amazon_account_id");
CREATE UNIQUE INDEX "amazon_auth_report_amazon_account_id_amazon_report_id_3ed09b8a_uniq" ON "amazon_auth_report" ("amazon_account_id", "amazon_report_id");
CREATE INDEX "amazon_auth_adreport_sku_fac4458d" ON "amazon_auth_adreport" ("sku");
CREATE INDEX "amazon_auth_adreport_date_cd8a68d7" ON "amazon_auth_adreport" ("date");
CREATE INDEX "amazon_auth_sku_ad0916_idx" ON "amazon_auth_adreport" ("sku");
CREATE INDEX "amazon_auth_date_cc6589_idx" ON "amazon_auth_adreport" ("date");
CREATE UNIQUE INDEX "amazon_auth_adcampaign_amazon_account_id_campaign_id_de9869cf_uniq" ON "amazon_auth_adcampaign" ("amazon_account_id", "campaign_id");
CREATE INDEX "amazon_auth_adcampaign_campaign_id_bc611e76" ON "amazon_auth_adcampaign" ("campaign_id");
CREATE INDEX "amazon_auth_adcampaign_amazon_account_id_463a858b" ON "amazon_auth_adcampaign" ("amazon_account_id");
CREATE INDEX "amazon_auth_adcampaign_user_id_9faf8bae" ON "amazon_auth_adcampaign" ("user_id");
CREATE UNIQUE INDEX "amazon_auth_adcampaignmetrics_campaign_id_date_131e854a_uniq" ON "amazon_auth_adcampaignmetrics" ("campaign_id", "date");
CREATE INDEX "amazon_auth_adcampaignmetrics_date_f8e2ab82" ON "amazon_auth_adcampaignmetrics" ("date");
CREATE INDEX "amazon_auth_adcampaignmetrics_campaign_id_62718df8" ON "amazon_auth_adcampaignmetrics" ("campaign_id");
CREATE INDEX "amazon_auth_amazonreport_account_id_6e216137" ON "amazon_auth_amazonreport" ("account_id");
CREATE UNIQUE INDEX "amazon_auth_settlementordersummary_amazon_account_id_amazon_order_id_data_start_time_data_end_time_365886d4_uniq" ON "amazon_auth_settlementordersummary" ("amazon_account_id", "amazon_order_id", "data_start_time", "data_end_time");
CREATE INDEX "amazon_auth_settlementordersummary_amazon_order_id_8cca4dc6" ON "amazon_auth_settlementordersummary" ("amazon_order_id");
CREATE INDEX "amazon_auth_settlementordersummary_amazon_account_id_46122c0d" ON "amazon_auth_settlementordersummary" ("amazon_account_id");
CREATE INDEX "amazon_auth_settlementordersummary_user_id_4835af38" ON "amazon_auth_settlementordersummary" ("user_id");
CREATE INDEX "amazon_auth_amazon__a2e8f2_idx" ON "amazon_auth_settlementordersummary" ("amazon_order_id");
CREATE INDEX "amazon_auth_data_st_f0ddb5_idx" ON "amazon_auth_settlementordersummary" ("data_start_time", "data_end_time");
CREATE INDEX "amazon_auth_missingcatalogqueue_account_id_f3ada955" ON "amazon_auth_missingcatalogqueue" ("account_id");
CREATE INDEX "amazon_auth_productmapping_account_id_7d7ff80b" ON "amazon_auth_productmapping" ("account_id");
CREATE UNIQUE INDEX "amazon_auth_missingcatalogqueue_seller_sku_account_id_093b2ba2_uniq" ON "amazon_auth_missingcatalogqueue" ("seller_sku", "account_id");
CREATE UNIQUE INDEX "amazon_auth_productmapping_seller_sku_account_id_7c5dcf99_uniq" ON "amazon_auth_productmapping" ("seller_sku", "account_id");
CREATE INDEX "amazon_auth_returnitem_amazon_order_id_b8938688" ON "amazon_auth_returnitem" ("amazon_order_id");
CREATE INDEX "amazon_auth_returnitem_seller_sku_7051f0b3" ON "amazon_auth_returnitem" ("seller_sku");
CREATE INDEX "amazon_auth_returnitem_amazon_account_id_b77a93e5" ON "amazon_auth_returnitem" ("amazon_account_id");
CREATE INDEX "amazon_auth_returnitem_user_id_794ac029" ON "amazon_auth_returnitem" ("user_id");
CREATE INDEX "amazon_auth_businessreport_amazon_account_id_75e3110d" ON "amazon_auth_businessreport" ("amazon_account_id");
CREATE INDEX "amazon_auth_businessreport_user_id_20010748" ON "amazon_auth_businessreport" ("user_id");
CREATE UNIQUE INDEX "amazon_auth_financialevent_amazon_account_id_unique_hash_7886bc5d_uniq" ON "amazon_auth_financialevent" ("amazon_account_id", "unique_hash");
CREATE INDEX "amazon_auth_financialevent_user_id_c33ae4bc" ON "amazon_auth_financialevent" ("user_id");
CREATE INDEX "amazon_auth_financialevent_amazon_account_id_b61364c8" ON "amazon_auth_financialevent" ("amazon_account_id");
CREATE INDEX "amazon_auth_amazon__002321_idx" ON "amazon_auth_financialevent" ("amazon_account_id");
CREATE INDEX "amazon_auth_posted__85e6e7_idx" ON "amazon_auth_financialevent" ("posted_date");
CREATE INDEX "amazon_auth_amazon__306543_idx" ON "amazon_auth_financialevent" ("amazon_order_id");
CREATE INDEX "amazon_auth_reportrequest_amazon_account_id_e0954347" ON "amazon_auth_reportrequest" ("amazon_account_id");
CREATE INDEX "amazon_auth_amazon__0f3c18_idx" ON "amazon_auth_reportrequest" ("amazon_account_id", "report_type");
CREATE INDEX "amazon_auth_amazonestimatedfee_seller_sku_cd1b3d2d" ON "amazon_auth_amazonestimatedfee" ("seller_sku");
CREATE INDEX "amazon_auth_amazonestimatedfee_order_item_id_96dcf661" ON "amazon_auth_amazonestimatedfee" ("order_item_id");
CREATE INDEX "amazon_auth_seller__c0d971_idx" ON "amazon_auth_amazonestimatedfee" ("seller_sku");
CREATE INDEX "amazon_auth_asin_462f81_idx" ON "amazon_auth_amazonestimatedfee" ("asin");
CREATE INDEX "amazon_auth_amazonestimatedfee_amazon_account_id_9000099b" ON "amazon_auth_amazonestimatedfee" ("amazon_account_id");
CREATE INDEX "amazon_ads_amazonadsaccount_user_id_78523162" ON "amazon_ads_amazonadsaccount" ("user_id");
CREATE INDEX "amazon_ads_amazonadsaccount_amazon_account_id_2933bf22" ON "amazon_ads_amazonadsaccount" ("amazon_account_id");
CREATE INDEX "amazon_ads_adscampaign_amazon_account_id_778478d5" ON "amazon_ads_adscampaign" ("amazon_account_id");
CREATE UNIQUE INDEX "amazon_ads_campaignmetric_campaign_id_report_date_14d53777_uniq" ON "amazon_ads_campaignmetric" ("campaign_id", "report_date");
CREATE INDEX "amazon_ads_campaignmetric_campaign_id_3d060e32" ON "amazon_ads_campaignmetric" ("campaign_id");
CREATE INDEX "amazon_ads_adsadgroup_amazon_account_id_df12e4fc" ON "amazon_ads_adsadgroup" ("amazon_account_id");
CREATE INDEX "amazon_ads_adsadgroup_campaign_id_f91ae6f7" ON "amazon_ads_adsadgroup" ("campaign_id");
CREATE INDEX "amazon_ads_adsreportlog_amazon_account_id_bc0022a3" ON "amazon_ads_adsreportlog" ("amazon_account_id");
CREATE INDEX "amazon_ads_adsproductad_ad_group_id_eac758b4" ON "amazon_ads_adsproductad" ("ad_group_id");
CREATE INDEX "amazon_ads_adsproductad_amazon_account_id_a7b59106" ON "amazon_ads_adsproductad" ("amazon_account_id");
CREATE INDEX "amazon_ads_adsproductad_campaign_id_459c28ab" ON "amazon_ads_adsproductad" ("campaign_id");
CREATE INDEX "amazon_ads_targetmetric_target_id_eb905890" ON "amazon_ads_targetmetric" ("target_id");
CREATE INDEX "amazon_ads_searchtermmetric_campaign_id_af31b3c1" ON "amazon_ads_searchtermmetric" ("campaign_id");
CREATE INDEX "amazon_ads_productadmetric_product_ad_id_791b0d97" ON "amazon_ads_productadmetric" ("product_ad_id");
CREATE UNIQUE INDEX "amazon_ads_keywordmetric_keyword_id_report_date_dbf27982_uniq" ON "amazon_ads_keywordmetric" ("keyword_id", "report_date");
CREATE INDEX "amazon_ads_keywordmetric_keyword_id_3bc75ee9" ON "amazon_ads_keywordmetric" ("keyword_id");
CREATE UNIQUE INDEX "amazon_auth_productpricing_user_id_asin_sku_77c28b11_uniq" ON "amazon_auth_productpricing" ("user_id", "asin", "sku");
CREATE INDEX "amazon_auth_productpricing_user_id_95a7a229" ON "amazon_auth_productpricing" ("user_id");
CREATE UNIQUE INDEX "amazon_auth_amazoncatalogdetails_user_id_asin_marketplace_id_a335553c_uniq" ON "amazon_auth_amazoncatalogdetails" ("user_id", "asin", "marketplace_id");
CREATE INDEX "amazon_auth_amazoncatalogdetails_asin_d03f3a19" ON "amazon_auth_amazoncatalogdetails" ("asin");
CREATE INDEX "amazon_auth_amazoncatalogdetails_user_id_f1618d3f" ON "amazon_auth_amazoncatalogdetails" ("user_id");
CREATE UNIQUE INDEX "amazon_auth_amazonlistingitem_amazon_account_id_sku_marketplace_id_7974fdb8_uniq" ON "amazon_auth_amazonlistingitem" ("amazon_account_id", "sku", "marketplace_id");
CREATE INDEX "amazon_auth_amazonlistingitem_sku_36340b3a" ON "amazon_auth_amazonlistingitem" ("sku");
CREATE INDEX "amazon_auth_amazonlistingitem_amazon_account_id_b3a59b52" ON "amazon_auth_amazonlistingitem" ("amazon_account_id");
CREATE INDEX "amazon_auth_amazonlistingitem_user_id_575ec01b" ON "amazon_auth_amazonlistingitem" ("user_id");
CREATE INDEX "amazon_ads_adskeyword_ad_group_id_d5b1afcb" ON "amazon_ads_adskeyword" ("ad_group_id");
CREATE INDEX "amazon_ads_adskeyword_amazon_account_id_572f6851" ON "amazon_ads_adskeyword" ("amazon_account_id");
CREATE INDEX "amazon_ads_adskeyword_campaign_id_5e46d0af" ON "amazon_ads_adskeyword" ("campaign_id");
CREATE INDEX "amazon_ads_adstarget_ad_group_id_8b23fce8" ON "amazon_ads_adstarget" ("ad_group_id");
CREATE INDEX "amazon_ads_adstarget_amazon_account_id_8d5cdbde" ON "amazon_ads_adstarget" ("amazon_account_id");
CREATE INDEX "amazon_ads_adstarget_campaign_id_2177055b" ON "amazon_ads_adstarget" ("campaign_id");
CREATE UNIQUE INDEX "amazon_ads_adsbudgetrule_amazon_account_id_budget_rule_id_rule_type_cde16d3d_uniq" ON "amazon_ads_adsbudgetrule" ("amazon_account_id", "budget_rule_id", "rule_type");
CREATE INDEX "amazon_ads_adsbudgetrule_amazon_account_id_45a950b1" ON "amazon_ads_adsbudgetrule" ("amazon_account_id");
CREATE UNIQUE INDEX "amazon_ads_adsnegativekeyword_amazon_account_id_negative_keyword_id_5e719565_uniq" ON "amazon_ads_adsnegativekeyword" ("amazon_account_id", "negative_keyword_id");
CREATE INDEX "amazon_ads_adsnegativekeyword_ad_group_id_4656b440" ON "amazon_ads_adsnegativekeyword" ("ad_group_id");
CREATE INDEX "amazon_ads_adsnegativekeyword_amazon_account_id_1b24b79b" ON "amazon_ads_adsnegativekeyword" ("amazon_account_id");
CREATE INDEX "amazon_ads_adsnegativekeyword_campaign_id_cc9c001b" ON "amazon_ads_adsnegativekeyword" ("campaign_id");
CREATE INDEX "amazon_ads_adsoptimizationrule_amazon_account_id_9923b911" ON "amazon_ads_adsoptimizationrule" ("amazon_account_id");
CREATE INDEX "amazon_auth_amazontransaction_amazon_account_id_16510ec2" ON "amazon_auth_amazontransaction" ("amazon_account_id");
CREATE INDEX "amazon_auth_amazontransactionrelatedidentifier_transaction_id_22fb68bf" ON "amazon_auth_amazontransactionrelatedidentifier" ("transaction_id");
CREATE INDEX "amazon_auth_amazontransactionbreakdown_parent_id_85c0a2db" ON "amazon_auth_amazontransactionbreakdown" ("parent_id");
CREATE INDEX "amazon_auth_amazontransactionbreakdown_transaction_id_d44dc5a8" ON "amazon_auth_amazontransactionbreakdown" ("transaction_id");
CREATE INDEX "amazon_auth_amazontransactioncontext_transaction_id_5508a17b" ON "amazon_auth_amazontransactioncontext" ("transaction_id");
CREATE INDEX "user_auth_userprofile_subscriptiontype_id_18570807" ON "user_auth_userprofile" ("subscriptiontype_id");
CREATE INDEX "subscription_usersubscription_user_id_048d06cb" ON "subscription_usersubscription" ("user_id");
CREATE INDEX "subscription_usersubscription_plan_id_255093e2" ON "subscription_usersubscription" ("plan_id");
CREATE UNIQUE INDEX "user_auth_submodule_module_id_name_bed11b85_uniq" ON "user_auth_submodule" ("module_id", "name");
CREATE INDEX "user_auth_submodule_slug_dfa3a52c" ON "user_auth_submodule" ("slug");
CREATE INDEX "user_auth_submodule_module_id_bcdf7ed2" ON "user_auth_submodule" ("module_id");
CREATE UNIQUE INDEX "user_auth_usermodulepermission_user_id_module_id_submodule_id_8b20dca7_uniq" ON "user_auth_usermodulepermission" ("user_id", "module_id", "submodule_id");
CREATE INDEX "user_auth_usermodulepermission_module_id_dc6342ee" ON "user_auth_usermodulepermission" ("module_id");
CREATE INDEX "user_auth_usermodulepermission_submodule_id_fd66610b" ON "user_auth_usermodulepermission" ("submodule_id");
CREATE INDEX "user_auth_usermodulepermission_user_id_7e21f1fe" ON "user_auth_usermodulepermission" ("user_id");
CREATE INDEX "user_auth_notification_created_by_id_e59280d7" ON "user_auth_notification" ("created_by_id");
CREATE UNIQUE INDEX "user_auth_usernotification_user_id_notification_id_280b67f8_uniq" ON "user_auth_usernotification" ("user_id", "notification_id");
CREATE INDEX "user_auth_usernotification_notification_id_9126cf5b" ON "user_auth_usernotification" ("notification_id");
CREATE INDEX "user_auth_usernotification_user_id_6ce9257e" ON "user_auth_usernotification" ("user_id");
CREATE UNIQUE INDEX "amazon_ads_adsnegativetarget_amazon_account_id_negative_target_id_77feca28_uniq" ON "amazon_ads_adsnegativetarget" ("amazon_account_id", "negative_target_id");
CREATE INDEX "amazon_ads_adsnegativetarget_ad_group_id_de5beb99" ON "amazon_ads_adsnegativetarget" ("ad_group_id");
CREATE INDEX "amazon_ads_adsnegativetarget_amazon_account_id_52f904d7" ON "amazon_ads_adsnegativetarget" ("amazon_account_id");
CREATE INDEX "amazon_ads_adsnegativetarget_campaign_id_4ecec947" ON "amazon_ads_adsnegativetarget" ("campaign_id");
CREATE INDEX "amazon_ads_adsportfolio_amazon_account_id_7dfd3bc2" ON "amazon_ads_adsportfolio" ("amazon_account_id");
CREATE UNIQUE INDEX "amazon_ads_adsportfolio_amazon_account_id_portfolio_id_d569c5bf_uniq" ON "amazon_ads_adsportfolio" ("amazon_account_id", "portfolio_id");
CREATE INDEX "user_auth_supportticket_user_id_a03c7093" ON "user_auth_supportticket" ("user_id");
CREATE INDEX "user_auth_subuser_parent_id_24f4539f" ON "user_auth_subuser" ("parent_id");
CREATE UNIQUE INDEX "user_auth_subscriptionplan_modules_subscriptionplan_id_module_id_f7d4fbd3_uniq" ON "user_auth_subscriptionplan_modules" ("subscriptionplan_id", "module_id");
CREATE INDEX "user_auth_subscriptionplan_modules_subscriptionplan_id_54516321" ON "user_auth_subscriptionplan_modules" ("subscriptionplan_id");
CREATE INDEX "user_auth_subscriptionplan_modules_module_id_87f699c9" ON "user_auth_subscriptionplan_modules" ("module_id");
CREATE UNIQUE INDEX "user_auth_subscriptionplan_submodules_subscriptionplan_id_submodule_id_f83100ad_uniq" ON "user_auth_subscriptionplan_submodules" ("subscriptionplan_id", "submodule_id");
CREATE INDEX "user_auth_subscriptionplan_submodules_subscriptionplan_id_18664661" ON "user_auth_subscriptionplan_submodules" ("subscriptionplan_id");
CREATE INDEX "user_auth_subscriptionplan_submodules_submodule_id_9e5d4252" ON "user_auth_subscriptionplan_submodules" ("submodule_id");
CREATE UNIQUE INDEX "amazon_auth_order_amazon_account_id_amazon_order_id_172d0146_uniq" ON "amazon_auth_order" ("amazon_account_id", "amazon_order_id");
CREATE INDEX "amazon_auth_order_user_id_f99ca332" ON "amazon_auth_order" ("user_id");
CREATE INDEX "amazon_auth_order_amazon_account_id_0ed2ceaf" ON "amazon_auth_order" ("amazon_account_id");
CREATE INDEX "amazon_auth_order_channel_fdb89bee" ON "amazon_auth_order" ("channel");
CREATE INDEX "amazon_auth_orderitem_seller_sku_a9d3fe03" ON "amazon_auth_orderitem" ("seller_sku");
CREATE INDEX "amazon_auth_orderitem_order_id_3caa7a66" ON "amazon_auth_orderitem" ("order_id");
CREATE INDEX "amazon_auth_orderitem_parent_sku_5fe23ec0" ON "amazon_auth_orderitem" ("parent_sku");
CREATE INDEX "amazon_auth_seller__9c69ac_idx" ON "amazon_auth_orderitem" ("seller_sku");
CREATE INDEX "amazon_auth_asin_a04e3c_idx" ON "amazon_auth_orderitem" ("asin");
CREATE INDEX "myntra_myntrareturn_myntra_connection_id_b3eb8f59" ON "myntra_myntrareturn" ("myntra_connection_id");
CREATE INDEX "myntra_myntrareportqueue_job_id_7d903046" ON "myntra_myntrareportqueue" ("job_id");
CREATE INDEX "myntra_myntrareportqueue_myntra_connection_id_6c9df8c5" ON "myntra_myntrareportqueue" ("myntra_connection_id");
CREATE INDEX "myntra_myntralisting_myntra_connection_id_aa7e562e" ON "myntra_myntralisting" ("myntra_connection_id");
CREATE UNIQUE INDEX "myntra_myntrareportqueue_myntra_connection_id_report_name_from_date_to_date_ce988fc6_uniq" ON "myntra_myntrareportqueue" ("myntra_connection_id", "report_name", "from_date", "to_date");
CREATE INDEX "myntra_myntraorder_user_id_e7a909dd" ON "myntra_myntraorder" ("user_id");
CREATE INDEX "myntra_myntraorder_myntra_connection_id_b00b05f3" ON "myntra_myntraorder" ("myntra_connection_id");
CREATE INDEX "myntra_myntraorder_seller_order_id_6a30f9f2" ON "myntra_myntraorder" ("seller_order_id");
CREATE INDEX "myntra_myntraorder_seller_sku_code_2d113978" ON "myntra_myntraorder" ("seller_sku_code");
CREATE INDEX "myntra_mynt_seller__ea1e27_idx" ON "myntra_myntraorder" ("seller_order_id");
CREATE INDEX "myntra_mynt_seller__5a4864_idx" ON "myntra_myntraorder" ("seller_sku_code");
CREATE INDEX "myntra_mynt_order_s_8dab3e_idx" ON "myntra_myntraorder" ("order_status");
CREATE INDEX "myntra_mynt_created_15182d_idx" ON "myntra_myntraorder" ("created_on");
CREATE INDEX "amazon_auth_exportedreport_user_id_2a4a79b3" ON "amazon_auth_exportedreport" ("user_id");
CREATE INDEX "myntra_myntrapaymenttransaction_myntra_connection_id_9f0dce7b" ON "myntra_myntrapaymenttransaction" ("myntra_connection_id");
CREATE INDEX "myntra_myntrapaymenttransaction_transaction_key_5daa0cef" ON "myntra_myntrapaymenttransaction" ("transaction_key");
CREATE INDEX "admin_auth_apicalllog_user_id_9f3f2743" ON "admin_auth_apicalllog" ("user_id");

COMMIT;
