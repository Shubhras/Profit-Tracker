import React from 'react';
import { Table, Card } from 'antd';
import { useParams } from 'react-router-dom';
import ProfitFilterBar from './component/ProfitFilterBar';
import { PageHeader } from '../../components/page-headers/page-headers';

export default function ProfitDetailsView() {
  const { id } = useParams();
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

  const dataSource = [
    {
      key: 1,
      channel: 'Amazon-India',
      view: 50000,
      qty: 120,
      netQty: 100,
      returnqty: 20,
      returnPercent: 16,
      netsales: 45000,
      netasp: 450,
      net_discount: 2000,
      mpfees: 3000,
      shipping: 1500,
      adSpend: 2000,
      gst: 2500,
      grossprofit: 8000,
      profit: 6000,
      profitPercent: 12,
      settledamount: 5500,
    },
  ];

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
      title: 'Qty',
      dataIndex: 'qty',
      align: 'center',
      sorter: (a, b) => a.qty - b.qty,
    },
    {
      title: 'Net Qty',
      dataIndex: 'netQty',
      align: 'center',
      sorter: (a, b) => a.netQty - b.netQty,
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
      title: 'Net asp',
      dataIndex: 'netasp',
      align: 'center',
      sorter: (a, b) => a.netasp - b.netasp,
    },
    {
      title: 'Net discount',
      dataIndex: 'net_discount',
      align: 'center',
      sorter: (a, b) => a.net_discount - b.net_discount,
    },
    {
      title: 'MP fees',
      dataIndex: 'mpfees',
      align: 'center',
      sorter: (a, b) => a.mpfees - b.mpfees,
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
      title: 'GST',
      dataIndex: 'gst',
      align: 'center',
      sorter: (a, b) => a.gst - b.gst,
    },
    {
      title: 'Gross Profit',
      dataIndex: 'grossprofit',
      align: 'center',
      sorter: (a, b) => a.grossprofit - b.grossprofit,
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
    {
      title: 'Settled amount',
      dataIndex: 'settledamount',
      align: 'center',
      sorter: (a, b) => a.settledamount - b.settledamount,
    },
  ];
  const handleApply = () => {
    console.log('Apply clicked', filters);
  };

  const handleClear = () => {
    setFilters({
      channel: '',
      sku: '',
      productId: '',
      parentId: '',
      mkt: '',
      ads: '',
      gst: '',
      estimate: '',
      expenses: '',
      accountCharges: '',
    });
  };

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title={`Profit Third Table - ${id}`}
        className="flex justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 bg-transparent"
      />

      <main className="min-h-[600px] px-8 pb-[30px]">
        <Card bordered={false}>
          <ProfitFilterBar
            filters={filters}
            setFilters={setFilters}
            handleApply={handleApply}
            handleClear={handleClear}
          />

          <Table
            columns={columns}
            dataSource={dataSource}
            showSorterTooltip={false}
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        </Card>
      </main>
    </>
  );
}
