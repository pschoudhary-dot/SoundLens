'use client';

import React from 'react';

interface PersonalInfoStepProps {
  formData: {
    dateOfBirth: string;
    gender: string;
    location: string;
  };
  updateFormData: (data: Partial<typeof formData>) => void;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({ formData, updateFormData }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Tell Us About Yourself</h2>
        <p className="text-white/60 mt-2">
          We'll use this information to personalize your experience
        </p>
      </div>
      
      <div className="mb-4">
        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-white/80 mb-1">
          Date of Birth
        </label>
        <input
          type="date"
          id="dateOfBirth"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="gender" className="block text-sm font-medium text-white/80 mb-1">
          Gender
        </label>
        <select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="" disabled>Select your gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="non-binary">Non-binary</option>
          <option value="prefer-not-to-say">Prefer not to say</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label htmlFor="location" className="block text-sm font-medium text-white/80 mb-1">
          Location
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="City, Country"
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
    </div>
  );
};

export default PersonalInfoStep;
