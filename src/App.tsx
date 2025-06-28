
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PicksProvider } from "@/contexts/PicksContext";
import { SecurityHeaders } from "@/components/SecurityHeaders";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Leagues from "./pages/Leagues";
import Leaderboards from "./pages/Leaderboards";
import HowToPlay from "./pages/HowToPlay";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Global loading spinner component
const GlobalSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-plpe-purple mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { status } = useAuth();

  console.log('ProtectedRoute - Auth status:', status);

  if (status === 'loading') {
    return <GlobalSpinner />;
  }

  if (status === 'unauthenticated') {
    console.log('ProtectedRoute - Redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  console.log('ProtectedRoute - Rendering protected content');
  return <>{children}</>;
};

// Auth gate component that handles root authentication logic
const AuthGate = () => {
  const { status } = useAuth();
  
  console.log('AuthGate - Current status:', status);
  
  if (status === 'loading') return <GlobalSpinner />; // Should never hit if boot loader works
  if (status === 'authenticated') return <Outlet />; // Render children (Index for "/")
  return <Navigate to="/how-to-play" replace />; // Real redirect for guests
};

// Component to handle all routing logic
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes - completely independent of auth state */}
      <Route path="/how-to-play" element={<HowToPlay />} />
      <Route path="/leaderboards" element={<Leaderboards />} />
      <Route path="/auth" element={<Auth />} />
      
      {/* Root route with auth gate */}
      <Route path="/" element={<AuthGate />}>
        <Route index element={<Index />} />
      </Route>
      
      {/* Protected routes */}
      <Route 
        path="/leagues" 
        element={
          <ProtectedRoute>
            <Leagues />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } 
      />
      
      {/* Catch all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// App shell that waits for auth to be ready before mounting router
const AppShell = () => {
  const { status } = useAuth();
  
  console.log('AppShell - Auth status:', status);
  
  // Add CSS class to body to control visibility
  React.useEffect(() => {
    if (status === 'loading') {
      document.body.classList.add('auth-loading');
    } else {
      document.body.classList.remove('auth-loading');
    }
    
    return () => {
      document.body.classList.remove('auth-loading');
    };
  }, [status]);

  // Don't mount router until auth is resolved
  if (status === 'loading') {
    return <GlobalSpinner />;
  }

  return (
    <>
      <SecurityHeaders />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </>
  );
};

// Boot component that waits for Supabase to answer before mounting anything
const Boot = () => {
  const [booted, setBooted] = React.useState(false);
  const [initialSession, setInitialSession] = React.useState<Session | null>(null);

  React.useEffect(() => {
    console.log('Boot - Getting initial session...');
    // One synchronous round-trip to localStorage → no network latency
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Boot - Error getting session:', error);
      }
      console.log('Boot - Initial session result:', { 
        hasSession: !!data.session,
        userId: data.session?.user?.id || 'no user'
      });
      setInitialSession(data.session ?? null);
      setBooted(true);
    });
  }, []);

  // Absolutely nothing gets painted until Supabase answers
  if (!booted) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialSession={initialSession}>
        <PicksProvider>
          <TooltipProvider>
            <AppShell />
          </TooltipProvider>
        </PicksProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

const App = () => <Boot />;

export default App;
