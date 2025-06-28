
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { WeeklyPicks } from '../components/WeeklyPicks';
import { UserScoreDisplay } from '../components/UserScoreDisplay';
import { UserPickHistory } from '../components/UserPickHistory';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/how-to-play', { replace: true });
    }
  }, [user, navigate]);

  // If user is not authenticated, don't render anything (navigation will handle redirect)
  if (!user) {
    return null;
  }

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
