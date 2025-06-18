'use client';

import React, { useState } from 'react';
import axios from 'axios';
import Button from '@/components/ui/Button';

interface SignupFormProps {
  onSuccess: (userId: string) => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Submitting signup form with:', { name: formData.name, email: formData.email });

      const response = await axios.post('/api/auth/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      console.log('Signup response:', response.data);

      if (response.data.user && response.data.token) {
        try {
          // Save token and user data to localStorage
          localStorage.setItem('soundlens_token', response.data.token);
          localStorage.setItem('soundlens_user', JSON.stringify(response.data.user));
        } catch (storageError) {
          console.error('Error saving to localStorage:', storageError);
          // Continue even if localStorage fails
        }

        try {
          // Set a cookie for the token (needed for middleware)
          const maxAge = 24 * 60 * 60; // 1 day
          document.cookie = `soundlens_token=${response.data.token}; path=/; max-age=${maxAge}; SameSite=Strict`;
        } catch (cookieError) {
          console.error('Error setting cookie:', cookieError);
          // Continue even if cookie setting fails
        }

        console.log('Signup successful, proceeding to onboarding...');

        // Call the onSuccess callback to proceed to onboarding
        onSuccess(response.data.user._id);
      } else {
        setError('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.response?.data?.error || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="bg-primary/30 backdrop-blur-sm border border-white/10 rounded-lg p-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Create Your Account</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-200">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Enter your name"
          />
        </div>

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
            placeholder="Create a password"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Confirm your password"
          />
        </div>

        <Button
          type="submit"
          className="w-full py-3"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Account...
            </span>
          ) : (
            'Sign Up'
          )}
        </Button>
      </form>
    </div>
  );
};

export default SignupForm;
