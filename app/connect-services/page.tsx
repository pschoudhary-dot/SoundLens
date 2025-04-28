'use client';

import React from 'react';
import Link from 'next/link';
import ConnectServices from '@/components/services/ConnectServices';
import { Music } from 'lucide-react';

export default function ConnectServicesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary to-primary/80">
      <header className="w-full py-4 px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <div className="bg-[#22c55e] rounded-full p-2 mr-2">
            <Music size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">
            Sound<span className="text-[#22c55e]">Lens</span>
          </span>
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center p-6">
        <ConnectServices />
      </main>

      <footer className="w-full py-4 px-6 text-center text-white/50 text-sm">
        <p>SoundLens &copy; {new Date().getFullYear()} - Know Your Music Flow</p>
      </footer>
    </div>
  );
}
