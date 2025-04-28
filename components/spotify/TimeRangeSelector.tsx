'use client';

import React from 'react';
import { TimeRange } from '@/lib/spotify';

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onChange: (range: TimeRange) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ selectedRange, onChange }) => {
  const ranges = [
    { value: 'short_term', label: 'Last 4 Weeks' },
    { value: 'medium_term', label: 'Last 6 Months' },
    { value: 'long_term', label: 'All Time' },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {ranges.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value as TimeRange)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedRange === range.value
              ? 'bg-accent text-white'
              : 'bg-white/10 text-secondary hover:bg-white/20'
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
};

export default TimeRangeSelector;
