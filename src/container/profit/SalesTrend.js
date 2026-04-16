import React, { useEffect } from 'react';
import { Table, Card } from 'antd';
import { RightOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/page-headers/page-headers';
import { getPivotStats } from '../../redux/dashboard/actionCreator';

export default function SalesTrend() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [filters, setFilters] = React.useState({
    channel: '',
    qty: 'grossqty',
    sku: '',
    productId: '',
    parentId: '',
    mktCategory: '',
    invMasterSku: '',
  });

  const { pivotData, loading, dateRange, search } = useSelector((state) => state.dashboard);
  const payload = {
    fromDate: dateRange?.fromDate || null,
    endDate: dateRange?.endDate || null,
    search,
    // qty: 'grossqty',
    // group_id: 'channel',
    // calender_view: 'date',
  };
  useEffect(() => {
    dispatch(getPivotStats(payload));
  }, [dispatch, dateRange, search]);

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
  const dynamicColumns = React.useMemo(() => {
    if (!pivotData?.results?.length) return [];

    const firstRow = pivotData.results[0];

    return Object.keys(firstRow)
      .filter((key) => key !== 'id')
      .map((key) => ({
        title: new Date(key)
          .toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
          })
          .replace(',', ''),
        dataIndex: key,
        key,
        align: 'center',
        sorter: (a, b) => (a[key] || 0) - (b[key] || 0),
      }));
  }, [pivotData]);
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
          {/* FILTER BAR */}
          {/* FILTER BAR */}
          <div className="mb-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
            {/* TOP ROW */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
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

              {/* RIGHT SIDE BUTTONS */}
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-100 transition"
                >
                  <span>Clear</span>
                  <CloseOutlined className="text-gray-500" />
                </button>

                <button
                  type="button"
                  onClick={handleApply}
                  className="flex items-center gap-2 px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <span>Apply</span>
                  <CheckOutlined />
                </button>
              </div>
            </div>

            {/* BOTTOM ROW */}
            {/* BOTTOM ROW */}
            <div className="flex items-end gap-4 overflow-x-auto whitespace-nowrap pb-1">
              <div className="min-w-[180px]">
                <label className="text-s text-gray-600 mb-1 block">SKU</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none"
                  placeholder="Sku"
                  onChange={(e) => handleChange('sku', e.target.value)}
                />
              </div>

              <div className="min-w-[180px]">
                <label className="text-s text-gray-600 mb-1 block">ProductId</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none"
                  placeholder="ProductId"
                  onChange={(e) => handleChange('productId', e.target.value)}
                />
              </div>

              <div className="min-w-[180px]">
                <label className="text-s text-gray-600 mb-1 block">ParentId</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none"
                  placeholder="ParentId"
                  onChange={(e) => handleChange('parentId', e.target.value)}
                />
              </div>

              <div className="min-w-[180px]">
                <label className="text-s text-gray-600 mb-1 block">MKT category</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none"
                  placeholder="MktCategory"
                  onChange={(e) => handleChange('mktCategory', e.target.value)}
                />
              </div>

              <div className="min-w-[180px]">
                <label className="text-s text-gray-600 mb-1 block">Inv MasterSku</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none"
                  placeholder="Inv mastersku"
                  onChange={(e) => handleChange('invMasterSku', e.target.value)}
                />
              </div>
            </div>
          </div>
          <Table
            columns={columns}
            dataSource={dataSource}
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
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
