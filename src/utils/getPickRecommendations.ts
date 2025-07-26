// Club index mapping for heatmap data
export const CLUB_INDEX: Record<string, number> = {
  'Arsenal': 0,
  'Aston Villa': 1,
  'Bournemouth': 2,
  'Brentford': 3,
  'Brighton': 4,
  'Burnley': 5,
  'Chelsea': 6,
  'Crystal Palace': 7,
  'Everton': 8,
  'Fulham': 9,
  'Liverpool': 10,
  'Luton': 11,
  'Manchester City': 12,
  'Manchester United': 13,
  'Newcastle': 14,
  'Nottingham Forest': 15,
  'Sheffield United': 16,
  'Tottenham': 17,
  'West Ham': 18,
  'Wolves': 19
};

export interface PickRecommendation {
  club: string;
  gw: number;
  winProb: number;
}

export function getPickRecommendations(
  heatmap: number[][],
  remaining: Record<string, number>,
  currentGw: number
): PickRecommendation[] {
  const clubs = Object.keys(remaining);
  const recs: PickRecommendation[] = [];

  for (const club of clubs) {
    if (remaining[club] === 0) continue;
    
    const clubIdx = CLUB_INDEX[club];
    if (clubIdx === undefined) continue;
    
    // Ensure we don't go out of bounds
    if (clubIdx >= heatmap.length || currentGw - 1 >= heatmap[clubIdx].length) continue;
    
    const prob = heatmap[clubIdx][currentGw - 1];
    if (prob !== undefined && !isNaN(prob)) {
      recs.push({ club, gw: currentGw, winProb: prob });
    }
  }

  // Sort descending by win probability, pick top 3
  return recs
    .sort((a, b) => b.winProb - a.winProb)
    .slice(0, 3);
} 