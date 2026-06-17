import React, { useEffect, useState } from 'react';
import { Button, Table, Tag, Tooltip, Modal, Popover, Input, Switch } from 'antd';
import { ExportOutlined, SearchOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getTargets } from '../../redux/advertising/actionCreator';

function Targets() {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [isBidModalOpen, setIsBidModalOpen] = React.useState(false);
  const [selectedBid, setSelectedBid] = React.useState('');
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });
  const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);
  const [openBidId, setOpenBidId] = useState(null);
  const [bidValue, setBidValue] = useState('');
  const [stateFilter, setStateFilter] = useState('');

  const { targets, loading } = useSelector((state) => state.advertising);

  useEffect(() => {
    const payload = {
      search: debouncedSearch || '',
      page: pagination.current,
      page_size: pagination.pageSize,
      state: stateFilter,
    };

    dispatch(getTargets(pagination.current, pagination.pageSize, payload));
  }, [dispatch, pagination.current, pagination.pageSize, debouncedSearch, stateFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 700);

    return () => clearTimeout(timer);
  }, [searchText]);

  const dataSource =
    targets?.results?.map((item) => ({
      key: item.id,

      id: item.id,
      targetId: item.target_id,

      expressionType: item.expression_type,

      expression: item.expression?.map((exp) => `${exp.type} : ${exp.value}`).join(', ') || '-',

      bid: item.bid,

      state: item.state,

      createdAt: item.created_at,

      campaignId: item.campaign__campaign_id,
      campaignName: item.campaign__name,

      adGroupId: item.ad_group__ad_group_id,
      adGroupName: item.ad_group__name,
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
      width: 40,
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

    {
      title: 'State',
      dataIndex: 'state',
      align: 'center',
      width: 40,

      render: (v, record) => (
        <Switch
          checked={v === 'ENABLED'}
          size="small"
          onChange={(checked) => {
            const updatedState = checked ? 'ENABLED' : 'PAUSED';

            console.log('Updated State:', updatedState, record);
          }}
        />
      ),
    },

    {
      title: 'Target ID',
      dataIndex: 'targetId',
      width: 70,
      ellipsis: true,
      align: 'center',
      sorter: (a, b) => a.targetId - b.targetId,

      render: (v) => {
        const text = String(v);

        return (
          <Tooltip title={text} color="black" overlayInnerStyle={{ color: '#fff' }}>
            <span className="text-[#2563eb] font-medium cursor-pointer" style={{ maxWidth: '100px' }}>
              {text.length > 12 ? `${text.slice(0, 12)}...` : text}
            </span>
          </Tooltip>
        );
      },
    },

    {
      title: 'Expression',
      dataIndex: 'expression',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => String(a.expression).localeCompare(String(b.expression)),

      render: (v) => (
        <div className="flex justify-center">
          <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
            <span
              className="font-medium text-[#111827] block truncate cursor-pointer text-center"
              style={{ maxWidth: '100px' }}
            >
              {v}
            </span>
          </Tooltip>
        </div>
      ),
    },

    {
      title: 'Expression Type',
      dataIndex: 'expressionType',
      align: 'center',
      width: 50,
      sorter: (a, b) => a.profiexpressionTypetPercent - b.expressionType,
      ellipsis: true,
      render: (v) => (
        <Tag color="processing" title="" className="!px-3 !py-[3px] !rounded-full">
          {v}
        </Tag>
      ),
    },
    // {
    //   title: 'Bid',
    //   dataIndex: 'bid',
    //   align: 'center',
    //   width: 50,
    //   ellipsis: true,
    //   sorter: (a, b) => a.bid - b.bid,
    //   render: (v) => (
    //     <button
    //       type="button"
    //       onClick={() => {
    //         setSelectedBid(v);
    //         setIsBidModalOpen(true);
    //       }}
    //       className="px-3 py-[6px] rounded-xl border border-transparent text-[#111827] font-medium bg-transparent hover:border-[#dbe1e8] hover:bg-white hover:shadow-sm transition-all duration-200"
    //     >
    //       ₹{Number(v ?? 0).toFixed(2)}
    //     </button>
    //   ),
    // },

    {
      title: 'Bid',
      dataIndex: 'bid',
      align: 'center',
      width: 60,
      ellipsis: true,
      sorter: (a, b) => a.bid - b.bid,

      render: (_, record) => {
        const bidContent = (
          <div className="w-[200px]">
            <Input
              prefix="₹"
              value={bidValue}
              onChange={(e) => setBidValue(e.target.value)}
              className="!rounded-l !h-[30px] text-[14px]"
            />

            <div className="mt-2 pt-2 flex justify-end gap-2">
              <Button
                onClick={() => {
                  setOpenBidId(null);
                  setBidValue('');
                }}
                className="!border-0 !shadow-none !bg-transparent !text-[#6b7280] hover:!text-[#374151]"
              >
                Cancel
              </Button>

              <Button
                onClick={() => {
                  console.log('Updated Bid:', bidValue);

                  // API later
                  setOpenBidId(null);
                }}
                className="
              !text-white
              hover:!text-white
              focus:!text-white
              active:!text-white
              !border-0
              !rounded-xl
              !font-semibold
              !shadow-[0_4px_12px_rgba(22,101,52,0.25)]
            "
                style={{
                  background: 'linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(15, 118, 110) 100%)',
                }}
              >
                Save
              </Button>
            </div>
          </div>
        );

        return (
          <Popover
            trigger="click"
            placement="bottom"
            content={bidContent}
            open={openBidId === record.targetId}
            onOpenChange={(open) => {
              if (open) {
                setOpenBidId(record.targetId);
                setBidValue(record.bid);
              } else {
                setOpenBidId(null);
              }
            }}
          >
            <button
              type="button"
              className="group relative overflow-hidden w-[72px] px-2 py-[7px] rounded-2xl border border-transparent bg-transparent hover:border-[#dbeafe] hover:bg-[#f8fbff] transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#eff6ff] via-[#f8fafc] to-[#ecfeff] opacity-80" />

              <div className="relative w-full truncate text-center">
                <span className="text-[10px] font-bold text-[#0f172a] truncate block">
                  ₹{Number(record.bid ?? 0).toFixed(2)}
                </span>
              </div>
            </button>
          </Popover>
        );
      },
    },

    {
      title: 'Campaign Name',
      dataIndex: 'campaignName',
      align: 'center',
      width: 70,
      sorter: (a, b) => String(a.campaignName).localeCompare(String(b.campaignName)),
      ellipsis: true,
      render: (v) => (
        <div className="flex justify-center">
          <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
            <span className="text-[#111827] block truncate cursor-pointer text-center" style={{ maxWidth: '100px' }}>
              {v || '-'}
            </span>
          </Tooltip>
        </div>
      ),
    },

    {
      title: 'Ad Group Name',
      dataIndex: 'adGroupName',
      align: 'center',
      width: 70,
      sorter: (a, b) => String(a.adGroupName).localeCompare(String(b.adGroupName)),

      ellipsis: true,
      render: (v) => (
        <div className="flex justify-center">
          <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
            <span className="text-[#111827] block truncate cursor-pointer text-center" style={{ maxWidth: '100px' }}>
              {v || '-'}
            </span>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="p-2">
        <div className="mt-3 mb-3 rounded-2xl border border-[#e5e7eb] bg-white shadow-sm overflow-visible">
          {/* Header */}
          <div className="border-b border-[#edf0f2] px-3 py-3">
            {/* TOP CONTENT */}
            <div>
              <h1 className="text-[19px] font-semibold text-[#111827] mb-1">Targets</h1>

              <p className="mt-1 text-sm text-[#6b7280]">
                Track keyword bids, targeting, ad group performance and marketplace activity.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="relative w-[280px] lg:w-full">
                <input
                  type="text"
                  placeholder="Search keywords..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full h-[30px] rounded-xl border border-[#dbe1e8] bg-white pl-11 pr-4 text-[14px] text-[#111827] outline-none shadow-sm transition-all duration-200 focus:border-[#dbe1e8] hover:border-[#dbe1e8]"
                />

                <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[15px]" />
              </div>

              <div className="flex items-center gap-3 lg:w-full sm:flex-col sm:items-stretch">
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="h-[30px] px-3 pr-6 rounded-xl border border-[#dbe1e8] text-[#374151] font-medium bg-white text-[12px] outline-none cursor-pointer sm:w-full"
                >
                  <option value="">All State</option>
                  <option value="ENABLED">Enabled</option>
                  <option value="PAUSED">Paused</option>
                </select>
                <Button
                  type="primary"
                  icon={<ExportOutlined />}
                  className="!h-[30px] text-[13px] !px-3 sm:!w-full !rounded-xl !bg-[#2563eb] !border-[#2563eb] !font-semibold !shadow-sm !flex !items-center !justify-center"
                >
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Table */}
          {/* <div className="overflow-x-auto"> */}
          <Table
            columns={columns}
            dataSource={dataSource}
            loading={loading}
            showSorterTooltip={false}
            tableLayout="fixed"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: targets?.pagination?.total_records || 0,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
            }}
            onChange={(pag) => {
              setPagination((prev) => ({
                ...prev,
                current: pag.current,
                pageSize: pag.pageSize,
              }));
            }}
            scroll={{ x: 600 }}
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
          {/* </div> */}
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

            <button type="button" className="h-[42px] px-6 rounded-xl bg-[#111827] text-white font-semibold">
              Save
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default Targets;
