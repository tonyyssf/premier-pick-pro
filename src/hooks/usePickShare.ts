
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Fixture } from '@/types/picks';

interface SharePickData {
  teamName: string;
  opponentName: string;
  venue: string;
  fixture: Fixture;
}

export const usePickShare = () => {
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const generateShareImage = async (pickData: SharePickData): Promise<string | null> => {
    setGenerating(true);
    
    try {
      // Create a canvas for the share image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Set canvas dimensions
      canvas.width = 800;
      canvas.height = 400;

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Main text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('My Premier League Pick:', canvas.width / 2, 80);

      // Team names
      ctx.font = 'bold 48px Arial';
      ctx.fillText(`${pickData.teamName}`, canvas.width / 2, 160);
      
      ctx.font = '24px Arial';
      ctx.fillText('vs', canvas.width / 2, 200);
      
      ctx.font = 'bold 36px Arial';
      ctx.fillText(`${pickData.opponentName}`, canvas.width / 2, 240);

      // Venue info
      ctx.font = '20px Arial';
      ctx.fillText(`(${pickData.venue})`, canvas.width / 2, 270);

      // Call to action
      ctx.font = 'bold 24px Arial';
      ctx.fillText('Join me and make your picks!', canvas.width / 2, 320);
      
      ctx.font = '18px Arial';
      ctx.fillText('Premier League Picks Express', canvas.width / 2, 350);

      // Convert canvas to blob
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve(url);
          } else {
            resolve(null);
          }
        }, 'image/png');
      });
    } catch (error) {
      console.error('Error generating share image:', error);
      toast({
        title: "Error",
        description: "Could not generate share image. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setGenerating(false);
    }
  };

  const shareToSocial = async (imageUrl: string, pickData: SharePickData) => {
    const shareText = `Just picked ${pickData.teamName} to beat ${pickData.opponentName}! Join me and make your Premier League picks! 🏈⚽`;
    
    if (navigator.share) {
      try {
        // Convert image URL to file for native sharing
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'my-pick.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'My Premier League Pick',
          text: shareText,
          files: [file],
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

  const downloadImage = (imageUrl: string) => {
    const link = document.createElement('a');
    link.download = 'my-premier-league-pick.png';
    link.href = imageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Image Downloaded",
      description: "Your pick image has been saved!",
    });
  };

  return {
    generating,
    generateShareImage,
    shareToSocial,
    downloadImage
  };
};
