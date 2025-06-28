
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthHeader } from '@/components/AuthHeader';
import { AuthTabs } from '@/components/AuthTabs';

const Auth = () => {
  console.log('Auth component rendered');
  
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      console.log('Auth - User detected, redirecting to /');
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <AuthHeader />

        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one to start picking winners!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthTabs
              rememberMe={rememberMe}
              onRememberMeChange={setRememberMe}
              loading={loading}
              onLoadingChange={setLoading}
              errors={errors}
              onErrorsChange={setErrors}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
