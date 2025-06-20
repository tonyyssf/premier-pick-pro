
import React from 'react';
import { Layout } from '../components/Layout';
import { HeroSection } from '../components/HeroSection';
import { WeeklyPicks } from '../components/WeeklyPicks';
import { LeaderboardSection } from '../components/LeaderboardSection';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <WeeklyPicks />
      <LeaderboardSection />
    </Layout>
  );
};

export default Index;
