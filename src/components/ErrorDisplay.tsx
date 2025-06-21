
import React from 'react';

interface ErrorDisplayProps {
  errors: Record<string, string>;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ errors }) => {
  if (!errors.general) return null;

  return (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
      <p className="text-sm text-red-600">{errors.general}</p>
    </div>
  );
};
