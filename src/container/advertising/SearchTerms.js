import React, { useEffect } from 'react';
import { Button, Table, Tag, Tooltip } from 'antd';
import { FilterOutlined, ExportOutlined, SearchOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getSearchTerms } from '../../redux/advertising/actionCreator';

function SearchTerms() {
  const dispatch = useDispatch();

  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });

  const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);

  const { searchTerms, loading } = useSelector((state) => state.advertising);

  useEffect(() => {
    dispatch(getSearchTerms(pagination.current, pagination.pageSize));
  }, [dispatch, pagination]);

  const dataSource =
    searchTerms?.data?.map((item) => ({
      key: item.id,

      id: item.id,
      campaignId: item.campaign_id,
      campaignName: item.campaign_name,
      searchTerm: item.search_term,
      reportDate: item.report_date,

      impressions: item.impressions,
      clicks: item.clicks,
      cost: item.cost,
      sales: item.sales,
      orders: item.orders,
      acos: item.acos,
      roas: item.roas,
    })) || [];

  const columns = [
    {
      title: (
        <input
          type="checkbox"
          checked={dataSource.length > 0 && selectedRowKeys.length === dataSource.length}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRowKeys(dataSource.map((item) => item.key));
            } else {
              setSelectedRowKeys([]);
            }
          }}
          aria-label="Select all"
          className="w-[15px] h-[15px] cursor-pointer accent-[#2563eb]"
        />
      ),
      dataIndex: 'checkbox',
      width: 60,
      fixed: 'left',

      render: (_, record) => (
        <input
          type="checkbox"
          checked={selectedRowKeys.includes(record.key)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRowKeys([...selectedRowKeys, record.key]);
            } else {
              setSelectedRowKeys(selectedRowKeys.filter((key) => key !== record.key));
            }
          }}
          aria-label="Select row"
          className="w-[15px] h-[15px] cursor-pointer accent-[#2563eb]"
        />
      ),
    },

    {
      title: 'Campaign Name',
      dataIndex: 'campaignName',
      align: 'center',
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="block truncate cursor-pointer" style={{ maxWidth: '220px' }}>
            {v}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Search Term',
      dataIndex: 'searchTerm',
      align: 'center',
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="block truncate font-medium text-[#2563eb] cursor-pointer" style={{ maxWidth: '220px' }}>
            {v}
          </span>
        </Tooltip>
      ),
    },

    {
      title: 'Report Date',
      dataIndex: 'reportDate',
      align: 'center',
      sorter: (a, b) => a.reportDate - b.reportDate,
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
      title: 'ACOS',
      dataIndex: 'acos',
      align: 'center',
      render: (v) => <Tag color={v > 40 ? 'error' : 'processing'}>{v}%</Tag>,
    },

    {
      title: 'ROAS',
      dataIndex: 'roas',
      align: 'center',
      render: (v) => <Tag color={v >= 1 ? 'success' : 'warning'}>{v}</Tag>,
    },
  ];

  return (
    <div className="p-2">
      <div className="mt-3 mb-3 rounded-2xl border border-[#e5e7eb] bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="border-b border-[#edf0f2] px-6 py-4">
          {/* TOP CONTENT */}
          <div>
            <h1 className="text-[23px] font-semibold text-[#111827] mb-1">Search Terms</h1>

            <p className="mt-1 text-sm text-[#6b7280]">
              Track ad group performance, bids, campaigns and marketplace activity.
            </p>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="relative w-[280px]">
              <input
                type="text"
                placeholder="Search ad groups..."
                className="w-full h-[42px] rounded-xl border border-[#dbe1e8] bg-white pl-11 pr-4 text-[14px] text-[#111827] outline-none"
              />

              <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[15px]" />
            </div>

            <div className="flex items-center gap-3">
              <Button
                icon={<FilterOutlined />}
                className="!h-[42px] !px-5 !rounded-xl !border-[#dbe1e8] !text-[#374151] !font-medium hover:!border-[#2563eb] hover:!text-[#2563eb] !shadow-sm !flex !items-center !justify-center"
              >
                Filters
              </Button>

              <Button
                type="primary"
                icon={<ExportOutlined />}
                className="!h-[42px] !px-5 !rounded-xl !font-medium !flex !items-center !justify-center"
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
            total: searchTerms?.pagination?.total_records || 0,
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
  );
}

export default SearchTerms;
