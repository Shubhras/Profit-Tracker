import React, { useEffect } from 'react';
import { Button, Table, Tooltip, Tag } from 'antd';
import { FilterOutlined, ExportOutlined, SearchOutlined } from '@ant-design/icons';
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
      render: (v) => (
        <img
          src={v}
          alt="product"
          className="w-[55px] h-[55px] object-contain mx-auto rounded-lg border p-1 bg-white"
        />
      ),
    },

    {
      title: 'ASIN',
      dataIndex: 'asin',
      align: 'center',
      render: (v) => <span className="font-semibold text-[#2563eb]">{v || '-'}</span>,
    },

    {
      title: 'Brand',
      dataIndex: 'brand',
      align: 'center',
      render: (v) => <span className="font-medium text-[#111827]">{v || '-'}</span>,
    },

    {
      title: 'Product Name',
      dataIndex: 'itemName',
      align: 'center',
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span
            className="block truncate font-medium cursor-pointer text-[#111827] mx-auto"
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
      // sorter: (a, b) => {
      //   const rankA = Number(a.saleRank) || 0;
      //   const rankB = Number(b.saleRank) || 0;

      //   return rankA - rankB;
      // },
      sorter: (a, b) => a.saleRank - b.saleRank,
      render: (v) => <span className="text-[#374151]">{v || '-'}</span>,
    },

    {
      title: 'Display Group Rank',
      dataIndex: 'dispalyGroupRank',
      align: 'center',
      render: (v) => <Tag className="!px-3 !py-[3px] !rounded-full">{v || '-'}</Tag>,
    },

    {
      title: 'Sales Rank Category',
      dataIndex: 'saleRankCategry',
      align: 'center',
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span
            className="block truncate cursor-pointer text-[#374151] mx-auto"
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
      render: (v) => <Tag className="!px-3 !py-[3px] !rounded-full">{v || '-'}</Tag>,
    },
  ];
  return (
    <>
      <div className="p-2">
        <div className="mt-3 mb-3 rounded-2xl border border-[#e5e7eb] bg-white shadow-sm overflow-hidden">
          {/* Header */}
          {/* Header */}
          <div className="border-b border-[#edf0f2] px-6 py-4">
            {/* Top Content */}
            <div>
              <h1 className="text-[23px] font-semibold text-[#111827] mb-1">Product Ranking</h1>

              <p className="mt-1 text-sm text-[#6b7280]">
                Track ad products performance and marketplace level product data.
              </p>
            </div>

            {/* Bottom Row */}
            <div className="mt-5 flex items-center justify-between gap-3">
              {/* LEFT SIDE */}
              <div className="relative w-[280px]">
                <input
                  type="text"
                  placeholder="Search ad products..."
                  className="w-full h-[42px] rounded-xl border bg-white pl-11 pr-4 text-[14px] text-[#111827] outline-none shadow-sm transition-all duration-200 focus:border-[#dbe1e8]"
                />

                <SearchOutlined
                  className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-[#9ca3af]
              text-[15px]
            "
                />
              </div>

              {/* RIGHT SIDE BUTTONS */}
              <div className="flex items-center gap-3">
                {/* FILTER */}
                <Button
                  icon={<FilterOutlined />}
                  className="!h-[42px] !px-5 !rounded-xl border border-[#dbe1e8] bg-white !text-[#111827] !font-medium !flex !items-center !justify-center"
                >
                  Filters
                </Button>

                {/* EXPORT */}
                <Button
                  type="primary"
                  icon={<ExportOutlined />}
                  className="!h-[42px] !px-5 !rounded-xl !font-medium !flex !items-center !justify-center "
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
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: productRankingData?.count || 0,
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

export default ProductRanking;
