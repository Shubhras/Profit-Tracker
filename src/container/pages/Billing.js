import React, { lazy, Suspense } from 'react';
import { Row, Col, Skeleton } from 'antd';
import { PageHeader } from '../../components/page-headers/page-headers';

const BillingContent = lazy(() => import('../profile/settings/overview/Billing'));

function BillingPage() {
  const PageRoutes = [
    {
      path: '/admin',
      breadcrumbName: 'Dashboard',
    },
    {
      path: '',
      breadcrumbName: 'Billing',
    },
  ];

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Billing & Subscription"
        className="flex justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      />

      <main className="min-h-[715px] lg:min-h-[580px] bg-transparent px-8 xl:px-[15px] pb-[50px] ssm:pb-[30px]">
        <Row gutter={25}>
          <Col xs={24}>
            <Suspense
              fallback={
                <div className="bg-white dark:bg-white10 p-[25px] rounded-[10px]">
                  <Skeleton paragraph={{ rows: 10 }} />
                </div>
              }
            >
              <BillingContent />
            </Suspense>
          </Col>
        </Row>
      </main>
    </>
  );
}

export default BillingPage;
