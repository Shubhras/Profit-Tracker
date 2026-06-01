import React, { useEffect, useState } from 'react';
import { Modal, Input, Select, DatePicker, InputNumber, Button, Table, Tag, Tooltip } from 'antd';
import {
  // SearchOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  PlusOutlined,
  ThunderboltOutlined,
  PlayCircleOutlined,
  DollarOutlined,
  SettingOutlined,
  DollarCircleOutlined,
  // DownOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';

import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import { getRules, getCreateRules, getUpdateRules, getCampaignsRulesList } from '../../redux/advertising/actionCreator';

dayjs.extend(weekday);
dayjs.extend(localeData);

function RulesAutomation() {
  const dispatch = useDispatch();
  // const [ruleType, setRuleType] = React.useState('');
  const [openRuleModal, setOpenRuleModal] = useState(false);
  const [campaignOptions, setCampaignOptions] = useState([]);
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 30,
  });
  const [deleteModal, setDeleteModal] = useState(false);

  const [deleteRuleId, setDeleteRuleId] = useState(null);
  const [editRuleId, setEditRuleId] = useState(null);
  const [selectedRuleData, setSelectedRuleData] = useState(null);
  const [activeTab, setActiveTab] = useState('Budget Rules');
  const initialRuleForm = {
    adType: undefined,
    name: '',
    ruleType: undefined,

    startDate: '',
    endDate: '',
    startDatePayload: '',
    endDatePayload: '',

    recurrenceType: 'DAILY',

    selectedDays: [],
    selectedMonthDates: [],

    increaseType: 'PERCENT',
    increaseValue: 20,

    metricName: '',
    threshold: 20,
    comparisonOperator: 'LESS_THAN_OR_EQUAL_TO',
    campaign_ids: [],
  };

  const [ruleForm, setRuleForm] = useState(initialRuleForm);

  const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);

  const { rules, loading } = useSelector((state) => state.advertising);

  useEffect(() => {
    dispatch(getRules(pagination.current, pagination.pageSize));
  }, [dispatch, pagination]);

  const fetchCampaigns = async () => {
    const response = await dispatch(getCampaignsRulesList());

    if (response?.status === true) {
      const formatted =
        response?.data?.map((item) => ({
          label: item.name,
          value: item.campaign_id,
        })) || [];

      setCampaignOptions(formatted);
    }
  };

  useEffect(() => {
    if (openRuleModal) {
      fetchCampaigns();
    }
  }, [openRuleModal]);

  const allCampaignIds = campaignOptions.map((item) => item.value);

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
      startDate: item.rule_details?.duration?.dateRangeTypeRuleDuration?.startDate,
      associated_campaigns: item.associated_campaigns,
      endDate: item.rule_details?.duration?.dateRangeTypeRuleDuration?.endDate,
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
          className="w-[13px] h-[13px] cursor-pointer accent-[#2563eb]"
        />
      ),
    },
    // {
    //   title: 'Status',
    //   dataIndex: 'ruleState',
    //   align: 'center',
    //   fixed: 'left',
    //   width: 90,

    //   render: (v, record) => (
    //     <Switch
    //       checked={v === 'ACTIVE'}
    //       size="small"
    //       onChange={async (checked) => {
    //         const updatePayload = {
    //           budgetRulesDetails: [
    //             {
    //               ruleId: record?.budgetRuleId,

    //               ruleState: checked ? 'ACTIVE' : 'PAUSED',

    //               ruleDetails: {
    //                 name: record?.ruleDetails?.name || record?.name,

    //                 recurrence: {
    //                   type: record?.ruleDetails?.recurrence?.type,

    //                   ...(record?.ruleDetails?.recurrence?.daysOfWeek && {
    //                     daysOfWeek: record?.ruleDetails?.recurrence?.daysOfWeek,
    //                   }),

    //                   ...(record?.ruleDetails?.recurrence?.daysOfMonth && {
    //                     daysOfMonth: record?.ruleDetails?.recurrence?.daysOfMonth,
    //                   }),
    //                 },

    //                 budgetIncreaseBy: {
    //                   type: record?.ruleDetails?.budgetIncreaseBy?.type,
    //                   value: Number(record?.ruleDetails?.budgetIncreaseBy?.value),
    //                 },

    //                 ...(record?.ruleDetails?.performanceMeasureCondition && {
    //                   performanceMeasureCondition: {
    //                     metricName: record?.ruleDetails?.performanceMeasureCondition?.metricName,
    //                     comparisonOperator: record?.ruleDetails?.performanceMeasureCondition?.comparisonOperator,
    //                     threshold: Number(record?.ruleDetails?.performanceMeasureCondition?.threshold),
    //                   },
    //                 }),
    //               },
    //             },
    //           ],
    //         };

    //         const response = await dispatch(getUpdateRules(pagination.current, pagination.pageSize, updatePayload));

    //         if (response?.status === true) {
    //           dispatch(getRules(pagination.current, pagination.pageSize));
    //         }
    //       }}
    //     />
    //   ),
    // },
    {
      title: 'Rule Name',
      dataIndex: 'name',
      align: 'center',
      sorter: (a, b) => a.name - b.name,
      width: 120,

      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span
            className="
          block
          truncate
          cursor-pointer
          text-[#111827]
          font-medium
          mx-auto
        "
            style={{ maxWidth: '100px' }}
          >
            {v}
          </span>
        </Tooltip>
      ),
    },

    // {
    //   title: 'Budget Rule ID',
    //   dataIndex: 'budgetRuleId',
    //   align: 'center',
    //   render: (v) => (
    //     <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
    //       <span className="block truncate text-[#2563eb] font-medium cursor-pointer max-w-[220px] mx-auto">{v}</span>
    //     </Tooltip>
    //   ),
    // },

    {
      title: 'Rule Type',
      dataIndex: 'ruleType',
      align: 'center',
      sorter: (a, b) => a.ruleType - b.ruleType,

      render: (v) => {
        const ruleTypeMap = {
          sp: 'Sponsored Products',
          sd: 'Sponsored Display',
          sb: 'Sponsored Brands',
        };

        return (
          <Tooltip title={ruleTypeMap[v] || v} color="black" overlayInnerStyle={{ color: '#fff' }}>
            <Tag color="processing" className="!text-[11px] !px-2 !py-[2px] !font-medium cursor-pointer uppercase">
              {v}
            </Tag>
          </Tooltip>
        );
      },
    },

    {
      title: 'Rule State',
      dataIndex: 'ruleState',
      align: 'center',
      sorter: (a, b) => a.ruleState - b.ruleState,
      render: (v) => (
        <Tag
          color={v === 'ACTIVE' ? 'success' : 'default'}
          className="!text-[11px] !px-2 !py-[2px] !font-medium cursor-pointer uppercase"
        >
          {v}
        </Tag>
      ),
    },

    {
      title: 'Rule Status',
      dataIndex: 'ruleStatus',
      align: 'center',
      sorter: (a, b) => a.ruleStatus - b.ruleStatus,
      render: (v) => (
        <Tag
          color={v === 'EXPIRED' ? 'error' : 'processing'}
          className="!text-[11px] !px-2 !py-[2px] !font-medium cursor-pointer uppercase"
        >
          {v}
        </Tag>
      ),
    },
    // {
    //   title: 'Action',
    //   dataIndex: 'action',
    //   align: 'center',

    //   render: () => (
    //     <EyeOutlined className="text-[18px] text-[#2563eb] cursor-pointer hover:text-[#1d4ed8] transition-all" />
    //   ),
    // },

    {
      title: 'Start Date',
      dataIndex: 'startDate',
      align: 'center',
      sorter: (a, b) => a.startDate - b.startDate,
      render: (v) => {
        if (!v) return '-';

        return `${v.slice(6, 8)}/${v.slice(4, 6)}/${v.slice(0, 4)}`;
      },
    },

    {
      title: 'End Date',
      dataIndex: 'endDate',
      align: 'center',
      sorter: (a, b) => a.endDate - b.endDate,
      render: (v) => {
        if (!v) return '-';

        return `${v.slice(6, 8)}/${v.slice(4, 6)}/${v.slice(0, 4)}`;
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      align: 'center',

      render: (_, record) => (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            className="w-[30px] h-[30px] rounded-xl border border-[#e5e7eb] bg-white shadow-sm flex items-center justify-center cursor-pointer hover:bg-[#eff6ff] hover:border-[#bfdbfe] transition-all "
            onClick={() => {
              setEditRuleId(record.key);

              setSelectedRuleData(record);

              setRuleForm({
                adType: record.ruleType,
                name: record.name,
                ruleType: record.ruleDetails?.ruleType || 'PERFORMANCE',

                startDate: record.startDate ? dayjs(record.startDate, 'YYYYMMDD') : null,

                endDate: record.endDate ? dayjs(record.endDate, 'YYYYMMDD') : null,

                recurrenceType: record.ruleDetails?.recurrence?.type || 'DAILY',

                selectedDays: [],
                selectedMonthDates: record.ruleDetails?.recurrence?.daysOfMonth || [],

                increaseType: record.ruleDetails?.budgetIncreaseBy?.type || 'PERCENT',

                increaseValue: record.ruleDetails?.budgetIncreaseBy?.value || 20,

                metricName: record.ruleDetails?.performanceMeasureCondition?.metricName || '',

                threshold: record.ruleDetails?.performanceMeasureCondition?.threshold || 20,
                campaign_ids: record?.associated_campaigns?.map((item) => item.campaign_id) || [],
                comparisonOperator:
                  record.ruleDetails?.performanceMeasureCondition?.comparisonOperator || 'LESS_THAN_OR_EQUAL_TO',
              });

              setOpenRuleModal(true);
            }}
          >
            <EditOutlined className="text-[13px] text-[#2563eb]" />
          </button>

          <button
            type="button"
            className="w-[30px] h-[30px] rounded-xl border border-[#fee2e2] bg-white shadow-sm flex items-center justify-center cursor-pointer hover:bg-[#fef2f2] hover:border-[#fecaca] transition-all"
            onClick={() => {
              setDeleteModal(true);

              // setDeleteRuleId(record?.budgetRuleId);
              setDeleteRuleId(record);
            }}
          >
            <DeleteOutlined className="text-[13px] text-red-500" />
          </button>
        </div>
      ),
    },
  ];

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const daysMap = {
    Mon: 'MONDAY',
    Tue: 'TUESDAY',
    Wed: 'WEDNESDAY',
    Thu: 'THURSDAY',
    Fri: 'FRIDAY',
    Sat: 'SATURDAY',
    Sun: 'SUNDAY',
  };

  const metricOptions =
    ruleForm.adType === 'sd'
      ? [{ label: 'ROAS', value: 'ROAS' }]
      : [
          { label: 'ROAS', value: 'ROAS' },
          { label: 'ACOS', value: 'ACOS' },
          { label: 'CTR', value: 'CTR' },
          { label: 'CVR', value: 'CVR' },
        ];

  const handleCreateRule = async () => {
    let response;

    if (editRuleId) {
      const updatePayload = {
        budgetRulesDetails: [
          {
            ruleId: selectedRuleData?.budgetRuleId,

            ruleState: 'ACTIVE',

            ruleDetails: {
              name: ruleForm.name,

              recurrence: {
                type: ruleForm.recurrenceType,

                ...(ruleForm.recurrenceType === 'WEEKLY' && {
                  daysOfWeek: ruleForm.selectedDays.map((day) => daysMap[day]),
                }),

                ...(ruleForm.recurrenceType === 'MONTHLY' && {
                  daysOfMonth: ruleForm.selectedMonthDates,
                }),
              },

              budgetIncreaseBy: {
                type: ruleForm.increaseType,
                value: Number(ruleForm.increaseValue),
              },
              campaign_ids: ruleForm.campaign_ids,
              performanceMeasureCondition: {
                metricName: ruleForm.metricName,
                comparisonOperator: ruleForm.comparisonOperator,
                threshold: Number(ruleForm.threshold),
              },
            },
          },
        ],
      };

      response = await dispatch(getUpdateRules(pagination.current, pagination.pageSize, updatePayload));
    } else {
      const createPayload = {
        ad_type: ruleForm.adType,

        budgetRulesDetails: [
          {
            name: ruleForm.name,

            ruleType: ruleForm.ruleType,

            duration: {
              dateRangeTypeRuleDuration: {
                startDate: ruleForm.startDatePayload,
                endDate: ruleForm.endDatePayload,
              },
            },

            recurrence: {
              type: ruleForm.recurrenceType,

              ...(ruleForm.recurrenceType === 'WEEKLY' && {
                daysOfWeek: ruleForm.selectedDays.map((day) => daysMap[day]),
              }),

              ...(ruleForm.recurrenceType === 'MONTHLY' && {
                daysOfMonth: ruleForm.selectedMonthDates,
              }),
            },

            budgetIncreaseBy: {
              type: ruleForm.increaseType,
              value: Number(ruleForm.increaseValue),
            },
            campaign_ids: ruleForm.campaign_ids,

            ...(ruleForm.ruleType === 'PERFORMANCE' && {
              performanceMeasureCondition: {
                metricName: ruleForm.metricName,
                threshold: Number(ruleForm.threshold),
                comparisonOperator: ruleForm.comparisonOperator,
              },
            }),
          },
        ],
      };

      response = await dispatch(getCreateRules(pagination.current, pagination.pageSize, createPayload));
    }

    if (response?.status === true) {
      setOpenRuleModal(false);

      setEditRuleId(null);

      setSelectedRuleData(null);

      setRuleForm(initialRuleForm);

      dispatch(getRules(pagination.current, pagination.pageSize));
    }
  };

  return (
    <>
      <div className="px-3 py-4 bg-[#f5f7fb] min-h-screen">
        {/* ================= HEADER ================= */}

        <div className="flex items-start justify-between mb-2">
          {/* LEFT */}

          <div>
            <h1 className="text-[20px] font-semibold text-[#111827] leading-none mb-[2px]">Rules & Automation</h1>

            <p className="text-[#6b7280] text-[11px] leading-4">
              Automate your Amazon advertising actions and improve performance.
            </p>
          </div>

          {/* RIGHT BUTTONS */}

          <div className="flex items-center gap-2">
            {/* ACTIVITY LOG */}

            <Button className="!h-[32px] !px-3 !rounded-lg !border-[#dbe1e8] !shadow-none">
              <span className="text-[12px] font-medium leading-none">Activity Log</span>
            </Button>

            {/* CREATE RULE */}

            <Button
              type="primary"
              icon={<PlusOutlined className="text-[11px]" />}
              onClick={() => setOpenRuleModal(true)}
              className="!h-[32px] !px-3 !rounded-lg !bg-[#2563eb] !border-none !flex !items-center !justify-center gap-0 !shadow-none"
            >
              <span className="font-semibold leading-none text-[12px]">Create Rule</span>
            </Button>
          </div>
        </div>

        <div className="inline-flex items-center bg-[#f8fafc] border border-[#e5e7eb] rounded-xl p-1 mb-2">
          {['Budget Rules', 'Bids'].map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`min-w-[100px] h-[35px] px-3 rounded-lg text-[13px] font-medium transition-all flex items-center justify-center gap-2
          ${
            active ? 'bg-white text-[#16a34a] shadow-sm border border-[#d1fae5]' : 'text-[#6b7280] hover:text-[#111827]'
          }
        `}
              >
                {tab === 'Budget Rules' ? (
                  <SettingOutlined className="text-[14px]" />
                ) : (
                  <DollarCircleOutlined className="text-[14px]" />
                )}

                {tab}
              </button>
            );
          })}
        </div>

        <div className="border border-[#edf0f2] rounded-xl px-3 pt-2 pb-0 mb-2 bg-white">
          <div className="flex items-center gap-5 overflow-x-auto scrollbar-hide">
            {[
              { label: 'Overview' },
              { label: 'Active Rules' },
              { label: 'Pending Execution', count: rules?.count || 0 },
              { label: 'Rule History' },
              { label: 'Rule Templates' },
            ].map((tab, index) => {
              const active = tab.label === 'Pending Execution';

              return (
                <div
                  key={index}
                  className={`relative flex items-center gap-1 pb-2 cursor-pointer whitespace-nowrap transition-all
            ${active ? 'text-[#16a34a] font-semibold' : 'text-[#6b7280] font-medium hover:text-[#111827]'}
          `}
                >
                  {/* LABEL */}

                  <span className="text-[12px] leading-none">{tab.label}</span>

                  {/* COUNT */}

                  {tab.count && (
                    <div
                      className={`
                min-w-[18px]
                h-[18px]
                px-[5px]
                rounded-full
                flex
                items-center
                justify-center
                text-[10px]
                font-semibold
                leading-none
                ${active ? 'bg-[#dbeafe] text-[#16a34a]' : 'bg-[#f3f4f6] text-[#6b7280]'}
              `}
                    >
                      {tab.count}
                    </div>
                  )}

                  {/* ACTIVE LINE */}

                  {active && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#16a34a] rounded-full" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= TOP 6 CARDS ================= */}

        {/* <div className="grid grid-cols-6 gap-2 mb-2"> */}
        <div className="flex flex-wrap gap-2 mb-2">
          {[
            {
              title: 'Active Rules',
              value: '32',
              sub: '↑ 18% vs last 30 days',
              icon: <ThunderboltOutlined className="text-[#22c55e]" />,
              bg: 'bg-[#ecfdf5]',
            },
            {
              title: 'Pending',
              value: '5',
              sub: 'Waiting to run',
              icon: <PlayCircleOutlined className="text-[#f97316]" />,
              bg: 'bg-[#fff7ed]',
            },
            {
              title: 'Actions',
              value: '892',
              sub: '↑ 24% vs last 30 days',
              icon: <PlayCircleOutlined className="text-[#2563eb]" />,
              bg: 'bg-[#eff6ff]',
            },
            {
              title: 'Impressions',
              value: '4.8M',
              sub: '↑ 16% vs last 30 days',
              icon: <EyeOutlined className="text-[#7c3aed]" />,
              bg: 'bg-[#f5f3ff]',
            },
            {
              title: 'Sales Impact',
              value: '$125K',
              sub: '↑ 22% vs last 30 days',
              icon: <DollarOutlined className="text-[#16a34a]" />,
              bg: 'bg-[#ecfdf5]',
            },
            {
              title: 'Time Saved',
              value: '48.5 hrs',
              sub: '↑ 30% vs last 30 days',
              icon: <PlayCircleOutlined className="text-[#f97316]" />,
              bg: 'bg-[#fff7ed]',
            },
          ].map((card, index) => (
            <div
              key={index}
              // className="bg-white border border-[#edf0f2] rounded-2xl px-4 py-3"
              // className="bg-white border border-[#edf0f2] rounded-2xl px-4 py-[10px]"
              className="bg-white border border-[#edf0f2] rounded-2xl px-3 py-3 flex flex-col justify-between w-[calc(16.66%-7px)] max-[1100px]:w-[calc(33.33%-6px)] max-[600px]:w-[calc(50%-4px)] min-h-[110px]"
            >
              <div className="flex items-start justify-between h-full">
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <p className="text-[12px] sm:text-[13px] text-[#6b7280] mb-[2px] leading-4">{card.title}</p>

                    <h2 className="text-[19px] sm:text-[23px] font-bold text-[#111827] leading-tight mt-1 break-words">
                      {card.value}
                    </h2>
                  </div>

                  <p className="text-[10px] sm:text-[11px] text-[#16a34a] font-medium leading-4">{card.sub}</p>
                </div>

                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${card.bg}`}
                >
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ================= MAIN CONTENT ================= */}

        <div className="grid grid-cols-12 gap-2">
          {/* ================= LEFT ================= */}

          <div className="col-span-9 space-y-2">
            <div className="bg-white border border-[#edf0f2] rounded-2xl shadow-sm overflow-hidden">
              {/* HEADER */}

              <div className="flex items-center justify-between px-3 py-2 border-b border-[#edf0f2]">
                <div>
                  <h2 className="text-[18px] font-semibold text-[#111827] mb-0">Pending Execution Rules</h2>

                  <p className="text-[12px] text-[#6b7280]">Rules waiting to execute.</p>
                </div>

                <div className="flex items-center gap-3">
                  <Button type="primary" className="!h-[30px] text-[13px] !rounded-l !bg-[#2563eb]">
                    <span className="font-semibold">Run All Rules</span>
                  </Button>
                </div>
              </div>

              {/* TABLE */}

              <Table
                columns={columns}
                dataSource={dataSource}
                loading={loading}
                showSorterTooltip={false}
                tableLayout="fixed"
                pagination={{
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: rules?.count || 0,

                  showSizeChanger: true,

                  pageSizeOptions: ['10', '20', '30', '50', '100'],

                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
                }}
                onChange={(pag) => {
                  setPagination({
                    current: pag.current,
                    pageSize: pag.pageSize,
                  });
                }}
                // scroll={{ x: 1000 }}
                scroll={{ x: 1000, y: 500 }}
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

            {/* ================= RULE TYPES ================= */}

            <div className="bg-white border border-[#edf0f2] rounded-xl p-[10px]">
              {/* HEADER */}

              <div className="mb-2">
                <h2 className="text-[16px] font-semibold text-[#111827] leading-none mb-[2px]">Rule Types</h2>

                <p className="text-[11px] text-[#6b7280] leading-4">Choose a type to create a new rule</p>
              </div>

              {/* CARDS */}

              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    title: 'Bids Rules',
                    desc: 'Automate bid adjustments to improve performance and achieve your targets',
                    rules: '17 rules',
                    icon: '📈',
                    bg: 'bg-[#eef4ff]',
                  },

                  {
                    title: 'Budget Rules',
                    desc: 'Automate budget actions to control spend and maximize efficiency',
                    rules: '8 rules',
                    icon: '💵',
                    bg: 'bg-[#edfdf3]',
                  },

                  {
                    title: 'Targeting Rules',
                    desc: 'Automate targeting actions for keywords, products and placements',
                    rules: '12 rules',
                    icon: '🎯',
                    bg: 'bg-[#fff4ea]',
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="
          border border-[#edf0f2]
          rounded-xl
          p-[10px]
          hover:shadow-sm
          transition-all
          cursor-pointer
          min-h-[92px]
          flex flex-col justify-between
        "
                  >
                    {/* TOP */}

                    <div className="flex items-start gap-2">
                      {/* ICON */}

                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-[13px] shrink-0 ${item.bg}`}
                      >
                        {item.icon}
                      </div>

                      {/* CONTENT */}

                      <div className="flex-1 min-w-0">
                        <h3 className="text-[12px] font-semibold text-[#111827] leading-4">{item.title}</h3>

                        <p className="text-[10px] text-[#6b7280] leading-4 mt-[2px]">{item.desc}</p>
                      </div>
                    </div>

                    {/* BOTTOM */}

                    <p className="text-[#2563eb] text-[10px] font-semibold ml-[32px] mt-1">{item.rules}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ================= QUICK PRESETS ================= */}

            <div className="bg-white border border-[#edf0f2] rounded-xl p-[10px]">
              {/* HEADER */}

              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-[16px] font-semibold text-[#111827] mb-[2px] leading-none">Quick Presets</h2>

                  <p className="text-[11px] text-[#6b7280] leading-4">Use pre-built templates to get started quickly</p>
                </div>

                <button type="button" className="text-[#2563eb] text-[11px] font-semibold hover:underline">
                  View All Presets →
                </button>
              </div>

              {/* PRESET CARDS */}

              <div className="grid grid-cols-4 gap-2">
                {[
                  {
                    title: 'Increase Bids - High ACOS',
                    desc: 'Increase bids for keywords with high ACOS',
                    rules: '6 rules',
                    icon: '📈',
                    bg: 'bg-[#eef4ff]',
                  },

                  {
                    title: 'Decrease Bids - Low CTR',
                    desc: 'Decrease bids for keywords with low CTR',
                    rules: '6 rules',
                    icon: '📉',
                    bg: 'bg-[#edfdf3]',
                  },

                  {
                    title: 'Boost Low Impressions',
                    desc: 'Increase bids for keywords with low impressions',
                    rules: '5 rules',
                    icon: '👁️',
                    bg: 'bg-[#f7efff]',
                  },

                  {
                    title: 'Protect Budget',
                    desc: 'Pause or reduce spend when budget is at risk',
                    rules: '4 rules',
                    icon: '🛡️',
                    bg: 'bg-[#fff4ea]',
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="
          border border-[#edf0f2]
          rounded-xl
          p-[10px]
          hover:shadow-sm
          transition-all
          cursor-pointer
          min-h-[88px]
          flex flex-col justify-between
        "
                  >
                    {/* TOP */}

                    <div className="flex items-start gap-2">
                      {/* ICON */}

                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-[13px] shrink-0 ${item.bg}`}
                      >
                        {item.icon}
                      </div>

                      {/* CONTENT */}

                      <div className="flex-1 min-w-0">
                        <h3 className="text-[11px] font-semibold text-[#111827] leading-4">{item.title}</h3>

                        <p className="text-[10px] text-[#6b7280] leading-4 mt-[2px]">{item.desc}</p>
                      </div>
                    </div>

                    {/* BOTTOM */}

                    <p className="text-[#2563eb] text-[10px] font-semibold ml-[30px] mt-1">{item.rules}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ================= RIGHT ================= */}

          <div className="col-span-3 space-y-[6px]">
            {/* ================= CREATE RULE ================= */}

            <div className="bg-white border border-[#edf0f2] rounded-xl p-[10px]">
              <h2 className="text-[15px] font-semibold text-[#111827] mb-2 leading-none">Create New Rule</h2>

              <div className="space-y-[6px]">
                <div className="border border-[#dbeafe] bg-[#f8fbff] rounded-lg p-2">
                  <h3 className="text-[12px] font-semibold text-[#111827] leading-4">Performance Based</h3>

                  <p className="text-[10px] text-[#6b7280] mt-[2px] leading-4">Trigger actions using metrics</p>
                </div>

                <div className="border border-[#edf0f2] bg-[#f8fbff] rounded-lg p-2">
                  <h3 className="text-[12px] font-semibold text-[#111827] leading-4">Duration Based</h3>

                  <p className="text-[10px] text-[#6b7280] mt-[2px] leading-4">Time & schedule based actions</p>
                </div>

                <div className="border border-[#edf0f2] bg-[#f8fbff] rounded-lg p-2">
                  <h3 className="text-[12px] font-semibold text-[#111827] leading-4">Schedule Based</h3>

                  <p className="text-[10px] text-[#6b7280] mt-[2px] leading-4">Execute on fixed schedules</p>
                </div>

                <Button type="primary" block className="!h-[34px] !rounded-lg !bg-[#2563eb] !border-none !mt-2">
                  <span className="text-[11px] font-medium">Create Rule</span>
                </Button>
              </div>
            </div>

            {/* ================= SMALL RULE TYPES ================= */}

            <div className="space-y-[6px]">
              <div className="bg-white border border-[#edf0f2] rounded-xl p-[10px]">
                {/* HEADER */}

                <div className="mb-2">
                  <h2 className="text-[15px] font-semibold text-[#111827] leading-none mb-[2px]">Rule Types</h2>

                  <p className="text-[10px] text-[#9ca3af] leading-4">All available rule types</p>
                </div>

                {/* LIST */}

                <div className="space-y-[6px]">
                  {[
                    {
                      label: 'Bids Rules',
                      count: 17,
                      bg: 'bg-[#eff6ff]',
                      text: 'text-[#2563eb]',
                    },

                    {
                      label: 'Budget Rules',
                      count: 8,
                      bg: 'bg-[#ecfdf5]',
                      text: 'text-[#16a34a]',
                    },

                    {
                      label: 'Targeting Rules',
                      count: 12,
                      bg: 'bg-[#fff7ed]',
                      text: 'text-[#f97316]',
                    },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#111827]">{item.label}</span>

                      <div
                        className={`
                min-w-[24px]
                h-[24px]
                px-2
                rounded-full
                flex items-center justify-center
                text-[10px]
                font-semibold
                ${item.bg}
                ${item.text}
              `}
                      >
                        {item.count}
                      </div>
                    </div>
                  ))}
                </div>

                {/* FOOTER LINK */}

                <button
                  type="button"
                  className="
          mt-3
          text-[#2563eb]
          text-[11px]
          font-semibold
          hover:underline
        "
                >
                  View All Rule Types →
                </button>
              </div>

              {/* ================= RECENT ACTIVITY ================= */}

              <div className="bg-white border border-[#edf0f2] rounded-xl p-[10px]">
                {/* HEADER */}

                <div className="mb-2">
                  <h2 className="text-[15px] font-semibold text-[#111827] leading-none">Recent Activity</h2>
                </div>

                {/* ACTIVITIES */}

                <div className="space-y-[8px]">
                  {[
                    {
                      title: 'High ACOS Control executed',
                      time: '2 min ago',
                    },

                    {
                      title: 'Daily Budget Protection executed',
                      time: '15 min ago',
                    },

                    {
                      title: 'Low CTR Optimization executed',
                      time: '1 hour ago',
                    },
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      {/* DOT */}

                      <div className="w-[6px] h-[6px] rounded-full bg-[#22c55e] mt-[5px] shrink-0" />

                      {/* CONTENT */}

                      <div className="min-w-0">
                        <h3 className="text-[11px] font-medium text-[#111827] leading-4">{item.title}</h3>

                        <p className="text-[9px] text-[#9ca3af] mt-[2px] leading-3">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* FOOTER */}

                <button type="button" className="mt-3 text-[#2563eb] text-[11px] font-semibold hover:underline">
                  View All Activity →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal open={openRuleModal} onCancel={() => setOpenRuleModal(false)} footer={null} width={820} centered>
        <div className="p-1">
          {/* ================= HEADER ================= */}

          <div className="mb-3">
            <h2 className="text-[20px] font-bold text-[#111827] mb-1">Create Budget Rule</h2>

            <p className="text-[#6b7280] text-[13px] mt-1">Configure automation rules for your advertising campaigns</p>
          </div>

          {/* ================= BODY ================= */}

          <div className="bg-[#fafbfc] border border-[#edf0f2] rounded-2xl p-3 space-y-4">
            {/* TOP ROW */}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[14px] font-medium text-[#374151] block mb-1">Advertising Type</label>

                <Select
                  value={ruleForm.adType || undefined}
                  onChange={(value) =>
                    setRuleForm({
                      ...ruleForm,
                      adType: value,
                    })
                  }
                  className="w-full !text-[13px]"
                  size="small"
                  placeholder="Select"
                  options={[
                    {
                      label: 'Sponsored Products (SP)',
                      value: 'sp',
                    },
                    {
                      label: 'Sponsored Brands (SB)',
                      value: 'sb',
                    },
                    {
                      label: 'Sponsored Display (SD)',
                      value: 'sd',
                    },
                  ]}
                />
              </div>

              <div>
                <label className="text-[14px] font-medium text-[#374151] block mb-1">Rule Type</label>

                <Select
                  value={ruleForm.ruleType || undefined}
                  placeholder="Select Rule Type"
                  onChange={(value) =>
                    setRuleForm({
                      ...ruleForm,
                      ruleType: value,
                    })
                  }
                  className="w-full !text-[13px]"
                  size="small"
                  options={[
                    {
                      label: 'Performance',
                      value: 'PERFORMANCE',
                    },
                    {
                      label: 'Schedule',
                      value: 'SCHEDULE',
                    },
                  ]}
                />
              </div>
            </div>

            {/* RULE NAME */}

            <div>
              <label className="text-[14px] font-medium text-[#374151] block mb-1">Rule Name</label>

              <Input
                placeholder="Enter rule name"
                value={ruleForm.name}
                size="small"
                onChange={(e) =>
                  setRuleForm({
                    ...ruleForm,
                    name: e.target.value,
                  })
                }
                className="!h-[44px] !rounded-xl !text-[13px]"
              />
            </div>

            {/* DATE RANGE */}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[15px] font-medium text-[#374151] block mb-1">Start Date</label>

                <DatePicker
                  value={ruleForm.startDate}
                  className="w-full !h-[44px] !rounded-xl"
                  size="small"
                  onChange={(date, dateString) =>
                    setRuleForm({
                      ...ruleForm,
                      startDate: date,
                      startDatePayload: dateString.replaceAll('-', ''),
                    })
                  }
                />
              </div>

              <div>
                <label className="text-[14px] font-medium text-[#374151] block mb-1">End Date</label>

                <DatePicker
                  value={ruleForm.endDate}
                  size="small"
                  className="w-full !h-[44px] !rounded-xl"
                  onChange={(date, dateString) =>
                    setRuleForm({
                      ...ruleForm,
                      endDate: date,
                      endDatePayload: dateString.replaceAll('-', ''),
                    })
                  }
                />
              </div>
            </div>

            {/* ACTIONS */}

            <div className="grid grid-cols-2 gap-4">
              {/* RECURRENCE */}

              <div>
                <label className="text-[14px] font-medium text-[#374151] block mb-1">Recurrence</label>

                <Select
                  className="w-full !text-[13px]"
                  size="small"
                  value={ruleForm.recurrenceType}
                  onChange={(value) =>
                    setRuleForm({
                      ...ruleForm,
                      recurrenceType: value,
                      selectedDays: [],
                      monthlyDate: null,
                    })
                  }
                  options={[
                    { label: 'Daily', value: 'DAILY' },
                    { label: 'Weekly', value: 'WEEKLY' },
                    { label: 'Monthly', value: 'MONTHLY' },
                  ]}
                />

                {/* WEEKLY DAYS */}

                {ruleForm.recurrenceType === 'WEEKLY' && (
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {weekDays.map((day) => {
                      const active = ruleForm.selectedDays.includes(day);

                      return (
                        <button
                          type="button"
                          key={day}
                          onClick={() => {
                            const updatedDays = active
                              ? ruleForm.selectedDays.filter((d) => d !== day)
                              : [...ruleForm.selectedDays, day];

                            setRuleForm({
                              ...ruleForm,
                              selectedDays: updatedDays,
                            });
                          }}
                          className={`
                px-3 py-2 rounded-xl text-[13px]
                font-medium cursor-pointer transition-all
                border
                ${active ? 'bg-[#2563eb] text-white border-[#2563eb]' : 'bg-[#f3f4f6] text-[#374151] border-[#e5e7eb]'}
              `}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* MONTHLY DATE */}

                {ruleForm.recurrenceType === 'MONTHLY' && (
                  <div className="mt-3">
                    <DatePicker
                      className="w-full !h-[42px] !rounded-xl"
                      placeholder="Select monthly date"
                      onChange={(date) => {
                        if (!date) return;

                        const selectedDate = date.date();

                        if (!ruleForm.selectedMonthDates.includes(selectedDate)) {
                          setRuleForm({
                            ...ruleForm,
                            selectedMonthDates: [...ruleForm.selectedMonthDates, selectedDate],
                          });
                        }
                      }}
                    />

                    {/* SELECTED DATES */}

                    {ruleForm.selectedMonthDates.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {ruleForm.selectedMonthDates.map((d) => (
                          <div
                            key={d}
                            className="
              px-3 py-1.5 rounded-xl
              bg-[#2563eb]
              text-white text-[13px]
              font-medium
              flex items-center gap-2
            "
                          >
                            {d}

                            <button
                              type="button"
                              onClick={() =>
                                setRuleForm({
                                  ...ruleForm,
                                  selectedMonthDates: ruleForm.selectedMonthDates.filter((item) => item !== d),
                                })
                              }
                              className="text-white"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* INCREASE TYPE */}

              <div>
                <label className="text-[14px] font-medium text-[#374151] block mb-1">Increase Type</label>

                <Select
                  className="w-full text-[13px]"
                  size="small"
                  value={ruleForm.increaseType}
                  onChange={(value) =>
                    setRuleForm({
                      ...ruleForm,
                      increaseType: value,
                    })
                  }
                  options={[
                    {
                      label: 'Percentage',
                      value: 'PERCENT',
                    },
                    {
                      label: 'Fixed Amount',
                      value: 'FIXED',
                    },
                  ]}
                />
              </div>
            </div>

            {/* VALUE */}

            <div>
              <label className="text-[14px] font-medium text-[#374151] block mb-1">Increase Value</label>

              <InputNumber
                className="w-full !h-[44px]"
                placeholder="20"
                size="small"
                value={ruleForm.increaseValue}
                onChange={(value) =>
                  setRuleForm({
                    ...ruleForm,
                    increaseValue: value,
                  })
                }
              />
            </div>
            {/* ================= CAMPAIGNS ================= */}

            {/* ================= CAMPAIGNS ================= */}

            <div>
              <label className="text-[14px] font-medium text-[#374151] block mb-1">Associated Campaigns</label>

              <Select
                mode="multiple"
                size="small"
                placeholder="Select campaigns"
                value={ruleForm.campaign_ids}
                optionFilterProp="label"
                showSearch
                maxTagCount="responsive"
                className="
    w-full text-[12px]
    [&_.ant-select-selector]:min-h-[42px]
    [&_.ant-select-selector]:py-[4px]
    [&_.ant-select-selection-item]:h-[24px]
    [&_.ant-select-selection-item]:rounded-md
    [&_.ant-select-selection-item]:flex
    [&_.ant-select-selection-item]:items-center
    [&_.ant-select-selection-item]:px-2
    [&_.ant-select-selection-item]:text-[12px]
    [&_.ant-select-selection-item-content]:flex
    [&_.ant-select-selection-item-content]:items-center
    [&_.ant-select-selection-item-content]:leading-none
    [&_.ant-select-selection-item-remove]:flex
    [&_.ant-select-selection-item-remove]:items-center
    [&_.ant-select-selection-item-remove]:ml-1
    [&_.ant-select-selection-item-remove]:text-[11px]
  "
                onChange={(value) => {
                  if (value.includes('ALL')) {
                    setRuleForm({
                      ...ruleForm,
                      campaign_ids: ruleForm.campaign_ids.length === allCampaignIds.length ? [] : allCampaignIds,
                    });
                  } else {
                    setRuleForm({
                      ...ruleForm,
                      campaign_ids: value,
                    });
                  }
                }}
                options={[
                  {
                    label: ruleForm.campaign_ids.length === allCampaignIds.length ? 'Deselect All' : 'Select All',
                    value: 'ALL',
                  },
                  ...campaignOptions,
                ]}
              />
            </div>
            {/* PERFORMANCE CONDITIONS */}

            {ruleForm.ruleType === 'PERFORMANCE' && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[14px] font-medium text-[#374151] block mb-1">Performance Metric</label>

                  <Select
                    className="w-full !text-[13px]"
                    size="small"
                    value={ruleForm.metricName}
                    onChange={(value) =>
                      setRuleForm({
                        ...ruleForm,
                        metricName: value,
                      })
                    }
                    options={metricOptions}
                  />
                </div>

                <div>
                  <label className="text-[14px] font-medium text-[#374151] block mb-1">Operator</label>

                  <Select
                    className="w-full !text-[13px]"
                    size="small"
                    value={ruleForm.comparisonOperator}
                    onChange={(value) =>
                      setRuleForm({
                        ...ruleForm,
                        comparisonOperator: value,
                      })
                    }
                    options={[
                      {
                        label: 'Less Than',
                        value: 'LESS_THAN',
                      },
                      {
                        label: 'Less Than Equal',
                        value: 'LESS_THAN_OR_EQUAL_TO',
                      },
                      {
                        label: 'Greater Than',
                        value: 'GREATER_THAN',
                      },
                    ]}
                  />
                </div>

                <div>
                  <label className="text-[14px] font-medium text-[#374151] block mb-1">Threshold</label>

                  <InputNumber
                    className="w-full !h-[44px]"
                    placeholder="20"
                    size="small"
                    value={ruleForm.threshold}
                    onChange={(value) =>
                      setRuleForm({
                        ...ruleForm,
                        threshold: value,
                      })
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* ================= FOOTER ================= */}

          <div className="flex items-center justify-end gap-3 mt-3">
            <Button className="!h-[35px] !px-4 text-[13px] !rounded-xl" onClick={() => setOpenRuleModal(false)}>
              Cancel
            </Button>

            <Button
              type="primary"
              onClick={handleCreateRule}
              loading={loading}
              className="!h-[35px] !px-4 !rounded-xl !bg-[#2563eb] !border-none text-[13px] font-semibold"
            >
              {editRuleId ? 'Update Rule' : 'Create Rule'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={deleteModal}
        onCancel={() => {
          setDeleteModal(false);

          setDeleteRuleId(null);
        }}
        footer={null}
        centered
        width={420}
      >
        <div className="py-3 px-1">
          {/* ICON */}

          <div className="w-[62px] h-[62px] rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <DeleteOutlined className="text-[28px] text-red-500" />
          </div>

          {/* TEXT */}

          <h2 className="text-[22px] font-bold text-[#111827] text-center mb-2">Delete Rule</h2>

          <p className="text-[14px] text-[#6b7280] text-center leading-6">
            Are you sure you want to delete this rule?
            <br />
            This action cannot be undone.
          </p>

          {/* BUTTONS */}

          <div className="flex items-center justify-center gap-3 mt-6">
            <Button
              className="!h-[42px] !px-5 !rounded-xl"
              onClick={() => {
                setDeleteModal(false);

                setDeleteRuleId(null);
              }}
            >
              Cancel
            </Button>

            <Button
              danger
              type="primary"
              loading={loading}
              className="!h-[42px] !px-6 !rounded-xl"
              onClick={async () => {
                const updatePayload = {
                  budgetRulesDetails: [
                    {
                      ruleId: deleteRuleId?.budgetRuleId,

                      ruleState: 'PAUSED',

                      ruleDetails: {
                        name: deleteRuleId?.ruleDetails?.name || deleteRuleId?.name,

                        recurrence: {
                          type: deleteRuleId?.ruleDetails?.recurrence?.type,

                          ...(deleteRuleId?.ruleDetails?.recurrence?.daysOfWeek && {
                            daysOfWeek: deleteRuleId?.ruleDetails?.recurrence?.daysOfWeek,
                          }),

                          ...(deleteRuleId?.ruleDetails?.recurrence?.daysOfMonth && {
                            daysOfMonth: deleteRuleId?.ruleDetails?.recurrence?.daysOfMonth,
                          }),
                        },

                        budgetIncreaseBy: {
                          type: deleteRuleId?.ruleDetails?.budgetIncreaseBy?.type,

                          value: Number(deleteRuleId?.ruleDetails?.budgetIncreaseBy?.value),
                        },

                        ...(deleteRuleId?.ruleDetails?.performanceMeasureCondition && {
                          performanceMeasureCondition: {
                            metricName: deleteRuleId?.ruleDetails?.performanceMeasureCondition?.metricName,

                            comparisonOperator:
                              deleteRuleId?.ruleDetails?.performanceMeasureCondition?.comparisonOperator,

                            threshold: Number(deleteRuleId?.ruleDetails?.performanceMeasureCondition?.threshold),
                          },
                        }),
                      },
                    },
                  ],
                };

                const response = await dispatch(getUpdateRules(pagination.current, pagination.pageSize, updatePayload));

                if (response?.status === true) {
                  setDeleteModal(false);

                  setDeleteRuleId(null);

                  dispatch(getRules(pagination.current, pagination.pageSize));
                }
              }}
            >
              <span className="font-semibold"> Yes, Delete</span>
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default RulesAutomation;
