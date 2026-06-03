import React, { useEffect, useState } from 'react';
import { Button, Table, Tooltip, Tag, Dropdown, Checkbox } from 'antd';
import { FilterOutlined, SettingOutlined, SearchOutlined, RightOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAdProducts } from '../../redux/advertising/actionCreator';

function AdProducts() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });

  const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);
  const [visibleColumns, setVisibleColumns] = React.useState([]);

  const { loading, adsProductsData } = useSelector((state) => ({
    loading: state.advertising.loading,
    adsProductsData: state.advertising.adsProductsData,
  }));

  useEffect(() => {
    dispatch(
      getAdProducts(pagination.current, pagination.pageSize, {
        search: debouncedSearch,
      }),
    );
  }, [dispatch, pagination.current, pagination.pageSize, debouncedSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

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

  const allColumns = [
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
    {
      title: 'Image',
      dataIndex: 'image',
      width: 70,
      align: 'center',
      fixed: 'left',
      render: (image) => (
        <div className="flex justify-center">
          <img
            src={image}
            alt="product"
            className="w-[35px] h-[35px] rounded-xl object-cover border border-[#e5e7eb] p-[2px] bg-white shadow-sm"
          />
        </div>
      ),
    },

    {
      title: 'SKU',
      dataIndex: 'sku',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => String(a.sku || '').localeCompare(String(b.sku || '')),
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
      width: 70,
      sorter: (a, b) => Number(a.totalads || 0) - Number(b.totalads || 0),
      ellipsis: true,
      // render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },
    {
      title: 'Impressions',
      dataIndex: 'impressions',
      align: 'center',
      width: 70,
      sorter: (a, b) => Number(a.impressions || 0) - Number(b.impressions || 0),
      ellipsis: true,
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },

    {
      title: 'Clicks',
      dataIndex: 'clicks',
      align: 'center',
      width: 70,
      sorter: (a, b) => Number(a.clicks || 0) - Number(b.clicks || 0),
      ellipsis: true,
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },

    {
      title: 'Cost',
      dataIndex: 'cost',
      align: 'center',
      width: 70,
      sorter: (a, b) => Number(a.cost || 0) - Number(b.cost || 0),
      ellipsis: true,
      render: (v) => <span className="font-medium text-[#dc2626]">₹{Number(v ?? 0).toFixed(2)}</span>,
      // render: (v) => <span className="font-medium text-[#dc2626]">₹{v ?? 0}</span>,
    },

    {
      title: 'Sales',
      dataIndex: 'sales',
      align: 'center',
      width: 70,
      sorter: (a, b) => Number(a.sales || 0) - Number(b.sales || 0),
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
      width: 70,
      sorter: (a, b) => Number(a.orders || 0) - Number(b.orders || 0),
      ellipsis: true,
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },

    {
      title: 'Units',
      dataIndex: 'units',
      align: 'center',
      width: 70,
      sorter: (a, b) => Number(a.units || 0) - Number(b.units || 0),
      ellipsis: true,
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },

    {
      title: 'ACOS',
      dataIndex: 'acos',
      align: 'center',
      width: 70,
      sorter: (a, b) => Number(a.acos || 0) - Number(b.acos || 0),
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
      width: 70,
      sorter: (a, b) => Number(a.roas || 0) - Number(b.roas || 0),
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
      width: 40,
      fixed: 'right',
      align: 'center',

      render: (_, record) => (
        <button
          type="button"
          onClick={() => {
            navigate(`../AdProduct-Details/${record.sku}`);
          }}
          className="w-[28px] h-[28px] rounded-full border border-[#dbe1e8] flex items-center justify-center cursor-pointer hover:text-black transition-all duration-200 mx-auto"
        >
          <RightOutlined />
        </button>
      ),
    },
  ];
  useEffect(() => {
    if (allColumns.length && visibleColumns.length === 0) {
      setVisibleColumns(allColumns.map((col) => col.dataIndex || col.key || col.title));
    }
  }, []);

  const columnOptions = allColumns
    .filter((col) => col.dataIndex !== 'action')
    .map((col) => ({
      key: col.dataIndex || col.key || col.title,
      label: typeof col.title === 'string' ? col.title : col.dataIndex || 'Column',
    }));

  const manageColumnsDropdown = (
    <div className="w-[260px] bg-white rounded-xl shadow-xl border border-[#e5e7eb]">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <span className="font-medium text-[14px]">Manage Columns</span>

        <button
          type="button"
          className="text-[#6366f1] text-[12px]"
          onClick={() => setVisibleColumns(columnOptions.map((item) => item.key))}
        >
          Restore
        </button>
      </div>

      <div className="max-h-[350px] overflow-y-auto">
        {columnOptions.map((item) => (
          <div key={item.key} className="flex items-center justify-between px-4 py-2 hover:bg-[#f9fafb]">
            <span className="text-[13px] text-[#374151]">{item.label}</span>

            <Checkbox
              checked={visibleColumns.includes(item.key)}
              onChange={(e) => {
                if (e.target.checked) {
                  setVisibleColumns((prev) => [...prev, item.key]);
                } else {
                  setVisibleColumns((prev) => prev.filter((c) => c !== item.key));
                }
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const columns = allColumns.filter((col) => {
    const key = col.dataIndex || col.key || col.title;

    if (
      col.fixed === 'left' ||
      col.fixed === 'right' ||
      col.dataIndex === 'checkbox' ||
      col.dataIndex === 'image' ||
      col.dataIndex === 'action'
    ) {
      return true;
    }

    return visibleColumns.includes(key);
  });

  return (
    <>
      <div className="p-2">
        <div className="mt-3 mb-3 rounded-2xl border border-[#e5e7eb] bg-white shadow-sm overflow-hidden">
          {/* Header */}
          {/* Header */}
          <div className="border-b border-[#edf0f2] px-4 py-3">
            {/* Top Content */}
            <div>
              <h1 className="text-[19px] font-semibold text-[#111827] mb-1">Ad Products</h1>

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
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search ad products..."
                  className="w-full h-[30px] rounded-xl border bg-white pl-11 pr-4 text-[14px] text-[#111827] outline-none shadow-sm transition-all duration-200 focus:border-[#dbe1e8]"
                />

                <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[15px]" />
              </div>

              {/* RIGHT SIDE BUTTONS */}
              <div className="flex items-center gap-3">
                {/* FILTER */}
                <Button
                  icon={<FilterOutlined />}
                  className="!h-[30px] text-[13px] !px-5 !rounded-xl border border-[#dbe1e8] bg-white !text-[#111827] !font-medium !flex !items-center !justify-center"
                >
                  Filters
                </Button>

                {/* EXPORT */}
                <Dropdown trigger={['click']} dropdownRender={() => manageColumnsDropdown} placement="bottomRight">
                  <Button
                    icon={<SettingOutlined />}
                    className="!h-[30px] text-[13px] !px-5 !rounded-xl border border-[#dbe1e8] bg-white !text-[#111827] !font-medium !flex !items-center !justify-center"
                  >
                    Manage Columns
                  </Button>
                </Dropdown>
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
            scroll={{ x: 900 }}
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

export default AdProducts;
