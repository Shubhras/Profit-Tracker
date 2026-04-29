import React, { useState } from 'react';
import { Button, Dropdown } from 'antd';
import { UploadOutlined, DownOutlined, PlusOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons';

function HeaderButton({ type, onClick, isEnabled }) {
  const [selected, setSelected] = useState('MP Date');
  const [checked, setChecked] = useState(false);
  const [orderType, setOrderType] = useState('Order Date');

  const items = selected === 'MP Date' ? [{ key: 'ledger', label: 'Ledger Date' }] : [{ key: 'mp', label: 'MP Date' }];

  const handleMenuClick = ({ key }) => {
    if (key === 'ledger') {
      setSelected('Ledger Date');
    } else if (key === 'mp') {
      setSelected('MP Date');
    }
  };
  switch (type) {
    case 'export':
      return (
        <Button
          type="primary"
          onClick={onClick}
          className="rounded-lg shadow-sm flex items-center gap-1 font-bold px-2 py-1"
        >
          Export
          <UploadOutlined style={{ color: '#fff', fontSize: '16px' }} />
        </Button>
      );
    case 'lowest':
      return (
        <Button type="primary" className="rounded-lg shadow-sm flex items-center gap-1 font-bold px-2 py-1">
          Lowet Level Profit Export
          <UploadOutlined style={{ color: '#fff', fontSize: '16px' }} />
        </Button>
      );

    case 'sku':
      return (
        <Button type="primary" className="rounded-lg shadow-sm flex items-center gap-1 font-bold px-2 py-1">
          SKU
          <UploadOutlined style={{ color: '#fff', fontSize: '16px' }} />
        </Button>
      );

    case 'payment':
      return (
        <Button type="primary" className="rounded-lg shadow-sm flex items-center gap-1 font-bold px-2 py-1">
          Outstanding Payment Export
          <UploadOutlined style={{ color: '#fff', fontSize: '16px' }} />
        </Button>
      );
    case 'cashback':
      return (
        <Button type="primary" className="rounded-lg shadow-sm flex items-center gap-1 font-bold px-2 py-1">
          Cashback Export
          <UploadOutlined style={{ color: '#fff', fontSize: '16px' }} />
        </Button>
      );
    case 'upload':
      return (
        <Button
          type="primary"
          onClick={onClick}
          className="rounded-lg shadow-sm flex items-center gap-1 font-bold px-2 py-1"
        >
          Upload
          <UploadOutlined style={{ color: '#fff', fontSize: '16px' }} />
        </Button>
      );

    case 'oneline':
      return (
        <Button type="primary" className="rounded-lg shadow-sm flex items-center gap-1 font-bold px-2 py-1">
          OneLine Invoice
          <UploadOutlined style={{ color: '#fff', fontSize: '16px' }} />
        </Button>
      );
    case 'dateType':
      return (
        <Dropdown menu={{ items, onClick: handleMenuClick }} trigger={['click']}>
          <Button className="rounded-lg flex items-center gap-2 font-semibold px-2 py-1">
            {selected}
            <DownOutlined />
          </Button>
        </Dropdown>
      );

    case 'sellerflex':
      return (
        <Button
          type="primary"
          onClick={onClick}
          className="rounded-lg shadow-sm flex items-center gap-1 font-bold px-2 py-1"
        >
          SellerFlex
          <UploadOutlined style={{ color: '#fff', fontSize: '16px' }} />
        </Button>
      );

    case 'inyourhand':
      return (
        <Button
          type="primary"
          onClick={onClick}
          className="rounded-lg shadow-sm flex items-center gap-1 font-bold px-2 py-1"
        >
          In your Hand
          <UploadOutlined style={{ color: '#fff', fontSize: '16px' }} />
        </Button>
      );

    case 'resolved':
      return (
        <Button
          type="primary"
          onClick={onClick}
          className="rounded-lg shadow-sm flex items-center gap-1 font-bold px-2 py-1"
        >
          Resolved/Claimed
          <UploadOutlined style={{ color: '#fff', fontSize: '16px' }} />
        </Button>
      );

    case 'stdcost':
      return (
        <Button
          type="primary"
          onClick={onClick}
          className="rounded-lg shadow-sm flex items-center gap-1 font-bold px-2 py-1"
        >
          STD Cost Date Wise Upload
          <UploadOutlined style={{ color: '#fff', fontSize: '16px' }} />
        </Button>
      );

    case 'addexpense':
      return (
        <Button
          type="primary"
          onClick={onClick}
          className="rounded-lg shadow-sm flex items-center gap-1 font-bold px-2 py-1"
        >
          Add Expense
          <PlusOutlined style={{ color: '#fff', fontSize: '16px' }} />
        </Button>
      );

    case 'add':
      return (
        <Button
          type="primary"
          onClick={onClick}
          className="rounded-lg shadow-sm flex items-center gap-1 font-bold px-2 py-1"
        >
          Add
          <PlusOutlined style={{ color: '#fff', fontSize: '16px' }} />
        </Button>
      );

    case 'addrules':
      return (
        <Button
          type="primary"
          onClick={onClick}
          className="rounded-lg shadow-sm flex items-center gap-1 font-bold px-2 py-1"
        >
          Add Rules
          <PlusOutlined style={{ color: '#fff', fontSize: '16px' }} />
        </Button>
      );

    case 'sync':
      return (
        <Button
          type="primary"
          onClick={onClick}
          className="rounded-lg shadow-sm flex items-center gap-1 font-bold px-2 py-1"
        >
          Sync
          <ReloadOutlined style={{ color: '#fff', fontSize: '16px' }} />
        </Button>
      );

    case 'recalculate':
      return (
        <Button
          type="primary"
          onClick={onClick}
          className="rounded-lg shadow-sm flex items-center gap-1 font-bold px-2 py-1"
        >
          Recalculate Expense
          <ReloadOutlined style={{ color: '#fff', fontSize: '16px' }} />
        </Button>
      );
    case 'delete':
      return (
        <Button
          type={isEnabled ? 'primary' : 'default'}
          disabled={!isEnabled}
          onClick={onClick}
          className={`rounded-lg shadow-sm flex items-center gap-1 font-bold px-2 py-1 
        ${!isEnabled ? 'bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed' : ''}
      `}
        >
          Delete
          <DeleteOutlined
            style={{
              fontSize: '16px',
              color: isEnabled ? '#fff' : '#9ca3af', // grey icon when disabled
            }}
          />
        </Button>
      );

    case 'orderprofit':
      return (
        <Button
          onClick={onClick}
          className="rounded-lg shadow-sm flex items-center gap-1 font-bold px-2 py-1 
                 bg-blue-50 text-blue-500 border-none 
                 hover:bg-blue-100 hover:text-blue-500"
        >
          Orders Profit
        </Button>
      );
    case 'delayeddays':
      return (
        <Button
          onClick={onClick}
          className="flex items-center gap-2 px-3 py-1 rounded-md border border-gray-300 
                 bg-gray-50 text-gray-700 text-sm font-medium 
                 hover:bg-gray-100"
        >
          {/* CHECKBOX */}
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => {
              e.stopPropagation();
              setChecked(e.target.checked);
            }}
          />

          <span>Delayed Payment Days</span>

          {/* VALUE */}
          <span className="font-semibold">30</span>
        </Button>
      );
    case 'orderDate': {
      const orderDateItems = [
        { key: 'order', label: 'Order Date' },
        { key: 'delivery', label: 'Delivery Date' },
        { key: 'returnDelivery', label: 'Return Delivery' },
      ];

      const handleOrderDateClick = ({ key }) => {
        if (key === 'order') setOrderType('Order Date');
        if (key === 'delivery') setOrderType('Delivery Date');
        if (key === 'returnDelivery') setOrderType('Return Delivery');
      };

      return (
        <Dropdown menu={{ items: orderDateItems, onClick: handleOrderDateClick }} trigger={['click']}>
          <Button className="rounded-lg flex items-center gap-2 font-semibold px-2 py-1">
            {orderType}
            <DownOutlined />
          </Button>
        </Dropdown>
      );
    }
    default:
      return null;
  }
}

export default HeaderButton;
