import React, { useEffect, useState } from 'react';
import { Table, Card, Button } from 'antd';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { RightOutlined, CheckOutlined, CloseOutlined, CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/page-headers/page-headers';
import { getPivotStats } from '../../redux/dashboard/actionCreator';

export default function SalesTrend() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showChart, setShowChart] = React.useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });
  const [filters, setFilters] = React.useState({
    channel: '',
    qty: 'grossqty',
    sku: '',
    productId: '',
    parentId: '',
    mktCategory: '',
    invMasterSku: '',
  });
  const { pivotData, loading, dateRange, search, channel: globalChannel } = useSelector((state) => state.dashboard);
  const graphData = React.useMemo(() => {
    if (!pivotData?.results?.length) return [];

    const row = pivotData.results[0];

    return Object.keys(row)
      .filter((key) => key !== 'id')
      .map((key) => ({
        date: key,
        value: row[key],
      }));
  }, [pivotData]);

  const payload = {
    filter: {
      channel: {
        IN: globalChannel,
      },
      fromDate: dateRange?.fromDate || null,
      endDate: dateRange?.endDate || null,
      search,
    },

    metrics: {
      sku: filters.sku,
      productId: filters.productId,
      ParentId: filters.parentId,
      mkt: filters.mktCategory,
      qty: filters.qty,
      invMasterSku: filters.invMasterSku,
    },
    pagination: {
      pageNo: 0,
      pageSize: 25,
    },
  };
  useEffect(() => {
    dispatch(getPivotStats(payload));
  }, [dispatch, dateRange, search, globalChannel]);

  const PageRoutes = [
    {
      path: 'index',
      breadcrumbName: 'Profit',
    },
    {
      path: '',
      breadcrumbName: 'Sales Trend',
    },
  ];

  const generateDates = (start, end) => {
    const dates = [];
    const current = new Date(start);
    const last = new Date(end);

    while (current <= last) {
      dates.push(current.toISOString().split('T')[0]); // yyyy-mm-dd
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const dynamicColumns = React.useMemo(() => {
    if (!dateRange?.fromDate || !dateRange?.endDate) return [];

    const dates = generateDates(dateRange.fromDate, dateRange.endDate);

    return dates.map((date) => ({
      title: new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
      }),
      dataIndex: date,
      key: date,
      align: 'center',
      sorter: (a, b) => (a[date] || 0) - (b[date] || 0),
      render: (_, record) => record[date] || 0, // fallback
    }));
  }, [dateRange]);

  // const dynamicColumns = React.useMemo(() => {
  //   if (!pivotData?.results?.length) return [];

  //   const firstRow = pivotData.results[0];

  //   return Object.keys(firstRow)
  //     .filter((key) => key !== 'id')
  //     .map((key) => ({
  //       title: new Date(key)
  //         .toLocaleDateString('en-US', {
  //           month: 'short',
  //           day: '2-digit',
  //         })
  //         .replace(',', ''),
  //       dataIndex: key,
  //       key,
  //       align: 'center',
  //       sorter: (a, b) => (a[key] || 0) - (b[key] || 0),
  //     }));
  // }, [pivotData]);
  const columns = [
    {
      title: '',
      dataIndex: 'id',
      fixed: 'left',
      width: 120,
    },
    ...dynamicColumns,
    {
      title: '',
      key: 'action',
      fixed: 'right',
      width: 50,
      render: (_, record) => (
        <button
          type="button"
          onClick={() => navigate(`../salesdetails/${record.id}`)}
          style={{
            width: 28,
            height: 28,
            border: '1px solid #d9d9d9',
            borderRadius: 6,
            background: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 'auto',
          }}
        >
          <RightOutlined style={{ fontSize: 12 }} />
        </button>
      ),
    },
  ];
  const handleChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApply = () => {
    const newPayload = {
      ...payload,
      ...filters,
    };
    dispatch(getPivotStats(newPayload));
    setShowFilters(false);
  };

  const handleClear = () => {
    setFilters({
      channel: '',
      qty: 'grossqty',
      sku: '',
      productId: '',
      parentId: '',
      mktCategory: '',
      invMasterSku: '',
    });
  };
  const dataSource =
    pivotData?.results?.map((item, index) => ({
      key: index,
      ...item,
    })) || [];
  const getTotal = (key) => {
    return dataSource.reduce((sum, row) => sum + (row[key] || 0), 0);
  };

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Sales Trend"
        className="flex  justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      />
      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
        <Card bordered={false} className="sales-table-wrapper">
          <div className="mb-3 p-3 border border-gray-200 rounded-xl bg-gray-50">
            <div className="flex flex-wrap items-center gap-4">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none"
                onChange={(e) => handleChange('channel', e.target.value)}
              >
                <option>Channel</option>
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none"
                onChange={(e) => handleChange('qty', e.target.value)}
              >
                <option value="grossqty">Gross Qty</option>
              </select>

              <span className="text-sm text-gray-500">0 Filter Selected</span>

              <div className="ml-auto flex items-center gap-2">
                <Button
                  // type="button"
                  onClick={handleClear}
                  className="flex items-center gap-2"
                  // className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 bg-white hover:bg-gray-100 transition"
                >
                  <span>Clear</span>
                  <CloseOutlined className="text-gray-500" />
                </Button>

                <Button
                  type="primary"
                  onClick={handleApply}
                  className="flex items-center gap-2"
                  // className="flex items-center gap-2 px-4 py-1.5 text-sm bg-green-600 text-white hover:bg-blue-700 transition"
                >
                  <span>Apply</span>
                  <CheckOutlined />
                </Button>
                <Button
                  type="text"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFilters((prev) => !prev);
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
                >
                  {showFilters ? (
                    <CaretUpOutlined className="text-[#0B3A6E] text-xs leading-none" />
                  ) : (
                    <CaretDownOutlined className="text-[#0B3A6E] text-xs leading-none" />
                  )}
                </Button>
              </div>
            </div>
            {showFilters && (
              <div className="flex items-end gap-4 overflow-x-auto whitespace-nowrap pb-1">
                <div className="min-w-[180px]">
                  <label className="text-s text-gray-600 mb-1 block">SKU</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none"
                    placeholder="Sku"
                    value={filters.sku}
                    onChange={(e) => handleChange('sku', e.target.value)}
                  />
                </div>

                <div className="min-w-[180px]">
                  <label className="text-s text-gray-600 mb-1 block">ProductId</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none"
                    placeholder="ProductId"
                    value={filters.productId}
                    onChange={(e) => handleChange('productId', e.target.value)}
                  />
                </div>

                <div className="min-w-[180px]">
                  <label className="text-s text-gray-600 mb-1 block">ParentId</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none"
                    placeholder="ParentId"
                    value={filters.parentId}
                    onChange={(e) => handleChange('parentId', e.target.value)}
                  />
                </div>

                <div className="min-w-[180px]">
                  <label className="text-s text-gray-600 mb-1 block">MKT category</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none"
                    placeholder="MktCategory"
                    value={filters.mktCategory}
                    onChange={(e) => handleChange('mktCategory', e.target.value)}
                  />
                </div>

                <div className="min-w-[180px]">
                  <label className="text-s text-gray-600 mb-1 block">Inv MasterSku</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none"
                    placeholder="Inv mastersku"
                    value={filters.invMasterSku}
                    onChange={(e) => handleChange('invMasterSku', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end mb-3">
            {' '}
            <button
              type="button"
              onClick={() => setShowChart(!showChart)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 bg-white hover:bg-gray-100 transition"
            >
              {showChart ? 'Hide Chart' : 'View Chart'}
            </button>
          </div>
          {showChart && (
            <Card className="mb-5 bg-gray-100 rounded-xl">
              <div style={{ marginBottom: 10, fontWeight: 500 }}>Chart View - Total</div>

              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={graphData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(val) =>
                      new Date(val).toLocaleDateString('en-US', {
                        month: 'short',
                        day: '2-digit',
                      })
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(val) =>
                      new Date(val).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: '2-digit',
                      })
                    }
                  />

                  <Line type="monotone" dataKey="value" stroke="#1677ff" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}
          <Table
            columns={columns}
            dataSource={dataSource}
            showSorterTooltip={false}
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            onChange={(pag) => {
              setPagination(pag);
            }}
            scroll={{ x: 'max-content' }}
            size="small"
            summary={() => (
              <Table.Summary.Row className="custom-total-row">
                <Table.Summary.Cell index={0} fixed="left">
                  Total
                </Table.Summary.Cell>

                {dynamicColumns.map((col, index) => (
                  <Table.Summary.Cell key={index} align="center">
                    {getTotal(col.dataIndex)}
                  </Table.Summary.Cell>
                ))}
              </Table.Summary.Row>
            )}
          />
        </Card>
      </main>
    </>
  );
}
