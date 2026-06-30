import React from 'react';
import { Card, Row, Col, Button, Tag, Avatar, Empty } from 'antd';

import {
  PlusOutlined,
  MessageOutlined,
  CalendarOutlined,
  ArrowRightOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons';

function SupportTicket() {
  return (
    <div className="min-h-screen bg-gray-50 p-0 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />

      <div className="bg-white shadow-sm p-3 mb-2 flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-gray-800 mb-0">Help & Support</h2>
          <p className="text-gray-500 mb-2">Manage and track all your support tickets.</p>
        </div>

        <Button type="primary" icon={<PlusOutlined />} className="rounded-lg p-2 px-2 font-semibold flex items-center">
          Create Ticket
        </Button>
      </div>
      {/* Statistics */}

      <Row gutter={[20, 20]} className="mb-2 p-2">
        <Col xs={24} sm={12} lg={6}>
          <div className="bg-white p-3 rounded-xl">
            <div className="text-gray-500">Open Tickets</div>
            <div className="text-[20px] font-bold mt-2">12</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="bg-white p-3 rounded-xl">
            <div className="text-gray-500">In Progress</div>
            <div className="text-[20px] font-bold mt-2 text-orange-500">4</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="bg-white p-3 rounded-xl">
            <div className="text-gray-500">Resolved</div>
            <div className="text-[20px] font-bold mt-2 text-green-600">25</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="bg-white p-3 rounded-xl">
            <div className="text-gray-500">Closed</div>
            <div className="text-[20px] font-bold mt-2 text-red-500">31</div>
          </div>
        </Col>
      </Row>

      {/* Ticket Cards */}

      <div className="space-y-4 p-2">
        {[1, 2, 3, 4].map((item) => (
          <Card key={item} hoverable className="rounded-2xl border-0 shadow-sm hover:shadow-lg transition-all">
            <div className="flex flex-col lg:flex-row lg:justify-between gap-5">
              {/* Left */}

              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-blue-600">#TK-100{item}</span>

                  <Tag color="red">High</Tag>

                  <Tag color="green">Open</Tag>
                </div>

                <h3 className="text-xl font-semibold mt-3">Payment issue while withdrawing earnings</h3>

                <p className="text-gray-500 mt-2">
                  Wallet balance is not updating after payout. Kindly resolve this issue as soon as possible.
                </p>

                <div className="flex flex-wrap gap-6 mt-5 text-gray-500">
                  <div className="flex items-center gap-2">
                    <CalendarOutlined />
                    30 Jun 2026
                  </div>

                  <div className="flex items-center gap-2">
                    <MessageOutlined />4 Replies
                  </div>

                  <div className="flex items-center gap-2">
                    <Avatar size="small" icon={<CustomerServiceOutlined />} />
                    Support Team
                  </div>
                </div>
              </div>

              {/* Right */}

              <div className="flex items-center">
                <Button type="primary" icon={<ArrowRightOutlined />}>
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty */}

      {false && (
        <Card className="rounded-xl mt-6">
          <Empty description="No Support Tickets Found" />
        </Card>
      )}
    </div>
  );
}

export default SupportTicket;
