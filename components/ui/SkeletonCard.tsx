import React from 'react';
import SkeletonText from './SkeletonText';

interface SkeletonCardProps {
  className?: string;
  showImage?: boolean;
  imageHeight?: string;
  linesOfText?: number;
  textHeight?: string;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className = '',
  showImage = true,
  imageHeight = 'h-32',
  linesOfText = 2,
  textHeight = 'h-4',
}) => {
  return (
    <div className={`bg-gray-800/30 p-4 rounded-lg shadow ${className}`}>
      {showImage && (
        <div
          className={`animate-pulse bg-gray-700/50 rounded ${imageHeight} w-full mb-4`}
          style={{ animationDuration: '1.5s' }}
        />
      )}
      {Array.from({ length: linesOfText }).map((_, i) => (
        <SkeletonText
          key={i}
          height={textHeight}
          width={i === linesOfText - 1 ? 'w-3/4' : 'w-full'} // Last line often shorter
          className="mb-2"
        />
      ))}
    </div>
  );
};

export default SkeletonCard;
