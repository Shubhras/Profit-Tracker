import React from 'react';
import { Row, Col } from 'antd';
import OverviewCard from '../../../../components/cards/OverviewCardTwo';

import OverviewData from '../../../../demoData/overviewData.json';

const OverviewDataList = React.memo(() => {
  // const OverviewDataSorted = OverviewData.slice(Math.max(OverviewData.length - 1, 1));
  const OverviewDataSorted = OverviewData.slice(8);

  return (
    <div>
      <Row gutter={25}>
        {OverviewDataSorted.map((item, i) => {
          return (
            <Col xxl={8} sm={12} xs={24} key={i} className="mb-[25px]">
              <OverviewCard data={item} contentFirst halfCircleIcon />
            </Col>
          );
        })}
      </Row>
    </div>
  );
});

export default OverviewDataList;
