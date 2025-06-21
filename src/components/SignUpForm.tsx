
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PhoneNumberInput } from '@/components/PhoneNumberInput';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Mail, Lock, User, Phone } from 'lucide-react';

interface SignUpFormProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ 
  onSuccess, 
  onSwitchToSignIn 
}) => {
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    name: '',
    phone_number: '',
    country_code: '+1',
    sms_reminders_enabled: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    setLoading(true);
    
    const { error } = await signUp(formData.email, formData.password, {
      username: formData.username,
      name: formData.name,
      phone_number: formData.phone_number
    });

    setLoading(false);
    
    if (!error && onSuccess) {
      onSuccess();
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="pl-10"
            placeholder="Enter your email"
            required
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="username">Username</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            className="pl-10"
            placeholder="Choose a username"
            required
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="name">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="pl-10"
            placeholder="Enter your full name"
            required
          />
        </div>
      </div>

      <PhoneNumberInput
        value={formData.phone_number}
        onChange={(value) => handleInputChange('phone_number', value)}
        countryCode={formData.country_code}
        onCountryCodeChange={(code) => handleInputChange('country_code', code)}
        placeholder="(555) 123-4567"
      />

      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="pl-10"
            placeholder="Enter your password"
            required
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className="pl-10"
            placeholder="Confirm your password"
            required
          />
        </div>
        {formData.password !== formData.confirmPassword && formData.confirmPassword && (
          <p className="text-sm text-red-500">Passwords do not match</p>
        )}
      </div>

      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div className="flex items-center space-x-3">
          <Phone className="h-4 w-4 text-gray-500" />
          <div>
            <Label htmlFor="sms-signup" className="font-medium">SMS Reminders</Label>
            <p className="text-xs text-gray-500">Get notified before pick deadlines</p>
          </div>
        </div>
        <Switch
          id="sms-signup"
          checked={formData.sms_reminders_enabled}
          onCheckedChange={(checked) => handleInputChange('sms_reminders_enabled', checked)}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={loading || formData.password !== formData.confirmPassword}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Sign Up
      </Button>

      {onSwitchToSignIn && (
        <div className="text-center">
          <Button
            type="button"
            variant="link"
            onClick={onSwitchToSignIn}
            className="text-sm"
          >
            Already have an account? Sign In
          </Button>
        </div>
      )}
    </form>
  );
};
