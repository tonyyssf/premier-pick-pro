
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

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { status } = useAuth();

  console.log('ProtectedRoute - Auth status:', status);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-plpe-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    console.log('ProtectedRoute - Redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  console.log('ProtectedRoute - Rendering protected content');
  return <>{children}</>;
};

// Component to handle routing logic
const AppRoutes = () => {
  const { status } = useAuth();

  console.log('AppRoutes - Current status:', status, 'Current path:', window.location.pathname);

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

  return (
    <Routes>
      {/* Public routes - always accessible */}
      <Route path="/how-to-play" element={<HowToPlay />} />
      <Route path="/leaderboards" element={<Leaderboards />} />
      <Route path="/auth" element={<Auth />} />
      
      {/* Root route logic */}
      <Route 
        path="/" 
        element={
          status === 'authenticated' ? (
            <Index />
          ) : (
            <Navigate to="/how-to-play" replace />
          )
        } 
      />
      
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

// Main App wrapper with auth state visibility control
const AppContent = () => {
  const { status } = useAuth();
  
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PicksProvider>
        <TooltipProvider>
          <AppContent />
        </TooltipProvider>
      </PicksProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
