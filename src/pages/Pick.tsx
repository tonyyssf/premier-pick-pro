
import React from 'react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { PickHeader } from '../components/PickHeader';
import { PickGameweekCard } from '../components/PickGameweekCard';
import { PickFixturesList } from '../components/PickFixturesList';
import { BottomNavigation } from '../components/BottomNavigation';

const Pick = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white text-gray-900">
        <PickHeader />
        <PickGameweekCard />
        <PickFixturesList />
        <BottomNavigation />
      </div>
    </ProtectedRoute>
  );
};

export default Pick;
