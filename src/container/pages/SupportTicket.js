import React, { lazy, Suspense } from 'react';
import { Row, Col, Skeleton } from 'antd';

const SupportTicketContent = lazy(() => import('../profile/settings/overview/SupportTicket'));

function SupportTicket() {
  return (
    <>
      <main className="min-h-[715px] lg:min-h-[580px] bg-transparent px-4 py-2 xl:px-[15px] pb-[50px] ssm:pb-[30px]">
        <Row gutter={25}>
          <Col xs={24}>
            <Suspense
              fallback={
                <div className="bg-white dark:bg-white10 p-[25px] rounded-[10px]">
                  <Skeleton paragraph={{ rows: 10 }} />
                </div>
              }
            >
              <SupportTicketContent />
            </Suspense>
          </Col>
        </Row>
      </main>
    </>
  );
}

export default SupportTicket;
