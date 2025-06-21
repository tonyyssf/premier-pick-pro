
import { supabase } from '@/integrations/supabase/client';

export interface LeagueInviteData {
  id: string;
  name: string;
  max_members: number | null;
  creator_id: string;
  invite_code: string;
}

export const findLeagueByInviteCode = async (inviteCode: string): Promise<LeagueInviteData | null> => {
  console.log('=== FINDING LEAGUE BY INVITE CODE ===');
  console.log('Search code:', inviteCode);
  
  try {
    // Use the security definer function to bypass RLS for invite code lookup
    // Note: Using 'any' type for the RPC call until Supabase types are regenerated
    const { data, error } = await (supabase as any)
      .rpc('get_league_by_invite_code', { 
        p_code: inviteCode 
      });

    if (error) {
      console.error('RPC error:', error);
      throw error;
    }

    console.log('RPC result:', data);
    
    // Handle the case where data could be null or an empty array
    if (!data || (Array.isArray(data) && data.length === 0)) {
      console.log('No league found with invite code:', inviteCode);
      return null;
    }

    // If data is an array, take the first element; otherwise use data directly
    const leagueData = Array.isArray(data) ? data[0] : data;
    return leagueData as LeagueInviteData;
  } catch (error) {
    console.error('Error in findLeagueByInviteCode:', error);
    throw error;
  }
};
