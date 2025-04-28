'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const [errorDetails, setErrorDetails] = useState({
    error: '',
    description: '',
    queryParams: {} as Record<string, string>
  });

  useEffect(() => {
    // Get all query parameters
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    // Get specific error parameters
    const error = searchParams.get('error') || '';
    let description = searchParams.get('error_description') || '';

    // If no description is provided, give a default based on the error
    if (!description) {
      switch (error) {
        case 'Configuration':
          description = 'There is a problem with the server configuration.';
          break;
        case 'AccessDenied':
          description = 'You do not have access to this resource.';
          break;
        case 'Verification':
          description = 'The verification token has expired or has already been used.';
          break;
        case 'spotify':
          description = 'There was an error authenticating with Spotify. Please check your Spotify credentials and try again.';
          break;
        default:
          description = 'An unknown error occurred during authentication.';
      }
    }

    setErrorDetails({
      error,
      description,
      queryParams: params
    });

    // Log the error details to the console for debugging
    console.error('🔑 AUTH ERROR DETAILS:', {
      error,
      description,
      allParams: params
    });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md mx-auto bg-gray-900 rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-red-500/20 p-4 rounded-full">
                <AlertTriangle size={40} className="text-red-500" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-white text-center mb-2">Authentication Error</h1>
            
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <p className="text-red-400 font-medium mb-2">Error: {errorDetails.error || 'Unknown Error'}</p>
              <p className="text-white/70">{errorDetails.description}</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <h3 className="text-white font-medium mb-2">Debugging Information</h3>
              <div className="text-white/60 text-sm">
                <pre className="overflow-auto max-h-40 p-2 bg-gray-950 rounded">
                  {JSON.stringify(errorDetails.queryParams, null, 2)}
                </pre>
              </div>
            </div>
            
            <div className="flex flex-col space-y-3">
              <Link 
                href="/"
                className="flex items-center justify-center py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors"
              >
                <ArrowLeft size={16} className="mr-2" /> Return to Home
              </Link>
              
              <Link 
                href="/login"
                className="flex items-center justify-center py-2 px-4 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-md transition-colors"
              >
                Try Again
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
