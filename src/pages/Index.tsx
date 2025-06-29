
import React from 'react';
import { Layout } from '../components/Layout';
import { WeeklyPicks } from '../components/WeeklyPicks';
import { UserScoreDisplay } from '../components/UserScoreDisplay';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { UserPickHistory } from '../components/UserPickHistory';

const Index = () => {
  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6 sm:space-y-8">
          {/* User score - mobile optimized */}
          <div className="pt-4 sm:pt-6">
            <UserScoreDisplay />
          </div>
          
          {/* Weekly picks */}
          <WeeklyPicks />
          
          {/* Pick history */}
          <div className="pb-4 sm:pb-8">
            <UserPickHistory />
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Index;
