import React, { useState } from 'react';
import { DateRange } from 'react-date-range';
import { Button } from 'antd';

function CustomCalendar({ onSubmit, onCancel, initialRange }) {
  const [tempRange, setTempRange] = useState([
    {
      startDate: initialRange?.[0]?.toDate() || new Date(),
      endDate: initialRange?.[1]?.toDate() || new Date(),
      key: 'selection',
    },
  ]);

  const handlePreset = (type) => {
    let start;
    let end;
    const today = new Date();

    switch (type) {
      case 'today':
        start = today;
        end = today;
        break;
      case 'thisWeek':
        start = new Date();
        start.setDate(today.getDate() - today.getDay());
        end = new Date();
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

  return (
    <div style={{ display: 'flex' }}>
      {/* ✅ LEFT SIDE */}
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
          {[
            { label: 'Today', type: 'today' },
            { label: 'Yesterday', type: 'yesterday' },
            { label: 'This Week', type: 'thisWeek' },
            { label: 'Last Week', type: 'lastWeek' },
            { label: 'This Month', type: 'thisMonth' },
            { label: 'Last Month', type: 'lastMonth' },
          ].map((item) => (
            <Button
              // type="button"
              key={item.type}
              onClick={() => handlePreset(item.type)}
              className="px-2 py-2 w-full text-left hover:bg-gray-100 border-none"
            >
              {item.label}
            </Button>
          ))}
        </div>

        {/* ✅ BUTTONS */}
        <div style={{ display: 'flex', gap: 6 }}>
          <Button
            type="primary"
            onClick={() => {
              const start = tempRange[0].startDate;
              const end = tempRange[0].endDate;

              onSubmit(start, end); // 🔥 parent ko bhej diya
            }}
          >
            Submit
          </Button>

          <Button onClick={onCancel}>Cancel</Button>
        </div>
      </div>
      <style>
        {`
.rdrMonthPicker select {
  padding: 2px 6px !important;
  height: auto !important;
}

.rdrMonthPicker select:hover {
  background-color: rgba(59,130,246,0.08) !important;
  padding: 2px 6px !important; /* height same rahe */
}

.rdrYearPicker select {
  padding: 4px 22x !important;
  height: 30px !important;
   height: auto !important; 
}

.rdrYearPicker select:hover {
  background-color: rgba(59,130,246,0.08) !important;
}

.rdrMonthName {
  padding-top: 0px !important;
  padding-bottom: 0px !important;
  font-size: 13px !important;
}

.rdrMonthAndYearPickers {
  gap: 4px !important;
}
.rdrDateDisplayWrapper {
  padding: 2px 8px !important;
}

.rdrDateDisplay {
  gap: 6px !important; 
}
    .rdrMonth {
    width: 300px !important; 
  }

.rdrDateDisplayItem {
  height: 28px !important; 
  min-width: 120px !important;
  padding: 0 6px !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rdrDateDisplayItem input {
  font-size: 12px !important; 
  text-align: center;
}
`}
      </style>{' '}
      <DateRange
        ranges={tempRange}
        onChange={(item) => setTempRange([item.selection])}
        months={2}
        // maxDate={new Date()}

        direction="horizontal"
        rangeColors={['#22c55e']}
      />
    </div>
  );
}

export default CustomCalendar;
