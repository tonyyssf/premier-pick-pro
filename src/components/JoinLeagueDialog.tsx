
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface JoinLeagueDialogProps {
  onLeagueJoined?: () => void;
}

export const JoinLeagueDialog: React.FC<JoinLeagueDialogProps> = ({ onLeagueJoined }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to join a league.",
        variant: "destructive",
      });
      return;
    }

    if (!inviteCode.trim()) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid invite code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // First, find the league by invite code
      const { data: league, error: leagueError } = await supabase
        .from('leagues')
        .select('id, name, max_members')
        .eq('invite_code', inviteCode.toUpperCase())
        .single();

      if (leagueError || !league) {
        toast({
          title: "League Not Found",
          description: "No league found with that invite code.",
          variant: "destructive",
        });
        return;
      }

      // Check if user is already a member
      const { data: existingMembership } = await supabase
        .from('league_members')
        .select('id')
        .eq('league_id', league.id)
        .eq('user_id', user.id)
        .single();

      if (existingMembership) {
        toast({
          title: "Already a Member",
          description: "You're already a member of this league.",
          variant: "destructive",
        });
        return;
      }

      // Check member count if there's a limit
      if (league.max_members) {
        const { count } = await supabase
          .from('league_members')
          .select('*', { count: 'exact', head: true })
          .eq('league_id', league.id);

        if (count && count >= league.max_members) {
          toast({
            title: "League Full",
            description: "This league has reached its maximum number of members.",
            variant: "destructive",
          });
          return;
        }
      }

      // Join the league
      const { error: joinError } = await supabase
        .from('league_members')
        .insert({
          league_id: league.id,
          user_id: user.id
        });

      if (joinError) throw joinError;

      toast({
        title: "Joined League!",
        description: `You've successfully joined "${league.name}".`,
      });

      setInviteCode('');
      setOpen(false);
      onLeagueJoined?.();
    } catch (error: any) {
      toast({
        title: "Error Joining League",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <UserPlus className="h-4 w-4" />
          <span>Join League</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join a League</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="inviteCode">Invite Code</Label>
            <Input
              id="inviteCode"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-character code"
              maxLength={6}
              required
              className="font-mono"
            />
            <p className="text-sm text-gray-600 mt-1">
              Ask your league creator for the invite code
            </p>
          </div>
          
          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Joining...' : 'Join League'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
