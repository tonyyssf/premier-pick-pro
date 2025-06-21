
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value,
  onChange,
  countryCode,
  onCountryCodeChange,
  label = "Phone Number",
  placeholder = "(555) 123-4567",
  required = false
}) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="phone-input">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="flex gap-2">
        <Input
          value={countryCode}
          onChange={(e) => onCountryCodeChange(e.target.value)}
          className="w-20"
          placeholder="+1"
        />
        <Input
          id="phone-input"
          type="tel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
          required={required}
        />
      </div>
      <p className="text-xs text-gray-500">
        Used for SMS reminders about upcoming pick deadlines
      </p>
    </div>
  );
};
