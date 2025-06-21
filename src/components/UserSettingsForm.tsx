
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Phone } from 'lucide-react';
import { PhoneNumberInput } from './PhoneNumberInput';

interface FormData {
  username: string;
  name: string;
  email: string;
  phone_number: string;
  country_code: string;
  sms_reminders_enabled: boolean;
}

interface UserSettingsFormProps {
  formData: FormData;
  errors: Record<string, string>;
  loading: boolean;
  onInputChange: (field: string, value: string | boolean) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const UserSettingsForm: React.FC<UserSettingsFormProps> = ({
  formData,
  errors,
  loading,
  onInputChange,
  onSave,
  onCancel
}) => {
  return (
    <>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            disabled
            className="bg-gray-50"
          />
          <p className="text-xs text-gray-500">Email cannot be changed</p>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="username">
            Username
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => onInputChange('username', e.target.value)}
            placeholder="Enter username"
            className={errors.username ? 'border-red-500' : ''}
          />
          {errors.username && (
            <p className="text-xs text-red-500">{errors.username}</p>
          )}
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="name">
            Name
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            placeholder="Enter your full name"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name}</p>
          )}
        </div>

        <PhoneNumberInput
          value={formData.phone_number}
          onChange={(value) => onInputChange('phone_number', value)}
          countryCode={formData.country_code}
          onCountryCodeChange={(code) => onInputChange('country_code', code)}
          label="Phone Number (Optional)"
          placeholder="(555) 123-4567"
        />
        {errors.phone_number && (
          <p className="text-xs text-red-500">{errors.phone_number}</p>
        )}

        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            <Phone className="h-4 w-4 text-gray-500" />
            <div>
              <Label htmlFor="sms-reminders" className="font-medium">SMS Reminders</Label>
              <p className="text-xs text-gray-500">Get notified before pick deadlines</p>
            </div>
          </div>
          <Switch
            id="sms-reminders"
            checked={formData.sms_reminders_enabled}
            onCheckedChange={(checked) => onInputChange('sms_reminders_enabled', checked)}
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          onClick={onSave}
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </>
  );
};
