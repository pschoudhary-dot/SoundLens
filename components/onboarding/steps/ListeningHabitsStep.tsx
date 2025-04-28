'use client';

import React from 'react';

interface ListeningHabitsStepProps {
  formData: {
    listenHoursPerDay: string;
    likesMorningListening: boolean;
    likesEveningListening: boolean;
    listensDuringWorkout: boolean;
    listensDuringWork: boolean;
    listensDuringCommute: boolean;
  };
  updateFormData: (data: Partial<typeof formData>) => void;
}

const ListeningHabitsStep: React.FC<ListeningHabitsStepProps> = ({ formData, updateFormData }) => {
  const handleHoursChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFormData({ listenHoursPerDay: e.target.value });
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    updateFormData({ [name]: checked });
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Your Listening Habits</h2>
        <p className="text-white/60 mt-2">
          Tell us when and how you listen to music
        </p>
      </div>
      
      <div className="mb-6">
        <label htmlFor="listenHoursPerDay" className="block text-sm font-medium text-white/80 mb-1">
          How many hours do you listen to music per day?
        </label>
        <select
          id="listenHoursPerDay"
          name="listenHoursPerDay"
          value={formData.listenHoursPerDay}
          onChange={handleHoursChange}
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="" disabled>Select hours</option>
          <option value="less-than-1">Less than 1 hour</option>
          <option value="1-2">1-2 hours</option>
          <option value="3-4">3-4 hours</option>
          <option value="5-6">5-6 hours</option>
          <option value="more-than-6">More than 6 hours</option>
        </select>
      </div>
      
      <div className="mb-6">
        <p className="block text-sm font-medium text-white/80 mb-3">
          When do you usually listen to music? (Select all that apply)
        </p>
        
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="likesMorningListening"
              checked={formData.likesMorningListening}
              onChange={handleCheckboxChange}
              className="w-5 h-5 rounded bg-white/10 border-white/20 text-accent focus:ring-accent focus:ring-offset-0"
            />
            <span className="ml-3 text-white">Morning</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              name="likesEveningListening"
              checked={formData.likesEveningListening}
              onChange={handleCheckboxChange}
              className="w-5 h-5 rounded bg-white/10 border-white/20 text-accent focus:ring-accent focus:ring-offset-0"
            />
            <span className="ml-3 text-white">Evening</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              name="listensDuringWorkout"
              checked={formData.listensDuringWorkout}
              onChange={handleCheckboxChange}
              className="w-5 h-5 rounded bg-white/10 border-white/20 text-accent focus:ring-accent focus:ring-offset-0"
            />
            <span className="ml-3 text-white">During workouts</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              name="listensDuringWork"
              checked={formData.listensDuringWork}
              onChange={handleCheckboxChange}
              className="w-5 h-5 rounded bg-white/10 border-white/20 text-accent focus:ring-accent focus:ring-offset-0"
            />
            <span className="ml-3 text-white">While working/studying</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              name="listensDuringCommute"
              checked={formData.listensDuringCommute}
              onChange={handleCheckboxChange}
              className="w-5 h-5 rounded bg-white/10 border-white/20 text-accent focus:ring-accent focus:ring-offset-0"
            />
            <span className="ml-3 text-white">During commute</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ListeningHabitsStep;
