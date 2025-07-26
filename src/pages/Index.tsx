
import React from 'react';
import { Layout } from '../components/Layout';
import { WeeklyPicks } from '../components/WeeklyPicks';
import { UserScoreDisplay } from '../components/UserScoreDisplay';
import { UserPickHistory } from '../components/UserPickHistory';
import { HowItWorksButton } from '../components/HowItWorksButton';
import { OnboardingFlow } from '../components/onboarding/OnboardingFlow';

const Index = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Make Your Picks</h1>
          <HowItWorksButton />
        </div>
        <OnboardingFlow />
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
