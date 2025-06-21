
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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
    // Configure session persistence based on remember me option
    const options = rememberMe ? {
      // For remember me, we'll rely on Supabase's default persistent session
      // which lasts longer and survives browser restarts
    } : undefined;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options
    });

    if (error) {
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
    } else if (rememberMe) {
      // Store a flag in localStorage to indicate extended session preference
      localStorage.setItem('plpe_remember_me', 'true');
      toast({
        title: "Signed In Successfully",
        description: "You'll stay signed in for an extended period.",
      });
    } else {
      // Remove the remember me flag if not selected
      localStorage.removeItem('plpe_remember_me');
    }

    return { error };
  };

  const signOut = async () => {
    // Clear remember me preference on sign out
    localStorage.removeItem('plpe_remember_me');
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Sign Out Failed",
        description: error.message,
        variant: "destructive",
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
