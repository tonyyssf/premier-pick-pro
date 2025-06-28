
import React from 'react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { WeeklyPicks } from '../components/WeeklyPicks';
import { BottomNavigation } from '../components/BottomNavigation';

const Pick = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900">
        <div className="p-4">
          <h1 className="text-xl font-bold text-white mb-6">Make Your Pick</h1>
        </div>
        
        <WeeklyPicks />
        
        <BottomNavigation />
      </div>
    </ProtectedRoute>
  );
};

export default Pick;
