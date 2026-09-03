import {
  // Uil500px,
  // UilAirplay,
  // UilAt,
  // UilBagAlt,
  // UilBookAlt,
  // UilBookReader,
  // UilCalendarAlt,
  // UilChartBar,
  // UilChat,
  // UilCheckSquare,
  // UilCircle,
  // UilClipboardAlt,
  // UilClock,
  // UilCompactDisc,
  // UilDatabase,
  // UilDocumentLayoutLeft,
  // UilEdit,
  // UilEnvelope,
  // UilExchange,
  // UilExclamationOctagon,
  // UilExpandArrowsAlt,
  // UilFile,
  // UilHeadphones,
  // UilIcons,
  // UilImages,
  // UilLayerGroup,
  // UilMap,
  // UilPresentation,
  // UilQuestionCircle,
  // UilSearch,
  // UilServer,
  // UilShoppingCart,
  // UilSquareFull,
  // UilTable,
  // UilUsdCircle,
  // UilUsersAlt,
  // UilWindowSection,
  UilArrowGrowth,
  UilMegaphone,
  UilBookOpen,
  UilCreateDashboard,
  UilFileShieldAlt,
  UilSetting,
  UilChartGrowth,
  UilProcess,
  UilLayersAlt,
  UilApps,
  UilUsersAlt,
  UilTag,
  UilLifeRing,
  UilStore,
  UilCreditCard,
  UilBell,
  UilShieldCheck,
  UilCube,
  UilUserCheck,
  UilLayerGroup,
  UilAnalysis,
  UilBill,
  UilEnvelope,
} from '@iconscout/react-unicons';
import { Menu } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import UilEllipsisV from '@iconscout/react-unicons/icons/uil-ellipsis-v';
import propTypes from 'prop-types';
// import { NavTitle } from './Style';
// import versions from '../demoData/changelog.json';
// import { changeDirectionMode, changeLayoutMode, changeMenuMode } from '../redux/themeLayout/actionCreator';

