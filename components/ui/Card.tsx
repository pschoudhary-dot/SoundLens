'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-primary/30 backdrop-blur-sm border border-white/10 rounded-lg p-4 sm:p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
