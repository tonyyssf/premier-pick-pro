import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { analytics } from '@/utils/analytics';
import { Download, FileText, FileJson, FilePdf, ChevronDown, Loader2 } from 'lucide-react';
import * as Papa from 'papaparse';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ExportData {
  heatmap: Array<{ team: string; winProbability: number }>;
  efficiency: Array<{ gameweek: number; pointsEarned: number; maxPossible: number; efficiency: number }>;
  projections: { p25: number; p50: number; p75: number; currentPoints: number; averagePerGameweek: number };
  currentGameweek: number;
  totalPoints: number;
  correctPicks: number;
  totalPicks: number;
  winRate: number;
}

interface ExportOptionsProps {
  data: ExportData;
  isPremium: boolean;
  className?: string;
}

export const ExportOptions: React.FC<ExportOptionsProps> = ({
  data,
  isPremium,
  className
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');

  const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
    if (!isPremium) {
      analytics.trackPremiumUpgradeStarted('export_button');
      toast({
        title: "Premium Feature",
        description: "Export is only available for premium users.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    setExportFormat(format);

    try {
      switch (format) {
        case 'csv':
          await exportCSV();
          break;
        case 'json':
          await exportJSON();
          break;
        case 'pdf':
          await exportPDF();
          break;
      }

      // Track successful export
      analytics.trackInsightsExport(format);
      analytics.trackPremiumFeatureUsage('csv_export');
      analytics.trackUserEngagement('export_data');

      toast({
        title: "Export Successful",
        description: `Your insights data has been exported as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      analytics.trackError(`${format}_export_failed`, 'insights_page');
      
      toast({
        title: "Export Failed",
        description: `There was an error exporting your data as ${format.toUpperCase()}.`,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportCSV = async () => {
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
  };

  const exportJSON = async () => {
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
      projections: data.projections
    };

    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    saveAs(blob, `insights-export-${new Date().toISOString().split('T')[0]}.json`);
  };

  const exportPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('PLPE Insights Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Export date
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // User stats table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('User Statistics', 20, yPosition);
    yPosition += 10;

    const statsData = [
      ['Metric', 'Value'],
      ['Total Points', data.totalPoints.toString()],
      ['Correct Picks', data.correctPicks.toString()],
      ['Total Picks', data.totalPicks.toString()],
      ['Win Rate', `${(data.winRate * 100).toFixed(1)}%`],
      ['Current Gameweek', data.currentGameweek.toString()]
    ];

    (doc as any).autoTable({
      startY: yPosition,
      head: [statsData[0]],
      body: statsData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Efficiency data table
    if (yPosition < pageHeight - 50) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Efficiency by Gameweek', 20, yPosition);
      yPosition += 10;

      const efficiencyData = [
        ['Gameweek', 'Points Earned', 'Max Possible', 'Efficiency %']
      ];

      data.efficiency.forEach(item => {
        efficiencyData.push([
          item.gameweek.toString(),
          item.pointsEarned.toString(),
          item.maxPossible.toString(),
          `${item.efficiency.toFixed(1)}%`
        ]);
      });

      (doc as any).autoTable({
        startY: yPosition,
        head: [efficiencyData[0]],
        body: efficiencyData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }
      });
    }

    // Save PDF
    doc.save(`insights-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => handleExport('csv')}
            disabled={isExporting || !isPremium}
            className="flex items-center gap-2"
            variant="outline"
          >
            {isExporting && exportFormat === 'csv' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            CSV
          </Button>

          <Button
            onClick={() => handleExport('json')}
            disabled={isExporting || !isPremium}
            className="flex items-center gap-2"
            variant="outline"
          >
            {isExporting && exportFormat === 'json' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileJson className="h-4 w-4" />
            )}
            JSON
          </Button>

          <Button
            onClick={() => handleExport('pdf')}
            disabled={isExporting || !isPremium}
            className="flex items-center gap-2"
            variant="outline"
          >
            {isExporting && exportFormat === 'pdf' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FilePdf className="h-4 w-4" />
            )}
            PDF
          </Button>
        </div>

        {!isPremium && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
            <p className="font-medium mb-1">Premium Feature</p>
            <p>Upgrade to premium to export your insights data in multiple formats.</p>
          </div>
        )}

        {isExporting && (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Exporting as {exportFormat.toUpperCase()}...
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 