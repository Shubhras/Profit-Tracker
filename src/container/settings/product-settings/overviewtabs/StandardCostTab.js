import React from 'react';
import { Table } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { exportProfitData } from '../../../../redux/dashboard/actionCreator';

export default function StandardCostTab() {
  const dispatch = useDispatch();
  const handleExport = () => {
    dispatch(
      exportProfitData({
        reportType: 'Monthly Missing Export',

        params: {
          missingfield: 'costperunit',
          missingtype: 'withSales',
          exportType: 'channel,sku',
          orgName: null,

          filters: {
            channel: {
              IN: ['Amazon-India', 'Flipkart', 'Jiomart', 'Meesho', 'Myntra', 'Snapdeal'],
            },

            fromDate: '2026-04-30T18:30:00Z',
            toDate: '2026-05-31T18:29:59Z',
          },
        },

        email: 'bhavnaaprostore@gmail.com',
      }),
    );
  };
  const dataSource = [
    { key: '1', month: 'Jan-26', qty: 87, stdCost: 4061 },
    { key: '2', month: 'Dec-25', qty: 23, stdCost: 6196 },
    { key: '3', month: 'Nov-25', qty: 2, stdCost: 5153 },
    { key: '4', month: 'Oct-25', qty: 0, stdCost: 5994 },
    { key: '5', month: 'Sep-25', qty: 0, stdCost: 5111 },
    { key: '6', month: 'Aug-25', qty: 0, stdCost: 3820 },
  ];

  const columns = [
    {
      title: 'With Net Qty',
      dataIndex: 'month',
      key: 'month',
    },
    {
      title: 'Std Cost',
      dataIndex: 'qty',
      key: 'qty',
      align: 'center',
    },
    {
      title: 'Std Cost Tax',
      dataIndex: 'stdCost',
      key: 'stdCost',
      align: 'center',
    },
    {
      title: 'Export',
      key: 'export',
      align: 'center',
      render: () => <DownloadOutlined onClick={handleExport} className="text-blue-600 cursor-pointer" />,
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      size="small"
      pagination={false}
      scroll={{ x: true }}
      summary={() => (
        <Table.Summary.Row className="bg-gray-50">
          <Table.Summary.Cell colSpan={3}>
            <span className="font-medium">Date, SKU vs Avg (StdCostExc)</span>
          </Table.Summary.Cell>
          <Table.Summary.Cell align="center">
            <DownloadOutlined onClick={handleExport} className="text-blue-600 cursor-pointer" />
          </Table.Summary.Cell>
        </Table.Summary.Row>
      )}
    />
  );
}
