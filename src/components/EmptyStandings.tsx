
import React from 'react';

export const EmptyStandings: React.FC = () => {
  return (
    <div className="text-center py-8">
      <p className="text-gray-600">No standings available yet.</p>
      <p className="text-sm text-gray-500 mt-2">
        Standings will appear once members make picks and gameweeks are completed.
      </p>
    </div>
  );
};
