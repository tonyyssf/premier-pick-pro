
import React from 'react';
import { Clock } from 'lucide-react';
import { FixtureCard } from './FixtureCard';
import { Card, CardContent } from './ui/card';
import { Fixture } from '@/types/picks';

interface WeeklyPicksFixtureListProps {
  fixtures: Fixture[];
  getTeamUsedCount: (teamId: string) => number;
  onTeamSelect: (fixtureId: string, teamId: string) => Promise<void>;
  submitting: boolean;
  gameweekNumber: number;
  disabled?: boolean;
}

export const WeeklyPicksFixtureList: React.FC<WeeklyPicksFixtureListProps> = ({
  fixtures,
  getTeamUsedCount,
  onTeamSelect,
  submitting,
  gameweekNumber,
  disabled = false
}) => {
  if (fixtures.length === 0) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-8 text-center">
          <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Fixtures Available</h3>
          <p className="text-gray-600">
            Fixtures for Gameweek {gameweekNumber} haven't been scheduled yet.
            Check back later!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group fixtures by date for better organization
  const fixturesByDate = fixtures.reduce((acc, fixture) => {
    const date = fixture.kickoffTime.toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(fixture);
    return acc;
  }, {} as Record<string, Fixture[]>);

  const sortedDates = Object.keys(fixturesByDate).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedDates.map(date => (
        <div key={date}>
          <div className="mb-2 px-2">
            <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide text-center">
              {new Date(date).toLocaleDateString('en-GB', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </h3>
          </div>
          <div className="space-y-2">
            {fixturesByDate[date].map((fixture) => (
              <FixtureCard
                key={fixture.id}
                fixture={fixture}
                homeTeamUsedCount={getTeamUsedCount(fixture.homeTeam.id)}
                awayTeamUsedCount={getTeamUsedCount(fixture.awayTeam.id)}
                maxUses={2}
                selectedTeam={null}
                onTeamSelect={disabled ? async () => {} : onTeamSelect}
                submitting={submitting}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
