import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import * as Papa from 'papaparse';

export interface ExportData {
  heatmap: Array<{ team: string; winProbability: number }>;
  efficiency: Array<{ gameweek: number; pointsEarned: number; maxPossible: number; efficiency: number }>;
  projections: { p25: number; p50: number; p75: number; currentPoints: number; averagePerGameweek: number };
  remainingTokens: Record<string, number>;
  currentGameweek: number;
  totalPoints: number;
  correctPicks: number;
  totalPicks: number;
  winRate: number;
}

export function downloadCsv(data: ExportData): void {
  // Prepare efficiency data for CSV
  const csvData = data.efficiency.map(item => ({
    gameweek: item.gameweek,
    points_earned: item.pointsEarned,
    max_possible: item.maxPossible,
    efficiency_percentage: item.efficiency.toFixed(1),
    win_rate: data.winRate,
    total_points: data.totalPoints,
  }));

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `insights-export-${new Date().toISOString().split('T')[0]}.csv`);
}

export function downloadExcel(data: ExportData): void {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Efficiency Data
  const efficiencyData = data.efficiency.map(item => ({
    'Gameweek': item.gameweek,
    'Points Earned': item.pointsEarned,
    'Max Possible': item.maxPossible,
    'Efficiency %': parseFloat(item.efficiency.toFixed(1)),
    'Win Rate': data.winRate,
    'Total Points': data.totalPoints,
  }));
  const efficiencySheet = XLSX.utils.json_to_sheet(efficiencyData);
  XLSX.utils.book_append_sheet(workbook, efficiencySheet, 'Efficiency');

  // Sheet 2: Heatmap Data
  const heatmapData = data.heatmap.map(item => ({
    'Team': item.team,
    'Win Probability %': parseFloat((item.winProbability * 100).toFixed(1)),
  }));
  const heatmapSheet = XLSX.utils.json_to_sheet(heatmapData);
  XLSX.utils.book_append_sheet(workbook, heatmapSheet, 'Team Probabilities');

  // Sheet 3: Projections
  const projectionsData = [
    { 'Metric': 'Current Points', 'Value': data.projections.currentPoints },
    { 'Metric': 'P25 Projection', 'Value': data.projections.p25 },
    { 'Metric': 'P50 Projection', 'Value': data.projections.p50 },
    { 'Metric': 'P75 Projection', 'Value': data.projections.p75 },
    { 'Metric': 'Average per Gameweek', 'Value': data.projections.averagePerGameweek },
  ];
  const projectionsSheet = XLSX.utils.json_to_sheet(projectionsData);
  XLSX.utils.book_append_sheet(workbook, projectionsSheet, 'Projections');

  // Sheet 4: Remaining Tokens
  const tokensData = Object.entries(data.remainingTokens).map(([team, tokens]) => ({
    'Team': team,
    'Remaining Tokens': tokens,
  }));
  const tokensSheet = XLSX.utils.json_to_sheet(tokensData);
  XLSX.utils.book_append_sheet(workbook, tokensSheet, 'Remaining Tokens');

  // Save the workbook
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `insights-export-${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function downloadJson(data: ExportData): void {
  const jsonData = {
    exportDate: new Date().toISOString(),
    userStats: {
      totalPoints: data.totalPoints,
      correctPicks: data.correctPicks,
      totalPicks: data.totalPicks,
      winRate: data.winRate,
      currentGameweek: data.currentGameweek
    },
    efficiency: data.efficiency,
    heatmap: data.heatmap,
    projections: data.projections,
    remainingTokens: data.remainingTokens
  };

  const jsonString = JSON.stringify(jsonData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  saveAs(blob, `insights-export-${new Date().toISOString().split('T')[0]}.json`);
} 