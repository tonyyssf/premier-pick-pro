
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

export const WeeklyPicksEmptyState: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-section="weekly-picks">
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Active Gameweek</h2>
          <p className="text-gray-600 mb-6">
            There's currently no active gameweek to make picks for. 
            Check back when the next gameweek opens!
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Page</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
