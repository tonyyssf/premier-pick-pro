
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/components/QueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { PicksProvider } from "@/contexts/PicksContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { SecurityHeaders } from "@/components/SecurityHeaders";
import { SecurityMonitoringProvider } from "@/components/SecurityMonitoringProvider";
import { SecurityMiddleware } from "@/components/SecurityMiddleware";
import { AppContent } from "@/components/AppContent";
import { DebugErrorBoundary } from "@/components/DebugErrorBoundary";

console.log("App component is loading...");

const App = () => {
  console.log("App component render started");
  
  return (
    <DebugErrorBoundary>
      <QueryProvider>
        <DebugErrorBoundary>
          <AuthProvider>
            <DebugErrorBoundary>
              <OnboardingProvider>
                <DebugErrorBoundary>
                  <SecurityMonitoringProvider>
                    <DebugErrorBoundary>
                      <SecurityMiddleware>
                        <DebugErrorBoundary>
                          <PicksProvider>
                            <DebugErrorBoundary>
                              <TooltipProvider>
                                <SecurityHeaders />
                                <Toaster />
                                <Sonner />
                                <DebugErrorBoundary>
                                  <AppContent />
                                </DebugErrorBoundary>
                              </TooltipProvider>
                            </DebugErrorBoundary>
                          </PicksProvider>
                        </DebugErrorBoundary>
                      </SecurityMiddleware>
                    </DebugErrorBoundary>
                  </SecurityMonitoringProvider>
                </DebugErrorBoundary>
              </OnboardingProvider>
            </DebugErrorBoundary>
          </AuthProvider>
        </DebugErrorBoundary>
      </QueryProvider>
    </DebugErrorBoundary>
  );
};

export default App;
