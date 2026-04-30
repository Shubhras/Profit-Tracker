export const HEADER_ACTIONS = {
  '/profit/profitMonthlyView': ['export', 'sku'],
  '/profit/profitTableView': ['orderprofit', 'export', 'lowest'],
  '/profit/profittabledetails': ['orderprofit', 'export', 'lowest'],
  '/profit/profitThirdtable/': ['export', 'lowest'],
  '/profit/salesTrend': ['export'],
  '/profit/salesdetails/': ['export'],
  '/reconcile/os-payment': ['payment', 'cashback'],
  '/reconcile/b2c-reconciliation/settled-order': ['export'],
  '/reconcile/b2c-reconciliation/unsettled-order': ['export'],
  '/reconcile/b2c-reconciliation/invoice-reconciliation': ['upload'],
  '/reconcile/b2b-reconciliation/avcp': ['oneline', 'export', 'delayeddays'],
  '/reconcile/b2b-reconciliation/quick-com': ['export'],
  '/reconcile/b2b-reconciliation/others': ['export'],
  '/reconcile/b2b-reconciliation/customer-ledger': ['dateType'],

  '/reconcile/fee-leaks': ['export'],
  '/reconcile/min-settlement-leaks': ['export'],

  '/reconcile/return/ledger': ['export', 'sellerflex', 'inyourhand', 'resolved', 'orderDate'],

  '/settings/product-setting/product-configuration': {
    product: ['upload', 'export', 'stdcost'],

    inventory: ['upload', 'export', 'stdcost'],

    pincode: ['upload', 'export'],
  },

  // '/settings/product-setting/finance-configuration': ['export', 'upload', 'addexpense', 'recalculate', 'delete'],
  '/settings/product-setting/finance-configuration': {
    otherExpenses: ['upload', 'export', 'addexpense', 'recalculate', 'delete'],

    cashback: ['export', 'upload', 'add', 'sync', 'delete'],

    inventoryConfig: ['upload', 'export'],

    rule: ['upload', 'addrule', 'recalculate', 'addrules'],

    feeWaiverConfig: ['upload', 'export', 'delete'],

    settledAmountConfig: ['upload', 'export', 'delete'],
  },
};
