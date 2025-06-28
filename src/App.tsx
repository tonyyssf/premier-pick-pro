
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PicksProvider } from "@/contexts/PicksContext";
import { SecurityHeaders } from "@/components/SecurityHeaders";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Leagues from "./pages/Leagues";
import Leaderboards from "./pages/Leaderboards";
import HowToPlay from "./pages/HowToPlay";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to handle routing logic based on auth state
const AppRoutes = () => {
  const { user, isLoading } = useAuth();

  // Add debugging logs
  console.log('AppRoutes - Auth state:', { 
    user: user?.id || 'no user', 
    isLoading,
    currentPath: window.location.pathname 
  });

  // Show loading spinner while session is being restored
  if (isLoading) {
    console.log('AppRoutes - Showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-plpe-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('AppRoutes - Rendering routes, user authenticated:', !!user);

  return (
    <Routes>
      {/* Public routes - accessible to everyone */}
      <Route path="/how-to-play" element={<HowToPlay />} />
      <Route path="/leaderboards" element={<Leaderboards />} />
      <Route path="/auth" element={<Auth />} />
      
      {/* Root route - redirect unauthenticated users to /how-to-play */}
      <Route 
        path="/" 
        element={
          user ? (
            (() => {
              console.log('AppRoutes - Rendering Index for authenticated user');
              return <Index />;
            })()
          ) : (
            (() => {
              console.log('AppRoutes - Redirecting unauthenticated user to /how-to-play');
              return <Navigate to="/how-to-play" replace />;
            })()
          )
        } 
      />
      
      {/* Protected routes - require authentication */}
      <Route 
        path="/leagues" 
        element={user ? <Leagues /> : <Navigate to="/auth" replace />} 
      />
      <Route 
        path="/admin" 
        element={user ? <Admin /> : <Navigate to="/auth" replace />} 
      />
      
      {/* Catch all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PicksProvider>
        <TooltipProvider>
          <SecurityHeaders />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </PicksProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
