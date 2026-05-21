import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Table, Tooltip, Tag } from 'antd';
import { FilterOutlined, ExportOutlined, SearchOutlined, RightOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getAdProductsDetails } from '../../redux/advertising/actionCreator';

function AdProductsDetails() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { sku } = useParams();

  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });

  // const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);

  const { loading, adsProductsDataDetails } = useSelector((state) => ({
    loading: state.advertising.loading,
    adsProductsDataDetails: state.advertising.adsProductsDataDetails,
  }));

  useEffect(() => {
    const payload = {
      sku,
      // start_date: '2026-05-01',
      // end_date: '2026-05-20',
    };

    dispatch(getAdProductsDetails(pagination.current, pagination.pageSize, payload));
  }, [dispatch, pagination, sku]);

  const dataSource =
    adsProductsDataDetails?.results?.map((item) => ({
      key: item.id,
      id: item.id,
      campaignId: item.campaign_id,
      name: item.name,
      state: item.state,
      campaignType: item.campaign_type,
      targetingType: item.targeting_type,
      dailyBudget: item.daily_budget,
      budgetType: item.budget_type,
      biddingStrategy: item.bidding_strategy,
      startDate: item.start_date,
      totalAds: item.total_ads,
      impressions: item.impressions,
      clicks: item.clicks,
      cost: item.cost,
      sales: item.sales,
      orders: item.orders,
      units: item.units,
      acos: item.acos,
      roas: item.roas,
    })) || [];
  const columns = [
    {
      title: 'Campaign ID',
      dataIndex: 'campaignId',
      align: 'center',
    },

    {
      title: 'Campaign Name',
      dataIndex: 'name',
      align: 'center',
      render: (v) => (
        <Tooltip title={v}>
          <span className="block truncate font-medium text-[#111827] mx-auto" style={{ maxWidth: '220px' }}>
            {v}
          </span>
        </Tooltip>
      ),
    },

    {
      title: 'State',
      dataIndex: 'state',
      align: 'center',
      render: (v) => (
        <Tag color={v === 'ENABLED' ? 'success' : 'error'} className="!rounded-full !px-3">
          {v}
        </Tag>
      ),
    },

    {
      title: 'Targeting Type',
      dataIndex: 'targetingType',
      align: 'center',
    },

    {
      title: 'Daily Budget',
      dataIndex: 'dailyBudget',
      align: 'center',
      render: (v) => <span className="font-medium">₹{v}</span>,
    },

    {
      title: 'Budget Type',
      dataIndex: 'budgetType',
      align: 'center',
    },

    {
      title: 'Bidding Strategy',
      dataIndex: 'biddingStrategy',
      align: 'center',
      render: (v) => <span className="text-[#2563eb] font-medium">{v || '-'}</span>,
    },

    {
      title: 'Start Date',
      dataIndex: 'startDate',
      align: 'center',
    },

    {
      title: 'Total Ads',
      dataIndex: 'totalAds',
      align: 'center',
    },

    {
      title: 'Impressions',
      dataIndex: 'impressions',
      align: 'center',
    },

    {
      title: 'Clicks',
      dataIndex: 'clicks',
      align: 'center',
    },

    {
      title: 'Cost',
      dataIndex: 'cost',
      align: 'center',
      render: (v) => <span className="font-medium text-[#dc2626]">₹{v}</span>,
    },

    {
      title: 'Sales',
      dataIndex: 'sales',
      align: 'center',
      render: (v) => <span className="font-medium text-[#16a34a]">₹{v}</span>,
    },

    {
      title: 'Orders',
      dataIndex: 'orders',
      align: 'center',
    },

    {
      title: 'Units',
      dataIndex: 'units',
      align: 'center',
    },

    {
      title: 'ACOS',
      dataIndex: 'acos',
      align: 'center',
      render: (v) => (
        <Tag color={v > 40 ? 'error' : 'processing'} className="!rounded-full !px-3">
          {v}%
        </Tag>
      ),
    },

    {
      title: 'ROAS',
      dataIndex: 'roas',
      align: 'center',
      render: (v) => (
        <Tag color={v >= 1 ? 'success' : 'warning'} className="!rounded-full !px-3">
          {v}
        </Tag>
      ),
    },

    {
      title: 'Action',
      dataIndex: 'action',
      width: 100,
      fixed: 'right',
      align: 'center',

      render: (_, record) => (
        <button
          type="button"
          onClick={() => {
            navigate(`../AdsProducts/${record.campaignId}`);
          }}
          className="w-[34px] h-[34px] rounded-full border border-[#dbe1e8] flex items-center justify-center cursor-pointer hover:text-black transition-all duration-200 mx-auto"
        >
          <RightOutlined />
        </button>
      ),
    },
  ];

  return (
    <>
      <div className="p-2">
        <div className="mt-3 mb-3 rounded-2xl border border-[#e5e7eb] bg-white shadow-sm overflow-hidden">
          {/* Header */}
          {/* Header */}
          <div className="border-b border-[#edf0f2] px-6 py-4">
            {/* Top Content */}
            <div className="flex items-start justify-between gap-4">
              {/* LEFT SECTION */}
              <div className="flex items-center gap-4">
                {/* BACK BUTTON */}
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-[42px] h-[42px] rounded-xl border border-[#dbe1e8] bg-white flex items-center justify-center hover:bg-[#f8fafc] transition-all duration-200 shadow-sm"
                >
                  <ArrowLeftOutlined className="text-[#374151]" />
                </button>

                {/* HEADING */}
                <div className="flex flex-col">
                  <h1 className="text-[24px] font-semibold text-[#111827] leading-[30px] mb-1">Campaigns Products</h1>

                  <p className="mt-1 text-sm text-[#6b7280]">
                    Track ad products performance and marketplace level product data.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="mt-5 flex items-center justify-between gap-3">
              {/* LEFT SIDE */}
              <div className="relative w-[280px]">
                <input
                  type="text"
                  placeholder="Search ad products..."
                  className="w-full h-[42px] rounded-xl border bg-white pl-11 pr-4 text-[14px] text-[#111827] outline-none shadow-sm transition-all duration-200 focus:border-[#dbe1e8]"
                />

                <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[15px]" />
              </div>

              {/* RIGHT SIDE BUTTONS */}
              <div className="flex items-center gap-3">
                {/* FILTER */}
                <Button
                  icon={<FilterOutlined />}
                  className="!h-[42px] !px-5 !rounded-xl border border-[#dbe1e8] bg-white !text-[#111827] !font-medium !flex !items-center !justify-center"
                >
                  Filters
                </Button>

                {/* EXPORT */}
                <Button
                  type="primary"
                  icon={<ExportOutlined />}
                  className="!h-[42px] !px-5 !rounded-xl !font-medium !flex !items-center !justify-center "
                >
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={dataSource}
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: adsProductsDataDetails?.pagination?.total_records || 0,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
            }}
            onChange={(pag) => {
              setPagination({
                current: pag.current,
                pageSize: pag.pageSize,
              });
            }}
            scroll={{ x: 'max-content' }}
            size="middle"
            bordered={false}
          />
        </div>
      </div>
    </>
  );
}

export default AdProductsDetails;
