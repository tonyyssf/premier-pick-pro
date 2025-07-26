export interface EfficiencyData {
  gameweek: number;
  pointsEarned: number;
  maxPossible: number;
  efficiency: number;
}

export function calcOverallEfficiency(efficiencyData: EfficiencyData[]): number {
  if (efficiencyData.length === 0) return 0;
  
  const totalPointsEarned = efficiencyData.reduce((sum, item) => sum + item.pointsEarned, 0);
  const totalMaxPossible = efficiencyData.reduce((sum, item) => sum + item.maxPossible, 0);
  
  if (totalMaxPossible === 0) return 0;
  
  return (totalPointsEarned / totalMaxPossible) * 100;
}

export function calcEfficiencyByGameweek(efficiencyData: EfficiencyData[]): EfficiencyData[] {
  return efficiencyData.map(item => ({
    ...item,
    efficiency: item.maxPossible > 0 ? (item.pointsEarned / item.maxPossible) * 100 : 0
  }));
} 