
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrophyIcon, UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const GuestUserScoreDisplay: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    // If user is authenticated, don't render anything - let the original component handle it
    return null;
  }

  return (
    <Card className="mb-6 border-2 border-dashed border-gray-300 bg-gray-50">
      <CardContent className="p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <TrophyIcon className="h-8 w-8 text-gray-400 mr-2" />
          <UserIcon className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Track Your Performance
        </h3>
        <p className="text-gray-600 mb-4">
          Sign in to see your scores, rankings, and compete with friends in leagues.
        </p>
        <Button 
          onClick={() => navigate('/auth')}
          className="bg-plpe-purple hover:bg-plpe-purple/90 text-white px-6 py-2"
        >
          Sign In to Get Started
        </Button>
      </CardContent>
    </Card>
  );
};
