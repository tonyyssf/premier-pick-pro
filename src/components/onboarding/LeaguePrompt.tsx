import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrophyIcon, UsersIcon, PlusIcon } from 'lucide-react';
import { CreateLeagueDialog } from '@/components/CreateLeagueDialog';
import { JoinLeagueDialog } from '@/components/JoinLeagueDialog';

interface LeaguePromptProps {
  onComplete: () => Promise<boolean>;
  onSkip?: () => void;
}

export const LeaguePrompt: React.FC<LeaguePromptProps> = ({ onComplete, onSkip }) => {
  const handleLeagueAction = async () => {
    await onComplete();
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <TrophyIcon className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl">Join the Competition!</CardTitle>
        <p className="text-sm text-muted-foreground">
          Create or join a league to compete with friends and see how you rank against others
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <CreateLeagueDialog onLeagueCreated={handleLeagueAction} />
          <JoinLeagueDialog onLeagueJoined={handleLeagueAction} />
        </div>

        <div className="border-t pt-4">
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Pro tip:</strong> Leagues make the game more fun! Compete with friends or join public leagues.
            </p>
            {onSkip && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onSkip}
                className="text-muted-foreground hover:text-foreground"
              >
                I'll do this later
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};