import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Switch, Spin } from 'antd';
import {
  HomeOutlined,
  RightOutlined,
  CheckCircleFilled,
  AppstoreOutlined,
  LinkOutlined,
  CalendarOutlined,
} from '@ant-design/icons';

import { getChannels } from '../../redux/Settings/actionCreator';

export default function MarketPlaceSettings() {
  const dispatch = useDispatch();

  const channels = useSelector((state) => state.settings.channels);
  const profile = useSelector((state) => state.auth.profile);

  const [loading, setLoading] = useState(true);
  const [showConnectedOnly, setShowConnectedOnly] = useState(false);

  useEffect(() => {
    dispatch(getChannels());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const userId = profile?.user_id;

  /* ============================================================
     ICON MAP
  ============================================================ */

  const iconMap = {
    amazon: '/icons/amazon.svg',
    amazon_ads: '/icons/amazonAds.png',
    flipkart: '/icons/flipkart.png',
    meesho: '/icons/meesho.png',
    myntra: '/icons/myntra.png',
    ajio: '/icons/ajio.png',
    nykaa: '/icons/nykaa.png',
    shopify: '/icons/shopify.png',
    woocommerce: '/icons/woo.png',
    magento: '/icons/magento.png',
    blinkit: '/icons/blinkit.png',
    zepto: '/icons/zepto.png',
    swiggy: '/icons/swiggy.png',
    tally: '/icons/tally.png',
    zoho: '/icons/zoho.png',
  };

  /* ============================================================
     EXISTING CONNECT FUNCTIONALITY
  ============================================================ */

  const handleConnect = (market) => {
    if (market.id === 'amazon') {
      window.location.href = `https://api.trackmyprofit.com/api/amazon/connect/?user_id=${userId}`;
      return;
    }

    if (market.id === 'amazon_ads') {
      window.location.href = `https://api.trackmyprofit.com/api/amazon-ads/account/connect/?user_id=${userId}`;
      return;
    }

    const statusParam = market.status === 'connected' ? '&status=connected' : '';

    window.location.href = `/admin/settings/user-setting/marketplace-connection?market=${market.id}${statusParam}`;
  };

  /* ============================================================
     MARKETPLACE DATA
  ============================================================ */

  const marketplaceData = Array.isArray(channels) ? channels : [];

  const connectedMarketplaces = useMemo(() => {
    return marketplaceData.filter((market) => market.status === 'connected');
  }, [marketplaceData]);

  const availableMarketplaces = useMemo(() => {
    const data = marketplaceData.filter((market) => market.status !== 'connected');

    return data;
  }, [marketplaceData]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#18233F]">
      <Spin spinning={loading} size="large">
        <main className="px-5 min-sm:px-6 min-lg:px-5 min-xl:px-5 py-5 pb-10">
          {/* =====================================================
              PAGE HEADER
          ====================================================== */}

          <div className="mb-2">
            <div className="flex items-center gap-2 text-[12px] text-[#667085] mb-3">
              <HomeOutlined className="text-[#667085]" />

              <span>Settings</span>

              <RightOutlined className="text-[8px] text-[#98A2B3]" />

              <span>Marketplace Settings</span>
            </div>

            {/* Header */}
            <div className="flex flex-col gap-4 min-sm:flex-row min-sm:items-start min-sm:justify-between">
              <div>
                <h1 className="text-[21px] mb-0 min-sm:text-[23px] font-bold tracking-[-0.4px] text-[#18233F]">
                  Marketplace Settings
                </h1>

                <p className="max-w-[520px] text-[12px] leading-[19px] text-[#667085]">
                  Connect and manage your marketplace accounts to sync data and track performance.
                </p>
              </div>

              {/* Show Connected Only */}
              <div className="flex items-center gap-2 shrink-0 min-sm:pt-2">
                <span className="text-[13px] font-medium text-[#344054] whitespace-nowrap">Show Connected Only</span>

                <Switch checked={showConnectedOnly} onChange={setShowConnectedOnly} className="marketplace-switch" />
              </div>
            </div>
          </div>

          {/* ====CONNECTED MARKETPLACES=============== */}

          {!showConnectedOnly && (
            <section className="bg-white rounded-[11px] border border-[#E9EDF3] shadow-[0_2px_10px_rgba(16,24,40,0.035)] mb-3">
              {/* Section Header */}
              <div className="px-4 min-sm:px-5 pt-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-[21px] h-[21px] rounded-full border border-[#35A982] flex items-center justify-center mb-0">
                    <LinkOutlined className="text-[#15956D] text-[11px]" />
                  </div>

                  <h2 className="text-[15px] font-bold text-[#18233F]">
                    Connected Marketplaces
                    <span className="ml-1">({connectedMarketplaces.length})</span>
                  </h2>
                </div>

                <div className="mt-1 w-[40px] h-[2px] bg-[#31A77F]" />
              </div>

              {/* Connected Cards */}

              <div className="px-3.5 min-sm:px-4 pb-4 pt-2.5">
                {connectedMarketplaces.length === 0 ? (
                  <div className="flex items-center justify-center py-10 text-[12px] text-[#98A2B3]">
                    No connected marketplaces found
                  </div>
                ) : (
                  <div
                    className="
                      grid
                      grid-cols-1
                      min-md:grid-cols-2
                      min-lg:grid-cols-3
                      min-xl:grid-cols-4
                      gap-3.5
                    "
                  >
                    {connectedMarketplaces.map((market) => (
                      <ConnectedMarketplaceCard
                        key={market.id}
                        market={market}
                        iconMap={iconMap}
                        onManage={handleConnect}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* =====================================================
              AVAILABLE MARKETPLACES
          ====================================================== */}

          {!showConnectedOnly && (
            <section className="bg-white rounded-[11px] border border-[#E9EDF3] shadow-[0_2px_10px_rgba(16,24,40,0.035)]">
              {/* Header */}
              <div className="px-4 min-sm:px-5 pt-4">
                <div className="flex flex-col gap-3 min-sm:flex-row min-sm:items-center min-sm:justify-between">
                  {/* Title */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-[21px] h-[21px] flex items-center justify-center mb-1">
                      <AppstoreOutlined className="text-[#087A5A] text-[18px]" />
                    </div>

                    <h2 className="text-[14px] font-bold text-[#18233F]">
                      Available Marketplaces
                      <span className="ml-1">({availableMarketplaces.length})</span>
                    </h2>
                  </div>
                </div>

                <div className="mt-0 w-[28px] h-[2px] bg-[#087A5A]" />
              </div>

              {/* Available Cards */}

              <div className="px-3.5 min-sm:px-4 pb-4 pt-2.5">
                {availableMarketplaces.length === 0 ? (
                  <div className="flex items-center justify-center py-10 text-[12px] text-[#98A2B3]">
                    No marketplaces found
                  </div>
                ) : (
                  <div
                    className="
                      grid
                      grid-cols-1
                      min-md:grid-cols-2
                      min-lg:grid-cols-3
                      gap-3.5
                    "
                  >
                    {availableMarketplaces.map((market) => (
                      <AvailableMarketplaceCard
                        key={market.id}
                        market={market}
                        iconMap={iconMap}
                        onConnect={handleConnect}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* =====================================================
              SHOW CONNECTED ONLY VIEW
          ====================================================== */}

          {showConnectedOnly && (
            <section className="bg-white rounded-[11px] border border-[#E9EDF3] shadow-[0_2px_10px_rgba(16,24,40,0.035)]">
              <div className="px-4 min-sm:px-5 pt-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-[21px] h-[21px] rounded-full border border-[#35A982] flex items-center justify-center mb-0">
                    <LinkOutlined className="text-[#15956D] text-[11px]" />
                  </div>

                  <h2 className="text-[15px] font-bold text-[#18233F]">
                    Connected Marketplaces
                    <span className="ml-1">({connectedMarketplaces.length})</span>
                  </h2>
                </div>

                <div className="mt-1 w-[40px] h-[2px] bg-[#31A77F]" />
              </div>

              <div className="px-3.5 min-sm:px-4 pb-4 pt-2.5">
                {connectedMarketplaces.length === 0 ? (
                  <div className="flex items-center justify-center py-14 text-[12px] text-[#98A2B3]">
                    No connected marketplaces found
                  </div>
                ) : (
                  <div
                    className="
                      grid
                      grid-cols-1
                      min-md:grid-cols-2
                      min-lg:grid-cols-3
                      min-xl:grid-cols-4
                      gap-3.5
                    "
                  >
                    {connectedMarketplaces.map((market) => (
                      <ConnectedMarketplaceCard
                        key={market.id}
                        market={market}
                        iconMap={iconMap}
                        onManage={handleConnect}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </main>
      </Spin>

      {/* =========================================================
          SWITCH CSS
      ========================================================== */}

      <style>
        {`
          .marketplace-switch.ant-switch {
            background: #D0D5DD;
            min-width: 29px;
            height: 17px;
          }

          .marketplace-switch.ant-switch-checked {
            background: #15956D;
          }

          .marketplace-switch.ant-switch .ant-switch-handle {
            width: 13px;
            height: 13px;
            top: 2px;
          }

          .marketplace-switch.ant-switch-checked .ant-switch-handle {
            inset-inline-start: calc(100% - 15px);
          }

          .marketplace-switch.ant-switch .ant-switch-inner {
            display: none;
          }
        `}
      </style>
    </div>
  );
}

/* ================================================================
   CONNECTED MARKETPLACE CARD
================================================================ */

function ConnectedMarketplaceCard({ market, iconMap, onManage }) {
  return (
    <div
      className="
        group
        min-h-[139px]
        rounded-[9px]
        border
        border-[#E9EDF3]
        bg-white
        px-4
        py-3
        flex
    flex-col
        transition-all
        duration-200
        hover:border-[#B8DFD1]
        hover:shadow-[0_4px_14px_rgba(16,24,40,0.06)]
      "
    >
      {/* Logo + Name */}

      <div className="flex items-start gap-3">
        <div className="w-[51px] h-[51px] shrink-0 rounded-[9px] border border-[#EDF0F3] bg-white flex items-center justify-center p-2 shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
          <img src={iconMap[market.id]} alt={market.name} className="max-w-full max-h-full object-contain" />
        </div>

        <div className="min-w-0 flex-1 pt-1">
          <div className="flex items-start gap-1.5">
            <h3 className="text-[14px] font-bold text-[#18233F] truncate">{market.name}</h3>

            <CheckCircleFilled className="shrink-0 text-[#087A5A] text-[13px] mt-[1px]" />
          </div>

          {market.id === 'amazon' && (
            <span
              className="
                inline-flex
                mt-1
                bg-[#E3F6EE]
                text-[#087A5A]
                text-[11px]
                font-semibold
                px-1.5
                py-[2px]
                rounded-[3px]
              "
            >
              Primary Account
            </span>
          )}
        </div>
      </div>

      {/* Connected Date */}

      <div className="flex items-center gap-1.5 mt-2.5">
        <CalendarOutlined className="text-[11px] text-[#667085]" />

        <span className="text-[11px] text-[#667085]">Connected on</span>

        <span className="text-[11px] font-medium text-[#475467]">
          {market.connectedDate || market.connected_on || '12 Aug 2025'}
        </span>
      </div>

      {/* Actions */}

      <div className="mt-auto pt-2.5">
        <button
          type="button"
          onClick={() => onManage(market)}
          className="
        w-full
        h-[25px]
        rounded-[5px]
        border
        border-[#15956D]
        bg-white
        text-[#087A5A]
        text-[11px]
        font-semibold
        hover:bg-[#EAF8F3]
        transition-colors
      "
        >
          Manage
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   AVAILABLE MARKETPLACE CARD
================================================================ */

function AvailableMarketplaceCard({ market, iconMap, onConnect }) {
  return (
    <div
      className="
        group
        min-h-[100px]
        rounded-[9px]
        border
        border-[#E9EDF3]
        bg-white
        px-3.5
        py-3
        flex
        items-center
        gap-3
        transition-all
        duration-200
        hover:border-[#B8DFD1]
        hover:shadow-[0_4px_14px_rgba(16,24,40,0.06)]
      "
    >
      {/* Logo */}

      <div
        className="
          w-[43px]
          h-[43px]
          shrink-0
          rounded-[8px]
          bg-[#F8FAFC]
          flex
          items-center
          justify-center
          p-1.5
        "
      >
        <img src={iconMap[market.id]} alt={market.name} className="max-w-full max-h-full object-contain" />
      </div>

      {/* Content */}

      <div className="min-w-0 flex-1">
        <h3 className="text-[14px] font-bold text-[#18233F] truncate">{market.name}</h3>

        <p className="text-[11px] leading-[15px] text-[#667085] mt-1 line-clamp-2">
          {market.description || `Connect your ${market.name} seller account to import orders and track performance.`}
        </p>
      </div>

      {/* Connect */}

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onConnect(market)}
          className="
            h-[24px]
            min-w-[49px]
            px-2.5
            rounded-[4px]
            bg-[#087A5A]
            hover:bg-[#056347]
            text-white
            text-[11px]
            font-semibold
            transition-colors
            shadow-[0_1px_2px_rgba(16,24,40,0.08)]
          "
        >
          Connect
        </button>

        <RightOutlined
          className="
            text-[9px]
            text-[#475467]
            group-hover:text-[#087A5A]
            transition-colors
          "
        />
      </div>
    </div>
  );
}
