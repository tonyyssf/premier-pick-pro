
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Fixture } from '@/types/picks';

interface SharePickData {
  teamName: string;
  opponentName: string;
  venue: string;
  fixture: Fixture;
  gameweekNumber: number;
}

export const usePickShare = () => {
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const generateShareText = (pickData: SharePickData): string => {
    return `My PLPE pick for game week ${pickData.gameweekNumber} is ${pickData.teamName} to win! Make your pick at plpickem.com now!`;
  };

  const shareToSocial = async (pickData: SharePickData) => {
    const shareText = generateShareText(pickData);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Premier League Pick',
          text: shareText,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        fallbackShare(shareText);
      }
    } else {
      fallbackShare(shareText);
    }
  };

  const fallbackShare = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Share text copied! You can paste it on social media.",
      });
    } else {
      toast({
        title: "Share",
        description: "Copy this text to share: " + text,
      });
    }
  };

  const copyShareText = (pickData: SharePickData) => {
    const shareText = generateShareText(pickData);
    fallbackShare(shareText);
  };

  return {
    generating,
    generateShareText,
    shareToSocial,
    copyShareText
  };
};
