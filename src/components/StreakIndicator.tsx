
import React from 'react';

export const StreakIndicator: React.FC = () => {
  // For now, return 5 empty circles since users haven't made picks yet
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="w-3 h-3 rounded-full border border-gray-300 bg-white"
          title="No pick yet"
        />
      ))}
    </div>
  );
};
