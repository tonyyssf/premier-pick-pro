
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Lock } from 'lucide-react';
import { usePicks } from '../contexts/PicksContext';
import { WeeklyPicksHeader } from './WeeklyPicksHeader';
import { WeeklyPicksLoadingState } from './WeeklyPicksLoadingState';
import { WeeklyPicksEmptyState } from './WeeklyPicksEmptyState';
import { FixtureListItem } from './FixtureListItem';
import { useNavigate } from 'react-router-dom';

export const GuestWeeklyPicks: React.FC = () => {
  const navigate = useNavigate();
  const { 
    fixtures, 
    currentGameweek,
    viewingGameweek,
    loading, 
    fixturesLoading,
    navigation
  } = usePicks();

  const gameweekToUse = viewingGameweek || currentGameweek;

  // Loading state
  if (loading || fixturesLoading) {
    return <WeeklyPicksLoadingState />;
  }

  // No gameweek state
  if (!currentGameweek || !gameweekToUse) {
    return <WeeklyPicksEmptyState />;
  }

  const handleAuthPrompt = () => {
    navigate('/auth');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6" data-section="weekly-picks">
      <WeeklyPicksHeader 
        currentGameweek={currentGameweek}
        viewingGameweek={gameweekToUse}
        hasAlreadyPicked={false}
        onNavigate={navigation?.navigateToGameweek}
        canNavigatePrev={navigation?.canNavigatePrev}
        canNavigateNext={navigation?.canNavigateNext}
        isNavigating={navigation?.isNavigating}
      />

      {/* Guest authentication prompt */}
      <Card className="mb-6 border-2 border-dashed border-plpe-purple/30 bg-purple-50">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-plpe-purple mr-2" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Sign In to Make Your Picks
          </h3>
          <p className="text-gray-600 mb-4">
            Browse fixtures below, then sign in to start making your weekly predictions and compete with others.
          </p>
          <Button 
            onClick={handleAuthPrompt}
            className="bg-plpe-purple hover:bg-plpe-purple/90 text-white px-6 py-2"
          >
            Sign In to Play
          </Button>
        </CardContent>
      </Card>

      {/* Show fixtures in read-only mode */}
      {fixtures.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="p-8 text-center">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Fixtures Available</h3>
            <p className="text-gray-600">
              Fixtures for Gameweek {gameweekToUse.number} haven't been scheduled yet.
              Check back later!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="mb-4">
          {fixtures.map((fixture) => (
            <FixtureListItem
              key={fixture.id}
              fixture={fixture}
              homeTeamUsedCount={0}
              awayTeamUsedCount={0}
              maxUses={2}
              selectedTeam={null}
              onTeamSelect={async () => handleAuthPrompt()}
              submitting={false}
              disabled={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};
