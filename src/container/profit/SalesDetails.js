import React, { useMemo, useState } from 'react';
import { Table, Card, Button } from 'antd';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/page-headers/page-headers';

export default function SalesDetails() {
  const { id } = useParams();
  const [showChart, setShowChart] = useState(true);

  const dates = Array.from({ length: 15 }, (_, i) => {
    const date = new Date(2026, 0, i + 1);
    return date.toISOString().split('T')[0];
  });

  const dataSource = ['Product A', 'Product B', 'Product C'].map((product, idx) => {
    const row = {
      key: idx,
      id: product,
    };

    dates.forEach((date) => {
      row[date] = Math.floor(Math.random() * 100);
    });

    return row;
  });
  const graphData = useMemo(() => {
    if (!dataSource.length) return [];

    return dates.map((date) => {
      let total = 0;

      dataSource.forEach((row) => {
        total += row[date] || 0;
      });

      return {
        date,
        value: total,
      };
    });
  }, [dataSource, dates]);

  const dynamicColumns = dates.map((date) => ({
    title: new Date(date)
      .toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
      })
      .replace(',', ''),
    dataIndex: date,
    key: date,
    align: 'center',
    sorter: (a, b) => (a[date] || 0) - (b[date] || 0),
  }));

  const columns = [
    {
      title: 'Product',
      dataIndex: 'id',
      fixed: 'left',
      width: 150,
    },
    ...dynamicColumns,
  ];

  return (
    <>
      <PageHeader
        title={`Sales Details - ${id}`}
        className="flex justify-between items-center px-8 pt-2 pb-3 bg-transparent"
      />

      <main className="px-8 pb-[30px]">
        <Card bordered={false}>
          <div className="flex justify-end mb-3">
            <Button
              // type="button"
              onClick={() => setShowChart(!showChart)}
              // className="border border-gray-300 rounded-lg px-3 py-1.5 bg-white hover:bg-gray-100 transition"
            >
              {showChart ? 'Hide Chart' : 'View Chart'}
            </Button>
          </div>

          {showChart && (
            <Card className="mb-5 bg-gray-100 rounded-xl">
              <div style={{ marginBottom: 10, fontWeight: 500 }}>Chart View - Total Sales</div>

              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={graphData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />

                  <XAxis
                    dataKey="date"
                    tickFormatter={(val) =>
                      new Date(val).toLocaleDateString('en-US', {
                        month: 'short',
                        day: '2-digit',
                      })
                    }
                  />

                  <YAxis />

                  <Tooltip
                    labelFormatter={(val) =>
                      new Date(val).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: '2-digit',
                      })
                    }
                  />

                  <Line type="monotone" dataKey="value" stroke="#1677ff" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={{
              pageSize: 5,
              showSizeChanger: true,
            }}
            scroll={{ x: 'max-content' }}
            size="small"
          />
        </Card>
      </main>
    </>
  );
}
