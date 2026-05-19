import React, { useEffect, useState } from 'react';
import { Button, Table, Tag, Tooltip, Popover, Switch, Modal } from 'antd';
import {
  FilterOutlined,
  ExportOutlined,
  RightOutlined,
  SearchOutlined,
  CheckOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getCampaigns } from '../../redux/advertising/actionCreator';

function Campaigns() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });
  const [tableData, setTableData] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);

  const [openFilter, setOpenFilter] = React.useState(false);

  const [filters, setFilters] = React.useState({
    state: '',
    type: '',
  });
  const [statusModal, setStatusModal] = useState({
    open: false,
    record: null,
    newState: '',
  });

  const { campaignData, loading } = useSelector((state) => state.advertising);

  useEffect(() => {
    dispatch(getCampaigns(pagination.current, pagination.pageSize));
  }, [dispatch, pagination]);

  const [campaignStatus, setCampaignStatus] = useState({});

  const handleToggleStatus = (key) => {
    setCampaignStatus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // const dataSource =
  //   campaignData?.results?.map((item) => ({

  // const dataSource =
  //   tableData.length > 0
  //     ? tableData
  //     : campaignData?.results?.map((item) => ({
  //         // key: index,
  //         key: item.campaign_id,
  //         checkbox: item.id,
  //         campaignId: item.campaign_id,
  //         name: item.name,
  //         state: item.state,
  //         targetingType: item.targeting_type,
  //         dailyBudget: item.daily_budget,
  //         budgetType: item.budget_type,
  //         biddingStrategy: item.bidding_strategy,
  //         marketplaceBudgetAllocation: item.marketplace_budget_allocation,
  //         startDate: item.start_date,
  //         countryCode: item.country_code,
  //         currencyCode: item.currency_code,
  //         impressions: item.metrics?.impressions,
  //         clicks: item.metrics?.clicks,
  //         cost: item.metrics?.cost,
  //         sales: item.metrics?.sales,
  //         orders: item.metrics?.orders,
  //         units: item.metrics?.units,
  //         acos: item.metrics?.acos,
  //         roas: item.metrics?.roas,
  //         // createdAt: item.created_at,
  //       })) || [];

  useEffect(() => {
    if (campaignData?.results) {
      setTableData(
        campaignData.results.map((item) => ({
          key: item.campaign_id,
          checkbox: item.id,
          campaignId: item.campaign_id,
          name: item.name,
          state: item.state,
          targetingType: item.targeting_type,
          dailyBudget: item.daily_budget,
          budgetType: item.budget_type,
          biddingStrategy: item.bidding_strategy,
          marketplaceBudgetAllocation: item.marketplace_budget_allocation,
          startDate: item.start_date,
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
        })),
      );
    }
  }, [campaignData]);
  const dataSource = tableData;

  const filterContent = (
    <div className="w-[320px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#eef2f7]">
        <div>
          <h3 className="text-[20px] font-semibold text-[#111827] mb-0">Filters</h3>

          <p className="text-[13px] text-[#6b7280] mb-1">Refine campaign performance</p>
        </div>

        <div className="w-9 h-9 rounded-xl bg-[#eff6ff] flex items-center justify-center text-[#2563eb]">
          <FilterOutlined />
        </div>
      </div>

      {/* BODY */}
      <div className="pt-5 space-y-5">
        {/* STATE */}
        <div>
          <p className="text-[14px] font-semibold text-[#374151] mb-2">Campaign State</p>

          <div className="flex gap-2 flex-wrap">
            {[
              { label: 'Enabled', value: 'ENABLED' },
              { label: 'Paused', value: 'PAUSED' },
            ].map((item) => {
              const active = filters.state === item.value;

              return (
                <button
                  type="button"
                  key={item.value}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      state: item.value,
                    }))
                  }
                  className={`
                  px-4 h-[38px] rounded-xl border text-[13px] font-medium transition-all duration-200 flex items-center gap-2
                  ${
                    active
                      ? 'bg-[#2563eb] border-[#2563eb] text-white shadow-md shadow-blue-100'
                      : 'bg-white border-[#dbe1e8] text-[#374151] hover:border-[#2563eb] hover:text-[#2563eb]'
                  }
                `}
                >
                  {active && <CheckOutlined className="text-[11px]" />}
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* TYPE */}
        <div>
          <p className="text-[14px] font-semibold text-[#374151] mb-2">Marketing Type</p>

          <div className="flex gap-2 flex-wrap">
            {[
              { label: 'Manual', value: 'MANUAL' },
              { label: 'Auto', value: 'AUTO' },
            ].map((item) => {
              const active = filters.type === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      type: item.value,
                    }))
                  }
                  className={`
                  px-4 h-[38px] rounded-xl border text-[13px] font-medium transition-all duration-200 flex items-center gap-2
                  ${
                    active
                      ? 'bg-[#2563eb] border-[#2563eb] text-white shadow-md'
                      : 'bg-white border-[#dbe1e8] text-[#374151] hover:border-[#2563eb] hover:text-[#2563eb]'
                  }
                `}
                >
                  {active && <CheckOutlined className="text-[11px]" />}
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="pt-3 mt-2 border-t border-[#eef2f7] flex items-center justify-between">
        <Button
          icon={<ReloadOutlined />}
          onClick={() =>
            setFilters({
              state: '',
              type: '',
            })
          }
          className="!h-[40px] !rounded-xl !border-[#dbe1e8] !text-[#374151] !font-medium flex items-center "
        >
          Reset
        </Button>

        <Button
          type="primary"
          onClick={() => setOpenFilter(false)}
          className="!h-[40px] !rounded-xl !bg-[#2563eb] !px-6 !font-medium"
        >
          Apply
        </Button>
      </div>
    </div>
  );

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
          aria-label="Select all campaigns"
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
          aria-label="Select campaign"
          className="w-[15px] h-[15px] cursor-pointer accent-[#2563eb]"
        />
      ),
    },

    {
      title: 'Active',
      dataIndex: 'active',
      align: 'center',
      width: 110,

      render: (_, record) => {
        const isActive = campaignStatus[record.key] ?? true;

        return (
          <Switch
            checked={isActive}
            onChange={() => handleToggleStatus(record.key)}
            style={{
              transform: 'scale(1.25)', // size increase
            }}
          />
        );
      },
    },

    {
      title: 'Campaign ID',
      dataIndex: 'campaignId',
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
      width: 140,

      render: (value, record) => {
        const isEnabled = record.state === 'ENABLED';

        return (
          <button
            type="button"
            onClick={() => {
              setStatusModal({
                open: true,
                record,
                newState: isEnabled ? 'PAUSED' : 'ENABLED',
              });
            }}
            className={`
        px-4 h-[31px] rounded-full text-[12px] font-semibold border transition-all duration-200
        ${isEnabled ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#16a34a]' : 'bg-[#fef2f2] border-[#fecaca] text-[#dc2626]'}
      `}
          >
            {isEnabled ? 'Enabled' : 'Paused'}
          </button>
        );
      },
    },

    // render: (v) => (
    //   <Tag color={v === 'ENABLED' ? 'success' : 'error'} className="!px-3 !py-[3px] !rounded-full">
    //     {v}
    //   </Tag>
    // ),

    {
      title: 'Targeting Type',
      dataIndex: 'targetingType',
      align: 'center',
    },

    // {
    //   title: 'Daily Budget',
    //   dataIndex: 'dailyBudget',
    //   align: 'center',
    //   render: (v) => `₹${v}`,
    // },

    // {
    //   title: 'Budget Type',
    //   dataIndex: 'budgetType',
    //   align: 'center',
    // },
    {
      title: 'Budget',
      dataIndex: 'budget',
      align: 'center',
      render: (_, record) => (
        <div className="flex justify-center">
          <div className="px-3 py-1 rounded-full text-[13px] font-medium border border-[#bfdbfe]">
            ₹{record.dailyBudget} - {record.budgetType}
          </div>
        </div>
      ),
    },

    {
      title: 'Bidding Strategy',
      dataIndex: 'biddingStrategy',
      align: 'center',
    },

    {
      title: 'Marketplace Budget Allocation',
      dataIndex: 'marketplaceBudgetAllocation',
      align: 'center',
    },

    {
      title: 'Start Date',
      dataIndex: 'startDate',
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
            navigate(`../campaign-details/${record.campaignId}`);
          }}
          className="w-[34px] h-[34px] rounded-full border border-[#dbe1e8] flex items-center justify-center cursor-pointer hover:text-black transition-all duration-200 mx-auto"
        >
          <RightOutlined />
        </button>
      ),
    },

    // {
    //   title: 'Active',
    //   dataIndex: 'state',
    //   width: 100,
    //   fixed: 'right',
    //   render: (v) => <Switch checked={v === 'ENABLED'} />,
    // },
  ];

  return (
    <>
      <div className="p-2">
        <div className="mt-3 mb-3 rounded-2xl border border-[#e5e7eb] bg-white shadow-sm overflow-hidden">
          {/* Header */}
          <div className="border-b border-[#edf0f2] px-6 py-4">
            {/* Top Content */}
            <div>
              <h1 className="text-[23px] font-semibold text-[#111827] mb-1">Campaigns Performance</h1>

              <p className="mt-1 text-sm text-[#6b7280]">
                Track campaign orders, revenue, discounts and overall marketplace performance.
              </p>
            </div>

            {/* Bottom Row */}
            <div className="mt-5 flex items-center justify-between gap-3">
              {/* Search */}
              <div className="relative w-[260px]">
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  className="w-full h-[42px] rounded-xl border border-[#dbe1e8] bg-white pl-11 pr-4 text-[14px] text-[#111827] outline-none"
                />

                <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[15px]" />
              </div>

              <div className="flex items-center gap-3">
                <Popover
                  content={filterContent}
                  trigger="click"
                  open={openFilter}
                  onOpenChange={setOpenFilter}
                  placement="bottomRight"
                  overlayInnerStyle={{
                    padding: '8px',
                    borderRadius: '22px',
                  }}
                >
                  <Button
                    icon={<FilterOutlined />}
                    className="!h-[40px] !rounded-xl !border-[#dbe1e8] !text-[#374151] !font-medium hover:!border-[#2563eb] hover:!text-[#2563eb] !flex !items-center !justify-center"
                  >
                    Filters
                  </Button>
                </Popover>

                <Button
                  type="primary"
                  icon={<ExportOutlined />}
                  className="!h-[40px] !rounded-xl !bg-[#2563eb] !font-medium !flex !items-center !justify-center"
                >
                  Export
                </Button>
              </div>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={dataSource}
            loading={loading}
            pagination={{
              // ...pagination,
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: campaignData?.pagination?.total_records || 0,
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
      <Modal
        open={statusModal.open}
        footer={null}
        centered
        onCancel={() =>
          setStatusModal({
            open: false,
            record: null,
            newState: '',
          })
        }
      >
        <div className="py-3">
          <h2 className="text-[20px] font-semibold text-[#111827] mb-2">Confirm Status Change</h2>

          <p className="text-[#6b7280] text-[14px] leading-6">
            Are you sure you want to{' '}
            <span className="font-semibold text-[#111827]">
              {statusModal.newState === 'ENABLED' ? 'enable' : 'pause'}
            </span>{' '}
            this campaign?
          </p>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={() =>
                setStatusModal({
                  open: false,
                  record: null,
                  newState: '',
                })
              }
              className="!rounded-xl !h-[40px]"
            >
              Cancel
            </Button>

            <Button
              type="primary"
              className="!rounded-xl !h-[40px] !bg-[#2563eb]"
              onClick={() => {
                setTableData((prev) =>
                  prev.map((item) =>
                    item.key === statusModal.record.key ? { ...item, state: statusModal.newState } : item,
                  ),
                );

                console.log('Updated:', statusModal.record, statusModal.newState);

                setStatusModal({
                  open: false,
                  record: null,
                  newState: '',
                });
              }}
            >
              Yes, Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default Campaigns;
