
import React from 'react';
import { Layout } from '../components/Layout';
import { HeroSection } from '../components/HeroSection';
import { WeeklyPicks } from '../components/WeeklyPicks';
import { LeaderboardSection } from '../components/LeaderboardSection';
import { ProtectedRoute } from '../components/ProtectedRoute';

const Index = () => {
  return (
    <ProtectedRoute>
      <Layout>
        <HeroSection />
        <WeeklyPicks />
        <LeaderboardSection />
      </Layout>
    </ProtectedRoute>
  );
};

export default Index;
