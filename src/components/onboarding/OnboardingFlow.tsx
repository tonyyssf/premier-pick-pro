import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { UsernamePrompt } from './UsernamePrompt';
import { LeaguePrompt } from './LeaguePrompt';

export const OnboardingFlow: React.FC = () => {
  const { state, completeUsernameStep, completeLeagueStep, dismissOnboarding } = useOnboarding();

  if (!state.showOnboarding || state.loading) {
    return null;
  }

  // Show username prompt first if needed
  if (state.needsUsername) {
    return (
      <div className="mb-6">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={dismissOnboarding}
            className="absolute -top-2 -right-2 z-10 h-8 w-8 rounded-full p-0 text-muted-foreground hover:text-foreground"
          >
            <XIcon className="h-4 w-4" />
          </Button>
          <UsernamePrompt
            onComplete={completeUsernameStep}
            onSkip={dismissOnboarding}
          />
        </div>
      </div>
    );
  }

  // Show league prompt if username is set but no leagues
  if (state.needsLeague) {
    return (
      <div className="mb-6">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={dismissOnboarding}
            className="absolute -top-2 -right-2 z-10 h-8 w-8 rounded-full p-0 text-muted-foreground hover:text-foreground"
          >
            <XIcon className="h-4 w-4" />
          </Button>
          <LeaguePrompt
            onComplete={completeLeagueStep}
            onSkip={dismissOnboarding}
          />
        </div>
      </div>
    );
  }

  return null;
};