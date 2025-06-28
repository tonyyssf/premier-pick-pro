import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { sessionManager } from '@/utils/sessionSecurity';
import { securityLogger } from '@/utils/securityLogger';
import { enhancedAuthLimiter, checkEnhancedRateLimit } from '@/utils/enhancedRateLimiter';
import { z } from 'zod';

// Use standard validation schemas instead of overly strict enhanced ones
const emailSchema = z.string().email('Invalid email format');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

interface UserMetadata {
  username?: string;
  name?: string;
  phone_number?: string;
}

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  status: AuthStatus;
  signUp: (email: string, password: string, metadata?: UserMetadata) => Promise<{ error: any }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  // Keep isLoading for backward compatibility but deprecate it
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const { toast } = useToast();

  // Backward compatibility - derive isLoading from status
  const isLoading = status === 'loading';

  useEffect(() => {
    console.log('AuthProvider - Initializing auth state listener...');
    
    let isInitialized = false;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider - Auth state changed:', { 
          event, 
          userId: session?.user?.id || 'no user',
          timestamp: new Date().toISOString()
        });
        
        // Update all auth state together
        setSession(session);
        setUser(session?.user ?? null);
        const newStatus = session?.user ? 'authenticated' : 'unauthenticated';
        setStatus(newStatus);
        
        console.log('AuthProvider - Updated state:', { 
          user: session?.user?.id || 'no user', 
          status: newStatus,
          isInitialized
        });

        // Log specific auth events
        if (event === 'SIGNED_IN' && session?.user) {
          securityLogger.log({
            type: 'auth_failure',
            userId: session.user.id,
            details: { activity: 'successful_signin', event }
          });
        }
        
        if (event === 'SIGNED_OUT') {
          securityLogger.log({
            type: 'auth_failure',
            details: { activity: 'user_signout', event }
          });
          sessionManager.destroy();
        }
      }
    );

    // Get initial session after setting up the listener
    const initializeAuth = async () => {
      try {
        console.log('AuthProvider - Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthProvider - Error getting session:', error);
          securityLogger.log({
            type: 'auth_failure',
            details: { activity: 'session_init_failed', error: error.message }
          });
          setStatus('unauthenticated');
          setUser(null);
          setSession(null);
        } else {
          console.log('AuthProvider - Initial session result:', {
            hasSession: !!session,
            userId: session?.user?.id || 'no user',
            timestamp: new Date().toISOString()
          });
          
          // The onAuthStateChange will handle the state update
          // But if no session, we need to set unauthenticated immediately
          if (!session && !isInitialized) {
            console.log('AuthProvider - No initial session, setting unauthenticated');
            setStatus('unauthenticated');
            setUser(null);
            setSession(null);
          }
        }
        
        isInitialized = true;
      } catch (error) {
        console.error('AuthProvider - Failed to get initial session:', error);
        securityLogger.log({
          type: 'auth_failure',
          details: { activity: 'session_init_error', error: String(error) }
        });
        setStatus('unauthenticated');
        setUser(null);
        setSession(null);
        isInitialized = true;
      }
    };

    initializeAuth();

    // Fallback timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (!isInitialized) {
        console.log('AuthProvider - Timeout fallback, setting status to unauthenticated');
        setStatus('unauthenticated');
        setUser(null);
        setSession(null);
        isInitialized = true;
      }
    }, 3000);

    return () => {
      console.log('AuthProvider - Cleaning up auth subscription...');
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const signUp = async (email: string, password: string, metadata?: UserMetadata) => {
    // Rate limiting check
    const clientIp = 'client'; // In production, get actual IP
    const rateLimitResult = checkEnhancedRateLimit(enhancedAuthLimiter, clientIp);
    
    if (!rateLimitResult.allowed) {
      const error = new Error(
        rateLimitResult.isBlocked 
          ? `Account temporarily blocked. Try again in ${Math.ceil(rateLimitResult.timeUntilReset / 60000)} minutes.`
          : `Too many signup attempts. Try again in ${Math.ceil(rateLimitResult.timeUntilReset / 1000)} seconds.`
      );
      
      securityLogger.log({
        type: 'rate_limit_exceeded',
        details: { 
          operation: 'signup_attempt',
          isBlocked: rateLimitResult.isBlocked,
          timeUntilReset: rateLimitResult.timeUntilReset
        }
      });
      
      toast({
        title: "Too Many Attempts",
        description: error.message,
        variant: "destructive",
      });
      
      return { error };
    }

    try {
      // Use standard validation instead of overly strict enhanced validation
      const emailValidation = emailSchema.safeParse(email);
      const passwordValidation = passwordSchema.safeParse(password);
      
      if (!emailValidation.success) {
        throw new Error(emailValidation.error.errors[0].message);
      }
      
      if (!passwordValidation.success) {
        throw new Error(passwordValidation.error.errors[0].message);
      }
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: emailValidation.data,
        password: passwordValidation.data,
        options: {
          emailRedirectTo: redirectUrl,
          data: metadata
        }
      });

      if (error) {
        securityLogger.log({
          type: 'auth_failure',
          details: { 
            activity: 'signup_failed',
            error: error.message,
            email: emailValidation.data
          }
        });
        
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        securityLogger.log({
          type: 'suspicious_activity',
          details: { 
            activity: 'signup_successful',
            email: emailValidation.data
          }
        });
        
        toast({
          title: "Check Your Email",
          description: "We've sent you a confirmation link to complete your signup.",
        });
      }

      return { error };
    } catch (validationError: any) {
      securityLogger.log({
        type: 'invalid_input',
        details: { 
          operation: 'signup_validation_failed',
          error: validationError.message,
          field: 'email_or_password'
        }
      });
      
      const error = new Error(validationError.message);
      toast({
        title: "Validation Error",
        description: error.message,
        variant: "destructive",
      });
      
      return { error };
    }
  };

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    // Rate limiting check
    const clientIp = 'client'; // In production, get actual IP
    const rateLimitResult = checkEnhancedRateLimit(enhancedAuthLimiter, clientIp);
    
    if (!rateLimitResult.allowed) {
      const error = new Error(
        rateLimitResult.isBlocked 
          ? `Account temporarily blocked. Try again in ${Math.ceil(rateLimitResult.timeUntilReset / 60000)} minutes.`
          : `Too many login attempts. Try again in ${Math.ceil(rateLimitResult.timeUntilReset / 1000)} seconds.`
      );
      
      securityLogger.log({
        type: 'rate_limit_exceeded',
        details: { 
          operation: 'signin_attempt',
          isBlocked: rateLimitResult.isBlocked,
          timeUntilReset: rateLimitResult.timeUntilReset
        }
      });
      
      toast({
        title: "Too Many Attempts",
        description: error.message,
        variant: "destructive",
      });
      
      return { error };
    }

    try {
      // Use standard validation for email
      const emailValidation = emailSchema.safeParse(email);
      
      if (!emailValidation.success) {
        throw new Error(emailValidation.error.errors[0].message);
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email: emailValidation.data,
        password: password, // Don't log password in validation
      });

      if (error) {
        securityLogger.log({
          type: 'auth_failure',
          details: { 
            activity: 'signin_failed',
            error: error.message,
            email: emailValidation.data
          }
        });
        
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        securityLogger.log({
          type: 'suspicious_activity',
          details: { 
            activity: 'signin_successful',
            email: emailValidation.data,
            rememberMe
          }
        });
        
        if (rememberMe) {
          localStorage.setItem('plpe_remember_me', 'true');
          toast({
            title: "Signed In Successfully",
            description: "You'll stay signed in for an extended period.",
          });
        } else {
          localStorage.removeItem('plpe_remember_me');
        }
      }

      return { error };
    } catch (validationError: any) {
      securityLogger.log({
        type: 'invalid_input',
        details: { 
          operation: 'signin_validation_failed',
          error: validationError.message,
          field: 'email'
        }
      });
      
      const error = new Error(validationError.message);
      toast({
        title: "Validation Error",
        description: error.message,
        variant: "destructive",
      });
      
      return { error };
    }
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
          setStatus('unauthenticated');
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
      setStatus('unauthenticated');
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
      status,
      signUp,
      signIn,
      signOut,
      isLoading, // Keep for backward compatibility
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
