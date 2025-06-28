
import React from 'react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { UserPickHistory } from '../components/UserPickHistory';
import { BottomNavigation } from '../components/BottomNavigation';

const History = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Pick History</h1>
        </div>
        
        <div className="pb-20">
          <UserPickHistory />
        </div>
        
        <BottomNavigation />
      </div>
    </ProtectedRoute>
  );
};

export default History;
