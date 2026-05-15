import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const PaymentReconcile = lazy(() => import('../../container/reconcile/PaymentReconcile'));
const ReconcileSummary = lazy(() => import('../../container/reconcile/ReconcileSummary'));
// const OsPayment = lazy(() => import('../../container/reconcile/OsPayment'));
// const FeeLeaks = lazy(() => import('../../container/reconcile/FeeLeaks'));
// const MinSettLeaks = lazy(() => import('../../container/reconcile/MinSettLeaks'));
// const SettledOrder = lazy(() => import('../../container/reconcile/SettledOrder'));
// const UnsettledOrder = lazy(() => import('../../container/reconcile/UnsettledOrder'));
// const InvoiceReconciliation = lazy(() => import('../../container/reconcile/InvoiceReconciliation'));
// const Avcp = lazy(() => import('../../container/reconcile/Avcp'));
// const QuickCom = lazy(() => import('../../container/reconcile/QuickCom'));
// const Others = lazy(() => import('../../container/reconcile/Others'));
// const CustLedger = lazy(() => import('../../container/reconcile/CustLedger'));
// const ReturnSummary = lazy(() => import('../../container/reconcile/ReturnSummary'));
// const ReturnLedger = lazy(() => import('../../container/reconcile/ReturnLedger'));
const OrderSettlement = lazy(() => import('../../container/reconcile/OrderSettlement'));
const MarketPayment = lazy(() => import('../../container/reconcile/MarketPayment'));
const ReturnAdjust = lazy(() => import('../../container/reconcile/ReturnAdjust'));
const FeeLeaks = lazy(() => import('../../container/reconcile/FeeLeaks'));
const Cashflow = lazy(() => import('../../container/reconcile/Cashflow'));

const NotFound = lazy(() => import('../../container/pages/404'));

function ReconcileRoutes() {
  return (
    <Routes>
      <Route path="payment-reconcile" element={<PaymentReconcile />} />
      <Route path="summary" element={<ReconcileSummary />} />
      <Route path="ordersettlement" element={<OrderSettlement />} />
      <Route path="marketPayment" element={<MarketPayment />} />
      <Route path="returnsAdjust" element={<ReturnAdjust />} />
      <Route path="paymentLeaks" element={<FeeLeaks />} />
      <Route path="cashflow" element={<Cashflow />} />

      {/* <Route path="os-payment" element={<OsPayment />} /> */}
      {/* <Route path="fee-leaks" element={<FeeLeaks />} /> */}
      {/* <Route path="min-settlement-leaks" element={<MinSettLeaks />} />
      <Route path="b2c-reconciliation/settled-order" element={<SettledOrder />} />
      <Route path="b2c-reconciliation/unsettled-order" element={<UnsettledOrder />} />
      <Route path="b2c-reconciliation/invoice-reconciliation" element={<InvoiceReconciliation />} />
      <Route path="b2b-reconciliation/avcp" element={<Avcp />} />
      <Route path="b2b-reconciliation/quick-com" element={<QuickCom />} />
      <Route path="b2b-reconciliation/others" element={<Others />} />
      <Route path="b2b-reconciliation/customer-ledger" element={<CustLedger />} />
      <Route path="return/summary" element={<ReturnSummary />} />
      <Route path="return/ledger" element={<ReturnLedger />} /> */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default ReconcileRoutes;
