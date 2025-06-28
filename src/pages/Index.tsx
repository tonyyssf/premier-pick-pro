
import React from 'react';
import { Layout } from '../components/Layout';
import { WeeklyPicks } from '../components/WeeklyPicks';
import { UserScoreDisplay } from '../components/UserScoreDisplay';
import { UserPickHistory } from '../components/UserPickHistory';

const Index = () => {
  console.log('Index component rendered');
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserScoreDisplay />
      </div>
      <WeeklyPicks />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserPickHistory />
      </div>
    </Layout>
  );
};

export default Index;
