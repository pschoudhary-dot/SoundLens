'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SignupForm from '@/components/auth/SignupForm';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import { Music } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  
  const handleSignupSuccess = (newUserId: string) => {
    setUserId(newUserId);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary to-primary/80">
      <header className="w-full py-4 px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <div className="bg-accent rounded-full p-2 mr-2">
            <Music size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">SoundLens</span>
        </Link>
        
        {!userId && (
          <Link href="/login" className="text-white/80 hover:text-white text-sm">
            Already have an account? Log in
          </Link>
        )}
      </header>
      
      <main className="flex-grow flex items-center justify-center p-6">
        {userId ? (
          <OnboardingFlow userId={userId} />
        ) : (
          <SignupForm onSuccess={handleSignupSuccess} />
        )}
      </main>
      
      <footer className="w-full py-4 px-6 text-center text-white/50 text-sm">
        <p>SoundLens &copy; {new Date().getFullYear()} - Know Your Music Flow</p>
      </footer>
    </div>
  );
}
