
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { inviteCodeSchema } from '@/utils/validation';
import { findLeagueByInviteCode } from '@/utils/leagueInviteUtils';
import { debugInviteCodeSearch } from '@/utils/debugInviteCode';
import { z } from 'zod';

export const useJoinLeague = (onLeagueJoined?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const { toast } = useToast();

  const validateInviteCode = (code: string) => {
    try {
      inviteCodeSchema.parse(code);
      setError('');
      return true;
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        setError(validationError.errors[0].message);
      }
      return false;
    }
  };

  const handleInputChange = (value: string) => {
    // Remove any non-alphanumeric characters and convert to uppercase
    const sanitized = value.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 6);
    setInviteCode(sanitized);
    if (error) {
      setError('');
    }
  };

  const joinLeague = async (trimmedCode: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to join a league.",
        variant: "destructive",
      });
      return false;
    }

    if (!validateInviteCode(trimmedCode)) {
      return false;
    }

    setIsLoading(true);

    try {
      console.log('=== JOIN LEAGUE ATTEMPT ===');
      console.log('User ID:', user.id);
      console.log('Search code:', trimmedCode);
      
      // First run debug search to understand what's happening
      const debugResult = await debugInviteCodeSearch(trimmedCode);
      console.log('Debug result:', debugResult);
      
      // Try multiple approaches to find the league
      let foundLeague = null;
      
      // Method 1: Use the RPC function
      try {
        foundLeague = await findLeagueByInviteCode(trimmedCode);
        console.log('RPC method result:', foundLeague);
      } catch (rpcError) {
        console.log('RPC method failed:', rpcError);
      }
      
      // Method 2: Direct query if RPC failed
      if (!foundLeague) {
        console.log('Trying direct query method...');
        const { data: directResult, error: directError } = await supabase
          .from('leagues')
          .select('id, name, max_members, creator_id, invite_code')
          .eq('invite_code', trimmedCode)
          .maybeSingle();
          
        if (directError) {
          console.error('Direct query error:', directError);
        } else {
          foundLeague = directResult;
          console.log('Direct query result:', foundLeague);
        }
      }
      
      // Method 3: Case-insensitive search if still not found
      if (!foundLeague) {
        console.log('Trying case-insensitive search...');
        const { data: allLeagues, error: allError } = await supabase
          .from('leagues')
          .select('id, name, max_members, creator_id, invite_code');
          
        if (!allError && allLeagues) {
          foundLeague = allLeagues.find(league => 
            league.invite_code?.toUpperCase().trim() === trimmedCode
          );
          console.log('Case-insensitive search result:', foundLeague);
        }
      }

      if (!foundLeague) {
        console.log('No league found with any method');
        toast({
          title: "League Not Found",
          description: `No league found with invite code "${trimmedCode}". Please check the code and try again.`,
          variant: "destructive",
        });
        return false;
      }

      console.log('Found league:', foundLeague);

      // Check if user is already a member
      const { data: existingMembership, error: membershipError } = await supabase
        .from('league_members')
        .select('id')
        .eq('league_id', foundLeague.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (membershipError) {
        console.error('Membership check error:', membershipError);
        toast({
          title: "Error Checking Membership",
          description: "There was an error checking your membership status.",
          variant: "destructive",
        });
        return false;
      }

      if (existingMembership) {
        toast({
          title: "Already a Member",
          description: "You're already a member of this league.",
          variant: "destructive",
        });
        return false;
      }

      // Check member count if there's a limit
      if (foundLeague.max_members) {
        const { count, error: countError } = await supabase
          .from('league_members')
          .select('*', { count: 'exact', head: true })
          .eq('league_id', foundLeague.id);

        if (countError) {
          console.error('Count error:', countError);
          toast({
            title: "Error Checking League Capacity",
            description: "There was an error checking the league capacity.",
            variant: "destructive",
          });
          return false;
        }

        if (count && count >= foundLeague.max_members) {
          toast({
            title: "League Full",
            description: "This league has reached its maximum number of members.",
            variant: "destructive",
          });
          return false;
        }
      }

      // Join the league
      const { error: joinError } = await supabase
        .from('league_members')
        .insert({
          league_id: foundLeague.id,
          user_id: user.id
        });

      if (joinError) {
        console.error('Join error:', joinError);
        toast({
          title: "Error Joining League",
          description: joinError.message || "Failed to join the league. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      console.log('Successfully joined league:', foundLeague.name);
      
      toast({
        title: "Joined League!",
        description: `You've successfully joined "${foundLeague.name}".`,
      });

      setInviteCode('');
      setError('');
      onLeagueJoined?.();
      return true;
    } catch (error: any) {
      console.error('Join league error:', error);
      toast({
        title: "Error Joining League",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = inviteCode.trim().toUpperCase();
    return await joinLeague(trimmedCode);
  };

  return {
    inviteCode,
    error,
    isLoading,
    handleInputChange,
    handleSubmit
  };
};
