import React, { useEffect } from 'react';
import { Table, Card } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { PageHeader } from '../../components/page-headers/page-headers';
import { getPivotStats } from '../../redux/dashboard/actionCreator';

export default function SalesTrend() {
  const dispatch = useDispatch();

  const { pivotData, loading } = useSelector((state) => state.dashboard);
  const payload = {
    fromDate: '2026-01-01T00:00:00Z',
    endDate: '2026-01-15T23:59:59Z',
    qty: 'grossqty',
    group_id: 'channel',
    calender_view: 'date',
  };
  useEffect(() => {
    dispatch(getPivotStats(payload));
  }, [dispatch]);

  const PageRoutes = [
    {
      path: 'index',
      breadcrumbName: 'Profit',
    },
    {
      path: '',
      breadcrumbName: 'Sales Trend',
    },
  ];
  const dynamicColumns = React.useMemo(() => {
    if (!pivotData?.results?.length) return [];

    const firstRow = pivotData.results[0];

    return Object.keys(firstRow)
      .filter((key) => key !== 'id')
      .map((key) => ({
        title: new Date(key)
          .toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
          })
          .replace(',', ''),
        dataIndex: key,
        key,
        align: 'center',
        sorter: (a, b) => (a[key] || 0) - (b[key] || 0),
      }));
  }, [pivotData]);
  const columns = [
    {
      title: '',
      dataIndex: 'id',
      fixed: 'left',
      width: 120,
    },
    ...dynamicColumns,
  ];
  const dataSource =
    pivotData?.results?.map((item, index) => ({
      key: index,
      ...item,
    })) || [];
  const getTotal = (key) => {
    return dataSource.reduce((sum, row) => sum + (row[key] || 0), 0);
  };

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Sales Trend"
        className="flex  justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      />
      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
        <Card bordered={false} className="sales-table-wrapper">
          <Table
            columns={columns}
            dataSource={dataSource}
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
            }}
            scroll={{ x: 'max-content' }}
            size="small"
            summary={() => (
              <Table.Summary.Row className="custom-total-row">
                <Table.Summary.Cell index={0} fixed="left">
                  Total
                </Table.Summary.Cell>

                {dynamicColumns.map((col, index) => (
                  <Table.Summary.Cell key={index} align="center">
                    {getTotal(col.dataIndex)}
                  </Table.Summary.Cell>
                ))}
              </Table.Summary.Row>
            )}
          />
        </Card>
      </main>
    </>
  );
}
