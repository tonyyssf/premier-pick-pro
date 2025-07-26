import { getPickRecommendations, CLUB_INDEX } from '@/utils/getPickRecommendations';

describe('getPickRecommendations', () => {
  const mockHeatmap = [
    [0.8, 0.7, 0.9], // Arsenal
    [0.6, 0.5, 0.4], // Aston Villa
    [0.3, 0.2, 0.1], // Bournemouth
  ];

  const mockRemainingTokens = {
    'Arsenal': 2,
    'Aston Villa': 1,
    'Bournemouth': 0,
    'Chelsea': 3,
  };

  it('should return top 3 recommendations sorted by win probability', () => {
    const result = getPickRecommendations(mockHeatmap, mockRemainingTokens, 1);
    
    expect(result).toHaveLength(2); // Only 2 teams have remaining tokens > 0
    expect(result[0].club).toBe('Arsenal');
    expect(result[0].winProb).toBe(0.8);
    expect(result[1].club).toBe('Aston Villa');
    expect(result[1].winProb).toBe(0.6);
  });

  it('should skip teams with 0 remaining tokens', () => {
    const result = getPickRecommendations(mockHeatmap, mockRemainingTokens, 1);
    
    const bournemouthRec = result.find(rec => rec.club === 'Bournemouth');
    expect(bournemouthRec).toBeUndefined();
  });

  it('should handle teams not in CLUB_INDEX', () => {
    const result = getPickRecommendations(mockHeatmap, mockRemainingTokens, 1);
    
    const chelseaRec = result.find(rec => rec.club === 'Chelsea');
    expect(chelseaRec).toBeUndefined(); // Chelsea not in CLUB_INDEX
  });

  it('should handle out of bounds heatmap access', () => {
    const smallHeatmap = [[0.5]]; // Only 1 team, 1 gameweek
    const result = getPickRecommendations(smallHeatmap, { 'Arsenal': 1 }, 2);
    
    expect(result).toHaveLength(0); // Should handle out of bounds gracefully
  });

  it('should handle empty remaining tokens', () => {
    const result = getPickRecommendations(mockHeatmap, {}, 1);
    
    expect(result).toHaveLength(0);
  });

  it('should handle undefined/null win probabilities', () => {
    const heatmapWithNulls = [
      [0.8, null, 0.9], // Arsenal with null in middle
      [0.6, 0.5, 0.4], // Aston Villa
    ];
    
    const result = getPickRecommendations(heatmapWithNulls, { 'Arsenal': 1, 'Aston Villa': 1 }, 2);
    
    expect(result).toHaveLength(1); // Only Aston Villa should be included
    expect(result[0].club).toBe('Aston Villa');
  });
});

describe('CLUB_INDEX', () => {
  it('should contain all Premier League teams', () => {
    const expectedTeams = [
      'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton',
      'Burnley', 'Chelsea', 'Crystal Palace', 'Everton', 'Fulham',
      'Liverpool', 'Luton', 'Manchester City', 'Manchester United',
      'Newcastle', 'Nottingham Forest', 'Sheffield United', 'Tottenham',
      'West Ham', 'Wolves'
    ];

    expectedTeams.forEach(team => {
      expect(CLUB_INDEX[team]).toBeDefined();
    });
  });

  it('should have sequential indices starting from 0', () => {
    const indices = Object.values(CLUB_INDEX).sort((a, b) => a - b);
    
    indices.forEach((index, i) => {
      expect(index).toBe(i);
    });
  });
}); 