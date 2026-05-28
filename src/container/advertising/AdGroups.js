import React, { useEffect } from 'react';
import { Button, Table, Tag, Tooltip, Modal, Switch } from 'antd';
import { FilterOutlined, ExportOutlined, SearchOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getAdsGroup, getEditBid } from '../../redux/advertising/actionCreator';

function AdGroups() {
  const dispatch = useDispatch();

  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });
  const [isBidModalOpen, setIsBidModalOpen] = React.useState(false);
  const [selectedBid, setSelectedBid] = React.useState('');
  const [selectedRowData, setSelectedRowData] = React.useState(null);

  const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);

  const { adsGroupData, loading } = useSelector((state) => state.advertising);

  useEffect(() => {
    dispatch(getAdsGroup(pagination.current, pagination.pageSize));
    // }, [dispatch, pagination]);
  }, [dispatch, pagination.current, pagination.pageSize]);

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
          aria-label="Select all"
          className="w-[13px] h-[13px] cursor-pointer accent-[#2563eb]"
        />
      ),
      dataIndex: 'checkbox',
      width: 60,
      align: 'center',
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
          className="w-[13px] h-[13px] cursor-pointer accent-[#2563eb]"
        />
      ),
    },

    {
      title: 'State',
      dataIndex: 'state',
      align: 'center',
      width: '70',
      render: (v, record) => (
        <Switch
          size="small"
          checked={v === 'ENABLED'}
          onChange={(checked) => {
            const updatedState = checked ? 'ENABLED' : 'PAUSED';

            const payload = {
              profile_id: record.profileId,
              ad_groups: [
                {
                  adGroupId: record.adGroupId,
                  name: record.name,
                  state: updatedState,
                  defaultBid: Number(record.defaultBid),
                },
              ],
            };

            dispatch(getEditBid(payload)).then((response) => {
              if (response?.status) {
                dispatch(getAdsGroup(pagination.current, pagination.pageSize));
              }
            });
          }}
        />
      ),
    },

    {
      title: 'Ad Group ID',
      dataIndex: 'adGroupId',
      align: 'center',
      sorter: (a, b) => Number(a.adGroupId || 0) - Number(b.adGroupId || 0),
      width: '70',
      ellipsis: true,
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
      sorter: (a, b) => String(a.name || '').localeCompare(String(b.name || '')),
      width: '70',
      ellipsis: true,
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="font-medium text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '240px' }}>
            {v}
          </span>
        </Tooltip>
      ),
    },

    {
      title: 'Default Bid',
      dataIndex: 'defaultBid',
      align: 'center',
      sorter: (a, b) => Number(a.defaultBid || 0) - Number(b.defaultBid || 0),
      width: '70',
      ellipsis: true,
      render: (v, record) => (
        <button
          type="button"
          onClick={() => {
            setSelectedBid(v);
            setSelectedRowData(record);
            setIsBidModalOpen(true);
          }}
          className="px-3 py-[6px] rounded-xl border border-transparent text-[#111827] font-medium bg-transparent hover:border-[#dbe1e8] hover:bg-white hover:shadow-sm transition-all duration-200"
        >
          ₹{Number(v ?? 0).toLocaleString('en-IN')}
        </button>
      ),
    },

    {
      title: 'Campaign Name',
      dataIndex: 'campaignName',
      align: 'center',
      sorter: (a, b) => String(a.campaignName || '').localeCompare(String(b.campaignName || '')),
      width: '70',
      ellipsis: true,
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
      sorter: (a, b) => Number(a.campaignId || 0) - Number(b.campaignId || 0),
      width: '70',
      ellipsis: true,
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="cursor-pointer block truncate">{v}</span>
        </Tooltip>
      ),
    },

    {
      title: 'Country Code',
      dataIndex: 'countryCode',
      align: 'center',
      sorter: (a, b) => String(a.countryCode || '').localeCompare(String(b.countryCode || '')),
      width: '70',
      ellipsis: true,
    },

    {
      title: 'Currency Code',
      dataIndex: 'currencyCode',
      align: 'center',
      sorter: (a, b) => String(a.currencyCode || '').localeCompare(String(b.currencyCode || '')),
      width: '70',
      ellipsis: true,
    },
    {
      title: 'Impressions',
      dataIndex: 'impressions',
      align: 'center',
      sorter: (a, b) => Number(a.impressions || 0) - Number(b.impressions || 0),
      width: '70',
      ellipsis: true,
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },

    {
      title: 'Clicks',
      dataIndex: 'clicks',
      align: 'center',
      sorter: (a, b) => Number(a.clicks || 0) - Number(b.clicks || 0),
      width: '70',
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },

    {
      title: 'Cost',
      dataIndex: 'cost',
      align: 'center',
      sorter: (a, b) => Number(a.cost || 0) - Number(b.cost || 0),
      width: '70',
      render: (v) => <span className="font-medium text-[#dc2626]">₹{v ?? 0}</span>,
    },

    {
      title: 'Sales',
      dataIndex: 'sales',
      align: 'center',
      sorter: (a, b) => Number(a.sales || 0) - Number(b.sales || 0),
      width: '70',
      render: (v) => <span className="font-medium text-[#16a34a]">₹{v ?? 0}</span>,
    },

    {
      title: 'Orders',
      dataIndex: 'orders',
      align: 'center',
      sorter: (a, b) => Number(a.orders || 0) - Number(b.orders || 0),
      width: '70',
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },

    {
      title: 'Units',
      dataIndex: 'units',
      align: 'center',
      sorter: (a, b) => Number(a.units || 0) - Number(b.units || 0),
      width: '70',
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },

    {
      title: 'ACOS',
      dataIndex: 'acos',
      align: 'center',
      sorter: (a, b) => Number(a.acos || 0) - Number(b.acos || 0),
      width: '70',
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
      sorter: (a, b) => Number(a.roas || 0) - Number(b.roas || 0),
      width: '70',
      render: (v) => (
        <Tag className="!px-3 !py-[3px] !rounded-full" color={v >= 1 ? 'success' : 'warning'}>
          {v ? v.toFixed(2) : '-'}
        </Tag>
      ),
    },
  ];

  const handleSaveBid = async () => {
    if (!selectedRowData) return;

    const payload = {
      profile_id: selectedRowData.profileId,
      ad_groups: [
        {
          adGroupId: selectedRowData.adGroupId,
          name: selectedRowData.name,
          state: selectedRowData.state,
          defaultBid: Number(selectedBid),
        },
      ],
    };

    const response = await dispatch(getEditBid(payload));

    if (response?.status) {
      setIsBidModalOpen(false);

      dispatch(getAdsGroup(pagination.current, pagination.pageSize));
    }
  };

  return (
    <>
      <div className="p-2">
        <div className="mt-3 mb-3 rounded-2xl border border-[#e5e7eb] bg-white shadow-sm overflow-hidden">
          {/* Header */}
          <div className="border-b border-[#edf0f2] px-3 py-3">
            {/* TOP CONTENT */}
            <div>
              <h1 className="text-[19px] font-semibold text-[#111827] mb-1">Ads Group Performance</h1>

              <p className="mt-1 text-sm text-[#6b7280]">
                Track ad group performance, bids, campaigns and marketplace activity.
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <div className="relative w-[280px]">
                <input
                  type="text"
                  placeholder="Search ad groups..."
                  className="w-full h-[30px] rounded-xl border border-[#dbe1e8] bg-white pl-11 pr-4 text-[14px] text-[#111827] outline-none"
                />

                <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[15px]" />
              </div>

              <div className="flex items-center gap-3">
                <Button
                  icon={<FilterOutlined />}
                  className="!h-[30px] text-[13px] !px-5 !rounded-xl !border-[#dbe1e8] !text-[#374151] !font-medium hover:!border-[#2563eb] hover:!text-[#2563eb] !shadow-sm !flex !items-center !justify-center"
                >
                  Filters
                </Button>

                <Button
                  type="primary"
                  icon={<ExportOutlined />}
                  className="!h-[30px] text-[13px] !px-5 !rounded-xl !font-medium !flex !items-center !justify-center"
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
            scroll={{ x: 1400 }}
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
      <Modal
        open={isBidModalOpen}
        footer={null}
        centered
        closable={false}
        onCancel={() => setIsBidModalOpen(false)}
        width={340}
      >
        <div className="pt-1">
          <div className="flex items-center gap-1 mb-4">
            <span className="text-[13px] font-semibold tracking-wide text-[#4b5563] uppercase">Default Bid</span>
          </div>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280] font-semibold text-[15px]">₹</div>

            <input
              type="number"
              value={selectedBid}
              onChange={(e) => setSelectedBid(e.target.value)}
              className="w-full h-[54px] rounded-2xl border border-[#c7d2fe] bg-[#fafbff] pl-10 pr-4 text-[18px] font-semibold text-[#111827] outline-none"
            />
          </div>

          <div className="mt-6 pt-4 border-t border-[#eef1f5] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsBidModalOpen(false)}
              className="h-[42px] px-5 rounded-xl text-[#6b7280] font-medium hover:bg-[#f3f4f6]"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveBid}
              className="h-[42px] px-6 rounded-xl bg-[#111827] text-white font-semibold"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default AdGroups;
