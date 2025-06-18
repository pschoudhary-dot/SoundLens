'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary to-primary/80 p-4">
      <div className="max-w-md w-full bg-primary/30 backdrop-blur-sm border border-white/10 rounded-lg p-8 shadow-xl text-center">
        <h1 className="text-4xl font-bold text-white mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">Page Not Found</h2>
        
        <p className="text-white/80 mb-6">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <Link 
          href="/"
          className="inline-flex items-center justify-center py-2 px-4 bg-accent hover:bg-accent/90 text-white rounded-md transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" /> Return to Home
        </Link>
      </div>
    </div>
  );
}
