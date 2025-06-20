
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GameweekScore, UserStanding } from '@/types/picks';

export const useScoresAndStandings = (user: any) => {
  const [gameweekScores, setGameweekScores] = useState<GameweekScore[]>([]);
  const [userStandings, setUserStandings] = useState<UserStanding[]>([]);
  const [scoresLoading, setScoresLoading] = useState(false);

  const loadScoresAndStandings = async () => {
    setScoresLoading(true);
    try {
      // Load gameweek scores
      const { data: scoresData, error: scoresError } = await supabase
        .from('gameweek_scores')
        .select('*')
        .order('created_at', { ascending: false });

      if (scoresError) {
        console.error('Error loading scores:', scoresError);
      } else {
        const formattedScores: GameweekScore[] = scoresData.map(score => ({
          id: score.id,
          userId: score.user_id,
          gameweekId: score.gameweek_id,
          points: score.points,
          isCorrect: score.is_correct,
        }));
        setGameweekScores(formattedScores);
      }

      // Load user standings
      const { data: standingsData, error: standingsError } = await supabase
        .from('user_standings')
        .select('*')
        .order('current_rank', { ascending: true, nullsFirst: false });

      if (standingsError) {
        console.error('Error loading standings:', standingsError);
      } else {
        const formattedStandings: UserStanding[] = standingsData.map(standing => ({
          id: standing.id,
          userId: standing.user_id,
          totalPoints: standing.total_points,
          correctPicks: standing.correct_picks,
          totalPicks: standing.total_picks,
          currentRank: standing.current_rank,
        }));
        setUserStandings(formattedStandings);
      }
    } catch (error) {
      console.error('Error loading scores and standings:', error);
    } finally {
      setScoresLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadScoresAndStandings();
    } else {
      setGameweekScores([]);
      setUserStandings([]);
    }
  }, [user]);

  return {
    gameweekScores,
    userStandings,
    scoresLoading,
    setGameweekScores,
    setUserStandings,
    setScoresLoading,
    loadScoresAndStandings
  };
};
