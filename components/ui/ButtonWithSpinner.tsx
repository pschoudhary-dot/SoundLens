'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from './Button';

interface ButtonWithSpinnerProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const ButtonWithSpinner: React.FC<ButtonWithSpinnerProps> = ({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = () => {
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    
    if (href) {
      router.push(href);
    } else if (onClick) {
      onClick();
    }
  };
  
  return (
    <Button
      type={type}
      onClick={handleClick}
      variant={variant}
      size={size}
      className={className}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </Button>
  );
};

export default ButtonWithSpinner;
