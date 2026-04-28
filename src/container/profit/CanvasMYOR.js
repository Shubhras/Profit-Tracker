import React, { useState } from 'react';
import { Button, Dropdown, Tooltip } from 'antd';
import { SettingOutlined, AppstoreOutlined, FileTextOutlined, EditOutlined, DownOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import CanvaModal from './component/CanvasModal';
// import { PageHeader } from '../../components/page-headers/page-headers';

export default function CanvasMYOR() {
  const [open, setOpen] = useState(false);

  const barData = [
    { name: 'Mon', value: 120 },
    { name: 'Tue', value: 200 },
    { name: 'Wed', value: 150 },
    { name: 'Thu', value: 278 },
    { name: 'Fri', value: 189 },
    { name: 'Sat', value: 239 },
    { name: 'Sun', value: 300 },
  ];
  const createMenu = [
    {
      key: '1',
      label: 'Dashboard',
      icon: <AppstoreOutlined />,
    },
    {
      key: '2',
      label: 'Reports',
      icon: <FileTextOutlined />,
    },
    {
      key: '3',
      label: 'Custom Field',
      icon: <EditOutlined />,
    },
  ];

  // const PageRoutes = [
  //   {
  //     path: 'index',
  //     breadcrumbName: 'Profit',
  //   },
  //   {
  //     path: '',
  //     breadcrumbName: 'Canvas MYOR',
  //   },
  // ];
  return (
    <>
      {/* <PageHeader
        routes={PageRoutes}
        title=""
        className="flex  justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      /> */}
      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-5 mt-5 xl:px-[15px] pb-[30px] bg-transparent">
        <div className="flex justify-between items-center mb-4">
          <Tooltip title="Explore">
            <Button className="border border-green-500 text-green-500 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-green-50">
              Explore
            </Button>
          </Tooltip>
          <div className="flex items-center gap-3">
            <Tooltip title="Set default Dashboard">
              <Button className="!flex !items-center !justify-center w-9 h-9 border rounded-md hover:bg-gray-100 p-0">
                <SettingOutlined style={{ fontSize: '16px' }} />
              </Button>
            </Tooltip>

            <Dropdown
              menu={{
                items: createMenu,
                onClick: ({ key }) => {
                  if (key === '2') {
                    setOpen(true);
                  }
                },
              }}
              trigger={['click']}
            >
              <Button type="primary" className="flex items-center gap-1 px-4 py-1.5 rounded-md text-sm font-semibold">
                Create New
                <DownOutlined />
              </Button>
            </Dropdown>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6 flex gap-10 items-start">
          <div className="w-[320px] shrink-0">
            <h2 className="text-lg font-bold mb-3">Beyond the Obvious</h2>

            <h3 className="text-lg mb-2 font-bold">Create Your Instant Custom Dashboard!</h3>

            <p className="text-gray-500 text-sm mb-4">Create Your Instant Custom Dashboard!</p>

            <div className="flex flex-col gap-3 items-start">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="!flex !items-center !justify-center !text-white px-6 h-8 rounded-md font-medium border-0"
                style={{ background: 'linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(15, 118, 110) 100%)' }}
              >
                Create Report
              </button>

              <button
                type="button"
                className="!flex !items-center !justify-center bg-gray-400 text-white px-6 h-8 rounded-md font-medium border-0"
              >
                Create Dashboard
              </button>
            </div>

            <p className="text-orange-500 text-xs mt-3">Create at least one item before creating a dashboard</p>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-6">
            <div className="border rounded-lg h-[220px] bg-gray-50 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="border rounded-lg h-[220px] bg-gray-50 flex items-center px-3">
              <p className="text-lg font-semibold leading-7">
                You can now create <span className="text-blue-600">fully customisable Reports and widgets</span> with
                your own Key Performance Indicators!
              </p>
            </div>
          </div>
        </div>
      </main>
      <CanvaModal open={open} onCancel={() => setOpen(false)} />
    </>
  );
}
