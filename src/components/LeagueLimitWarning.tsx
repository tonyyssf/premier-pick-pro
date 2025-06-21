
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface LeagueLimitWarningProps {
  maxLeagues: number;
  onClose: () => void;
}

export const LeagueLimitWarning: React.FC<LeagueLimitWarningProps> = ({
  maxLeagues,
  onClose
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-red-900">League Limit Reached</h3>
          <p className="text-sm text-red-700 mt-1">
            You've reached the maximum limit of {maxLeagues} leagues. Please delete an existing league to create a new one.
          </p>
        </div>
      </div>
      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};
