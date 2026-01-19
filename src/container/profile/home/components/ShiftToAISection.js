import React from 'react';
import { FiMessageSquare, FiBarChart2, FiBell } from 'react-icons/fi';

function ShiftToAISection() {
  return (
    <section className="w-full py-20 px-[3%] bg-white">
      <div className="w-full">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-3xl font-extrabold text-gray-900">
            Shift From Dashboard <span className="mx-2">→</span> AI
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-700">
            Transform complex financial queries into instant, actionable insights with natural language processing and
            AI-powered analysis
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-3 md:grid-cols-1 gap-8">
          {/* Card 1 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm hover:shadow-md transition">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-900 text-white">
              <FiMessageSquare size={24} />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Ask In Natural Language</h3>

            <p className="text-lg text-gray-700">Get answers instantly without menu hunting</p>

            {/* Optional UI hint */}
            <div className="mt-6 inline-flex items-center gap-3 bg-blue-600 text-white px-4 py-2 rounded-full text-sm">
              Hey, What’s the profit this month?
              <span className="h-5 w-5 rounded-full border border-white" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm hover:shadow-md transition">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-900 text-white">
              <FiBarChart2 size={24} />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Creates Custom Views</h3>

            <p className="text-lg text-gray-700">See your data exactly the way you want</p>

            {/* Chart icon illustration */}
            <div className="mx-auto flex items-end justify-center gap-2 h-20">
              <span className="w-3 h-10 bg-blue-500 rounded" />
              <span className="w-3 h-14 bg-amber-400 rounded" />
              <span className="w-3 h-8 bg-teal-500 rounded" />
              <span className="w-3 h-16 bg-blue-600 rounded" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm hover:shadow-md transition">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-900 text-white">
              <FiBell size={24} />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Acts Proactively</h3>

            <p className="text-lg text-gray-700">Alerts before you lose money or stock runs out</p>

            {/* Gauge illustration */}
            <div className="relative mx-auto w-40 h-20">
              <div className="absolute inset-0 rounded-t-full border-4 border-transparent border-t-green-500 border-r-yellow-400 border-l-red-500" />
              <div className="absolute bottom-0 left-1/2 h-14 w-1 bg-gray-800 origin-bottom rotate-[20deg]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ShiftToAISection;
