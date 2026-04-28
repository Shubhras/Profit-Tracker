import React, { useState } from 'react';
import { Modal, Input, Radio, Tabs, Select, Button } from 'antd';
import {
  PieChartOutlined,
  LineChartOutlined,
  BarChartOutlined,
  TableOutlined,
  ShopOutlined,
  DownOutlined,
  CloseOutlined,
  AppstoreOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { DateRange } from 'react-date-range';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';

function CanvaModal({ open, onCancel }) {
  const [activeTab, setActiveTab] = useState('1');
  const [attribute, setAttribute] = useState(null);
  const [value, setValue] = useState(null);
  const [selectedChart, setSelectedChart] = useState('pie');
  const [openDate, setOpenDate] = useState(false);
  const [openFilterModal, setOpenFilterModal] = useState(false);
  const [completedTabs, setCompletedTabs] = useState([]);
  const marketplaceOptions = ['Amazon-India', 'Flipkart', 'Jiomart', 'Meesho', 'Myntra', 'Snapdeal'];

  const [selectedMarkets, setSelectedMarkets] = useState(marketplaceOptions);
  const [openYAxisModal, setOpenYAxisModal] = useState(false);
  const [openMarket, setOpenMarket] = useState(false);
  const [reportName, setReportName] = useState('');
  const [visibleOptions, setVisibleOptions] = useState({
    date: false,
    channel: false,
  });
  const toggleMarket = (item) => {
    if (selectedMarkets.includes(item)) {
      setSelectedMarkets(selectedMarkets.filter((i) => i !== item));
    } else {
      setSelectedMarkets([...selectedMarkets, item]);
    }
  };

  const handleSelectAll = () => {
    if (selectedMarkets.length === marketplaceOptions.length) {
      setSelectedMarkets([]);
    } else {
      setSelectedMarkets(marketplaceOptions);
    }
  };

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  const [tempRange, setTempRange] = useState([
    {
      startDate: firstDay,
      endDate: today,
      key: 'selection',
    },
  ]);
  const [selectedFilters, setSelectedFilters] = useState({
    gst: true,
    expense: true,
    ads: true,
    estimation: true,
  });
  const toggleFilter = (key) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  const removeFilter = (key) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [key]: false,
    }));
  };

  const [finalRange, setFinalRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
  });

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

  const pieData = [
    { name: 'Profit', value: 400 },
    { name: 'Loss', value: 200 },
    { name: 'Charges', value: 300 },
    { name: 'Ads', value: 100 },
  ];

  const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b'];

  const handleNext = () => {
    if (activeTab === '1' && !attribute) return;

    setCompletedTabs((prev) => [...new Set([...prev, activeTab])]);

    setActiveTab(String(Number(activeTab) + 1));
  };
  const handlePrevious = () => {
    setActiveTab(String(Number(activeTab) - 1));
  };

  const handleReset = () => {
    setAttribute(null);
    setValue(null);
    setCompletedTabs([]);
  };
  const chartData = [
    { name: 'Jan', A: 30, B: 20, C: 15 },
    { name: 'Feb', A: 40, B: 28, C: 12 },
    { name: 'Mar', A: 35, B: 32, C: 20 },
  ];
  const handlePreset = (type) => {
    // const today = new Date();
    let start;
    let end;

    switch (type) {
      case 'today':
        start = today;
        end = today;
        break;
      case 'yesterday':
        start = new Date(today.setDate(today.getDate() - 1));
        end = start;
        break;
      case 'thisWeek':
        start = new Date();
        start.setDate(today.getDate() - today.getDay());
        end = new Date();
        break;
      case 'lastWeek':
        start = new Date();
        start.setDate(today.getDate() - today.getDay() - 7);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date();
        break;
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      default:
        return;
    }

    setTempRange([
      {
        startDate: start,
        endDate: end,
        key: 'selection',
      },
    ]);
  };
  const cardDataOptions = [
    { label: 'Gross Qty', value: 'gross' },
    { label: 'Return Qty', value: 'return' },
    { label: 'Net Qty', value: 'net' },
  ];
  return (
    <>
      <Modal open={open} onCancel={onCancel} footer={null} width={900}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <span className="font-medium text-black">Create Report:</span>
            <Input
              placeholder="Report Name"
              className="w-[250px] h-[14px]"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
            />
          </div>
        </div>

        <hr className="mb-4" />

        <div className="mb-4 p-2">
          <span className="mr-3 text-black">Report Type:</span>
          <div className="inline-flex gap-2">
            {[
              { key: 'pie', icon: <PieChartOutlined />, color: '#fa8c16' },
              { key: 'line', icon: <LineChartOutlined />, color: '#1677ff' },
              { key: 'bar', icon: <BarChartOutlined />, color: '#722ed1' },
              { key: 'grouped', icon: <BarChartOutlined />, color: '#13c2c2' },
              { key: 'table', icon: <TableOutlined />, color: '#52c41a' },
              { key: 'card', icon: <AppstoreOutlined />, color: '#10b981' },
            ].map((item) => (
              <Button
                key={item.key}
                onClick={() => setSelectedChart(item.key)}
                className={`w-10 h-10 flex items-center justify-center border rounded-md 
          ${selectedChart === item.key ? 'bg-green-100 border-green-500' : 'bg-white'}`}
              >
                {React.cloneElement(item.icon, {
                  style: {
                    fontSize: '18px',
                    color: selectedChart === item.key ? '#16a34a' : item.color,
                  },
                })}
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-4 p-2">
          <span className="mr-3 text-black">Module Type:</span>
          <Radio.Group defaultValue="profit">
            <Radio value="profit">Profit & Payments</Radio>
            <Radio value="leaks">Leaks</Radio>
          </Radio.Group>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          items={[
            {
              key: '1',
              label: (
                <span className="flex items-center gap-1">
                  {completedTabs.includes('1') && <CheckOutlined style={{ color: 'green' }} />}
                  Chart
                </span>
              ),
            },
            {
              key: '2',
              label: (
                <span className="flex items-center gap-1">
                  {completedTabs.includes('2') && <CheckOutlined style={{ color: 'green' }} />}
                  Date & Marketplace
                </span>
              ),
            },
            {
              key: '3',
              label: (
                <span className="flex items-center gap-1">
                  {completedTabs.includes('3') && <CheckOutlined style={{ color: 'green' }} />}
                  Hidden Filter
                </span>
              ),
            },
            {
              key: '4',
              label: (
                <span className="flex items-center gap-1">
                  {completedTabs.includes('4') && <CheckOutlined style={{ color: 'green' }} />}
                  Visible Filter
                </span>
              ),
            },
          ]}
        />

        <div className="mt-4">
          {activeTab === '1' && (
            <div className="flex flex-col gap-3">
              {selectedChart === 'pie' && (
                <>
                  <div className="flex items-center gap-3">
                    <span className="text-black w-[100px]">Attribute:</span>
                    <Select
                      className="flex-1"
                      placeholder="Select Attribute"
                      options={attributeOptions}
                      value={attribute}
                      onChange={setAttribute}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-black w-[100px]">Value:</span>
                    <Select
                      className="flex-1"
                      placeholder="Select Value"
                      options={valueOptions}
                      value={value}
                      onChange={setValue}
                    />
                  </div>
                </>
              )}
              {selectedChart === 'table' && (
                <>
                  <div className="flex items-center gap-3">
                    <span className="text-black w-[100px]">Attribute:</span>
                    <Select
                      className="flex-1"
                      placeholder="Select Attribute"
                      options={attributeOptions}
                      value={attribute}
                      onChange={setAttribute}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-black w-[100px]">Value:</span>
                    <Select
                      className="flex-1"
                      placeholder="Select Value"
                      options={valueOptions}
                      value={value}
                      onChange={setValue}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-black w-[100px]">Group By:</span>
                    <Select className="flex-1" placeholder="Select Group By" options={attributeOptions} />
                  </div>
                </>
              )}

              {(selectedChart === 'line' || selectedChart === 'bar' || selectedChart === 'grouped') && (
                <>
                  <div className="flex items-center gap-3">
                    <span className="text-black w-[100px]">X Axis:</span>
                    <Select
                      className="flex-1"
                      placeholder="Select X Axis"
                      options={[
                        { label: 'Date', value: 'date' },
                        { label: 'Channel', value: 'channel' },
                        { label: 'Account', value: 'account' },
                      ]}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-black w-[100px]">Y Axis:</span>
                    <Select
                      className="flex-1"
                      placeholder="Select Y Axis"
                      options={[
                        { label: 'Gross Qty', value: 'grossqty' },
                        { label: 'MRP', value: 'mpfees' },
                        { label: 'Return Qty', value: 'returnqty' },
                      ]}
                    />
                  </div>
                </>
              )}
              {selectedChart === 'card' && (
                <div className="flex flex-col gap-4 mt-2">
                  {/* HEADER */}
                  <div className="grid grid-cols-3 gap-4 font-medium text-gray-600">
                    <span />
                    <span>Data</span>
                    <span>Label</span>
                  </div>

                  {/* ROWS */}
                  {['Data 1', 'Data 2', 'Data 3'].map((item, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 items-center">
                      {/* CHECKBOX */}
                      <div className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked />
                        <span>{item}</span>
                      </div>

                      <Select placeholder="Drop data here" options={cardDataOptions} />

                      <Input placeholder="Enter data label" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === '2' && (
            <div className="flex justify-between mt-4">
              <div className="relative">
                {/* BUTTON */}
                <button
                  type="button"
                  onClick={() => setOpenMarket(!openMarket)}
                  className="border p-2 bg-gray-50 flex items-center gap-2 cursor-pointer rounded-md text-black"
                >
                  <ShopOutlined />
                  Marketplaces: {selectedMarkets.length} selected
                  <DownOutlined />
                </button>

                {/* DROPDOWN */}
                {openMarket && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 45,
                      left: 0,
                      zIndex: 1000,
                      width: 260,
                      background: '#fff',
                      borderRadius: 10,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      padding: 12,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        checked={selectedMarkets.length === marketplaceOptions.length}
                        onChange={handleSelectAll}
                      />
                      <span>Select All</span>
                    </div>

                    {/* LIST */}
                    <div style={{ maxHeight: 150, overflowY: 'auto' }}>
                      {marketplaceOptions.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                          <input
                            type="checkbox"
                            checked={selectedMarkets.includes(item)}
                            onChange={() => toggleMarket(item)}
                          />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    {/* BUTTONS */}
                    <div className="flex justify-end gap-2 mt-3">
                      <Button size="small" onClick={() => setOpenMarket(false)}>
                        Cancel
                      </Button>

                      <Button size="small" type="primary" onClick={() => setOpenMarket(false)}>
                        Submit
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDate(!openDate)}
                  className="border px-4 py-2 bg-gray-50 flex items-center gap-2 text-black"
                >
                  {finalRange
                    ? `${finalRange.startDate.toLocaleDateString()} - ${finalRange.endDate.toLocaleDateString()}`
                    : 'Select Date'}
                  <DownOutlined />
                </button>

                {openDate && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 45,
                      right: 0,
                      zIndex: 1000,
                      background: '#fff',
                      borderRadius: 8,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      display: 'flex',
                    }}
                  >
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
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {[
                          { label: 'Today', type: 'today' },
                          { label: 'Yesterday', type: 'yesterday' },
                          { label: 'This Week', type: 'thisWeek' },
                          { label: 'Last Week', type: 'lastWeek' },
                          { label: 'This Month', type: 'thisMonth' },
                          { label: 'Last Month', type: 'lastMonth' },
                        ].map((item) => (
                          <button
                            key={item.type}
                            type="button"
                            onClick={() => handlePreset(item.type)}
                            className="px-2 py-3 w-full text-left rounded-md text-[13px] hover:bg-gray-100"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          gap: 6,
                          marginTop: 'auto',
                          paddingTop: 8,
                          borderTop: '1px solid #f0f0f0',
                        }}
                      >
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

                    <DateRange
                      ranges={tempRange}
                      onChange={(item) => setTempRange([item.selection])}
                      months={2}
                      direction="horizontal"
                      //   maxDate={new Date()}
                      rangeColors={['#22c55e']}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === '3' && (
            <div className="mt-6">
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

              <div className="flex justify-center gap-3">
                <Button
                  type="primary"
                  onClick={() => setOpenFilterModal(true)}
                  className="border-none px-4 py-1 rounded-md font-semibold"
                >
                  Add Filter
                </Button>

                <Button
                  type="primary"
                  className="border-none px-4 py-1 rounded-md font-semibold"
                  onClick={() => setOpenYAxisModal(true)}
                >
                  Y Axis Filters
                </Button>
              </div>
            </div>
          )}

          {activeTab === '4' && (
            <div className="mt-1 flex gap-4 p-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={visibleOptions.date}
                  onChange={() =>
                    setVisibleOptions((prev) => ({
                      ...prev,
                      date: !prev.date,
                    }))
                  }
                />
                Date
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={visibleOptions.channel}
                  onChange={() =>
                    setVisibleOptions((prev) => ({
                      ...prev,
                      channel: !prev.channel,
                    }))
                  }
                />
                Channel
              </label>
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
                <Button type="primary" onClick={() => setCompletedTabs((prev) => [...new Set([...prev, activeTab])])}>
                  Save
                </Button>
                <Button onClick={onCancel}>Cancel</Button>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 border p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            {/* LEFT: REPORT NAME */}
            <p className="text-sm font-semibold text-gray-600">{reportName || 'name'} - No real data displayed</p>

            {/* RIGHT: FILTER TAGS */}
            <div className="flex items-center gap-3">
              {/* DATE */}
              {visibleOptions?.date && finalRange && (
                <div className="px-3 py-1 border rounded-md text-xs bg-gray-100 flex items-center gap-1">
                  Date: Last 7 days
                  <DownOutlined className="text-[10px]" />
                </div>
              )}

              {/* CHANNEL */}
              {visibleOptions?.channel && selectedMarkets.length > 0 && (
                <div className="px-3 py-1 border rounded-md text-xs bg-gray-100 flex items-center gap-1">
                  Channel: {selectedMarkets[0]}
                  <DownOutlined className="text-[10px]" />
                </div>
              )}
            </div>
          </div>{' '}
          {selectedChart === 'pie' && (
            <div className="flex items-center justify-center gap-10">
              {/* PIE */}
              <div className="w-[220px] h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" outerRadius={80}>
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* RIGHT SIDE VALUES */}
              <div className="space-y-2 text-sm">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-gray-700">
                      {item.name} - {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* LINE → full width */}
          {selectedChart === 'line' && (
            <div className="w-full h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="A" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="B" stroke="#22c55e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {/* STACKED BAR */}
          {selectedChart === 'bar' && (
            <div className="w-full h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="A" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="B" stackId="a" fill="#22c55e" />
                  <Bar dataKey="C" stackId="a" fill="#64748b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {selectedChart === 'grouped' && (
            <div className="w-full h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="A" fill="#3b82f6" />
                  <Bar dataKey="B" fill="#22c55e" />
                  <Bar dataKey="C" fill="#64748b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {selectedChart === 'table' && (
            <div className="w-full overflow-x-auto">
              <table className="w-full border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2 text-left">SKU</th>
                    <th className="border p-2">Qty</th>
                    <th className="border p-2">Sales</th>
                    <th className="border p-2">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {['SKU S1', 'SKU S2', 'SKU S3', 'SKU S4'].map((sku, i) => (
                    <tr key={i}>
                      <td className="border p-2">{sku}</td>
                      <td className="border p-2 text-center">26</td>
                      <td className="border p-2 text-center">2677</td>
                      <td className="border p-2 text-center">9732</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {selectedChart === 'card' && (
            <div className="flex justify-center items-center h-[250px]">
              <div className="bg-white shadow-md rounded-xl p-6 w-[250px] text-center">
                <p className="text-gray-500 text-sm mb-2">Total Sales</p>

                <p className="text-2xl font-bold mb-3 text-black">₹2,45,000</p>

                <div className="flex justify-center gap-2">
                  <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-semibold">
                    Orders: 1,234
                  </span>

                  <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-semibold">
                    Returns: 89
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
      <Modal
        open={openFilterModal}
        onCancel={() => setOpenFilterModal(false)}
        footer={null}
        width={900}
        bodyStyle={{ maxHeight: '75vh', overflowY: 'auto' }}
      >
        {/* TOP TAGS */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(selectedFilters)
            .filter((item) => item[1])
            .map(([key]) => (
              <div key={key} className="px-3 py-1 border rounded-md text-xs bg-gray-50 flex items-center gap-1">
                {key.toUpperCase()} : Include {key}
                <button type="button" onClick={() => removeFilter(key)} className="ml-1 text-gray-500 hover:text-black">
                  <CloseOutlined style={{ fontSize: '10px' }} />
                </button>
              </div>
            ))}
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-2 mb-6">
          <Button type="primary" className="bg-blue-900 border-none" onClick={() => setOpenFilterModal(false)}>
            Apply
          </Button>
          <Button>Reset</Button>
        </div>

        {/* GRID SECTION */}
        <div className="grid grid-cols-4 gap-6 text-sm">
          {/* GST */}
          <div>
            <p className="font-semibold mb-2">GST</p>
            <label className="flex items-center gap-2 mb-3">
              <input type="checkbox" checked={selectedFilters.gst} onChange={() => toggleFilter('gst')} />
              Include GST
            </label>

            <p className="mb-1">SKU:</p>
            <Select placeholder="Sku" className="w-full mb-3" />

            <p className="mb-1">Inv MasterSku:</p>
            <Select placeholder="Inv mastersku" className="w-full" />
          </div>

          {/* EXPENSE */}
          <div>
            <p className="font-semibold mb-2">Expense</p>
            <label className="flex items-center gap-2 mb-3">
              <input type="checkbox" checked={selectedFilters.expense} onChange={() => toggleFilter('expense')} />
              Include Expense
            </label>

            <p className="mb-1">ProductId:</p>
            <Select placeholder="ProductId" className="w-full" />
          </div>

          <div>
            <p className="font-semibold mb-2">Ads</p>
            <label className="flex items-center gap-2 mb-3">
              <input type="checkbox" checked={selectedFilters.ads} onChange={() => toggleFilter('ads')} />
              Include Ads
            </label>

            <p className="mb-1">ParentId:</p>
            <Select placeholder="ParentId" className="w-full" />
          </div>

          {/* ESTIMATION */}
          <div>
            <p className="font-semibold mb-2">Estimation</p>
            <label className="flex items-center gap-2 mb-3">
              <input type="checkbox" checked={selectedFilters.estimation} onChange={() => toggleFilter('estimation')} />
              Include Estimation
            </label>

            <p className="mb-1">MKT category:</p>
            <Select placeholder="MktCategory" className="w-full" />
          </div>
        </div>
      </Modal>

      <Modal open={openYAxisModal} onCancel={() => setOpenYAxisModal(false)} footer={null} width={800}>
        <h3 className="text-lg font-semibold mb-4">Add New Filter</h3>

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <p className="text-sm mb-1">Select Field</p>
            <Select
              placeholder="Select Field"
              className="w-full"
              options={[
                { label: 'Revenue', value: 'revenue' },
                { label: 'Profit', value: 'profit' },
              ]}
            />
          </div>

          <div className="flex-1">
            <p className="text-sm mb-1">Select Operator</p>
            <Select
              placeholder="Select Operator"
              className="w-full"
              options={[
                { label: 'Greater than', value: 'gt' },
                { label: 'Less than', value: 'lt' },
              ]}
            />
          </div>

          <div className="flex items-end">
            <Button disabled className="px-4">
              Add Filter
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <p className="font-medium mb-2">Applied Filters</p>

          <div className="border border-dashed rounded-md p-6 text-center text-gray-500">
            No filters applied yet. Add a filter above to get started.
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={() => setOpenYAxisModal(false)}>Cancel</Button>

          <Button type="primary" onClick={() => setOpenYAxisModal(false)}>
            Apply Filters
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default CanvaModal;
