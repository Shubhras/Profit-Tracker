import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Table, Tooltip, Tag, Switch, Modal } from 'antd';
import { FilterOutlined, ExportOutlined, SearchOutlined, RightOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getAdProductsDetails } from '../../redux/advertising/actionCreator';

function AdProductsDetails() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { sku } = useParams();
  const [budgetModal, setBudgetModal] = React.useState(false);
  const [selectedBudget, setSelectedBudget] = React.useState(null);
  const [budgetValue, setBudgetValue] = React.useState('');

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
    // }, [dispatch, pagination, sku]);
  }, [dispatch, pagination.current, pagination.pageSize, sku]);
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
      title: 'State',
      dataIndex: 'active',
      align: 'center',
      width: 90,
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
      title: 'Campaign ID',
      dataIndex: 'campaignId',
      align: 'center',
      width: '70',
      ellipsis: true,
      sorter: (a, b) => Number(a.campaignId || 0) - Number(b.campaignId || 0),
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="block truncate mx-auto max-w-[70px] cursor-pointer font-medium text-[#111827]">
            {v || '-'}
          </span>
        </Tooltip>
      ),
    },

    {
      title: 'Campaign Name',
      dataIndex: 'name',
      align: 'center',
      width: '70',
      ellipsis: true,
      sorter: (a, b) => String(a.name).localeCompare(String(b.name)),
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="block truncate font-medium text-[#111827] mx-auto max-w-[100px] cursor-pointer">
            {v || '-'}
          </span>
        </Tooltip>
      ),
    },

    // {
    //   title: 'State',
    //   dataIndex: 'state',
    //   align: 'center',
    //   render: (v) => (
    //     <Tag color={v === 'ENABLED' ? 'success' : 'error'} className="!rounded-full !px-3">
    //       {v}
    //     </Tag>
    //   ),
    // },

    {
      title: 'Targeting Type',
      dataIndex: 'targetingType',
      align: 'center',
      width: '70',
      ellipsis: true,
      sorter: (a, b) => String(a.targetingType).localeCompare(String(b.targetingType)),
    },

    // {
    //   title: 'Daily Budget',
    //   dataIndex: 'dailyBudget',
    //   align: 'center',
    //   render: (v) => <span className="font-medium">₹{v}</span>,
    // },

    // {
    //   title: 'Budget Type',
    //   dataIndex: 'budgetType',
    //   align: 'center',
    // },
    {
      title: 'Budget',
      align: 'center',
      dataIndex: 'dailyBudget',
      width: '70',
      sorter: (a, b) => a.dailyBudget - b.dailyBudget,
      render: (_, record) => (
        <div className="flex justify-center">
          <button
            type="button"
            // onClick={() => {
            //   setSelectedBudget(record);
            //   setBudgetValue(record?.dailyBudget || '');
            //   setBudgetModal(true);
            // }}
            className="group relative overflow-hidden px-3 py-[8px] rounded-2xl border border-transparent bg-transparent hover:border-[#dbeafe] hover:bg-[#f8fbff] transition-all duration-300"
          >
            {/* background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#eff6ff] via-[#f8fafc] to-[#ecfeff] opacity-80" />

            <div className="relative flex items-center justify-center gap-1 whitespace-nowrap">
              <span className="text-[11px] font-bold text-[#0f172a]">
                ₹{Number(record?.dailyBudget || 0).toFixed(2)}
              </span>

              <span className="text-[11px] uppercase tracking-wide text-[#64748b]">/ {record?.budgetType}</span>
            </div>
          </button>
        </div>
      ),
    },

    {
      title: 'Bidding Strategy',
      dataIndex: 'biddingStrategy',
      align: 'center',
      width: '70',
      ellipsis: true,
      sorter: (a, b) => String(a.biddingStrategy).localeCompare(String(b.biddingStrategy)),

      render: (v) => <span className=" font-medium">{v || '-'}</span>,
    },

    {
      title: 'Start Date',
      dataIndex: 'startDate',
      align: 'center',
      width: '70',
      ellipsis: true,
      sorter: (a, b) => a.startDate - b.startDate,
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
      sorter: (a, b) => a.impressions - b.impressions,
      ellipsis: true,
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

      render: (v) => <span className="font-medium text-[#dc2626]">₹{v}</span>,
    },

    {
      title: 'Sales',
      dataIndex: 'sales',
      align: 'center',
      width: '70',
      sorter: (a, b) => a.sales - b.sales,

      // render: (v) => <span className="font-medium text-[#16a34a]">₹{v}</span>,

      render: (v) => (
        <span className="font-semibold text-[#16a34a] whitespace-nowrap">₹{Math.round(Number(v || 0))}</span>
      ),
    },

    {
      title: 'Orders',
      dataIndex: 'orders',
      align: 'center',
      width: '70',
      sorter: (a, b) => a.orders - b.orders,
    },

    {
      title: 'Units',
      dataIndex: 'units',
      align: 'center',
      width: '70',
      sorter: (a, b) => a.units - b.units,
    },

    {
      title: 'ACOS',
      dataIndex: 'acos',
      align: 'center',
      width: '70',
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
      width: '70',
      sorter: (a, b) => a.roas - b.roas,

      render: (v) => (
        <Tag color={v >= 1 ? 'success' : 'warning'} className="!rounded-full !px-3">
          {v}
        </Tag>
      ),
    },

    {
      title: '',
      dataIndex: 'action',
      width: 60,
      fixed: 'right',
      align: 'center',

      render: (_, record) => (
        <button
          type="button"
          onClick={() => {
            navigate(`../AdsProducts/${record.campaignId}`);
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
                  <h1 className="text-[19px] font-semibold text-[#111827] mb-1">Campaigns Products</h1>

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
            scroll={{ x: 1900 }}
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
        width={430}
        className="budget-modal"
      >
        <div className="p-1">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(15, 118, 110) 100%)',
                }}
              >
                <span className="text-white text-lg font-bold">₹</span>
              </div>

              <div>
                <h2 className="text-[22px] font-bold text-[#0f172a] leading-none mb-1">Edit Budget</h2>

                <p className="text-[13px] text-[#64748b] mt-1">Update campaign daily budget</p>
              </div>
            </div>
          </div>

          {/* Budget Type */}
          <div className="mb-5">
            <label className="block text-[15px] font-semibold text-[#334155] mb-2">Budget Type</label>

            <div className="h-[48px] rounded-xl border border-[#e2e8f0] bg-[#f8fafc] flex items-center px-4 text-[#475569] font-medium">
              {selectedBudget?.budgetType}
            </div>
          </div>

          {/* Budget Input */}
          <div className="mb-6">
            <label className="block text-[15px] font-semibold text-[#334155] mb-2">Daily Budget</label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b] font-semibold">₹</span>

              <input
                type="number"
                value={budgetValue}
                onChange={(e) => setBudgetValue(e.target.value)}
                className="w-full h-[52px] rounded-2xl border border-[#cbd5e1] focus:border-[#10b981] focus:ring-4 focus:ring-[#d1fae5] outline-none pl-10 pr-4 text-[15px] font-semibold transition-all"
                placeholder="Enter budget"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setBudgetModal(false);
                setSelectedBudget(null);
                setBudgetValue('');
              }}
              className="h-[44px] px-5 rounded-xl border border-[#e2e8f0] text-[#475569] font-medium hover:bg-[#f8fafc] transition-all"
            >
              Cancel
            </button>

            <Button
              type="primary"
              onClick={() => {
                console.log('Updated Budget:', budgetValue);

                setBudgetModal(false);
              }}
              className="!h-[44px] !px-6 !rounded-xl !border-0 text-white !font-semibold shadow-md"
              style={{
                background: 'linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(15, 118, 110) 100%)',
              }}
            >
              Update Budget
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default AdProductsDetails;
