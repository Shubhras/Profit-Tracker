import React, { useEffect } from 'react';
import { Button, Table, Tag, Tooltip } from 'antd';
import { FilterOutlined, ExportOutlined, SearchOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getKeywords } from '../../redux/advertising/actionCreator';

function Keywords() {
  const dispatch = useDispatch();

  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });
  const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);

  const { keywordsData, loading } = useSelector((state) => state.advertising);

  useEffect(() => {
    dispatch(getKeywords(pagination.current, pagination.pageSize));
  }, [dispatch, pagination]);

  const dataSource =
    keywordsData?.results?.map((item) => ({
      // key: index,
      key: item.keyword_id,
      keywordId: item.keyword_id,
      keywordText: item.keyword_text,
      matchType: item.match_type,
      state: item.state,
      bid: item.bid,
      campaignName: item.campaign_name,
      adGroupName: item.ad_group_name,
      countryCode: item.country_code,
      currencyCode: item.currency_code,
      createdAt: item.created_at,
      impressions: item.metrics?.impressions,
      clicks: item.metrics?.clicks,
      cost: item.metrics?.cost,
      sales: item.metrics?.sales,
      orders: item.metrics?.orders,
      units: item.metrics?.units,
      acos: item.metrics?.acos,
      roas: item.metrics?.roas,
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
          className="w-[15px] h-[15px] cursor-pointer accent-[#2563eb]"
        />
      ),
    },
    {
      title: 'Keyword ID',
      dataIndex: 'keywordId',
      width: 180,
      render: (v) => {
        const text = String(v);

        return (
          <Tooltip title={text} color="black" overlayInnerStyle={{ color: '#fff' }}>
            <span className="text-[#2563eb] font-medium cursor-pointer">
              {text.length > 9 ? `${text.slice(0, 9)}...` : text}
            </span>
          </Tooltip>
        );
      },
    },

    {
      title: 'Keyword Text',
      dataIndex: 'keywordText',
      align: 'center',
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="font-medium text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '220px' }}>
            {v}
          </span>
        </Tooltip>
      ),
    },

    {
      title: 'Match Type',
      dataIndex: 'matchType',
      align: 'center',
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="font-medium text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '220px' }}>
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
        <Tag color={v === 'ENABLED' ? 'success' : 'error'} className="!px-3 !py-[3px] !rounded-full">
          {v}
        </Tag>
      ),
    },

    {
      title: 'Bid',
      dataIndex: 'bid',
      align: 'center',
      render: (v) => `₹${v}`,
    },

    {
      title: 'Campaign Name',
      dataIndex: 'campaignName',
      align: 'center',
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '220px' }}>
            {v}
          </span>
        </Tooltip>
      ),
    },

    {
      title: 'Ad Group Name',
      dataIndex: 'adGroupName',
      align: 'center',
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '220px' }}>
            {v}
          </span>
        </Tooltip>
      ),
    },

    {
      title: 'Country Code',
      dataIndex: 'countryCode',
      align: 'center',
    },

    {
      title: 'Currency Code',
      dataIndex: 'currencyCode',
      align: 'center',
    },
    {
      title: 'Impressions',
      dataIndex: 'impressions',
      align: 'center',
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },

    {
      title: 'Clicks',
      dataIndex: 'clicks',
      align: 'center',
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },

    {
      title: 'Cost',
      dataIndex: 'cost',
      align: 'center',
      render: (v) => <span className="font-medium text-[#dc2626]">₹{v ?? 0}</span>,
    },

    {
      title: 'Sales',
      dataIndex: 'sales',
      align: 'center',
      render: (v) => <span className="font-medium text-[#16a34a]">₹{v ?? 0}</span>,
    },

    {
      title: 'Orders',
      dataIndex: 'orders',
      align: 'center',
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },

    {
      title: 'Units',
      dataIndex: 'units',
      align: 'center',
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },

    {
      title: 'ACOS',
      dataIndex: 'acos',
      align: 'center',
      render: (v) => (
        <Tag className="!px-3 !py-[3px] !rounded-full" color={v > 100 ? 'error' : 'processing'}>
          {v ? `${v.toFixed(2)}%` : '-'}
        </Tag>
      ),
    },

    {
      title: 'ROAS',
      dataIndex: 'roas',
      align: 'center',
      render: (v) => (
        <Tag className="!px-3 !py-[3px] !rounded-full" color={v >= 1 ? 'success' : 'warning'}>
          {v ? v.toFixed(2) : '-'}
        </Tag>
      ),
    },
  ];

  return (
    <div className="p-2">
      <div className="mt-3 mb-3 rounded-2xl border border-[#e5e7eb] bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="border-b border-[#edf0f2] px-6 py-4">
          {/* TOP CONTENT */}
          <div>
            <h1 className="text-[23px] font-semibold text-[#111827] mb-1">Keywords Performance</h1>

            <p className="mt-1 text-sm text-[#6b7280]">
              Track keyword bids, targeting, ad group performance and marketplace activity.
            </p>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="relative w-[280px]">
              <input
                type="text"
                placeholder="Search keywords..."
                className="w-full h-[42px] rounded-xl border border-[#dbe1e8] bg-white pl-11 pr-4 text-[14px] text-[#111827] outline-none shadow-sm transition-all duration-200 focus:border-[#dbe1e8] hover:border-[#dbe1e8]"
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
                className="!h-[42px] !px-5 !rounded-xl !bg-[#2563eb] !border-[#2563eb] !font-medium hover:!bg-[#1d4ed8] hover:!border-[#1d4ed8] !shadow-sm !flex !items-center !justify-center"
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
            total: keywordsData?.pagination?.total_records || 0,
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

export default Keywords;
