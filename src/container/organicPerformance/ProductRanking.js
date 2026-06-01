import React, { useEffect } from 'react';
import { Button, Table, Tooltip, Tag } from 'antd';
import {
  FilterOutlined,
  ExportOutlined,
  SearchOutlined,
  TrophyOutlined,
  InboxOutlined,
  RiseOutlined,
  FundProjectionScreenOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getProductRanking } from '../../redux/organicPerformance/actionCreator';

function ProductRanking() {
  const dispatch = useDispatch();

  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });

  // const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);

  const { loading, productRankingData } = useSelector((state) => ({
    loading: state?.OrganicPerformance?.loading,
    productRankingData: state?.OrganicPerformance?.productRankingData,
  }));

  useEffect(() => {
    dispatch(getProductRanking(pagination.current, pagination.pageSize, {}));
  }, [dispatch, pagination]);

  const dataSource =
    productRankingData?.data?.map((item) => ({
      key: item.id,
      image: item.image_url,

      asin: item.asin,
      brand: item.brand,
      itemName: item.item_name,
      saleRank: item.sales_rank,
      saleRankCategry: item.sales_rank_category,
      dispalyGroupRank: item.display_group_rank,
      groupRankTitle: item.display_group_rank_title,
    })) || [];

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      align: 'center',
      width: 50,
      render: (v) => (
        <img
          src={v}
          alt="product"
          className="w-[40px] h-[40px] object-contain mx-auto rounded-lg border p-1 bg-white"
        />
      ),
    },

    {
      title: 'ASIN',
      dataIndex: 'asin',
      align: 'center',
      width: 70,
      render: (v) => <span className="font-semibold text-[#2563eb] text-[11px]">{v || '-'}</span>,
    },

    {
      title: 'Brand',
      dataIndex: 'brand',
      align: 'center',
      width: 70,
      render: (v) => <span className="font-medium text-[#111827] text-[11px]">{v || '-'}</span>,
    },

    {
      title: 'Product Name',
      dataIndex: 'itemName',
      align: 'center',
      width: 70,
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span
            className="block truncate font-medium cursor-pointer text-[#111827] mx-auto text-[11px]"
            style={{ maxWidth: '200px' }}
          >
            {v || '-'}
          </span>
        </Tooltip>
      ),
    },

    {
      title: 'Sales Rank',
      dataIndex: 'saleRank',
      align: 'center',
      width: 70,
      // sorter: (a, b) => {
      //   const rankA = Number(a.saleRank) || 0;
      //   const rankB = Number(b.saleRank) || 0;

      //   return rankA - rankB;
      // },
      sorter: (a, b) => a.saleRank - b.saleRank,
      render: (v) => <span className="text-[#374151] text-[11px]">{v || '-'}</span>,
    },

    {
      title: 'Display Group Rank',
      dataIndex: 'dispalyGroupRank',
      align: 'center',
      width: 70,
      ellipsis: true,
      render: (v) => <Tag className="!px-3 !py-[3px] !rounded-full text-[11px]">{v || '-'}</Tag>,
    },

    {
      title: 'Sales Rank Category',
      dataIndex: 'saleRankCategry',
      align: 'center',
      width: 70,
      ellipsis: true,
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span
            className="block truncate cursor-pointer text-[#374151] mx-auto text-[11px]"
            style={{
              maxWidth: '180px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {v || '-'}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Group Rank Title',
      dataIndex: 'groupRankTitle',
      align: 'center',
      width: 70,
      ellipsis: true,
      render: (v) => <Tag className="!px-3 !py-[3px] !rounded-full text-[11px]">{v || '-'}</Tag>,
    },
  ];

  const stats = [
    {
      title: 'Total Products Tracked',
      value: '156',
      change: '—',
      trend: 'neutral',
      icon: <InboxOutlined className="text-[#7c3aed]" />,
      bg: 'bg-[#f3e8ff]',
    },

    {
      title: 'In Top 100 (Sales Rank)',
      value: '28',
      change: '12%',
      trend: 'up',
      icon: <TrophyOutlined className="text-[#16a34a]" />,
      bg: 'bg-[#dcfce7]',
    },

    {
      title: 'Avg. Sales Rank',
      value: '856',
      change: '8%',
      trend: 'down',
      icon: <RiseOutlined className="text-[#f59e0b]" />,
      bg: 'bg-[#fef3c7]',
    },

    {
      title: 'Avg. Display Group Rank',
      value: '45,362',
      change: '5%',
      trend: 'down',
      icon: <FundProjectionScreenOutlined className="text-[#2563eb]" />,
      bg: 'bg-[#dbeafe]',
    },

    {
      title: 'Products Improved',
      value: '64',
      change: '18%',
      trend: 'up',
      icon: <ArrowUpOutlined className="text-[#16a34a]" />,
      bg: 'bg-[#dcfce7]',
    },

    {
      title: 'Products Declined',
      value: '34',
      change: '6%',
      trend: 'up',
      icon: <ArrowDownOutlined className="text-[#ef4444]" />,
      bg: 'bg-[#fee2e2]',
    },
  ];

  return (
    <div className="p-3 px-3 bg-[#f8fafc] min-h-screen">
      {/* HEADER */}

      <div className="flex items-start justify-between mb-2 flex-wrap gap-3">
        <div>
          <h1 className="text-[20px] font-bold mb-0">Product Ranking</h1>

          <p className="text-[13px] text-[#6b7280]">
            Track your product performance and marketplace level ranking data.
          </p>
        </div>

        <div className="flex gap-2 h-[30px] text-[11px]">
          <Button className="text-[11px h-[30px]]" icon={<FilterOutlined />}>
            Filters
          </Button>

          <Button
            className="bg-[#16a34a] border-[#16a34a] text-white font-semibold h-[30px] text-[11px]"
            icon={<ExportOutlined />}
          >
            Export
          </Button>
        </div>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-6 gap-2 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 mb-2">
        {stats.map((item) => (
          <div key={item.title} className="bg-white border border-[#edf0f2] rounded-xl px-3 py-3 min-h-[92px]">
            {/* TOP ROW */}
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] font-medium text-[#6b7280] leading-[14px]">{item.title}</p>

              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.bg}`}>
                {item.icon}
              </div>
            </div>

            {/* VALUE */}
            <div className="text-[20px] font-bold text-[#111827] leading-none mb-2">{item.value}</div>

            {/* CHANGE */}
            <div
              className={`flex items-center gap-1 text-[11px] font-medium ${
                item.trend === 'up' ? 'text-[#16a34a]' : item.trend === 'down' ? 'text-[#ef4444]' : 'text-[#6b7280]'
              }`}
            >
              {item.trend === 'up' && <span>↑</span>}
              {item.trend === 'down' && <span>↓</span>}

              <span>{item.change}</span>

              <span className="text-[#6b7280]">vs last 30 days</span>
            </div>
          </div>
        ))}
      </div>

      {/* FILTERS */}

      <div className="bg-white border border-[#edf0f2] rounded-xl p-3 mb-2">
        <div className="grid grid-cols-5 xl:grid-cols-2 md:grid-cols-1 gap-3">
          <select className="h-[35px] border rounded-lg px-3 text-[12px]">
            <option>All Product Groups</option>
          </select>

          <select className="h-[35px] border rounded-lg px-3 text-[12px]">
            <option>All Categories</option>
          </select>

          <select className="h-[35px] border rounded-lg px-3 text-[12px]">
            <option>All Brands</option>
          </select>

          <input
            type="text"
            value="01/05/2026 - 31/05/2026"
            readOnly
            className="h-[35px] border rounded-lg px-3 text-[12px]"
          />

          <div className="relative">
            <input
              placeholder="Search by product name or ASIN..."
              className="w-full h-[35px] border rounded-lg pl-10 pr-3 text-[12px]"
            />

            <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
          </div>
        </div>
      </div>

      {/* TABLE CARD */}

      <div className="bg-white border border-[#edf0f2] rounded-xl overflow-hidden">
        <div className="px-3 py-2 border-b border-[#edf0f2]">
          <h2 className="font-semibold text-[15px] text-[#111827] mb-0">Product Ranking Overview</h2>
        </div>

        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          showSorterTooltip={false}
          tableLayout="fixed"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: productRankingData?.count || 0,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={(pag) => {
            setPagination({
              current: pag.current,
              pageSize: pag.pageSize,
            });
          }}
          scroll={{ x: 800 }}
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
  );
}

export default ProductRanking;