function MenuItems({ toggleCollapsed }) {
  const { t } = useTranslation();
  const location = useLocation();
  const profile = useSelector((state) => state.auth.profile);

  const modules = profile?.subscription?.modules || [];
  const submodules = profile?.subscription?.submodules || [];

  const hasModule = (slug) => modules.some((m) => m.slug === slug);

  const hasSubmodule = (slug) => submodules.some((s) => s.slug === slug);

  function getItem(label, key, icon, children, type) {
    return {
      key,
      icon,
      children,
      label,
      type,
    };
  }

  const { topMenu } = useSelector((state) => {
    return {
      topMenu: state.ChangeLayoutMode.topMenu,
    };
  });

  // const dispatch = useDispatch();

  const path = '/admin';

  const pathName = window.location.pathname;
  // console.log(pathName);
  const pathArray = pathName.split(path);
  // console.log(pathArray);
  const mainPath = pathArray[1] || ''; // Add fallback to empty string
  // console.log(mainPath);
  const mainPathSplit = mainPath ? mainPath.split('/') : []; // Add null check
  // console.log(mainPathSplit);

  const [openKeys, setOpenKeys] = React.useState(
    !topMenu ? [`${mainPathSplit.length > 2 ? mainPathSplit[1] : 'actionsrequired'}`] : [],
  );

  // const onOpenChange = (keys) => {
  //   setOpenKeys(keys[keys.length - 1] !== 'recharts' ? [keys.length && keys[keys.length - 1]] : keys);
  // };

  // const onClick = (item) => {
  //   if (item.keyPath.length === 1) setOpenKeys([]);
  // };

  const onOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  const onClick = ({ keyPath }) => {
    // Keep top-level parent open
    if (keyPath.length > 1) {
      setOpenKeys(keyPath.slice(1));
    }
  };

  // const changeLayout = (mode) => {
  //   dispatch(changeLayoutMode(mode));
  // };
  // const changeNavbar = (topMode) => {
  //   const html = document.querySelector('html');
  //   if (topMode) {
  //     html.classList.add('hexadash-topmenu');
  //   } else {
  //     html.classList.remove('hexadash-topmenu');
  //   }
  //   dispatch(changeMenuMode(topMode));
  // };
  // const changeLayoutDirection = (rtlMode) => {
  //   if (rtlMode) {
  //     const html = document.querySelector('html');
  //     html.setAttribute('dir', 'rtl');
  //   } else {
  //     const html = document.querySelector('html');
  //     html.setAttribute('dir', 'ltr');
  //   }
  //   dispatch(changeDirectionMode(rtlMode));
  // };

  // const darkmodeActivated = () => {
  //   document.body.classList.add('dark');
  // };

  // const darkmodeDiactivated = () => {
  //   document.body.classList.remove('dark');
  // };

  // const items = [
  const userItems = [
    // getItem(
    //   <NavLink onClick={toggleCollapsed} to={`${path}/pages/actionsrequired`}>
    //     {t('actionsRequired')}
    //   </NavLink>,
    //   'actionsRequired',
    //   !topMenu && <UilBookOpen />,
    // ),

    // getItem(t('profit'), 'profit', !topMenu && <UilArrowGrowth />, [
    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/profit/summary`}>
    //       {t('summary')}
    //     </NavLink>,
    //     'summary',
    //     null,
    //   ),

    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to="/admin/profit/profitTableView/details">
    //       {t('SKU Wise Profit')}
    //     </NavLink>,
    //     'skuwiseprofit',
    //     null,
    //   ),

    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/profit/estimatedfees`}>
    //       {t('MarketPlace Fees Estimate')}
    //     </NavLink>,
    //     'estimatedfees',
    //     null,
    //   ),

    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/profit/shippingestimate`}>
    //       {t('Shipping Estimate')}
    //     </NavLink>,
    //     'shippingestimate',
    //     null,
    //   ),
    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/profit/claims`}>
    //       {t('Claims')}
    //     </NavLink>,
    //     'claims',
    //     null,
    //   ),

    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/profit/returnfees`}>
    //       {t('Return Fees')}
    //     </NavLink>,
    //     'returnfees',
    //     null,
    //   ),
    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/profit/profitTableView`}>
    //       {t('profitTableView')}
    //     </NavLink>,
    //     'profitTableView',
    //     null,
    //   ),
    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/profit/profitMonthlyView`}>
    //       {t('profitMonthlyView')}
    //     </NavLink>,
    //     'profitMonthlyView',
    //     null,
    //   ),
    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/profit/taxcalculation`}>
    //       {t('Tax Calculations')}
    //     </NavLink>,
    //     'taxcalculation',
    //     null,
    //   ),
    // ]),

    hasModule('profit') &&
      getItem(
        'Profit',
        'profit',
        !topMenu && <UilArrowGrowth />,
        [
          hasSubmodule('summary') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/profit/summary`}>
                Summary
              </NavLink>,
              'summary',
            ),

          hasSubmodule('sku-wise-profit') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to="/admin/profit/profitTableView/details">
                Profit Explorer
              </NavLink>,
              'skuwiseprofit',
            ),

          hasSubmodule('prodit-sku-tracker') &&
            getItem(
              <NavLink
                onClick={toggleCollapsed}
                to={`${path}/profit/profitTableView/sku-profit`}
                state={{
                  type: 'all',
                  profitType: 'profitable',
                }}
              >
                {' '}
                Profit SKU Tracker
              </NavLink>,
              'sku-profit',
            ),

          hasSubmodule('loss-sku-tracker') &&
            getItem(
              <NavLink
                onClick={toggleCollapsed}
                to={`${path}/profit/profitTableView/sku-profit`}
                state={{
                  type: 'all',
                  profitType: 'losing',
                }}
              >
                {' '}
                Loss SKU Tracker
              </NavLink>,
              'loss-sku',
            ),

          hasSubmodule('profit-table-view') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/profit/profitTableView`}>
                Channel Wise Profit
              </NavLink>,
              'profitTableView',
            ),

          hasSubmodule('return-fees') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/profit/returnfees`}>
                Return Tracker
              </NavLink>,
              'returnfees',
            ),

          hasSubmodule('claims') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/profit/claims`}>
                claims
              </NavLink>,
              'claims',
            ),

          hasSubmodule('profit-monthly-view') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/profit/profitMonthlyView`}>
                Profit Monthly View
              </NavLink>,
              'profitMonthlyView',
            ),

          hasSubmodule('amazon-estimate-fees') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/profit/estimatedfees`}>
                Amazon Estimate Fees
              </NavLink>,
              'estimatedfees',
            ),
        ].filter(Boolean),
      ),

    // getItem(t('paymentreconcile'), 'reconcile', !topMenu && <UilCreateDashboard />, [
    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/reconcile/payment-overview`}>
    //       {t('Overview')}
    //     </NavLink>,
    //     'payment-overview',
    //   ),
    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/reconcile/payment-reconcile`}>
    //       {t('Payment')}
    //     </NavLink>,
    //     'payment-reconcile',
    //   ),

    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/reconcile/ordersettlement`}>
    //       {t('Order & Settlements')}
    //     </NavLink>,
    //     'order-settlements',
    //   ),

    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/reconcile/marketPayment`}>
    //       {t('Marketplace Payments')}
    //     </NavLink>,
    //     'marketplace-payment',
    //   ),

    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/reconcile/returnsAdjust`}>
    //       {t('Returns & Adjustments')}
    //     </NavLink>,
    //     'returns-adjustments',
    //   ),

    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/reconcile/allLeaks`}>
    //       {t('All Leaks')}
    //     </NavLink>,
    //     'payment-leaks',
    //   ),

    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/reconcile/reimbursement`}>
    //       {t('Reimbursement Planning')}
    //     </NavLink>,
    //     'reimbursement-planning',
    //   ),
    // ]),

    // getItem(t('Advertising'), 'advertising', !topMenu && <UilMegaphone />, [
    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/advertising/overview`}>
    //       {t('Overview')}
    //     </NavLink>,
    //     'advertising-overview',
    //     null,
    //   ),
    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/advertising/create-campaign`}>
    //       {t('Create Campaign')}
    //     </NavLink>,
    //     'create-campaign',
    //     null,
    //   ),
    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/advertising/campaigns`}>
    //       {t('Campaigns')}
    //     </NavLink>,
    //     'campaigns',
    //     null,
    //   ),
    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/advertising/AdProducts`}>
    //       {t('Ad Products')}
    //     </NavLink>,
    //     'adproducts',
    //     null,
    //   ),
    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/advertising/adsgroup`}>
    //       {t('Ad Groups')}
    //     </NavLink>,
    //     'adsgroup',
    //     null,
    //   ),
    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/advertising/searchTerms`}>
    //       {t('Search Terms')}
    //     </NavLink>,
    //     'searchTerms',
    //     null,
    //   ),
    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/advertising/keywords`}>
    //       {t('Keywords')}
    //     </NavLink>,
    //     'keywords',
    //     null,
    //   ),

    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/advertising/targets`}>
    //       {t('Targets')}
    //     </NavLink>,
    //     'targets',
    //     null,
    //   ),
    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/advertising/negativeKey`}>
    //       {t('Negative Keywords')}
    //     </NavLink>,
    //     'negativeKey',
    //     null,
    //   ),
    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/advertising/rulesAuto`}>
    //       {t('Rules & Automation')}
    //     </NavLink>,
    //     'rulesAuto',
    //     null,
    //   ),
    // ]),

    hasModule('advertising') &&
      getItem(
        'Advertising',
        'advertising',
        !topMenu && <UilMegaphone />,
        [
          hasSubmodule('advertise-dashboard') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/advertising/dashboard`}>
                Dashboard
              </NavLink>,
              'dashboard',
            ),

          hasSubmodule('campaigns') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/advertising/campaigns`}>
                Campaigns
              </NavLink>,
              'campaigns',
            ),

          hasSubmodule('create-campaign') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/advertising/create-campaign`}>
                Create Campaign
              </NavLink>,
              'create-campaign',
            ),

          hasSubmodule('ad-products') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/advertising/AdProducts`}>
                Products
              </NavLink>,
              'AdProducts',
            ),

          hasSubmodule('ad-groups') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/advertising/adsgroup`}>
                Ad Groups
              </NavLink>,
              'adsgroup',
            ),

          hasSubmodule('search-terms') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/advertising/searchTerms`}>
                Search Terms
              </NavLink>,
              'searchTerms',
            ),

          hasSubmodule('keywords') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/advertising/keywords`}>
                Keywords
              </NavLink>,
              'keywords',
            ),

          hasSubmodule('targets') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/advertising/targets`}>
                Targets
              </NavLink>,
              'targets',
            ),

          hasSubmodule('negative-keywords') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/advertising/negativeKey`}>
                Negative Keywords
              </NavLink>,
              'negativeKey',
            ),

          hasSubmodule('rules-automation') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/advertising/rulesAuto`}>
                Automation
              </NavLink>,
              'rulesAuto',
            ),
        ].filter(Boolean),
      ),

    hasModule('payment-reconcile') &&
      getItem(
        'Payment Reconcile',
        'reconcile',
        !topMenu && <UilCreateDashboard />,
        [
          hasSubmodule('summary-reconcile') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/reconcile/summary`}>
                Summary
              </NavLink>,
              'summary',
            ),

          hasSubmodule('reconcile') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/reconcile/payment-overview`}>
                Auto Reconciliation
              </NavLink>,
              'payment-overview',
            ),

          hasSubmodule('payment') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/reconcile/payment-reconcile`}>
                Amazon Payment Tracker
              </NavLink>,
              'payment-reconcile',
            ),

          hasSubmodule('order-settlement') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/reconcile/ordersettlement`}>
                Amazon Payment Tracker
              </NavLink>,
              'ordersettlement',
            ),

          // hasSubmodule('marketplace-payments') &&
          //   getItem(
          //     <NavLink onClick={toggleCollapsed} to={`${path}/reconcile/marketPayment`}>
          //       Marketplace Payments
          //     </NavLink>,
          //     'marketplace-payment',
          //   ),

          // hasSubmodule('returns-adjustments') &&
          //   getItem(
          //     <NavLink onClick={toggleCollapsed} to={`${path}/reconcile/returnsAdjust`}>
          //       Returns & Adjustments
          //     </NavLink>,
          //     'returns-adjustments',
          //   ),

          hasSubmodule('all-leaks') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/reconcile/allLeaks`}>
                Discrepancy Tracker
              </NavLink>,
              'allLeaks',
            ),

          // hasSubmodule('reimbursement-planning') &&
          //   getItem(
          //     <NavLink onClick={toggleCollapsed} to={`${path}/reconcile/reimbursement`}>
          //       Reimbursement Planning
          //     </NavLink>,
          //     'reimbursement-planning',
          //   ),
        ].filter(Boolean),
      ),

    // getItem(t('Organic Performance'), 'organicperformance', !topMenu && <UilChartGrowth />, [
    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/organicperformace/overview`}>
    //       {t('Overview')}
    //     </NavLink>,
    //     'perofrmance-Overview',
    //     null,
    //   ),

    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/organicperformace/trafficVisibility`}>
    //       {t('Traffic & Visibility')}
    //     </NavLink>,
    //     'traffic-visibility',
    //     null,
    //   ),

    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/organicperformace/salesDrivers`}>
    //       {t('Sales Drivers')}
    //     </NavLink>,
    //     'sales-drivers',
    //     null,
    //   ),
    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/organicperformace/Keyperformance`}>
    //       {t('Keyword Performance')}
    //     </NavLink>,
    //     'keyperformance',
    //     null,
    //   ),

    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/organicperformace/productranking`}>
    //       {t('Product Ranking')}
    //     </NavLink>,
    //     'product-ranking',
    //     null,
    //   ),
    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/organicperformace/reviewRating`}>
    //       {t('Reviews & Ratings')}
    //     </NavLink>,
    //     'Reviews-Rating',
    //     null,
    //   ),
    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/organicperformace/inventoryImpact`}>
    //       {t('Inventory Impact')}
    //     </NavLink>,
    //     'inventoryImpact',
    //     null,
    //   ),
    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/organicperformace/reports`}>
    //       {t('Reports')}
    //     </NavLink>,
    //     'reports',
    //     null,
    //   ),
    // ]),

    hasModule('organic-performance') &&
      getItem(
        'Organic Performance',
        'organicperformance',
        !topMenu && <UilChartGrowth />,
        [
          hasSubmodule('Organic-Performance-overview') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/organicperformace/overview`}>
                Overview
              </NavLink>,
              'perofrmance-Overview',
            ),

          hasSubmodule('traffic-visibility') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/organicperformace/trafficVisibility`}>
                Traffic & Visibility
              </NavLink>,
              'trafficVisibility',
            ),

          hasSubmodule('sales-drivers') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/organicperformace/salesDrivers`}>
                Sales Drivers
              </NavLink>,
              'salesDrivers',
            ),

          hasSubmodule('keyword-performance') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/organicperformace/Keyperformance`}>
                Keyword Performance
              </NavLink>,
              'Keyperformance',
            ),

          hasSubmodule('product-ranking') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/organicperformace/productranking`}>
                Product Ranking
              </NavLink>,
              'productranking',
            ),

          hasSubmodule('reviews-ratings') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/organicperformace/reviewRating`}>
                Reviews & Ratings
              </NavLink>,
              'reviewRating',
            ),

          hasSubmodule('inventory-impact') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/organicperformace/inventoryImpact`}>
                Inventory Impact
              </NavLink>,
              'inventoryImpact',
            ),

          hasSubmodule('reports') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/organicperformace/reports`}>
                Reports
              </NavLink>,
              'reports',
            ),
        ].filter(Boolean),
      ),
    hasModule('growth-insight') &&
      getItem(
        <NavLink onClick={toggleCollapsed} to={`${path}/pages/actionsrequired`}>
          {/* {t('actionsRequired')} */}
          Growth Insight
        </NavLink>,
        'actionsrequired',
        !topMenu && <UilBookOpen />,
      ),

    // getItem(t('Operations'), 'Operations', !topMenu && <UilProcess />, [
    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/operations/dailyOperations`}>
    //       {t('Daily Operations')}
    //     </NavLink>,
    //     'dailyoperations',
    //     null,
    //   ),
    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/operations/orderProcessing`}>
    //       {t('Order Processing')}
    //     </NavLink>,
    //     'orderProcessing',
    //     null,
    //   ),
    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/operations/inventorySync`}>
    //       {t('Inventory Sync')}
    //     </NavLink>,
    //     'inventorySync',
    //     null,
    //   ),
    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/operations/autoClaims`}>
    //       {t('Auto Claims')}
    //     </NavLink>,
    //     'autoClaims',
    //     null,
    //   ),
    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/operations/logsHistory`}>
    //       {t('Logs & History')}
    //     </NavLink>,
    //     'logshistory',
    //     null,
    //   ),
    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/operations/settings`}>
    //       {t('Settings')}
    //     </NavLink>,
    //     'settings',
    //     null,
    //   ),
    // ]),

    hasModule('operations') &&
      getItem(
        'Operations',
        'Operations',
        !topMenu && <UilProcess />,
        [
          hasSubmodule('daily-operations') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/operations/dailyOperations`}>
                Daily Operations
              </NavLink>,
              'dailyOperations',
            ),

          hasSubmodule('order-processing') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/operations/orderProcessing`}>
                Order Processing
              </NavLink>,
              'orderProcessing',
            ),

          hasSubmodule('inventory-sync') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/operations/inventorySync`}>
                Inventory Sync
              </NavLink>,
              'inventorySync',
            ),

          hasSubmodule('auto-claims') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/operations/autoClaims`}>
                Auto Claims
              </NavLink>,
              'autoClaims',
            ),

          hasSubmodule('logs-history') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/operations/logsHistory`}>
                Logs & History
              </NavLink>,
              'logsHistory',
            ),

          hasSubmodule('settings') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/operations/settings`}>
                Settings
              </NavLink>,
              'settings',
            ),
        ].filter(Boolean),
      ),

    // getItem(t('Value Added Services'), 'valueadded', !topMenu && <UilLayersAlt />, [
    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/valueadded/overview`}>
    //       {t('Overview')}
    //     </NavLink>,
    //     'valueadded-overview',
    //     null,
    //   ),
    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/valueadded/accountmanage`}>
    //       {t('Account Management')}
    //     </NavLink>,
    //     'accountmanage',
    //     null,
    //   ),
    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/valueadded/digitalmarketing`}>
    //       {t('Digital Marketing')}
    //     </NavLink>,
    //     'digitalmarketing',
    //     null,
    //   ),
    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/valueadded/QuickCommerce`}>
    //       {t('Quick Commerce')}
    //     </NavLink>,
    //     'quickcommerce',
    //     null,
    //   ),
    //   getItem(
    //     <NavLink onClick={toggleCollapsed} to={`${path}/valueadded/myservices`}>
    //       {t('My Services')}
    //     </NavLink>,
    //     'myservices',
    //     null,
    //   ),
    // ]),

    hasModule('value-added-services') &&
      getItem(
        'Value Added Services',
        'valueadded',
        !topMenu && <UilLayersAlt />,
        [
          hasSubmodule('account-management') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/valueadded/accountmanage`}>
                Account Management
              </NavLink>,
              'accountmanage',
            ),

          hasSubmodule('digital-marketing') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/valueadded/digitalmarketing`}>
                Digital Marketing
              </NavLink>,
              'digitalmarketing',
            ),

          hasSubmodule('quick-commerce') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/valueadded/QuickCommerce`}>
                Quick Commerce
              </NavLink>,
              'QuickCommerce',
            ),
        ].filter(Boolean),
      ),

    // getItem(
    //   <NavLink onClick={toggleCollapsed} to={`${path}/pages/download`}>
    //     {t('download')}
    //   </NavLink>,
    //   'download',
    //   !topMenu && (
    //     <NavLink className="menuItem-iocn" to={`${path}/pages/download`}>
    //       <UilFileShieldAlt />
    //     </NavLink>
    //   ),
    // ),

    hasModule('report') &&
      getItem(
        <NavLink onClick={toggleCollapsed} to={`${path}/pages/download`}>
          Reports
        </NavLink>,
        'download',
        !topMenu && (
          <NavLink className="menuItem-iocn" to={`${path}/pages/download`}>
            <UilFileShieldAlt />
          </NavLink>
        ),
      ),

    // getItem(t('settings'), 'settings', !topMenu && <UilSetting />, [
    //   getItem(t('productSettings'), 'productSettings', null, [
    //     getItem(
    //       <NavLink onClick={toggleCollapsed} to={`${path}/settings/product-setting/overview`}>
    //         {t('overview')}
    //       </NavLink>,
    //       'overview',
    //     ),

    //     getItem(
    //       <NavLink onClick={toggleCollapsed} to={`${path}/settings/product-setting/product-configuration`}>
    //         {t('productConfiguration')}
    //       </NavLink>,
    //       'productConfiguration',
    //     ),

    //     getItem(
    //       <NavLink onClick={toggleCollapsed} to={`${path}/settings/product-setting/finance-configuration`}>
    //         {t('financeConfiguration')}
    //       </NavLink>,
    //       'financeConfiguration',
    //     ),
    //     getItem(
    //       <NavLink onClick={toggleCollapsed} to={`${path}/valueadded/invoicebilling`}>
    //         {t('Invoices & Billing')}
    //       </NavLink>,
    //       'invoicebilling',
    //       null,
    //     ),
    //   ]),

    //   getItem(t('userSettings'), 'userSettings', null, [
    //     getItem(
    //       <NavLink onClick={toggleCollapsed} to={`${path}/settings/user-setting/account-settings`}>
    //         {t('accountSettings')}
    //       </NavLink>,
    //       'accountSettings',
    //     ),
    //     getItem(
    //       <NavLink onClick={toggleCollapsed} to={`${path}/settings/user-setting/marketplace-settings`}>
    //         {t('marketPlaceSettings')}
    //       </NavLink>,
    //       'marketPlaceSettings',
    //     ),

    //     getItem(
    //       <NavLink onClick={toggleCollapsed} to={`${path}/settings/user-setting/user-management`}>
    //         {t('userManagement')}
    //       </NavLink>,
    //       'userManagement',
    //     ),
    //   ]),
    // ]),

    hasModule('settings') &&
      getItem(
        'Settings',
        'settings',
        !topMenu && <UilSetting />,
        [
          hasSubmodule('product-configuration') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/settings/product-setting/product-configuration`}>
                Product Configuration
              </NavLink>,
              'product-configuration',
            ),

          hasSubmodule('finance-configuration') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/settings/product-setting/finance-configuration`}>
                Finance Configuration
              </NavLink>,
              'finance-configuration',
            ),

          hasSubmodule('business-expenses') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/settings/product-setting/business-expenses`}>
                Business Expenses
              </NavLink>,
              'business-expenses',
            ),

          (hasSubmodule('estimated-fees') || hasSubmodule('business-expenses')) &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/settings/product-setting/estimated-fees`}>
                Estimated Fees
              </NavLink>,
              'estimated-fees',
            ),

          hasSubmodule('profit-calculation-settings') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/settings/product-setting/profit-calculation`}>
                Profit Calculation Settings
              </NavLink>,
              'profit-calculation',
            ),

          hasSubmodule('marketplace-settings') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/settings/user-setting/marketplace-settings`}>
                Marketplace Settings
              </NavLink>,
              'marketplace-settings',
            ),

          hasSubmodule('user-management') &&
            getItem(
              <NavLink onClick={toggleCollapsed} to={`${path}/settings/user-setting/user-management`}>
                User Management
              </NavLink>,
              'user-management',
            ),
        ].filter(Boolean),
      ),
  ];

  const userPermissions = profile?.permissions || [];
  const isSubUser = profile?.is_sub_user;

  const hasAdminModule = (slug) => {
    if (!isSubUser) {
      return true;
    }
    if (userPermissions && userPermissions.length > 0) {
      const target = slug.toLowerCase().replace(/[\s_-]+/g, '');
      return userPermissions.some((p) => {
        const mSlug = (p.module_slug || '').toLowerCase().replace(/[\s_-]+/g, '');
        const mName = (p.module_name || '').toLowerCase().replace(/[\s_-]+/g, '');
        const mId = String(p.module || '')
          .toLowerCase()
          .replace(/[\s_-]+/g, '');
        return mSlug === target || mName === target || mId === target;
      });
    }
    return true;
  };

  const superAdminItems = [
    hasAdminModule('dashboard') &&
      getItem(
        <NavLink onClick={toggleCollapsed} to="/super-admin/dashboard">
          Dashboard
        </NavLink>,
        'dashboard',
        !topMenu && <UilApps />,
      ),

    hasAdminModule('users') &&
      getItem(
        <NavLink onClick={toggleCollapsed} to="/super-admin/users">
          Users
        </NavLink>,
        'users',
        !topMenu && <UilUsersAlt />,
      ),

    hasAdminModule('admin-users') &&
      getItem(
        <NavLink onClick={toggleCollapsed} to="/super-admin/admin-users">
          Admin Users
        </NavLink>,
        'admin-users',
        !topMenu && <UilUserCheck />,
      ),

    hasAdminModule('subscription') &&
      getItem(
        <NavLink onClick={toggleCollapsed} to="/super-admin/subscription">
          Subscription
        </NavLink>,
        'subscription',
        !topMenu && <UilCreditCard />,
      ),

    hasAdminModule('marketplaceIntegration') &&
      getItem(
        <NavLink onClick={toggleCollapsed} to="/super-admin/marketplaceIntegration">
          Marketplace Integration
        </NavLink>,
        'marketplaceIntegration',
        !topMenu && <UilStore />,
      ),

    hasAdminModule('CouponCode') &&
      getItem(
        <NavLink onClick={toggleCollapsed} to="/super-admin/CouponCode">
          {t('Coupon Code')}
        </NavLink>,
        'CouponCode',
        !topMenu && <UilTag />,
      ),

    hasAdminModule('support') &&
      getItem(
        <NavLink onClick={toggleCollapsed} to="/super-admin/support">
          {t('Help & Support')}
        </NavLink>,
        'support',
        !topMenu && <UilLifeRing />,
      ),

    hasAdminModule('contact-messages') &&
      getItem(
        <NavLink onClick={toggleCollapsed} to="/super-admin/contact-messages">
          {t('Contact Messages')}
        </NavLink>,
        'contact-messages',
        !topMenu && <UilEnvelope />,
      ),

    hasAdminModule('module') &&
      getItem(
        <NavLink onClick={toggleCollapsed} to="/super-admin/module">
          {t('Module')}
        </NavLink>,
        'module',
        !topMenu && <UilCube />,
      ),

    hasAdminModule('submodule') &&
      getItem(
        <NavLink onClick={toggleCollapsed} to="/super-admin/submodule">
          {t('Sub Module')}
        </NavLink>,
        'submodule',
        !topMenu && <UilLayerGroup />,
      ),

    hasAdminModule('notifications') &&
      getItem(
        <NavLink onClick={toggleCollapsed} to="/super-admin/notifications">
          {t('Notifications')}
        </NavLink>,
        'notifications',
        !topMenu && <UilBell />,
      ),

    hasAdminModule('privacy-policy') &&
      getItem(
        <NavLink onClick={toggleCollapsed} to="/super-admin/privacy-policy">
          {t('Privacy Policy')}
        </NavLink>,
        'privacy-policy',
        !topMenu && <UilShieldCheck />,
      ),

    hasAdminModule('api-logs') &&
      getItem(
        <NavLink onClick={toggleCollapsed} to="/super-admin/api-logs">
          {t('API Call Logs')}
        </NavLink>,
        'api-logs',
        !topMenu && <UilAnalysis />,
      ),

    hasAdminModule('payment-transactions') &&
      getItem(
        <NavLink onClick={toggleCollapsed} to="/super-admin/payment-transactions">
          {t('Payment Transactions')}
        </NavLink>,
        'payment-transactions',
        !topMenu && <UilBill />,
      ),
  ].filter(Boolean);

  // const selectedKey = React.useMemo(() => {
  //   if (location.pathname === '/admin/profit/profitTableView/details') {
  //     return 'skuwiseprofit';
  //   }

  //   return mainPathSplit.length === 1 ? 'home' : mainPathSplit.length === 2 ? mainPathSplit[1] : mainPathSplit[2];
  // }, [location.pathname]);

  const selectedKey = React.useMemo(() => {
    const { pathname } = location;

    // ✅ SKU Wise Profit - exact route
    if (pathname === '/admin/profit/profitTableView/details') {
      return 'skuwiseprofit';
    }

    // ✅ Profit Table View - exact route
    if (pathname === '/admin/profit/profitTableView') {
      return 'profitTableView';
    }

    // ✅ Profit / Loss SKU Tracker
    if (pathname === '/admin/profit/profitTableView/sku-profit') {
      return location.state?.profitType === 'losing' ? 'loss-sku' : 'sku-profit';
    }

    // ✅ Profit Monthly View
    if (pathname === '/admin/profit/profitMonthlyView') {
      return 'profitMonthlyView';
    }

    // ✅ All other routes
    return mainPathSplit.length === 1
      ? 'home'
      : mainPathSplit.length === 2
      ? mainPathSplit[1]
      : mainPathSplit[mainPathSplit.length - 1];
  }, [location.pathname, mainPathSplit]);

  const isSuperAdmin = Cookies.get('isSuperAdmin') === 'true';

  const adminSelectedKey = location.pathname.split('/')[2];

  const items = isSuperAdmin ? superAdminItems : userItems;

  return (
    <Menu
      onOpenChange={onOpenChange}
      onClick={onClick}
      mode={!topMenu || window.innerWidth <= 991 ? 'inline' : 'horizontal'}
      // // eslint-disable-next-line no-nested-ternary
      // selectedKeys={isSuperAdmin ? [adminSelectedKey] : undefined}env
      selectedKeys={isSuperAdmin ? [adminSelectedKey] : [selectedKey]}
      // defaultSelectedKeys={
      //   !topMenu
      //     ? [
      //         `${
      //           mainPathSplit.length === 1 ? 'home' : mainPathSplit.length === 2 ? mainPathSplit[1] : mainPathSplit[2]
      //         }`,
      //       ]
      //     : []
      // }
      defaultOpenKeys={!topMenu ? [`${mainPathSplit.length > 2 ? mainPathSplit[1] : 'dashboard'}`] : []}
      overflowedIndicator={<UilEllipsisV />}
      openKeys={openKeys}
      items={items}
    />
  );
}

MenuItems.propTypes = {
  toggleCollapsed: propTypes.func,
};

export default MenuItems;
