
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PicksProvider } from "@/contexts/PicksContext";
import { SecurityHeaders } from "@/components/SecurityHeaders";
import { SecurityMonitoringProvider } from "@/components/SecurityMonitoringProvider";
import { SecurityMiddleware } from "@/components/SecurityMiddleware";
import { PerformanceDashboard } from "@/components/PerformanceDashboard";
import { Suspense, lazy, useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const OptimizedLeaderboards = lazy(() => import("./pages/OptimizedLeaderboards"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Configure React Query with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});

const App = () => {
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SecurityMonitoringProvider>
          <SecurityMiddleware>
            <PicksProvider>
              <TooltipProvider>
                <SecurityHeaders />
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Suspense fallback={<LoadingSpinner message="Loading application..." />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/leagues" element={<Navigate to="/leaderboards" replace />} />
                      <Route path="/leaderboards" element={<OptimizedLeaderboards />} />
                      <Route path="/admin" element={<Admin />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                  <PerformanceDashboard 
                    isVisible={showPerformanceDashboard}
                    onToggle={() => setShowPerformanceDashboard(!showPerformanceDashboard)}
                  />
                </BrowserRouter>
              </TooltipProvider>
            </PicksProvider>
          </SecurityMiddleware>
        </SecurityMonitoringProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
