
import { supabase } from '@/integrations/supabase/client';

export const debugInviteCodeSearch = async (searchCode: string) => {
  console.log('=== DEBUG INVITE CODE SEARCH ===');
  console.log('Search code:', searchCode);
  console.log('Search code length:', searchCode.length);
  console.log('Search code chars:', searchCode.split('').map(c => `'${c}' (${c.charCodeAt(0)})`));
  
  try {
    // Get all leagues with their invite codes
    const { data: allLeagues, error } = await supabase
      .from('leagues')
      .select('id, name, invite_code, creator_id')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching leagues:', error);
      return null;
    }
    
    console.log('All leagues found:', allLeagues?.length || 0);
    allLeagues?.forEach(league => {
      console.log(`League: ${league.name}, Code: '${league.invite_code}' (length: ${league.invite_code?.length})`);
    });
    
    // Try different matching strategies
    const exactMatch = allLeagues?.find(l => l.invite_code === searchCode);
    const upperMatch = allLeagues?.find(l => l.invite_code?.toUpperCase() === searchCode.toUpperCase());
    const trimmedMatch = allLeagues?.find(l => l.invite_code?.trim().toUpperCase() === searchCode.trim().toUpperCase());
    
    console.log('Exact match:', exactMatch?.name || 'None');
    console.log('Case-insensitive match:', upperMatch?.name || 'None');
    console.log('Trimmed match:', trimmedMatch?.name || 'None');
    
    return {
      allLeagues,
      exactMatch,
      upperMatch,
      trimmedMatch,
      searchCode,
      searchCodeLength: searchCode.length
    };
  } catch (error) {
    console.error('Debug error:', error);
    return null;
  }
};
