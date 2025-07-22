
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const GuestUserPickHistory: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <History className="h-5 w-5 text-plpe-purple" />
          <span>Your Pick History</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="flex items-center justify-center mb-4">
            <Lock className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Track Your Prediction History
          </h3>
          <p className="text-gray-600 mb-4">
            Sign in to view your past picks, see your success rate, and track your performance over time.
          </p>
          <Button 
            onClick={() => navigate('/auth')}
            variant="outline"
            className="border-plpe-purple text-plpe-purple hover:bg-plpe-purple hover:text-white"
          >
            Sign In to View History
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
