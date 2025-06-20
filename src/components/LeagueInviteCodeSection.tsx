
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LeagueInviteCodeSectionProps {
  inviteCode: string;
}

export const LeagueInviteCodeSection: React.FC<LeagueInviteCodeSectionProps> = ({
  inviteCode
}) => {
  const { toast } = useToast();

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast({
      title: "Invite Code Copied",
      description: "The invite code has been copied to your clipboard.",
    });
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <Label className="text-sm font-medium">Invite Code</Label>
      <div className="flex items-center space-x-2 mt-2">
        <code className="bg-white px-3 py-2 rounded border font-mono text-sm flex-1">
          {inviteCode}
        </code>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={copyInviteCode}
          className="flex items-center space-x-1"
        >
          <Copy className="h-4 w-4" />
          <span>Copy</span>
        </Button>
      </div>
    </div>
  );
};
