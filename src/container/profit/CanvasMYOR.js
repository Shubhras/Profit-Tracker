import React, { useState } from 'react';
import { Modal, Input, Radio, Tabs, Select, Button, Dropdown, Tooltip } from 'antd';
import {
  SettingOutlined,
  PieChartOutlined,
  LineChartOutlined,
  BarChartOutlined,
  TableOutlined,
  ShopOutlined,
  DownOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
// import { PageHeader } from '../../components/page-headers/page-headers';

export default function CanvasMYOR() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [attribute, setAttribute] = useState(null);
  const [value, setValue] = useState(null);
  const [selectedChart, setSelectedChart] = useState('pie');

  const [openDate, setOpenDate] = useState(false);

  const [tempRange, setTempRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
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
  const [finalRange, setFinalRange] = useState(null);
  const attributeOptions = [
    { label: 'Account', value: 'account' },
    { label: 'Channel', value: 'channel' },
    { label: 'Day', value: 'day' },
  ];

  const valueOptions = [
    { label: 'Gross Qty', value: 'gross' },
    { label: 'Gross Sales', value: 'sales' },
    { label: 'Return Qty', value: 'return' },
  ];

  const handleNext = () => {
    if (activeTab === '1' && (!attribute || !value)) return;

    const nextTab = String(Number(activeTab) + 1);
    setActiveTab(nextTab);
  };

  const handlePrevious = () => {
    const prevTab = String(Number(activeTab) - 1);
    setActiveTab(prevTab);
  };

  const handleReset = () => {
    setAttribute(null);
    setValue(null);
  };
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
  const pieData = [
    { name: 'Profit', value: 400 },
    { name: 'Loss', value: 200 },
    { name: 'Charges', value: 300 },
    { name: 'Ads', value: 100 },
  ];

  const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b'];
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
      <Modal open={open} onCancel={() => setOpen(false)} footer={null} width={900}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <span className="font-medium text-black">Create Report:</span>
            <Input placeholder="Report Name" className="w-[250px] h-[14px]" />
          </div>

          {/* <Button onClick={() => setOpen(false)}>Cancel</Button> */}
        </div>

        <hr className="mb-4" />

        <div className="p-2">
          {/* <span className="mr-3 font-semibold">Report Type:</span> */}
          <div className="mb-4 p-2">
            <span className="mr-3 font-normal text-black">Report Type:</span>

            <div className="inline-flex gap-2">
              <Button
                onClick={() => setSelectedChart('pie')}
                className={`flex items-center justify-center w-10 h-10 
    ${selectedChart === 'pie' ? 'bg-green-100 border-green-500' : ''}`}
              >
                <PieChartOutlined
                  style={{
                    color: selectedChart === 'pie' ? '#16a34a' : '#fa8c16',
                    fontSize: '18px',
                  }}
                />
              </Button>

              <Button
                onClick={() => setSelectedChart('line')}
                className={`flex items-center justify-center w-10 h-10 
    ${selectedChart === 'line' ? 'bg-green-100 border-green-500' : ''}`}
              >
                <LineChartOutlined
                  style={{
                    color: selectedChart === 'line' ? '#16a34a' : '#1677ff',
                    fontSize: '18px',
                  }}
                />
              </Button>

              <Button
                onClick={() => setSelectedChart('bar')}
                className={`flex items-center justify-center w-10 h-10 
    ${selectedChart === 'bar' ? 'bg-green-100 border-green-500' : ''}`}
              >
                <BarChartOutlined
                  style={{
                    color: selectedChart === 'bar' ? '#16a34a' : '#722ed1',
                    fontSize: '18px',
                  }}
                />
              </Button>

              <Button
                onClick={() => setSelectedChart('table')}
                className={`flex items-center justify-center w-10 h-10 
    ${selectedChart === 'table' ? 'bg-green-100 border-green-500' : ''}`}
              >
                <TableOutlined
                  style={{
                    color: selectedChart === 'table' ? '#16a34a' : '#52c41a',
                    fontSize: '18px',
                  }}
                />
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-4 p-2">
          <span className="mr-3 font-normal p-2 text-black">Module Type:</span>
          <Radio.Group defaultValue="profit">
            <Radio value="profit">Profit & Payments</Radio>
            <Radio value="leaks">Leaks</Radio>
          </Radio.Group>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          items={[
            { key: '1', label: 'Chart' },
            { key: '2', label: 'Date & Marketplace' },
            { key: '3', label: 'Hidden Filter' },
            { key: '4', label: 'Visible Filter' },
          ]}
        />

        {/* FORM */}
        <div className="mt-4">
          {/* ================= TAB 1: CHART ================= */}
          {activeTab === '1' && (
            <div className="flex flex-col gap-3">
              <div>
                <span className="block mb-1 text-black">Attribute:</span>
                <Select
                  className="w-full"
                  placeholder="Select Attribute"
                  options={attributeOptions}
                  value={attribute}
                  onChange={(val) => setAttribute(val)}
                />
              </div>

              <div>
                <span className="block mb-1 text-black">Value:</span>
                <Select
                  className="w-full"
                  placeholder="Select Value"
                  options={valueOptions}
                  value={value}
                  onChange={(val) => setValue(val)}
                />
              </div>
            </div>
          )}
          {/* ================= TAB 2: DATE & MARKETPLACE ================= */}
          {activeTab === '2' && (
            <div className="flex justify-between items-start mt-6">
              {/* LEFT */}
              <div>
                <div className="border rounded-md text-black px-4 py-2 text-sm flex items-center gap-2 bg-gray-50">
                  <ShopOutlined />
                  Marketplaces: 6 selected
                </div>
              </div>
              {/* RIGHT */}
              <div>
                <p className="text-sm mb-1 text-black">Date Range:</p>
                <div className="relative">
                  {/* BUTTON */}
                  <button
                    type="button"
                    onClick={() => setOpenDate(!openDate)}
                    className="border rounded-md px-4 py-2 gap-2 text-sm bg-gray-50 text-black flex items-center justify-between min-w-[220px] cursor-pointer w-full text-left"
                  >
                    <span>
                      {finalRange
                        ? `${finalRange.startDate.toLocaleDateString(
                            'en-GB',
                          )} to ${finalRange.endDate.toLocaleDateString('en-GB')}`
                        : 'Select Date'}
                    </span>

                    <DownOutlined />
                  </button>

                  {openDate && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 40,
                        right: 0,
                        zIndex: 1000,
                        background: '#fff',
                        borderRadius: 8,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        display: 'flex',
                      }}
                    >
                      {/* LEFT PRESETS */}
                      <div
                        style={{
                          width: 180,
                          borderRight: '1px solid #f0f0f0',
                          padding: 10,
                          display: 'flex',
                          flexDirection: 'column',
                          height: 300,
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          {['Today', 'Yesterday', 'This Week', 'Last Week', 'This Month'].map((item) => (
                            <button
                              key={item}
                              type="button"
                              className="px-2 py-2 w-full text-left rounded-md text-[13px] hover:bg-gray-100"
                            >
                              {item}
                            </button>
                          ))}
                        </div>

                        <div style={{ display: 'flex', gap: 6 }}>
                          <Button
                            type="primary"
                            onClick={() => {
                              setFinalRange(tempRange[0]);
                              setOpenDate(false);
                            }}
                          >
                            Submit
                          </Button>

                          <Button onClick={() => setOpenDate(false)}>Cancel</Button>
                        </div>
                      </div>

                      {/* CALENDAR */}
                      <DateRange
                        ranges={tempRange}
                        onChange={(item) => setTempRange([item.selection])}
                        months={2}
                        direction="horizontal"
                        maxDate={new Date()}
                        rangeColors={['#22c55e']}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === '3' && (
            <div className="mt-6">
              {/* TAGS */}
              <div className="flex flex-wrap gap-2 mb-6 text-black">
                {[
                  'GST: Include GST',
                  'Expense: Include Expense',
                  'Ads: Include Ads',
                  'Estimation: Include Estimation',
                ].map((item, i) => (
                  <div key={i} className="px-3 py-1 border rounded-md text-xs bg-gray-50">
                    {item}
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-3 mb-6">
                <Button type="primary" className="text-white px-4 py-1 rounded-md font-semibold">
                  Add Filter
                </Button>

                <Button type="primary" className="text-white px-4 py-1 rounded-md font-semibold">
                  Y Axis Filters
                </Button>
              </div>
            </div>
          )}

          {activeTab === '4' && (
            <div className="mt-0 p-3">
              <div className="flex gap-6 mb-6 text-sm">
                <label className="flex items-center gap-2 text-black">
                  <input type="checkbox" />
                  Date
                </label>

                <label className="flex items-center gap-2 text-black">
                  <input type="checkbox" />
                  Channel
                </label>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-3 mt-8">
            {activeTab === '1' && (
              <>
                <Button onClick={handleReset}>Reset</Button>

                <Button type="primary" disabled={!attribute} onClick={handleNext} className="font-semibold">
                  Next
                </Button>
              </>
            )}

            {(activeTab === '2' || activeTab === '3') && (
              <>
                <Button onClick={handlePrevious}>Previous</Button>

                <Button type="primary" onClick={handleNext} className="font-semibold">
                  Next
                </Button>
              </>
            )}

            {activeTab === '4' && (
              <>
                <Button onClick={handlePrevious}>Previous</Button>
                <Button type="primary" className="font-semibold">
                  Save
                </Button>
                <Button>Cancel</Button>
              </>
            )}
          </div>
        </div>
        <div className="mt-6 border rounded-lg p-4 bg-gray-50">
          <p className="font-bold mb-2">Report Name - No real data displayed</p>
          <div className="flex items-center justify-center gap-10 h-[220px]">
            {/* PIE CHART */}
            <div className="w-[200px] h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* SIDE LEGEND */}
            <div className="space-y-2 text-sm">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-gray-700">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
