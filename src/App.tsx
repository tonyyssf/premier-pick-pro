
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
  const { user, status } = useAuth();

  // Add debugging logs
  console.log('AppRoutes - Auth state:', { 
    user: user?.id || 'no user', 
    status,
    currentPath: window.location.pathname 
  });

  // Show loading spinner while session is being restored
  if (status === 'loading') {
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

  console.log('AppRoutes - Rendering routes, status:', status);

  return (
    <Routes>
      {/* Public routes - accessible to everyone */}
      <Route path="/how-to-play" element={<HowToPlay />} />
      <Route path="/leaderboards" element={<Leaderboards />} />
      <Route path="/auth" element={<Auth />} />
      
      {/* Root route - use true redirects instead of render switches */}
      <Route 
        path="/" 
        element={
          status === 'authenticated' ? (
            (() => {
              console.log('AppRoutes - Rendering Index for authenticated user');
              return <Index />;
            })()
          ) : status === 'unauthenticated' ? (
            (() => {
              console.log('AppRoutes - Redirecting unauthenticated user to /how-to-play');
              return <Navigate to="/how-to-play" replace />;
            })()
          ) : (
            // This should never happen since we handle loading above, but just in case
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-plpe-purple mx-auto"></div>
            </div>
          )
        } 
      />
      
      {/* Protected routes - require authentication */}
      <Route 
        path="/leagues" 
        element={
          status === 'authenticated' ? (
            <Leagues />
          ) : status === 'unauthenticated' ? (
            <Navigate to="/auth" replace />
          ) : (
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-plpe-purple mx-auto"></div>
            </div>
          )
        } 
      />
      <Route 
        path="/admin" 
        element={
          status === 'authenticated' ? (
            <Admin />
          ) : status === 'unauthenticated' ? (
            <Navigate to="/auth" replace />
          ) : (
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-plpe-purple mx-auto"></div>
            </div>
          )
        } 
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
