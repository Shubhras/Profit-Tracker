import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Table, Tooltip, Tag } from 'antd';
import { FilterOutlined, ExportOutlined, SearchOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getProductsAds } from '../../redux/advertising/actionCreator';

function AdProductsThird() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });

  // const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);

  const { loading, productsAds } = useSelector((state) => ({
    loading: state.advertising.loading,
    productsAds: state.advertising.productsAds,
  }));

  useEffect(() => {
    const payload = {
      campaign_id: id,
      search: debouncedSearch,
    };

    dispatch(getProductsAds(pagination.current, pagination.pageSize, payload));
  }, [dispatch, pagination.current, pagination.pageSize, id, debouncedSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  const dataSource =
    productsAds?.results?.map((item) => ({
      key: item.id,
      id: item.id,
      adGroupId: item.ad_group_id,
      campaignId: item.campaign_id,
      campaignName: item.campaign_name,
      name: item.name,
      state: item.state,
      defaultBid: item.default_bid,
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
      title: 'Ad Group ID',
      dataIndex: 'adGroupId',
      align: 'center',
      fixed: 'left',
      width: '70',
      ellipsis: true,
      sorter: (a, b) => a.adGroupId - b.adGroupId,
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="font-medium text-[#2563eb] block truncate cursor-pointer">{v}</span>
        </Tooltip>
      ),
    },

    {
      title: 'Campaign ID',
      dataIndex: 'campaignId',
      align: 'center',
      width: '70',
      ellipsis: true,
      sorter: (a, b) => a.campaignId - b.campaignId,
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="block truncate cursor-pointer">{v}</span>
        </Tooltip>
      ),
    },

    {
      title: 'Campaign Name',
      dataIndex: 'campaignName',
      align: 'center',
      width: '70',
      sorter: (a, b) => String(a.campaignName).localeCompare(String(b.campaignName)),
      ellipsis: true,
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span
            className="block truncate font-medium text-[#111827] mx-auto cursor-pointer"
            style={{ maxWidth: '220px' }}
          >
            {v}
          </span>
        </Tooltip>
      ),
    },

    {
      title: 'Ad Group Name',
      dataIndex: 'name',
      align: 'center',
      width: '70',
      ellipsis: true,
      sorter: (a, b) => String(a.name).localeCompare(String(b.name)),
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span
            className="block truncate font-medium text-[#2563eb] mx-auto cursor-pointer"
            style={{ maxWidth: '220px' }}
          >
            {v}
          </span>
        </Tooltip>
      ),
    },

    {
      title: 'State',
      dataIndex: 'state',
      align: 'center',
      width: '70',
      sorter: (a, b) => String(a.state).localeCompare(String(b.state)),
      ellipsis: true,
      render: (v) => (
        <Tag color={v === 'ENABLED' ? 'success' : 'error'} className="!rounded-full !px-3">
          {v}
        </Tag>
      ),
    },

    {
      title: 'Default Bid',
      dataIndex: 'defaultBid',
      align: 'center',
      width: '70',
      ellipsis: true,
      render: (v) => <span className="font-medium text-[#2563eb]">₹{v}</span>,
    },

    {
      title: 'Total Ads',
      dataIndex: 'totalAds',
      align: 'center',
      width: '70',
      ellipsis: true,
      sorter: (a, b) => a.totalAds - b.totalAds,
    },

    {
      title: 'Impressions',
      dataIndex: 'impressions',
      align: 'center',
      width: '70',
      ellipsis: true,
      sorter: (a, b) => a.impressions - b.impressions,
    },

    {
      title: 'Clicks',
      dataIndex: 'clicks',
      align: 'center',
      width: '70',
      sorter: (a, b) => a.clicks - b.clicks,
    },

    {
      title: 'Cost',
      dataIndex: 'cost',
      align: 'center',
      width: '70',
      sorter: (a, b) => a.cost - b.cost,
      render: (v) => (
        <Tooltip title={`₹${v}`} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="font-medium text-[#dc2626] block truncate cursor-pointer">₹{v}</span>
        </Tooltip>
      ),
    },

    {
      title: 'Sales',
      dataIndex: 'sales',
      align: 'center',
      width: 70,
      sorter: (a, b) => a.sales - b.sales,
      render: (v) => (
        <Tooltip title={`₹${v}`} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="font-medium text-[#16a34a] block truncate cursor-pointer">₹{v}</span>
        </Tooltip>
      ),
    },

    {
      title: 'Orders',
      dataIndex: 'orders',
      align: 'center',
      width: 70,
      sorter: (a, b) => a.orders - b.orders,
    },

    {
      title: 'Units',
      dataIndex: 'units',
      align: 'center',
      width: 70,
      sorter: (a, b) => a.units - b.units,
    },

    {
      title: 'ACOS',
      dataIndex: 'acos',
      align: 'center',
      width: 70,
      sorter: (a, b) => a.acos - b.acos,
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
      width: 70,
      sorter: (a, b) => a.roas - b.roas,
      render: (v) => (
        <Tag color={v >= 1 ? 'success' : 'warning'} className="!rounded-full !px-3">
          {v}
        </Tag>
      ),
    },
  ];

  return (
    <>
      <div className="p-2">
        <div className="mt-3 mb-3 rounded-2xl border border-[#e5e7eb] bg-white shadow-sm overflow-hidden">
          {/* Header */}
          <div className="border-b border-[#edf0f2] px-3 py-3">
            {/* Top Content */}
            <div className="flex items-start justify-between gap-4">
              {/* LEFT SECTION */}
              <div className="flex items-center gap-4">
                {/* BACK BUTTON */}
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-[35px] h-[35px] rounded-xl border border-[#dbe1e8] bg-white flex items-center justify-center hover:bg-[#f8fafc] transition-all duration-200 shadow-sm"
                >
                  <ArrowLeftOutlined className="text-[#374151]" />
                </button>

                {/* HEADING */}
                <div className="flex flex-col">
                  <h1 className="text-[19px] font-semibold text-[#111827] mb-1">Products Groups</h1>

                  <p className="text-sm text-[#6b7280]">
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
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search ad products..."
                  className="w-full h-[30px] rounded-xl border bg-white pl-11 pr-4 text-[14px] text-[#111827] outline-none shadow-sm transition-all duration-200 focus:border-[#dbe1e8]"
                />

                <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[15px]" />
              </div>

              {/* RIGHT SIDE BUTTONS */}
              <div className="flex items-center gap-3">
                {/* FILTER */}
                <Button
                  icon={<FilterOutlined />}
                  className="!h-[30px] text-[13px] !px-5 !rounded-xl border border-[#dbe1e8] bg-white !text-[#111827] !font-medium !flex !items-center !justify-center"
                >
                  Filters
                </Button>

                {/* EXPORT */}
                <Button
                  type="primary"
                  icon={<ExportOutlined />}
                  className="!h-[30px] text-[13px] !px-5 !rounded-xl !font-medium !flex !items-center !justify-center "
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
            showSorterTooltip={false}
            tableLayout="fixed"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: productsAds?.pagination?.total_records || 0,
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
            scroll={{ x: 1200 }}
            size="middle"
            bordered={false}
            className="
    [&_.ant-table-thead>tr>th]:!text-[12px]
    [&_.ant-table-thead>tr>th]:!font-semibold
    [&_.ant-table-tbody>tr>td]:!text-[12px]
    [&_.ant-table-cell]:!px-2
    [&_.ant-table-cell]:!py-2
  "
          />
        </div>
      </div>
    </>
  );
}

export default AdProductsThird;
