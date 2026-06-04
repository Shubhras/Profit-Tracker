import React, { useEffect, useState } from 'react';
import { Table, Spin, Tooltip, Checkbox, Dropdown, Button } from 'antd';
import { SearchOutlined, SettingOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getEstimatedFees } from '../../redux/dashboard/actionCreator';

function EstimatedFees() {
  const dispatch = useDispatch();

  const { loading, estimatefees } = useSelector((state) => state.dashboard);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchText, setSearchText] = useState('');
  const [fullfilment, setFullfilment] = useState('');
  const [visibleColumns, setVisibleColumns] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
  });
  useEffect(() => {
    const payload = {
      filters: {
        // seller_sku: 'SKU123',
        // asin: 'B0XXXXXXX',
        // marketplace_id: 'A21TJRUUN4KGV',
        // fulfillment_channel: 'AFN',
        // amazon_account_id: 1,
        // order_item_id: 10,
        search: debouncedSearch,
        fulfillment_channel: fullfilment,
      },
      pagination: {
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
      },
    };

    dispatch(getEstimatedFees(payload));
  }, [dispatch, pagination.current, pagination.pageSize, debouncedSearch, fullfilment]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  const dataSource =
    estimatefees?.data?.map((item) => ({
      key: item.id,
      id: item.id,
      order_id: item.order_id,
      order_item_id: item.order_item_id,
      image_url: item.image_url,
      sellerSku: item.seller_sku,
      asin: item.asin,
      marketplaceId: item.marketplace_id,
      currency: item.currency,
      sellingPrice: item.selling_price,
      total_fees: item.total_fees,
      referral_fee: item.referral_fee,
      closing_fee: item.closing_fee,
      per_item_fee: item.per_item_fee,
      fba_fee: item.fba_fee,
      fba_pick_pack_fee: item.fba_pick_pack_fee,
      fba_weight_handling_fee: item.fba_weight_handling_fee,
      tax_amount: item.tax_amount,
      fulfillmentChannel: item.fulfillment_channel,
    })) || [];

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image_url',
      width: 50,
      align: 'center',
      render: (url) => (url ? <img src={url} alt="product" className="w-10 h-10 object-contain mx-auto" /> : '-'),
    },
    {
      title: 'Seller SKU',
      dataIndex: 'sellerSku',
      key: 'sellerSku',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => String(a.sellerSku).localeCompare(String(b.sellerSku)),
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="font-medium text-[#111827] cursor-pointer">{v}</span>
        </Tooltip>
      ),
    },
    {
      title: 'ASIN',
      dataIndex: 'asin',
      key: 'asin',
      align: 'center',
      width: 70,
      sorter: (a, b) => String(a.asin).localeCompare(String(b.asin)),
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span
            className="block font-medium text-[#111827] cursor-pointer overflow-hidden whitespace-nowrap text-ellipsis"
            style={{ maxWidth: '100%' }}
          >
            {v}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Fulfillment Channel',
      dataIndex: 'fulfillmentChannel',
      key: 'fulfillmentChannel',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => String(a.fulfillmentChannel).localeCompare(String(b.fulfillmentChannel)),
    },
    {
      title: 'Order Id',
      dataIndex: 'order_id',
      key: 'order_id',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.order_id - b.order_id,
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="font-medium text-[#111827] cursor-pointer">{v}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Selling Price',
      dataIndex: 'sellingPrice',
      key: 'sellingPrice',
      align: 'center',
      width: 70,
      ellipsis: true,
      render: (v) => <span className="font-medium text-[#111827] cursor-pointer"> ₹{v}</span>,
      sorter: (a, b) => a.sellingPrice - b.sellingPrice,
    },

    {
      title: 'Total Fee',
      dataIndex: 'total_fees',
      align: 'center',
      width: 70,
      ellipsis: true,
      render: (v) => <span className="font-medium text-[#111827] cursor-pointer"> ₹{v}</span>,
      sorter: (a, b) => a.total_fees - b.total_fees,
    },

    {
      title: 'Per Item Fee',
      dataIndex: 'per_item_fee',
      align: 'center',
      width: 70,
      ellipsis: true,
      render: (v) => <span className="font-medium text-[#111827] cursor-pointer"> ₹{v}</span>,
      sorter: (a, b) => a.per_item_fee - b.per_item_fee,
    },
    {
      title: 'FBA Fee',
      dataIndex: 'fba_fee',
      align: 'center',
      width: 70,
      ellipsis: true,
      render: (v) => <span className="font-medium text-[#111827] cursor-pointer"> ₹{v}</span>,
      sorter: (a, b) => a.fba_fee - b.fba_fee,
    },
    {
      title: 'Referral Fee',
      dataIndex: 'referral_fee',
      align: 'center',
      width: 70,
      ellipsis: true,
      render: (v) => <span className="font-medium text-[#111827] cursor-pointer"> ₹{v}</span>,
      sorter: (a, b) => a.referral_fee - b.referral_fee,
    },
    {
      title: 'Closing Fee',
      dataIndex: 'closing_fee',
      align: 'center',
      width: 70,
      ellipsis: true,
      render: (v) => <span className="font-medium text-[#111827] cursor-pointer"> ₹{v}</span>,
      sorter: (a, b) => a.closing_fee - b.closing_fee,
    },
    {
      title: 'FBA Pick Pack Fee',
      dataIndex: 'fba_pick_pack_fee',
      align: 'center',
      width: 70,
      ellipsis: true,
      render: (v) => <span className="font-medium text-[#111827] cursor-pointer"> ₹{v}</span>,
      sorter: (a, b) => a.fba_pick_pack_fee - b.fba_pick_pack_fee,
    },
    {
      title: 'FBA Weight Handling Fee',
      dataIndex: 'fba_weight_handling_fee',
      align: 'center',
      width: 70,
      ellipsis: true,
      render: (v) => <span className="font-medium text-[#111827] cursor-pointer"> ₹{v}</span>,
      sorter: (a, b) => a.fba_weight_handling_fee - b.fba_weight_handling_fee,
    },
    {
      title: 'Tax Amount',
      dataIndex: 'tax_amount',
      align: 'center',
      width: 70,
      ellipsis: true,
      render: (v) => <span className="font-medium text-[#111827] cursor-pointer"> ₹{v}</span>,
      sorter: (a, b) => a.tax_amount - b.tax_amount,
    },
  ];
  // const tableData = estimatefees?.data || [];

  useEffect(() => {
    if (columns.length && visibleColumns.length === 0) {
      setVisibleColumns(columns.map((col) => col.dataIndex || col.key || col.title));
    }
  }, []);

  const columnOptions = columns.map((col) => ({
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

  const filteredColumns = columns.filter((col) => {
    const key = col.dataIndex || col.key || col.title;
    return visibleColumns.includes(key);
  });

  return (
    <div className="p-4">
      <div className="bg-white rounded-xl border border-[#e5e7eb] p-4">
        <h2 className="text-[20px] font-semibold mb-4">Estimated Fees</h2>

        <div className="flex items-center justify-between gap-3 mb-3">
          {/* Search */}
          <div className="relative w-[280px]">
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by SKU, ASIN, OrderID, "
              className="w-full h-[30px] rounded-xl border border-[#dbe1e8] bg-white pl-11 pr-4 text-[12px] outline-none"
            />
            <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <select
              value={fullfilment}
              onChange={(e) => setFullfilment(e.target.value)}
              className="h-[30px] w-[170px] px-2 rounded-xl border border-[#dbe1e8] text-[#374151] font-medium bg-white text-[12px] outline-none cursor-pointer"
            >
              <option value="">All Fulfillment</option>
              <option value="AFN">AFN</option>
              <option value="MFN">MFN</option>
            </select>

            <Dropdown trigger={['click']} dropdownRender={() => manageColumnsDropdown} placement="bottomRight">
              <Button
                icon={<SettingOutlined />}
                className="!h-[30px] !flex !items-center !justify-center gap-1 text-[13px] !rounded-xl !border-[#dbe1e8] !text-[#374151] !font-medium"
              >
                Manage Columns
              </Button>
            </Dropdown>
          </div>
        </div>

        <Spin spinning={loading}>
          <Table
            rowKey={(record, index) => record.id || record.order_item_id || index}
            columns={filteredColumns}
            dataSource={dataSource}
            showSorterTooltip={false}
            tableLayout="fixed"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: estimatefees?.pagination?.totalRecords || 0,
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
            scroll={{ x: 1200 }}
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
        </Spin>
      </div>
    </div>
  );
}

export default EstimatedFees;
