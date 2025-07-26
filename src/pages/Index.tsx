
import React from 'react';
import { Layout } from '../components/Layout';
import { WeeklyPicks } from '../components/WeeklyPicks';
import { UserScoreDisplay } from '../components/UserScoreDisplay';
import { UserPickHistory } from '../components/UserPickHistory';
import { HowItWorksButton } from '../components/HowItWorksButton';
import { OnboardingFlow } from '../components/onboarding/OnboardingFlow';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-4xl font-bold mb-4">Welcome to PLPE</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of football fans making weekly picks and climbing the leaderboards!
            </p>
            <div className="space-y-4">
              <Link to="/auth">
                <Button size="lg" className="w-full">
                  Sign In / Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

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
