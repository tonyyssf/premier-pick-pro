
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneNumberInput } from '@/components/PhoneNumberInput';
import { useAuth } from '@/contexts/AuthContext';
import { validateAndSanitizeUser } from '@/utils/validation';
import { z } from 'zod';

interface AuthSignUpFormProps {
  loading: boolean;
  onLoadingChange: (loading: boolean) => void;
  errors: Record<string, string>;
  onErrorsChange: (errors: Record<string, string>) => void;
}

export const AuthSignUpForm: React.FC<AuthSignUpFormProps> = ({
  loading,
  onLoadingChange,
  errors,
  onErrorsChange
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const { signUp } = useAuth();

  const validateSignUpForm = () => {
    try {
      validateAndSanitizeUser({ username, name });
      onErrorsChange({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        onErrorsChange(newErrors);
      }
      return false;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    switch (field) {
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'username':
        setUsername(value);
        break;
      case 'name':
        setName(value);
        break;
      case 'phoneNumber':
        setPhoneNumber(value);
        break;
      case 'countryCode':
        setCountryCode(value);
        break;
    }
    
    // Clear error when user starts typing
    if (errors[field] || errors.general) {
      onErrorsChange({ ...errors, [field]: '', general: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onLoadingChange(true);
    onErrorsChange({});
    
    if (!email || !password || !username || !name) {
      onErrorsChange({ general: 'Please fill in all required fields' });
      onLoadingChange(false);
      return;
    }

    if (!validateSignUpForm()) {
      onLoadingChange(false);
      return;
    }

    try {
      const sanitizedData = validateAndSanitizeUser({ username, name });
      await signUp(email, password, {
        ...sanitizedData,
        phone_number: phoneNumber
      });
    } catch (error) {
      console.error('Sign up error:', error);
    }
    
    onLoadingChange(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-name">Full Name</Label>
        <Input
          id="signup-name"
          type="text"
          value={name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter your full name"
          required
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-username">Username</Label>
        <Input
          id="signup-username"
          type="text"
          value={username}
          onChange={(e) => handleInputChange('username', e.target.value)}
          placeholder="Choose a username"
          required
          className={errors.username ? 'border-red-500' : ''}
        />
        {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="user@example.com"
          required
          className={errors.email ? 'border-red-500' : ''}
        />
        <p className="text-xs text-gray-500">
          Please use a valid email format like user@example.com
        </p>
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>
      <PhoneNumberInput
        value={phoneNumber}
        onChange={(value) => handleInputChange('phoneNumber', value)}
        countryCode={countryCode}
        onCountryCodeChange={(code) => handleInputChange('countryCode', code)}
        label="Phone Number (Optional)"
        placeholder="(555) 123-4567"
        required={false}
      />
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          placeholder="Create a secure password"
          required
        />
        <p className="text-xs text-gray-500">
          Must be at least 8 characters with uppercase, lowercase, number, and special character
        </p>
      </div>
      <Button 
        type="submit" 
        className="w-full bg-plpe-purple hover:bg-purple-700"
        disabled={loading}
      >
        {loading ? 'Creating account...' : 'Sign Up'}
      </Button>
    </form>
  );
};
