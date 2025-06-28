
import React from 'react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { HomeHeader } from '../components/HomeHeader';
import { GameweekStatusCard } from '../components/GameweekStatusCard';
import { UserPickStatusCard } from '../components/UserPickStatusCard';
import { StatsCards } from '../components/StatsCards';
import { RecentResults } from '../components/RecentResults';
import { FriendsLeaderboard } from '../components/FriendsLeaderboard';
import { WeeklyPicks } from '../components/WeeklyPicks';
import { BottomNavigation } from '../components/BottomNavigation';

const Index = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900">
        <HomeHeader />
        <GameweekStatusCard />
        <UserPickStatusCard />
        <StatsCards />
        <RecentResults />
        <FriendsLeaderboard />
        
        {/* Weekly Picks Section - Hidden by default, shown when user clicks Make Pick */}
        <div className="mt-8">
          <WeeklyPicks />
        </div>
        
        <BottomNavigation />
      </div>
    </ProtectedRoute>
  );
};

export default Index;
