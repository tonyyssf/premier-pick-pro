
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SignInForm } from './SignInForm';
import { AuthSignUpForm } from './AuthSignUpForm';
import { ErrorDisplay } from './ErrorDisplay';

interface AuthTabsProps {
  rememberMe: boolean;
  onRememberMeChange: (checked: boolean) => void;
  loading: boolean;
  onLoadingChange: (loading: boolean) => void;
  errors: Record<string, string>;
  onErrorsChange: (errors: Record<string, string>) => void;
}

export const AuthTabs: React.FC<AuthTabsProps> = ({
  rememberMe,
  onRememberMeChange,
  loading,
  onLoadingChange,
  errors,
  onErrorsChange
}) => {
  return (
    <>
      <ErrorDisplay errors={errors} />
      
      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        
        <TabsContent value="signin">
          <SignInForm
            rememberMe={rememberMe}
            onRememberMeChange={onRememberMeChange}
            loading={loading}
            onLoadingChange={onLoadingChange}
            errors={errors}
            onErrorsChange={onErrorsChange}
          />
        </TabsContent>
        
        <TabsContent value="signup">
          <AuthSignUpForm
            loading={loading}
            onLoadingChange={onLoadingChange}
            errors={errors}
            onErrorsChange={onErrorsChange}
          />
        </TabsContent>
      </Tabs>
    </>
  );
};
