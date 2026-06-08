import React, { useEffect, useState } from 'react';
import { Table, Tooltip } from 'antd';
import { ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getSearchTerms } from '../../redux/advertising/actionCreator';

function CampaignSecondDetails() {
  const { id } = useParams();
  const location = useLocation();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });

  const { searchTerms, loading } = useSelector((state) => state.advertising);

  useEffect(() => {
    dispatch(
      getSearchTerms(pagination.current, pagination.pageSize, {
        filters: {
          // search: 'headphones',
          campaign_id: Number(id),
          search: debouncedSearch,
        },
        pagination: {
          pageNo: pagination.current,
          pageSize: pagination.pageSize,
        },
      }),
    );
    // }, [dispatch, pagination, id]);
  }, [dispatch, pagination.current, pagination.pageSize, id, debouncedSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  const dataSource =
    searchTerms?.data?.map((item, index) => ({
      key: item.id || index,
      campaignName: item.campaign_name,
      searchTerm: item.search_term,
      clicks: item.clicks,
      cost: item.cost,
      sales: item.sales,
      orders: item.orders,
      acos: item.acos,
      roas: item.roas,
    })) || [];
  const adGroupName = location?.state?.adGroupName || '-';

  const columns = [
    {
      title: 'Campaign Name',
      dataIndex: 'campaignName',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => String(a.campaignName).localeCompare(String(b.campaignName)),
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="font-medium text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '220px' }}>
            {v}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Search Term',
      dataIndex: 'searchTerm',
      align: 'center',
      width: 70,
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="font-medium text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '220px' }}>
            {v}
          </span>
        </Tooltip>
      ),
      sorter: (a, b) => String(a.searchTerm).localeCompare(String(b.searchTerm)),
    },
    {
      title: 'Clicks',
      dataIndex: 'clicks',
      align: 'center',
      width: 70,
      render: (v) => v || '-',
      sorter: (a, b) => a.clicks - b.clicks,
    },
    {
      title: 'Cost',
      dataIndex: 'cost',
      align: 'center',
      width: 70,
      render: (v) => v || '-',
      sorter: (a, b) => a.cost - b.cost,
    },

    {
      title: 'Sales',
      dataIndex: 'sales',
      align: 'center',
      width: 70,
      render: (v) => v || '-',
      sorter: (a, b) => a.sales - b.sales,
    },
    {
      title: 'Orders',
      dataIndex: 'orders',
      align: 'center',
      width: 70,
      render: (v) => v || '-',
      sorter: (a, b) => a.orders - b.orders,
    },
    {
      title: 'ACOS',
      dataIndex: 'acos',
      align: 'center',
      width: 70,
      render: (v) => v || '-',
      sorter: (a, b) => a.acos - b.acos,
    },
    {
      title: 'ROAS',
      dataIndex: 'roas',
      align: 'center',
      width: 70,
      render: (v) => v || '-',
      sorter: (a, b) => a.roas - b.roas,
    },
  ];

  return (
    <>
      <div className="p-2">
        <div className="mt-3 mb-3 rounded-2xl border border-[#e5e7eb] bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#edf0f2]">
            <div className="border-b border-[#edf0f2] px-3 py-2">
              {/* Top Row */}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-[30px] h-[30px] rounded-xl border border-[#dbe1e8]
      bg-white flex items-center justify-center hover:bg-[#f8fafc]
      transition-all duration-200 shadow-sm"
                >
                  <ArrowLeftOutlined className="text-[#374151]" />
                </button>

                <div className="flex flex-col">
                  <h1 className="text-[17px] font-semibold text-[#111827] leading-[30px] mb-0">Ad Products Details</h1>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] text-[#6b7280] font-medium">Ad Group Name:</span>

                    <div className="min-w-[120px] h-[20px] px-2 rounded-full bg-[#eff6ff] border border-[#bfdbfe] text-[#2563eb] text-[12px] font-semibold flex items-center justify-center">
                      {adGroupName || 'Campaign Details'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="mt-5 flex items-center justify-between mb-2">
                {/* Search */}
                <div className="relative w-[260px]">
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search ad groups..."
                    className="w-full h-[30px] rounded-xl border border-[#dbe1e8] bg-white pl-11 pr-4 text-[14px] text-[#111827] outline-none shadow-sm focus:border-[#2563eb]"
                  />

                  <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[15px]" />
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={dataSource}
            loading={loading}
            tableLayout="fixed"
            showSorterTooltip={false}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: searchTerms?.pagination?.totalItems || 0,
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
            scroll={{ x: 900 }}
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
    </>
  );
}

export default CampaignSecondDetails;
