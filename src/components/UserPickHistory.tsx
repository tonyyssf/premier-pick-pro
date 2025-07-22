
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, Calendar, Check, X, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { GuestUserPickHistory } from './GuestUserPickHistory';

interface PickHistoryItem {
  id: string;
  gameweek_number: number;
  home_team_name: string;
  away_team_name: string;
  picked_team_name: string;
  points: number;
  is_correct: boolean;
  fixture_date: string;
}

export const UserPickHistory: React.FC = () => {
  const { user } = useAuth();
  const [pickHistory, setPickHistory] = useState<PickHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Show guest version if not authenticated
  if (!user) {
    return <GuestUserPickHistory />;
  }

  useEffect(() => {
    const fetchPickHistory = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Query to get user's pick history with game details
        const { data, error } = await supabase
          .from('user_picks')
          .select(`
            id,
            gameweek_id,
            picked_team_id,
            gameweeks!inner(number),
            gameweek_scores(points, is_correct)
          `)
          .eq('user_id', user.id)
          .order('gameweeks(number)', { ascending: false });

        if (error) {
          console.error('Error fetching pick history:', error);
          return;
        }

        // Process the data to create the history items
        const historyItems: PickHistoryItem[] = [];
        
        for (const pick of data || []) {
          // Get fixture details using the app fixtures function
          const { data: fixtureData } = await supabase
            .rpc('get_app_fixtures_for_gameweek', { gw_id: pick.gameweek_id });
            
          const fixture = fixtureData?.find((f: any) => 
            f.home_team_id === pick.picked_team_id || f.away_team_id === pick.picked_team_id
          );
          
          if (fixture) {
            const pickedTeamName = fixture.home_team_id === pick.picked_team_id 
              ? fixture.home_team_name 
              : fixture.away_team_name;
              
            const score = pick.gameweek_scores?.[0];
            
            historyItems.push({
              id: pick.id,
              gameweek_number: (pick.gameweeks as any).number,
              home_team_name: fixture.home_team_name,
              away_team_name: fixture.away_team_name,
              picked_team_name: pickedTeamName,
              points: score?.points || 0,
              is_correct: score?.is_correct || false,
              fixture_date: fixture.kickoff_time
            });
          }
        }
        
        setPickHistory(historyItems);
      } catch (error) {
        console.error('Error processing pick history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPickHistory();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5 text-plpe-purple" />
            <span>Your Pick History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <History className="h-5 w-5 text-plpe-purple" />
          <span>Your Pick History</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pickHistory.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Picks Yet</h3>
            <p className="text-gray-600">
              Start making your weekly predictions to build your pick history!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pickHistory.map((pick) => (
              <div key={pick.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600">GW</div>
                    <div className="text-lg font-bold text-plpe-purple">{pick.gameweek_number}</div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {pick.home_team_name} vs {pick.away_team_name}
                    </div>
                    <div className="text-sm text-gray-600">
                      Picked: <span className="font-medium">{pick.picked_team_name}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Trophy className="h-4 w-4 text-plpe-purple mr-1" />
                      <span className="font-semibold text-plpe-purple">{pick.points}</span>
                    </div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                  
                  <Badge 
                    variant={pick.is_correct ? "default" : "secondary"}
                    className={`flex items-center space-x-1 ${
                      pick.is_correct 
                        ? "bg-green-100 text-green-800 hover:bg-green-100" 
                        : "bg-red-100 text-red-800 hover:bg-red-100"
                    }`}
                  >
                    {pick.is_correct ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    <span>{pick.is_correct ? 'Correct' : 'Wrong'}</span>
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
