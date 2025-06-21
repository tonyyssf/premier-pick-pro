
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
    const { data, error } = await supabase
      .rpc('get_league_by_invite_code', { 
        p_code: inviteCode 
      });

    if (error) {
      console.error('RPC error:', error);
      throw error;
    }

    console.log('RPC result:', data);
    
    if (!data || data.length === 0) {
      console.log('No league found with invite code:', inviteCode);
      return null;
    }

    return data[0] as LeagueInviteData;
  } catch (error) {
    console.error('Error in findLeagueByInviteCode:', error);
    throw error;
  }
};
