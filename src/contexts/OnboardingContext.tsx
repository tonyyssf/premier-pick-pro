import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OnboardingState {
  needsUsername: boolean;
  needsLeague: boolean;
  showOnboarding: boolean;
  loading: boolean;
}

interface OnboardingContextType {
  state: OnboardingState;
  completeUsernameStep: (username: string) => Promise<boolean>;
  completeLeagueStep: () => Promise<boolean>;
  dismissOnboarding: () => Promise<void>;
  refreshOnboardingState: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<OnboardingState>({
    needsUsername: false,
    needsLeague: false,
    showOnboarding: false,
    loading: true,
  });

  const checkOnboardingStatus = async () => {
    if (!user) {
      setState(prev => ({ ...prev, loading: false, showOnboarding: false }));
      return;
    }

    try {
      // Check user profile and onboarding status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username, onboarding_completed, onboarding_dismissed')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      // Check if user is in any leagues
      const { data: leagues, error: leagueError } = await supabase
        .from('league_members')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (leagueError) {
        console.error('Error checking leagues:', leagueError);
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      const needsUsername = !profile?.username || profile.username.trim() === '';
      const needsLeague = !leagues || leagues.length === 0;
      const hasBeenDismissed = profile?.onboarding_dismissed || false;
      const hasCompleted = profile?.onboarding_completed || false;
      
      const shouldShowOnboarding = (needsUsername || needsLeague) && !hasBeenDismissed && !hasCompleted;

      setState({
        needsUsername,
        needsLeague,
        showOnboarding: shouldShowOnboarding,
        loading: false,
      });
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const completeUsernameStep = async (username: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: username.trim() })
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update username. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Username Updated",
        description: "Your username has been set successfully!",
      });

      await refreshOnboardingState();
      return true;
    } catch (error) {
      console.error('Error updating username:', error);
      return false;
    }
  };

  const completeLeagueStep = async (): Promise<boolean> => {
    await refreshOnboardingState();
    return true;
  };

  const dismissOnboarding = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          onboarding_dismissed: true,
          onboarding_dismissed_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error dismissing onboarding:', error);
        return;
      }

      setState(prev => ({ ...prev, showOnboarding: false }));
    } catch (error) {
      console.error('Error dismissing onboarding:', error);
    }
  };

  const refreshOnboardingState = async () => {
    await checkOnboardingStatus();
  };

  useEffect(() => {
    checkOnboardingStatus();
  }, [user]);

  const contextValue: OnboardingContextType = {
    state,
    completeUsernameStep,
    completeLeagueStep,
    dismissOnboarding,
    refreshOnboardingState,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};