import React, { useEffect } from 'react';
import { Button, Table, Tag, Tooltip } from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  PlusOutlined,
  ThunderboltOutlined,
  PlayCircleOutlined,
  DollarOutlined,
  // DownOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getRules } from '../../redux/advertising/actionCreator';

function RulesAutomation() {
  const dispatch = useDispatch();
  // const [ruleType, setRuleType] = React.useState('');
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });
  const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);

  const { rules, loading } = useSelector((state) => state.advertising);

  useEffect(() => {
    dispatch(getRules(pagination.current, pagination.pageSize));
  }, [dispatch, pagination]);

  const dataSource =
    rules?.results?.data?.map((item) => ({
      key: item.id,

      amazonAccountId: item.amazon_account_id,
      profileId: item.profile_id,
      budgetRuleId: item.budget_rule_id,
      ruleType: item.rule_type,
      name: item.name,
      ruleState: item.rule_state,
      ruleStatus: item.rule_status,
      createdDate: item.created_date,
      updatedDate: item.last_updated_date,
      ruleDetails: item.rule_details,
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

    // {
    //   title: 'Amazon Account ID',
    //   dataIndex: 'amazonAccountId',
    //   align: 'center',
    // },

    {
      title: 'Profile ID',
      dataIndex: 'profileId',
      align: 'center',
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="block truncate cursor-pointer max-w-[180px] mx-auto">{v}</span>
        </Tooltip>
      ),
    },

    {
      title: 'Budget Rule ID',
      dataIndex: 'budgetRuleId',
      align: 'center',
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="block truncate text-[#2563eb] font-medium cursor-pointer max-w-[220px] mx-auto">{v}</span>
        </Tooltip>
      ),
    },

    {
      title: 'Rule Type',
      dataIndex: 'ruleType',
      align: 'center',
      render: (v) => {
        const ruleTypeMap = {
          sp: 'Sponsored Products',
          sd: 'Sponsored Display',
          sb: 'Sponsored Brands',
        };

        return (
          <Tag color="processing" className="!text-[13px] !px-3 !py-[3px] !font-medium">
            {ruleTypeMap[v] || v}
          </Tag>
        );
      },
    },

    {
      title: 'Rule Name',
      dataIndex: 'name',
      align: 'center',
    },

    {
      title: 'Rule State',
      dataIndex: 'ruleState',
      align: 'center',
      render: (v) => <Tag color={v === 'ACTIVE' ? 'success' : 'default'}>{v}</Tag>,
    },

    {
      title: 'Rule Status',
      dataIndex: 'ruleStatus',
      align: 'center',
      render: (v) => <Tag color={v === 'EXPIRED' ? 'error' : 'processing'}>{v}</Tag>,
    },
    // {
    //   title: 'Action',
    //   dataIndex: 'action',
    //   align: 'center',

    //   render: () => (
    //     <EyeOutlined className="text-[18px] text-[#2563eb] cursor-pointer hover:text-[#1d4ed8] transition-all" />
    //   ),
    // },

    // {
    //   title: 'Created Date',
    //   dataIndex: 'createdDate',
    //   align: 'center',
    //   render: (v) => new Date(v).toLocaleDateString(),
    // },

    // {
    //   title: 'Last Updated',
    //   dataIndex: 'updatedDate',
    //   align: 'center',
    //   render: (v) => new Date(v).toLocaleDateString(),
    // },
  ];

  return (
    <div className="px-5 py-4 bg-[#f7f8fa] min-h-screen overflow-x-hidden">
      {/* ================= HEADER ================= */}

      <div className="flex items-start justify-between mb-3">
        <div>
          <h1 className="text-[32px] font-bold text-[#111827] mb-1">Rules & Automation</h1>

          <p className="text-[#6b7280] text-[14px] mt-1">
            Automate your Amazon advertising actions and save time while improving performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            className="
            !h-[40px]
            !px-5
            !rounded-xl
            !border
            !border-[#dbe1e8]
            !font-medium
          "
          >
            Activity Log
          </Button>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="!h-[40px] !px-6 !rounded-xl !bg-[#22c55e] !border-none !font-medium"
          >
            Create Rule
          </Button>
        </div>
      </div>

      {/* ================= TABS ================= */}

      <div className="flex items-center gap-8 border-b border-[#edf0f2] mb-5">
        <button type="button" className="pb-4 text-[#22c55e] border-b-2 border-[#22c55e] font-semibold text-[14px]">
          Overview
        </button>

        <button type="button" className="pb-4 text-[#6b7280] font-medium text-[14px]">
          Active Rules
        </button>

        <button type="button" className="pb-4 text-[#6b7280] font-medium text-[14px]">
          Rule History
        </button>
      </div>

      {/* ================= MAIN LAYOUT ================= */}

      <div className="flex gap-5 items-start w-full">
        {/* ================= LEFT SECTION ================= */}

        <div className="flex-1 min-w-0">
          {/* ================= TOP CARDS ================= */}

          <div className="grid grid-cols-4 gap-3 mb-4">
            {' '}
            {/* CARD */}
            <div className="bg-white border border-[#edf0f2] rounded-xl px-4 py-3 w-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#6b7280] text-[16px] mb-2">Active Rules</p>

                  <h2 className="text-[24px] font-bold text-[#111827] leading-none">12</h2>

                  <p className="text-[#22c55e] text-[13px] mt-3 font-medium">↑ 20% vs last 30 days</p>
                </div>

                <div className="w-8 h-8 rounded-xl bg-[#ecfdf5] flex items-center justify-center shrink-0">
                  <ThunderboltOutlined className="text-[#22c55e] text-[20px]" />
                </div>
              </div>
            </div>
            {/* CARD */}
            <div className="bg-white border border-[#edf0f2] rounded-2xl p-5 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#6b7280] text-[16px] mb-2">Actions Executed</p>

                  <h2 className="text-[24px] font-bold text-[#111827] leading-none">245</h2>

                  <p className="text-[#22c55e] text-[13px] mt-3 font-medium">↑ 32% vs last 30 days</p>
                </div>

                <div className="w-8 h-8 rounded-xl bg-[#eff6ff] flex items-center justify-center shrink-0">
                  <PlayCircleOutlined className="text-[#2563eb] text-[20px]" />
                </div>
              </div>
            </div>
            {/* CARD */}
            <div className="bg-white border border-[#edf0f2] rounded-2xl p-5 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#6b7280] text-[16px] mb-2">Impressions Affected</p>

                  <h2 className="text-[24px] font-bold text-[#111827] leading-none">1.2M</h2>

                  <p className="text-[#22c55e] text-[13px] mt-3 font-medium">↑ 18% vs last 30 days</p>
                </div>

                <div className="w-8 h-8 rounded-xl bg-[#f5f3ff] flex items-center justify-center shrink-0">
                  <EyeOutlined className="text-[#7c3aed] text-[20px]" />
                </div>
              </div>
            </div>
            {/* CARD */}
            <div className="bg-white border border-[#edf0f2] rounded-2xl p-5 min-w-0">
              <div className="flex items-start justify-between gap-1">
                <div>
                  <p className="text-[#6b7280] text-[16px] mb-2">Sales Impact</p>

                  <h2 className="text-[24px] font-bold text-[#111827] leading-none">$48,612</h2>

                  <p className="text-[#22c55e] text-[13px] mt-3 font-medium">↑ 24% vs last 30 days</p>
                </div>

                <div className="w-8 h-8 rounded-xl bg-[#ecfdf5] flex items-center justify-center shrink-0">
                  <DollarOutlined className="text-[#22c55e] text-[20px]" />
                </div>
              </div>
            </div>
          </div>

          {/* ================= TABLE ================= */}

          <div className="bg-white border border-[#edf0f2] rounded-2xl overflow-hidden w-full">
            {/* TABLE HEADER */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#edf0f2]">
              <h2 className="text-[18px] font-semibold text-[#111827]">Active Automation Rules</h2>

              <div className="flex items-center gap-3">
                <select className="h-[40px] min-w-[150px] px-4 rounded-xl border border-[#dbe1e8] outline-none text-[14px] bg-white">
                  <option>All Types</option>
                </select>

                <div className="relative">
                  <input
                    placeholder="Search rules..."
                    className="w-[180px] xl:w-[220px] h-[40px] rounded-xl border border-[#dbe1e8] pl-10 pr-4 outline-none text-[14px] bg-white"
                  />

                  <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                </div>
              </div>
            </div>

            {/* TABLE */}

            <Table
              columns={columns}
              dataSource={dataSource}
              loading={loading}
              scroll={{ x: 1000 }}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: rules?.pagination?.total_records || 0,
              }}
              onChange={(pag) => {
                setPagination({
                  current: pag.current,
                  pageSize: pag.pageSize,
                });
              }}
            />
          </div>
        </div>

        {/* ================= RIGHT SECTION ================= */}

        <div className="w-[300px] shrink-0 space-y-4">
          {/* CREATE RULE */}

          <div className="bg-white border border-[#edf0f2] rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[20px] font-semibold text-[#111827]">Create New Rule</h2>

              {/* <DownOutlined className="text-[#6b7280]" /> */}
            </div>

            <div className="mt-3 space-y-3">
              {/* OPTION */}

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-[#22c55e] flex items-center justify-center mt-[2px]">
                  <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
                </div>

                <div>
                  <h3 className="text-[15px] font-semibold text-[#111827] mb-1">Performance Based</h3>

                  <p className="text-[13px] text-[#6b7280] mt-1 leading-6">
                    Trigger actions based on performance metrics
                  </p>
                </div>
              </div>

              {/* OPTION */}

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border border-[#cbd5e1] mt-[2px]" />

                <div>
                  <h3 className="text-[15px] font-semibold text-[#111827] mb-1">Duration Based</h3>

                  <p className="text-[13px] text-[#6b7280] mt-1 leading-6">Trigger actions based on time or date</p>
                </div>
              </div>

              <Button
                type="primary"
                block
                className="!h-[44px] !rounded-xl !bg-[#22c55e] !border-none !font-semibold mt-2"
              >
                Create Rule
              </Button>
            </div>
          </div>

          {/* QUICK PRESETS */}

          <div className="bg-white border border-[#edf0f2] rounded-2xl p-5">
            <h2 className="text-[20px] font-semibold text-[#111827]">Quick Presets</h2>

            <div className="mt-5 space-y-4">
              {[
                'Increase Bid - High ACOS',
                'Decrease Bid - Low CTR',
                // 'Pause - High ACOS',
                // 'Budget Increase - High Spend',
                // 'Night Pause (12AM - 6AM)',
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border border-[#edf0f2] rounded-xl p-3 hover:bg-[#fafafa] transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#ecfdf5] flex items-center justify-center">
                      <ThunderboltOutlined className="text-[#22c55e]" />
                    </div>

                    <div>
                      <h3 className="text-[13px] font-semibold text-[#111827]">{item}</h3>

                      <p className="text-[11px] text-[#6b7280] mt-1">Automation preset template</p>
                    </div>
                  </div>

                  <Button shape="circle" icon={<PlusOutlined />} />
                </div>
              ))}
            </div>

            <Button
              block
              className="
              !h-[42px]
              !rounded-xl
              mt-5
            "
            >
              View All Presets
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RulesAutomation;
