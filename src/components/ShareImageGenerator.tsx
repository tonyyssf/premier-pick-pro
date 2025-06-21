
import React, { useRef, useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import { ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

interface ShareImageGeneratorProps {
  gameweekNumber: number;
  teamName: string;
  opponentName: string;
  onImageGenerated?: (imageUrl: string) => void;
}

export const ShareImageGenerator: React.FC<ShareImageGeneratorProps> = ({
  gameweekNumber,
  teamName,
  opponentName,
  onImageGenerated
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const generateImage = async () => {
    if (!canvasRef.current) return;

    setGenerating(true);
    try {
      const canvas = await html2canvas(canvasRef.current, {
        width: 1200,
        height: 630,
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true
      });

      const imageUrl = canvas.toDataURL('image/png');
      
      if (onImageGenerated) {
        onImageGenerated(imageUrl);
      }

      // Create download link
      const link = document.createElement('a');
      link.download = `plpe-pick-gw${gameweekNumber}-${teamName.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = imageUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Image Generated",
        description: "Your pick image has been downloaded and is ready to share!",
      });
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Error",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden canvas for image generation */}
      <div 
        ref={canvasRef}
        className="absolute -left-[9999px] top-0"
        style={{ width: '1200px', height: '630px' }}
      >
        <div className="w-full h-full bg-white relative overflow-hidden">
          {/* Stadium silhouette watermark */}
          <div className="absolute inset-0 opacity-10">
            <svg viewBox="0 0 1200 630" className="w-full h-full">
              <path
                d="M50 400 Q200 350 400 370 Q600 390 800 360 Q1000 340 1150 380 L1150 500 Q900 480 600 490 Q300 500 50 480 Z"
                fill="url(#stadiumGradient)"
              />
              <defs>
                <linearGradient id="stadiumGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(259 100% 35%)" />
                  <stop offset="100%" stopColor="hsl(207 100% 50%)" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Header - 10-15% */}
          <div className="h-[15%] flex items-center justify-center px-8 relative z-10">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-plpe-gradient rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">PE</span>
              </div>
              <h1 className="text-2xl font-bold bg-plpe-gradient bg-clip-text text-transparent">
                PREMIER LEAGUE PICK EM
              </h1>
            </div>
          </div>

          {/* Main Body - 65-70% */}
          <div className="h-[70%] flex flex-col items-center justify-center px-8 relative z-10">
            {/* Line 1 - Callout */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800 tracking-wider">
                MY GAMEWEEK {gameweekNumber} PICK
              </h2>
            </div>

            {/* Line 2 - Team (huge) */}
            <div className="text-center mb-8">
              <h3 className="text-7xl font-black text-plpe-purple leading-none">
                {teamName.toUpperCase()}
              </h3>
            </div>

            {/* VS Bar with team crests placeholders */}
            <div className="flex items-center space-x-8 mb-4">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-plpe-purple rounded-full flex items-center justify-center mb-2">
                  <span className="text-white font-bold text-sm">
                    {teamName.substring(0, 3).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{teamName}</span>
              </div>
              
              <span className="text-4xl font-bold text-gray-400">VS</span>
              
              <div className="flex flex-col items-center opacity-40">
                <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mb-2">
                  <span className="text-white font-bold text-sm">
                    {opponentName.substring(0, 3).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-600">{opponentName}</span>
              </div>
            </div>
          </div>

          {/* Footer - 15-20% */}
          <div className="h-[15%] flex items-center justify-center px-8 relative z-10">
            <div className="flex items-center space-x-3 bg-plpe-gradient px-6 py-3 rounded-full">
              <span className="text-white font-bold text-xl">
                Make your pick at PickPrem.com
              </span>
              <ChevronRight className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Generate button */}
      <Button
        onClick={generateImage}
        disabled={generating}
        className="w-full bg-plpe-gradient hover:opacity-90"
      >
        {generating ? 'Generating Image...' : 'Generate Share Image'}
      </Button>
    </div>
  );
};
