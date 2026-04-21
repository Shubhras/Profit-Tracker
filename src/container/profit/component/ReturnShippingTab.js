import React from 'react';
import { Card, Table, Radio } from 'antd';

export default function ReturnShippingTab() {
  // 🔹 STATE TABLE
  const stateColumns = [
    {
      title: <span className="text-xs font-medium">State</span>,
      dataIndex: 'state',
      render: (v) => <span className="text-xs">{v}</span>,
    },
    {
      title: <span className="text-xs font-medium">Gross Qty</span>,
      dataIndex: 'gross',
      render: (v) => <span className="text-xs">{v}</span>,
    },
    {
      title: <span className="text-xs font-medium">Net Qty</span>,
      dataIndex: 'net',
      render: (v) => <span className="text-xs">{v}</span>,
    },
    {
      title: <span className="text-xs font-medium">RTO</span>,
      dataIndex: 'rto',
      render: (v) => <span className="text-xs">{v}</span>,
    },
    {
      title: <span className="text-xs font-medium">RTO(%)</span>,
      dataIndex: 'rtoPer',
      render: (v) => <span className="text-xs">{v}</span>,
    },
    {
      title: <span className="text-xs font-medium">CRET</span>,
      dataIndex: 'cret',
      render: (v) => <span className="text-xs">{v}</span>,
    },
    {
      title: <span className="text-xs font-medium">CRET(%)</span>,
      dataIndex: 'cretPer',
      render: (v) => <span className="text-xs">{v}</span>,
    },
    {
      title: <span className="text-xs font-medium">Total ship(₹)</span>,
      dataIndex: 'total',
      render: (v) => <span className="text-xs">{v}</span>,
    },
  ];

  const stateData = [
    { state: 'MAHARASHTRA', gross: 540, net: 501, rto: 5, rtoPer: '1%', cret: 54, cretPer: '10%', total: '-₹25,495' },
    { state: 'KARNATAKA', gross: 463, net: 427, rto: 7, rtoPer: '2%', cret: 33, cretPer: '7%', total: '-₹21,088' },
    { state: 'TAMIL NADU', gross: 248, net: 230, rto: 2, rtoPer: '1%', cret: 18, cretPer: '7%', total: '-₹10,902' },
    { state: 'TELANGANA', gross: 204, net: 194, rto: 4, rtoPer: '2%', cret: 8, cretPer: '4%', total: '-₹9,087' },
    { state: 'UTTAR PRADESH', gross: 181, net: 173, rto: 4, rtoPer: '2%', cret: 13, cretPer: '7%', total: '-₹8,231' },
  ];

  return (
    <div className="px-6 py-4">
      {/* 🔥 TOP SECTION */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card
          title={
            <div className="flex justify-between items-center">
              <span>Ship Cost</span>
              <span className="text-xs text-gray-500">Shipping Fees w/o Pincode: 2,56</span>
            </div>
          }
        >
          {/* <div className="text-xs text-gray-500 mb-2">Shipping Fees w/o Pincode: 2,568</div> */}

          <table className="w-full text-[11px] border border-gray-300">
            <thead>
              <tr>
                <th className="border px-2 py-1 bg-gray-100 text-left">Ship Cost</th>
                <th className="border px-2 py-1 bg-gray-100 text-center" colSpan={5}>
                  TO
                </th>
              </tr>
              <tr className="bg-gray-50">
                <th className="border px-2 py-1 text-left">FROM</th>
                <th className="border px-2 py-1">South</th>
                <th className="border px-2 py-1">West</th>
                <th className="border px-2 py-1">North</th>
                <th className="border px-2 py-1">East</th>
                <th className="border px-2 py-1 font-semibold">Total</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="border px-2 py-1 font-medium">South</td>
                <td className="border px-2 py-1">34,533</td>
                <td className="border px-2 py-1">18,239</td>
                <td className="border px-2 py-1">9,054</td>
                <td className="border px-2 py-1">3,354</td>
                <td className="border px-2 py-1 font-semibold">65,180</td>
              </tr>

              <tr>
                <td className="border px-2 py-1 font-medium">West</td>
                <td className="border px-2 py-1">14,019</td>
                <td className="border px-2 py-1">15,525</td>
                <td className="border px-2 py-1">14,260</td>
                <td className="border px-2 py-1">5,043</td>
                <td className="border px-2 py-1 font-semibold">48,847</td>
              </tr>

              <tr>
                <td className="border px-2 py-1 font-medium">North</td>
                <td className="border px-2 py-1">1,711</td>
                <td className="border px-2 py-1">3,561</td>
                <td className="border px-2 py-1">2,559</td>
                <td className="border px-2 py-1">806</td>
                <td className="border px-2 py-1 font-semibold">8,637</td>
              </tr>

              <tr>
                <td className="border px-2 py-1 font-medium">East</td>
                <td className="border px-2 py-1">0</td>
                <td className="border px-2 py-1">0</td>
                <td className="border px-2 py-1">0</td>
                <td className="border px-2 py-1">0</td>
                <td className="border px-2 py-1 font-semibold">0</td>
              </tr>

              <tr className="bg-gray-50 font-semibold">
                <td className="border px-2 py-1">Total</td>
                <td className="border px-2 py-1">50,263</td>
                <td className="border px-2 py-1">37,325</td>
                <td className="border px-2 py-1">25,873</td>
                <td className="border px-2 py-1">9,203</td>
                <td className="border px-2 py-1">1,22,665</td>
              </tr>
            </tbody>
          </table>
        </Card>

        <Card
          title={
            <div className="flex justify-between items-center">
              <span>Return Cost</span>
              <span className="text-xs text-gray-500">Shipping Fees w/o Pincode: 0</span>
            </div>
          }
        >
          <table className="w-full text-[11px] border border-gray-300">
            <thead>
              <tr>
                <th className="border px-2 py-1 bg-gray-100 text-left">Ret Cost</th>
                <th className="border px-2 py-1 bg-gray-100 text-center" colSpan={5}>
                  TO
                </th>
              </tr>
              <tr className="bg-gray-50">
                <th className="border px-2 py-1 text-left">FROM</th>
                <th className="border px-2 py-1">South</th>
                <th className="border px-2 py-1">West</th>
                <th className="border px-2 py-1">North</th>
                <th className="border px-2 py-1">East</th>
                <th className="border px-2 py-1 font-semibold">Total</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="border px-2 py-1 font-medium">South</td>
                <td className="border px-2 py-1">1,250</td>
                <td className="border px-2 py-1">1,359</td>
                <td className="border px-2 py-1">297</td>
                <td className="border px-2 py-1">241</td>
                <td className="border px-2 py-1 font-semibold">3,147</td>
              </tr>

              <tr>
                <td className="border px-2 py-1 font-medium">West</td>
                <td className="border px-2 py-1">1,393</td>
                <td className="border px-2 py-1">2,107</td>
                <td className="border px-2 py-1">1,692</td>
                <td className="border px-2 py-1">380</td>
                <td className="border px-2 py-1 font-semibold">5,572</td>
              </tr>

              <tr>
                <td className="border px-2 py-1 font-medium">North</td>
                <td className="border px-2 py-1">50</td>
                <td className="border px-2 py-1">198</td>
                <td className="border px-2 py-1">149</td>
                <td className="border px-2 py-1">50</td>
                <td className="border px-2 py-1 font-semibold">446</td>
              </tr>

              <tr>
                <td className="border px-2 py-1 font-medium">East</td>
                <td className="border px-2 py-1">0</td>
                <td className="border px-2 py-1">0</td>
                <td className="border px-2 py-1">0</td>
                <td className="border px-2 py-1">0</td>
                <td className="border px-2 py-1 font-semibold">0</td>
              </tr>

              <tr className="bg-gray-50 font-semibold">
                <td className="border px-2 py-1">Total</td>
                <td className="border px-2 py-1">2,692</td>
                <td className="border px-2 py-1">3,665</td>
                <td className="border px-2 py-1">2,138</td>
                <td className="border px-2 py-1">670</td>
                <td className="border px-2 py-1">9,165</td>
              </tr>
            </tbody>
          </table>
        </Card>

        {/* RETURN REASON */}
        <Card title="Return Reason">
          {/* FILTER */}
          <div className="flex items-center gap-4 mb-3 text-xs">
            <Radio.Group defaultValue="all">
              <Radio value="all">All</Radio>
              <Radio value="rto">RTO</Radio>
              <Radio value="customer">Customer Return</Radio>
            </Radio.Group>
          </div>

          {/* TABLE HEADER */}
          <div className="grid grid-cols-2 text-xs font-semibold border-b pb-2 mb-2">
            <span>Orders</span>
            <span>Reason</span>
          </div>

          {/* ROWS */}
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 items-center">
              <span className="w-fit bg-yellow-200 px-2 py-1 rounded-full text-center">9</span>
              <span className="font-medium">APPAREL_TOO_LARGE</span>
            </div>

            <div className="grid grid-cols-2 items-center">
              <span className="w-fit bg-red-200 px-2 py-1 rounded-full text-center">8</span>
              <span className="font-medium">AMZ-PG-APP-TOO-LARGE</span>
            </div>

            <div className="grid grid-cols-2 items-center">
              <span className="w-fit bg-green-200 px-2 py-1 rounded-full text-center">5</span>
              <span className="font-medium">CR-SWITCHEROO</span>
            </div>
          </div>

          <div className="flex justify-end items-center gap-2 mt-4 text-xs">
            <span className="cursor-pointer">{'<'}</span>
            <span className="bg-blue-500 text-white px-2 rounded">1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
            <span>6</span>
            <span>7</span>
            <span className="cursor-pointer">{'>'}</span>
          </div>
        </Card>
      </div>

      {/* 🔥 STATE ANALYSIS */}
      <div className="grid grid-cols-3 gap-4">
        {/* LEFT SIDE (STATE TABLE) */}
        <div className="col-span-2">
          <Card title="State Analysis">
            <Table
              columns={stateColumns}
              dataSource={stateData}
              pagination={false}
              size="small"
              rowKey={(r, i) => i}
              className="[&_.ant-table-cell]:py-1 [&_.ant-table-cell]:px-2"
            />
          </Card>
        </div>

        {/* RIGHT SIDE (SHIP COST ONLY) */}
        <div>
          <Card title="Ship cost">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between bg-blue-100 px-2 py-1 rounded">
                <span>Courier Return</span>
                <span>₹1,162</span>
              </div>

              <div className="flex justify-between bg-pink-200 px-2 py-1 rounded">
                <span>Customer Return</span>
                <span>₹8,003</span>
              </div>

              <div className="flex justify-between bg-green-200 px-2 py-1 rounded">
                <span>Other orders</span>
                <span>₹1,16,505</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 🔥 RIGHT SIDE COST */}
      {/* <Card title="Ship cost" className="mt-4">
        <div className="space-y-2 text-xs">
          <div className="flex justify-between bg-blue-100 px-2 py-1 rounded">
            <span>Courier Return</span>
            <span>₹1,162</span>
          </div>

          <div className="flex justify-between bg-pink-200 px-2 py-1 rounded">
            <span>Customer Return</span>
            <span>₹8,003</span>
          </div>

          <div className="flex justify-between bg-green-200 px-2 py-1 rounded">
            <span>Other orders</span>
            <span>₹1,16,505</span>
          </div>
        </div>
      </Card> */}
    </div>
  );
}
