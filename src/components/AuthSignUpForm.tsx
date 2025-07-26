
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

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
  const { signUp } = useAuth();

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
    
    if (!email || !password || !username) {
      onErrorsChange({ general: 'Please fill in all required fields' });
      onLoadingChange(false);
      return;
    }

    try {
      await signUp(email, password);
    } catch (error) {
      console.error('Sign up error:', error);
    }
    
    onLoadingChange(false);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
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
        <div className="space-y-2">
          <Label htmlFor="signup-username">Username</Label>
          <Input
            id="signup-username"
            type="text"
            value={username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            placeholder="Choose a unique username"
            required
            className={errors.username ? 'border-red-500' : ''}
          />
          <p className="text-xs text-gray-500">
            3-20 characters, letters, numbers, hyphens, and underscores only
          </p>
          {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
        </div>
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
    </div>
  );
};
