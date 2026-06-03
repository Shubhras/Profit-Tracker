import React, { useEffect } from 'react';
import { Table, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getEstimatedFees } from '../../redux/dashboard/actionCreator';

function EstimatedFees() {
  const dispatch = useDispatch();

  const { loading, estimatefees } = useSelector((state) => state.dashboard);

  useEffect(() => {
    const payload = {
      filters: {
        // seller_sku: 'SKU123',
        // asin: 'B0XXXXXXX',
        // marketplace_id: 'A21TJRUUN4KGV',
        // fulfillment_channel: 'AFN',
        // amazon_account_id: 1,
        // order_item_id: 10,
      },
      pagination: {
        pageNo: 1,
        pageSize: 20,
      },
    };

    dispatch(getEstimatedFees(payload));
  }, [dispatch]);

  const dataSource =
    estimatefees?.data?.map((item) => ({
      key: item.id,
      id: item.id,
      sellerSku: item.seller_sku,
      asin: item.asin,
      marketplaceId: item.marketplace_id,
      fulfillmentChannel: item.fulfillment_channel,
      orderItemId: item.order_item_id,
      sellingPrice: item.selling_price,
      estimatedFee: item.estimated_fee,
      orderId: item.order_id,
      total_fees: item.total_fees,
      per_item_fee: item.per_item_fee,
      fba_fee: item.fba_fee,
    })) || [];

  const columns = [
    {
      title: 'Seller SKU',
      dataIndex: 'sellerSku',
      key: 'sellerSku',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => String(a.sellerSku).localeCompare(String(b.sellerSku)),
    },
    {
      title: 'ASIN',
      dataIndex: 'asin',
      key: 'asin',
      align: 'center',
      width: 70,
      sorter: (a, b) => String(a.asin).localeCompare(String(b.asin)),
    },
    {
      title: 'Marketplace',
      dataIndex: 'marketplaceId',
      key: 'marketplaceId',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => String(a.marketplaceId).localeCompare(String(b.marketplaceId)),
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
      title: 'Order Item Id',
      dataIndex: 'orderItemId',
      key: 'orderItemId',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.orderItemId - b.orderItemId,
    },
    {
      title: 'Selling Price',
      dataIndex: 'sellingPrice',
      key: 'sellingPrice',
      align: 'center',
      width: 70,
      render: (value) => value ?? '-',
      sorter: (a, b) => a.sellingPrice - b.sellingPrice,
    },

    {
      title: 'Total Fee',
      dataIndex: 'total_fees',
      align: 'center',
      width: 70,
      render: (value) => value ?? '-',
      sorter: (a, b) => a.total_fees - b.total_fees,
    },

    {
      title: 'Per Item Fee',
      dataIndex: 'per_item_fee',
      align: 'center',
      width: 70,
      render: (value) => value ?? '-',
      sorter: (a, b) => a.per_item_fee - b.per_item_fee,
    },
    {
      title: 'FBA Fee',
      dataIndex: 'fba_fee',
      align: 'center',
      width: 70,
      render: (value) => value ?? '-',
      sorter: (a, b) => a.fba_fee - b.fba_fee,
    },
  ];
  // const tableData = estimatefees?.data || [];

  return (
    <div className="p-4">
      <div className="bg-white rounded-xl border border-[#e5e7eb] p-4">
        <h2 className="text-[16px] font-semibold mb-4">Estimated Fees</h2>

        <Spin spinning={loading}>
          <Table
            rowKey={(record, index) => record.id || record.order_item_id || index}
            columns={columns}
            dataSource={dataSource}
            showSorterTooltip={false}
            tableLayout="fixed"
            pagination={{
              current: 1,
              pageSize: 20,
              total: dataSource.length,
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
        </Spin>
      </div>
    </div>
  );
}

export default EstimatedFees;
