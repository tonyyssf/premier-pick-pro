
import React from 'react';

export const EmptyStandings: React.FC = () => {
  return (
    <div className="text-center py-8">
      <p className="text-gray-600">No league members found.</p>
      <p className="text-sm text-gray-500 mt-2">
        Invite friends to join your league to see standings!
      </p>
    </div>
  );
};
