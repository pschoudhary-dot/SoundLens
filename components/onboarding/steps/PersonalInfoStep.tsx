'use client';

import React, { useState } from 'react';
import { Calendar } from "../../../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import Button from "../../../components/ui/Button";
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../../lib/utils';

// Mock data for countries
const countries = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  // Add more countries as needed
];

interface PersonalInfoStepProps {
  formData: {
    dateOfBirth: string;
    gender: string;
    location: string;
  };
  updateFormData: (data: Partial<PersonalInfoStepProps['formData']>) => void;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({ formData, updateFormData }) => {
  const [date, setDate] = useState<Date | undefined>(
    formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined
  );

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      updateFormData({ dateOfBirth: selectedDate.toISOString().split('T')[0] });
    }
  };

  const handleGenderChange = (value: string) => {
    updateFormData({ gender: value });
  };

  const handleLocationChange = (value: string) => {
    updateFormData({ location: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Tell Us About Yourself</h2>
        <p className="text-white/70 mt-2">
          We'll use this information to personalize your experience
        </p>
      </div>

      {/* Date of Birth with Calendar */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-white/80 mb-2">
          Date of Birth
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal bg-white/10 border-white/20 hover:bg-white/20",
                !date && "text-white/60"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-white/60" />
              {date ? format(date, "PPP") : "Select your date of birth"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateChange}
              initialFocus
              className="bg-gray-800 text-white"
              captionLayout="dropdown"
              fromYear={1940}
              toYear={new Date().getFullYear()}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Gender Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-white/80 mb-2">
          Gender
        </label>
        <Select value={formData.gender} onValueChange={handleGenderChange}>
          <SelectTrigger className="w-full bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Select your gender" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700 text-white">
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="non-binary">Non-binary</SelectItem>
            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Country Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-white/80 mb-2">
          Country
        </label>
        <Select value={formData.location} onValueChange={handleLocationChange}>
          <SelectTrigger className="w-full bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Select your country" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700 text-white max-h-60">
            {countries.map(country => (
              <SelectItem key={country.code} value={country.code}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default PersonalInfoStep;
