
import React from 'react';
import { Share, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { usePickShare } from '@/hooks/usePickShare';
import { Fixture } from '@/types/picks';

interface SharePickCardProps {
  teamName: string;
  opponentName: string;
  venue: string;
  fixture: Fixture;
  gameweekNumber: number;
}

export const SharePickCard: React.FC<SharePickCardProps> = ({
  teamName,
  opponentName,
  venue,
  fixture,
  gameweekNumber
}) => {
  const { generateShareText, shareToSocial, copyShareText } = usePickShare();

  const pickData = { teamName, opponentName, venue, fixture, gameweekNumber };
  const shareText = generateShareText(pickData);

  const handleShare = async () => {
    await shareToSocial(pickData);
  };

  const handleCopy = () => {
    copyShareText(pickData);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border">
      <div className="flex items-center space-x-3 mb-4">
        <Share className="h-6 w-6 text-plpe-purple" />
        <h3 className="text-lg font-semibold text-gray-900">Share Your Pick</h3>
      </div>

      <p className="text-gray-600 mb-4">
        Share your pick on social media and invite friends to join!
      </p>

      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <p className="text-gray-800 font-medium text-center">
          "{shareText}"
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          onClick={handleShare}
          className="flex-1"
        >
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>
        
        <Button
          onClick={handleCopy}
          variant="outline"
          className="flex-1"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy Text
        </Button>
      </div>
    </div>
  );
};
