import React, { useEffect, useState } from 'react';
import { Modal, Input, Select, DatePicker, InputNumber, Button, Table, Tag, Tooltip } from 'antd';
import {
  // SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
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
            <Tag color="processing" className="!text-[11px] !px-2 !h-[20px] !font-medium cursor-pointer uppercase">
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
          className="!text-[10px] !px-2 !h-[20px] !font-medium cursor-pointer uppercase"
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
          className="!text-[10px] !px-2 h-[20px] !font-medium cursor-pointer uppercase"
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
      {/* <div className="px-3 py-4 bg-[#f5f7fb] min-h-screen"> */}
      <div className="px-3 py-3 bg-[#f5f7fb] min-h-screen sm:px-2">
        {/* ================= HEADER ================= */}

        <div className="flex items-start justify-between gap-3 mb-2 xl:flex-col xl:items-start">
          {' '}
          {/* LEFT */}
          <div>
            <h1 className="text-[20px] font-semibold text-[#111827] leading-none mb-[2px]">Rules & Automation</h1>

            <p className="text-[#6b7280] text-[11px] leading-4">
              Automate your Amazon advertising actions and improve performance.
            </p>
          </div>
          {/* RIGHT BUTTONS */}
          <div className="flex items-center gap-2 sm:w-full sm:flex-wrap">
            {' '}
            {/* ACTIVITY LOG */}
            <Button className="!h-[32px] !px-3 !rounded-l !border-[#dbe1e8] !shadow-none">
              <span className="text-[12px] font-medium leading-none">Activity Log</span>
            </Button>
            {/* CREATE RULE */}
            <Button
              type="primary"
              onClick={() => setOpenRuleModal(true)}
              className="flex items-center justify-center gap-0 h-[30px] px-2 rounded-l text-white font-bold text-[12px] transition-all w-full min-sm:w-auto"
            >
              <PlusOutlined />
              <span className="font-bold leading-none text-[12px]">Create Rule</span>
            </Button>
          </div>
        </div>

        <div className="inline-flex items-center bg-[#f8fafc] border border-[#e5e7eb] rounded-xl p-1 mb-2 overflow-x-auto">
          {' '}
          {['Budget Rules', 'Bids'].map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`min-w-[100px] sm:min-w-[130px] h-[35px] px-3 rounded-lg text-[13px] font-medium transition-all flex items-center justify-center gap-2
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
              { label: 'Overview', count: rules?.count || 0 },
              { label: 'Active Rules' },
              { label: 'Pending Execution' },
              { label: 'Rule History' },
              { label: 'Rule Templates' },
            ].map((tab, index) => {
              const active = tab.label === 'Overview';

              return (
                <div
                  key={index}
                  className={`relative flex items-center gap-1 pb-2 cursor-pointer whitespace-nowrap transition-all
            ${active ? 'text-[#16a34a] font-semibold' : 'text-[#6b7280] font-medium hover:text-[#111827]'}
          `}
                >
                  <span className="text-[13px] leading-none">{tab.label}</span>

                  {tab.count && (
                    <div
                      className={`min-w-[18px] h-[18px] px-[5px] rounded-full flex items-center justify-center text-[10px] font-semibold leading-none
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

        {/* ================= MAIN CONTENT ================= */}

        <div className="grid grid-cols-12 gap-2 lg:grid-cols-1">
          {' '}
          <div className="col-span-12 lg:col-span-12 space-y-2">
            {' '}
            <div className="bg-white border border-[#edf0f2] rounded-2xl shadow-sm overflow-hidden">
              {/* HEADER */}

              <div className="flex items-center justify-between px-3 py-2 border-b border-[#edf0f2] md:flex-col md:items-start md:gap-2">
                {' '}
                <div>
                  <h2 className="text-[15px] font-semibold text-[#111827] mb-0">Pending Execution Rules</h2>

                  {/* <p className="text-[12px] text-[#6b7280] mb-1">Rules waiting to execute.</p> */}
                </div>
                <div className="flex items-center gap-3">
                  {/* <Button type="primary" className="!h-[30px] text-[13px] !rounded-l !bg-[#2563eb]">
                    <span className="font-semibold">Run All Rules</span>
                  </Button> */}
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
                // scroll={{ x: 1000, y: 500 }}
                scroll={{ x: 800, y: 500 }}
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
        </div>
      </div>

      <Modal
        open={openRuleModal}
        onCancel={() => setOpenRuleModal(false)}
        footer={null}
        // width={820}
        width={window.innerWidth < 768 ? '95%' : 820}
        centered
      >
        <div className="p-1">
          {/* ================= HEADER ================= */}

          <div className="mb-3">
            <h2 className="text-[20px] font-bold text-[#111827] mb-1">Create Budget Rule</h2>

            <p className="text-[#6b7280] text-[13px] mt-1">Configure automation rules for your advertising campaigns</p>
          </div>

          {/* ================= BODY ================= */}

          <div className="bg-[#fafbfc] border border-[#edf0f2] rounded-2xl p-3 space-y-4">
            {/* TOP ROW */}

            <div className="grid grid-cols-2 gap-4 md:grid-cols-1">
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

            <div className="grid grid-cols-2 gap-4 md:grid-cols-1">
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

            <div className="grid grid-cols-2 gap-4 md:grid-cols-1">
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

          <div className="flex items-center justify-center gap-3 mt-6 sm:flex-col">
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
