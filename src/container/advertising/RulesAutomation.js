import React, { useEffect } from 'react';
import { Button, Table, Tag, Tooltip, Modal } from 'antd';
import {
  ExportOutlined,
  SearchOutlined,
  EyeOutlined,
  CalendarOutlined,
  DollarOutlined,
  ReloadOutlined,
  BarChartOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getRules } from '../../redux/advertising/actionCreator';

function RulesAutomation() {
  const dispatch = useDispatch();
  const [ruleType, setRuleType] = React.useState('');
  const [detailsModal, setDetailsModal] = React.useState(false);
  const [selectedRule, setSelectedRule] = React.useState(null);

  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });

  const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);

  const { rules, loading } = useSelector((state) => state.advertising);

  useEffect(() => {
    dispatch(getRules(pagination.current, pagination.pageSize, ruleType));
  }, [dispatch, pagination, ruleType]);

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
        <Tooltip title={v}>
          <span className="block truncate cursor-pointer max-w-[180px] mx-auto">{v}</span>
        </Tooltip>
      ),
    },

    {
      title: 'Budget Rule ID',
      dataIndex: 'budgetRuleId',
      align: 'center',
      render: (v) => (
        <Tooltip title={v}>
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
    {
      title: 'Action',
      dataIndex: 'action',
      align: 'center',

      render: (_, record) => (
        <EyeOutlined
          className="text-[18px] text-[#2563eb] cursor-pointer hover:text-[#1d4ed8] transition-all"
          onClick={() => {
            setSelectedRule(record);
            setDetailsModal(true);
          }}
        />
      ),
    },

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
    <>
      <div className="p-2">
        <div className="mt-3 mb-3 rounded-2xl border border-[#e5e7eb] bg-white shadow-sm overflow-hidden">
          {/* Header */}
          <div className="border-b border-[#edf0f2] px-6 py-4">
            <div>
              <h1 className="text-[23px] font-semibold text-[#111827] mb-1">Rules Automation</h1>

              <p className="mt-1 text-sm text-[#6b7280]">Manage and monitor Amazon budget automation rules.</p>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <div className="relative w-[280px]">
                <input
                  type="text"
                  placeholder="Search rules..."
                  className="w-full h-[42px] rounded-xl border border-[#dbe1e8] bg-white pl-11 pr-4 text-[14px] text-[#111827] outline-none"
                />

                <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[15px]" />
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <select
                    value={ruleType}
                    onChange={(e) => {
                      setRuleType(e.target.value);

                      setPagination({
                        current: 1,
                        pageSize: pagination.pageSize,
                      });
                    }}
                    className="
      h-[42px]
      min-w-[230px]
      px-4
      pr-11
      rounded-xl
      border
      border-[#dbe1e8]
      bg-white
      text-[#374151]
      font-medium
      outline-none
      cursor-pointer
      appearance-none
      shadow-sm
      hover:border-[#2563eb]
      focus:border-[#2563eb]
      transition-all
    "
                  >
                    <option value="">All Rules</option>
                    <option value="sp">Sponsored Products</option>
                    <option value="sd">Sponsored Display</option>
                    <option value="sb">Sponsored Brands</option>
                  </select>

                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280] text-[11px]">
                    ▼
                  </div>
                </div>

                <Button type="primary" icon={<ExportOutlined />} className="!h-[42px] !px-5 !rounded-xl !font-medium">
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
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: rules?.pagination?.total_records || 0,
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
          />
        </div>
      </div>
      <Modal
        open={detailsModal}
        onCancel={() => setDetailsModal(false)}
        footer={null}
        width={760}
        centered
        bodyStyle={{ padding: '20px' }}
        title={null}
      >
        {selectedRule && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#e5e7eb] pb-4">
              <div>
                <h2 className="text-[22px] font-semibold text-[#111827] leading-tight">{selectedRule.name}</h2>

                <p className="text-sm text-[#6b7280] mt-1">Automation Rule Configuration Details</p>
              </div>

              {/* <div className="px-3 py-1 rounded-full bg-[#eff6ff] text-[#2563eb] text-xs font-semibold">
                {selectedRule.ruleDetails?.ruleType}
              </div> */}
            </div>

            {/* Performance + Budget */}
            <div className="grid grid-cols-2 gap-4">
              {/* Performance */}
              <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#eff6ff] flex items-center justify-center mb-2">
                    <BarChartOutlined className="text-[#2563eb] text-[18px]" />
                  </div>

                  <div>
                    <h3 className="text-[15px] font-semibold text-[#111827]">Performance</h3>

                    <p className="text-xs text-[#6b7280]">Performance based condition</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6b7280]">Metric</span>

                    <span className="text-sm font-medium text-[#111827]">
                      {selectedRule.ruleDetails?.performanceMeasureCondition?.metricName}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-[#6b7280]">Operator</span>

                    <span className="text-sm font-medium text-[#111827]">
                      {selectedRule.ruleDetails?.performanceMeasureCondition?.comparisonOperator}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-[#6b7280]">Threshold</span>

                    <span className="text-sm font-semibold text-[#16a34a]">
                      {selectedRule.ruleDetails?.performanceMeasureCondition?.threshold}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Budget */}
              <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] flex items-center justify-center">
                    <DollarOutlined className="text-[#16a34a] text-[18px]" />
                  </div>

                  <div>
                    <h3 className="text-[15px] font-semibold text-[#111827]">Budget Increase</h3>

                    <p className="text-xs text-[#6b7280]">Budget increment settings</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6b7280]">Type</span>

                    <span className="text-sm font-medium text-[#111827]">
                      {selectedRule.ruleDetails?.budgetIncreaseBy?.type}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-[#6b7280]">Increase</span>

                    <span className="text-sm font-semibold text-[#16a34a]">
                      +{selectedRule.ruleDetails?.budgetIncreaseBy?.value}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Duration + Recurrence */}
            <div className="grid grid-cols-2 gap-4">
              {/* Duration */}
              <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#fef3c7] flex items-center justify-center">
                    <CalendarOutlined className="text-[#d97706] text-[18px]" />
                  </div>

                  <div>
                    <h3 className="text-[15px] font-semibold text-[#111827]">Duration</h3>

                    <p className="text-xs text-[#6b7280]">Rule active duration</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6b7280]">Start Date</span>

                    <span className="text-sm font-medium text-[#111827]">
                      {selectedRule.ruleDetails?.duration?.dateRangeTypeRuleDuration?.startDate}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-[#6b7280]">End Date</span>

                    <span className="text-sm font-medium text-[#111827]">
                      {selectedRule.ruleDetails?.duration?.dateRangeTypeRuleDuration?.endDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recurrence */}
              <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#f3e8ff] flex items-center justify-center">
                    <ReloadOutlined className="text-[#9333ea] text-[18px]" />
                  </div>

                  <div>
                    <h3 className="text-[15px] font-semibold text-[#111827]">Recurrence</h3>

                    <p className="text-xs text-[#6b7280]">Rule execution frequency</p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-[#6b7280]">Type</span>

                  <span className="text-sm font-medium text-[#111827]">
                    {selectedRule.ruleDetails?.recurrence?.type}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="rounded-2xl bg-[#f9fafb] border border-[#e5e7eb] px-4 py-3 flex items-start gap-3">
              <InfoCircleOutlined className="text-[#2563eb] mt-1" />

              <div>
                <p className="text-sm font-medium text-[#111827]">Rule Information</p>

                <p className="text-xs text-[#6b7280] mt-1 leading-relaxed">
                  This automation rule is configured based on performance metrics and budget optimization settings.
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

export default RulesAutomation;
