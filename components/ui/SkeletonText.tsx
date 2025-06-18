import React from 'react';

interface SkeletonTextProps {
  className?: string;
  width?: string; // e.g., 'w-3/4', 'w-20'
  height?: string; // e.g., 'h-4', 'h-6'
}

const SkeletonText: React.FC<SkeletonTextProps> = ({
  className = '',
  width = 'w-full',
  height = 'h-4'
}) => {
  return (
    <div
      className={`animate-pulse bg-gray-700/50 rounded ${height} ${width} ${className}`}
      style={{ animationDuration: '1.5s' }} // Adjust duration for desired shimmer speed
    />
  );
};

export default SkeletonText;
