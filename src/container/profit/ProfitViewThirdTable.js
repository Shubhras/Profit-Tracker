import React, { useEffect } from 'react';
import { Table, Card } from 'antd';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ProfitFilterBar from './component/ProfitFilterBar';
import { getProfitDetailsByParentId } from '../../redux/dashboard/actionCreator';
import { PageHeader } from '../../components/page-headers/page-headers';

export default function ProfitDetailsView() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [showFilters, setShowFilters] = React.useState(false);

  const { profitData, dateRange, channel: globalChannel, loading } = useSelector((state) => state.dashboard);

  const [filters, setFilters] = React.useState({
    channel: '',
    sku: '',
    productId: '',
    parentId: '',
    mkt: '',
    ads: 'without',
    gst: 'without',
    estimate: 'with',
    expenses: 'with',
    accountCharges: 'with',
  });

  const PageRoutes = [
    { path: 'index', breadcrumbName: 'Profit' },
    { path: '', breadcrumbName: 'Profit Details' },
  ];

  const apipayload = {
    filters: {
      fromDate: dateRange?.fromDate || null,
      toDate: dateRange?.toDate || null,
      channel: {
        IN: globalChannel,
      },
      parentProductId: id,
    },
    //   "metric": {
    //     "ctaaction": "(profit != 0)",
    //     "expense": "withExpense",
    //     "ads": "withAds"
    //   },
    pagination: {
      pageNo: 0,
      pageSize: 25,
    },
  };

  useEffect(() => {
    if (!id) return;
    dispatch(getProfitDetailsByParentId(apipayload));
  }, [id, dateRange, globalChannel]);

  const dataSource =
    profitData?.data?.map((item, index) => ({
      key: index,
      channel: item.channel,
      view: item.view,
      returnqty: item.returnqty,
      returnPercent: item.returnPercent,
      netsales: item.netsales,
      shipping: item.shipping,
      adSpend: item.adSpend,
      gst: item.gst,
      std: item.std,
      profit: item.profit,
      profitPercent: item.profitPercent,
    })) || [];

  const columns = [
    {
      title: '',
      dataIndex: 'channel',
      width: 150,
      fixed: 'left',
    },
    {
      title: 'View',
      dataIndex: 'view',
      align: 'center',
      sorter: (a, b) => a.view - b.view,
    },
    {
      title: 'Return Qty',
      dataIndex: 'returnqty',
      align: 'center',
      sorter: (a, b) => a.returnqty - b.returnqty,
    },
    {
      title: 'Return %',
      dataIndex: 'returnPercent',
      align: 'center',
      sorter: (a, b) => a.returnPercent - b.returnPercent,
    },
    {
      title: 'Net Sales',
      dataIndex: 'netsales',
      align: 'center',
      sorter: (a, b) => a.netsales - b.netsales,
    },
    {
      title: 'Shipping',
      dataIndex: 'shipping',
      align: 'center',
      sorter: (a, b) => a.shipping - b.shipping,
    },
    {
      title: 'Ad Spend',
      dataIndex: 'adSpend',
      align: 'center',
      sorter: (a, b) => a.adSpend - b.adSpend,
    },
    {
      title: 'GST to pay',
      dataIndex: 'gst',
      align: 'center',
      sorter: (a, b) => a.gst - b.gst,
    },
    {
      title: 'std cost',
      dataIndex: 'std',
      align: 'center',
      sorter: (a, b) => a.std - b.std,
    },
    {
      title: 'Profit',
      dataIndex: 'profit',
      align: 'center',
      sorter: (a, b) => a.profit - b.profit,
      render: (v) => <span style={{ color: v < 0 ? 'red' : 'green' }}>₹{v}</span>,
    },
    {
      title: 'Profit %',
      dataIndex: 'profitPercent',
      align: 'center',
      sorter: (a, b) => a.profitPercent - b.profitPercent,
    },
  ];
  const handleApply = () => {
    const payload = {
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      channel: filters.channel ? { IN: [filters.channel] } : undefined,
      sku: filters.sku,
      productId: filters.productId,
      parentProductId: filters.parentId,
      mkt: filters.mkt,
      ads: filters.ads,
      gst: filters.gst,
      estimate: filters.estimate,
      expenses: filters.expenses,
      accountCharges: filters.accountCharges,
    };

    dispatch(getProfitDetailsByParentId(payload));
    setShowFilters(false);
  };

  const handleClear = () => {
    setFilters({
      channel: '',
      sku: '',
      productId: '',
      parentId: '',
      mkt: '',

      ads: 'without',
      gst: 'without',
      estimate: 'with',
      expenses: 'with',
      accountCharges: 'with',
    });
  };

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        // title={`Profit Third Table - ${id}`}
        className="flex justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 bg-transparent"
      />

      <main className="min-h-[600px] px-8 pb-[30px]">
        <Card bordered={false}>
          <ProfitFilterBar
            filters={filters}
            setFilters={setFilters}
            handleApply={handleApply}
            handleClear={handleClear}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />

          <Table
            columns={columns}
            dataSource={dataSource}
            showSorterTooltip={false}
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
            }}
            size="small"
            scroll={{ x: 'max-content' }}
          />
        </Card>
      </main>
    </>
  );
}
