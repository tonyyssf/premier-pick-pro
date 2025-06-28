
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PicksProvider>
        <TooltipProvider>
          <SecurityHeaders />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/leagues" element={<Leagues />} />
              <Route path="/leaderboards" element={<Leaderboards />} />
              <Route path="/how-to-play" element={<HowToPlay />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </PicksProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
