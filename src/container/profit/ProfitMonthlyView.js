import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PageHeader } from '../../components/page-headers/page-headers';
import { getProfitMonthwise } from '../../redux/dashboard/actionCreator';

export default function ProfitMonthlyView() {
  const dispatch = useDispatch();

  const { monthwiseProfitData } = useSelector((state) => state.dashboard);
  const PageRoutes = [
    {
      path: 'index',
      breadcrumbName: 'Profit',
    },
    {
      path: 'first',
      breadcrumbName: 'Profit Monthly View',
    },
  ];

  useEffect(() => {
    dispatch(getProfitMonthwise('2026-01-01', '2026-04-13'));
  }, [dispatch]);

  const formatMonth = (m) => {
    const [month, year] = m.split('-');
    const date = new Date(year, month - 1);

    return `${date.toLocaleString('default', { month: 'short' })}/${year.slice(2)}`;
  };

  const data = monthwiseProfitData?.response || [];
  const months = data.map((item) => item.month);

  const rows = [
    { label: 'Gross Qty', key: 'grossqty' },
    { label: 'Claimed Qty', key: 'claimqty' },
    { label: 'Cancelled Qty', key: 'cancelledcanqty' },
    { label: 'Cancelled(RTO) Qty', key: 'cancelledrtoqty' },
    { label: 'Return(RTO) Qty', key: 'returnedrtoqty' },
    { label: 'Return Qty', key: 'returnedcreturnqty' },
  ];

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Profit"
        className="flex  justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      />
      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
        <div className="bg-white rounded-md border">
          <div className="grid grid-cols-[200px_repeat(4,1fr)] border-b bg-gray-50 font-semibold">
            <div className="p-3" />
            {months.map((m, i) => (
              <div key={i} className="p-3 text-center">
                {formatMonth(m)}
              </div>
            ))}
          </div>

          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-[200px_repeat(4,1fr)] border-b last:border-0">
              {/* LEFT LABEL */}
              <div className="p-3 font-medium bg-gray-50">{row.label}</div>
              {/* VALUES */}
              {data.map((item, j) => {
                const val = item[row.key];

                return (
                  <div
                    key={j}
                    className={`p-3 text-center font-medium ${
                      val > 0 ? 'text-green-600' : val < 0 ? 'text-red-500' : ''
                    }`}
                  >
                    {val}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
