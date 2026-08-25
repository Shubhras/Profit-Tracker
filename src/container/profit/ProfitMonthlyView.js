import React, { useEffect } from 'react';
import { Modal, Checkbox, Card, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { SettingOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { PageHeader } from '../../components/page-headers/page-headers';
import { getProfitMonthwise, exportProfitData } from '../../redux/dashboard/actionCreator';

export default function ProfitMonthlyView() {
  const dispatch = useDispatch();
  const [expandedRows, setExpandedRows] = React.useState({});
  const [openSettings, setOpenSettings] = React.useState(false);

  const { monthwiseProfitData, dateRange, channel: globalChannel, loading } = useSelector((state) => state.dashboard);
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
  const handleExport = () => {
    const payload = {
      params: {
        filters: {
          channel: {
            IN: ['Amazon-India', 'Flipkart', 'Jiomart', 'Meesho', 'Myntra', 'Snapdeal'],
          },
          fromDate: '2026-04-30T18:30:00Z',
          toDate: '2026-05-31T18:29:59Z',
          group_id: 'channel',
          qty: 'grossqty',
          calender_view: 'date',
        },
      },
      reportType: 'SalesSummaryNew',
      email: 'bhavnaaprostore@gmail.com',
    };

    dispatch(exportProfitData(payload));
  };

  useEffect(() => {
    const exportpayload = {
      filter: {
        channel: {
          IN: globalChannel,
        },
        fromDate: dateRange?.fromDate || null,
        toDate: dateRange?.endDate || null,
        // SKU: filters.SKU,
        // ProductId: filters.ProductId,
      },
    };

    dispatch(getProfitMonthwise(exportpayload));
  }, [dispatch, dateRange, globalChannel]);

  useEffect(() => {
    const handleHeaderAction = (event) => {
      if (event.detail === 'export') {
        handleExport();
      }
      if (event.detail === 'sku') {
        handleExport();
      }
    };

    window.addEventListener('headerAction', handleHeaderAction);

    return () => {
      window.removeEventListener('headerAction', handleHeaderAction);
    };
  }, [handleExport]);

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
    { label: 'Marketplace Fees', key: 'marketplacefees', isExpandable: true },
    { label: 'Shipping Fees', key: 'shipfees', isExpandable: true },
    { label: 'Std Cost', key: 'stdcost', isExpandable: true },
    { label: 'Ad Fees', key: 'ads', isExpandable: true },
    { label: 'Account Charges', key: 'accountcharges', isExpandable: true },
    { label: 'Other Expense', key: 'otherfees', isExpandable: true },
    { label: 'Profit', key: 'profit' },
    { label: 'Replaced Qty', key: 'replacedqty' },
    { label: 'Gross ASP', key: 'grossasp' },
    { label: 'Net ASP', key: 'netasp' },
    { label: 'TACOS', key: 'tacos' },
    { label: 'Profit Margin', key: 'profitmargin' },
  ];
  const [visibleRows, setVisibleRows] = React.useState(rows.map((r) => r.key));

  const toggleRow = (key) => {
    setExpandedRows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Profit"
        className="flex justify-between items-center px-4 xl:px-[15px] pt-2 pb-3 sm:pb-[30px] bg-transparent sm:flex-col"
      />
      <main className="min-h-[715px] lg:min-h-[580p x] flex-1 h-auto px-4 xl:px-[15px] pb-[30px] bg-transparent">
        <Card className="bg-white rounded-md border overflow-x-auto">
          <Spin spinning={loading} size="large">
            <div
              className="grid border-b bg-gray-50 font-semibold"
              style={{
                gridTemplateColumns: isScrollable
                  ? `200px repeat(${months.length}, 150px)`
                  : `200px repeat(${months.length}, 1fr)`,
              }}
            >
              <div className="p-3 sticky left-0 bg-gray-50 z-20 flex justify-left items-center">
                <SettingOutlined onClick={() => setOpenSettings(true)} className="cursor-pointer text-black" />
              </div>
              {months.map((m, i) => (
                <div key={i} className="p-3 text-center font-semibold text-black">
                  {formatMonth(m)}
                </div>
              ))}
            </div>

            {rows
              .filter((row) => visibleRows.includes(row.key))
              .map((row, i) => {
                const isHighlight = highlightRows.includes(row.key);
                return (
                  <React.Fragment key={i}>
                    <div
                      className={`grid border-b last:border-0 ${isHighlight ? 'bg-blue-50 font-semibold' : ''}`}
                      style={{
                        gridTemplateColumns: isScrollable
                          ? `200px repeat(${months.length}, 150px)`
                          : `200px repeat(${months.length}, 1fr)`,
                      }}
                    >
                      {/* LEFT LABEL */}
                      <div
                        className={`p-2 sticky left-0 z-10 flex items-center gap-2 ${
                          isHighlight ? 'bg-blue-100 font-semibold' : 'bg-gray-50'
                        }`}
                      >
                        {row.isExpandable && (
                          <button type="button" onClick={() => toggleRow(row.key)} style={{ fontSize: '10px' }}>
                            {expandedRows[row.key] ? <MinusOutlined /> : <PlusOutlined />}{' '}
                          </button>
                        )}
                        {row.label}
                      </div>

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

                    {row.isExpandable && expandedRows[row.key] && (
                      <div
                        className="grid border-b bg-gray-50"
                        style={{
                          gridTemplateColumns: isScrollable
                            ? `200px repeat(${months.length}, 150px)`
                            : `200px repeat(${months.length}, 1fr)`,
                        }}
                      >
                        <div className="p-3 pl-8 sticky left-0 bg-gray-50" />

                        {months.map((_, j) => (
                          <div key={j} className="p-3 text-center text-gray-500 font-medium">
                            -
                          </div>
                        ))}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
          </Spin>
        </Card>
        <Modal
          title="Customize Rows"
          open={openSettings}
          onCancel={() => setOpenSettings(false)}
          footer={null}
          width={900}
        >
          {/* Select All */}
          <div className="mb-3 flex items-center gap-2">
            <Checkbox
              checked={visibleRows.length === rows.length}
              onChange={(e) => {
                if (e.target.checked) {
                  setVisibleRows(rows.map((r) => r.key));
                } else {
                  setVisibleRows([]);
                }
              }}
            >
              Select All
            </Checkbox>
          </div>

          <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
            {rows.map((row) => (
              <div
                key={row.key}
                className="flex items-center justify-between gap-2 p-2 bg-gray-100 rounded whitespace-nowrap"
              >
                <Checkbox
                  className="whitespace-nowrap"
                  checked={visibleRows.includes(row.key)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setVisibleRows([...visibleRows, row.key]);
                    } else {
                      setVisibleRows(visibleRows.filter((r) => r !== row.key));
                    }
                  }}
                >
                  {row.label}
                </Checkbox>

                {/* <span className="text-blue-500 text-xs cursor-pointer">i</span> */}
              </div>
            ))}
          </div>
        </Modal>
      </main>
    </>
  );
}
