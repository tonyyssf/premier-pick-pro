
import React from 'react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { UnifiedHeader } from '../components/UnifiedHeader';
import { PickGameweekCard } from '../components/PickGameweekCard';
import { PickFixturesList } from '../components/PickFixturesList';
import { BottomNavigation } from '../components/BottomNavigation';

const Pick = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900 text-white">
        <UnifiedHeader title="Picks" />
        <PickGameweekCard />
        <PickFixturesList />
        <BottomNavigation />
      </div>
    </ProtectedRoute>
  );
};

export default Pick;
