
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LeagueShareSectionProps {
  leagueId: string;
  leagueName: string;
}

export const LeagueShareSection: React.FC<LeagueShareSectionProps> = ({
  leagueId,
  leagueName
}) => {
  const { toast } = useToast();

  const generateSignupLink = () => {
    return `https://plpickem.com/auth?invite=${leagueId}`;
  };

  const copySignupLink = () => {
    const signupLink = generateSignupLink();
    navigator.clipboard.writeText(signupLink);
    toast({
      title: "Signup Link Copied",
      description: "The signup link has been copied to your clipboard.",
    });
  };

  const signupLink = generateSignupLink();

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <Label className="text-sm font-medium text-blue-900">Share Signup Link</Label>
      <p className="text-xs text-blue-700 mt-1 mb-3">
        Share this link to let people join your league directly during signup
      </p>
      
      <div className="space-y-3">
        <code className="bg-white px-3 py-2 rounded border font-mono text-xs block w-full text-blue-800 border-blue-300 break-all">
          {signupLink}
        </code>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={copySignupLink}
          className="flex items-center justify-center space-x-1 border-blue-300 text-blue-700 hover:bg-blue-100 w-full"
        >
          <Copy className="h-4 w-4" />
          <span>Copy Link</span>
        </Button>
      </div>
    </div>
  );
};
