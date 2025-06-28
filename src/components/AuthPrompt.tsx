
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface AuthPromptProps {
  title?: string;
  description?: string;
  feature?: string;
}

export const AuthPrompt: React.FC<AuthPromptProps> = ({ 
  title = "Sign In Required",
  description = "You need to create an account to access this feature.",
  feature = "this feature"
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-plpe-purple rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            {title}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => navigate('/auth')}
            className="w-full bg-plpe-purple hover:bg-plpe-purple/90 text-white"
          >
            <User className="h-4 w-4 mr-2" />
            Sign Up / Sign In
          </Button>
          
          <div className="text-center">
            <button 
              onClick={() => navigate('/how-to-play')}
              className="text-sm text-gray-500 hover:text-plpe-purple transition-colors"
            >
              Learn more about how it works
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
