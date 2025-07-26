
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

const App = () => {
  return (
    <QueryProvider>
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
    </QueryProvider>
  );
};

export default App;
