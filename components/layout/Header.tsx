'use client';

import React from 'react';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Button from '../ui/Button';

const Header: React.FC = () => {
  const { data: session, status } = useSession();

  // Log session status for debugging
  console.log('Header - Session Status:', status);
  console.log('Header - Session Data:', session);

  return (
    <header className="w-full py-4 px-6 flex items-center justify-between border-b border-white/10">
      <div className="flex items-center">
        <Link href="/" className="text-2xl font-bold text-accent">
          SoundLens
        </Link>
        <p className="ml-4 text-sm text-secondary/70 hidden sm:block">
          Know Your Music Flow
        </p>
      </div>

      {status === 'loading' ? (
        <div className="h-8 w-24 bg-white/10 rounded animate-pulse"></div>
      ) : session ? (
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            {session.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="w-8 h-8 rounded-full mr-2"
              />
            )}
            <span className="text-sm hidden md:inline-block">{session.user?.name}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut()}
            className="flex items-center gap-1"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline-block">Logout</span>
          </Button>
        </div>
      ) : (
        <Link href="/api/auth/signin">
          <Button variant="primary" size="sm">Login with Spotify</Button>
        </Link>
      )}
    </header>
  );
};

export default Header;
