import React from 'react';
import SkeletonText from '@/components/ui/SkeletonText';

const HorizontalTrackItemSkeleton: React.FC = () => {
  return (
    <div className="flex-shrink-0 w-48 bg-gray-800/30 p-3 rounded-lg shadow">
      <div className="animate-pulse bg-gray-700/50 w-full h-36 rounded-md mb-3" style={{ animationDuration: '1.5s' }}></div>
      <SkeletonText height="h-5" width="w-3/4" className="mb-1.5" />
      <SkeletonText height="h-3" width="w-1/2" />
    </div>
  );
};

export default HorizontalTrackItemSkeleton;
