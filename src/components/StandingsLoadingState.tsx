
import React from 'react';

export const StandingsLoadingState: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-plpe-purple"></div>
      <span className="ml-3 text-gray-600">Loading standings...</span>
    </div>
  );
};
