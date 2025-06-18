'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import styles from './OnboardingFlow.module.css';
import Button from '@/components/ui/Button';
import PersonalInfoStep from './steps/PersonalInfoStep';
import MusicPreferencesStep from './steps/MusicPreferencesStep';
import ListeningHabitsStep from './steps/ListeningHabitsStep';
import AdditionalInfoStep from './steps/AdditionalInfoStep';

interface OnboardingFlowProps {
  userId: string;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ userId }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data for all steps
  const [formData, setFormData] = useState({
    // Personal Info
    dateOfBirth: '',
    gender: '',
    location: '',
    
    // Music Preferences
    favoriteGenres: [] as string[],
    favoriteArtists: [] as string[],
    preferredPlatform: '',
    
    // Listening Habits
    listenHoursPerDay: '',
    likesMorningListening: false,
    likesEveningListening: false,
    listensDuringWorkout: false,
    listensDuringWork: false,
    listensDuringCommute: false,
    
    // Additional Info
    goesToGym: false,
    workoutFrequency: '',
    occupation: '',
    education: '',
    languages: [] as string[],
  });
  
  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };
  
  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };
  
  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get token from localStorage if available
      const token = localStorage.getItem('soundlens_token');
      
      const response = await axios.put(
        '/api/user/profile',
        formData,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );
      
      if (response.data.user) {
        // Update local storage with updated user data
        localStorage.setItem('soundlens_user', JSON.stringify(response.data.user));
        
        // Redirect to service connection page
        router.push('/connect-services');
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <MusicPreferencesStep formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <ListeningHabitsStep formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <AdditionalInfoStep formData={formData} updateFormData={updateFormData} />;
      default:
        return null;
    }
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-primary/30 backdrop-blur-sm border border-white/10 rounded-lg p-8 shadow-xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step <= currentStep ? 'bg-accent' : 'bg-white/20'
                } text-white font-bold`}
              >
                {step}
              </div>
            ))}
          <div className="w-full bg-white/20 h-2 rounded-full">
            <div
              className={`${styles.progressBarFill} ${styles[`step${currentStep}`]} bg-accent`}
            ></div>
          </div>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-200">
            {error}
          </div>
        )}
        
        {renderStep()}
        
        <div className="flex justify-between mt-8">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isLoading}
            >
              Back
            </Button>
          ) : (
            <div></div>
          )}
          
          {currentStep < 4 ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Complete Profile'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
