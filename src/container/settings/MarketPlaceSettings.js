import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Switch, Button, Spin } from 'antd';
import { getChannels } from '../../redux/Settings/actionCreator';
import { PageHeader } from '../../components/page-headers/page-headers';

// Import Local Icons
import amazonIcon from '../../assets/icons/amazon.svg';
import amazonAds from '../../assets/icons/amazonAds.png';
import flipkartIcon from '../../assets/icons/flipkart.png';
import meeshoIcon from '../../assets/icons/meesho.png';
import myntraIcon from '../../assets/icons/myntra.png';
import ajioIcon from '../../assets/icons/ajio.png';
import nykaaIcon from '../../assets/icons/nykaa.png';
import shopifyIcon from '../../assets/icons/shopify.png';
import wooIcon from '../../assets/icons/woo.png';
import magentoIcon from '../../assets/icons/magento.png';
import blinkitIcon from '../../assets/icons/blinkit.png';
import zeptoIcon from '../../assets/icons/zepto.png';
import swiggyIcon from '../../assets/icons/swiggy.png';
import tallyIcon from '../../assets/icons/tally.png';
import zohoIcon from '../../assets/icons/zoho.png';

export default function MarketPlaceSettings() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getChannels());
  }, []);
  const channels = useSelector((state) => state.settings.channels);
  const [loading, setLoading] = useState(true);
  const profile = useSelector((state) => state.auth.profile);
  // console.log('dddddddddddddddd', profile);
  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);
  const [showConnectedOnly, setShowConnectedOnly] = useState(false);
  // const [modalVisible, setModalVisible] = useState(false);
  // const [selectedMarketplace, setSelectedMarketplace] = useState(null);
  // const [showForm, setShowForm] = useState(false);
  // const [form] = Form.useForm();

  const PageRoutes = [
    {
      path: 'index',
      breadcrumbName: 'Settings',
    },
    {
      path: '',
      breadcrumbName: 'User Settings',
    },
    {
      path: '',
      breadcrumbName: 'MarketPlace Settings',
    },
  ];
  const filteredMarketplaces = showConnectedOnly
    ? (channels || []).filter((m) => m.status === 'connected')
    : channels || [];
  const userId = profile?.user_id;

  const handleConnect = (market) => {
    if (market.id === 'amazon') {
      // window.location.href = 'https://372nmlsj-8000.inc1.devtunnels.ms/api/amazon/connect/';
      // window.location.href = `https://372nmlsj-8000.inc1.devtunnels.ms/api/amazon/connect/?user_id=${userId}`;
      window.location.href = `https://api.trackmyprofit.com/api/amazon/connect/?user_id=${userId}`;

      return;
    }
    if (market.id === 'amazon_ads') {
      window.location.href = `https://372nmlsj-8000.inc1.devtunnels.ms/api/amazon-ads/account/connect/?user_id=${userId}`;
      return;
    }

    // Open the dedicated connection page in a new tag
    // In a real app, you might pass the market ID as a query param, e.g. ?market=flipkart
    // For now, just opening the page as requested.
    const statusParam = market.status === 'connected' ? '&status=connected' : '';
    window.open(`/admin/settings/user-setting/marketplace-connection?market=${market.id}${statusParam}`, '_blank');
  };

  const iconMap = {
    amazon: amazonIcon,
    amazon_ads: amazonAds,
    flipkart: flipkartIcon,
    myntra: myntraIcon,
    meesho: meeshoIcon,
    ajio: ajioIcon,
    nykaa: nykaaIcon,
    shopify: shopifyIcon,
    woocommerce: wooIcon,
    magento: magentoIcon,
    blinkit: blinkitIcon,
    zepto: zeptoIcon,
    swiggy: swiggyIcon,
    tally: tallyIcon,
    zoho: zohoIcon,
  };

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="MarketPlace Settings"
        className="flex justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      />
      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
        {/* Toggle Section */}
        <Spin spinning={loading} size="large">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-gray-600 font-medium">Show Connected Only</span>
            <Switch checked={showConnectedOnly} onChange={setShowConnectedOnly} className="bg-gray-300" />
          </div>

          {/* Marketplace Grid */}
          <div className="grid grid-cols-1 min-md:grid-cols-2 min-lg:grid-cols-3 min-xl:grid-cols-4 gap-6">
            {filteredMarketplaces.length === 0 ? (
              <div className="col-span-full flex justify-center items-center py-20 text-gray-500 font-medium">
                No Data Found
              </div>
            ) : (
              filteredMarketplaces.map((market) => (
                <div
                  key={market.id}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group relative overflow-hidden h-[240px]"
                >
                  {/* Card Hover Gradient Border/Effect */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                  {/* Logo Area */}
                  <div className="w-20 h-20 mb-4 relative flex items-center justify-center p-2">
                    <img
                      src={iconMap[market.id] || `https://logo.clearbit.com/${market.domain}`}
                      alt={market.name}
                      className="max-w-full max-h-full object-contain filter grayscale-0 group-hover:scale-110 transition-all duration-300"
                      onError={(e) => {
                        if (!market.img) {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }
                      }}
                    />
                    {/* Fallback Initial */}
                    <div className="hidden absolute inset-0 bg-gray-50 rounded-xl items-center justify-center text-2xl font-bold text-gray-400">
                      {market.name.charAt(0)}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{market.name}</h3>

                  {/* Ads Badge */}
                  {market.isAds && (
                    <span className="absolute top-4 right-4 bg-yellow-400 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wide">
                      Ads
                    </span>
                  )}

                  {/* Action Area */}
                  <div className="mt-auto w-full py-2">
                    {market.status === 'connected' ? (
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 text-green-600 text-sm font-bold">
                          Connected {market.connectedCount}
                        </div>
                        <Button
                          onClick={() => handleConnect(market)}
                          className="block w-full text-xs text-blue-500 hover:text-blue-600 underline decoration-blue-200 hover:decoration-blue-500 transition-all italic border-none bg-transparent h-auto p-0 shadow-none"
                        >
                          Click here to connect more
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="primary"
                        onClick={() => handleConnect(market)}
                        className="w-full bg-blue-600 hover:bg-blue-700 border-none h-10 rounded text-white font-bold uppercase tracking-wider"
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Spin>
      </main>
    </>
  );
}
