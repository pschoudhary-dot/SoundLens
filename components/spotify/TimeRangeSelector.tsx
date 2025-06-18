'use client';

import React from 'react';
import { TimeRange } from '@/lib/spotify';

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onChange: (range: TimeRange) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ selectedRange, onChange }) => {
  const ranges = [
    { value: 'today', label: 'Today' },
    { value: 'this_week', label: 'This Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'short_term', label: 'Last 4 Weeks' },
    { value: 'medium_term', label: 'Last 6 Months' },
    { value: 'long_term', label: 'All Time' },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {ranges.map((range) => (
        <button
          type="button"
          key={range.value}
          onClick={() => onChange(range.value as TimeRange)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedRange === range.value
              ? 'bg-green-500 text-white'
              : 'border border-white/20 text-white hover:border-white/40'
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
};

export default TimeRangeSelector;
