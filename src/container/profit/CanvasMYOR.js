import React from 'react';
import { PageHeader } from '../../components/page-headers/page-headers';

export default function CanvasMYOR() {
  const PageRoutes = [
    {
      path: 'index',
      breadcrumbName: 'Profit',
    },
    {
      path: '',
      breadcrumbName: 'Canvas MYOR',
    },
  ];
  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Profit"
        className="flex  justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      />
      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
        {/* MAIN CARD */}
        <div className="bg-white border rounded-xl p-6 flex gap-10 items-start">
          {/* LEFT */}
          <div className="w-[320px] shrink-0">
            <h2 className="text-lg font-semibold mb-3">Beyond the Obvious</h2>

            <h3 className="font-medium mb-2">Create Your Instant Custom Dashboard!</h3>

            <p className="text-gray-500 text-sm mb-4">Create Your Instant Custom Dashboard!</p>

            <div className="flex flex-col gap-3 items-start">
              <button
                type="button"
                className="bg-gradient-to-r from-blue-500 to-green-400 text-white px-6 py-2 rounded-md font-medium"
              >
                Create Report
              </button>

              <button type="button" className="bg-gray-400 text-white px-6 py-2 rounded-md font-medium">
                Create Dashboard
              </button>
            </div>

            <p className="text-orange-500 text-xs mt-3">Create at least one item before creating a dashboard</p>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex-1 grid grid-cols-2 gap-6">
            <div className="border rounded-lg h-[220px] bg-gray-50 flex items-center justify-center text-gray-400">
              Box 1
            </div>

            <div className="border rounded-lg h-[220px] bg-gray-50 flex items-center justify-center text-gray-400">
              Box 2
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
