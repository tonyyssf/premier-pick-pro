
import React from 'react';
import { Clock } from 'lucide-react';
import { FixtureListItem } from './FixtureListItem';
import { Card, CardContent } from './ui/card';
import { Fixture } from '@/types/picks';

interface WeeklyPicksFixtureListProps {
  fixtures: Fixture[];
  getTeamUsedCount: (teamId: string) => number;
  onTeamSelect: (fixtureId: string, teamId: string) => Promise<void>;
  submitting: boolean;
  gameweekNumber: number;
}

export const WeeklyPicksFixtureList: React.FC<WeeklyPicksFixtureListProps> = ({
  fixtures,
  getTeamUsedCount,
  onTeamSelect,
  submitting,
  gameweekNumber
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

  return (
    <div className="mb-8">
      {fixtures.map((fixture) => (
        <FixtureListItem
          key={fixture.id}
          fixture={fixture}
          homeTeamUsedCount={getTeamUsedCount(fixture.homeTeam.id)}
          awayTeamUsedCount={getTeamUsedCount(fixture.awayTeam.id)}
          maxUses={2}
          selectedTeam={null}
          onTeamSelect={onTeamSelect}
          submitting={submitting}
        />
      ))}
    </div>
  );
};
