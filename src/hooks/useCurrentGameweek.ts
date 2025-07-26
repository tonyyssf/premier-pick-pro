import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useCurrentGameweek(): number {
  const [currentGameweek, setCurrentGameweek] = useState(1);

  useEffect(() => {
    const fetchCurrentGameweek = async () => {
      try {
        // This would typically come from your gameweek management system
        // For now, we'll use a simple approach or fetch from Supabase
        const { data, error } = await supabase
          .from('gameweeks')
          .select('current_gameweek')
          .single();

        if (error) {
          console.warn('Could not fetch current gameweek:', error);
          // Fallback to a reasonable default
          setCurrentGameweek(1);
        } else {
          setCurrentGameweek(data?.current_gameweek || 1);
        }
      } catch (error) {
        console.warn('Error fetching current gameweek:', error);
        setCurrentGameweek(1);
      }
    };

    fetchCurrentGameweek();
  }, []);

  return currentGameweek;
} 