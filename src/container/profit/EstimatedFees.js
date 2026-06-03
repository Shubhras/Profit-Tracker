import React, { useEffect } from 'react';
import { Table, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getEstimatedFees } from '../../redux/dashboard/actionCreator';

function EstimatedFees() {
  const dispatch = useDispatch();

  const { loading, data } = useSelector((state) => state.estimatedFees || {});

  useEffect(() => {
    const payload = {
      filters: {
        seller_sku: 'SKU123',
        asin: 'B0XXXXXXX',
        marketplace_id: 'A21TJRUUN4KGV',
        fulfillment_channel: 'AFN',
        amazon_account_id: 1,
        order_item_id: 10,
      },
      pagination: {
        pageNo: 1,
        pageSize: 20,
      },
    };

    dispatch(getEstimatedFees(payload));
  }, [dispatch]);

  const tableData = data?.data?.results || data?.results || data?.data || [];

  const columns = [
    {
      title: 'Seller SKU',
      dataIndex: 'seller_sku',
      key: 'seller_sku',
    },
    {
      title: 'ASIN',
      dataIndex: 'asin',
      key: 'asin',
    },
    {
      title: 'Marketplace',
      dataIndex: 'marketplace_id',
      key: 'marketplace_id',
    },
    {
      title: 'Fulfillment Channel',
      dataIndex: 'fulfillment_channel',
      key: 'fulfillment_channel',
    },
    {
      title: 'Order Item Id',
      dataIndex: 'order_item_id',
      key: 'order_item_id',
    },
    {
      title: 'Estimated Fee',
      dataIndex: 'estimated_fee',
      key: 'estimated_fee',
      render: (value) => value ?? '-',
    },
  ];

  return (
    <div className="p-4">
      <div className="bg-white rounded-xl border border-[#e5e7eb] p-4">
        <h2 className="text-[16px] font-semibold mb-4">Estimated Fees</h2>

        <Spin spinning={loading}>
          <Table
            rowKey={(record, index) => record.id || record.order_item_id || index}
            columns={columns}
            dataSource={tableData}
            pagination={{
              current: 1,
              pageSize: 20,
              total: data?.data?.count || data?.count || tableData.length,
            }}
            scroll={{ x: 1200 }}
          />
        </Spin>
      </div>
    </div>
  );
}

export default EstimatedFees;
