import React, { useEffect } from 'react';
import { Button, Table, Tag, Tooltip } from 'antd';
import { FilterOutlined, ExportOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getAdsGroup } from '../../redux/advertising/actionCreator';

function AdGroups() {
  const dispatch = useDispatch();

  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });

  const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);

  const { adsGroupData, loading } = useSelector((state) => state.advertising);

  useEffect(() => {
    dispatch(getAdsGroup(pagination.current, pagination.pageSize));
  }, [dispatch, pagination]);

  const dataSource =
    adsGroupData?.results?.map((item) => ({
      // key: index,
      key: item.ad_group_id,
      checkbox: item.id,
      adGroupId: item.ad_group_id,
      name: item.name,
      state: item.state,
      defaultBid: item.default_bid,
      campaignName: item.campaign_name,
      campaignId: item.campaign_id_value,
      profileId: item.profile_id,
      countryCode: item.country_code,
      currencyCode: item.currency_code,
      createdAt: item.created_at,
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
      title: 'Ad Group ID',
      dataIndex: 'adGroupId',
      align: 'center',
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
      title: 'Name',
      dataIndex: 'name',
      align: 'center',
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="font-medium text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '240px' }}>
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
      title: 'Default Bid',
      dataIndex: 'defaultBid',
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
      title: 'Campaign ID',
      dataIndex: 'campaignId',
      align: 'center',
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
  ];

  return (
    <div className="p-2">
      <div className="mt-3 mb-3 rounded-2xl border border-[#e5e7eb] bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#edf0f2] px-6 py-4">
          <div>
            <h1 className="text-[23px] font-semibold text-[#111827] mb-1">Ads Group Performance</h1>

            <p className="mt-1 text-sm text-[#6b7280]">
              Track ad group performance, bids, campaigns and marketplace activity.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <Button
              icon={<FilterOutlined />}
              className="!h-[40px] !rounded-xl !border-[#dbe1e8] !text-[#374151] !font-medium !flex !items-center !justify-center"
            >
              Filters
            </Button>

            <Button
              type="primary"
              icon={<ExportOutlined />}
              className="!h-[40px] !rounded-xl !bg-[#2563eb] !font-medium !flex !items-center !justify-center"
            >
              Export
            </Button>
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
            total: adsGroupData?.pagination?.total_records || 0,
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

export default AdGroups;
