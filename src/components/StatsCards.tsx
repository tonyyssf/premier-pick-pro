
import React from 'react';
import { usePicks } from '../contexts/PicksContext';
import { useAuth } from '../contexts/AuthContext';

export const StatsCards: React.FC = () => {
  const { userStandings, picks } = usePicks();
  const { user } = useAuth();

  if (!user) return null;

  const userStanding = userStandings.find(standing => standing.userId === user.id);
  const displayPoints = userStanding?.totalPoints || 0;
  const displayRank = userStanding?.currentRank || null;
  
  // Calculate teams used (max 2 times each)
  const teamUsageCounts = picks.reduce((acc, pick) => {
    acc[pick.pickedTeamId] = (acc[pick.pickedTeamId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const teamsUsedTwice = Object.values(teamUsageCounts).filter(count => count >= 2).length;
  const teamsLeft = 20 - teamsUsedTwice; // Assume 20 Premier League teams

  return (
    <div className="mx-4 mt-4 grid grid-cols-3 gap-3">
      <div className="bg-plpe-neutral-700 rounded-lg p-4 text-center text-plpe-white">
        <div className="text-plpe-light-gray text-sm mb-1">Total Points</div>
        <div className="text-2xl font-bold">{displayPoints}</div>
      </div>
      
      <div className="bg-plpe-neutral-700 rounded-lg p-4 text-center text-plpe-white">
        <div className="text-plpe-light-gray text-sm mb-1">Rank</div>
        <div className="text-2xl font-bold">
          {displayRank ? `#${displayRank}` : '-'}
        </div>
      </div>
      
      <div className="bg-plpe-neutral-700 rounded-lg p-4 text-center text-plpe-white">
        <div className="text-plpe-light-gray text-sm mb-1">Teams Left</div>
        <div className="text-2xl font-bold">{teamsLeft}</div>
      </div>
    </div>
  );
};
