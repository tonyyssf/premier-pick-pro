
import React, { useState } from 'react';
import { FixtureCard } from './FixtureCard';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import { usePicks } from '../contexts/PicksContext';
import { Button } from './ui/button';

export const WeeklyPicks: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedFixture, setSelectedFixture] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { 
    fixtures, 
    currentGameweek, 
    submitPick, 
    getTeamUsedCount, 
    hasPickForGameweek, 
    getCurrentPick, 
    loading, 
    fixturesLoading 
  } = usePicks();

  const currentPick = getCurrentPick();
  const hasAlreadyPicked = currentGameweek ? hasPickForGameweek(currentGameweek.id) : false;

  const handleTeamSelect = (fixtureId: string, teamId: string) => {
    setSelectedFixture(fixtureId);
    setSelectedTeam(teamId);
  };

  const handleSubmitPick = async () => {
    if (selectedFixture && selectedTeam) {
      setSubmitting(true);
      const success = await submitPick(selectedFixture, selectedTeam);
      if (success) {
        setSelectedTeam(null);
        setSelectedFixture(null);
      }
      setSubmitting(false);
    }
  };

  const getSelectedTeamInfo = () => {
    if (!selectedFixture || !selectedTeam) return null;
    
    const fixture = fixtures.find(f => f.id === selectedFixture);
    if (!fixture) return null;
    
    const team = fixture.homeTeam.id === selectedTeam ? fixture.homeTeam : fixture.awayTeam;
    const opponent = fixture.homeTeam.id === selectedTeam ? fixture.awayTeam : fixture.homeTeam;
    const venue = fixture.homeTeam.id === selectedTeam ? 'Home' : 'Away';
    
    return { team, opponent, venue };
  };

  const getCurrentPickInfo = () => {
    if (!currentPick) return null;
    
    const fixture = fixtures.find(f => f.id === currentPick.fixtureId);
    if (!fixture) return null;
    
    const team = fixture.homeTeam.id === currentPick.pickedTeamId ? fixture.homeTeam : fixture.awayTeam;
    const opponent = fixture.homeTeam.id === currentPick.pickedTeamId ? fixture.awayTeam : fixture.homeTeam;
    const venue = fixture.homeTeam.id === currentPick.pickedTeamId ? 'Home' : 'Away';
    
    return { team, opponent, venue, fixture };
  };

  if (loading || fixturesLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-plpe-purple"></div>
          <span className="ml-3 text-gray-600">Loading your picks...</span>
        </div>
      </div>
    );
  }

  if (!currentGameweek) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Active Gameweek</h2>
          <p className="text-gray-600">There's currently no active gameweek to make picks for.</p>
        </div>
      </div>
    );
  }

  if (hasAlreadyPicked && currentPick) {
    const pickInfo = getCurrentPickInfo();
    
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-plpe-purple mb-2">
            <Calendar className="h-5 w-5" />
            <span className="font-semibold">Gameweek {currentGameweek.number}</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Pick</h2>
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Deadline: {currentGameweek.deadline.toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Pick Confirmed</h3>
              <p className="text-gray-600">You've made your pick for this gameweek</p>
            </div>
          </div>
          
          {pickInfo && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">{pickInfo.team.name}</h4>
                  <p className="text-sm text-gray-600">
                    {pickInfo.venue} vs {pickInfo.opponent.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {pickInfo.fixture.kickoffTime.toLocaleDateString('en-GB', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Picked on</p>
                  <p className="text-sm font-medium">
                    {currentPick.timestamp.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-plpe-purple mb-2">
          <Calendar className="h-5 w-5" />
          <span className="font-semibold">Gameweek {currentGameweek.number}</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Make Your Pick</h2>
        <div className="flex items-center space-x-2 text-gray-600">
          <Clock className="h-4 w-4" />
          <span>Deadline: {currentGameweek.deadline.toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
          })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {fixtures.map((fixture) => (
          <FixtureCard
            key={fixture.id}
            fixture={fixture}
            homeTeamUsedCount={getTeamUsedCount(fixture.homeTeam.id)}
            awayTeamUsedCount={getTeamUsedCount(fixture.awayTeam.id)}
            maxUses={2}
            selectedTeam={selectedTeam}
            onTeamSelect={handleTeamSelect}
          />
        ))}
      </div>

      {selectedTeam && selectedFixture && (
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-plpe-purple">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Your Pick</h3>
          {(() => {
            const teamInfo = getSelectedTeamInfo();
            return teamInfo ? (
              <p className="text-gray-600 mb-4">
                You've selected {teamInfo.team.name} to win their {teamInfo.venue.toLowerCase()} match against {teamInfo.opponent.name}.
              </p>
            ) : null;
          })()}
          <div className="flex space-x-4">
            <Button 
              onClick={handleSubmitPick}
              className="bg-plpe-purple hover:bg-purple-700"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Pick'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setSelectedTeam(null);
                setSelectedFixture(null);
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
