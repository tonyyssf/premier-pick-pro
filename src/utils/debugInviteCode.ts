
import { supabase } from '@/integrations/supabase/client';

export const debugInviteCodeSearch = async (searchCode: string) => {
  console.log('=== DEBUG INVITE CODE SEARCH ===');
  console.log('Search code:', searchCode);
  
  try {
    // Get all leagues
    const { data: allLeagues, error } = await supabase
      .from('leagues')
      .select('*');
    
    if (error) {
      console.error('Error fetching leagues:', error);
      return null;
    }
    
    console.log('All leagues:', allLeagues);
    
    // Try different matching strategies
    const matches = {
      exact: allLeagues?.find(l => l.invite_code === searchCode),
      caseInsensitive: allLeagues?.find(l => l.invite_code?.toLowerCase() === searchCode.toLowerCase()),
      trimmed: allLeagues?.find(l => l.invite_code?.trim() === searchCode.trim()),
      includes: allLeagues?.filter(l => l.invite_code?.includes(searchCode))
    };
    
    console.log('Match results:', matches);
    
    return matches;
  } catch (error) {
    console.error('Debug error:', error);
    return null;
  }
};
