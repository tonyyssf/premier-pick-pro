
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserMetadata {
  username?: string;
  name?: string;
  phone_number?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, metadata?: UserMetadata) => Promise<{ error: any }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id || 'no user');
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          console.log('Initial session check:', session?.user?.id || 'no session');
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Failed to get initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      console.log('Cleaning up auth subscription...');
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, metadata?: UserMetadata) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata
      }
    });

    if (error) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Check Your Email",
        description: "We've sent you a confirmation link to complete your signup.",
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
    } else if (rememberMe) {
      localStorage.setItem('plpe_remember_me', 'true');
      toast({
        title: "Signed In Successfully",
        description: "You'll stay signed in for an extended period.",
      });
    } else {
      localStorage.removeItem('plpe_remember_me');
    }

    return { error };
  };

  const signOut = async () => {
    console.log('Attempting to sign out...');
    console.log('Current session exists:', !!session);
    console.log('Current user exists:', !!user);
    
    try {
      // Clear remember me preference
      localStorage.removeItem('plpe_remember_me');
      
      // Always attempt sign out, even if session seems missing
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        
        // If the error is about session missing, we might already be signed out
        if (error.message.includes('session') || error.message.includes('Auth session missing')) {
          console.log('Session already cleared, forcing local state reset...');
          // Clear local state anyway
          setSession(null);
          setUser(null);
          toast({
            title: "Signed Out",
            description: "You have been signed out.",
          });
        } else {
          toast({
            title: "Sign Out Failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        console.log('Sign out successful');
        toast({
          title: "Signed Out",
          description: "You have been signed out successfully.",
        });
      }
    } catch (error: any) {
      console.error('Unexpected sign out error:', error);
      // Force clear local state on any error
      setSession(null);
      setUser(null);
      toast({
        title: "Signed Out",
        description: "You have been signed out.",
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      signUp,
      signIn,
      signOut,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
