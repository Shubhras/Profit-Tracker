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
import { getCampaigns, getCampaignUpdate } from '../../redux/advertising/actionCreator';

function Campaigns() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });
  const [tableData, setTableData] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);
  const [budgetModal, setBudgetModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [budgetValue, setBudgetValue] = useState('');

  const [openFilter, setOpenFilter] = React.useState(false);

  const [filters, setFilters] = React.useState({
    state: '',
    type: '',
  });

  const { campaignData, loading } = useSelector((state) => state.advertising);

  useEffect(() => {
    dispatch(getCampaigns(pagination.current, pagination.pageSize));
    // }, [dispatch, pagination]);
  }, [dispatch, pagination.current, pagination.pageSize]);

  // const [campaignStatus, setCampaignStatus] = useState({});

  // const handleToggleStatus = (key) => {
  //   setCampaignStatus((prev) => ({
  //     ...prev,
  //     [key]: !prev[key],
  //   }));
  // };

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
          profileId: item.profile_id,
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
          className="w-[13px] h-[13px] cursor-pointer accent-[#2563eb]"
        />
      ),
      dataIndex: 'checkbox',
      width: 45,
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
          aria-label="Select campaign"
          className="w-[13px] h-[13px] cursor-pointer accent-[#2563eb]"
        />
      ),
    },

    {
      title: 'State',
      dataIndex: 'state',
      align: 'center',
      width: 55,

      render: (v, record) => (
        <Switch
          checked={v === 'ENABLED'}
          size="small"
          onChange={async (checked) => {
            const updatedState = checked ? 'ENABLED' : 'PAUSED';

            const payload = {
              profile_id: record.profileId,
              campaigns: [
                {
                  campaignId: record.campaignId,
                  state: updatedState,

                  budget: {
                    budget: Number(record.dailyBudget),
                    budgetType: record.budgetType,
                  },

                  dynamicBidding: {
                    strategy: record.biddingStrategy,
                  },
                },
              ],
            };

            const response = await dispatch(getCampaignUpdate(payload));

            if (response?.status) {
              dispatch(getCampaigns(pagination.current, pagination.pageSize));
            }
          }}
        />
      ),
    },

    // {
    //   title: 'Campaign ID',
    //   dataIndex: 'campaignId',
    //   align: 'center',
    //   render: (v) => <span className="text-[#2563eb] font-medium">{v}</span>,
    // },

    {
      title: 'Name',
      dataIndex: 'name',
      align: 'center',
      // sorter: (a, b) => a.name - b.name,
      width: 70,
      sorter: (a, b) => String(a.name).localeCompare(String(b.name)),
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
    //   width: 140,

    //   render: (value, record) => {
    //     const isEnabled = record.state === 'ENABLED';

    //     return (
    //       <button
    //         type="button"
    //         onClick={() => {
    //           setStatusModal({
    //             open: true,
    //             record,
    //             newState: isEnabled ? 'PAUSED' : 'ENABLED',
    //           });
    //         }}
    //         className={`
    //     px-4 h-[31px] rounded-full text-[12px] font-semibold border transition-all duration-200
    //     ${isEnabled ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#16a34a]' : 'bg-[#fef2f2] border-[#fecaca] text-[#dc2626]'}
    //   `}
    //       >
    //         {isEnabled ? 'Enabled' : 'Paused'}
    //       </button>
    //     );
    //   },
    // },

    // render: (v) => (
    //   <Tag color={v === 'ENABLED' ? 'success' : 'error'} className="!px-3 !py-[3px] !rounded-full">
    //     {v}
    //   </Tag>
    // ),

    {
      title: 'Targeting Type',
      dataIndex: 'targetingType',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => String(a.targetingType).localeCompare(String(b.targetingType)),
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
      dataIndex: 'dailyBudget',
      align: 'center',
      width: 80,
      sorter: (a, b) => a.dailyBudget - b.dailyBudget,

      render: (_, record) => {
        const budgetText = `₹${Number(record?.dailyBudget || 0).toFixed(2)} / ${record?.budgetType}`;

        return (
          <div className="flex justify-center">
            <Tooltip title={budgetText} color="black" overlayInnerStyle={{ color: '#fff' }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedBudget(record);
                  setBudgetValue(record?.dailyBudget || '');
                  setBudgetModal(true);
                }}
                className="group relative overflow-hidden w-[72px] px-2 py-[7px] rounded-2xl border border-transparent bg-transparent hover:border-[#dbeafe] hover:bg-[#f8fbff] transition-all duration-300"
              >
                {/* background */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#eff6ff] via-[#f8fafc] to-[#ecfeff] opacity-80" />

                <div className="relative w-full truncate text-center">
                  <span className="text-[10px] font-bold text-[#0f172a] truncate block">{budgetText}</span>
                </div>
              </button>
            </Tooltip>
          </div>
        );
      },
    },

    {
      title: 'Bidding Strategy',
      dataIndex: 'biddingStrategy',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => String(a.biddingStrategy).localeCompare(String(b.biddingStrategy)),
    },

    {
      title: 'Marketplace Budget Allocation',
      dataIndex: 'marketplaceBudgetAllocation',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => String(a.marketplaceBudgetAllocation).localeCompare(String(b.marketplaceBudgetAllocation)),
    },

    {
      title: 'Start Date',
      dataIndex: 'startDate',
      align: 'center',
      width: 70,
      sorter: (a, b) => a.startDate - b.startDate,
    },
    {
      title: 'Country Code',
      dataIndex: 'countryCode',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.countryCode - b.countryCode,
    },

    {
      title: 'Currency Code',
      dataIndex: 'currencyCode',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.currencyCode - b.currencyCode,
    },
    {
      title: 'Portfolio',
      dataIndex: 'portfolio',
      align: 'center',
      width: 70,
      sorter: (a, b) => a.portfolio - b.portfolio,
      render: (v) => (
        <span className="font-medium text-[#111827] block truncate" style={{ maxWidth: '220px' }}>
          {v || '-'}
        </span>
      ),
    },
    {
      title: 'Impressions',
      dataIndex: 'impressions',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.impressions - b.impressions,
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
      width: 70,
      sorter: (a, b) => a.orders - b.orders,
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },

    {
      title: 'Units',
      dataIndex: 'units',
      align: 'center',
      width: 70,
      sorter: (a, b) => a.units - b.units,
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
      width: 70,
      sorter: (a, b) => a.roas - b.roas,
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
            navigate(`../campaign-details/${record.campaignId}`);
          }}
          className="w-[28px] h-[28px] rounded-full border border-[#dbe1e8] flex items-center justify-center cursor-pointer hover:text-black transition-all duration-200 mx-auto"
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
  const handleUpdateBudget = async () => {
    if (!selectedBudget) return;

    const payload = {
      profile_id: selectedBudget.profileId,

      campaigns: [
        {
          campaignId: selectedBudget.campaignId,
          state: selectedBudget.state,

          budget: {
            budget: Number(budgetValue),
            budgetType: selectedBudget.budgetType,
          },

          dynamicBidding: {
            strategy: selectedBudget.biddingStrategy,
          },
        },
      ],
    };

    const response = await dispatch(getCampaignUpdate(payload));

    if (response?.status) {
      setBudgetModal(false);
      setSelectedBudget(null);
      setBudgetValue('');

      dispatch(getCampaigns(pagination.current, pagination.pageSize));
    }
  };

  return (
    <>
      <div className="p-2">
        <div className="mt-3 mb-3 rounded-2xl border border-[#e5e7eb] bg-white shadow-sm overflow-hidden">
          {/* Header */}
          <div className="border-b border-[#edf0f2] px-3 py-2">
            {/* Top Content */}
            <div>
              <h1 className="text-[19px] font-semibold text-[#111827] mb-1">Campaigns Performance</h1>

              <p className="mt-1 text-[12px] text-[#6b7280]">
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
                  className="w-full h-[30px] rounded-xl border border-[#dbe1e8] bg-white pl-11 pr-4 text-[14px] text-[#111827] outline-none"
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
                    className="!h-[30px] text-[13px] !rounded-xl !border-[#dbe1e8] !text-[#374151] !font-medium hover:!border-[#2563eb] hover:!text-[#2563eb] !flex !items-center !justify-center"
                  >
                    Filters
                  </Button>
                </Popover>

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

          <Table
            columns={columns}
            dataSource={dataSource}
            loading={loading}
            showSorterTooltip={false}
            tableLayout="fixed"
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
            // scroll={{ x: 'max-content' }}
            scroll={{ x: 1800 }}
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
        open={budgetModal}
        onCancel={() => {
          setBudgetModal(false);
          setSelectedBudget(null);
          setBudgetValue('');
        }}
        footer={null}
        centered
        width={390} // thoda chota
        className="budget-modal"
      >
        <div className="p-1">
          {/* Header */}
          <div className="mb-1">
            <div className="flex items-center gap-3 mb-2">
              <div>
                <h2 className="text-[20px] font-bold text-[#0f172a] leading-none mb-1">Edit Budget</h2>

                <p className="text-[12px] text-[#64748b] mt-1">Update campaign daily budget</p>
              </div>
            </div>
          </div>

          {/* Budget Type */}
          <div className="mb-4">
            <label className="block text-[14px] font-semibold text-[#334155] mb-2">Budget Type</label>

            <div className="h-[40px] rounded-xl border border-[#e2e8f0] bg-[#f8fafc] flex items-center px-4 text-[#475569] text-[14px] font-medium">
              {selectedBudget?.budgetType}
            </div>
          </div>

          {/* Budget Input */}
          <div className="mb-5">
            <label className="block text-[14px] font-semibold text-[#334155] mb-2">Daily Budget</label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b] text-[14px] font-semibold">
                ₹
              </span>

              <input
                type="number"
                value={budgetValue}
                onChange={(e) => setBudgetValue(e.target.value)}
                className="w-full h-[40px] rounded-xl border border-[#cbd5e1] focus:border-[#2563eb] focus:ring-4 focus:ring-[#bfdbfe] outline-none pl-10 pr-4 text-[14px] font-semibold transition-all"
                placeholder="Enter budget"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setBudgetModal(false);
                setSelectedBudget(null);
                setBudgetValue('');
              }}
              className="h-[40px] px-4 rounded-xl border border-[#e2e8f0] text-[#475569] text-[14px] font-medium hover:bg-[#f8fafc] transition-all"
            >
              Cancel
            </button>

            <Button
              type="primary"
              onClick={handleUpdateBudget}
              className="h-[40px] px-3 rounded-xl text-white text-[14px] font-semibold shadow-md transition-all"
            >
              Update Budget
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default Campaigns;
