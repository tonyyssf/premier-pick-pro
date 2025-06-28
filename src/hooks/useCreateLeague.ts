
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { validateAndSanitizeLeague } from '@/utils/validation';
import { leagueCreateLimiter, checkRateLimit } from '@/utils/rateLimiter';

interface FormData {
  name: string;
  description: string;
  isPublic: boolean;
  maxMembers: number;
}

interface CreatedLeague {
  id: string;
  name: string;
  invite_code: string;
}

const MAX_LEAGUES_PER_USER = 10;

export const useCreateLeague = (onLeagueCreated?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [createdLeague, setCreatedLeague] = useState<CreatedLeague | null>(null);
  const [userLeagueCount, setUserLeagueCount] = useState<number>(0);
  const [checkingLimit, setCheckingLimit] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  const checkUserLeagueCount = async () => {
    if (!user) return;
    
    setCheckingLimit(true);
    try {
      const { count, error } = await supabase
        .from('leagues')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', user.id);

      if (error) throw error;
      setUserLeagueCount(count || 0);
    } catch (error: any) {
      console.error('Error checking league count:', error);
      toast({
        title: "Error",
        description: "Could not check your league limit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCheckingLimit(false);
    }
  };

  const createLeague = async (formData: FormData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create a league.",
        variant: "destructive",
      });
      return false;
    }

    // Check league limit
    if (userLeagueCount >= MAX_LEAGUES_PER_USER) {
      toast({
        title: "League Limit Reached",
        description: `You can only create up to ${MAX_LEAGUES_PER_USER} leagues. Please delete an existing league to create a new one.`,
        variant: "destructive",
      });
      return false;
    }

    // Check rate limiting
    const { allowed, timeUntilReset } = checkRateLimit(leagueCreateLimiter, user.id);
    if (!allowed) {
      const minutes = Math.ceil(timeUntilReset / 60000);
      toast({
        title: "Too Many Requests",
        description: `Please wait ${minutes} minutes before creating another league.`,
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);

    try {
      const sanitizedData = validateAndSanitizeLeague(formData);
      
      const { data, error } = await supabase
        .from('leagues')
        .insert({
          name: sanitizedData.name,
          description: sanitizedData.description || null,
          creator_id: user.id,
          is_public: sanitizedData.isPublic,
          max_members: sanitizedData.maxMembers
        })
        .select('id, name, invite_code')
        .single();

      if (error) throw error;

      setCreatedLeague(data);
      setUserLeagueCount(prev => prev + 1);
      
      toast({
        title: "League Created!",
        description: `Your league "${sanitizedData.name}" has been created successfully.`,
      });

      onLeagueCreated?.();
      return true;
    } catch (error: any) {
      console.error('League creation error:', error);
      toast({
        title: "Error Creating League",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetCreatedLeague = () => {
    setCreatedLeague(null);
  };

  const canCreateLeague = userLeagueCount < MAX_LEAGUES_PER_USER;

  return {
    isLoading,
    createdLeague,
    userLeagueCount,
    checkingLimit,
    canCreateLeague,
    maxLeagues: MAX_LEAGUES_PER_USER,
    checkUserLeagueCount,
    createLeague,
    resetCreatedLeague
  };
};
