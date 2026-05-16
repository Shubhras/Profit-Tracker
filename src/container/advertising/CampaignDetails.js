import React, { useEffect } from 'react';
import { Button, Table, Tag, Tooltip } from 'antd';
import { ArrowLeftOutlined, FilterOutlined, ExportOutlined, RightOutlined, SearchOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getAdsGroup } from '../../redux/advertising/actionCreator';

function CampaignDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });

  const { adsGroupData, loading } = useSelector((state) => state.advertising);

  useEffect(() => {
    dispatch(
      getAdsGroup(pagination.current, pagination.pageSize, {
        // search: 'auto',
        // state: 'ENABLED',
        campaign_id: id,
        // ordering: '-created_at',
      }),
    );
  }, [dispatch, pagination, id]);

  const dataSource =
    adsGroupData?.results?.map((item) => ({
      key: item.ad_group_id,
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

  const campaignName = adsGroupData?.results?.[0]?.campaign_name;

  const columns = [
    {
      title: 'Ad Group ID',
      dataIndex: 'adGroupId',
      align: 'center',
      render: (v) => <span className="text-[#2563eb] font-medium">{v}</span>,
    },

    {
      title: 'Name',
      dataIndex: 'name',
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
      title: 'Default Bid',
      dataIndex: 'defaultBid',
      align: 'center',
      render: (v) => `₹${v}`,
    },

    // {
    //   title: 'Campaign ID',
    //   dataIndex: 'campaignId',
    //   align: 'center',
    // },

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
            navigate(`../campaign-second-details/${record.adGroupId}`);
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
          <div className="border-b border-[#edf0f2] px-6 py-4">
            {/* Top Row */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Back Button */}
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-[42px] h-[42px] rounded-xl border border-[#dbe1e8] bg-white flex items-center justify-center hover:bg-[#f8fafc] transition-all duration-200 shadow-sm"
                >
                  <ArrowLeftOutlined className="text-[#374151]" />
                </button>

                <div className="flex flex-col">
                  <h1 className="text-[24px] font-semibold text-[#111827] leading-[30px] mb-1">Campaign Details</h1>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[14px] text-[#6b7280] font-medium">Campaign Name:</span>

                    <div className="min-w-[120px] h-[28px] px-3 rounded-full bg-[#eff6ff] border border-[#bfdbfe] text-[#2563eb] text-[12px] font-semibold flex items-center justify-center ">
                      {campaignName || 'Campaign Details'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="mt-5 flex items-center justify-between gap-3">
              {/* Search */}
              <div className="relative w-[260px]">
                <input
                  type="text"
                  placeholder="Search ad groups..."
                  className="
          w-full
          h-[42px]
          rounded-xl
          border border-[#dbe1e8]
          bg-white
          pl-11
          pr-4
          text-[14px]
          text-[#111827]
          outline-none
          shadow-sm
          focus:border-[#2563eb]
        "
                />

                <SearchOutlined
                  className="
          absolute
          left-4
          top-1/2
          -translate-y-1/2
          text-[#9ca3af]
          text-[15px]
        "
                />
              </div>

              {/* Right Buttons */}
              <div className="flex items-center gap-3">
                <Button
                  icon={<FilterOutlined />}
                  className="
          !h-[40px]
          !rounded-xl
          !border-[#dbe1e8]
          !text-[#374151]
          !font-medium
          !flex
          !items-center
          !justify-center
        "
                >
                  Filters
                </Button>

                <Button
                  type="primary"
                  icon={<ExportOutlined />}
                  className="
          !h-[40px]
          !rounded-xl
          !bg-[#2563eb]
          !font-medium
          !flex
          !items-center
          !justify-center
        "
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
    </>
  );
}

export default CampaignDetails;
