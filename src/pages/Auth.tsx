import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { validateAndSanitizeUser } from '@/utils/validation';
import { z } from 'zod';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Check if user previously selected remember me
  useEffect(() => {
    const storedRememberMe = localStorage.getItem('plpe_remember_me');
    if (storedRememberMe === 'true') {
      setRememberMe(true);
    }
  }, []);

  const validateSignUpForm = () => {
    try {
      validateAndSanitizeUser({ username, name });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    if (!email || !password) {
      setErrors({ general: 'Please fill in all fields' });
      setLoading(false);
      return;
    }
    
    await signIn(email, password, rememberMe);
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    if (!email || !password || !username || !name) {
      setErrors({ general: 'Please fill in all fields' });
      setLoading(false);
      return;
    }

    if (!validateSignUpForm()) {
      setLoading(false);
      return;
    }

    try {
      const sanitizedData = validateAndSanitizeUser({ username, name });
      await signUp(email, password, sanitizedData);
    } catch (error) {
      console.error('Sign up error:', error);
    }
    
    setLoading(false);
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
    }
    
    // Clear error when user starts typing
    if (errors[field] || errors.general) {
      setErrors({ ...errors, [field]: '', general: '' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Premier League Pick'em
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to make your weekly picks
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one to start picking winners!
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}
            
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
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
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
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
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
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
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Create a password"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-plpe-purple hover:bg-purple-700"
                    disabled={loading}
                  >
                    {loading ? 'Creating account...' : 'Sign Up'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
