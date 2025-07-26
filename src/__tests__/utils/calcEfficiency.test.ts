import { calcOverallEfficiency, calcEfficiencyByGameweek, EfficiencyData } from '@/utils/calcEfficiency';

describe('calcEfficiency', () => {
  const mockEfficiencyData: EfficiencyData[] = [
    { gameweek: 1, pointsEarned: 8, maxPossible: 10, efficiency: 80 },
    { gameweek: 2, pointsEarned: 6, maxPossible: 10, efficiency: 60 },
    { gameweek: 3, pointsEarned: 9, maxPossible: 10, efficiency: 90 },
  ];

  describe('calcOverallEfficiency', () => {
    it('should calculate overall efficiency correctly', () => {
      const result = calcOverallEfficiency(mockEfficiencyData);
      
      // Total points: 8 + 6 + 9 = 23
      // Total max: 10 + 10 + 10 = 30
      // Efficiency: (23 / 30) * 100 = 76.67%
      expect(result).toBeCloseTo(76.67, 2);
    });

    it('should return 0 for empty data', () => {
      const result = calcOverallEfficiency([]);
      expect(result).toBe(0);
    });

    it('should return 0 when max possible is 0', () => {
      const dataWithZeroMax: EfficiencyData[] = [
        { gameweek: 1, pointsEarned: 5, maxPossible: 0, efficiency: 0 },
      ];
      
      const result = calcOverallEfficiency(dataWithZeroMax);
      expect(result).toBe(0);
    });

    it('should handle single gameweek', () => {
      const singleGameweek: EfficiencyData[] = [
        { gameweek: 1, pointsEarned: 7, maxPossible: 10, efficiency: 70 },
      ];
      
      const result = calcOverallEfficiency(singleGameweek);
      expect(result).toBe(70);
    });
  });

  describe('calcEfficiencyByGameweek', () => {
    it('should calculate efficiency for each gameweek', () => {
      const dataWithoutEfficiency: Omit<EfficiencyData, 'efficiency'>[] = [
        { gameweek: 1, pointsEarned: 8, maxPossible: 10 },
        { gameweek: 2, pointsEarned: 6, maxPossible: 10 },
        { gameweek: 3, pointsEarned: 9, maxPossible: 10 },
      ];
      
      const result = calcEfficiencyByGameweek(dataWithoutEfficiency as EfficiencyData[]);
      
      expect(result).toHaveLength(3);
      expect(result[0].efficiency).toBe(80);
      expect(result[1].efficiency).toBe(60);
      expect(result[2].efficiency).toBe(90);
    });

    it('should handle zero max possible points', () => {
      const dataWithZeroMax: Omit<EfficiencyData, 'efficiency'>[] = [
        { gameweek: 1, pointsEarned: 5, maxPossible: 0 },
      ];
      
      const result = calcEfficiencyByGameweek(dataWithZeroMax as EfficiencyData[]);
      
      expect(result[0].efficiency).toBe(0);
    });

    it('should preserve existing efficiency values', () => {
      const result = calcEfficiencyByGameweek(mockEfficiencyData);
      
      expect(result).toEqual(mockEfficiencyData);
    });
  });
}); 