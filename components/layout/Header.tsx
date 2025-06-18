'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LogOut, User, Music, BarChart2, Disc3 } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Button from '../ui/Button';
import { useRouter, usePathname } from 'next/navigation';

interface CustomUser {
  _id: string;
  name: string;
  email: string;
}

const Header: React.FC = () => {
  const { data: session, status } = useSession();
  const [customUser, setCustomUser] = useState<CustomUser | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Log session status for debugging
  console.log('Header - Session Status:', status);
  console.log('Header - Session Data:', session);

  // Check for custom authentication
  useEffect(() => {
    const userJson = localStorage.getItem('soundlens_user');
    const token = localStorage.getItem('soundlens_token');
    const expiryStr = localStorage.getItem('soundlens_session_expiry');

    // First check if token exists and is not expired
    if (token && userJson) {
      // Check for expiration if we have an expiry date
      if (expiryStr) {
        const expiryDate = new Date(expiryStr);
        const now = new Date();

        if (now > expiryDate) {
          console.log('Token expired, clearing session');
          // Token expired, clear it
          localStorage.removeItem('soundlens_token');
          localStorage.removeItem('soundlens_user');
          localStorage.removeItem('soundlens_session_expiry');
          setCustomUser(null);
          return;
        }
      }

      // Token exists and is not expired, parse user data
      try {
        const userData = JSON.parse(userJson);
        setCustomUser(userData);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const handleLogout = () => {
    // Handle NextAuth logout
    if (session) {
      signOut();
    }

    // Handle custom auth logout
    if (customUser) {
      localStorage.removeItem('soundlens_token');
      localStorage.removeItem('soundlens_user');
      localStorage.removeItem('soundlens_session_expiry');

      // Clear cookies
      document.cookie = 'soundlens_token=; path=/; max-age=0; SameSite=Strict';
      document.cookie = 'soundlens_user_id=; path=/; max-age=0; SameSite=Strict';

      setCustomUser(null);
      router.push('/');
    }
  };

  // State for dropdown menu
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Determine if user is authenticated through either method
  const isAuthenticated = status === 'authenticated' || customUser !== null;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const dropdown = document.getElementById('user-dropdown');
      const dropdownButton = document.getElementById('dropdown-button');

      if (dropdown && dropdownButton &&
          !dropdown.contains(target) &&
          !dropdownButton.contains(target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <header className="w-full py-4 px-6 flex items-center justify-between border-b border-white/10">
      <div className="flex items-center">
        <Link href="/" className="flex items-center group">
          <div className="bg-[#22c55e] rounded-full p-1.5 mr-2 transition-transform group-hover:scale-110">
            <Music size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">
            Sound<span className="text-[#22c55e]">Lens</span>
          </span>
          <p className="ml-4 text-sm text-white/70 hidden sm:block">
            Know Your Music Flow
          </p>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated && (
          <>
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-1 ${pathname === '/dashboard' ? 'border-b-2 border-[#22c55e]' : ''}`}
              >
                <BarChart2 size={16} />
                <span>Dashboard</span>
              </Button>
            </Link>

            <Link href="/music-reel">
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-1 ${pathname === '/music-reel' ? 'border-b-2 border-[#22c55e]' : ''}`}
              >
                <Disc3 size={16} />
                <span>Music Reel</span>
              </Button>
            </Link>
          </>
        )}

        {status === 'loading' && !customUser ? (
          <div className="h-8 w-24 bg-white/10 rounded animate-pulse"></div>
        ) : isAuthenticated ? (
          <div className="relative">
            <div
              id="dropdown-button"
              className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-white/5 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(!dropdownOpen);
              }}
            >
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center">
                  <User size={16} />
                </div>
              )}
              <span className="text-sm hidden md:inline-block">
                {session?.user?.name || customUser?.name || 'User'}
              </span>
              <svg
                className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>

            {dropdownOpen && (
              <div
                id="user-dropdown"
                className="absolute right-0 mt-2 w-48 bg-primary/90 backdrop-blur-sm border border-white/10 rounded-md shadow-lg z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-3 border-b border-white/10">
                  <p className="text-sm font-medium">{session?.user?.name || customUser?.name || 'User'}</p>
                  <p className="text-xs text-white/60 truncate">{session?.user?.email || customUser?.email || ''}</p>
                </div>

                <div className="py-1">
                  <Link href="/dashboard" className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5 transition-colors ${pathname === '/dashboard' ? 'text-[#22c55e]' : ''}`}>
                    <BarChart2 size={14} />
                    <span>Dashboard</span>
                  </Link>
                  <Link href="/music-reel" className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5 transition-colors ${pathname === '/music-reel' ? 'text-[#22c55e]' : ''}`}>
                    <Disc3 size={14} />
                    <span>Music Reel</span>
                  </Link>
                  <Link href="/profile" className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5 transition-colors ${pathname === '/profile' ? 'text-[#22c55e]' : ''}`}>
                    <User size={14} />
                    <span>Profile Settings</span>
                  </Link>
                </div>

                <div className="py-1 border-t border-white/10">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login">
            <Button variant="primary" size="sm">Login</Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
