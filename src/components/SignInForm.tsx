
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleSignInButton } from './GoogleSignInButton';
import { AuthDivider } from './AuthDivider';

interface SignInFormProps {
  rememberMe: boolean;
  onRememberMeChange: (checked: boolean) => void;
  loading: boolean;
  onLoadingChange: (loading: boolean) => void;
  errors: Record<string, string>;
  onErrorsChange: (errors: Record<string, string>) => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({
  rememberMe,
  onRememberMeChange,
  loading,
  onLoadingChange,
  errors,
  onErrorsChange
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    
    // Clear error when user starts typing
    if (errors[field] || errors.general) {
      onErrorsChange({ ...errors, [field]: '', general: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onLoadingChange(true);
    onErrorsChange({});
    
    if (!email || !password) {
      onErrorsChange({ general: 'Please fill in all fields' });
      onLoadingChange(false);
      return;
    }
    
    await signIn(email, password, rememberMe);
    onLoadingChange(false);
  };

  return (
    <div className="space-y-4">
      <GoogleSignInButton
        loading={loading}
        onLoadingChange={onLoadingChange}
        isSignUp={false}
      />
      
      <AuthDivider />
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signin-email">Email</Label>
          <Input
            id="signin-email"
            type="email"
            value={email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signin-password">Password</Label>
          <Input
            id="signin-password"
            type="password"
            value={password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="remember-me"
            checked={rememberMe}
            onCheckedChange={(checked) => onRememberMeChange(checked as boolean)}
          />
          <Label 
            htmlFor="remember-me" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Remember me for longer sessions
          </Label>
        </div>
        <Button 
          type="submit" 
          className="w-full bg-plpe-purple hover:bg-purple-700"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </div>
  );
};
