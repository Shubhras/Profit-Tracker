import React from 'react';
import { Row, Col, Card, Form, Input, Button } from 'antd';
import { PageHeader } from '../../components/page-headers/page-headers';

export default function AccountSettings() {
  const PageRoutes = [
    { path: 'index', breadcrumbName: 'Settings' },
    { path: '', breadcrumbName: 'User Settings' },
    { path: '', breadcrumbName: 'Account Settings' },
  ];

  const onUserInfoSave = (values) => {
    console.log('User Info:', values);
  };

  const onCompanyInfoSave = (values) => {
    console.log('Company Info:', values);
  };

  const onPasswordChange = (values) => {
    console.log('Password Change:', values);
  };

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Account Settings"
        className="flex justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 bg-transparent"
      />

      <main className="min-h-[715px] flex-1 px-8 xl:px-[15px] pb-[30px]">
        <Row gutter={[24, 24]}>
          {/* USER INFO */}
          <Col xs={24} lg={12}>
            <Card title="User Info" className="rounded-[10px]">
              <Form layout="vertical" onFinish={onUserInfoSave}>
                <Form.Item name="firstName" label="First Name" initialValue="Apro">
                  <Input />
                </Form.Item>

                <Form.Item name="lastName" label="Last Name" initialValue="store">
                  <Input />
                </Form.Item>

                <Form.Item name="email" label="Email" initialValue="">
                  <Input />
                </Form.Item>

                <Form.Item name="mobile" label="Mobile Number" initialValue="">
                  <Input />
                </Form.Item>

                <Button type="primary" htmlType="submit" block>
                  SAVE CHANGES
                </Button>
              </Form>
            </Card>
          </Col>

          {/* COMPANY INFO */}
          <Col xs={24} lg={12}>
            <Card title="Company Info" className="rounded-[10px]">
              <Form layout="vertical" onFinish={onCompanyInfoSave}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="gst" label="GST Number" initialValue="">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="companyName" label="Company Name" initialValue="">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="address" label="Street Address" initialValue="">
                  <Input />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="city" label="City" initialValue="">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="state" label="State" initialValue="">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="country" label="Country" initialValue="">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="pincode" label="Pincode" initialValue="">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>

                <Button type="primary" htmlType="submit" block>
                  SAVE CHANGES
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>

        {/* CHANGE PASSWORD */}
        <Row className="mt-6">
          <Col span={24}>
            <Card title="Change Password" className="rounded-[10px]">
              <Form layout="vertical" onFinish={onPasswordChange}>
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item name="oldPassword" label="Old Password">
                      <Input.Password />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item name="newPassword" label="New Password">
                      <Input.Password />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item name="confirmPassword" label="Retype New Password">
                      <Input.Password />
                    </Form.Item>
                  </Col>
                </Row>

                <Button type="primary" htmlType="submit">
                  SAVE CHANGES
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>
      </main>
    </>
  );
}
