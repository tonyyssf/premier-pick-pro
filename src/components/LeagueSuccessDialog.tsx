
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Share2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreatedLeague {
  id: string;
  name: string;
  invite_code: string;
}

interface LeagueSuccessDialogProps {
  createdLeague: CreatedLeague;
  onClose: () => void;
}

export const LeagueSuccessDialog: React.FC<LeagueSuccessDialogProps> = ({
  createdLeague,
  onClose
}) => {
  const { toast } = useToast();

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const shareUrl = `https://plpickem.com/leagues?join=${createdLeague.invite_code}`;

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
          <Share2 className="h-5 w-5 text-green-600" />
          <span>League Created Successfully!</span>
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">{createdLeague.name}</h3>
          <p className="text-sm text-gray-600">Share your league with friends</p>
        </div>
        
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium">League Code</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Input
                value={createdLeague.invite_code}
                readOnly
                className="font-mono text-center text-lg font-bold"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(createdLeague.invite_code, 'League code')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Share Link</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Input
                value={shareUrl}
                readOnly
                className="text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(shareUrl, 'Share link')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Create Another
          </Button>
          <Button 
            onClick={() => {
              window.open(`/leagues`, '_blank');
              onClose();
            }}
            className="flex-1"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View League
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};
