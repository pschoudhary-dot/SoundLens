'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Button from '@/components/ui/Button';
import SpotifyLoginButton from './SpotifyLoginButton';

const LoginForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Submitting login form with:', { email: formData.email });

      const response = await axios.post('/api/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      console.log('Login response:', response.data);

      if (response.data.token) {
        // Set expiration date if rememberMe is checked (30 days)
        const expirationDate = formData.rememberMe
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : null;

        try {
          // Save token and user data to localStorage
          localStorage.setItem('soundlens_token', response.data.token);
          localStorage.setItem('soundlens_user', JSON.stringify(response.data.user));

          // Save expiration date if rememberMe is checked
          if (expirationDate) {
            localStorage.setItem('soundlens_session_expiry', expirationDate);
          }
        } catch (storageError) {
          console.error('Error saving to localStorage:', storageError);
          // Continue even if localStorage fails
        }

        // Always set a cookie for the token (needed for middleware)
        try {
          const maxAge = formData.rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 1 day
          document.cookie = `soundlens_token=${response.data.token}; path=/; max-age=${maxAge}; SameSite=Strict`;
        } catch (cookieError) {
          console.error('Error setting cookie:', cookieError);
          // Continue even if cookie setting fails
        }

        console.log('Authentication successful, redirecting...');

        // Determine redirect destination
        const redirectTo = response.data.user.spotifyConnected || response.data.user.youtubeConnected
          ? '/dashboard'
          : '/connect-services';

        // Use a simpler approach with a fallback
        try {
          // First try Next.js router
          router.push(redirectTo);

          // Set a fallback with window.location after a short delay
          setTimeout(() => {
            window.location.href = redirectTo;
          }, 500);
        } catch (navigationError) {
          console.error('Navigation error:', navigationError);
          // Direct fallback to window.location
          window.location.href = redirectTo;
        }
      } else {
        setError('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="bg-primary/30 backdrop-blur-sm border border-white/10 rounded-lg p-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Welcome Back</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-200">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Enter your email"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Enter your password"
          />
        </div>

        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="rememberMe"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="h-4 w-4 rounded border-white/20 bg-white/10 text-accent focus:ring-accent"
          />
          <label htmlFor="rememberMe" className="ml-2 block text-sm text-white/80">
            Remember me for 30 days
          </label>
        </div>

        <Button
          type="submit"
          className="w-full py-3 mb-3"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Logging In...
            </span>
          ) : (
            'Log In'
          )}
        </Button>

        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute border-t border-white/10 w-full"></div>
          <span className="relative bg-gray-900 px-2 text-sm text-white/50">OR</span>
        </div>

        <SpotifyLoginButton
          className="w-full py-3 bg-[#1DB954] hover:bg-[#1AA34A] text-white"
        >
          Login with Spotify
        </SpotifyLoginButton>

        <div className="mt-4 text-center">
          <p className="text-white/60 text-sm">
            Don't have an account?{' '}
            <a href="/signup" className="text-accent hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
