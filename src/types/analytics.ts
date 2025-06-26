
export interface LeagueStats {
  totalLeagues: number;
  publicLeagues: number;
  privateLeagues: number;
  totalMembers: number;
  uniqueUsers: number;
  averageMembersPerLeague: number;
  leaguesBySize: Array<{ size: string; count: number }>;
  leagueCreationTrend: Array<{ date: string; count: number }>;
}
