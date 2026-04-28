export const HEADER_ACTIONS = {
  '/profit/profitMonthlyView': ['export', 'sku'],
  '/profit/profitTableView': ['orderprofit', 'export', 'lowest'],
  '/profit/salesTrend': ['export'],
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

  '/reconcile/return/ledger': ['export', 'sellerflex', 'inyourhand'],

  '/settings/product-setting/product-configuration': ['export', 'upload', 'stdcost'],

  '/settings/product-setting/finance-configuration': ['export', 'upload', 'addexpense', 'recalculate'],
};
