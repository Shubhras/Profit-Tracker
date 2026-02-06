import React, { useState } from 'react';
import { Table, Switch, Input, Button, Form, Row, Col, Card } from 'antd';
import ajioIcon from '../../../../assets/icons/ajio.png';

export default function InventoryConfig() {
  const [form] = Form.useForm();

  const [tableData] = useState([
    {
      key: '1',
      channel: 'Ajio',
      storageMaster: 100,
      idealDIO: 30,
      moq: 10,
      procurementDays: 15,
      bundleSKUs: 3,
      isBundle: true,
    },
    {
      key: '2',
      channel: 'Flipkart',
      storageMaster: 200,
      idealDIO: 25,
      moq: 5,
      procurementDays: 10,
      bundleSKUs: 1,
      isBundle: false,
    },
  ]);

  const columns = [
    {
      title: '',
      dataIndex: 'channel',
      width: 40,
      render: (text) => (
        <div className="flex justify-center">
          {text === 'Ajio' && <img src={ajioIcon} alt="Ajio" style={{ width: 20, height: 20 }} />}
        </div>
      ),
    },
    {
      title: 'Storage Master',
      dataIndex: 'storageMaster',
      width: 140,
      sorter: (a, b) => a.storageMaster - b.storageMaster,
    },
    { title: 'Ideal DIO', dataIndex: 'idealDIO', width: 120, sorter: (a, b) => a.idealDIO - b.idealDIO },
    { title: 'MOQ', dataIndex: 'moq', width: 100, sorter: (a, b) => a.moq - b.moq },
    {
      title: 'Procurement Days',
      dataIndex: 'procurementDays',
      width: 150,
      sorter: (a, b) => a.procurementDays - b.procurementDays,
    },
    { title: 'Bundle SKUs', dataIndex: 'bundleSKUs', width: 120, sorter: (a, b) => a.bundleSKUs - b.bundleSKUs },
    {
      title: 'Is Bundle',
      dataIndex: 'isBundle',
      width: 120,
      filters: [
        { text: 'True', value: true },
        { text: 'False', value: false },
      ],
      onFilter: (value, record) => record.isBundle === value,
      render: (value) => (value ? 'Yes' : 'No'),
    },
  ];

  const handleSubmit = (values) => {
    console.log('Form Submitted:', values);
  };

  return (
    <>
      {/* Ant Design Form */}
      <Card title="Account Level Setting In Inventory">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={[48, 16]}>
            {/* Left Column: Number Inputs */}
            <Col xs={24} md={8}>
              <Form.Item name="procurementDays" label="Procurement Days (Days for PO to shelf)">
                <Input type="number" addonAfter="days" />
              </Form.Item>
              <Form.Item name="idealDays" label="Ideal Days in Hand">
                <Input type="number" addonAfter="days" />
              </Form.Item>
              <Form.Item name="dioSalesCycle" label="DIO Sales cycle assumption (last)">
                <Input type="number" addonAfter="days" />
              </Form.Item>
              <Form.Item name="poPlanningInterval" label="PO Planning Interval">
                <Input type="number" addonAfter="days" />
              </Form.Item>
            </Col>

            {/* Middle Column: Switches (Left side) */}
            <Col xs={24} md={8}>
              <Form.Item name="dioSellingPrice" label="DIO Selling Price" valuePropName="checked" labelAlign="left">
                <Switch />
              </Form.Item>
              <Form.Item name="dioStockCost" label="DIO Stock cost" valuePropName="checked" labelAlign="left">
                <Switch />
              </Form.Item>
            </Col>

            {/* Right Column: Switches (Right side) */}
            <Col xs={24} md={8}>
              <Form.Item
                name="ajioWorkingInbound"
                label="Ajio Working Inbound"
                valuePropName="checked"
                labelAlign="left"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="ajioReservedQuantity"
                label="Ajio Reserved Quantity"
                valuePropName="checked"
                labelAlign="left"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="ajioShippedInbound"
                label="Ajio Shipped Inbound"
                valuePropName="checked"
                labelAlign="left"
              >
                <Switch />
              </Form.Item>
              <Form.Item name="flipkartInbound" label="Flipkart Inbound" valuePropName="checked" labelAlign="left">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          {/* Submit button centered */}
          <div className="flex justify-center mt-6">
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </div>
        </Form>
      </Card>

      {/* Inventory Table */}
      <Table
        columns={columns}
        dataSource={tableData}
        size="small"
        pagination={false}
        scroll={{ x: 1000, y: 500 }}
        className="mt-4"
      />
    </>
  );
}
