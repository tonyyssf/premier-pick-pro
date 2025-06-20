
import React from 'react';
import { Layout } from '../components/Layout';
import { HeroSection } from '../components/HeroSection';
import { WeeklyPicks } from '../components/WeeklyPicks';
import { UserScoreDisplay } from '../components/UserScoreDisplay';
import { ProtectedRoute } from '../components/ProtectedRoute';

const Index = () => {
  return (
    <ProtectedRoute>
      <Layout>
        <HeroSection />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <UserScoreDisplay />
        </div>
        <WeeklyPicks />
      </Layout>
    </ProtectedRoute>
  );
};

export default Index;
