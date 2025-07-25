
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { PicksProvider } from "@/contexts/PicksContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { SecurityHeaders } from "@/components/SecurityHeaders";
import { SecurityMonitoringProvider } from "@/components/SecurityMonitoringProvider";
import { SecurityMiddleware } from "@/components/SecurityMiddleware";
import { AppContent } from "@/components/AppContent";

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
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OnboardingProvider>
          <SecurityMonitoringProvider>
            <SecurityMiddleware>
              <PicksProvider>
                <TooltipProvider>
                  <SecurityHeaders />
                  <Toaster />
                  <Sonner />
                  <AppContent />
                </TooltipProvider>
              </PicksProvider>
            </SecurityMiddleware>
          </SecurityMonitoringProvider>
        </OnboardingProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
