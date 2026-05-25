import React, { useEffect } from 'react';
import { Button, Table, Tooltip, Tag } from 'antd';
import { FilterOutlined, ExportOutlined, SearchOutlined, RightOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAdProducts } from '../../redux/advertising/actionCreator';

function AdProducts() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });

  const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);

  const { loading, adsProductsData } = useSelector((state) => ({
    loading: state.advertising.loading,
    adsProductsData: state.advertising.adsProductsData,
  }));

  useEffect(() => {
    dispatch(getAdProducts(pagination.current, pagination.pageSize));
  }, [dispatch, pagination]);

  const dataSource =
    adsProductsData?.results?.map((item) => ({
      key: item.id,
      adId: item.ad_id,
      asin: item.asin,
      sku: item.sku,
      image: item.image_url,
      state: item.state,
      totalads: item.total_ads,
      campaignName: item.campaign_name,
      adGroupName: item.ad_group_name,
      countryCode: item.country_code,
      currencyCode: item.currency_code,
      impressions: item.impressions,
      clicks: item.clicks,
      cost: item.cost,
      sales: item.sales,
      orders: item.orders,
      units: item.metrics?.units,
      acos: item.metrics?.acos,
      roas: item.metrics?.roas,
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
    {
      title: 'Image',
      dataIndex: 'image',
      width: 100,
      align: 'center',
      fixed: 'left',
      render: (image) => (
        <div className="flex justify-center">
          <img
            src={image}
            alt="product"
            className="w-[50px] h-[50px] rounded-xl object-cover border border-[#e5e7eb] p-[2px] bg-white shadow-sm"
          />
        </div>
      ),
    },

    {
      title: 'SKU',
      dataIndex: 'sku',
      align: 'center',
      width: 100,
      ellipsis: true,
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span
            className="font-medium text-[#2563eb] block truncate cursor-pointer mx-auto"
            style={{
              maxWidth: '120px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {v}
          </span>
        </Tooltip>
      ),
    },

    // {
    //   title: 'State',
    //   dataIndex: 'state',
    //   align: 'center',
    //   render: (v) => (
    //     <Tag color={v === 'ENABLED' ? 'success' : 'error'} className="!px-3 !py-[3px] !rounded-full">
    //       {v}
    //     </Tag>
    //   ),
    // },

    // {
    //   title: 'Campaign Name',
    //   dataIndex: 'campaignName',
    //   align: 'center',
    //   render: (v) => (
    //     <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
    //       <span className="font-medium text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '190px' }}>
    //         {v}
    //       </span>
    //     </Tooltip>
    //   ),
    // },
    // {
    //   title: 'Ad GroupName',
    //   dataIndex: 'adGroupName',
    //   align: 'center',
    //   render: (v) => (
    //     <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
    //       <span className="font-medium text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '220px' }}>
    //         {v}
    //       </span>
    //     </Tooltip>
    //   ),
    // },

    // {
    //   title: 'Country Code',
    //   dataIndex: 'countryCode',
    //   align: 'center',
    // },

    // {
    //   title: 'Currency Code',
    //   dataIndex: 'currencyCode',
    //   align: 'center',
    // },
    {
      title: 'Total Ads',
      dataIndex: 'totalads',
      align: 'center',
      width: 100,
      ellipsis: true,
      // render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },
    {
      title: 'Impressions',
      dataIndex: 'impressions',
      align: 'center',
      width: 100,
      ellipsis: true,
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },

    {
      title: 'Clicks',
      dataIndex: 'clicks',
      align: 'center',
      width: 100,
      ellipsis: true,
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },

    {
      title: 'Cost',
      dataIndex: 'cost',
      align: 'center',
      width: 100,
      ellipsis: true,
      render: (v) => <span className="font-medium text-[#dc2626]">₹{Number(v ?? 0).toFixed(2)}</span>,
      // render: (v) => <span className="font-medium text-[#dc2626]">₹{v ?? 0}</span>,
    },

    {
      title: 'Sales',
      dataIndex: 'sales',
      align: 'center',
      width: 100,
      ellipsis: true,
      render: (v) => {
        const formattedValue = Number(v ?? 0).toLocaleString('en-IN');

        return <span className="font-medium text-[#16a34a] block truncate">₹{formattedValue}</span>;
      },
    },

    {
      title: 'Orders',
      dataIndex: 'orders',
      align: 'center',
      width: 100,
      ellipsis: true,
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },

    {
      title: 'Units',
      dataIndex: 'units',
      align: 'center',
      width: 100,
      ellipsis: true,
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },

    {
      title: 'ACOS',
      dataIndex: 'acos',
      align: 'center',
      width: 100,
      ellipsis: true,
      render: (v) => (
        <Tag className="!px-3 !py-[3px] !rounded-full" color={v > 100 ? 'error' : 'processing'}>
          {v ? `${v.toFixed(2)}%` : '-'}
        </Tag>
      ),
    },

    {
      title: 'ROAS',
      dataIndex: 'roas',
      align: 'center',
      width: 100,
      ellipsis: true,
      render: (v) => (
        <Tag className="!px-3 !py-[3px] !rounded-full" color={v >= 1 ? 'success' : 'warning'}>
          {v ? v.toFixed(2) : '-'}
        </Tag>
      ),
    },
    {
      title: '',
      dataIndex: 'action',
      width: 70,
      fixed: 'right',
      align: 'center',

      render: (_, record) => (
        <button
          type="button"
          onClick={() => {
            navigate(`../AdProduct-Details/${record.sku}`);
          }}
          className="w-[34px] h-[34px] rounded-full border border-[#dbe1e8] flex items-center justify-center cursor-pointer hover:text-black transition-all duration-200 mx-auto"
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
          <div className="border-b border-[#edf0f2] px-6 py-4">
            {/* Top Content */}
            <div>
              <h1 className="text-[23px] font-semibold text-[#111827] mb-1">Ad Products</h1>

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

                <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[15px]" />
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
            tableLayout="fixed"
            scroll={{ x: 1400 }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: adsProductsData?.pagination?.total_records || 0,
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
            // scroll={{ x: 'max-content' }}
            size="middle"
            bordered={false}
          />
        </div>
      </div>
    </>
  );
}

export default AdProducts;
