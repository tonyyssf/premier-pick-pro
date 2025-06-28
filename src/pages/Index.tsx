
import React from 'react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { UnifiedHeader } from '../components/UnifiedHeader';
import { GameweekStatusCard } from '../components/GameweekStatusCard';
import { UserPickStatusCard } from '../components/UserPickStatusCard';
import { StatsCards } from '../components/StatsCards';
import { RecentResults } from '../components/RecentResults';
import { BottomNavigation } from '../components/BottomNavigation';

const Index = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-plpe-neutral-900">
        <UnifiedHeader title="PLPE" />
        <GameweekStatusCard />
        <UserPickStatusCard />
        <StatsCards />
        <RecentResults />
        <BottomNavigation />
      </div>
    </ProtectedRoute>
  );
};

export default Index;
