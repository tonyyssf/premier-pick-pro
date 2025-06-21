
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { inviteCodeSchema, sanitizeInput } from '@/utils/validation';
import { z } from 'zod';

interface JoinLeagueDialogProps {
  onLeagueJoined?: () => void;
}

export const JoinLeagueDialog: React.FC<JoinLeagueDialogProps> = ({ onLeagueJoined }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const { toast } = useToast();

  const validateInviteCode = (code: string) => {
    try {
      inviteCodeSchema.parse(code);
      setError('');
      return true;
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        setError(validationError.errors[0].message);
      }
      return false;
    }
  };

  const handleInputChange = (value: string) => {
    // Remove any non-alphanumeric characters and convert to uppercase
    const sanitized = value.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 6);
    setInviteCode(sanitized);
    if (error) {
      setError('');
    }
  };

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

    const trimmedCode = inviteCode.trim().toUpperCase();
    
    if (!validateInviteCode(trimmedCode)) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('Looking for league with invite code:', trimmedCode);
      
      // First, let's get ALL leagues to see what invite codes exist
      const { data: allLeagues, error: allLeaguesError } = await supabase
        .from('leagues')
        .select('id, name, max_members, invite_code');

      console.log('All leagues in database:', allLeagues);

      if (allLeaguesError) {
        console.error('Error fetching all leagues:', allLeaguesError);
      }

      // Now search for the specific league using multiple approaches
      let foundLeague = null;

      // Try exact match first
      const { data: exactMatch } = await supabase
        .from('leagues')
        .select('id, name, max_members, invite_code')
        .eq('invite_code', trimmedCode);

      if (exactMatch && exactMatch.length > 0) {
        foundLeague = exactMatch[0];
        console.log('Found league with exact match:', foundLeague);
      } else {
        // Try case-insensitive search
        const { data: caseInsensitiveMatch } = await supabase
          .from('leagues')
          .select('id, name, max_members, invite_code')
          .ilike('invite_code', trimmedCode);

        if (caseInsensitiveMatch && caseInsensitiveMatch.length > 0) {
          foundLeague = caseInsensitiveMatch[0];
          console.log('Found league with case-insensitive match:', foundLeague);
        } else {
          // Try searching with UPPER function on the database side
          const { data: upperMatch } = await supabase
            .from('leagues')
            .select('id, name, max_members, invite_code')
            .eq('invite_code', trimmedCode.toUpperCase());

          if (upperMatch && upperMatch.length > 0) {
            foundLeague = upperMatch[0];
            console.log('Found league with upper case match:', foundLeague);
          }
        }
      }

      if (!foundLeague) {
        console.log('No league found with code:', trimmedCode);
        console.log('Available invite codes:', allLeagues?.map(l => l.invite_code));
        toast({
          title: "League Not Found",
          description: `No league found with invite code "${trimmedCode}". Please check the code and try again.`,
          variant: "destructive",
        });
        return;
      }

      // Check if user is already a member
      const { data: existingMembership, error: membershipError } = await supabase
        .from('league_members')
        .select('id')
        .eq('league_id', foundLeague.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (membershipError) {
        console.error('Membership check error:', membershipError);
        toast({
          title: "Error Checking Membership",
          description: "There was an error checking your membership status.",
          variant: "destructive",
        });
        return;
      }

      if (existingMembership) {
        toast({
          title: "Already a Member",
          description: "You're already a member of this league.",
          variant: "destructive",
        });
        return;
      }

      // Check member count if there's a limit
      if (foundLeague.max_members) {
        const { count, error: countError } = await supabase
          .from('league_members')
          .select('*', { count: 'exact', head: true })
          .eq('league_id', foundLeague.id);

        if (countError) {
          console.error('Count error:', countError);
          toast({
            title: "Error Checking League Capacity",
            description: "There was an error checking the league capacity.",
            variant: "destructive",
          });
          return;
        }

        if (count && count >= foundLeague.max_members) {
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
          league_id: foundLeague.id,
          user_id: user.id
        });

      if (joinError) {
        console.error('Join error:', joinError);
        toast({
          title: "Error Joining League",
          description: joinError.message || "Failed to join the league. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Joined League!",
        description: `You've successfully joined "${foundLeague.name}".`,
      });

      setInviteCode('');
      setError('');
      setOpen(false);
      onLeagueJoined?.();
    } catch (error: any) {
      console.error('Join league error:', error);
      toast({
        title: "Error Joining League",
        description: error.message || "An unexpected error occurred.",
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
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter 6-character code"
              maxLength={6}
              required
              className={`font-mono ${error ? 'border-red-500' : ''}`}
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
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
