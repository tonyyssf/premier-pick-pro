
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
      // Create a temporary div with the share template
      const shareTemplate = document.createElement('div');
      shareTemplate.innerHTML = `
        <div style="
          width: 800px;
          height: 400px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: white;
          font-family: Arial, sans-serif;
          position: relative;
          overflow: hidden;
        ">
          <!-- Background pattern -->
          <div style="
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
              radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%);
          "></div>
          
          <!-- Content -->
          <div style="position: relative; z-index: 1; text-align: center;">
            <h1 style="
              font-size: 32px;
              font-weight: bold;
              margin: 0 0 20px 0;
              text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">My Premier League Pick</h1>
            
            <div style="
              background: rgba(255,255,255,0.15);
              backdrop-filter: blur(10px);
              border-radius: 16px;
              padding: 30px;
              margin: 20px 0;
              border: 1px solid rgba(255,255,255,0.2);
            ">
              <div style="
                font-size: 48px;
                font-weight: bold;
                margin-bottom: 10px;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
              ">${pickData.teamName}</div>
              
              <div style="
                font-size: 24px;
                margin: 15px 0;
                opacity: 0.9;
              ">vs</div>
              
              <div style="
                font-size: 36px;
                font-weight: bold;
                margin-bottom: 15px;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
              ">${pickData.opponentName}</div>
              
              <div style="
                font-size: 18px;
                opacity: 0.8;
                margin-bottom: 10px;
              ">${pickData.venue}</div>
              
              <div style="
                font-size: 16px;
                opacity: 0.7;
              ">${pickData.fixture.kickoffTime.toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}</div>
            </div>
            
            <div style="
              font-size: 24px;
              font-weight: bold;
              margin: 25px 0 10px 0;
              text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">Join me and make your picks! ⚽</div>
            
            <div style="
              font-size: 18px;
              opacity: 0.9;
              font-weight: 500;
            ">Premier League Picks Express</div>
          </div>
        </div>
      `;

      // Use html2canvas to capture the template
      const html2canvas = (await import('html2canvas')).default;
      
      // Temporarily add to DOM for rendering
      shareTemplate.style.position = 'absolute';
      shareTemplate.style.left = '-9999px';
      shareTemplate.style.top = '-9999px';
      document.body.appendChild(shareTemplate);
      
      const canvas = await html2canvas(shareTemplate.firstElementChild as HTMLElement, {
        width: 800,
        height: 400,
        scale: 2,
        useCORS: true,
        backgroundColor: null
      });
      
      // Remove from DOM
      document.body.removeChild(shareTemplate);
      
      // Convert to blob URL
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
    const shareText = `Just picked ${pickData.teamName} to beat ${pickData.opponentName}! Join me and make your Premier League picks! ⚽`;
    
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
