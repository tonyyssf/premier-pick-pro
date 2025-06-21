
import React, { useState } from 'react';
import { Share, Download, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { usePickShare } from '@/hooks/usePickShare';
import { Fixture } from '@/types/picks';

interface SharePickCardProps {
  teamName: string;
  opponentName: string;
  venue: string;
  fixture: Fixture;
}

export const SharePickCard: React.FC<SharePickCardProps> = ({
  teamName,
  opponentName,
  venue,
  fixture
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { generating, generateShareImage, shareToSocial, downloadImage } = usePickShare();

  const handleGenerateImage = async () => {
    const pickData = { teamName, opponentName, venue, fixture };
    const url = await generateShareImage(pickData);
    if (url) {
      setImageUrl(url);
    }
  };

  const handleShare = async () => {
    if (imageUrl) {
      const pickData = { teamName, opponentName, venue, fixture };
      await shareToSocial(imageUrl, pickData);
    }
  };

  const handleDownload = () => {
    if (imageUrl) {
      downloadImage(imageUrl);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border">
      <div className="flex items-center space-x-3 mb-4">
        <Share className="h-6 w-6 text-plpe-purple" />
        <h3 className="text-lg font-semibold text-gray-900">Share Your Pick</h3>
      </div>

      <p className="text-gray-600 mb-4">
        Generate a custom image to share your pick on social media and invite friends to join!
      </p>

      {!imageUrl ? (
        <Button
          onClick={handleGenerateImage}
          disabled={generating}
          className="w-full mb-4"
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          {generating ? 'Generating Image...' : 'Generate Share Image'}
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <img 
              src={imageUrl} 
              alt="Share image" 
              className="w-full h-auto"
            />
          </div>
          
          <div className="flex space-x-3">
            <Button
              onClick={handleShare}
              className="flex-1"
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            
            <Button
              onClick={handleDownload}
              variant="outline"
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          <Button
            onClick={handleGenerateImage}
            variant="ghost"
            size="sm"
            className="w-full"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Generate New Image
          </Button>
        </div>
      )}
    </div>
  );
};
