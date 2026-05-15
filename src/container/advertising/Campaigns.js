import React, { useEffect } from 'react';
import { Button, Table, Tag, Tooltip } from 'antd';
import { FilterOutlined, ExportOutlined, RightOutlined } from '@ant-design/icons';
// import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCampaigns } from '../../redux/advertising/actionCreator';

function Campaigns() {
  const dispatch = useDispatch();
  // const navigate = useNavigate();
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });
  const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);

  const { campaignData, loading } = useSelector((state) => state.advertising);

  useEffect(() => {
    dispatch(getCampaigns(pagination.current, pagination.pageSize));
  }, [dispatch, pagination]);

  const dataSource =
    campaignData?.results?.map((item) => ({
      // key: index,
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
      // profileId: item.profile_id,
      countryCode: item.country_code,
      currencyCode: item.currency_code,
      // createdAt: item.created_at,
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
      render: (v) => (
        <Tag color={v === 'ENABLED' ? 'success' : 'error'} className="!px-3 !py-[3px] !rounded-full">
          {v}
        </Tag>
      ),
    },

    {
      title: 'Targeting Type',
      dataIndex: 'targetingType',
      align: 'center',
    },

    {
      title: 'Daily Budget',
      dataIndex: 'dailyBudget',
      align: 'center',
      render: (v) => `₹${v}`,
    },

    {
      title: 'Budget Type',
      dataIndex: 'budgetType',
      align: 'center',
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
      title: 'Action',
      dataIndex: 'action',
      width: 100,
      fixed: 'right',
      align: 'center',

      render: () => (
        <button
          type="button"
          // onClick={() => {
          //   navigate(`/advertising/campaigndetails/${record.campaignId}`);
          // }}
          className="w-[34px] h-[34px] rounded-full border border-[#dbe1e8]
  flex items-center justify-center cursor-pointer hover:text-black transition-all duration-200 mx-auto"
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
          <div className="flex items-center justify-between border-b border-[#edf0f2] px-6 py-4">
            <div>
              <h1 className="text-[23px] font-semibold text-[#111827] mb-1">Campaigns Performance</h1>

              <p className="mt-1 text-sm text-[#6b7280]">
                Track campaign orders, revenue, discounts and overall marketplace performance.
              </p>
            </div>

            {/* Right Buttons */}
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
    </>
  );
}

export default Campaigns;
