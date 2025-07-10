
import React from 'react';

export const WeeklyPicksLoadingState: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-section="weekly-picks">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-plpe-purple"></div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading your picks...</h3>
          <p className="text-gray-600">Please wait while we fetch the latest data</p>
        </div>
      </div>
    </div>
  );
};
