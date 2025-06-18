'use client';

import React, { useState } from 'react';

interface AdditionalInfoStepProps {
  formData: {
    goesToGym: boolean;
    workoutFrequency: string;
    occupation: string;
    education: string;
    languages: string[];
  };
  updateFormData: (data: Partial<AdditionalInfoStepProps['formData']>) => void;
}

const AdditionalInfoStep: React.FC<AdditionalInfoStepProps> = ({ formData, updateFormData }) => {
  const [languageInput, setLanguageInput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';

    if (isCheckbox) {
      const checkbox = e.target as HTMLInputElement;
      updateFormData({ [name]: checkbox.checked });

      // Reset workout frequency if user doesn't go to gym
      if (name === 'goesToGym' && !checkbox.checked) {
        updateFormData({ workoutFrequency: '' });
      }
    } else {
      updateFormData({ [name]: value });
    }
  };

  const handleAddLanguage = () => {
    if (languageInput.trim() && !formData.languages.includes(languageInput.trim())) {
      updateFormData({
        languages: [...formData.languages, languageInput.trim()]
      });
      setLanguageInput('');
    }
  };

  const handleRemoveLanguage = (language: string) => {
    updateFormData({
      languages: formData.languages.filter(l => l !== language)
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Additional Information</h2>
        <p className="text-white/60 mt-2">
          Help us understand more about your lifestyle
        </p>
      </div>

      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="goesToGym"
            checked={formData.goesToGym}
            onChange={handleChange}
            className="w-5 h-5 rounded bg-white/10 border-white/20 text-accent focus:ring-accent focus:ring-offset-0"
          />
          <span className="ml-3 text-white">I go to the gym/workout regularly</span>
        </label>
      </div>

      {formData.goesToGym && (
        <div className="mb-4 ml-8">
          <label htmlFor="workoutFrequency" className="block text-sm font-medium text-white/80 mb-1">
            How often do you workout?
          </label>
          <select
            id="workoutFrequency"
            name="workoutFrequency"
            value={formData.workoutFrequency}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="" disabled>Select frequency</option>
            <option value="daily">Daily</option>
            <option value="3-5-times-week">3-5 times a week</option>
            <option value="1-2-times-week">1-2 times a week</option>
            <option value="few-times-month">A few times a month</option>
          </select>
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="occupation" className="block text-sm font-medium text-white/80 mb-1">
          Occupation
        </label>
        <input
          type="text"
          id="occupation"
          name="occupation"
          value={formData.occupation}
          onChange={handleChange}
          placeholder="What do you do for work?"
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="education" className="block text-sm font-medium text-white/80 mb-1">
          Education Level
        </label>
        <select
          id="education"
          name="education"
          value={formData.education}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="" disabled>Select education level</option>
          <option value="high-school">High School</option>
          <option value="some-college">Some College</option>
          <option value="bachelors">Bachelor's Degree</option>
          <option value="masters">Master's Degree</option>
          <option value="phd">PhD or Higher</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-white/80 mb-1">
          Languages You Speak
        </label>
        <div className="flex mb-2">
          <input
            type="text"
            value={languageInput}
            onChange={(e) => setLanguageInput(e.target.value)}
            placeholder="Add a language"
            className="flex-grow px-4 py-2 bg-white/10 border border-white/20 rounded-l-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
            onKeyPress={(e) => e.key === 'Enter' && handleAddLanguage()}
          />
          <button
            type="button"
            onClick={handleAddLanguage}
            className="px-4 py-2 bg-accent text-white rounded-r-md hover:bg-accent/90"
          >
            Add
          </button>
        </div>

        {formData.languages.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.languages.map(language => (
              <div
                key={language}
                className="flex items-center bg-white/10 px-3 py-1 rounded-full"
              >
                <span className="text-white text-sm">{language}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveLanguage(language)}
                  className="ml-2 text-white/60 hover:text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdditionalInfoStep;
