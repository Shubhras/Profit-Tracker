import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { PageHeader } from '../../components/page-headers/page-headers';
import { getProfitMonthwise } from '../../redux/dashboard/actionCreator';

export default function ProfitMonthlyView() {
  const dispatch = useDispatch();

  const [filters, setFilters] = React.useState({
    SKU: '',
    ProductId: '',
  });

  const { monthwiseProfitData, dateRange } = useSelector((state) => state.dashboard);
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
    const payload = {
      fromDate: dateRange?.fromDate || null,
      toDate: dateRange?.endDate || null,
      SKU: '',
      ProductId: '',
    };

    dispatch(getProfitMonthwise(payload));
  }, [dispatch, dateRange]);
  const formatMonth = (m) => {
    const [month, year] = m.split('-');
    const date = new Date(year, month - 1);

    return `${date.toLocaleString('default', { month: 'short' })}/${year.slice(2)}`;
  };

  const data = monthwiseProfitData?.response || [];
  const months = data.map((item) => item.month);
  const highlightRows = ['netqty', 'netsales', 'profit'];
  const isScrollable = months.length > 4;

  const rows = [
    { label: 'Gross Qty', key: 'grossqty' },
    { label: 'Claimed Qty', key: 'claimqty' },
    { label: 'Cancelled Qty', key: 'cancelledcanqty' },
    { label: 'Cancelled(RTO) Qty', key: 'cancelledrtoqty' },
    { label: 'Return(RTO) Qty', key: 'returnedrtoqty' },
    { label: 'Return Qty', key: 'returnedcreturnqty' },
    { label: 'Net Qty', key: 'netqty' },
    { label: 'Gross Sales', key: 'grosssales' },
    { label: 'Cancelled Sales', key: 'cancelledcansales' },
    { label: 'Cancelled(RTO) Sales', key: 'cancelledrtosales' },
    { label: 'Return(RTO) Sales', key: 'returnedrtosales' },
    { label: 'Return Sales', key: 'returnedcreturnsales' },
    { label: 'Claimed Sales', key: 'claimsales' },
    { label: 'Net Sales', key: 'netsales' },
    { label: 'Profit', key: 'profit' },
    { label: 'Replaced Qty', key: 'replacedqty' },
    { label: 'Gross ASP', key: 'grossasp' },
    { label: 'Net ASP', key: 'netasp' },
  ];
  const handleChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApply = () => {
    dispatch(
      getProfitMonthwise({
        fromDate: dateRange?.fromDate || null,
        toDate: dateRange?.endDate || null,
        ...filters,
      }),
    );
  };

  const handleClear = () => {
    const reset = {
      SKU: '',
      ProductId: '',
    };

    setFilters(reset);

    dispatch(
      getProfitMonthwise({
        fromDate: dateRange?.fromDate || null,
        toDate: dateRange?.endDate || null,
        SKU: '',
        ProductId: '',
      }),
    );
  };

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Profit"
        className="flex  justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      />
      <main className="min-h-[715px] lg:min-h-[580p x] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
        <div className="bg-white rounded-md border overflow-x-auto">
          <div className="mb-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
            <div role="button" tabIndex={0} className="flex items-center gap-4 mb-3 cursor-pointer">
              <span className="text-sm font-medium text-gray-700">Filters :</span>

              <span className="text-sm text-gray-500">
                {filters.SKU || filters.ProductId ? 'Filters Applied' : 'No Filters'}
              </span>

              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-100"
                >
                  Clear
                  <CloseOutlined />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApply();
                  }}
                  className="flex items-center gap-2 px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Apply
                  <CheckOutlined />
                </button>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto whitespace-nowrap">
              <div className="min-w-[200px]">
                <label className="text-s text-gray-600 mb-1 block">SKU</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="SKU"
                  onChange={(e) => handleChange('SKU', e.target.value)}
                />
              </div>

              <div className="min-w-[200px]">
                <label className="text-s text-gray-600 mb-1 block">ProductId</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="ProductId"
                  onChange={(e) => handleChange('ProductId', e.target.value)}
                />
              </div>
            </div>
          </div>
          <div
            className="grid border-b bg-gray-50 font-semibold"
            style={{
              gridTemplateColumns: isScrollable
                ? `200px repeat(${months.length}, 150px)`
                : `200px repeat(${months.length}, 1fr)`,
            }}
          >
            <div className="p-3 sticky left-0 bg-gray-50 z-20" />
            {months.map((m, i) => (
              <div key={i} className="p-3 text-center font-semibold text-black">
                {formatMonth(m)}
              </div>
            ))}
          </div>

          {rows.map((row, i) => {
            const isHighlight = highlightRows.includes(row.key);
            return (
              <div
                key={i}
                className={`grid border-b last:border-0 ${isHighlight ? 'bg-blue-50 font-semibold' : ''}`}
                style={{
                  gridTemplateColumns: isScrollable
                    ? `200px repeat(${months.length}, 150px)`
                    : `200px repeat(${months.length}, 1fr)`,
                }}
              >
                {/* LEFT LABEL */}
                <div className={`p-3 sticky left-0 z-10 ${isHighlight ? 'bg-blue-100 font-semibold' : 'bg-gray-50'}`}>
                  {row.label}
                </div>{' '}
                {/* VALUES */}
                {data.map((item, j) => {
                  const val = item[row.key];

                  let bg = '';
                  let text = '';

                  if (isHighlight) {
                    if (val > 0) {
                      bg = 'bg-green-100';
                      text = 'text-green-700';
                    } else if (val < 0) {
                      bg = 'bg-red-100';
                      text = 'text-red-600';
                    } else {
                      bg = 'bg-gray-100';
                    }
                  } else {
                    text = val > 0 ? 'text-green-600' : val < 0 ? 'text-red-500' : '';
                  }

                  return (
                    <div key={j} className={`p-3 text-center font-medium ${bg} ${text}`}>
                      {val}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
