
import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface WeeklyPicksMessagesProps {
  successMessage: string | null;
  lastError: string | null;
  onDismissError: () => void;
}

export const WeeklyPicksMessages: React.FC<WeeklyPicksMessagesProps> = ({
  successMessage,
  lastError,
  onDismissError
}) => {
  return (
    <>
      {/* Success Message */}
      {successMessage && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-green-800 font-medium">{successMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {lastError && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-red-800 font-medium">Unable to process your pick</p>
                  <p className="text-red-700 text-sm">{lastError}</p>
                </div>
              </div>
              <Button 
                onClick={onDismissError}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-800"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
