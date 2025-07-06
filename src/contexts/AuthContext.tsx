import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { sessionManager } from '@/utils/sessionSecurity';
import { securityLogger } from '@/utils/securityLogger';
import { enhancedAuthLimiter, checkEnhancedRateLimit } from '@/utils/enhancedRateLimiter';
import { validateAndSanitizeInput, enhancedEmailSchema, enhancedPasswordSchema } from '@/utils/enhancedValidation';

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
          securityLogger.log({
            type: 'auth_failure',
            details: { activity: 'session_init_failed', error: error.message }
          });
        } else {
          console.log('Initial session check:', session?.user?.id || 'no session');
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Failed to get initial session:', error);
        securityLogger.log({
          type: 'auth_failure',
          details: { activity: 'session_init_error', error: String(error) }
        });
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
      // Enhanced input validation with better error messages
      let validatedEmail: string;
      let validatedPassword: string;
      
      try {
        validatedEmail = validateAndSanitizeInput(email, enhancedEmailSchema);
      } catch (validationError: any) {
        console.log('Email validation failed:', validationError.message);
        const error = new Error('Please enter a valid email address (e.g., user@example.com)');
        toast({
          title: "Invalid Email Format",
          description: "Please check your email address and try again. Make sure it includes @ and a domain (e.g., user@example.com)",
          variant: "destructive",
        });
        return { error };
      }
      
      try {
        validatedPassword = validateAndSanitizeInput(password, enhancedPasswordSchema);
      } catch (validationError: any) {
        console.log('Password validation failed:', validationError.message);
        const error = new Error(validationError.message);
        toast({
          title: "Password Requirements Not Met",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: validatedEmail,
        password: validatedPassword,
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
            email: validatedEmail
          }
        });
        
        // Provide user-friendly error messages
        let userMessage = error.message;
        if (error.message.includes('already registered')) {
          userMessage = 'An account with this email already exists. Try signing in instead.';
        } else if (error.message.includes('email')) {
          userMessage = 'Please check your email address and try again.';
        }
        
        toast({
          title: "Sign Up Failed",
          description: userMessage,
          variant: "destructive",
        });
      } else {
        securityLogger.log({
          type: 'suspicious_activity',
          details: { 
            activity: 'signup_successful',
            email: validatedEmail
          }
        });
        
        toast({
          title: "Check Your Email",
          description: "We've sent you a confirmation link to complete your signup.",
        });
      }

      return { error };
    } catch (validationError: any) {
      console.error('Unexpected signup error:', validationError);
      securityLogger.log({
        type: 'invalid_input',
        details: { 
          operation: 'signup_validation_failed',
          error: validationError.message,
          field: 'email_or_password'
        }
      });
      
      const error = new Error('Please check your email format and try again');
      toast({
        title: "Signup Error",
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
      // Simplified email validation for sign in - just check basic format
      let validatedEmail: string;
      
      try {
        validatedEmail = validateAndSanitizeInput(email, enhancedEmailSchema);
      } catch (validationError: any) {
        console.log('Email validation failed during signin:', validationError.message);
        const error = new Error('Please enter a valid email address');
        toast({
          title: "Invalid Email",
          description: "Please check your email address format",
          variant: "destructive",
        });
        return { error };
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email: validatedEmail,
        password: password, // Don't log password in validation
      });

      if (error) {
        securityLogger.log({
          type: 'auth_failure',
          details: { 
            activity: 'signin_failed',
            error: error.message,
            email: validatedEmail
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
            email: validatedEmail,
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
      console.error('Unexpected signin error:', validationError);
      securityLogger.log({
        type: 'invalid_input',
        details: { 
          operation: 'signin_validation_failed',
          error: validationError.message,
          field: 'email'
        }
      });
      
      const error = new Error('Please check your email format');
      toast({
        title: "Sign In Error",
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
