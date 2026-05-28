import React, { useEffect, useState } from 'react';
import { Button, Table, Tag, Tooltip, Modal, Switch } from 'antd';
import { ArrowLeftOutlined, FilterOutlined, ExportOutlined, RightOutlined, SearchOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getAdsGroup } from '../../redux/advertising/actionCreator';

function CampaignDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  // const [selectedRecord, setSelectedRecord] = useState(null);

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
    // }, [dispatch, pagination, id]);
  }, [dispatch, pagination.current, pagination.pageSize, id]);

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
      impressions: item.metrics?.impressions,
      clicks: item.metrics?.clicks,
      cost: item.metrics?.cost,
      sales: item.metrics?.sales,
      orders: item.metrics?.orders,
      units: item.metrics?.units,
      acos: item.metrics?.acos,
      roas: item.metrics?.roas,
      createdAt: item.created_at,
    })) || [];

  const campaignName = adsGroupData?.results?.[0]?.campaign_name;

  const columns = [
    {
      title: 'State',
      dataIndex: 'active',
      align: 'center',
      width: 70,
      fixed: 'left',

      render: (_, record) => {
        const isActive = record.state === 'ENABLED';

        return (
          <div className="flex justify-center">
            <Switch
              size="small"
              checked={isActive}
              onChange={(checked) => {
                console.log('STATUS:', checked ? 'ENABLED' : 'PAUSED', record);

                // API CALL HERE
              }}
              style={{
                transform: 'scale(1.15)',
              }}
            />
          </div>
        );
      },
    },
    {
      title: 'Ad Group ID',
      dataIndex: 'adGroupId',
      align: 'center',
      width: 70,
      sorter: (a, b) => a.adGroupId - b.adGroupId,
      ellipsis: true,
      render: (v) => <span className="text-[#2563eb] font-medium">{v}</span>,
    },

    {
      title: 'Name',
      dataIndex: 'name',
      align: 'center',
      width: 70,
      sorter: (a, b) => String(a.name || '').localeCompare(String(b.name || '')),
      ellipsis: true,
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="font-medium text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '220px' }}>
            {v}
          </span>
        </Tooltip>
      ),
    },

    // {
    //   title: 'State',
    //   dataIndex: 'state',
    //   align: 'center',
    //   render: (v) => (
    //     <Tag color={v === 'ENABLED' ? 'success' : 'error'} className="!px-3 !py-[3px] !rounded-full">
    //       {v}
    //     </Tag>
    //   ),
    // },
    {
      title: 'Default Bid',
      dataIndex: 'defaultBid',
      align: 'center',
      width: 70,
      sorter: (a, b) => a.defaultBid - b.defaultBid,
      ellipsis: true,
      render: (v) => (
        <button
          type="button"
          onClick={() => {
            setSelectedBid(v);
            // setSelectedRecord(record);
            setIsBidModalOpen(true);
          }}
          className="px-3 py-[6px] rounded-xl border border-transparent text-[#111827] font-medium bg-transparent hover:border-[#dbe1e8] hover:bg-white hover:shadow-sm transition-all duration-200"
        >
          ₹{v}
        </button>
      ),
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
      width: 70,
      sorter: (a, b) => a.countryCode - b.countryCode,
      ellipsis: true,
    },

    {
      title: 'Currency Code',
      dataIndex: 'currencyCode',
      align: 'center',
      width: 70,
      sorter: (a, b) => String(a.currencyCode || '').localeCompare(String(b.currencyCode || '')),
      ellipsis: true,
    },
    {
      title: 'Impressions',
      dataIndex: 'impressions',
      align: 'center',
      width: 70,
      sorter: (a, b) => a.impressions - b.impressions,
      ellipsis: true,
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },

    {
      title: 'Clicks',
      dataIndex: 'clicks',
      align: 'center',
      width: 70,
      sorter: (a, b) => a.clicks - b.clicks,
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },

    {
      title: 'Cost',
      dataIndex: 'cost',
      align: 'center',
      width: 70,
      sorter: (a, b) => a.cost - b.cost,
      render: (v) => <span className="font-medium text-[#dc2626]">₹{v ?? 0}</span>,
    },

    {
      title: 'Sales',
      dataIndex: 'sales',
      align: 'center',
      width: 70,
      sorter: (a, b) => a.sales - b.sales,
      render: (v) => <span className="font-medium text-[#16a34a]">₹{v ?? 0}</span>,
    },

    {
      title: 'Orders',
      dataIndex: 'orders',
      align: 'center',
      sorter: (a, b) => a.orders - b.orders,
      width: 70,
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },

    {
      title: 'Units',
      dataIndex: 'units',
      align: 'center',
      sorter: (a, b) => a.units - b.units,
      width: 70,
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },

    {
      title: 'ACOS',
      dataIndex: 'acos',
      align: 'center',
      width: 70,
      sorter: (a, b) => a.acos - b.acos,
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
      sorter: (a, b) => a.roas - b.roas,
      width: 70,
      render: (v) => (
        <Tag className="!px-3 !py-[3px] !rounded-full" color={v >= 1 ? 'success' : 'warning'}>
          {v ? v.toFixed(2) : '-'}
        </Tag>
      ),
    },
    {
      title: '',
      dataIndex: 'action',
      width: 40,
      fixed: 'right',
      align: 'center',

      render: (_, record) => (
        <button
          type="button"
          onClick={() => {
            // navigate(`../campaign-second-details/${record.adGroupId}`);
            navigate(`../campaign-second-details/${record.adGroupId}`, {
              state: {
                adGroupName: record.name,
              },
            });
          }}
          className="w-[28px] h-[28px] rounded-full border border-[#dbe1e8] flex items-center justify-center cursor-pointer hover:text-black transition-all duration-200 mx-auto"
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
          <div className="border-b border-[#edf0f2] px-4 py-3">
            {/* Top Row */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Back Button */}
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-[35px] h-[35px] rounded-xl border border-[#dbe1e8] bg-white flex items-center justify-center hover:bg-[#f8fafc] transition-all duration-200 shadow-sm"
                >
                  <ArrowLeftOutlined className="text-[#374151]" />
                </button>

                <div className="flex flex-col">
                  <h1 className="text-[19px] font-semibold text-[#111827] leading-[30px] mb-1">Campaign Details</h1>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] text-[#6b7280] font-medium">Campaign Name:</span>

                    <div className="min-w-[120px] h-[23px] px-2 rounded-full bg-[#eff6ff] border border-[#bfdbfe] text-[#2563eb] text-[11px] font-semibold flex items-center justify-center ">
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
                  className="w-full h-[30px] rounded-xl border border-[#dbe1e8] bg-white pl-11 pr-4 text-[14px] text-[#111827] outline-none shadow-sm focus:border-[#2563eb]"
                />

                <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[15px]" />
              </div>

              {/* Right Buttons */}
              <div className="flex items-center gap-3">
                <Button
                  icon={<FilterOutlined />}
                  className="!h-[30px] text-[13px] !rounded-xl !border-[#dbe1e8] !text-[#374151] !font-medium !flex !items-center !justify-center"
                >
                  Filters
                </Button>

                <Button
                  type="primary"
                  icon={<ExportOutlined />}
                  className="!h-[30px] text-[13px] !rounded-xl !bg-[#2563eb] !font-medium !flex !items-center !justify-center"
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
            tableLayout="fixed"
            showSorterTooltip={false}
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
      {/* ================= BID MODAL ================= */}
      <Modal
        open={isBidModalOpen}
        footer={null}
        centered
        closable={false}
        onCancel={() => setIsBidModalOpen(false)}
        width={340}
      >
        <div className="pt-1">
          {/* LABEL */}
          <div className="flex items-center gap-1 mb-4">
            <span className="text-[13px] font-semibold tracking-wide text-[#4b5563] uppercase">Default Bid</span>

            <div className="w-[15px] h-[15px] rounded-full border border-[#d1d5db] flex items-center justify-center text-[10px] text-[#9ca3af]">
              i
            </div>
          </div>

          {/* INPUT BOX */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280] font-semibold text-[15px]">₹</div>

            <input
              type="number"
              value={selectedBid}
              onChange={(e) => setSelectedBid(e.target.value)}
              className="w-full h-[54px] rounded-2xl border border-[#c7d2fe] bg-[#fafbff] pl-10 pr-4 text-[18px] font-semibold text-[#111827] outline-none transition-all duration-200 focus:border-[#4f46e5] focus:bg-white focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)]"
            />
          </div>

          {/* BUTTONS */}
          <div className="mt-6 pt-4 border-t border-[#eef1f5] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsBidModalOpen(false)}
              className="h-[42px] px-5 rounded-xl text-[#6b7280] font-medium hover:bg-[#f3f4f6] transition-all duration-200"
            >
              Cancel
            </button>

            <button
              type="button"
              className="h-[42px] px-6 rounded-xl bg-gradient-to-r from-[#111827] to-[#1f2937] text-white font-semibold shadow-md hover:scale-[1.02] transition-all duration-200"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default CampaignDetails;
