
import React from 'react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { UnifiedHeader } from '../components/UnifiedHeader';
import { UserPickHistory } from '../components/UserPickHistory';
import { BottomNavigation } from '../components/BottomNavigation';

const History = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900">
        <UnifiedHeader title="Pick History" />
        
        <div className="pb-20">
          <UserPickHistory />
        </div>
        
        <BottomNavigation />
      </div>
    </ProtectedRoute>
  );
};

export default History;
